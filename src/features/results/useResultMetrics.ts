// read ../../../AGENTS.md and ../../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import { useMemo } from "react";
import type { SearchHit } from "../../types";

export const useResultMetrics = (
  searchHits: SearchHit[],
  submittedQuery: string,
  layoutMode: "standard" | "expanded",
) => {
  const totalMatches = useMemo(
    () => searchHits.reduce((count, hit) => count + hit.rows.length, 0),
    [searchHits],
  );

  const sheetJumpTargets = useMemo(
    () =>
      searchHits.map((hit) => ({
        id: hit.sheetId,
        label: `${hit.sheetName} · ${hit.rows.length}`,
      })),
    [searchHits],
  );

  const enableExpandedLayout = layoutMode === "expanded" && submittedQuery !== "" && searchHits.length > 0;

  return {
    totalMatches,
    sheetJumpTargets,
    enableExpandedLayout,
  };
};
