<div align="center">

# EaaSE

### Excel as a Search Engine

Turn local Excel workbooks into a searchable, desktop-friendly lookup engine.

[![Version](https://img.shields.io/badge/version-2.0.0-111111?style=for-the-badge)](./package.json)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0f766e?style=for-the-badge)
![UI](https://img.shields.io/badge/ui-zh%20%7C%20en%20%7C%20ja-b91c1c?style=for-the-badge)
![Search](https://img.shields.io/badge/search-strict%20substring-1d4ed8?style=for-the-badge)
![Runtime](https://img.shields.io/badge/runtime-local--first-7c3aed?style=for-the-badge)
![Built With](https://img.shields.io/badge/built%20with-Codex%20%2B%20Gemini-f59e0b?style=for-the-badge)

[English](./README.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md)

</div>

> Two steps only:
>
> 1. Import
> 2. Choose Excel

## Why EaaSE

EaaSE is a local, read-only Excel search tool for multi-file, multi-sheet, and wide-table lookup workflows. It is built for people who need desktop-style search across many workbooks without turning their files into a remote service or a browser-only toy.

The collaboration model for this project is simple:
- Codex handles implementation.
- Gemini handles review and planning.

This naming should remain explicit in public-facing project materials:
- Codex is the engineering and implementation side.
- Gemini is the planning and review side.

## At A Glance

| Topic | Summary |
| --- | --- |
| File scale | Up to 1000 simultaneously loaded files |
| Formats | `.xls`, `.xlsx`, `.xlsm`, `.csv` |
| Search model | Strict substring matching with `String.includes()` |
| Runtime | Local Node.js service + React UI + Windows WebView2 desktop shell |
| Persistence | `config/cache.db` + `config/*.json` |
| Archives | `.eaase.json` import/export |
| UI languages | Chinese, English, Japanese |
| Result handling | Web Worker search + virtualized rendering |

## Version Timeline

### V1.0.0
- Established the original local Excel strict-search baseline.
- Focused on source-oriented release and multilingual README structure.
- Supported up to 20 cached files at the same time.
- Shipped the core grouped search experience by `file -> sheet`.

### V1.1.0
- Moved from a browser-first tool toward a hybrid local runtime architecture.
- Added local API support for absolute paths, opening containing folders, and config import/export.
- Established the desktop packaging direction with `EaaSE.exe`.
- Introduced the current release chain for Windows setup, Windows lightweight, and Linux packages.

### V2.0.0
- Expanded the active workspace to up to 1000 simultaneously loaded Excel files.
- Replaced browser-only persistence with local runtime persistence using `config/cache.db` and `config/*.json`.
- Added `.eaase.json` project archives for save, restore, backup, and migration.
- Stabilized the desktop startup flow as `EaaSE.exe -> local Node.js service -> WebView2 desktop window -> React UI`.
- Added folder import, file filtering, standard and expanded layouts, all-columns and labeled-columns modes, matched-sheet quick jump, and back-to-top navigation.
- Improved large-result handling with Web Worker search and virtualized result rendering.

## What Changed In V2.0.0

| Area | Before | Now |
| --- | --- | --- |
| File capacity | 20-file scale in V1.0.0 | Up to 1000 loaded files |
| Persistence | Browser-oriented session approach | Local `cache.db` and `config/*.json` |
| Project portability | Limited | `.eaase.json` archive import/export |
| Windows UX | Browser-first tendency | Desktop-window startup through `EaaSE.exe` |
| Navigation | Basic grouped result browsing | Folder import, file filter, quick jump, back-to-top |
| Rendering | Smaller-scale result handling | Web Worker + virtualized result list |

## Core Capabilities

- Import single files or entire folders.
- Search across `.xls`, `.xlsx`, `.xlsm`, and `.csv`.
- Group search results by `file -> sheet`.
- Support multi-row headers, merged cells, Excel column letters, and label-column filtering.
- Copy cells and rows with keyword highlighting.
- Switch between standard and expanded layouts.
- Switch between all-columns and labeled-columns display modes.
- Open the containing folder when local path information is available.
- Preserve runtime diagnostics in `config/startup.log`, `config/server.log`, and `config/runtime-metrics.log`.

## Data Model And Persistence

- Default cache is automatically restored on startup for instant resume.
- Workbook structure, sheet rows, and search-ready cache are stored in `config/cache.db`.
- Project metadata and UI preferences are stored in `config/*.json`.
- Imported and exported project archives use `.eaase.json`.
- EaaSE is local-only and read-only. It does not modify original Excel files.

## UI Highlights

- Folder import for batch workbook intake
- File filter for narrowing the active workspace
- Standard and expanded layout modes
- All-columns and labeled-columns display modes
- Matched-sheet quick jump
- Back-to-top navigation
- Chinese, English, and Japanese UI switching

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

## Build And Release

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

## Repository Layout

- `src/`: React UI, hooks, worker, styles, and frontend logic
- `scripts/`: local runtime server and packaging scripts
- `config/`: runtime cache, archives, and logs when running locally
- `README.md`: English landing page
- `README.zh-CN.md`: Chinese landing page
- `README.ja.md`: Japanese landing page
- `package.json`: dependency and script entry point

## GitHub Sync Rule

- Sync source-oriented files only.
- Do not sync local runtime output, `node_modules`, `dist`, temporary packaging folders, logs, or other build byproducts.
