# EaaSE

**EaaSE - Excel as a Search Engine**

语言：
- [English](./README.md)
- [中文](./README.zh-CN.md)
- [日本語](./README.ja.md)

EaaSE 是一个本地运行、只读处理的 Excel 检索工具，适用于多文件、多 Sheet、宽表场景下的快速定位与严格搜索。

它坚持一个非常直接的使用方式：
1. 导入
2. 选择 Excel

本项目协作分工：
- Codex 负责实现与工程修改
- Gemini 负责审阅与规划

## 版本演进
### V1.0.0
- 建立了 `EaaSE - Excel as a Search Engine` 的最初源码发布基线。
- 以本地 Excel 严格子串检索为核心能力。
- 支持 `.xls`、`.xlsx`、`.xlsm`、`.csv`。
- 最多支持 20 个缓存文件同时参与检索。
- 搜索结果按 `文件 -> Sheet` 分组展示。
- 支持中文、英文、日文三语界面切换。

### V1.1.0
- 从纯网页工具逐步转向本地 API + 前端的混合架构。
- 引入绝对路径、打开所在文件夹、配置导入导出等本地能力。
- 开始突破 V1.0.0 的文件规模限制。
- 确立 `EaaSE.exe` 桌面窗口封装方向，不再把浏览器优先作为长期目标。
- 建立当前 Windows 主包、Windows 轻量包、Linux 包的发布链路。

### V2.0.0
- 工作集上限提升到最多 1000 个同时载入文件。
- 数据保存方式从浏览器侧缓存，升级为本地运行时持久化：`config/cache.db` + `config/*.json`。
- 新增 `.eaase.json` 项目档案导入导出，便于场景切换、备份和跨机器迁移。
- 稳定当前桌面启动链路：`EaaSE.exe -> 本地 Node 服务 -> WebView2 桌面窗口 -> React UI`。
- 新增文件夹导入、文件筛选、标准/扩展布局切换、全部列/仅标签列切换、命中 Sheet 快速跳转、回到顶部等 UI 能力。
- 搜索执行改为 Web Worker，结果区改为虚拟列表，更适合大规模结果展示。

## 当前能力
- 支持 `.xls`、`.xlsx`、`.xlsm`、`.csv`
- 支持单文件导入和整文件夹导入
- 最多同时保留 1000 个文件
- 基于 `String.includes()` 做严格子串匹配
- 搜索结果按 `文件 -> Sheet` 分组展示
- 支持多层表头、合并单元格、Excel 列字母、标签列筛选
- 支持单元格复制、整行复制、关键词高亮、命中 Sheet 快速跳转
- 支持 `zh-CN / en-US / ja-JP` 三语切换
- 运行日志保存在 `config/startup.log`、`config/server.log`、`config/runtime-metrics.log`

## 数据保存方式
- 软件启动时会优先恢复默认缓存，尽量做到打开即用。
- Excel 工作簿结构、Sheet 行数据与搜索缓存保存在 `config/cache.db`。
- 项目档案和界面偏好保存在 `config/*.json`。
- 手动导入导出的项目档案使用 `.eaase.json`。
- 软件只读处理，不会修改原始 Excel 文件。

## UI 与工作流更新
- 文件夹导入，适合批量导入工作簿
- 基于真实本地路径的“打开所在文件夹”能力
- 文件筛选，用于缩小当前工作集范围
- 标准/扩展两种布局模式
- 全部列/仅标签列两种列显示模式
- 命中 Sheet 快速跳转和回到顶部
- Web Worker 搜索执行与结果虚拟列表

## 开发启动
```bash
npm install
npm run dev
```

`npm run dev` 会同时启动本地 API 服务和 Vite 开发服务器。

## 快速网页测试
```bash
npm run quickstart
```

快速网页模式只启动前端。如果本地 API 不可用，导入会回退到浏览器文件选择，此时无法获得真实本地路径。

## 构建与打包
```bash
npm run build
npm run preview
npm run package:github-release
```

最终发布命令会生成：
- `github/source/`
- `github/Excel Strict Searcher-2.0.0-windows-setup.zip`
- `github/Excel Strict Searcher-2.0.0-windows-lightweight.zip`
- `github/Excel Strict Searcher-2.0.0-linux.zip`

说明：
- `windows-setup.zip` 是当前主推的 Windows 桌面交付物
- `windows-lightweight.zip` 仅作为兼容与对照用途保留
- Linux 版本以压缩运行包方式交付
- 最终 `github/` 目录应只保留 `source/` 和 3 个 zip

## 目录说明
- `src/`: React 界面、hooks、Worker、样式与前端逻辑
- `scripts/`: 本地运行时与打包脚本
- `config/`: 本地运行时生成的缓存、档案与日志目录
- `README.md`: 英文说明
- `README.zh-CN.md`: 中文说明
- `README.ja.md`: 日文说明
- `package.json`: 依赖与脚本入口

## GitHub 同步规则
- 只同步源码导向内容到 GitHub。
- 不同步本地运行产物、`node_modules`、`dist`、临时打包目录、日志以及其他 build 副产物。
- `agentlogic.md` 这类内部协作说明不进入公开源码同步范围。
