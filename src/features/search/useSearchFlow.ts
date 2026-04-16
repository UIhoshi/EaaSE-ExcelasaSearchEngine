// read ../../../AGENTS.md and ../../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import { useDeferredValue, useRef, useState } from "react";
import { useSearchWorker } from "../../hooks/useSearchWorker";
import type { CachedWorkbook } from "../../types";

export const useSearchFlow = (workbooks: CachedWorkbook[]) => {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const deferredInputValue = useDeferredValue(inputValue);
  const searchStartedAtRef = useRef<number | null>(null);
  const searchQueryRef = useRef("");
  const searchWorkerState = useSearchWorker(workbooks, deferredInputValue, submittedQuery);

  const handleSubmit = (query: string) => {
    const trimmed = query.trim();
    searchStartedAtRef.current = trimmed ? performance.now() : null;
    searchQueryRef.current = trimmed;
    setSubmittedQuery(trimmed);
  };

  return {
    inputValue,
    setInputValue,
    submittedQuery,
    deferredInputValue,
    handleSubmit,
    searchQueryRef,
    searchStartedAtRef,
    ...searchWorkerState,
  };
};
