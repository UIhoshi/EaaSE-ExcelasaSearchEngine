import type { AppLanguage } from "../types";

type Dictionary = {
  appTitle: string;
  heroTitle: string;
  heroCopy: string;
  searchPlaceholder: string;
  clear: string;
  search: string;
  importing: string;
  importExcel: string;
  importFolder: string;
  loadingCache: string;
  filesLoaded: (count: number, max: number) => string;
  currentLayout: string;
  columnDisplay: string;
  allColumns: string;
  labeledColumns: string;
  standard: string;
  expanded: string;
  currentKeyword: string;
  notSearched: string;
  fileManagement: string;
  searchStatus: string;
  waitingSearch: string;
  noFiles: string;
  hitSheets: string;
  matchedRows: (count: number) => string;
  headerOnly: string;
  loadConfig: string;
  saveConfig: string;
  importConfig: string;
  exportConfig: string;
  configName: string;
  projectArchive: string;
  archivePlaceholder: string;
  activeArchive: string;
  none: string;
  language: string;
  pickFiles: string;
  openFolder: string;
  openFolderUnavailable: string;
  locateFile: string;
  missing: string;
  available: string;
  remove: string;
  copiedHeaderCell: string;
  copiedCell: string;
  copiedRow: (rowNumber: number) => string;
  emptyBeforeSearch: string;
  emptyNoResults: string;
  totalMatches: (count: number) => string;
  hitCountRows: (count: number) => string;
  headerDepth: string;
  headerRowLabel: (rowNumber: number) => string;
  all: string;
  searchCandidates: string;
  backToTop: string;
  configSaved: string;
  configLoaded: string;
  configSaveFailed: string;
  configLoadFailed: string;
  importFailed: string;
  explorerFailed: string;
  maxFilesReached: (max: number) => string;
  duplicateFiles: string;
  removeConfirm: (fileName: string) => string;
  removeFolderConfirm: (folderName: string, count: number) => string;
  launcherDuplicateTitle: string;
  launcherDuplicateBody: string;
  fileFilter: string;
  collapseFolder: string;
  expandFolder: string;
};

const dictionaries: Record<AppLanguage, Dictionary> = {
  "zh-CN": {
    appTitle: "Excel Strict Searcher",
    heroTitle: "Excel搜索引擎",
    heroCopy: "只做严格子串匹配，只读检索，多文件多 Sheet 并行展示，配置和路径都留在本地。",
    searchPlaceholder: "输入连续字符串，例如 aabb",
    clear: "清空",
    search: "搜索",
    importing: "导入中...",
    importExcel: "导入 Excel",
    importFolder: "导入文件夹",
    loadingCache: "加载档案中...",
    filesLoaded: (count, max) => `已载入 ${count} / ${max} 个文件`,
    currentLayout: "当前布局",
    columnDisplay: "列显示",
    allColumns: "全部列",
    labeledColumns: "仅标签列",
    standard: "标准",
    expanded: "扩展",
    currentKeyword: "当前关键词",
    notSearched: "未搜索",
    fileManagement: "文件管理",
    searchStatus: "检索状态",
    waitingSearch: "等待搜索",
    noFiles: "还没有载入文件，先导入 Excel 或加载项目档案。",
    hitSheets: "命中 Sheet",
    matchedRows: (count) => `共命中 ${count} 行。`,
    headerOnly: "仅显示表头行",
    loadConfig: "载入档案",
    saveConfig: "保存档案",
    importConfig: "导入配置",
    exportConfig: "导出配置",
    configName: "档案名称",
    projectArchive: "配置导入 / 导出",
    archivePlaceholder: "例如 Audit_Project_A",
    activeArchive: "当前配置",
    none: "无",
    language: "界面语言",
    pickFiles: "选择文件",
    openFolder: "打开文件夹",
    openFolderUnavailable: "网页导入无本地路径",
    locateFile: "定位",
    missing: "文件缺失",
    available: "可用",
    remove: "删除",
    copiedHeaderCell: "已复制表头单元格",
    copiedCell: "已复制单元格",
    copiedRow: (rowNumber) => `已复制第 ${rowNumber} 行`,
    emptyBeforeSearch: "输入关键字后开始严格检索，结果会按文件和 Sheet 分组展示。",
    emptyNoResults: "未找到结果，请调整搜索词后重试。",
    totalMatches: (count) => `总命中 ${count} 行`,
    hitCountRows: (count) => `${count} 行命中`,
    headerDepth: "表头层数",
    headerRowLabel: (rowNumber) => `第${rowNumber}行标签列`,
    all: "全部",
    searchCandidates: "候选词",
    backToTop: "回到顶部",
    configSaved: "项目档案已保存",
    configLoaded: "项目档案已载入",
    configSaveFailed: "保存档案失败",
    configLoadFailed: "载入档案失败",
    importFailed: "导入文件失败",
    explorerFailed: "打开文件夹失败",
    maxFilesReached: (max) => `最多同时保留 ${max} 个文件。`,
    duplicateFiles: "这些文件已经导入过了。",
    removeConfirm: (fileName) => `确认移除 ${fileName} 吗？这只会从当前会话移除，不会修改原文件。`,
    removeFolderConfirm: (folderName, count) =>
      `确认移除文件夹 ${folderName} 吗？这会从当前会话移除其中的 ${count} 个文件，不会修改原文件。`,
    launcherDuplicateTitle: "页面已在其他窗口打开",
    launcherDuplicateBody: "已经尝试激活现有页面。请回到已打开的标签页继续使用，并关闭当前这个重复页面。",
    fileFilter: "文件筛选",
    collapseFolder: "收起文件夹",
    expandFolder: "展开文件夹",
  },
  "en-US": {
    appTitle: "Excel Strict Searcher",
    heroTitle: "Local Excel Strict Search",
    heroCopy: "Strict substring matching only, read-only inspection, multi-file multi-sheet search, with local paths and project archives.",
    searchPlaceholder: "Type a continuous string, e.g. aabb",
    clear: "Clear",
    search: "Search",
    importing: "Importing...",
    importExcel: "Import Excel",
    importFolder: "Import Folder",
    loadingCache: "Loading archive...",
    filesLoaded: (count, max) => `${count} / ${max} files loaded`,
    currentLayout: "Layout",
    columnDisplay: "Columns",
    allColumns: "All columns",
    labeledColumns: "Labeled only",
    standard: "Standard",
    expanded: "Expanded",
    currentKeyword: "Keyword",
    notSearched: "Not searched",
    fileManagement: "Files",
    searchStatus: "Search status",
    waitingSearch: "Waiting",
    noFiles: "No files loaded yet. Import Excel files or load a project archive first.",
    hitSheets: "Matched sheets",
    matchedRows: (count) => `${count} matched rows.`,
    headerOnly: "Header rows only",
    loadConfig: "Load archive",
    saveConfig: "Save archive",
    importConfig: "Import config",
    exportConfig: "Export config",
    configName: "Archive name",
    projectArchive: "Config Import / Export",
    archivePlaceholder: "For example Audit_Project_A",
    activeArchive: "Active config",
    none: "None",
    language: "Language",
    pickFiles: "Pick files",
    openFolder: "Open folder",
    openFolderUnavailable: "No local path in web mode",
    locateFile: "Locate",
    missing: "Missing",
    available: "Available",
    remove: "Remove",
    copiedHeaderCell: "Header cell copied",
    copiedCell: "Cell copied",
    copiedRow: (rowNumber) => `Row ${rowNumber} copied`,
    emptyBeforeSearch: "Enter a keyword to start strict search. Results are grouped by file and sheet.",
    emptyNoResults: "No results found. Try another keyword.",
    totalMatches: (count) => `${count} total matched rows`,
    hitCountRows: (count) => `${count} matched rows`,
    headerDepth: "Header depth",
    headerRowLabel: (rowNumber) => `Header labels in row ${rowNumber}`,
    all: "All",
    searchCandidates: "Candidates",
    backToTop: "Back to top",
    configSaved: "Project archive saved",
    configLoaded: "Project archive loaded",
    configSaveFailed: "Failed to save archive",
    configLoadFailed: "Failed to load archive",
    importFailed: "Failed to import files",
    explorerFailed: "Failed to open folder",
    maxFilesReached: (max) => `You can keep up to ${max} files at the same time.`,
    duplicateFiles: "These files were already imported.",
    removeConfirm: (fileName) => `Remove ${fileName} from the current session? The original file will not be changed.`,
    removeFolderConfirm: (folderName, count) =>
      `Remove folder ${folderName} from the current session? This removes ${count} files from the session only. The original files will not be changed.`,
    launcherDuplicateTitle: "This page is already open elsewhere",
    launcherDuplicateBody: "The existing page has been activated. Return to the open tab and close this duplicate page.",
    fileFilter: "File filter",
    collapseFolder: "Collapse folder",
    expandFolder: "Expand folder",
  },
  "ja-JP": {
    appTitle: "Excel Strict Searcher",
    heroTitle: "ローカル Excel 厳密検索",
    heroCopy: "厳密な部分一致のみ、読み取り専用、複数ファイル・複数シート検索。パスとプロジェクト設定はローカルに保持します。",
    searchPlaceholder: "連続した文字列を入力してください。例: aabb",
    clear: "クリア",
    search: "検索",
    importing: "読み込み中...",
    importExcel: "Excel を追加",
    importFolder: "フォルダー追加",
    loadingCache: "アーカイブを読み込み中...",
    filesLoaded: (count, max) => `${count} / ${max} 件のファイルを読み込み済み`,
    currentLayout: "レイアウト",
    columnDisplay: "列表示",
    allColumns: "全列",
    labeledColumns: "ラベル列のみ",
    standard: "標準",
    expanded: "拡張",
    currentKeyword: "キーワード",
    notSearched: "未検索",
    fileManagement: "ファイル管理",
    searchStatus: "検索状態",
    waitingSearch: "待機中",
    noFiles: "まだファイルがありません。Excel を追加するか、プロジェクトアーカイブを読み込んでください。",
    hitSheets: "ヒットしたシート",
    matchedRows: (count) => `${count} 行ヒットしました。`,
    headerOnly: "ヘッダー行のみ",
    loadConfig: "アーカイブ読込",
    saveConfig: "アーカイブ保存",
    importConfig: "設定を読み込む",
    exportConfig: "設定を書き出す",
    configName: "アーカイブ名",
    projectArchive: "設定の読み込み / 書き出し",
    archivePlaceholder: "例: Audit_Project_A",
    activeArchive: "現在の設定",
    none: "なし",
    language: "表示言語",
    pickFiles: "ファイル選択",
    openFolder: "フォルダーを開く",
    openFolderUnavailable: "Web モードではローカルパスなし",
    locateFile: "位置",
    missing: "ファイルなし",
    available: "利用可",
    remove: "削除",
    copiedHeaderCell: "ヘッダーセルをコピーしました",
    copiedCell: "セルをコピーしました",
    copiedRow: (rowNumber) => `${rowNumber} 行目をコピーしました`,
    emptyBeforeSearch: "キーワードを入力すると厳密検索を開始します。結果はファイルとシートごとに表示されます。",
    emptyNoResults: "一致する結果がありません。別のキーワードで再試行してください。",
    totalMatches: (count) => `合計 ${count} 行ヒット`,
    hitCountRows: (count) => `${count} 行ヒット`,
    headerDepth: "ヘッダー階層",
    headerRowLabel: (rowNumber) => `${rowNumber} 行目のラベル列`,
    all: "すべて",
    searchCandidates: "候補語",
    backToTop: "トップへ戻る",
    configSaved: "プロジェクトアーカイブを保存しました",
    configLoaded: "プロジェクトアーカイブを読み込みました",
    configSaveFailed: "アーカイブの保存に失敗しました",
    configLoadFailed: "アーカイブの読み込みに失敗しました",
    importFailed: "ファイルの読み込みに失敗しました",
    explorerFailed: "フォルダーを開けませんでした",
    maxFilesReached: (max) => `同時に保持できるのは最大 ${max} ファイルです。`,
    duplicateFiles: "これらのファイルは既に読み込まれています。",
    removeConfirm: (fileName) => `${fileName} を現在のセッションから削除しますか。元ファイルは変更されません。`,
    removeFolderConfirm: (folderName, count) =>
      `フォルダー ${folderName} を現在のセッションから削除しますか。${count} 件のファイルがセッションから削除されますが、元ファイルは変更されません。`,
    launcherDuplicateTitle: "このページは別ウィンドウで開かれています",
    launcherDuplicateBody: "既存のページをアクティブ化しました。開いているタブに戻り、この重複ページを閉じてください。",
    fileFilter: "ファイル絞り込み",
    collapseFolder: "フォルダーを折りたたむ",
    expandFolder: "フォルダーを展開",
  },
};

export const resolveInitialLanguage = (): AppLanguage => {
  const language = navigator.language;
  if (language.startsWith("ja")) {
    return "ja-JP";
  }

  if (language.startsWith("en")) {
    return "en-US";
  }

  return "zh-CN";
};

export const getDictionary = (language: AppLanguage): Dictionary => dictionaries[language];
