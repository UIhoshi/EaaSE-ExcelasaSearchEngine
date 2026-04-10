# Version Bump Checklist

本文件用于记录 EaaSE 项目从一个版本提升到下一个版本时的固定检查项。
目标是让版本升级尽量机械化，避免遗漏源码、文档、打包产物与 GitHub 发布目录之间的同步。

## Standard Flow
1. 修改 [package.json](C:\Users\XU RONG\Documents\workspace\excel search\package.json) 与 [package-lock.json](C:\Users\XU RONG\Documents\workspace\excel search\package-lock.json) 中的 `version`
2. 检查是否存在写死的版本号文案
3. 更新根目录文档中的当前版本描述
4. 重新执行最终发布命令
5. 复核 `artifacts/` 与 `github/` 的最终结构

## Files To Check
- [package.json](C:\Users\XU RONG\Documents\workspace\excel search\package.json)
  - 必改
  - 这是脚本和 zip 文件名的版本来源

- [README.md](C:\Users\XU RONG\Documents\workspace\excel search\README.md)
  - 检查英文主 README 是否已更新当前版本与版本演进说明

- [README.zh-CN.md](C:\Users\XU RONG\Documents\workspace\excel search\README.zh-CN.md)
  - 检查中文 README 是否已更新当前版本与版本演进说明

- [README.ja.md](C:\Users\XU RONG\Documents\workspace\excel search\README.ja.md)
  - 检查日文 README 是否已更新当前版本与版本演进说明

- [BUILD_RELEASE_REQUIREMENTS.md](C:\Users\XU RONG\Documents\workspace\excel search\BUILD_RELEASE_REQUIREMENTS.md)
  - 检查“当前示例版本号”是否需要从旧版更新到新版

- [AI_SESSION_QUICKSTART.md](C:\Users\XU RONG\Documents\workspace\excel search\AI_SESSION_QUICKSTART.md)
  - 检查是否引用了带版本号的计划文件或示例包名

- [PLAN_ENHANCEMENT_V1.1.0.md](C:\Users\XU RONG\Documents\workspace\excel search\PLAN_ENHANCEMENT_V1.1.0.md)
  - 若版本升级意味着新规划阶段，应确认是否需要新增新的计划文档，而不是继续沿用旧名字

- [scripts/sync-github-release.mjs](C:\Users\XU RONG\Documents\workspace\excel search\scripts\sync-github-release.mjs)
  - 一般不需要手改版本
  - 但要确认 zip 命名仍然来自 `package.json`

## Final Build Command
正常升版后，统一使用：

```bash
npm run package:github-release
```

不要手动分别重建 3 个 zip，除非是在单独调试某一条链路。

## Expected Final Outputs
升版完成后，`github/` 目录应只保留：
- `source/`
- `Excel Strict Searcher-<new-version>-windows-setup.zip`
- `Excel Strict Searcher-<new-version>-windows-lightweight.zip`
- `Excel Strict Searcher-<new-version>-linux.zip`

同时 `artifacts/` 目录应只保留：
- `windows-portable-exe/`

## Verification
升版后至少执行：

```bash
npm run build
npm run package:github-release
```

然后检查：
- `github/` 目录是否已经切换到新版本 zip 名
- `github/source/` 是否为最新源码
- `artifacts/windows-portable-exe/` 是否为最新桌面散包
- 根目录文档是否仍残留旧版本号描述
