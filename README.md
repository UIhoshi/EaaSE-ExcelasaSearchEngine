<!--
MANDATORY LOGIC GATE
Before making changes here, read AGENTS.md and README.md first.
-->

# 🌌 EaaSE: Excel as a Search Engine (V2.1.0)

[![Version](https://img.shields.io/badge/version-2.1.0-111111?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0f766e?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)
[![UI](https://img.shields.io/badge/ui-zh%20%7C%20en%20%7C%20ja-b91c1c?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)
[![Runtime](https://img.shields.io/badge/runtime-local--first-7c3aed?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)
[![Search](https://img.shields.io/badge/search-strict%20substring-1d4ed8?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)

**EaaSE** is a local-first desktop application designed to turn hundreds of Excel workbooks into an instant, searchable index database. It processes everything locally on your machine, requiring no database migrations or cloud service uploads.

**[English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)**

> [!IMPORTANT]
> **Read-Only Safety Guarantee**: EaaSE is strictly read-only. It parses and caches sheet content into local DB configurations without ever modifying or writing back to your original Excel files.

---

## 🎯 Product Definition

| Target Scenario | EaaSE Solution |
| :--- | :--- |
| **Scattered Excel Files** | Load up to 1000 `.xls`, `.xlsx`, `.xlsm`, and `.csv` files into a single unified search engine index. |
| **Complex Table Inspecting** | High-performance search interface supporting grouped results, column filtering, and layout switching. |
| **No Database Overhead** | Import files directly; EaaSE automatically parses and updates cache records locally. |
| **Offline Desktop Execution** | Local Node.js service paired with a React client, bypassing fragile cloud service requirements. |

---

## 🚀 Quick Start

| Launch Option | Steps to Execute | Available Features |
| :--- | :--- | :--- |
| **Option 1: Release Package** | 1. Go to [Releases](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases)<br>2. Download & run the installer<br>3. Drag and drop folders to search | **Full Desktop Experience** (Local path actions,SQLite persistence) |
| **Option 2: Run From Source** | `npm install`<br>`npm run dev`<br>Open `localhost:5173` | **Full Desktop Experience** (Developer mode) |
| **Option 3: Web Fallback** | `npm run quickstart` | **Web-Only Sandbox** (Web Worker search, no local SQLite, browser file picker only) |

---

## 🧱 Architecture & Codebase Navigation

> [!NOTE]
> **AI Gating & Maintenance**: For AI agents maintaining this codebase, you **must** obey the logic rules defined in `AgentLogic/` and self-verify with `check:logic` before coding.

### Repository Layout

| Path | Core Purpose |
| :--- | :--- |
| `src/` | React frontend components, styling, custom hooks, and Web Worker files |
| `scripts/` | Local Node.js backend server code and package compile scripts |
| `config/` | Stores SQLite `cache.db`, local configurations, and logging entries |
| `AgentLogic/` | Governance profiles, version guidelines, and agent entrypoints |

### Tech Stack & Performance Highlights
* **Core Components**: React + Vite + TypeScript.
* **Database Cache**: SQLite database wrapper (`cache.db`) enabling rapid strict substring searches.
* **Virtualization**: Uses virtualized lists for rendering large result sets without UI freezing.
* **Parsing Engine**: Fast spreadsheet data ingestion via `xlsx` libraries.

---

## ⚡ Core Features

* **Multi-Workbook Indexing**: Ingest directories, files, or specific sheets for unified lookups.
* **Structured Results**: Group outputs by `File -> Sheet` to trace source cells.
* **Intelligent Filters**: Search and isolate columns, handle multi-row headers, and toggles layout views.
* **Local Persistence**: Workspace states are exported/imported seamlessly using `.eaase.json` archives.
* **Worker Ingestion**: Automatically falls back to client-side Web Worker searching if the local server drops.

---

## 🛠️ Development & Compiling

Manage, audit, and compile releases using npm scripts:

```bash
# Ingest dependencies
npm install

# Run Vite dev server
npm run dev

# Compile React frontend
npm run build

# Run local verification test suite
npm run verify

# Verify logic links & docs mapping
npm run check:logic
npm run check:docs

# Package the application for GitHub release
npm run package:github-release
```

---

## ⚠️ Known Limitations

* Desktop-specific features (such as local file path links) are unavailable in the Web Fallback quickstart mode.
* App packaging requires a matching platform compiler to output native portable files.
* SQLite cache DB resides locally; sharing workspaces requires exporting the `.eaase.json` index archive.

---

## 📈 Version Evolution

| Version | Status | Key Hardening Focus |
| :--- | :--- | :--- |
| **v2.1.0** | Stable | SQLite physical database compaction, cache cleanup on folder removal, package installers |
| **v2.0.0** | Release | Support for 1000+ files, SQLite cache database persistence, `.eaase.json` workspace archives |
| **v1.1.0** | Legacy | Inception of Node.js background local service paired with Electron wrapper |
| **v1.0.0** | Legacy | Substring parser core, React browser-picker UI, multilingual READMEs |

---

## 🤝 Contribution & License

* Open an Issue for search model defects or query parser enhancements.
* Submitting PRs requires completing the `check:logic` gate first.
* Currently, no external license file is declared in this repository.
