import { type CSSProperties, type ChangeEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import { buildFingerprint, parseExcelFile } from "./lib/excel";
import { deleteCachedWorkbook, getAllCachedWorkbooks, saveCachedWorkbook } from "./lib/indexedDb";
import { buildCandidates, searchWorkbooks } from "./lib/search";
import type { CachedWorkbook, CellRecord, RowRecord, SearchHit, ToastState } from "./types";

const MAX_FILES = 20;
const LANGUAGE_STORAGE_KEY = "excel-strict-searcher-language";

const messages = {
  zh: {
    appName: "Excel Strict Searcher",
    activatedTitle: "Excel Strict Searcher - 已激活",
    closeWarning: "关闭页面会同时结束本地服务。",
    maxFilesAlert: `最多同时保留 ${MAX_FILES} 个文件。`,
    duplicateFilesAlert: "这些文件已经导入过了。",
    removeWorkbook: (fileName: string) => `确认移除 ${fileName} 吗？这只会删除工具内缓存，不会修改原文件。`,
    copyRow: (rowNumber: number) => `已复制第 ${rowNumber} 行`,
    copyHeaderCell: "已复制表头单元格",
    copyCell: "已复制单元格",
    sheetJumpLabel: "命中 Sheet",
    sheetJumpTarget: (sheetName: string, rowCount: number) => `${sheetName} · ${rowCount} 行`,
    duplicateLaunchTitle: "页面已在其他窗口打开",
    duplicateLaunchCopy: "已经尝试激活现有页面。请回到已打开的标签页继续使用，并关闭当前这个重复页面。",
    heroTitle: "本地 Excel 严格搜索",
    heroCopy: "只做严格子串匹配，只读检索，多文件多 Sheet 并行展示，缓存留在本地。",
    searchPlaceholder: "输入连续字符串，例如 aabb",
    clear: "清空",
    search: "搜索",
    importing: "导入中...",
    importExcel: "导入 Excel",
    loadingCache: "加载缓存中...",
    loadedFiles: (count: number) => `已载入 ${count} / ${MAX_FILES} 个文件`,
    currentLayout: "当前布局",
    standard: "标准",
    expanded: "扩展",
    currentColumns: "列显示",
    allColumns: "全部列",
    labeledColumns: "仅标签列",
    currentKeyword: "当前关键词",
    notSearched: "未搜索",
    fileManagement: "文件管理",
    fileCount: (count: number) => `${count} 个文件`,
    noCachedFiles: "还没有缓存文件，先导入 Excel。",
    delete: "删除",
    searchStatus: "检索状态",
    waitingSearch: "等待搜索",
    keywordLabel: (query: string) => `关键词: ${query}`,
    searchSummary: (count: number) => `共命中 ${count} 行。`,
    searchHint: "输入候选词后按 Enter 或点击搜索。",
    layoutMode: "布局模式",
    columnDisplay: "列显示",
    searchStartHint: "输入关键字后开始严格检索，结果会按文件和 Sheet 分组展示。",
    searchNoResult: "未找到结果，请调整搜索词后重试。",
    hitRows: (count: number) => `${count} 行命中`,
    headerOnly: "仅显示表头行",
    headerDepth: "表头层数",
    headerLabelColumns: (rowNumber: number) => `第${rowNumber}行标签列`,
    all: "全部",
    rowNumber: "行号",
    noResult: "未找到结果",
    backToTop: "回到顶部",
    language: "语言",
    loading: "加载中",
  },
  en: {
    appName: "Excel Strict Searcher",
    activatedTitle: "Excel Strict Searcher - Activated",
    closeWarning: "Closing this page will also stop the local service.",
    maxFilesAlert: `You can keep up to ${MAX_FILES} files at the same time.`,
    duplicateFilesAlert: "These files have already been imported.",
    removeWorkbook: (fileName: string) =>
      `Remove ${fileName}? This only clears the tool cache and will not modify the source file.`,
    copyRow: (rowNumber: number) => `Copied row ${rowNumber}`,
    copyHeaderCell: "Copied header cell",
    copyCell: "Copied cell",
    sheetJumpLabel: "Matched Sheets",
    sheetJumpTarget: (sheetName: string, rowCount: number) => `${sheetName} · ${rowCount} rows`,
    duplicateLaunchTitle: "This page is already open in another window",
    duplicateLaunchCopy:
      "The existing page has been activated. Return to the already opened tab and close this duplicate page.",
    heroTitle: "Local Excel Strict Search",
    heroCopy: "Strict substring matching only, read-only search, multi-file multi-sheet view, cache kept locally.",
    searchPlaceholder: "Enter a continuous string, for example aabb",
    clear: "Clear",
    search: "Search",
    importing: "Importing...",
    importExcel: "Import Excel",
    loadingCache: "Loading cache...",
    loadedFiles: (count: number) => `Loaded ${count} / ${MAX_FILES} files`,
    currentLayout: "Layout",
    standard: "Standard",
    expanded: "Expanded",
    currentColumns: "Columns",
    allColumns: "All Columns",
    labeledColumns: "Labeled Only",
    currentKeyword: "Keyword",
    notSearched: "Not searched",
    fileManagement: "Files",
    fileCount: (count: number) => `${count} files`,
    noCachedFiles: "No cached files yet. Import Excel files first.",
    delete: "Delete",
    searchStatus: "Search Status",
    waitingSearch: "Waiting",
    keywordLabel: (query: string) => `Keyword: ${query}`,
    searchSummary: (count: number) => `${count} matched rows.`,
    searchHint: "Enter a candidate and press Enter or click Search.",
    layoutMode: "Layout Mode",
    columnDisplay: "Column Display",
    searchStartHint: "Enter a keyword to start strict search. Results are grouped by file and sheet.",
    searchNoResult: "No results found. Adjust the keyword and try again.",
    hitRows: (count: number) => `${count} matched rows`,
    headerOnly: "Header rows only",
    headerDepth: "Header Depth",
    headerLabelColumns: (rowNumber: number) => `Row ${rowNumber} label columns`,
    all: "All",
    rowNumber: "Row",
    noResult: "No results found",
    backToTop: "Back to Top",
    language: "Language",
    loading: "Loading",
  },
  ja: {
    appName: "Excel Strict Searcher",
    activatedTitle: "Excel Strict Searcher - アクティブ化済み",
    closeWarning: "このページを閉じるとローカルサービスも終了します。",
    maxFilesAlert: `同時に保持できるファイルは最大 ${MAX_FILES} 件です。`,
    duplicateFilesAlert: "これらのファイルはすでに取り込み済みです。",
    removeWorkbook: (fileName: string) =>
      `${fileName} を削除しますか？ ツール内キャッシュのみ削除し、元ファイルは変更しません。`,
    copyRow: (rowNumber: number) => `${rowNumber} 行目をコピーしました`,
    copyHeaderCell: "ヘッダーセルをコピーしました",
    copyCell: "セルをコピーしました",
    sheetJumpLabel: "一致したシート",
    sheetJumpTarget: (sheetName: string, rowCount: number) => `${sheetName} · ${rowCount} 行`,
    duplicateLaunchTitle: "このページは別のウィンドウで開かれています",
    duplicateLaunchCopy:
      "既存のページをアクティブにしました。開いているタブに戻り、この重複ページを閉じてください。",
    heroTitle: "ローカル Excel 厳密検索",
    heroCopy: "厳密な部分一致のみ、読み取り専用検索、複数ファイル・複数シートを同時表示、キャッシュはローカル保持。",
    searchPlaceholder: "連続した文字列を入力してください。例: aabb",
    clear: "クリア",
    search: "検索",
    importing: "取り込み中...",
    importExcel: "Excel を取り込む",
    loadingCache: "キャッシュを読み込み中...",
    loadedFiles: (count: number) => `${count} / ${MAX_FILES} 件のファイルを読み込み済み`,
    currentLayout: "レイアウト",
    standard: "標準",
    expanded: "拡張",
    currentColumns: "列表示",
    allColumns: "全列",
    labeledColumns: "ラベル列のみ",
    currentKeyword: "キーワード",
    notSearched: "未検索",
    fileManagement: "ファイル管理",
    fileCount: (count: number) => `${count} 件のファイル`,
    noCachedFiles: "キャッシュされたファイルはありません。先に Excel を取り込んでください。",
    delete: "削除",
    searchStatus: "検索状態",
    waitingSearch: "検索待ち",
    keywordLabel: (query: string) => `キーワード: ${query}`,
    searchSummary: (count: number) => `一致した行は ${count} 件です。`,
    searchHint: "候補語を入力して Enter を押すか、検索をクリックしてください。",
    layoutMode: "レイアウトモード",
    columnDisplay: "列表示",
    searchStartHint: "キーワードを入力すると厳密検索を開始します。結果はファイルとシートごとに表示されます。",
    searchNoResult: "結果が見つかりません。検索語を調整して再試行してください。",
    hitRows: (count: number) => `${count} 行一致`,
    headerOnly: "ヘッダー行のみ表示",
    headerDepth: "ヘッダー段数",
    headerLabelColumns: (rowNumber: number) => `${rowNumber} 行目のラベル列`,
    all: "すべて",
    rowNumber: "行",
    noResult: "結果が見つかりません",
    backToTop: "上に戻る",
    language: "言語",
    loading: "読み込み中",
  },
} as const;

type Language = keyof typeof messages;

const toExcelColumnLabel = (index: number): string => {
  let current = index + 1;
  let label = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }

  return label;
};

const getHeaderRows = (rows: RowRecord[], headerDepth: number): RowRecord[] => rows.slice(0, headerDepth);

const getRenderableCells = (cells: CellRecord[]): Array<{ cell: CellRecord; index: number }> =>
  cells
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => !cell.hidden);

type HeaderFilterOption = {
  key: string;
  label: string;
  columns: number[];
};

const buildVisibleColumnSet = (headerRows: RowRecord[], columnCount: number): Set<number> => {
  const visibleColumns = new Set<number>();

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const hasHeaderValue = headerRows.some((row) => row.cells[columnIndex]?.value.trim());
    if (hasHeaderValue) {
      visibleColumns.add(columnIndex);
    }
  }

  if (visibleColumns.size === 0) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      visibleColumns.add(columnIndex);
    }
  }

  return visibleColumns;
};

const formatFileMeta = (workbook: CachedWorkbook): string => {
  const sizeInMb = (workbook.fileSize / 1024 / 1024).toFixed(2);
  return `${sizeInMb} MB`;
};

const highlightText = (value: string, query: string) => {
  if (!query || !value.includes(query)) {
    return value;
  }

  const segments: Array<string | { match: string }> = [];
  let cursor = 0;

  while (cursor < value.length) {
    const next = value.indexOf(query, cursor);
    if (next === -1) {
      segments.push(value.slice(cursor));
      break;
    }

    if (next > cursor) {
      segments.push(value.slice(cursor, next));
    }

    segments.push({ match: value.slice(next, next + query.length) });
    cursor = next + query.length;
  }

  return segments.map((segment, index) =>
    typeof segment === "string" ? (
      <span key={index}>{segment}</span>
    ) : (
      <mark key={index}>{segment.match}</mark>
    ),
  );
};

const buildSectionRowCells = (
  allRows: RowRecord[],
  visibleRows: RowRecord[],
  visibleColumns: Set<number>,
): Map<number, Array<{ cell: CellRecord; index: number }>> => {
  const allRowsByNumber = new Map(allRows.map((row) => [row.rowNumber, row]));
  const sectionCellMap = new Map<number, Array<{ cell: CellRecord; index: number }>>();
  const visibleRowNumbers = visibleRows.map((row) => row.rowNumber);

  visibleRows.forEach((row) => {
    const renderedCells: Array<{ cell: CellRecord; index: number }> = [];

    getRenderableCells(row.cells).forEach(({ cell, index }) => {
      const rootRow = allRowsByNumber.get(cell.rootRow);
      const rootCell = rootRow?.cells[cell.rootCol] ?? cell;
      const mergeColumns = Array.from({ length: rootCell.colSpan }, (_, offset) => rootCell.rootCol + offset);
      const selectedColumns = mergeColumns.filter((columnIndex) => visibleColumns.has(columnIndex));

      if (selectedColumns.length === 0) {
        return;
      }

      const visibleMergeRows = visibleRowNumbers.filter(
        (rowNumber) => rowNumber >= rootCell.rootRow && rowNumber < rootCell.rootRow + rootCell.rowSpan,
      );
      const firstVisibleMergeRow = visibleMergeRows[0];

      if (row.rowNumber !== firstVisibleMergeRow || index !== rootCell.rootCol) {
        return;
      }

      renderedCells.push({
        index: rootCell.rootCol,
        cell: {
          ...rootCell,
          hidden: false,
          colSpan: selectedColumns.length,
          rowSpan: visibleMergeRows.length,
        },
      });
    });

    sectionCellMap.set(row.rowNumber, renderedCells);
  });

  return sectionCellMap;
};

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" || stored === "ja" || stored === "zh" ? stored : "zh";
  });
  const [workbooks, setWorkbooks] = useState<CachedWorkbook[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [headerDepthMap, setHeaderDepthMap] = useState<Record<string, number>>({});
  const [headerColumnFilterMap, setHeaderColumnFilterMap] = useState<Record<string, Record<number, string[]>>>({});
  const [layoutMode, setLayoutMode] = useState<"standard" | "expanded">("standard");
  const [columnMode, setColumnMode] = useState<"all" | "labeled">("all");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [duplicateLaunch, setDuplicateLaunch] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const [syncedHeaderColumns, setSyncedHeaderColumns] = useState<{ sidebar: number; results: number } | null>(null);
  const t = messages[language];

  useEffect(() => {
    void (async () => {
      const cached = await getAllCachedWorkbooks();
      cached.sort((a, b) => b.importedAt - a.importedAt);
      setWorkbooks(cached);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 1400);
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
  }, [layoutMode, submittedQuery, workbooks.length]);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

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
      document.title = t.activatedTitle;
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
      event.returnValue = t.closeWarning;
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
  }, [t.activatedTitle, t.closeWarning]);

  const candidates = buildCandidates(workbooks, inputValue);
  const searchHits: SearchHit[] = searchWorkbooks(workbooks, submittedQuery);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (query: string) => {
    setSubmittedQuery(query.trim());
  };

  const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    const knownFingerprints = new Set(workbooks.map((item) => item.fingerprint));
    const freshFiles = files.filter((file) => !knownFingerprints.has(buildFingerprint(file)));

    if (workbooks.length + freshFiles.length > MAX_FILES) {
      window.alert(t.maxFilesAlert);
      return;
    }

    if (!freshFiles.length) {
      window.alert(t.duplicateFilesAlert);
      return;
    }

    setImporting(true);

    try {
      const parsedWorkbooks = await Promise.all(freshFiles.map((file) => parseExcelFile(file)));
      await Promise.all(parsedWorkbooks.map((workbook) => saveCachedWorkbook(workbook)));
      setWorkbooks((current) => [...parsedWorkbooks, ...current].sort((a, b) => b.importedAt - a.importedAt));
    } finally {
      setImporting(false);
    }
  };

  const handleRemoveWorkbook = async (workbook: CachedWorkbook) => {
    const confirmed = window.confirm(t.removeWorkbook(workbook.fileName));
    if (!confirmed) {
      return;
    }

    await deleteCachedWorkbook(workbook.fingerprint);
    setWorkbooks((current) => current.filter((item) => item.fingerprint !== workbook.fingerprint));
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

  const totalMatches = searchHits.reduce((count, hit) => count + hit.rows.length, 0);
  const sheetJumpTargets = searchHits.map((hit) => ({
    id: hit.sheetId,
    label: t.sheetJumpTarget(hit.sheetName, hit.rows.length),
  }));
  const enableExpandedLayout = layoutMode === "expanded" && submittedQuery !== "" && searchHits.length > 0;
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
            <p className="eyebrow">Excel Strict Searcher</p>
            <h1>{t.duplicateLaunchTitle}</h1>
            <p className="hero-copy">{t.duplicateLaunchCopy}</p>
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
            <p className="eyebrow">Excel Strict Searcher</p>
            <div className="language-switcher">
              <span className="language-label">{t.language}</span>
              <div className="layout-mode-group" role="tablist" aria-label={t.language}>
                {(["zh", "en", "ja"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`layout-mode-pill${language === lang ? " is-active" : ""}`}
                    onClick={() => setLanguage(lang)}
                  >
                    {lang === "zh" ? "中文" : lang === "en" ? "English" : "日本語"}
                  </button>
                ))}
              </div>
            </div>
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
              <button className="secondary-button" type="button" onClick={handleImportClick} disabled={importing}>
                {importing ? t.importing : t.importExcel}
              </button>
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept=".xls,.xlsx,.xlsm,.csv"
                multiple
                onChange={handleFilesSelected}
              />
              <span className="status-text">
                {loading ? t.loadingCache : t.loadedFiles(workbooks.length)}
              </span>
            </div>
            {candidates.length > 0 ? (
              <div className="candidate-list">
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
            ) : null}
            {sheetJumpTargets.length > 0 ? (
              <div className="sheet-jump-panel">
                <span className="sheet-jump-label">{t.sheetJumpLabel}</span>
                <div className="sheet-jump-list">
                  {sheetJumpTargets.map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      className="sheet-jump-pill"
                      onClick={() =>
                        document.getElementById(target.id)?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
          <section className="hero-actions">
            <div className="hero-summary">
              <div className="hero-summary-block">
                <span className="hero-summary-label">{t.currentLayout}</span>
                <strong>{layoutMode === "standard" ? t.standard : t.expanded}</strong>
              </div>
              <div className="hero-summary-block">
                <span className="hero-summary-label">{t.currentColumns}</span>
                <strong>{columnMode === "all" ? t.allColumns : t.labeledColumns}</strong>
              </div>
              <div className="hero-summary-block">
                <span className="hero-summary-label">{t.fileManagement}</span>
                <strong>
                  {loading ? t.loading : `${workbooks.length} / ${MAX_FILES}`}
                </strong>
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
                <h2>{t.fileManagement}</h2>
                <span>{t.fileCount(workbooks.length)}</span>
              </div>
              <div className="file-list">
                {workbooks.length === 0 ? (
                  <p className="empty-text">{t.noCachedFiles}</p>
                ) : (
                  workbooks.map((workbook) => (
                    <article key={workbook.fingerprint} className="file-item">
                      <div>
                        <strong>{workbook.fileName}</strong>
                        <p>{formatFileMeta(workbook)}</p>
                      </div>
                      <button type="button" className="danger-link" onClick={() => void handleRemoveWorkbook(workbook)}>
                        {t.delete}
                      </button>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="card">
              <div className="section-heading">
                <h2>{t.searchStatus}</h2>
                <span>{submittedQuery ? t.keywordLabel(submittedQuery) : t.waitingSearch}</span>
              </div>
              <p className="summary-text">
                {submittedQuery ? t.searchSummary(totalMatches) : t.searchHint}
              </p>
            </section>
          </aside>

          <section ref={resultsRef} className="results">
            <section className="card results-toolbar">
              <div className="results-toolbar-block">
                <span className="results-toolbar-label">{t.layoutMode}</span>
                <div className="layout-mode-group" role="tablist" aria-label={t.layoutMode}>
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
            </section>
            {!submittedQuery ? (
              <div className="empty-state">{t.searchStartHint}</div>
            ) : searchHits.length === 0 ? (
              <div className="empty-state">{t.searchNoResult}</div>
            ) : (
              searchHits.map((hit) => {
                const maxHeaderDepth = Math.max(1, hit.allRows.length);
                const selectedHeaderDepth = Math.min(
                  Math.max(headerDepthMap[hit.sheetId] ?? hit.defaultHeaderDepth, 1),
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
                      <div className="sheet-headline">
                        <div>
                          <p className="sheet-title">
                            [{hit.fileName}] - [{hit.sheetName}]
                          </p>
                          <p className="sheet-meta">{visibleRows.length > 0 ? t.hitRows(visibleRows.length) : t.headerOnly}</p>
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
                                    ? hit.defaultHeaderDepth
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
                            <span className="header-filter-title">{t.headerLabelColumns(row.rowNumber)}</span>
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
                            <th className="row-number sticky-header-cell sticky-left">{t.rowNumber}</th>
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
                                  onClick={(event) => void copyToClipboard(row.joined, event, t.copyRow(row.rowNumber))}
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
                                  onClick={(event) => void copyToClipboard(cell.value, event, t.copyHeaderCell)}
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
                                  onClick={(event) => void copyToClipboard(row.joined, event, t.copyRow(row.rowNumber))}
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
                                  onClick={(event) => void copyToClipboard(cell.value, event, t.copyCell)}
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
                                {t.noResult}
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })
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
