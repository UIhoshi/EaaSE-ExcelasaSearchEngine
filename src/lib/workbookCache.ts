import type { CachedWorkbook, ConfigWorkbookRecord } from "../types";

export const cloneWorkbookForConfig = (workbook: CachedWorkbook): CachedWorkbook => ({
  ...workbook,
  sheets: workbook.sheets.map((sheet) => ({
    ...sheet,
    rows: sheet.rows.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => ({ ...cell })),
    })),
  })),
  uniqueValues: [...workbook.uniqueValues],
});

export const buildWorkbookCachePayload = (workbooks: CachedWorkbook[]) =>
  workbooks.map((workbook) => cloneWorkbookForConfig(workbook));

export const isWorkbookCacheSnapshot = (
  workbook: CachedWorkbook | ConfigWorkbookRecord,
): workbook is CachedWorkbook => "sheets" in workbook && Array.isArray(workbook.sheets) && "uniqueValues" in workbook;
