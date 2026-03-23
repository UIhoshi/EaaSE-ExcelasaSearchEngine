import type { CachedWorkbook, SearchHit } from "../types";

export const searchWorkbooks = (workbooks: CachedWorkbook[], query: string): SearchHit[] => {
  if (!query) {
    return [];
  }

  const hits: SearchHit[] = [];

  workbooks.forEach((workbook) => {
    workbook.sheets.forEach((sheet) => {
      const rows = sheet.rows.filter((row) => row.cells.some((cell) => cell.value.includes(query)));
      if (rows.length > 0) {
        hits.push({
          fingerprint: workbook.fingerprint,
          fileName: workbook.fileName,
          sheetId: sheet.id,
          sheetName: sheet.sheetName,
          rows,
          allRows: sheet.rows,
          columnCount: sheet.columnCount,
          defaultHeaderDepth: sheet.defaultHeaderDepth,
        });
      }
    });
  });

  return hits;
};

export const buildCandidates = (workbooks: CachedWorkbook[], query: string, limit = 20): string[] => {
  if (!query) {
    return [];
  }

  const seen = new Set<string>();
  const matches: string[] = [];

  for (const workbook of workbooks) {
    for (const value of workbook.uniqueValues) {
      if (value.includes(query) && !seen.has(value)) {
        seen.add(value);
        matches.push(value);
        if (matches.length >= limit) {
          return matches;
        }
      }
    }
  }

  return matches;
};
