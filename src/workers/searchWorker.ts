// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import { buildCandidates, searchWorkbooks } from "../lib/search";
import type { CachedWorkbook, SearchHit } from "../types";

type SearchWorkerRequest =
  | {
      type: "search";
      requestId: number;
      query: string;
      workbooks: CachedWorkbook[];
    }
  | {
      type: "candidates";
      requestId: number;
      query: string;
      workbooks: CachedWorkbook[];
      limit?: number;
    };

type SearchWorkerResponse =
  | {
      type: "search";
      requestId: number;
      hits: SearchHit[];
    }
  | {
      type: "candidates";
      requestId: number;
      candidates: string[];
    };

self.onmessage = (event: MessageEvent<SearchWorkerRequest>) => {
  if (event.data.type === "search") {
    const response: SearchWorkerResponse = {
      type: "search",
      requestId: event.data.requestId,
      hits: searchWorkbooks(event.data.workbooks, event.data.query),
    };
    self.postMessage(response);
    return;
  }

  const response: SearchWorkerResponse = {
    type: "candidates",
    requestId: event.data.requestId,
    candidates: buildCandidates(event.data.workbooks, event.data.query, event.data.limit ?? 20),
  };
  self.postMessage(response);
};

export {};
