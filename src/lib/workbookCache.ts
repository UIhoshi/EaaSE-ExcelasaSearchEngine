// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import type { CachedWorkbook, ConfigWorkbookRecord } from "../types";

export const cloneWorkbookSnapshot = (workbook: CachedWorkbook): CachedWorkbook => ({
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

const toWorkbookRecord = (workbook: CachedWorkbook): ConfigWorkbookRecord => ({
  fingerprint: workbook.fingerprint,
  absolutePath: workbook.absolutePath,
  headerDepth: workbook.headerDepth,
  isFavorite: workbook.isFavorite,
  importedAt: workbook.importedAt,
});

const shouldPersistSnapshot = (workbook: CachedWorkbook) => workbook.absolutePath === workbook.fileName;

export const buildPersistedWorkbookPayload = (workbooks: CachedWorkbook[]) =>
  workbooks.map((workbook) => (shouldPersistSnapshot(workbook) ? cloneWorkbookSnapshot(workbook) : toWorkbookRecord(workbook)));

export const isWorkbookCacheSnapshot = (
  workbook: CachedWorkbook | ConfigWorkbookRecord,
): workbook is CachedWorkbook => "sheets" in workbook && Array.isArray(workbook.sheets) && "uniqueValues" in workbook;
