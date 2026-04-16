import http from "node:http";
import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { URL, fileURLToPath } from "node:url";
import XLSX from "xlsx";
import createWorkbookCacheDatabase from "./cache-db.mjs";

const execFileAsync = promisify(execFile);
const currentFilePath =
  typeof __filename !== "undefined" ? __filename : fileURLToPath(import.meta.url);
const currentDirPath =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(currentFilePath);
const projectRoot = path.join(currentDirPath, "..");
const distRoot = path.join(projectRoot, "dist");
const configRoot = path.join(projectRoot, "config");
const runtimeMetricsPath = path.join(configRoot, "runtime-metrics.log");
const workbookCacheDb = createWorkbookCacheDatabase(configRoot);
const host = "127.0.0.1";
const port = Number.parseInt(process.env.EAASE_PORT ?? "4173", 10);
const shutdownDelayMs = 5000;
const heartbeatTtlMs = 10000;
const runtimeMetricsIntervalMs = 30000;
const isDev = process.argv.includes("--dev");
const isValidateOnly = process.argv.includes("--validate-only");
const activeClients = new Map();
let shutdownTimer = null;
let runtimeMetricsTimer = null;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const normalizeCell = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const createCellRecord = (value = "", rowNumber = 1, columnIndex = 0) => ({
  value,
  isMerged: false,
  colSpan: 1,
  rowSpan: 1,
  hidden: false,
  rootRow: rowNumber,
  rootCol: columnIndex,
});

const getSheetBounds = (worksheet) => {
  let maxRowIndex = 0;
  let maxColumnIndex = 0;

  Object.keys(worksheet).forEach((key) => {
    if (key.startsWith("!")) {
      return;
    }

    const cellAddress = XLSX.utils.decode_cell(key);
    maxRowIndex = Math.max(maxRowIndex, cellAddress.r);
    maxColumnIndex = Math.max(maxColumnIndex, cellAddress.c);
  });

  (worksheet["!merges"] ?? []).forEach((merge) => {
    maxRowIndex = Math.max(maxRowIndex, merge.e.r);
    maxColumnIndex = Math.max(maxColumnIndex, merge.e.c);
  });

  return {
    maxRowIndex,
    maxColumnIndex,
  };
};

const buildMatrix = (worksheet) => {
  const bounds = getSheetBounds(worksheet);
  if (bounds.maxColumnIndex === 0 && bounds.maxRowIndex === 0 && !worksheet.A1) {
    return [];
  }

  const rowCount = bounds.maxRowIndex + 1;
  const columnCount = bounds.maxColumnIndex + 1;
  const matrix = Array.from({ length: rowCount }, (_, rowIndex) =>
    Array.from({ length: columnCount }, (_, columnIndex) => createCellRecord("", rowIndex + 1, columnIndex)),
  );

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
      const cell = worksheet[address];
      matrix[rowIndex][columnIndex] = createCellRecord(
        cell ? normalizeCell(XLSX.utils.format_cell(cell)) : "",
        rowIndex + 1,
        columnIndex,
      );
    }
  }

  for (const merge of worksheet["!merges"] ?? []) {
    const source = matrix[merge.s.r]?.[merge.s.c];
    const mergedValue = source?.value ?? "";
    const colSpan = merge.e.c - merge.s.c + 1;
    const rowSpan = merge.e.r - merge.s.r + 1;

    for (let rowIndex = merge.s.r; rowIndex <= merge.e.r; rowIndex += 1) {
      for (let columnIndex = merge.s.c; columnIndex <= merge.e.c; columnIndex += 1) {
        const isRoot = rowIndex === merge.s.r && columnIndex === merge.s.c;
        matrix[rowIndex][columnIndex] = {
          value: mergedValue,
          isMerged: true,
          colSpan: isRoot ? colSpan : 1,
          rowSpan: isRoot ? rowSpan : 1,
          hidden: !isRoot,
          rootRow: merge.s.r + 1,
          rootCol: merge.s.c,
        };
      }
    }
  }

  let effectiveColumnCount = columnCount;

  while (effectiveColumnCount > 0) {
    const hasMeaningfulValue = matrix.some((row) => {
      const cell = row[effectiveColumnCount - 1];
      return cell && cell.value !== "";
    });

    if (hasMeaningfulValue) {
      break;
    }

    effectiveColumnCount -= 1;
  }

  return matrix.map((row) => row.slice(0, effectiveColumnCount));
};

const sheetToRecords = (fileName, sheetName, matrix) => {
  const columnCount = matrix.reduce((max, row) => Math.max(max, row.length), 0);
  const rows = matrix.map((row, index) => {
    const cells = Array.from(
      { length: columnCount },
      (_, cellIndex) => row[cellIndex] ?? createCellRecord("", index + 1, cellIndex),
    );

    return {
      rowNumber: index + 1,
      cells,
      joined: cells.map((cell) => cell.value).join(" | "),
    };
  });

  return {
    id: `${fileName}::${sheetName}`,
    sheetName,
    defaultHeaderDepth: 1,
    columnCount,
    rows,
  };
};

const buildFingerprintFromStat = (filePath, stat) =>
  `${path.basename(filePath)}__${stat.size}__${Math.trunc(stat.mtimeMs)}`;

const parseWorkbookFromPath = async (absolutePath, persisted = {}) => {
  const resolvedPath = path.resolve(absolutePath);
  const stat = await fs.stat(resolvedPath);
  const buffer = await fs.readFile(resolvedPath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const fileName = path.basename(resolvedPath);
  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const matrix = buildMatrix(worksheet);
    return sheetToRecords(fileName, sheetName, matrix);
  });

  const uniqueValueSet = new Set();
  for (const sheet of sheets) {
    for (const row of sheet.rows) {
      for (const cell of row.cells) {
        if (cell.value) {
          uniqueValueSet.add(cell.value);
        }
      }
    }
  }

  return {
    fingerprint: buildFingerprintFromStat(resolvedPath, stat),
    fileName,
    fileSize: stat.size,
    lastModified: Math.trunc(stat.mtimeMs),
    importedAt: persisted.importedAt ?? Date.now(),
    absolutePath: resolvedPath,
    headerDepth: persisted.headerDepth ?? 1,
    isFavorite: persisted.isFavorite ?? false,
    missing: false,
    sheets,
    uniqueValues: Array.from(uniqueValueSet),
  };
};

const sanitizeConfigFileName = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\.json$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "_");

  return normalized || "default";
};

const ensureConfigDir = async () => {
  await fs.mkdir(configRoot, { recursive: true });
};

const createMemorySnapshot = () => {
  const memory = process.memoryUsage();
  const toMb = (value) => Number((value / 1024 / 1024).toFixed(2));

  return {
    rssMb: toMb(memory.rss),
    heapTotalMb: toMb(memory.heapTotal),
    heapUsedMb: toMb(memory.heapUsed),
    externalMb: toMb(memory.external),
    arrayBuffersMb: toMb(memory.arrayBuffers),
    uptimeSec: Number(process.uptime().toFixed(1)),
  };
};

const appendRuntimeMetric = async (type, payload = {}) => {
  try {
    await ensureConfigDir();
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      pid: process.pid,
      platform: process.platform,
      ...payload,
    };
    await fs.appendFile(runtimeMetricsPath, `${JSON.stringify(entry)}\n`, "utf8");
  } catch (error) {
    process.stderr.write(`Failed to write runtime metric: ${error instanceof Error ? error.message : String(error)}\n`);
  }
};

const toConfigPath = (fileName) => path.join(configRoot, `${sanitizeConfigFileName(fileName)}.json`);

const mapConfigWorkbook = (item) => ({
  fingerprint: item.fingerprint,
  absolutePath: item.absolutePath,
  headerDepth: item.headerDepth ?? 1,
  isFavorite: item.isFavorite ?? false,
  importedAt: item.importedAt ?? Date.now(),
});

const hasPersistableWorkbookSnapshot = (item) =>
  Array.isArray(item?.sheets) &&
  item.sheets.length > 0 &&
  Array.isArray(item?.uniqueValues);

const mapPersistedWorkbook = (item) => {
  if (hasPersistableWorkbookSnapshot(item)) {
    workbookCacheDb.saveWorkbookSnapshot({
      fingerprint: item.fingerprint,
      fileName: item.fileName,
      fileSize: Number(item.fileSize ?? 0),
      lastModified: Number(item.lastModified ?? 0),
      importedAt: item.importedAt ?? Date.now(),
      absolutePath: item.absolutePath,
      headerDepth: item.headerDepth ?? 1,
      isFavorite: item.isFavorite ?? false,
      missing: Boolean(item.missing),
      sheets: item.sheets,
      uniqueValues: item.uniqueValues,
      ...(item.error ? { error: String(item.error) } : {}),
    });

    return mapConfigWorkbook(item);
  }

  return mapConfigWorkbook(item);
};

const buildConfigPayload = (body) => {
  const configName = String(body.configName ?? "").trim() || "Untitled";
  const fileName = sanitizeConfigFileName(body.fileName ?? configName);

  return {
    cacheVersion: 2,
    fileName,
    configName,
    lastUpdated: new Date().toISOString(),
    workbooks: Array.isArray(body.workbooks) ? body.workbooks.map(mapPersistedWorkbook) : [],
    preferences:
      typeof body.preferences === "object" && body.preferences !== null
        ? body.preferences
        : { layout: "standard", theme: "light" },
  };
};

const readJsonBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const writeJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
};

const writeError = (response, statusCode, message) => {
  writeJson(response, statusCode, { error: message });
};

const pathExists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const pruneCacheToConfigWorkbooks = (workbooks) => {
  const items = Array.isArray(workbooks) ? workbooks : [];
  const expectedFingerprints = new Set();
  const expectedPaths = new Set();

  for (const item of items) {
    const fingerprint = String(item?.fingerprint ?? "").trim();
    if (fingerprint) {
      expectedFingerprints.add(fingerprint);
    }

    const absolutePath = String(item?.absolutePath ?? "").trim();
    if (absolutePath) {
      expectedPaths.add(path.resolve(absolutePath));
    }
  }

  const staleFingerprints = workbookCacheDb
    .listWorkbookRecords()
    .filter(
      (record) =>
        !expectedFingerprints.has(record.fingerprint) &&
        !expectedPaths.has(path.resolve(String(record.absolutePath ?? ""))),
    )
    .map((record) => record.fingerprint);

  if (staleFingerprints.length === 0) {
    return {
      removedCount: 0,
      remainingCount: workbookCacheDb.getStats().workbookCount,
      compacted: false,
    };
  }

  const result = workbookCacheDb.deleteWorkbooks(staleFingerprints);
  workbookCacheDb.compact();
  return {
    ...result,
    compacted: true,
  };
};

const normalizeConfigWorkbooks = async (workbooks) => {
  const items = Array.isArray(workbooks) ? workbooks : [];
  const normalized = await Promise.all(
    items.map(async (item) => {
      if (hasPersistableWorkbookSnapshot(item)) {
        return workbookCacheDb.rehydrateConfigWorkbooks([item])[0];
      }

      const absolutePath = path.resolve(String(item?.absolutePath ?? ""));
      const exists = await pathExists(absolutePath);
      if (!exists) {
        workbookCacheDb.deleteWorkbooks([item?.fingerprint ?? absolutePath]);
        const summary = workbookCacheDb.getWorkbookSummary(item?.fingerprint ?? absolutePath, {
          ...item,
          absolutePath,
        });

        return {
          ...(summary ?? {
            fingerprint: item?.fingerprint ?? absolutePath,
            fileName: path.basename(absolutePath),
            fileSize: 0,
            lastModified: 0,
            importedAt: item?.importedAt ?? Date.now(),
            absolutePath,
            headerDepth: item?.headerDepth ?? 1,
            isFavorite: item?.isFavorite ?? false,
          }),
          missing: true,
          sheets: [],
          uniqueValues: [],
          error: "Source workbook is missing",
        };
      }

      return workbookCacheDb.getWorkbookSummary(item?.fingerprint ?? absolutePath, {
        ...item,
        absolutePath,
      });
    }),
  );

  return normalized.filter(Boolean);
};

const cancelShutdown = () => {
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
    shutdownTimer = null;
  }
};

const pruneClients = () => {
  const now = Date.now();

  for (const [clientId, lastSeenAt] of activeClients.entries()) {
    if (now - lastSeenAt > heartbeatTtlMs) {
      activeClients.delete(clientId);
    }
  }
};

const touchClient = (clientId) => {
  if (!clientId) {
    return;
  }

  activeClients.set(clientId, Date.now());
  cancelShutdown();
};

const scheduleShutdown = () => {
  if (isDev) {
    return;
  }

  cancelShutdown();
  shutdownTimer = setTimeout(() => {
    pruneClients();

    if (activeClients.size > 0) {
      return;
    }

    server.close(() => {
      process.exit(0);
    });

    setTimeout(() => process.exit(0), 500).unref();
  }, shutdownDelayMs);

  shutdownTimer.unref?.();
};

const runFilePicker = async () => {
  if (process.platform === "win32") {
    const script = [
      "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)",
      "$OutputEncoding = [Console]::OutputEncoding",
      "Add-Type -AssemblyName System.Windows.Forms",
      "$dialog = New-Object System.Windows.Forms.OpenFileDialog",
      '$dialog.Filter = "Excel Files (*.xls;*.xlsx;*.xlsm;*.csv)|*.xls;*.xlsx;*.xlsm;*.csv|All Files (*.*)|*.*"',
      "$dialog.Multiselect = $true",
      '$dialog.Title = "Select Excel files"',
      "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
      "  $dialog.FileNames | ConvertTo-Json -Compress",
      "} else {",
      "  '[]'",
      "}",
    ].join(";");

    const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-STA", "-Command", script], {
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 4,
    });

    const parsed = JSON.parse(stdout.trim() || "[]");
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  if (process.platform === "darwin") {
    const { stdout } = await execFileAsync("osascript", [
      "-e",
      'set chosenFiles to choose file with prompt "Select Excel files" of type {"org.openxmlformats.spreadsheetml.sheet","com.microsoft.excel.xls","public.comma-separated-values-text"} with multiple selections allowed',
      "-e",
      'set outputText to ""',
      "-e",
      "repeat with selectedFile in chosenFiles",
      "-e",
      'set outputText to outputText & POSIX path of selectedFile & linefeed',
      "-e",
      "end repeat",
      "-e",
      "return outputText",
    ]);

    return stdout
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const zenityArgs = [
    "--file-selection",
    "--multiple",
    "--separator=\n",
    "--title=Select Excel files",
    "--file-filter=Excel files | *.xls *.xlsx *.xlsm *.csv",
    "--file-filter=All files | *",
  ];

  try {
    const { stdout } = await execFileAsync("zenity", zenityArgs);
    return stdout
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    const { stdout } = await execFileAsync("kdialog", ["--getopenfilename", os.homedir(), "*.xls *.xlsx *.xlsm *.csv"]);
    return stdout
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const openExplorer = async (absolutePath) => {
  const resolvedPath = path.resolve(String(absolutePath ?? ""));
  const resolvedFolder = path.dirname(resolvedPath);

  if (process.platform === "win32") {
    if (fssync.existsSync(resolvedPath)) {
      const selectScript = [
        '$target = $env:EAASE_TARGET_PATH',
        'Start-Process -FilePath "explorer.exe" -ArgumentList (\'/select,"\' + $target + \'"\')',
      ].join("; ");
      await execFileAsync("powershell.exe", ["-NoProfile", "-Command", selectScript], {
        windowsHide: true,
        env: {
          ...process.env,
          EAASE_TARGET_PATH: resolvedPath,
        },
      });
      return;
    }

    if (fssync.existsSync(resolvedFolder)) {
      const folderScript = [
        '$target = $env:EAASE_TARGET_FOLDER',
        'Start-Process -FilePath "explorer.exe" -ArgumentList (\'"\' + $target + \'"\')',
      ].join("; ");
      await execFileAsync("powershell.exe", ["-NoProfile", "-Command", folderScript], {
        windowsHide: true,
        env: {
          ...process.env,
          EAASE_TARGET_FOLDER: resolvedFolder,
        },
      });
      return;
    }

    throw new Error(`Path not found: ${resolvedPath}`);
    return;
  }

  if (process.platform === "darwin") {
    await execFileAsync("open", ["-R", resolvedPath]);
    return;
  }

  await execFileAsync("xdg-open", [path.dirname(resolvedPath)]);
};

const collectWorkbookPaths = async (rootFolder) => {
  const allowedExtensions = new Set([".xls", ".xlsx", ".xlsm", ".csv"]);
  const results = [];

  const visit = async (currentFolder) => {
    const entries = await fs.readdir(currentFolder, { withFileTypes: true });

    for (const entry of entries) {
      const absoluteEntryPath = path.join(currentFolder, entry.name);

      if (entry.isDirectory()) {
        await visit(absoluteEntryPath);
        continue;
      }

      if (allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
        results.push(absoluteEntryPath);
      }
    }
  };

  await visit(rootFolder);
  return results;
};

const runFolderPicker = async () => {
  if (process.platform === "win32") {
    const script = [
      "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)",
      "$OutputEncoding = [Console]::OutputEncoding",
      "Add-Type -AssemblyName System.Windows.Forms",
      "$dialog = New-Object System.Windows.Forms.FolderBrowserDialog",
      '$dialog.Description = "Select a folder that contains Excel files"',
      "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
      "  $dialog.SelectedPath",
      "} else {",
      "  ''",
      "}",
    ].join(";");

    const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-STA", "-Command", script], {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });

    return stdout.trim();
  }

  if (process.platform === "darwin") {
    const { stdout } = await execFileAsync("osascript", [
      "-e",
      'set chosenFolder to choose folder with prompt "Select a folder that contains Excel files"',
      "-e",
      "return POSIX path of chosenFolder",
    ]);

    return stdout.trim();
  }

  try {
    const { stdout } = await execFileAsync("zenity", ["--file-selection", "--directory", "--title=Select folder"]);
    return stdout.trim();
  } catch {
    const { stdout } = await execFileAsync("kdialog", ["--getexistingdirectory", os.homedir()]);
    return stdout.trim();
  }
};

const runConfigImportPicker = async () => {
  if (process.platform === "win32") {
    const script = [
      "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)",
      "$OutputEncoding = [Console]::OutputEncoding",
      "Add-Type -AssemblyName System.Windows.Forms",
      "$dialog = New-Object System.Windows.Forms.OpenFileDialog",
      '$dialog.Filter = "EaaSE Config (*.eaase.json;*.json)|*.eaase.json;*.json|All Files (*.*)|*.*"',
      '$dialog.Title = "Import configuration"',
      "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
      "  $dialog.FileName",
      "} else {",
      "  ''",
      "}",
    ].join(";");

    const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-STA", "-Command", script], {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });

    return stdout.trim();
  }

  return "";
};

const runConfigExportPicker = async (suggestedName) => {
  if (process.platform === "win32") {
    const safeName = `${sanitizeConfigFileName(suggestedName || "ProjectArchive")}.eaase.json`;
    const script = [
      "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)",
      "$OutputEncoding = [Console]::OutputEncoding",
      "Add-Type -AssemblyName System.Windows.Forms",
      "$dialog = New-Object System.Windows.Forms.SaveFileDialog",
      '$dialog.Filter = "EaaSE Config (*.eaase.json)|*.eaase.json|JSON Files (*.json)|*.json"',
      '$dialog.Title = "Export configuration"',
      "$dialog.OverwritePrompt = $true",
      `$dialog.FileName = "${safeName.replace(/"/g, '""')}"`,
      "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
      "  $dialog.FileName",
      "} else {",
      "  ''",
      "}",
    ].join(";");

    const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-STA", "-Command", script], {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });

    return stdout.trim();
  }

  return "";
};

const handleApiRequest = async (request, response, requestUrl) => {
  const startedAt = performance.now();
  const finishApiMetric = async (event, payload = {}) => {
    await appendRuntimeMetric("api_request", {
      event,
      method: request.method,
      pathname: requestUrl.pathname,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      memory: createMemorySnapshot(),
      ...payload,
    });
  };

  if (request.method === "POST" && requestUrl.pathname === "/api/fs/pick-files") {
    const paths = await runFilePicker();
    writeJson(response, 200, { paths });
    await finishApiMetric("pick_files", { fileCount: paths.length });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/fs/open-explorer") {
    const body = await readJsonBody(request);
    if (!body.absolutePath) {
      writeError(response, 400, "absolutePath is required");
      return true;
    }

    await openExplorer(body.absolutePath);
    writeJson(response, 200, { ok: true });
    await finishApiMetric("open_explorer", { targetPath: path.resolve(String(body.absolutePath ?? "")) });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/fs/pick-folder") {
    const selectedFolder = await runFolderPicker();
    const paths = selectedFolder ? await collectWorkbookPaths(selectedFolder) : [];
    writeJson(response, 200, { paths });
    await finishApiMetric("pick_folder", { folderPath: selectedFolder, fileCount: paths.length });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/workbooks/load") {
    const body = await readJsonBody(request);
    const items = Array.isArray(body.items) ? body.items : [];
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          const workbook = await parseWorkbookFromPath(item.absolutePath, item);
          workbookCacheDb.saveWorkbookSnapshot(workbook);
          return workbookCacheDb.rehydrateConfigWorkbooks([workbook])[0];
        } catch (error) {
          const resolvedPath = path.resolve(String(item.absolutePath ?? ""));
          return {
            fingerprint: item.fingerprint ?? resolvedPath,
            fileName: path.basename(resolvedPath),
            fileSize: 0,
            lastModified: 0,
            importedAt: item.importedAt ?? Date.now(),
            absolutePath: resolvedPath,
            headerDepth: item.headerDepth ?? 1,
            isFavorite: item.isFavorite ?? false,
            missing: true,
            sheets: [],
            uniqueValues: [],
            error: error instanceof Error ? error.message : "Failed to load workbook",
          };
        }
      }),
    );

    writeJson(response, 200, { workbooks: results });
    await finishApiMetric("load_workbooks", {
      requestedCount: items.length,
      loadedCount: results.filter((item) => !item.missing).length,
      missingCount: results.filter((item) => item.missing).length,
    });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/workbooks/delete") {
    const body = await readJsonBody(request);
    const fingerprints = Array.isArray(body.fingerprints) ? body.fingerprints : [];
    const result = workbookCacheDb.deleteWorkbooks(fingerprints);
    const compacted = result.removedCount > 0;
    if (compacted) {
      workbookCacheDb.compact();
    }
    workbookCacheDb.checkpoint();
    writeJson(response, 200, { ...result, compacted });
    await finishApiMetric("delete_workbooks", {
      requestedCount: fingerprints.length,
      removedCount: result.removedCount,
      remainingCount: result.remainingCount,
      compacted,
    });
    return true;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/debug/cache-db") {
    const stats = workbookCacheDb.getStats();
    writeJson(response, 200, {
      cacheDbPath: workbookCacheDb.cacheDbPath,
      ...stats,
    });
    await finishApiMetric("debug_cache_db", stats);
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/search/query") {
    const body = await readJsonBody(request);
    const query = String(body.query ?? "");
    const fingerprints = Array.isArray(body.fingerprints) ? body.fingerprints : [];
    const hits = workbookCacheDb.searchWorkbooks(query, fingerprints);
    writeJson(response, 200, { hits });
    await finishApiMetric("search_query", {
      queryLength: query.length,
      fingerprintCount: fingerprints.length,
      hitSheetCount: hits.length,
      totalMatches: hits.reduce((count, hit) => count + hit.rows.length, 0),
    });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/search/candidates") {
    const body = await readJsonBody(request);
    const query = String(body.query ?? "");
    const fingerprints = Array.isArray(body.fingerprints) ? body.fingerprints : [];
    const limit = Number(body.limit ?? 20);
    const candidates = workbookCacheDb.buildCandidates(query, fingerprints, limit);
    writeJson(response, 200, { candidates });
    await finishApiMetric("search_candidates", {
      queryLength: query.length,
      fingerprintCount: fingerprints.length,
      candidateCount: candidates.length,
    });
    return true;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/config/list") {
    await ensureConfigDir();
    const entries = await fs.readdir(configRoot, { withFileTypes: true });
    const configs = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map(async (entry) => {
          const filePath = path.join(configRoot, entry.name);
          const raw = await fs.readFile(filePath, "utf8");
          const parsed = JSON.parse(raw);
          return {
            fileName: entry.name.replace(/\.json$/i, ""),
            configName: parsed.configName ?? entry.name.replace(/\.json$/i, ""),
            lastUpdated: parsed.lastUpdated ?? null,
            workbookCount: Array.isArray(parsed.workbooks) ? parsed.workbooks.length : 0,
          };
        }),
    );

    configs.sort((a, b) => `${b.lastUpdated ?? ""}`.localeCompare(`${a.lastUpdated ?? ""}`));
    writeJson(response, 200, { configs });
    await finishApiMetric("config_list", { configCount: configs.length });
    return true;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/config/load") {
    const fileName = requestUrl.searchParams.get("fileName");
    if (!fileName) {
      writeError(response, 400, "fileName is required");
      return true;
    }

    const configPath = toConfigPath(fileName);
    const raw = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(raw);
    const pruneResult = pruneCacheToConfigWorkbooks(config.workbooks);
    config.workbooks = await normalizeConfigWorkbooks(config.workbooks);
    workbookCacheDb.checkpoint();
    writeJson(response, 200, { config });
    await finishApiMetric("config_load", {
      fileName,
      workbookCount: Array.isArray(config.workbooks) ? config.workbooks.length : 0,
      prunedCount: pruneResult.removedCount,
      remainingCount: pruneResult.remainingCount,
      compacted: pruneResult.compacted,
    });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/config/save") {
    const body = await readJsonBody(request);
    const payload = buildConfigPayload(body);
    await ensureConfigDir();
    await fs.writeFile(toConfigPath(payload.fileName), JSON.stringify(payload, null, 2), "utf8");
    workbookCacheDb.checkpoint();
    writeJson(response, 200, { config: payload });
    await finishApiMetric("config_save", { fileName: payload.fileName, workbookCount: payload.workbooks.length });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/config/import-dialog") {
    const selectedPath = await runConfigImportPicker();
    if (!selectedPath) {
      writeJson(response, 200, { canceled: true });
      return true;
    }

    const raw = await fs.readFile(selectedPath, "utf8");
    const config = JSON.parse(raw);
    const pruneResult = pruneCacheToConfigWorkbooks(config.workbooks);
    config.workbooks = await normalizeConfigWorkbooks(config.workbooks);
    workbookCacheDb.checkpoint();
    writeJson(response, 200, { config });
    await finishApiMetric("config_import_dialog", {
      selectedPath,
      workbookCount: Array.isArray(config.workbooks) ? config.workbooks.length : 0,
      prunedCount: pruneResult.removedCount,
      remainingCount: pruneResult.remainingCount,
      compacted: pruneResult.compacted,
    });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/config/export-dialog") {
    const body = await readJsonBody(request);
    const payload = buildConfigPayload(body);
    const selectedPath = await runConfigExportPicker(payload.configName || payload.fileName);
    if (!selectedPath) {
      writeJson(response, 200, { canceled: true });
      return true;
    }

    await fs.writeFile(selectedPath, JSON.stringify(payload, null, 2), "utf8");
    workbookCacheDb.checkpoint();
    writeJson(response, 200, { config: payload });
    await finishApiMetric("config_export_dialog", {
      selectedPath,
      workbookCount: payload.workbooks.length,
    });
    return true;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/telemetry/ui") {
    const body = await readJsonBody(request);
    writeJson(response, 200, { ok: true });
    await appendRuntimeMetric("ui_telemetry", {
      event: body.event ?? "ui_snapshot",
      payload: body.payload ?? {},
      memory: createMemorySnapshot(),
    });
    return true;
  }

  return false;
};

const serveStatic = async (response, requestUrl) => {
  const requestPath = requestUrl.pathname === "/" ? "/index.html" : decodeURIComponent(requestUrl.pathname);
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(distRoot, safePath);

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[ext] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
};

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);

  try {
    if (requestUrl.pathname.startsWith("/__client/")) {
      const clientId = requestUrl.searchParams.get("id") ?? "";

      if (requestUrl.pathname === "/__client/open" || requestUrl.pathname === "/__client/ping") {
        touchClient(clientId);
        response.writeHead(204);
        response.end();
        return;
      }

      if (requestUrl.pathname === "/__client/close") {
        activeClients.delete(clientId);
        scheduleShutdown();
        response.writeHead(204);
        response.end();
        return;
      }
    }

    if (requestUrl.pathname.startsWith("/api/")) {
      const handled = await handleApiRequest(request, response, requestUrl);
      if (!handled) {
        writeError(response, 404, "Unknown API endpoint");
      }
      return;
    }

    if (!isDev && fssync.existsSync(distRoot)) {
      await serveStatic(response, requestUrl);
      return;
    }

    writeError(response, 503, "Static assets are not available. Run the Vite dev server or build first.");
  } catch (error) {
    writeError(response, 500, error instanceof Error ? error.message : "Internal server error");
  }
});

if (isValidateOnly) {
  process.stdout.write("serve-dist validation ok\n");
  process.exit(0);
}

server.listen(port, host, () => {
  void appendRuntimeMetric("server_start", {
    host,
    port,
    mode: isDev ? "dev" : "dist",
    memory: createMemorySnapshot(),
  });

  runtimeMetricsTimer = setInterval(() => {
    void appendRuntimeMetric("server_health", {
      activeClientCount: activeClients.size,
      memory: createMemorySnapshot(),
    });
  }, runtimeMetricsIntervalMs);
  runtimeMetricsTimer.unref?.();

  process.stdout.write(
    isDev
      ? `Excel Strict Searcher API running at http://${host}:${port}\n`
      : `Excel Strict Searcher running at http://${host}:${port}\n`,
  );
});

process.on("SIGINT", () => {
  if (runtimeMetricsTimer) {
    clearInterval(runtimeMetricsTimer);
  }
  void appendRuntimeMetric("server_stop", {
    reason: "SIGINT",
    memory: createMemorySnapshot(),
  }).finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  if (runtimeMetricsTimer) {
    clearInterval(runtimeMetricsTimer);
  }
  void appendRuntimeMetric("server_stop", {
    reason: "SIGTERM",
    memory: createMemorySnapshot(),
  }).finally(() => process.exit(0));
});
