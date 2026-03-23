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
  sheets: SheetRecord[];
  uniqueValues: string[];
};

export type SearchHit = {
  fingerprint: string;
  fileName: string;
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
