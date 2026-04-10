import fs from "node:fs";
import path from "node:path";
import { basename } from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA_VERSION = 3;

const buildWorkbookSummary = (workbook) => ({
  fingerprint: workbook.fingerprint,
  fileName: workbook.fileName,
  fileSize: Number(workbook.fileSize ?? 0),
  lastModified: Number(workbook.lastModified ?? 0),
  importedAt: Number(workbook.importedAt ?? Date.now()),
  absolutePath: workbook.absolutePath,
  headerDepth: Number(workbook.headerDepth ?? 1),
  isFavorite: Boolean(workbook.isFavorite),
  missing: Boolean(workbook.missing),
  sheets: [],
  uniqueValues: [],
  ...(workbook.error ? { error: workbook.error } : {}),
});

const hasPersistableWorkbookSnapshot = (item) =>
  Array.isArray(item?.sheets) &&
  item.sheets.length > 0 &&
  Array.isArray(item?.uniqueValues);

const createCellRecord = (value = "", rowNumber = 1, columnIndex = 0) => ({
  value,
  isMerged: false,
  colSpan: 1,
  rowSpan: 1,
  hidden: false,
  rootRow: rowNumber,
  rootCol: columnIndex,
});

const escapeLikeValue = (query) => query.replace(/[\\%_]/g, (match) => `\\${match}`);
const buildLikePattern = (query) => `%${escapeLikeValue(query)}%`;

const createWorkbookCacheDatabase = (configRoot) => {
  fs.mkdirSync(configRoot, { recursive: true });
  const cacheDbPath = path.join(configRoot, "cache.db");
  const db = new DatabaseSync(cacheDbPath);

  db.exec(`
    PRAGMA journal_mode = DELETE;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
  `);

  const userVersion = db.prepare("PRAGMA user_version").get().user_version ?? 0;
  if (userVersion !== SCHEMA_VERSION) {
    db.exec(`
      DROP TABLE IF EXISTS merged_cell_cache;
      DROP TABLE IF EXISTS cell_cache;
      DROP TABLE IF EXISTS row_cache;
      DROP TABLE IF EXISTS sheet_cache;
      DROP TABLE IF EXISTS workbook_cache;
      PRAGMA user_version = ${SCHEMA_VERSION};
    `);
    db.exec("VACUUM");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS workbook_cache (
      fingerprint TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      last_modified INTEGER NOT NULL,
      imported_at INTEGER NOT NULL,
      absolute_path TEXT NOT NULL,
      header_depth INTEGER NOT NULL,
      is_favorite INTEGER NOT NULL,
      missing INTEGER NOT NULL,
      error TEXT
    ) WITHOUT ROWID;

    CREATE TABLE IF NOT EXISTS sheet_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fingerprint TEXT NOT NULL,
      sheet_name TEXT NOT NULL,
      default_header_depth INTEGER NOT NULL,
      column_count INTEGER NOT NULL,
      row_count INTEGER NOT NULL,
      UNIQUE (fingerprint, sheet_name),
      FOREIGN KEY (fingerprint) REFERENCES workbook_cache(fingerprint) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cell_cache (
      sheet_id INTEGER NOT NULL,
      row_number INTEGER NOT NULL,
      col_number INTEGER NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (sheet_id, row_number, col_number),
      FOREIGN KEY (sheet_id) REFERENCES sheet_cache(id) ON DELETE CASCADE
    ) WITHOUT ROWID;

    CREATE TABLE IF NOT EXISTS merged_cell_cache (
      sheet_id INTEGER NOT NULL,
      row_number INTEGER NOT NULL,
      col_number INTEGER NOT NULL,
      col_span INTEGER NOT NULL,
      row_span INTEGER NOT NULL,
      hidden INTEGER NOT NULL,
      root_row INTEGER NOT NULL,
      root_col INTEGER NOT NULL,
      PRIMARY KEY (sheet_id, row_number, col_number),
      FOREIGN KEY (sheet_id, row_number, col_number)
        REFERENCES cell_cache(sheet_id, row_number, col_number) ON DELETE CASCADE
    ) WITHOUT ROWID;

    CREATE INDEX IF NOT EXISTS idx_sheet_cache_fingerprint
    ON sheet_cache (fingerprint);

    CREATE INDEX IF NOT EXISTS idx_cell_cache_sheet_row
    ON cell_cache (sheet_id, row_number, col_number);
  `);

  const selectWorkbookStmt = db.prepare(`
    SELECT *
    FROM workbook_cache
    WHERE fingerprint = ?
  `);

  const deleteWorkbookStmt = db.prepare(`
    DELETE FROM workbook_cache
    WHERE fingerprint = ?
  `);

  const insertWorkbookStmt = db.prepare(`
    INSERT INTO workbook_cache (
      fingerprint,
      file_name,
      file_size,
      last_modified,
      imported_at,
      absolute_path,
      header_depth,
      is_favorite,
      missing,
      error
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSheetStmt = db.prepare(`
    INSERT INTO sheet_cache (
      fingerprint,
      sheet_name,
      default_header_depth,
      column_count,
      row_count
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const insertCellStmt = db.prepare(`
    INSERT INTO cell_cache (
      sheet_id,
      row_number,
      col_number,
      value
    ) VALUES (?, ?, ?, ?)
  `);

  const insertMergedCellStmt = db.prepare(`
    INSERT INTO merged_cell_cache (
      sheet_id,
      row_number,
      col_number,
      col_span,
      row_span,
      hidden,
      root_row,
      root_col
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const selectSheetMetaByIdStmt = db.prepare(`
    SELECT id, fingerprint, sheet_name, default_header_depth, column_count, row_count
    FROM sheet_cache
    WHERE id = ?
  `);

  const selectSheetCellsStmt = db.prepare(`
    SELECT c.row_number, c.col_number, c.value, m.col_span, m.row_span, m.hidden, m.root_row, m.root_col
    FROM cell_cache c
    LEFT JOIN merged_cell_cache m
      ON m.sheet_id = c.sheet_id
      AND m.row_number = c.row_number
      AND m.col_number = c.col_number
    WHERE c.sheet_id = ?
    ORDER BY c.row_number, c.col_number
  `);

  const selectMatchedCellsStmt = db.prepare(`
    SELECT s.id AS sheet_id, s.fingerprint, s.sheet_name, c.row_number
    FROM cell_cache c
    JOIN sheet_cache s ON s.id = c.sheet_id
    WHERE c.value LIKE ? ESCAPE '\\'
    ORDER BY s.fingerprint, s.sheet_name, c.row_number, c.col_number
  `);

  const selectCandidateCellsStmt = db.prepare(`
    SELECT s.fingerprint, c.value
    FROM cell_cache c
    JOIN sheet_cache s ON s.id = c.sheet_id
    WHERE c.value LIKE ? ESCAPE '\\'
    ORDER BY s.fingerprint, c.value
  `);

  const listFingerprints = (fingerprints) => {
    if (!Array.isArray(fingerprints) || fingerprints.length === 0) {
      return [];
    }

    return fingerprints.filter(Boolean);
  };

  const matchesFingerprintFilter = (fingerprintSet, fingerprint) =>
    fingerprintSet === null || fingerprintSet.has(fingerprint);

  const buildSearchRows = (sheetMeta) => {
    const rows = Array.from({ length: sheetMeta.row_count }, (_, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = Array.from(
        { length: sheetMeta.column_count },
        (_, columnIndex) => createCellRecord("", rowNumber, columnIndex),
      );

      return {
        rowNumber,
        cells,
        joined: "",
      };
    });

    for (const cell of selectSheetCellsStmt.iterate(sheetMeta.id)) {
      const row = rows[cell.row_number - 1];
      if (!row) {
        continue;
      }

      row.cells[cell.col_number] = {
        value: cell.value,
        isMerged: cell.root_row !== null,
        colSpan: cell.col_span ?? 1,
        rowSpan: cell.row_span ?? 1,
        hidden: Boolean(cell.hidden ?? 0),
        rootRow: cell.root_row ?? cell.row_number,
        rootCol: cell.root_col ?? cell.col_number,
      };
    }

    rows.forEach((row) => {
      row.joined = row.cells.map((cell) => cell.value).join(" | ");
    });

    return rows;
  };

  const saveWorkbookSnapshot = (workbook) => {
    db.exec("BEGIN");

    try {
      deleteWorkbookStmt.run(workbook.fingerprint);

      insertWorkbookStmt.run(
        workbook.fingerprint,
        workbook.fileName,
        workbook.fileSize,
        workbook.lastModified,
        workbook.importedAt,
        workbook.absolutePath,
        workbook.headerDepth ?? 1,
        workbook.isFavorite ? 1 : 0,
        workbook.missing ? 1 : 0,
        workbook.error ?? null,
      );

      for (const sheet of workbook.sheets) {
        const result = insertSheetStmt.run(
          workbook.fingerprint,
          sheet.sheetName,
          sheet.defaultHeaderDepth ?? 1,
          sheet.columnCount,
          sheet.rows.length,
        );
        const sheetId = Number(result.lastInsertRowid);

        for (const row of sheet.rows) {
          row.cells.forEach((cell, columnIndex) => {
            if (!cell.value && !cell.isMerged) {
              return;
            }

            insertCellStmt.run(
              sheetId,
              row.rowNumber,
              columnIndex,
              cell.value,
            );

            if (cell.isMerged) {
              insertMergedCellStmt.run(
                sheetId,
                row.rowNumber,
                columnIndex,
                cell.colSpan ?? 1,
                cell.rowSpan ?? 1,
                cell.hidden ? 1 : 0,
                cell.rootRow ?? row.rowNumber,
                cell.rootCol ?? columnIndex,
              );
            }
          });
        }
      }

      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  };

  const getWorkbookSummary = (fingerprint, fallback) => {
    const record = selectWorkbookStmt.get(fingerprint);
    if (!record) {
      return fallback
        ? buildWorkbookSummary({
            fingerprint: fallback.fingerprint,
            fileName: fallback.fileName ?? basename(fallback.absolutePath),
            fileSize: 0,
            lastModified: 0,
            importedAt: fallback.importedAt ?? Date.now(),
            absolutePath: fallback.absolutePath,
            headerDepth: fallback.headerDepth ?? 1,
            isFavorite: fallback.isFavorite ?? false,
            missing: false,
          })
        : null;
    }

    return buildWorkbookSummary({
      fingerprint: record.fingerprint,
      fileName: record.file_name,
      fileSize: record.file_size,
      lastModified: record.last_modified,
      importedAt: record.imported_at,
      absolutePath: record.absolute_path,
      headerDepth: record.header_depth,
      isFavorite: Boolean(record.is_favorite),
      missing: Boolean(record.missing),
      error: record.error ?? undefined,
    });
  };

  const rehydrateConfigWorkbooks = (workbooks) =>
    workbooks.map((item) => {
      if (hasPersistableWorkbookSnapshot(item)) {
        saveWorkbookSnapshot(item);
        return buildWorkbookSummary(item);
      }

      return getWorkbookSummary(item.fingerprint, item);
    });

  const searchWorkbooks = (query, fingerprints) => {
    if (!query) {
      return [];
    }

    const fingerprintList = listFingerprints(fingerprints);
    const fingerprintSet = fingerprintList.length > 0 ? new Set(fingerprintList) : null;
    const grouped = new Map();

    for (const row of selectMatchedCellsStmt.iterate(buildLikePattern(query))) {
      if (!matchesFingerprintFilter(fingerprintSet, row.fingerprint)) {
        continue;
      }

      const key = `${row.sheet_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          fingerprint: row.fingerprint,
          sheetId: row.sheet_id,
          sheetName: row.sheet_name,
          rowNumbers: new Set(),
        });
      }

      grouped.get(key).rowNumbers.add(row.row_number);
    }

    const hits = [];

    for (const item of grouped.values()) {
      const workbook = getWorkbookSummary(item.fingerprint);
      const sheetMeta = selectSheetMetaByIdStmt.get(item.sheetId);

      if (!workbook || !sheetMeta) {
        continue;
      }

      const allRows = buildSearchRows(sheetMeta);
      const rows = allRows.filter((row) => item.rowNumbers.has(row.rowNumber));

      hits.push({
        fingerprint: item.fingerprint,
        fileName: workbook.fileName,
        absolutePath: workbook.absolutePath,
        missing: workbook.missing,
        sheetId: `${workbook.fileName}::${item.sheetName}`,
        sheetName: item.sheetName,
        rows,
        allRows,
        columnCount: sheetMeta.column_count,
        defaultHeaderDepth: sheetMeta.default_header_depth,
      });
    }

    return hits;
  };

  const buildCandidates = (query, fingerprints, limit = 20) => {
    if (!query) {
      return [];
    }

    const fingerprintList = listFingerprints(fingerprints);
    const fingerprintSet = fingerprintList.length > 0 ? new Set(fingerprintList) : null;
    const matches = [];
    const seen = new Set();

    for (const row of selectCandidateCellsStmt.iterate(buildLikePattern(query))) {
      if (!matchesFingerprintFilter(fingerprintSet, row.fingerprint)) {
        continue;
      }

      if (!row.value || seen.has(row.value)) {
        continue;
      }

      seen.add(row.value);
      matches.push(row.value);

      if (matches.length >= limit) {
        break;
      }
    }

    return matches;
  };

  const checkpoint = () => {
    db.exec("PRAGMA optimize");
  };

  return {
    buildCandidates,
    cacheDbPath,
    checkpoint,
    rehydrateConfigWorkbooks,
    saveWorkbookSnapshot,
    searchWorkbooks,
  };
};

export default createWorkbookCacheDatabase;
