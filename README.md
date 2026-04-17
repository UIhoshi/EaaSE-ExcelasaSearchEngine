<div align="center">

# EaaSE

**Turn local Excel workbooks into a desktop-friendly search engine without sending files to a remote service**

[English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

</div>

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.0-111111?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0f766e?style=for-the-badge)
![UI](https://img.shields.io/badge/ui-zh%20%7C%20en%20%7C%20ja-b91c1c?style=for-the-badge)
![Runtime](https://img.shields.io/badge/runtime-local--first-7c3aed?style=for-the-badge)
![Search](https://img.shields.io/badge/search-strict%20substring-1d4ed8?style=for-the-badge)

</div>

## Product Proof

EaaSE is built for one very specific job: searching across many local Excel workbooks quickly, safely, and repeatedly without turning Excel data into a web service or a database project.

The current `2.1.0` baseline is centered on:

- local-first workbook search across `.xls`, `.xlsx`, `.xlsm`, and `.csv`
- desktop-oriented runtime flow instead of a browser-only toy workflow
- stable cache cleanup after archive import and workbook deletion
- large-file handling up to 1000 simultaneously loaded files

## ✨ What does this solve?

- **Too many Excel files to search manually**: load many workbooks into one searchable workspace instead of opening files one by one.
- **Desktop lookup work is slow and error-prone**: keep search local, read-only, and optimized for repeated lookup workflows.
- **Wide tables are painful to inspect**: support grouped results, label-column filtering, multi-row headers, and layout switching.
- **Users do not want a database migration project**: import files directly and keep the original Excel files untouched.

## Quick Start

### Option 1: Use GitHub release assets

1. Open the Releases page:
   `https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases`
2. Download the package that matches your platform or preferred delivery style.
3. Launch the application package and import one or more Excel files, or a whole folder.
4. Search across files and sheets from the same workspace.

### Option 2: Run the local desktop-oriented workflow from source

1. Install dependencies:

```bash
npm install
```

2. Start the local runtime workflow:

```bash
npm run dev
```

3. Import one or more Excel files, or load a whole folder.
4. Search across files and sheets from the same workspace.

### Option 3: Use the web-only fallback path

```bash
npm run quickstart
```

In quickstart mode:

- file import falls back to the browser picker
- search falls back to the Web Worker
- local path actions are unavailable

> Important:
> EaaSE is local-only and read-only. It does not modify the original Excel files.

## At a Glance

<div align="center">

| Topic | Summary |
|-------|---------|
| Version | `2.1.0` |
| Runtime | local Node.js service + React UI + desktop shell |
| File scale | up to 1000 simultaneously loaded files |
| Formats | `.xls`, `.xlsx`, `.xlsm`, `.csv` |
| Persistence | `config/cache.db` and `config/*.json` |
| Archive format | `.eaase.json` |
| UI languages | Chinese, English, Japanese |
| Documentation | `AGENTS.md`, `PROJECT_FACT_MAP.md`, `AgentLogic/` |

</div>

## ✨ Core Features

- Search across many Excel workbooks and many sheets in one workspace.
- Group results by `file -> sheet`.
- Support folder import, file filtering, label-column filtering, and layout switching.
- Preserve local runtime persistence through `config/cache.db` and `config/*.json`.
- Import and export workspace archives as `.eaase.json`.
- Fall back to Web Worker search when the local API path is unavailable.

## Documentation And Logic Entry

If you are maintaining or extending the project, start here:

- `AGENTS.md`
- `PROJECT_FACT_MAP.md`
- `AgentLogic/00_README.md`
- `AgentLogic/AgentLogic_V6.md`

Repository checks:

```bash
npm run check:logic
npm run check:docs
```

Collaboration model for this project:

- Codex handles implementation.
- Gemini handles review and planning.

## Technical Implementation

**Tech stack**

- React
- TypeScript
- Vite
- local Node.js runtime service
- Excel parsing through `xlsx`

**Architecture highlights**

- local-first desktop workflow instead of a remote hosted service
- primary search through local API cache when available
- Web Worker fallback path for browser-only quick start
- virtualized rendering for large result sets
- read-only handling of source Excel files

**Repository layout**

| Path | Purpose |
|------|---------|
| `src/` | React UI, hooks, workers, styles, and frontend logic |
| `scripts/` | local runtime server and packaging scripts |
| `config/` | runtime cache, archives, and logs when running locally |
| `AgentLogic/` | repository logic-entry and collaboration rules |
| `README.zh-CN.md` / `README.ja.md` | multilingual README pages |

## Development

```bash
npm install
npm run dev
npm run build
npm run verify
```

Release packaging:

```bash
npm run package:github-release
```

## Known Limitations

- This repository currently does not ship screenshot assets in the README.
- Quickstart browser mode is a fallback path, not the full local-runtime experience.
- Local path actions depend on the local runtime service being available.

## Release Notes

Current focus in `2.1.0`:

- cache cleanup hardening after `.eaase.json` import
- cache cleanup after workbook deletion
- physical SQLite compaction after cache deletion
- formal release packaging for portable and installer lines

Release assets should be obtained from the repository Releases page when available:

- `https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases`

## Version Evolution

- `v2.1.0`: hardened cache cleanup, added SQLite compaction, and stabilized release packaging outputs.
- `v2.0.0`: expanded to 1000-file workspaces, added local persistence, and introduced `.eaase.json` project archives.
- `v1.1.0`: moved toward a local API plus desktop-oriented runtime workflow.
- `v1.0.0`: established the original strict Excel search baseline and the first multilingual README structure.

## Contributing / Support

- Open an Issue for bugs, search-model problems, or feature requests.
- Use PRs for targeted improvements once the project docs and logic entry have been read.

## License

No license file is currently declared in this repository.
