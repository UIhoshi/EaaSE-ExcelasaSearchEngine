# EaaSE

**EaaSE - Excel as a Search Engine**

Language:
- [English](./README.md)
- [中文](./README.zh-CN.md)
- [日本語](./README.ja.md)

EaaSE is a local, read-only Excel search tool for multi-file, multi-sheet, and wide-table lookup workflows.

With only two steps, you can turn Excel into a searchable search engine:
1. Import
2. Choose Excel

The collaboration model for this project is:
- Codex handles implementation.
- Gemini handles review and planning.

## Version Evolution
### V1.0.0
- Established the original source-oriented release baseline for `EaaSE - Excel as a Search Engine`.
- Focused on local strict substring search for Excel workbooks.
- Supported `.xls`, `.xlsx`, `.xlsm`, and `.csv`.
- Supported up to 20 cached files at the same time.
- Provided grouped search results by `file -> sheet`.
- Supported multilingual UI switching between Chinese, English, and Japanese.

### V1.1.0
- Moved the product from a browser-first tool toward a hybrid local runtime architecture.
- Introduced local API support for absolute paths, opening containing folders, and config import/export.
- Added larger-scale workbook handling beyond the initial V1.0.0 limit.
- Established the desktop-window packaging direction for Windows with `EaaSE.exe`.
- Introduced the current packaging chain for Windows setup, Windows lightweight, and Linux release artifacts.

### V2.0.0
- Expanded the active workspace capacity to up to 1000 simultaneously loaded files.
- Replaced browser-only persistence with local runtime persistence using `config/cache.db` plus `config/*.json`.
- Added `.eaase.json` project archive import/export for scenario switching, backup, and migration.
- Stabilized the desktop startup flow as `EaaSE.exe -> local Node.js service -> WebView2 desktop window -> React UI`.
- Added folder import, file filtering, standard/expanded layout switching, all-columns vs labeled-columns switching, matched-sheet quick jump, and back-to-top navigation.
- Scaled search and rendering through a Web Worker pipeline and virtualized result rendering.

## Current Capabilities
- Supports `.xls`, `.xlsx`, `.xlsm`, and `.csv`
- Supports importing single files and full folders
- Keeps up to 1000 files in the active workspace
- Uses strict substring matching through `String.includes()`
- Groups results by `file -> sheet`
- Supports multi-row headers, merged cells, column letters, and label-column filtering
- Supports cell copy, row copy, keyword highlighting, and matched-sheet quick jump
- Supports Chinese, English, and Japanese UI switching
- Preserves runtime logs in `config/startup.log`, `config/server.log`, and `config/runtime-metrics.log`

## Data Persistence
- Default cache is automatically restored on startup for instant resume.
- Workbook structure, sheet rows, and search-ready cache are persisted in `config/cache.db`.
- Project archives and UI preferences are persisted in `config/*.json`.
- Imported and exported project archives use `.eaase.json`.
- The app is local-only and read-only. It does not modify the original Excel files.

## UI And Workflow Updates
- Folder import for batch workbook intake
- Local-path aware actions such as opening the containing folder
- File filter for narrowing the loaded workbook list
- Standard and expanded layout modes
- All-columns and labeled-columns display modes
- Matched-sheet quick jump and back-to-top navigation
- Web Worker search execution and virtualized result rendering

## Development
```bash
npm install
npm run dev
```

`npm run dev` starts both the local API service and the Vite dev server.

## Quick Web Test
```bash
npm run quickstart
```

Quickstart mode runs the web UI only. If the local API is unavailable, file import falls back to the browser picker and local path actions are unavailable.

## Build And Packaging
```bash
npm run build
npm run preview
npm run package:github-release
```

The final release command rebuilds:
- `github/source/`
- `github/Excel Strict Searcher-2.0.0-windows-setup.zip`
- `github/Excel Strict Searcher-2.0.0-windows-lightweight.zip`
- `github/Excel Strict Searcher-2.0.0-linux.zip`

Packaging notes:
- `windows-setup.zip` is the main Windows desktop deliverable.
- `windows-lightweight.zip` is retained only for compatibility and comparison.
- Linux is delivered as a compressed runtime bundle.
- Final `github/` content should remain `source/ + 3 zip files only`.

## Repository Layout
- `src/`: React UI, hooks, worker, styles, and frontend logic
- `scripts/`: local runtime server and packaging scripts
- `config/`: runtime cache, archives, and logs when running locally
- `README.md`: English overview
- `README.zh-CN.md`: Chinese overview
- `README.ja.md`: Japanese overview
- `package.json`: dependency and script entry point

## GitHub Sync Rule
- Only source-oriented files should be synced to GitHub.
- Do not sync local runtime output, `node_modules`, `dist`, temporary packaging folders, logs, or other build byproducts.
- Internal collaboration notes such as `agentlogic.md` stay outside the public source sync.
