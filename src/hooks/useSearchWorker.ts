// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import { startTransition, useEffect, useRef, useState } from "react";
import { buildSearchCandidatesInCache, searchWorkbooksInCache } from "../lib/api";
import type { CachedWorkbook, SearchHit } from "../types";

type AsyncStatus = "idle" | "loading" | "ready" | "degraded-to-worker" | "error";
type DataSource = "api" | "worker" | null;

type QueryStageState<T> = {
  data: T;
  error: string | null;
  source: DataSource;
  status: AsyncStatus;
};

type SearchWorkerResponse = {
  type: "search" | "candidates";
  requestId: number;
  hits?: SearchHit[];
  candidates?: string[];
};

export const useSearchWorker = (
  workbooks: CachedWorkbook[],
  candidateQuery: string,
  submittedQuery: string,
) => {
  const workerRef = useRef<Worker | null>(null);
  const candidateRequestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);
  const [candidateState, setCandidateState] = useState<QueryStageState<string[]>>({
    data: [],
    error: null,
    source: null,
    status: "idle",
  });
  const [searchState, setSearchState] = useState<QueryStageState<SearchHit[]>>({
    data: [],
    error: null,
    source: null,
    status: "idle",
  });

  useEffect(() => {
    workerRef.current = new Worker(new URL("../workers/searchWorker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (event: MessageEvent<SearchWorkerResponse>) => {
      startTransition(() => {
        if (event.data.type === "search") {
          if (event.data.requestId !== searchRequestIdRef.current) {
            return;
          }

          setSearchState({
            data: event.data.hits ?? [],
            error: null,
            source: "worker",
            status: "ready",
          });
          return;
        }

        if (event.data.requestId !== candidateRequestIdRef.current) {
          return;
        }

        setCandidateState({
          data: event.data.candidates ?? [],
          error: null,
          source: "worker",
          status: "ready",
        });
      });
    };

    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!candidateQuery) {
      candidateRequestIdRef.current += 1;
      startTransition(() =>
        setCandidateState({
          data: [],
          error: null,
          source: null,
          status: "idle",
        }),
      );
      return;
    }

    candidateRequestIdRef.current += 1;
    const requestId = candidateRequestIdRef.current;
    const fingerprints = workbooks.map((workbook) => workbook.fingerprint);

    startTransition(() =>
      setCandidateState({
        data: [],
        error: null,
        source: null,
        status: "loading",
      }),
    );

    void buildSearchCandidatesInCache(candidateQuery, fingerprints, 20)
      .then((response) => {
        if (requestId !== candidateRequestIdRef.current) {
          return;
        }

        startTransition(() =>
          setCandidateState({
            data: response.candidates ?? [],
            error: null,
            source: "api",
            status: "ready",
          }),
        );
      })
      .catch((error) => {
        if (requestId !== candidateRequestIdRef.current) {
          return;
        }

        startTransition(() =>
          setCandidateState({
            data: [],
            error: error instanceof Error ? error.message : "Candidate lookup failed",
            source: "worker",
            status: "degraded-to-worker",
          }),
        );

        workerRef.current?.postMessage({
          type: "candidates",
          requestId,
          query: candidateQuery,
          workbooks,
          limit: 20,
        });
      });
  }, [candidateQuery, workbooks]);

  useEffect(() => {
    if (!submittedQuery) {
      searchRequestIdRef.current += 1;
      startTransition(() =>
        setSearchState({
          data: [],
          error: null,
          source: null,
          status: "idle",
        }),
      );
      return;
    }

    searchRequestIdRef.current += 1;
    const requestId = searchRequestIdRef.current;
    const fingerprints = workbooks.map((workbook) => workbook.fingerprint);

    startTransition(() =>
      setSearchState({
        data: [],
        error: null,
        source: null,
        status: "loading",
      }),
    );

    void searchWorkbooksInCache(submittedQuery, fingerprints)
      .then((response) => {
        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        startTransition(() =>
          setSearchState({
            data: response.hits ?? [],
            error: null,
            source: "api",
            status: "ready",
          }),
        );
      })
      .catch((error) => {
        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        startTransition(() =>
          setSearchState({
            data: [],
            error: error instanceof Error ? error.message : "Search failed",
            source: "worker",
            status: "degraded-to-worker",
          }),
        );

        workerRef.current?.postMessage({
          type: "search",
          requestId,
          query: submittedQuery,
          workbooks,
        });
      });
  }, [submittedQuery, workbooks]);

  return {
    candidateState,
    candidates: candidateState.data,
    searchHits: searchState.data,
    searchState,
  };
};
