// read ../AGENTS.md and ../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import {
  type CSSProperties,
  type MouseEvent,
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FileTreeView } from "./components/FileTreeView";
import { VirtualSheetList } from "./components/VirtualSheetList";
import { useResultMetrics } from "./features/results/useResultMetrics";
import { useSearchFlow } from "./features/search/useSearchFlow";
import { useWorkbookArchive } from "./hooks/useWorkbookArchive";
import {
  openWorkbookInExplorer,
  pickFiles,
  pickFolder,
  sendUiTelemetry,
} from "./lib/api";
import { parseExcelFile } from "./lib/excel";
import { buildFileTree, collectNodeWorkbooks, type FileTreeNode } from "./lib/fileTree";
import { loadWorkbooksFromRepository, removeWorkbooksFromRepository } from "./lib/workbookRepository";
import { getDictionary, resolveInitialLanguage } from "./lib/i18n";
import {
  buildSectionRowCells,
  buildVisibleColumnSet,
  getHeaderRows,
  getRenderableCells,
  highlightText,
  type HeaderFilterOption,
  toExcelColumnLabel,
} from "./lib/resultProjection";
import type {
  AppLanguage,
  CachedWorkbook,
  ToastState,
} from "./types";

const MAX_FILES = 1000;

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>(resolveInitialLanguage());
  const t = getDictionary(language);
  const [workbooks, setWorkbooks] = useState<CachedWorkbook[]>([]);
  const [headerDepthMap, setHeaderDepthMap] = useState<Record<string, number>>({});
  const [headerColumnFilterMap, setHeaderColumnFilterMap] = useState<Record<string, Record<number, string[]>>>({});
  const [layoutMode, setLayoutMode] = useState<"standard" | "expanded">("standard");
  const [columnMode, setColumnMode] = useState<"all" | "labeled">("all");
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [duplicateLaunch, setDuplicateLaunch] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [fileFilter, setFileFilter] = useState("");
  const [jumpToSheetId, setJumpToSheetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const [syncedHeaderColumns, setSyncedHeaderColumns] = useState<{ sidebar: number; results: number } | null>(null);
  const deferredFileFilter = useDeferredValue(fileFilter);
  const { activeArchive, handleLoadConfig, handleSaveConfig, loading, persistArchiveState } = useWorkbookArchive({
    language,
    layoutMode,
    setLanguage,
    setLayoutMode,
    workbooks,
    setWorkbooks,
    resetHeaderState: () => {
      setHeaderDepthMap({});
      setHeaderColumnFilterMap({});
    },
    setToast,
    t: {
      configLoaded: t.configLoaded,
      configSaved: t.configSaved,
      configSaveFailed: t.configSaveFailed,
      configLoadFailed: t.configLoadFailed,
    },
  });

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!sidebarRef.current || !resultsRef.current) {
      return undefined;
    }

    const syncWidths = () => {
      if (window.innerWidth <= 980) {
        setSyncedHeaderColumns(null);
        return;
      }

      const sidebarWidth = Math.round(sidebarRef.current?.getBoundingClientRect().width ?? 0);
      const resultsWidth = Math.round(resultsRef.current?.getBoundingClientRect().width ?? 0);

      if (!sidebarWidth || !resultsWidth) {
        return;
      }

      setSyncedHeaderColumns((current) => {
        if (current?.sidebar === sidebarWidth && current.results === resultsWidth) {
          return current;
        }

        return {
          sidebar: sidebarWidth,
          results: resultsWidth,
        };
      });
    };

    syncWidths();
    const observer = new ResizeObserver(() => syncWidths());
    observer.observe(sidebarRef.current);
    observer.observe(resultsRef.current);
    window.addEventListener("resize", syncWidths);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncWidths);
    };
  }, [layoutMode, workbooks.length]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const memory = "memory" in performance
      ? {
          jsHeapSizeLimitMb: Number((((performance as Performance & { memory: { jsHeapSizeLimit: number } }).memory.jsHeapSizeLimit) / 1024 / 1024).toFixed(2)),
          totalJsHeapSizeMb: Number((((performance as Performance & { memory: { totalJSHeapSize: number } }).memory.totalJSHeapSize) / 1024 / 1024).toFixed(2)),
          usedJsHeapSizeMb: Number((((performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize) / 1024 / 1024).toFixed(2)),
        }
      : null;

    void sendUiTelemetry("ui_session_ready", {
      language,
      layoutMode,
      workbookCount: workbooks.length,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      memory,
    });
  }, [language, layoutMode, loading, workbooks.length]);

  const filteredWorkbooks = useMemo(() => {
    const keyword = deferredFileFilter.trim().toLowerCase();
    if (!keyword) {
      return workbooks;
    }

    return workbooks.filter((workbook) =>
      [workbook.fileName, workbook.absolutePath].some((field) => field.toLowerCase().includes(keyword)),
    );
  }, [deferredFileFilter, workbooks]);
  const {
    candidateState,
    candidates,
    handleSubmit,
    inputValue,
    searchHits,
    searchQueryRef,
    searchStartedAtRef,
    searchState,
    setInputValue,
    submittedQuery,
  } = useSearchFlow(filteredWorkbooks);
  const { enableExpandedLayout, sheetJumpTargets, totalMatches } = useResultMetrics(
    searchHits,
    submittedQuery,
    layoutMode,
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isLauncherMode = searchParams.get("launcher") === "1" && window.location.hostname === "127.0.0.1";

    if (!isLauncherMode) {
      return undefined;
    }

    const storageKey = "excel-strict-searcher-launcher-client-id";
    const primaryTabKey = "excel-strict-searcher-primary-tab-id";
    const heartbeatPrefix = "excel-strict-searcher-primary-heartbeat:";
    const heartbeatTtlMs = 6000;
    const clientId =
      sessionStorage.getItem(storageKey) ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const originalTitle = document.title;
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("excel-strict-searcher-launcher") : null;

    sessionStorage.setItem(storageKey, clientId);

    const isAlive = (targetId: string | null) => {
      if (!targetId || targetId === clientId) {
        return false;
      }

      const lastSeen = Number.parseInt(localStorage.getItem(`${heartbeatPrefix}${targetId}`) ?? "0", 10);
      return Date.now() - lastSeen < heartbeatTtlMs;
    };

    const markPrimaryAlive = () => {
      localStorage.setItem(primaryTabKey, clientId);
      localStorage.setItem(`${heartbeatPrefix}${clientId}`, Date.now().toString());
    };

    const sendClientSignal = (path: string, useBeacon = false) => {
      const endpoint = `${path}?id=${encodeURIComponent(clientId)}`;

      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob());
        return;
      }

      void fetch(endpoint, {
        method: "POST",
        keepalive: true,
      }).catch(() => undefined);
    };

    const existingPrimaryId = localStorage.getItem(primaryTabKey);
    const isDuplicate = isAlive(existingPrimaryId);

    if (isDuplicate && existingPrimaryId) {
      setDuplicateLaunch(true);
      channel?.postMessage({ type: "activate-existing", targetId: existingPrimaryId });
    } else {
      markPrimaryAlive();
      sendClientSignal("/__client/open");
    }

    const heartbeatId = window.setInterval(() => {
      if (isDuplicate) {
        return;
      }

      markPrimaryAlive();
      sendClientSignal("/__client/ping");
    }, 2000);

    const handleChannelMessage = (event: MessageEvent<{ type?: string; targetId?: string }>) => {
      if (event.data?.type !== "activate-existing" || event.data.targetId !== clientId) {
        return;
      }

      window.focus();
      document.title = `${t.appTitle} - Active`;
      window.setTimeout(() => {
        document.title = originalTitle;
      }, 1600);
    };

    channel?.addEventListener("message", handleChannelMessage);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDuplicate) {
        return;
      }

      event.preventDefault();
      event.returnValue = "Closing the page will stop the local service.";
      sendClientSignal("/__client/close", true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearInterval(heartbeatId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      channel?.removeEventListener("message", handleChannelMessage);
      channel?.close();

      if (localStorage.getItem(primaryTabKey) === clientId) {
        localStorage.removeItem(primaryTabKey);
        localStorage.removeItem(`${heartbeatPrefix}${clientId}`);
      }
    };
  }, [t.appTitle]);

  const mergeImportedWorkbooks = (nextWorkbooks: CachedWorkbook[]) => {
    startTransition(() => {
      setWorkbooks((current) => [...nextWorkbooks, ...current].sort((a, b) => b.importedAt - a.importedAt));
    });
  };

  const dedupeImportedWorkbooks = (incoming: CachedWorkbook[]) => {
    const knownFingerprints = new Set(workbooks.map((item) => item.fingerprint));
    return incoming.filter((workbook) => !knownFingerprints.has(workbook.fingerprint));
  };

  const handleBrowserFilesSelected = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) {
      return;
    }

    const knownFingerprints = new Set(workbooks.map((item) => item.fingerprint));
    const freshFiles = files.filter((file) => !knownFingerprints.has(`${file.name}__${file.size}__${file.lastModified}`));

    if (workbooks.length + freshFiles.length > MAX_FILES) {
      window.alert(t.maxFilesReached(MAX_FILES));
      return;
    }

    if (!freshFiles.length) {
      window.alert(t.duplicateFiles);
      return;
    }

    setImporting(true);

    try {
      const parsedWorkbooks = await Promise.all(freshFiles.map((file) => parseExcelFile(file)));
      mergeImportedWorkbooks(parsedWorkbooks);
    } catch {
      window.alert(t.importFailed);
    } finally {
      setImporting(false);
    }
  };

  const handleBrowserFolderSelected = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) {
      return;
    }

    setImporting(true);

    try {
      const parsedWorkbooks = await Promise.all(
        files
          .filter((file) => /\.(xls|xlsx|xlsm|csv)$/i.test(file.name))
          .map((file) =>
            parseExcelFile(
              file,
              ((file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name).replace(/\//g, "\\"),
            ),
          ),
      );
      const freshWorkbooks = dedupeImportedWorkbooks(parsedWorkbooks);

      if (workbooks.length + freshWorkbooks.length > MAX_FILES) {
        window.alert(t.maxFilesReached(MAX_FILES));
        return;
      }

      if (!freshWorkbooks.length) {
        window.alert(t.duplicateFiles);
        return;
      }

      mergeImportedWorkbooks(freshWorkbooks);
    } catch {
      window.alert(t.importFailed);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);

    try {
      const pickedPaths = await pickFiles();

      if (!pickedPaths.length) {
        return;
      }

      const knownPaths = new Set(workbooks.map((item) => item.absolutePath));
      const freshPaths = pickedPaths.filter((item) => !knownPaths.has(item));

      if (workbooks.length + freshPaths.length > MAX_FILES) {
        window.alert(t.maxFilesReached(MAX_FILES));
        return;
      }

      if (!freshPaths.length) {
        window.alert(t.duplicateFiles);
        return;
      }

      const parsedWorkbooks = await loadWorkbooksFromRepository(
        freshPaths.map((absolutePath) => ({
          absolutePath,
          fingerprint: absolutePath,
          headerDepth: 1,
          isFavorite: false,
          importedAt: Date.now(),
        })),
      );

      mergeImportedWorkbooks(parsedWorkbooks);
    } catch {
      fileInputRef.current?.click();
    } finally {
      setImporting(false);
    }
  };

  const handleImportFolder = async () => {
    setImporting(true);

    try {
      const pickedPaths = await pickFolder();

      if (!pickedPaths.length) {
        return;
      }

      const parsedWorkbooks = await loadWorkbooksFromRepository(
        pickedPaths.map((absolutePath) => ({
          absolutePath,
          fingerprint: absolutePath,
          headerDepth: 1,
          isFavorite: false,
          importedAt: Date.now(),
        })),
      );
      const freshWorkbooks = dedupeImportedWorkbooks(parsedWorkbooks);

      if (workbooks.length + freshWorkbooks.length > MAX_FILES) {
        window.alert(t.maxFilesReached(MAX_FILES));
        return;
      }

      if (!freshWorkbooks.length) {
        window.alert(t.duplicateFiles);
        return;
      }

      mergeImportedWorkbooks(freshWorkbooks);
    } catch {
      folderInputRef.current?.click();
    } finally {
      setImporting(false);
    }
  };

  const handleRemoveWorkbook = async (workbook: CachedWorkbook) => {
    const confirmed = window.confirm(t.removeConfirm(workbook.fileName));
    if (!confirmed) {
      return;
    }

    const nextWorkbooks = workbooks.filter((item) => item.fingerprint !== workbook.fingerprint);
    void Promise.allSettled([
      removeWorkbooksFromRepository([workbook.fingerprint]),
      persistArchiveState(nextWorkbooks),
    ]);
    setWorkbooks(nextWorkbooks);
  };

  const handleRemoveFolder = async (folderName: string, node: FileTreeNode) => {
    const workbooksToRemove = collectNodeWorkbooks(node);
    if (workbooksToRemove.length === 0) {
      return;
    }

    const fingerprints = new Set(workbooksToRemove.map((workbook) => workbook.fingerprint));
    const confirmed = window.confirm(t.removeFolderConfirm(folderName, workbooksToRemove.length));
    if (!confirmed) {
      return;
    }

    const nextWorkbooks = workbooks.filter((item) => !fingerprints.has(item.fingerprint));
    void Promise.allSettled([
      removeWorkbooksFromRepository(Array.from(fingerprints)),
      persistArchiveState(nextWorkbooks),
    ]);
    setWorkbooks(nextWorkbooks);
  };

  const copyToClipboard = async (text: string, event: MouseEvent<HTMLElement>, message: string) => {
    await navigator.clipboard.writeText(text);
    setToast({
      id: Date.now(),
      message,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleOpenExplorer = async (absolutePath: string) => {
    try {
      await openWorkbookInExplorer(absolutePath);
    } catch {
      window.alert(t.explorerFailed);
    }
  };

  const workbookMap = useMemo(
    () => new Map(workbooks.map((workbook) => [workbook.fingerprint, workbook])),
    [workbooks],
  );
  const fileTree = useMemo(() => buildFileTree(filteredWorkbooks), [filteredWorkbooks]);

  useEffect(() => {
    if (!submittedQuery || searchStartedAtRef.current === null || searchQueryRef.current !== submittedQuery) {
      return;
    }

    const memory = "memory" in performance
      ? {
          totalJsHeapSizeMb: Number((((performance as Performance & { memory: { totalJSHeapSize: number } }).memory.totalJSHeapSize) / 1024 / 1024).toFixed(2)),
          usedJsHeapSizeMb: Number((((performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize) / 1024 / 1024).toFixed(2)),
        }
      : null;

    void sendUiTelemetry("search_completed", {
      queryLength: submittedQuery.length,
      workbookCount: filteredWorkbooks.length,
      hitSheetCount: searchHits.length,
      totalMatches,
      layoutMode,
      candidateStatus: candidateState.status,
      searchStatus: searchState.status,
      searchSource: searchState.source,
      durationMs: Number((performance.now() - searchStartedAtRef.current).toFixed(2)),
      memory,
    });

    searchStartedAtRef.current = null;
  }, [candidateState.status, filteredWorkbooks.length, layoutMode, searchHits, searchState.source, searchState.status, submittedQuery, totalMatches]);
  const heroGridStyle: CSSProperties | undefined =
    syncedHeaderColumns === null
      ? undefined
      : {
          gridTemplateColumns: `${syncedHeaderColumns.sidebar}px ${syncedHeaderColumns.results}px`,
        };

  if (duplicateLaunch) {
    return (
      <div className="page-frame">
        <div className="app-shell">
          <section className="card duplicate-launch-card">
            <p className="eyebrow">{t.appTitle}</p>
            <h1>{t.launcherDuplicateTitle}</h1>
            <p className="hero-copy">{t.launcherDuplicateBody}</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-frame">
      <div className={`app-shell ${enableExpandedLayout ? "app-shell-expanded" : ""}`}>
        <header className="hero-grid" style={heroGridStyle}>
          <section className="hero-card">
            <p className="eyebrow">{t.appTitle}</p>
            <h1>{t.heroTitle}</h1>
            <p className="hero-copy">{t.heroCopy}</p>
            <div className="search-panel">
              <input
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSubmit(inputValue);
                  }
                }}
              />
              <button className="ghost-button" type="button" onClick={() => setInputValue("")}>
                {t.clear}
              </button>
              <button className="primary-button" type="button" onClick={() => handleSubmit(inputValue)}>
                {t.search}
              </button>
            </div>
            <div className="toolbar">
              <button className="secondary-button" type="button" onClick={() => void handleImport()} disabled={importing}>
                {importing ? t.importing : t.importExcel}
              </button>
              <button className="ghost-button" type="button" onClick={() => void handleImportFolder()} disabled={importing}>
                {t.importFolder}
              </button>
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept=".xls,.xlsx,.xlsm,.csv"
                multiple
                onChange={(event) => {
                  void handleBrowserFilesSelected(event.target.files);
                  event.target.value = "";
                }}
              />
              <input
                ref={folderInputRef}
                hidden
                type="file"
                multiple
                onChange={(event) => {
                  void handleBrowserFolderSelected(event.target.files);
                  event.target.value = "";
                }}
                {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
              />
              <span className="status-text">
                {loading ? t.loadingCache : t.filesLoaded(workbooks.length, MAX_FILES)}
              </span>
            </div>
            {candidates.length > 0 ? (
              <div className="sheet-jump-panel">
                <span className="sheet-jump-label">{t.searchCandidates}</span>
                <div className="sheet-jump-list">
                  {candidates.map((candidate) => (
                    <button
                      key={candidate}
                      type="button"
                      className="candidate-pill"
                      onClick={() => {
                        setInputValue(candidate);
                        handleSubmit(candidate);
                      }}
                    >
                      {candidate}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {sheetJumpTargets.length > 0 ? (
              <div className="sheet-jump-panel">
                <span className="sheet-jump-label">{t.hitSheets}</span>
                <div className="sheet-jump-list">
                  {sheetJumpTargets.map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      className="sheet-jump-pill"
                      onClick={() => setJumpToSheetId(target.id)}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
          <section className="hero-actions">
            <div className="global-toolbar">
              <label className="field-label global-language-switcher">
                <span>{t.language}</span>
                <select value={language} onChange={(event) => setLanguage(event.target.value as AppLanguage)}>
                  <option value="zh-CN">中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </label>
            </div>
            <div className="hero-summary">
              <div className="hero-summary-block">
                <span className="hero-summary-label">{t.currentLayout}</span>
                <strong>{layoutMode === "standard" ? t.standard : t.expanded}</strong>
              </div>
              <div className="hero-summary-block">
                <span className="hero-summary-label">{t.columnDisplay}</span>
                <strong>{columnMode === "all" ? t.allColumns : t.labeledColumns}</strong>
              </div>
              <div className="hero-summary-block">
                <span className="hero-summary-label">{t.activeArchive}</span>
                <strong>{activeArchive || t.none}</strong>
              </div>
              <div className="hero-summary-block">
                <span className="hero-summary-label">{t.currentKeyword}</span>
                <strong>{submittedQuery || t.notSearched}</strong>
              </div>
            </div>
          </section>
        </header>

        <main className="content-grid">
          <aside ref={sidebarRef} className="sidebar">
            <section className="card">
              <div className="section-heading">
                <h2>{t.projectArchive}</h2>
              </div>
              <div className="archive-panel">
                <div className="archive-current">
                  <span className="hero-summary-label">{t.activeArchive}</span>
                  <strong>{activeArchive || t.none}</strong>
                </div>
                <div className="archive-actions">
                  <button type="button" className="primary-button" onClick={() => void handleSaveConfig()}>
                    {t.exportConfig}
                  </button>
                  <button type="button" className="ghost-button" onClick={() => void handleLoadConfig()}>
                    {t.importConfig}
                  </button>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="section-heading">
                <h2>{t.fileManagement}</h2>
                <span>{filteredWorkbooks.length}</span>
              </div>
              <label className="field-label">
                <span>{t.fileFilter}</span>
                <input value={fileFilter} onChange={(event) => setFileFilter(event.target.value)} placeholder={t.searchPlaceholder} />
              </label>
              <div className="file-list">
                {filteredWorkbooks.length === 0 ? (
                  <p className="empty-text">{t.noFiles}</p>
                ) : (
                  <FileTreeView
                    node={fileTree}
                    depth={0}
                    onOpenLocation={(absolutePath) => void handleOpenExplorer(absolutePath)}
                    onRemove={(workbook) => void handleRemoveWorkbook(workbook)}
                    onRemoveFolder={(folderName, node) => void handleRemoveFolder(folderName, node)}
                    openLabel={t.locateFile}
                    openUnavailableLabel={t.openFolderUnavailable}
                    removeLabel={t.remove}
                    missingLabel={t.missing}
                    collapseFolderLabel={t.collapseFolder}
                    expandFolderLabel={t.expandFolder}
                  />
                )}
              </div>
            </section>

            <section className="card">
              <div className="section-heading">
                <h2>{t.searchStatus}</h2>
                <span className="section-heading-value" title={submittedQuery ? submittedQuery : t.waitingSearch}>
                  {submittedQuery ? submittedQuery : t.waitingSearch}
                </span>
              </div>
              <p className="summary-text">
                {submittedQuery ? t.matchedRows(totalMatches) : t.emptyBeforeSearch}
              </p>
            </section>
          </aside>

          <section ref={resultsRef} className="results">
            <section className="card results-toolbar">
              <div className="results-toolbar-block">
                <span className="results-toolbar-label">{t.currentLayout}</span>
                <div className="layout-mode-group" role="tablist" aria-label={t.currentLayout}>
                  <button
                    type="button"
                    className={`layout-mode-pill${layoutMode === "standard" ? " is-active" : ""}`}
                    onClick={() => setLayoutMode("standard")}
                  >
                    {t.standard}
                  </button>
                  <button
                    type="button"
                    className={`layout-mode-pill${layoutMode === "expanded" ? " is-active" : ""}`}
                    onClick={() => setLayoutMode("expanded")}
                  >
                    {t.expanded}
                  </button>
                </div>
              </div>
              <div className="results-toolbar-block">
                <span className="results-toolbar-label">{t.columnDisplay}</span>
                <div className="layout-mode-group" role="tablist" aria-label={t.columnDisplay}>
                  <button
                    type="button"
                    className={`layout-mode-pill${columnMode === "all" ? " is-active" : ""}`}
                    onClick={() => setColumnMode("all")}
                  >
                    {t.allColumns}
                  </button>
                  <button
                    type="button"
                    className={`layout-mode-pill${columnMode === "labeled" ? " is-active" : ""}`}
                    onClick={() => setColumnMode("labeled")}
                  >
                    {t.labeledColumns}
                  </button>
                </div>
              </div>
              <div className="results-toolbar-block">
                <span className="results-toolbar-label">{t.totalMatches(totalMatches)}</span>
              </div>
            </section>
            {!submittedQuery ? (
              <div className="empty-state">{t.emptyBeforeSearch}</div>
            ) : searchHits.length === 0 ? (
              <div className="empty-state">{t.emptyNoResults}</div>
            ) : (
              <VirtualSheetList
                items={searchHits}
                itemKey={(hit) => hit.sheetId}
                jumpToKey={jumpToSheetId}
                renderItem={(hit) => {
                  const workbook = workbookMap.get(hit.fingerprint);
                  const maxHeaderDepth = Math.max(1, hit.allRows.length);
                  const defaultHeaderDepth = workbook?.headerDepth ?? hit.defaultHeaderDepth;
                  const selectedHeaderDepth = Math.min(
                    Math.max(headerDepthMap[hit.sheetId] ?? defaultHeaderDepth, 1),
                    maxHeaderDepth,
                  );
                  const headerRows = getHeaderRows(hit.allRows, selectedHeaderDepth);
                  const headerRowNumbers = new Set(headerRows.map((row) => row.rowNumber));
                  const visibleRows = hit.rows.filter((row) => !headerRowNumbers.has(row.rowNumber));
                  const sheetHeaderFilterMap = headerColumnFilterMap[hit.sheetId] ?? {};
                  const rowFilterOptions = new Map<number, HeaderFilterOption[]>();

                  headerRows.forEach((row) => {
                    const options = getRenderableCells(row.cells)
                      .filter(({ cell }) => cell.value.trim() !== "")
                      .map(({ cell, index }) => ({
                        key: `${row.rowNumber}:${index}`,
                        label: cell.value,
                        columns: Array.from({ length: cell.colSpan }, (_, offset) => index + offset),
                      }));

                    rowFilterOptions.set(row.rowNumber, options);
                  });

                  const activeFilterRow = headerRows.find(
                    (row) => (sheetHeaderFilterMap[row.rowNumber] ?? []).length > 0,
                  )?.rowNumber;

                  const visibleColumns =
                    activeFilterRow !== undefined
                      ? new Set(
                          (sheetHeaderFilterMap[activeFilterRow] ?? []).flatMap((filterKey) => {
                            const option = rowFilterOptions.get(activeFilterRow)?.find((item) => item.key === filterKey);
                            return option?.columns ?? [];
                          }),
                        )
                      : columnMode === "labeled"
                        ? buildVisibleColumnSet(headerRows, hit.columnCount)
                        : new Set(Array.from({ length: hit.columnCount }, (_, index) => index));

                  const visibleColumnIndexes = Array.from(visibleColumns).sort((a, b) => a - b);
                  const headerCellMap = buildSectionRowCells(hit.allRows, headerRows, visibleColumns);
                  const bodyCellMap = buildSectionRowCells(hit.allRows, visibleRows, visibleColumns);

                  return (
                    <section key={`${hit.fingerprint}-${hit.sheetId}`} className="sheet-box" id={hit.sheetId}>
                      <div className="sheet-header">
                        <button
                          type="button"
                          className="ghost-button compact-button sheet-locate-button"
                          onClick={() => void handleOpenExplorer(hit.absolutePath)}
                          disabled={hit.absolutePath === hit.fileName}
                          title={hit.absolutePath === hit.fileName ? t.openFolderUnavailable : hit.absolutePath}
                        >
                          {hit.absolutePath === hit.fileName ? t.openFolderUnavailable : t.locateFile}
                        </button>
                        <div className="sheet-headline">
                          <div className="sheet-title-group">
                            <div>
                              <p className="sheet-title">
                                [{hit.fileName}] - [{hit.sheetName}]
                              </p>
                              <p className="sheet-meta">{visibleRows.length > 0 ? t.hitCountRows(visibleRows.length) : t.headerOnly}</p>
                            </div>
                          </div>
                          <div className="sheet-actions">
                            {hit.missing ? <span className="file-status-badge is-missing">{t.missing}</span> : null}
                          </div>
                          <label className="header-row-control">
                            <span>{t.headerDepth}</span>
                            <div className="header-stepper">
                              <button
                                type="button"
                                className="stepper-button"
                                onClick={() =>
                                  setHeaderDepthMap((current) => ({
                                    ...current,
                                    [hit.sheetId]: Math.max(selectedHeaderDepth - 1, 1),
                                  }))
                                }
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={maxHeaderDepth}
                                value={selectedHeaderDepth}
                                onChange={(event) => {
                                  const nextValue = Number.parseInt(event.target.value, 10);
                                  setHeaderDepthMap((current) => ({
                                    ...current,
                                    [hit.sheetId]: Number.isNaN(nextValue)
                                      ? defaultHeaderDepth
                                      : Math.min(Math.max(nextValue, 1), maxHeaderDepth),
                                  }));
                                }}
                              />
                              <button
                                type="button"
                                className="stepper-button"
                                onClick={() =>
                                  setHeaderDepthMap((current) => ({
                                    ...current,
                                    [hit.sheetId]: Math.min(selectedHeaderDepth + 1, maxHeaderDepth),
                                  }))
                                }
                              >
                                +
                              </button>
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="header-filter-panel">
                        {headerRows.map((row) => {
                          const options = rowFilterOptions.get(row.rowNumber) ?? [];
                          const selectedKeys = sheetHeaderFilterMap[row.rowNumber] ?? [];
                          const rowDisabled = activeFilterRow !== undefined && activeFilterRow !== row.rowNumber;

                          return (
                            <div key={`${hit.sheetId}-filter-row-${row.rowNumber}`} className="header-filter-row">
                              <span className="header-filter-title">{t.headerRowLabel(row.rowNumber)}</span>
                              <div className="header-filter-tags">
                                <button
                                  type="button"
                                  className={`filter-tag${selectedKeys.length === 0 ? " is-active" : ""}`}
                                  onClick={() =>
                                    setHeaderColumnFilterMap((current) => ({
                                      ...current,
                                      [hit.sheetId]: {
                                        ...(current[hit.sheetId] ?? {}),
                                        [row.rowNumber]: [],
                                      },
                                    }))
                                  }
                                  disabled={rowDisabled}
                                >
                                  {t.all}
                                </button>
                                {options.map((option) => {
                                  const isActive = selectedKeys.includes(option.key);
                                  return (
                                    <button
                                      key={option.key}
                                      type="button"
                                      className={`filter-tag${isActive ? " is-active" : ""}`}
                                      disabled={rowDisabled}
                                      onClick={() =>
                                        setHeaderColumnFilterMap((current) => {
                                          const currentSheetMap = current[hit.sheetId] ?? {};
                                          const currentRowKeys = currentSheetMap[row.rowNumber] ?? [];
                                          const nextRowKeys = currentRowKeys.includes(option.key)
                                            ? currentRowKeys.filter((item) => item !== option.key)
                                            : [...currentRowKeys, option.key];

                                          return {
                                            ...current,
                                            [hit.sheetId]: {
                                              [row.rowNumber]: nextRowKeys,
                                            },
                                          };
                                        })
                                      }
                                    >
                                      {option.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th className="row-number sticky-header-cell sticky-left">#</th>
                              {visibleColumnIndexes.map((index) => (
                                <th key={`${hit.sheetId}-column-label-${index}`} className="sticky-header-cell excel-column-header">
                                  {toExcelColumnLabel(index)}
                                </th>
                              ))}
                            </tr>
                            {headerRows.map((row) => (
                              <tr key={`${hit.sheetId}-header-row-${row.rowNumber}`}>
                                <th className="row-number sticky-header-cell sticky-left">
                                  <button
                                    type="button"
                                    className="row-copy-button"
                                    onClick={(event) => void copyToClipboard(row.joined, event, t.copiedRow(row.rowNumber))}
                                  >
                                    {row.rowNumber}
                                  </button>
                                </th>
                                {(headerCellMap.get(row.rowNumber) ?? []).map(({ cell, index }) => (
                                  <th
                                    key={`${hit.sheetId}-header-cell-${row.rowNumber}-${index}`}
                                    className={`sticky-header-cell header-cell${cell.isMerged ? " merged-cell" : ""}`}
                                    colSpan={cell.colSpan}
                                    rowSpan={cell.rowSpan}
                                  >
                                    <button
                                      type="button"
                                      className={`cell-button header-cell-button${cell.isMerged ? " merged-cell-button" : ""}`}
                                      onClick={(event) => void copyToClipboard(cell.value, event, t.copiedHeaderCell)}
                                    >
                                      {cell.value}
                                    </button>
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody>
                            {visibleRows.map((row) => (
                              <tr key={`${hit.sheetId}-${row.rowNumber}`}>
                                <td className="row-number sticky-left body-index-cell">
                                  <button
                                    type="button"
                                    className="row-copy-button"
                                    onClick={(event) => void copyToClipboard(row.joined, event, t.copiedRow(row.rowNumber))}
                                  >
                                    {row.rowNumber}
                                  </button>
                                </td>
                                {(bodyCellMap.get(row.rowNumber) ?? []).map(({ cell, index }) => (
                                  <td
                                    key={`${hit.sheetId}-${row.rowNumber}-${index}`}
                                    className={cell.isMerged ? "merged-cell" : undefined}
                                    colSpan={cell.colSpan}
                                    rowSpan={cell.rowSpan}
                                  >
                                    <button
                                      type="button"
                                      className={`cell-button${cell.isMerged ? " merged-cell-button" : ""}`}
                                      onClick={(event) => void copyToClipboard(cell.value, event, t.copiedCell)}
                                    >
                                      {highlightText(cell.value, submittedQuery)}
                                    </button>
                                  </td>
                                ))}
                              </tr>
                            ))}
                            {visibleRows.length === 0 ? (
                              <tr>
                                <td colSpan={visibleColumnIndexes.length + 1} className="sheet-empty-cell">
                                  {t.emptyNoResults}
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  );
                }}
              />
            )}
          </section>
        </main>

        {showBackToTop ? (
          <button
            type="button"
            className="back-to-top-button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {t.backToTop}
          </button>
        ) : null}

        {toast ? (
          <div className="toast" style={{ left: toast.x + 12, top: toast.y + 12 }}>
            {toast.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
