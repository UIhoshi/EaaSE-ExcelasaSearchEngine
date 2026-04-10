# Build And Release Requirements

## Scope
This document is the root-level build and release memo for `C:\Users\XU RONG\Documents\workspace\excel search`.
It records:
- issues encountered on 2026-03-23
- packaging decisions already made
- mandatory requirements for all future builds

For AI collaboration entry:
- read `agentlogic.md` for the abstract collaboration framework
- read `AGENTLOGIC_EAASE_MAPPING.md` for the repository-specific execution mapping
- read `VERSION_BUMP_CHECKLIST.md` when the task involves version upgrade or release number change

This file is intentionally kept outside `github\` so the working rules stay visible at the workspace root.

## Final Delivery Structure
The `github\` folder should be kept in this structure after packaging:
- `source\`
- `Excel Strict Searcher-<version>-windows-setup.zip`
- `Excel Strict Searcher-<version>-windows-lightweight.zip`
- `Excel Strict Searcher-<version>-linux.zip`

Do not keep extra build folders, temporary staging folders, unpacked runtime folders, or old package variants inside `github\` after final delivery.

The workspace `artifacts\` folder should keep only:
- `windows-portable-exe\`

Do not keep other transient packaging outputs in `artifacts\` after final sync unless they are explicitly needed for another active packaging task.

## Current Product Rules
- The software UI must support 3 languages: `zh`, `en`, `ja`.
- The language switcher must be visible in the app UI.
- Windows standard package must remain a normal installer package.
- Windows lightweight zip is retained as a compatibility deliverable in the GitHub release set.
- For future Windows iterations, both the scattered Windows package and the formal Windows installer should converge toward the desktop-app logic represented by `github\Excel Strict Searcher-1.0.0-windows-setup.zip`.
- That desktop-app logic means: users launch a Windows app window directly, not a browser-first experience.
- Linux package must remain a compressed deliverable with README included.
- `source\` must always be preserved for GitHub upload.
- Runtime config files must be read from and written to the software directory's `config\` folder.
- The product must distinguish between default cache for instant resume and manually imported/exported project configuration for scenario switching.
- The scattered Windows exe and the formal Windows installer must now follow the same desktop-window logic.
- That Windows packaging logic is mandatory:
  - `EaaSE.exe` is the startup entry
  - it starts the local Node.js service
  - it hosts the React UI inside a desktop window through WebView2
  - config files are always read from and written to the software directory's `config\`
  - if Node.js is missing, prompt installation of the bundled official MSI
  - if WebView2 Runtime is missing, prompt installation of the bundled official bootstrapper
- Runtime logging must be preserved:
  - `startup.log`
  - `server.log`
  - `runtime-metrics.log`
- Runtime metrics must be rich enough to analyze memory usage, API cost, and UI search responsiveness from logs alone.

## Collaboration Record
This section records the working agreements and confirmed outcomes from the current collaboration.

### Product Identity
- Product name:
  - `EaaSE — Excel as a Search Engine`
- Core positioning that must remain visible in product-facing materials:
  - only two steps are needed to turn Excel into a searchable search engine
  - `1. Import`
  - `2. Choose Excel`

### Team Roles
- Codex is responsible for implementation and engineering changes.
- Gemini is responsible for review and planning.

### GitHub Repository Rules
- Source code is uploaded to:
  - `https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine.git`
- The public repository should remain source-oriented.
- Do not push local-only runtime output, `node_modules`, `dist`, or test cache data.
- The repository README strategy is:
  - `README.md` as English-first landing page
  - `README.zh-CN.md` for Chinese
  - `README.ja.md` for Japanese
- The README content must continue to emphasize:
  - `EaaSE — Excel as a Search Engine`
  - the two-step usage concept
  - Codex implementation + Gemini review/planning

### Delivery Language Rules
- Software UI must support Chinese, English, and Japanese.
- Delivery documentation inside packages may remain Chinese-first, but the product itself must retain 3-language support.
- Avoid build or packaging choices that can introduce Chinese, English, or Japanese garbling.

## Packaging Rules
### 0. Canonical Build Entry
- The canonical final release build entry is:
  - `npm run package:github-release`
- Do not manually rebuild `github\` by hand if the standard script can be used.
- This command is the single source of truth for rebuilding the 3 final zip files and refreshing `github\source\`.
- The command internally rebuilds:
  - `windows-setup.zip`
  - `windows-lightweight.zip`
  - `linux.zip`
- After it completes, verify:
  - `github\source\`
  - `github\Excel Strict Searcher-<version>-windows-setup.zip`
  - `github\Excel Strict Searcher-<version>-windows-lightweight.zip`
  - `github\Excel Strict Searcher-<version>-linux.zip`

### 0.1 Runtime Environment Closure
- All release packages must be environment-closed enough to start outside the development workspace.
- Do not rely on the developer machine's repository checkout, sibling `node_modules`, global npm packages, or manually prepared PATH state except for explicitly documented system prerequisites.
- The local API runtime shipped in packages must be bundled as a self-contained artifact before packaging.
- This rule applies to Windows, Linux, and any future platform package line.
- Every platform package must include one-click or first-run environment preparation logic for its documented prerequisites.
- If a prerequisite cannot be embedded directly, the package must:
  - detect it before launch
  - guide the user to install the bundled installer or bootstrapper
  - fail with a direct prerequisite error instead of a generic startup timeout
- Build validation must verify packaged runtime startup from the package output itself, not from the repository source tree.

### 1. Windows Setup Package
- Must be delivered as a zip that contains:
  - the Windows desktop package entry
  - `README_CN.txt`
- Installer must include application icon.
- Installer output name format:
  - `Excel Strict Searcher-<version>-windows-setup.zip`
- Installer must use a stable text strategy.
- Do not rely on an NSIS license page if it causes multilingual encoding problems.
- If license / disclaimer text in the installer becomes garbled, remove that fragile page and keep the detailed disclaimer in bundled documentation and product-facing materials.
- The Windows installer UX target must follow the desktop-app behavior demonstrated by `github\Excel Strict Searcher-1.0.0-windows-setup.zip`.
- Future installer builds must open as a Windows application window and must not regress into a browser-first runtime experience.
- Build logic for the GitHub zip:
  - source command: `npm run package:portable-exe`
  - source folder: `artifacts\windows-portable-exe\`
  - zip output: `github\Excel Strict Searcher-<version>-windows-setup.zip`
  - zip root folder must be: `windows-setup\`
  - required contents include:
    - `EaaSE.exe`
    - `dist\`
    - `scripts\`
    - `config\`
    - `prereqs\windows\node-v*.msi`
    - `prereqs\windows\MicrosoftEdgeWebView2Setup.exe`
    - package README text files required by the packaging script
  - `scripts\serve-dist.cjs` must be bundled as a self-contained runtime artifact and must not rely on external `node_modules` next to the unpacked package
- Rebuild rule:
  - if the Windows desktop package logic changes, rebuild this zip through `npm run package:github-release`
  - do not hand-edit the zip contents afterward

### 2. Windows Lightweight Package
- Must be delivered as a zip.
- The zip must contain:
  - runtime files
  - `README_CN.txt`
  - `START_HERE.txt`
  - `DISCLAIMER.txt`
  - official Node.js Windows x64 LTS installer
- Lightweight package must not bundle a full embedded Node runtime tree just to run locally.
- If Node.js is missing, launcher must prompt the user to install the bundled official MSI.
- Lightweight output name format:
  - `Excel Strict Searcher-<version>-windows-lightweight.zip`
- This package is kept mainly for compatibility, comparison, and historical continuity in the GitHub release structure.
- It is not the primary Windows experience target for ongoing product validation.
- A browser-opening `EaaSE.exe` is no longer an acceptable default packaging direction for the active Windows package line.
- Build logic for the GitHub zip:
  - source command: `npm run package:portable-runtime`
  - staging source folder is temporary and must not remain in `artifacts\` after final sync
  - zip output: `github\Excel Strict Searcher-<version>-windows-lightweight.zip`
  - zip root folder must be: `lightweight-runtime\`
  - required contents include:
    - lightweight runtime entry files
    - `README_CN.txt`
    - `START_HERE.txt`
    - `DISCLAIMER.txt`
    - bundled official Node.js installer
- Rebuild rule:
  - keep this package only as a compatibility and comparison deliverable
  - always rebuild it through `npm run package:github-release`
  - do not treat it as the primary Windows validation target

### 2.1 Confirmed Windows Exe Packaging Logic
- The current confirmed scattered exe output folder is:
  - `artifacts\windows-portable-exe\`
- The current confirmed entry is:
  - `artifacts\windows-portable-exe\EaaSE.exe`
- This folder must be preserved during cleanup as the current validated Windows desktop package.
- Other temporary artifact folders should be removed after final sync unless explicitly needed.

### 3. Linux Package
- Must be delivered as a zip that contains:
  - Linux tar.gz package
  - `README_CN.txt`
- Linux package output name format:
  - `Excel Strict Searcher-<version>-linux.zip`
- Build logic for the GitHub zip:
  - source command: `npm run package:github-release`
  - the release sync script prepares the Linux staging content and compresses it
  - zip output: `github\Excel Strict Searcher-<version>-linux.zip`
  - zip root folder must be: `linux\`
  - required contents include:
    - Linux startup files
    - Linux archive payload
    - `README_CN.txt`
- Rebuild rule:
  - Linux zip should be refreshed together with the two Windows zips via the same final release command
  - after sync, only the final zip remains in `github\`; temporary Linux staging folders must be cleaned

## README Requirements For Delivery Packages
Each final zip must contain a Chinese README.

The README inside the package must clearly state:
- what platform the package is for
- how to start or install it
- whether Node.js is required
- that the UI supports Chinese / English / Japanese
- that the tool is local and read-only

## Problems Encountered Today
### 1. Too Many Intermediate Folders And Variants
Problem:
- The workspace accumulated `desktop-wrapper`, `web-build`, unpacked lightweight runtime folders, temp staging folders, old zip files, and historical package variants.

Requirement:
- Future finalization must clean the `github\` folder back to `source + 3 final zip files only`.

### 2. Closed Chat / Progress Recovery Was Hard
Problem:
- Previous session state had to be reconstructed from files rather than from preserved task notes.

Requirement:
- Important build decisions and release constraints must be written to root-level markdown files like this one.

### 3. Windows Installer And Portable Package Naming Conflict
Problem:
- Installer and portable package originally risked overwriting each other due to artifact naming collisions.

Requirement:
- Different package types must always use distinct filenames.

### 4. Linux Packaging On Windows Host Was Fragile
Problems encountered:
- `AppImage` failed because of symlink privilege issues on Windows.
- `deb` packaging required `fpm`.
- Linux tar packaging could timeout and needed a dedicated rerun.

Requirements:
- Linux `tar.gz` may be produced on Windows if it succeeds.
- Linux `deb` / `AppImage` should be built on Linux hosts when needed.
- Do not assume Windows can reliably produce all Linux desktop package types.

### 5. Temporary File Locks
Problem:
- Some temporary folders such as unpacked lightweight runtime remained locked by lingering `node.exe` or shell processes.

Requirements:
- Before cleanup, ensure no build helper process is still running.
- If a directory cannot be removed, check for active `node.exe`, shell, or explorer handles.
- Clean up helper tools downloaded only for troubleshooting unless intentionally kept.

### 6. PowerShell Policy And Command Parsing Issues
Problems encountered:
- Some PowerShell commands with delete operations were blocked by policy.
- `&` chaining caused parsing issues in PowerShell wrapper execution.

Requirements:
- Prefer simple commands.
- Use `cmd /c` for chained Windows cleanup commands when PowerShell parsing interferes.
- Avoid assuming shell behavior is identical across wrapped command execution.

### 7. Lightweight Runtime Strategy Changed
Problem:
- Full Node-related packaging would have been too large and unattractive for users.

Final requirement:
- Lightweight package must use the official Node.js installer strategy instead of bundling a huge runtime tree.

### 8. Root-Level Documentation Gap
Problem:
- Build requirements were not previously synchronized to the root workspace docs.

Requirement:
- When major packaging rules change, update a root-level markdown document.

### 9. Windows Installer Disclaimer Garbling
Problem:
- The installer disclaimer page produced garbled text such as `浣犻渶瑕` or `��E`.
- The issue was caused by unstable text encoding behavior in installer-side license rendering.

Final requirement:
- Stability is more important than forcing a multilingual license page inside the installer.
- The Windows installer must avoid any step that can display multilingual gibberish.
- The current stable direction is:
  - keep the installer flow normal
  - remove the problematic garbled license-page approach
  - keep detailed disclaimer text in packaged README / product documentation instead

### 10. Local Excel Test File Concern
Problem:
- A previously imported Excel file appeared during testing and raised concern that a test workbook had been shipped in source or GitHub.

Findings:
- No `.xls`, `.xlsx`, `.xlsm`, or `.csv` test workbook was found in the source package area that was prepared for GitHub sync.
- The observed file was consistent with local browser cache or IndexedDB persistence rather than a shipped source artifact.

Requirement:
- Treat cached imported files as local browser state unless the file is actually present in the source tree.
- Before public release review, verify that no test workbook exists in source-controlled directories.

### 11. Final Folder Structure Drift
Problem:
- Temporary rebuilds can accidentally leave unpacked installer folders beside the final zip files.

Requirement:
- After every rebuild, re-check the `github\` directory and remove any unpacked release folder so that only `source\` and the 3 final zip files remain.

## Operator Checklist
- For normal final rebuilds, use only:
  - `npm run package:github-release`
- For Windows desktop package debugging only:
  - `npm run package:portable-exe`
- For Windows lightweight compatibility package debugging only:
  - `npm run package:portable-runtime`
- After any final rebuild, confirm the exact `github\` contents are:
  - `source\`
  - `Excel Strict Searcher-<version>-windows-setup.zip`
  - `Excel Strict Searcher-<version>-windows-lightweight.zip`
  - `Excel Strict Searcher-<version>-linux.zip`

## Current Confirmed State
- Root delivery folder:
  - `github\`
- Required final structure:
  - `source\`
  - `Excel Strict Searcher-2.0.0-windows-setup.zip`
  - `Excel Strict Searcher-2.0.0-windows-lightweight.zip`
  - `Excel Strict Searcher-2.0.0-linux.zip`
- Current Windows setup zip contains:
  - desktop-window package entry
  - `README_CN.txt`
- Current Windows desktop package logic is:
  - `EaaSE.exe -> local Node.js service -> WebView2 desktop window -> React UI`
- Current source tree includes multilingual README files for GitHub:
  - `README.md`
  - `README.zh-CN.md`
  - `README.ja.md`

## Future Build Checklist
Before building:
- Confirm UI language support still works for `zh`, `en`, `ja`.
- Confirm `source\` is complete and buildable.
- Confirm the lightweight package still downloads or includes the official Node.js MSI.
- Confirm package READMEs are present and current.

After building:
- Verify Windows installer exists.
- Verify Windows lightweight zip exists.
- Verify Linux zip exists.
- Verify each zip contains its required README.
- Verify `github\` contains only `source\` plus the 3 final zip files.
- Verify the Windows installer does not show multilingual garbled text.
- Verify GitHub README files still follow the English-first + split-language structure.

## Notes About Temporary Tools
During troubleshooting on 2026-03-23, Sysinternals `handle.exe` was used to identify a lock on the `lightweight-runtime` directory by `node.exe`.

Future rule:
- Temporary troubleshooting tools should not remain in the final delivery area unless they are intentionally documented and needed.
