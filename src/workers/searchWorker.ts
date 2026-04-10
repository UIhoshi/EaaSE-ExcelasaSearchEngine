import { buildCandidates, searchWorkbooks } from "../lib/search";
import type { CachedWorkbook, SearchHit } from "../types";

type SearchWorkerRequest =
  | {
      type: "search";
      query: string;
      workbooks: CachedWorkbook[];
    }
  | {
      type: "candidates";
      query: string;
      workbooks: CachedWorkbook[];
      limit?: number;
    };

type SearchWorkerResponse =
  | {
      type: "search";
      hits: SearchHit[];
    }
  | {
      type: "candidates";
      candidates: string[];
    };

self.onmessage = (event: MessageEvent<SearchWorkerRequest>) => {
  if (event.data.type === "search") {
    const response: SearchWorkerResponse = {
      type: "search",
      hits: searchWorkbooks(event.data.workbooks, event.data.query),
    };
    self.postMessage(response);
    return;
  }

  const response: SearchWorkerResponse = {
    type: "candidates",
    candidates: buildCandidates(event.data.workbooks, event.data.query, event.data.limit ?? 20),
  };
  self.postMessage(response);
};

export {};
