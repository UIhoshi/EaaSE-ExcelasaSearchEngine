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

**EaaSE** 是一款本地优先的桌面应用程序，旨在将成百上千个本地 Excel 工作簿秒变即时搜索数据库。所有数据均在您的本地设备上进行解析，无需上传远程服务，也无需进行任何数据库迁移配置。

**[English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)**

> [!IMPORTANT]
> **只读安全保障**：EaaSE 对原始 Excel 文件执行严格的只读操作。它只解析表格内容并写入本地的轻量缓存，绝不会对您的原始 Excel 进行任何写入或修改。

---

## 🎯 产品定位

| 目标场景 | EaaSE 解决方案 |
| :--- | :--- |
| **多文件人工查找慢** | 支持将多达 1000 个 `.xls`、`.xlsx`、`.xlsm`、`.csv` 文件一次性导入，在同一个工作区统一检索。 |
| **宽表及复杂结构阅读难** | 结构化的搜索界面，支持按文件/Sheet 分组展示结果、列过滤、多行表头处理和布局视图切换。 |
| **建库维护成本高** | 无需部署大型数据库，直接导入表格即可，EaaSE 自动在后台进行文件状态匹配与缓存更新。 |
| **离线桌面化工作流** | 本地 Node.js 后台服务 + React 前端壳层，提供优于浏览器单机网页版的强持久化体验。 |

---

## 🚀 快速开始

| 启动方式 | 操作步骤 | 具备功能 |
| :--- | :--- | :--- |
| **方式 1：Releases 发布包** | 1. 打开 [Releases 页面](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases)<br>2. 下载适合您平台的压缩包或安装程序<br>3. 启动并拖入文件夹即可使用 | **完整桌面体验** (支持本地路径打开、SQLite 强缓存、高速度检索) |
| **方式 2：从源码运行** | 执行 `npm install`<br>执行 `npm run dev`<br>访问 `localhost:5173` | **完整桌面体验** (开发者调试模式) |
| **方式 3：网页回退版** | 执行 `npm run quickstart` | **纯浏览器沙箱** (使用 Web Worker 搜索，无法读取本地 SQLite 缓存，仅支持网页端上传) |

---

## 🧱 架构设计与仓库目录导航

> [!NOTE]
> **AI 维护门禁规范**：凡是维护本项目的 AI 智能体，**必须**遵循 `AgentLogic/` 中的自进化核心规范，并在修改代码前执行 `check:logic` 自检。

### 仓库目录结构

| 目录与文件 | 核心用途 |
| :--- | :--- |
| `src/` | React 前端界面、自定义 Hooks、Web Workers 以及样式代码 |
| `scripts/` | 本地运行时 Node.js 服务端逻辑与 Releases 发布打包代码 |
| `config/` | 本地生成的 SQLite `cache.db` 缓存文件、工作区归档及运行日志 |
| `AgentLogic/` | 智能体协作规约、主版本说明与拦截门禁 |

### 技术栈与性能亮点
* **前端框架**：React + Vite + TypeScript 编译环境。
* **数据缓存**：基于 SQLite 本地数据库构建的索引引擎，支持快速严格子串（strict substring）匹配。
* **渲染优化**：采用虚拟化列表（Virtualized List）渲染海量搜索结果，防止界面卡死。
* **表格处理**：利用 `xlsx` 库实现超快速的 Sheet 解析和数据结构读取。

---

## ⚡ 核心功能与特性

* **多工作区检索**：跨文件、跨 Sheet 的聚合搜索，可直接加载整个目录。
* **分组追踪**：结果自动按 `文件路径 ➔ 工作表名称` 汇总，快速定位单元格。
* **视图切换**：支持隐藏空列、标签过滤、多行表头自适应布局。
* **归档导入导出**：可将当前工作区的文件关系和搜索索引导出为单个 `.eaase.json` 备份文件。
* **多模式回退**：若 Node.js 后台服务异常，前台自动无缝回退到浏览器 worker 引擎执行匹配。

---

## 🛠️ 本地开发与打包编译

使用 npm 脚本管理、测试及构建项目：

```bash
# 安装项目依赖
npm install

# 运行 Vite 调试服务
npm run dev

# 编译前端代码
npm run build

# 运行本地功能校验测试
npm run verify

# 校验逻辑规范与文档地图
npm run check:logic
npm run check:docs

# 打包发布可分发的正式文件
npm run package:github-release
```

---

## ⚠️ 已知限制

* 网页版 fallback 模式下无法使用本地路径跳转操作，且没有持久化数据库。
* 构建分发包时，在 Windows 宿主机上编译 Linux 安装程序需要依赖跨平台包工具的配置。
* `cache.db` 保留在本机，如需在多台电脑间迁移，需要导出 `.eaase.json` 归档。

---

## 📈 版本演进与记录

| 版本号 | 状态 | 核心优化点 |
| :--- | :--- | :--- |
| **v2.1.0** | 当前稳定版 | 加入 SQLite 物理数据库的删除压缩收缩机制，加固文件夹删除后缓存同步清理，稳定发布包编译。 |
| **v2.0.0** | 历史版本 | 扩容至 1000 级大工作区，引入本地持久化 SQLite db 存储，添加 `.eaase.json` 归档。 |
| **v1.1.0** | 历史版本 | 首次转向本地 Node.js 运行时服务 + 壳层架构。 |
| **v1.0.0** | 历史版本 | 初始 Excel 搜索模型，多语言 README 构建。 |

---

## 🤝 协作开发与授权

* 发现搜索定位或缓存同步问题，请提交 GitHub Issue。
* 发起 PR 时，必须保证已通过 `check:logic` 的本地拦截检验。
* 仓库中当前未声明单独的外部开源许可证。
