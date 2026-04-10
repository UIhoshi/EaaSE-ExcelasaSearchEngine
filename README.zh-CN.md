<div align="center">

# EaaSE

### Excel as a Search Engine

把本地 Excel 工作簿变成一个可搜索、可定位、适合桌面使用的检索引擎。

[![版本](https://img.shields.io/badge/version-2.0.0-111111?style=for-the-badge)](./package.json)
![平台](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0f766e?style=for-the-badge)
![界面](https://img.shields.io/badge/ui-zh%20%7C%20en%20%7C%20ja-b91c1c?style=for-the-badge)
![搜索](https://img.shields.io/badge/search-严格子串-1d4ed8?style=for-the-badge)
![运行](https://img.shields.io/badge/runtime-本地优先-7c3aed?style=for-the-badge)
![协作](https://img.shields.io/badge/built%20with-Codex%20%2B%20Gemini-f59e0b?style=for-the-badge)

[English](./README.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md)

</div>

> 只保留两个动作：
>
> 1. 导入
> 2. 选择 Excel

## 项目定位

EaaSE 是一个本地运行、只读处理的 Excel 检索工具，适用于多文件、多 Sheet、宽表场景下的快速定位与严格搜索。它不是把 Excel 上传出去的在线服务，而是把检索、缓存、配置和桌面体验尽量都留在本机。

本项目协作分工：
- Codex 负责实现与工程修改
- Gemini 负责审阅与规划

这个名字分工需要在对外材料里明确保留：
- Codex 代表编程、工程实现与落地
- Gemini 代表规划、审阅与方向整理

## 快速概览

| 维度 | 当前状态 |
| --- | --- |
| 文件规模 | 最多 1000 个同时载入文件 |
| 支持格式 | `.xls`、`.xlsx`、`.xlsm`、`.csv` |
| 搜索模型 | 基于 `String.includes()` 的严格子串匹配 |
| 运行形态 | 本地 Node.js 服务 + React UI + Windows WebView2 桌面窗口 |
| 数据保存 | `config/cache.db` + `config/*.json` |
| 项目档案 | `.eaase.json` 导入导出 |
| 界面语言 | 中文、英文、日文 |
| 大结果处理 | Web Worker 搜索 + 虚拟列表渲染 |

## 版本演进

### V1.0.0
- 建立了最初的本地 Excel 严格检索基线。
- 建立了源码导向发布和多语言 README 结构。
- 最多支持 20 个缓存文件同时参与检索。
- 提供按 `文件 -> Sheet` 分组的基础搜索体验。

### V1.1.0
- 从纯网页工具逐步转向本地 API + 前端的混合架构。
- 引入绝对路径、打开所在文件夹、配置导入导出等本地能力。
- 确立 `EaaSE.exe` 桌面窗口封装方向。
- 建立当前 Windows 主包、Windows 轻量包、Linux 包的发布链路。

### V2.0.0
- 工作集上限提升到最多 1000 个同时载入文件。
- 数据保存方式升级为本地运行时持久化：`config/cache.db` + `config/*.json`。
- 新增 `.eaase.json` 项目档案导入导出，便于场景切换、备份和迁移。
- 稳定当前桌面启动链路：`EaaSE.exe -> 本地 Node 服务 -> WebView2 桌面窗口 -> React UI`。
- 新增文件夹导入、文件筛选、标准/扩展布局切换、全部列/仅标签列切换、命中 Sheet 快速跳转、回到顶部等 UI 能力。
- 搜索执行改为 Web Worker，结果区改为虚拟列表。

## V2.0.0 的关键变化

| 维度 | 过去 | 现在 |
| --- | --- | --- |
| 文件容量 | V1.0.0 阶段约 20 文件规模 | 提升到最多 1000 文件 |
| 数据保存 | 更偏浏览器侧缓存 | 本地 `cache.db` 和 `config/*.json` |
| 项目迁移 | 能力有限 | 支持 `.eaase.json` 档案导入导出 |
| Windows 体验 | 容易回到浏览器优先 | 以 `EaaSE.exe` 桌面窗口为主 |
| 检索流程 | 基础搜索浏览 | 文件夹导入、筛选、跳转、回顶 |
| 大结果表现 | 中小规模为主 | Web Worker + 虚拟列表 |

## 当前能力

- 支持单文件导入和整文件夹导入
- 支持 `.xls`、`.xlsx`、`.xlsm`、`.csv`
- 最多同时保留 1000 个文件
- 搜索结果按 `文件 -> Sheet` 分组展示
- 支持多层表头、合并单元格、Excel 列字母、标签列筛选
- 支持单元格复制、整行复制、关键词高亮、命中 Sheet 快速跳转
- 支持标准/扩展布局切换
- 支持全部列/仅标签列切换
- 支持基于真实本地路径打开所在文件夹
- 运行日志保存在 `config/startup.log`、`config/server.log`、`config/runtime-metrics.log`

## 数据保存方式

- 软件启动时会优先恢复默认缓存，尽量做到打开即用。
- Excel 工作簿结构、Sheet 行数据与搜索缓存保存在 `config/cache.db`。
- 项目档案和界面偏好保存在 `config/*.json`。
- 手动导入导出的项目档案使用 `.eaase.json`。
- 软件只读处理，不会修改原始 Excel 文件。

## 开发与测试

```bash
npm install
npm run dev
```

`npm run dev` 会同时启动本地 API 服务和 Vite 开发服务器。

```bash
npm run quickstart
```

快速网页模式只启动前端。如果本地 API 不可用，导入会回退到浏览器文件选择，此时无法获得真实本地路径。

## 构建与发布

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

## 目录说明

- `src/`: React 界面、hooks、Worker、样式与前端逻辑
- `scripts/`: 本地运行时与打包脚本
- `config/`: 本地运行时生成的缓存、档案与日志目录
- `README.md`: 英文首页
- `README.zh-CN.md`: 中文首页
- `README.ja.md`: 日文首页
- `package.json`: 依赖与脚本入口

## GitHub 同步规则

- 只同步源码导向内容到 GitHub。
- 不同步本地运行产物、`node_modules`、`dist`、临时打包目录、日志以及其他 build 副产物。
