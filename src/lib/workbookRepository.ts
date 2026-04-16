import { loadWorkbooksFromPaths, removeWorkbooksFromCache } from "./api";
import type { CachedWorkbook, ConfigWorkbookRecord } from "../types";

export const loadWorkbooksFromRepository = async (
  records: ConfigWorkbookRecord[],
): Promise<CachedWorkbook[]> => loadWorkbooksFromPaths(records);

export const removeWorkbooksFromRepository = async (
  fingerprints: string[],
): Promise<{ removedCount: number; remainingCount: number }> => removeWorkbooksFromCache(fingerprints);
