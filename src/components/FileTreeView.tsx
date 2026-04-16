// read ../../AGENTS.md and ../../README.md before editing this file;
// then confirm AgentLogic/01_MasterLogic.md and AgentLogic/15_LogicEntryChecklist.md.
// Before a new coding round, ask whether it extends the previous coding;
// if not, ask whether to forget/compress context first.
// Do not continue reading past this point until the loop above has been completed
import { useState } from "react";
import type { CachedWorkbook } from "../types";
import type { FileTreeNode } from "../lib/fileTree";

type FileTreeViewProps = {
  node: FileTreeNode;
  depth: number;
  onOpenLocation: (absolutePath: string) => void;
  onRemove: (workbook: CachedWorkbook) => void;
  onRemoveFolder: (folderName: string, node: FileTreeNode) => void;
  openLabel: string;
  openUnavailableLabel: string;
  removeLabel: string;
  missingLabel: string;
  collapseFolderLabel: string;
  expandFolderLabel: string;
};

export function FileTreeView({
  node,
  depth,
  onOpenLocation,
  onRemove,
  onRemoveFolder,
  openLabel,
  openUnavailableLabel,
  removeLabel,
  missingLabel,
  collapseFolderLabel,
  expandFolderLabel,
}: FileTreeViewProps) {
  const folders = Array.from(node.folders.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const files = [...node.files].sort((a, b) => a.fileName.localeCompare(b.fileName));

  return (
    <div className="file-tree-children">
      {folders.map(([folderName, childNode]) => (
        <FileTreeBranch
          key={`${depth}-${folderName}`}
          folderName={folderName}
          childNode={childNode}
          depth={depth}
          onOpenLocation={onOpenLocation}
          onRemove={onRemove}
          onRemoveFolder={onRemoveFolder}
          openLabel={openLabel}
          openUnavailableLabel={openUnavailableLabel}
          removeLabel={removeLabel}
          missingLabel={missingLabel}
          collapseFolderLabel={collapseFolderLabel}
          expandFolderLabel={expandFolderLabel}
        />
      ))}
      {files.map((workbook) => (
        <div
          key={workbook.fingerprint}
          className={`file-tree-leaf${workbook.missing ? " file-item-missing" : ""}`}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          <div className="file-tree-leaf-main">
            <div className="file-tree-node">
              <strong className="file-node-name" title={workbook.fileName}>
                {workbook.fileName}
              </strong>
            </div>
            <div className="file-item-actions">
              <button
                type="button"
                className="ghost-button compact-button"
                onClick={() => onOpenLocation(workbook.absolutePath)}
                disabled={workbook.absolutePath === workbook.fileName}
                title={workbook.absolutePath === workbook.fileName ? openUnavailableLabel : workbook.absolutePath}
              >
                {workbook.absolutePath === workbook.fileName ? openUnavailableLabel : openLabel}
              </button>
              {workbook.missing ? <span className="file-status-badge is-missing">{missingLabel}</span> : null}
              <button type="button" className="danger-link" onClick={() => onRemove(workbook)}>
                {removeLabel}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type FileTreeBranchProps = {
  folderName: string;
  childNode: FileTreeNode;
  depth: number;
  onOpenLocation: (absolutePath: string) => void;
  onRemove: (workbook: CachedWorkbook) => void;
  onRemoveFolder: (folderName: string, node: FileTreeNode) => void;
  openLabel: string;
  openUnavailableLabel: string;
  removeLabel: string;
  missingLabel: string;
  collapseFolderLabel: string;
  expandFolderLabel: string;
};

function FileTreeBranch({
  folderName,
  childNode,
  depth,
  onOpenLocation,
  onRemove,
  onRemoveFolder,
  openLabel,
  openUnavailableLabel,
  removeLabel,
  missingLabel,
  collapseFolderLabel,
  expandFolderLabel,
}: FileTreeBranchProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="file-tree-branch">
      <div className="file-tree-folder" style={{ paddingLeft: `${depth * 16}px` }} title={folderName}>
        <button
          type="button"
          className="tree-toggle-button"
          onClick={() => setCollapsed((current) => !current)}
          title={collapsed ? expandFolderLabel : collapseFolderLabel}
          aria-label={collapsed ? expandFolderLabel : collapseFolderLabel}
        >
          {collapsed ? "+" : "-"}
        </button>
        <span className="file-tree-folder-name">{folderName}</span>
        <div className="file-item-actions">
          <button type="button" className="danger-link" onClick={() => onRemoveFolder(folderName, childNode)}>
            {removeLabel}
          </button>
        </div>
      </div>
      {!collapsed ? (
        <FileTreeView
          node={childNode}
          depth={depth + 1}
          onOpenLocation={onOpenLocation}
          onRemove={onRemove}
          onRemoveFolder={onRemoveFolder}
          openLabel={openLabel}
          openUnavailableLabel={openUnavailableLabel}
          removeLabel={removeLabel}
          missingLabel={missingLabel}
          collapseFolderLabel={collapseFolderLabel}
          expandFolderLabel={expandFolderLabel}
        />
      ) : null}
    </div>
  );
}
