// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import type { ReactNode } from "react";
import type { CellRecord, RowRecord } from "../types";

export type HeaderFilterOption = {
  key: string;
  label: string;
  columns: number[];
};

export const toExcelColumnLabel = (index: number): string => {
  let current = index + 1;
  let label = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }

  return label;
};

export const getHeaderRows = (rows: RowRecord[], headerDepth: number): RowRecord[] => rows.slice(0, headerDepth);

export const getRenderableCells = (cells: CellRecord[]): Array<{ cell: CellRecord; index: number }> =>
  cells
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => !cell.hidden);

export const buildVisibleColumnSet = (headerRows: RowRecord[], columnCount: number): Set<number> => {
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

export const highlightText = (value: string, query: string): ReactNode => {
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

export const buildSectionRowCells = (
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
