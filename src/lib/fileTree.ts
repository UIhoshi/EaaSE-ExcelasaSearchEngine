// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import type { CachedWorkbook } from "../types";

export type FileTreeNode = {
  folders: Map<string, FileTreeNode>;
  files: CachedWorkbook[];
};

export const collectNodeWorkbooks = (node: FileTreeNode): CachedWorkbook[] => [
  ...node.files,
  ...Array.from(node.folders.values()).flatMap((childNode) => collectNodeWorkbooks(childNode)),
];

const getWorkbookPathSegments = (workbook: CachedWorkbook): string[] =>
  workbook.absolutePath
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);

const createFileTreeNode = (): FileTreeNode => ({
  folders: new Map(),
  files: [],
});

export const buildFileTree = (workbooks: CachedWorkbook[]): FileTreeNode => {
  const root = createFileTreeNode();

  for (const workbook of workbooks) {
    const segments = getWorkbookPathSegments(workbook);
    const folderSegments = segments.slice(0, Math.max(segments.length - 1, 0));
    let current = root;

    for (const segment of folderSegments) {
      if (!current.folders.has(segment)) {
        current.folders.set(segment, createFileTreeNode());
      }

      current = current.folders.get(segment)!;
    }

    current.files.push(workbook);
  }

  return root;
};
