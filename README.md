# Excel Strict Searcher

The v1 codebase is complete and this folder contains the maintained source project.

## Product Scope
- Local Excel strict-search tool
- Read-only browser processing with no source file modification
- Designed for multi-file, multi-sheet, wide-table search workflows

## Current Capabilities
- Imports `.xls`, `.xlsx`, `.xlsm`, and `.csv`
- Searches up to 20 cached files at the same time
- Uses strict `String.includes()` matching only
- Restores parsed workbook cache from IndexedDB after refresh
- Deduplicates by `file name + file size + last modified time`
- Groups results by `file -> sheet`
- Renders merged cells through `colSpan / rowSpan / hidden`
- Supports multi-row headers, Excel column letters, and label-based column filters
- Supports `standard / expanded` result layouts
- Supports `all columns / label columns only`
- Supports cell copy, row copy, and keyword highlighting
- Supports matched sheet quick-jump and back-to-top interaction

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Lightweight Runtime Packaging
```bash
npm run build
npm run package:lightweight
```

This generates `../lightweight-runtime`.

- Windows: bundles the official Node.js x64 LTS MSI from nodejs.org and installs it on demand if Node.js is missing.
- Linux: expects Node.js to be installed through the system package manager or an approved internal mirror.

## Repository Layout
- `src/`: React app, styles, types, Excel parsing, and search logic
- `scripts/`: local serving and packaging helpers
- `index.html`: Vite entry page
- `package.json`: dependencies and scripts

## Release Layout
- `../web-build`: static web output used by the desktop wrapper
- `../desktop-wrapper`: Electron wrapper for Windows and Linux desktop packages
- `../lightweight-runtime`: small browser-access runtime with official Node.js installer support on Windows
