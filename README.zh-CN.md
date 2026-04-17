<div align="center">

# EaaSE

**把本地 Excel 工作簿变成桌面级搜索引擎，无需把文件上传到远程服务**

[English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

</div>

<div align="center">

![版本](https://img.shields.io/badge/version-2.1.0-111111?style=for-the-badge)
![平台](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0f766e?style=for-the-badge)
![界面](https://img.shields.io/badge/ui-zh%20%7C%20en%20%7C%20ja-b91c1c?style=for-the-badge)
![运行方式](https://img.shields.io/badge/runtime-local--first-7c3aed?style=for-the-badge)
![搜索模型](https://img.shields.io/badge/search-strict%20substring-1d4ed8?style=for-the-badge)

</div>

## 产品说明

EaaSE 专注解决一个非常具体的问题：在本地、只读、可重复的工作流里，快速搜索大量 Excel 工作簿，而不是把 Excel 数据改造成在线系统或数据库项目。

当前 `2.1.0` 版本重点在于：

- 面向 `.xls`、`.xlsx`、`.xlsm`、`.csv` 的本地优先搜索
- 更接近桌面应用的运行链路，而不是浏览器玩具方案
- 导入归档和删除工作簿后的缓存清理稳定性
- 支持最多 1000 个同时加载文件的大规模工作区

## ✨ 它能帮你解决什么？

- **Excel 文件太多，人工查找太慢**：把多个工作簿放进同一个搜索工作区，不用一份一份打开。
- **桌面查找流程容易出错**：搜索、缓存和配置都保留在本地，适合反复检索的场景。
- **宽表格难以阅读和定位**：支持按 `文件 -> Sheet` 分组、标签列过滤、多行表头和布局切换。
- **不想为查 Excel 另起数据库项目**：直接导入文件即可，原始 Excel 文件保持不变。

## 快速开始

### 方式 1：使用 GitHub Releases 里的发布资产

1. 打开 Releases 页面：
   `https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases`
2. 下载适合你平台或使用方式的安装包 / 压缩包。
3. 启动程序后导入一个或多个 Excel 文件，或直接导入整个文件夹。
4. 在同一个工作区中跨文件、跨 Sheet 搜索。

### 方式 2：从源码运行本地桌面链路

1. 安装依赖：

```bash
npm install
```

2. 启动本地运行链路：

```bash
npm run dev
```

3. 导入一个或多个 Excel 文件，或直接导入整个文件夹。
4. 在同一个工作区中跨文件、跨 Sheet 搜索。

### 方式 3：使用网页回退模式

```bash
npm run quickstart
```

在 quickstart 模式下：

- 文件导入会回退到浏览器文件选择
- 搜索会回退到 Web Worker
- 本地路径相关操作不可用

> 重要提示：
> EaaSE 是本地、只读工具，不会修改原始 Excel 文件。

## 一眼看懂

<div align="center">

| 项目 | 说明 |
|------|------|
| 版本 | `2.1.0` |
| 运行形态 | 本地 Node.js 服务 + React UI + 桌面壳层 |
| 文件规模 | 最多 1000 个同时加载文件 |
| 支持格式 | `.xls`、`.xlsx`、`.xlsm`、`.csv` |
| 持久化 | `config/cache.db` 与 `config/*.json` |
| 归档格式 | `.eaase.json` |
| 界面语言 | 中文、英文、日文 |
| 文档入口 | `AGENTS.md`、`PROJECT_FACT_MAP.md`、`AgentLogic/` |

</div>

## ✨ 核心功能

- 在同一个工作区里搜索多个 Excel 工作簿和多个 Sheet。
- 搜索结果按 `文件 -> Sheet` 分组展示。
- 支持文件夹导入、文件过滤、标签列过滤和布局切换。
- 通过 `config/cache.db` 和 `config/*.json` 保持本地运行时状态。
- 支持 `.eaase.json` 工作区归档导入导出。
- 当本地 API 不可用时，可回退到 Web Worker 搜索路径。

## 文档与逻辑入口

如果你要维护或扩展这个项目，先看这些文件：

- `AGENTS.md`
- `PROJECT_FACT_MAP.md`
- `AgentLogic/00_README.md`
- `AgentLogic/AgentLogic_V6.md`

仓库检查命令：

```bash
npm run check:logic
npm run check:docs
```

当前协作分工：

- Codex 负责实现。
- Gemini 负责 review 和规划。

## 技术实现

**技术栈**

- React
- TypeScript
- Vite
- 本地 Node.js 运行时服务
- 通过 `xlsx` 处理 Excel 数据

**架构亮点**

- 本地优先桌面工作流，而不是远程托管服务
- 优先通过本地 API 缓存执行搜索
- 浏览器快速模式下回退到 Web Worker
- 面向大结果集的虚拟化渲染
- 对原始 Excel 文件保持只读处理

**仓库结构**

| 路径 | 用途 |
|------|------|
| `src/` | React 界面、hooks、worker、样式和前端逻辑 |
| `scripts/` | 本地运行时服务与打包脚本 |
| `config/` | 本地运行时生成的缓存、归档和日志 |
| `AgentLogic/` | 仓库逻辑入口与协作规则 |
| `README.zh-CN.md` / `README.ja.md` | 多语言 README 页面 |

## 开发

```bash
npm install
npm run dev
npm run build
npm run verify
```

发布打包命令：

```bash
npm run package:github-release
```

## 已知限制

- 当前仓库没有为 README 提供截图或 GIF 资源。
- quickstart 浏览器模式只是回退路径，不代表完整本地运行体验。
- 本地路径相关操作依赖本地运行时服务可用。

## 发布说明

`2.1.0` 当前重点包括：

- `.eaase.json` 导入后的缓存清理加固
- 删除工作簿后的缓存清理
- SQLite 物理压缩回收
- 面向便携版和安装版的正式发布打包

正式发布资产可从 Releases 页面获取：

- `https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases`

## 版本演进

- `v2.1.0`：加固缓存清理，补上 SQLite 物理压缩回收，并稳定正式发布打包输出。
- `v2.0.0`：扩展到 1000 文件工作区，引入本地持久化，并加入 `.eaase.json` 项目归档。
- `v1.1.0`：开始转向本地 API + 桌面优先运行链路。
- `v1.0.0`：建立最初的严格 Excel 搜索基线和第一版多语言 README 结构。

## 贡献 / 支持

- 如果你发现搜索模型、缓存流程或工作区行为问题，欢迎提交 Issue。
- 如需提交 PR，请先阅读项目文档和逻辑入口文件。

## License

当前仓库尚未声明单独的许可证文件。
