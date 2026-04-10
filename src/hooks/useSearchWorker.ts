import { startTransition, useEffect, useRef, useState } from "react";
import { buildSearchCandidatesInCache, searchWorkbooksInCache } from "../lib/api";
import type { CachedWorkbook, SearchHit } from "../types";

type SearchWorkerResponse = {
  type: "search" | "candidates";
  hits?: SearchHit[];
  candidates?: string[];
};

export const useSearchWorker = (
  workbooks: CachedWorkbook[],
  candidateQuery: string,
  submittedQuery: string,
) => {
  const workerRef = useRef<Worker | null>(null);
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [candidates, setCandidates] = useState<string[]>([]);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../workers/searchWorker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (event: MessageEvent<SearchWorkerResponse>) => {
      startTransition(() => {
        if (event.data.type === "search") {
          setSearchHits(event.data.hits ?? []);
          return;
        }

        setCandidates(event.data.candidates ?? []);
      });
    };

    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    const fingerprints = workbooks.map((workbook) => workbook.fingerprint);

    void buildSearchCandidatesInCache(candidateQuery, fingerprints, 20)
      .then((response) => {
        startTransition(() => setCandidates(response.candidates ?? []));
      })
      .catch(() => {
        workerRef.current?.postMessage({
          type: "candidates",
          query: candidateQuery,
          workbooks,
          limit: 20,
        });
      });
  }, [candidateQuery, workbooks]);

  useEffect(() => {
    const fingerprints = workbooks.map((workbook) => workbook.fingerprint);

    void searchWorkbooksInCache(submittedQuery, fingerprints)
      .then((response) => {
        startTransition(() => setSearchHits(response.hits ?? []));
      })
      .catch(() => {
        workerRef.current?.postMessage({
          type: "search",
          query: submittedQuery,
          workbooks,
        });
      });
  }, [submittedQuery, workbooks]);

  return {
    candidates,
    searchHits,
  };
};
