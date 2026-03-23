## 1. 技术栈
- React 19
- TypeScript
- Vite
- SheetJS `xlsx`
- IndexedDB

## 2. 数据解析
- 从工作表中提取单元格矩阵
- 解析 `!merges` 生成 `colSpan / rowSpan / hidden / rootRow / rootCol`
- 扫描真实有效列并裁剪尾部空列
- 为每行生成可搜索的拼接文本

## 3. 搜索实现
- 使用严格 `String.includes()`
- 从缓存工作簿中生成候选词
- 搜索命中后返回文件、Sheet、行集合和列数信息

## 4. 渲染实现
- 表头支持 N 层
- 最顶层增加 Excel 字母列标
- 表格按可见列重新投影合并单元格
- 行号列 sticky left
- 表头 sticky top
- `ResizeObserver` 用于同步顶部卡片与主内容列宽

## 5. 缓存与去重
- 文件指纹由文件名、文件大小、最后修改时间组成
- 解析结果存入 IndexedDB
- 页面刷新时自动恢复缓存文件

## 6. v1 工程状态
- 仅保留源码和开发配置
- 已移除分发包、构建目录、依赖目录和历史 Electron 产物
- 当前仓库作为 v1 源码基线

