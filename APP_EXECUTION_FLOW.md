# EaaSE App Execution Flow

This document fixes the current runtime chain in one place so structural changes can be checked against the real application flow.

## 1. Entry Baseline

- Read `README.md`, `PROJECT_FACT_MAP.md`, and `AgentLogic/00_README.md` before structural changes.
- The active logic framework remains `AgentLogic/AgentLogic_V6.md`.
- The project-side mapping file remains `AGENTLOGIC_EAASE_MAPPING.md`.

## 2. Startup Flow

1. The UI starts from `src/main.tsx` and renders `src/App.tsx`.
2. `App.tsx` resolves the initial UI language through `src/lib/i18n.ts`.
3. `useWorkbookArchive` loads the default autosave archive.
4. The archive restore path rebuilds workbook state from:
   - persisted workbook snapshots when available
   - repository records loaded through `src/lib/workbookRepository.ts`
5. The restored workbook list becomes the active workspace and is immediately persisted back to the default autosave target.

## 3. Workbook Intake Flow

1. Files or folders are chosen through the local API when available.
2. Workbook records are loaded from absolute paths through the repository layer.
3. Browser-only quickstart mode falls back to direct frontend parsing where needed.
4. Duplicates are filtered by workbook fingerprint.
5. The active workbook set is written back to the default autosave archive.

## 4. Search Flow

1. Candidate lookup starts when the deferred input value changes.
2. The primary path uses the local API cache:
   - `/api/search/candidates`
   - `/api/search/query`
3. If the local API path fails, the UI degrades to the Web Worker path.
4. Search semantics remain strict `String.includes()` matching in both paths.
5. Search completion emits telemetry but telemetry failure never blocks the UI.

## 5. Result Projection Flow

1. Search hits are grouped by workbook fingerprint and sheet id.
2. Each sheet calculates its active header depth independently.
3. Column visibility is projected from:
   - all columns
   - labeled columns
   - one active header-filter row
4. Merged cells are reprojected against the visible column set before rendering.
5. The result list is virtualized so only visible sheet sections plus overscan are mounted.

## 6. Persistence Flow

- Autosave remains the default resume mechanism.
- Manual import replaces the active working set and then overwrites the default autosave state.
- Local runtime persistence continues to target `config/cache.db` plus `config/*.json`.
- Browser fallback may use local storage temporarily, but this does not replace the local-first runtime model.

## 7. Change Rules

- Do not change the strict search semantics.
- Do not move the project back to a browser-first Windows direction.
- Update this file when startup, workbook intake, search, projection, or persistence flow changes.
