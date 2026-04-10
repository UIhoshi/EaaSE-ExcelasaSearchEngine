export type CellRecord = {
  value: string;
  isMerged: boolean;
  colSpan: number;
  rowSpan: number;
  hidden: boolean;
  rootRow: number;
  rootCol: number;
};

export type RowRecord = {
  rowNumber: number;
  cells: CellRecord[];
  joined: string;
};

export type SheetRecord = {
  id: string;
  sheetName: string;
  defaultHeaderDepth: number;
  columnCount: number;
  rows: RowRecord[];
};

export type CachedWorkbook = {
  fingerprint: string;
  fileName: string;
  fileSize: number;
  lastModified: number;
  importedAt: number;
  absolutePath: string;
  headerDepth: number;
  isFavorite: boolean;
  missing: boolean;
  sheets: SheetRecord[];
  uniqueValues: string[];
  error?: string;
};

export type SearchHit = {
  fingerprint: string;
  fileName: string;
  absolutePath: string;
  missing: boolean;
  sheetId: string;
  sheetName: string;
  rows: RowRecord[];
  allRows: RowRecord[];
  columnCount: number;
  defaultHeaderDepth: number;
};

export type ToastState = {
  id: number;
  message: string;
  x: number;
  y: number;
};

export type ConfigWorkbookRecord = {
  fingerprint: string;
  absolutePath: string;
  headerDepth: number;
  isFavorite: boolean;
  importedAt: number;
};

export type PersistedWorkbook = CachedWorkbook | ConfigWorkbookRecord;

export type ProjectConfig = {
  cacheVersion?: number;
  fileName: string;
  configName: string;
  lastUpdated: string;
  workbooks: PersistedWorkbook[];
  preferences: {
    layout: "standard" | "expanded";
    theme: "light";
    language?: AppLanguage;
  };
};

export type AppLanguage = "zh-CN" | "en-US" | "ja-JP";
