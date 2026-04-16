// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import { loadWorkbooksFromPaths, removeWorkbooksFromCache } from "./api";
import type { CachedWorkbook, ConfigWorkbookRecord } from "../types";

export const loadWorkbooksFromRepository = async (
  records: ConfigWorkbookRecord[],
): Promise<CachedWorkbook[]> => loadWorkbooksFromPaths(records);

export const removeWorkbooksFromRepository = async (
  fingerprints: string[],
): Promise<{ removedCount: number; remainingCount: number }> => removeWorkbooksFromCache(fingerprints);
