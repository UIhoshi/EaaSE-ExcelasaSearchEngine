import { loadWorkbooksFromPaths } from "./api";
import type { CachedWorkbook, ConfigWorkbookRecord } from "../types";

export const getAllCachedWorkbooks = async (records: ConfigWorkbookRecord[]): Promise<CachedWorkbook[]> =>
  loadWorkbooksFromPaths(records);

export const saveCachedWorkbook = async (workbook: CachedWorkbook): Promise<CachedWorkbook> => workbook;

export const deleteCachedWorkbook = async (fingerprint: string): Promise<string> => fingerprint;
