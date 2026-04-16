// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import type { CachedWorkbook, CellRecord, RowRecord, SheetRecord } from "../types";

const normalizeCell = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const buildFingerprint = (file: File): string =>
  `${file.name}__${file.size}__${file.lastModified}`;

const createCellRecord = (value = "", rowNumber = 1, columnIndex = 0): CellRecord => ({
  value,
  isMerged: false,
  colSpan: 1,
  rowSpan: 1,
  hidden: false,
  rootRow: rowNumber,
  rootCol: columnIndex,
});

const getSheetBounds = (
  XLSX: Awaited<typeof import("xlsx")>,
  worksheet: import("xlsx").WorkSheet,
) => {
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

const buildMatrix = (
  XLSX: Awaited<typeof import("xlsx")>,
  worksheet: import("xlsx").WorkSheet,
): CellRecord[][] => {
  const bounds = getSheetBounds(XLSX, worksheet);
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

  const merges = worksheet["!merges"] ?? [];
  merges.forEach((merge) => {
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
  });

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

const sheetToRecords = (
  fileName: string,
  sheetName: string,
  matrix: CellRecord[][],
): SheetRecord => {
  const columnCount = matrix.reduce((max, row) => Math.max(max, row.length), 0);
  const rows: RowRecord[] = matrix.map((row, index) => {
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

export const parseExcelFile = async (file: File, sourcePath?: string): Promise<CachedWorkbook> => {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const matrix = buildMatrix(XLSX, worksheet);
    return sheetToRecords(file.name, sheetName, matrix);
  });

  const uniqueValueSet = new Set<string>();
  sheets.forEach((sheet) => {
    sheet.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        if (cell.value) {
          uniqueValueSet.add(cell.value);
        }
      });
    });
  });

  return {
    fingerprint: buildFingerprint(file),
    fileName: file.name,
    fileSize: file.size,
    lastModified: file.lastModified,
    importedAt: Date.now(),
    absolutePath: sourcePath ?? file.name,
    headerDepth: 1,
    isFavorite: false,
    missing: false,
    sheets,
    uniqueValues: Array.from(uniqueValueSet),
  };
};
