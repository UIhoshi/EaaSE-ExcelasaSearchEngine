# EaaSE

**EaaSE — Excel as a Search Engine**

语言：
- [English](./README.md)
- [中文](./README.zh-CN.md)
- [日本語](./README.ja.md)

**EaaSE = Excel as a Search Engine**

EaaSE 的含义是：把 Excel 变成一个可以搜索的搜索引擎。

只需要两个步骤，就可以把您的 Excel 变成一个可以搜索的搜索引擎：
1. 导入
2. 选择 Excel

这是一个本地运行、只读处理的 Excel 严格搜索工具，适合多文件、多 Sheet、宽表检索场景。

本项目的协作方式是：Codex 负责编程实现，Gemini 负责 review 与规划。

## 功能亮点
- 支持 `.xls`、`.xlsx`、`.xlsm`、`.csv`
- 最多同时缓存并检索 20 个文件
- 使用严格 `String.includes()` 匹配
- 结果按 `文件 -> Sheet` 分组展示
- 支持多层表头、标签列筛选、关键词高亮
- 支持单元格复制、整行复制、命中 Sheet 快速跳转
- 支持中文、English、日本語三种界面语言切换

## 下载与版本
- Windows 安装版：适合普通桌面用户
- Windows 轻量版：适合希望减少下载体积的用户
- Linux 版：提供压缩发布包
- 源码版：用于开发、维护和 GitHub 同步

## 仓库内容
- `src/`: 前端页面与逻辑
- `scripts/`: 本地运行和轻量打包脚本
- `README.md`: 英文说明
- `README.zh-CN.md`: 中文说明
- `README.ja.md`: 日文说明
- `package.json`: 依赖与脚本入口

## 快速开始
```bash
npm install
npm run dev
```

## 构建
```bash
npm run build
```
