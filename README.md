# EaaSE

**EaaSE — Excel as a Search Engine**

Language:
- [English](./README.md)
- [中文](./README.zh-CN.md)
- [日本語](./README.ja.md)

EaaSE means exactly what the product is trying to do: turn Excel into a searchable search engine.

With only two steps, you can turn your Excel files into a searchable search engine:
1. Import
2. Choose Excel

This is a local, read-only Excel strict-search tool designed for multi-file, multi-sheet, and wide-table lookup workflows.

The collaboration model for this project is: Codex handles implementation, while Gemini handles review and planning.

## Highlights
- Supports `.xls`, `.xlsx`, `.xlsm`, and `.csv`
- Searches up to 20 cached files at the same time
- Uses strict `String.includes()` matching
- Groups results by `file -> sheet`
- Supports multi-row headers, label-column filters, and keyword highlighting
- Supports cell copy, row copy, and matched-sheet quick jump
- Supports UI switching between Chinese, English, and Japanese

## Downloads And Variants
- Windows setup package: for normal desktop users
- Windows lightweight package: for users who want a smaller download
- Linux package: delivered as a compressed release bundle
- Source version: for development, maintenance, and GitHub sync

## Repository Layout
- `src/`: frontend pages and logic
- `scripts/`: local runtime and lightweight packaging scripts
- `README.md`: English overview
- `README.zh-CN.md`: Chinese overview
- `README.ja.md`: Japanese overview
- `package.json`: dependency and script entry point

## Quick Start
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
