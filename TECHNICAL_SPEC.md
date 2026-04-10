## 1. 技术栈
- React 19
- TypeScript
- Vite
- SheetJS `xlsx`
- Node.js 本地 HTTP API
- Web Worker

## 2. 数据解析
- 后端按绝对路径读取 Excel 并提取工作表矩阵
- 解析 `!merges` 生成 `colSpan / rowSpan / hidden / rootRow / rootCol`
- 扫描真实有效列并裁剪尾部空列
- 为每行生成可搜索的拼接文本

## 3. 搜索实现
- 使用严格 `String.includes()`
- 从已加载工作簿中生成候选词
- 搜索与候选词计算在 Web Worker 中执行
- 搜索命中后返回文件、Sheet、行集合和列数信息

## 4. 渲染实现
- 表头支持 N 层
- 最顶层增加 Excel 字母列标
- 表格按可见列重新投影合并单元格
- 行号列 sticky left
- 表头 sticky top
- `ResizeObserver` 用于同步顶部卡片与主内容列宽
- 结果区使用虚拟滚动，仅渲染可视范围内的 Sheet 区块

## 5. 本地 API 与档案
- `/api/fs/pick-files` 调用系统文件选择器并返回绝对路径
- `/api/fs/open-explorer` 打开系统文件管理器并定位文件
- `/api/workbooks/load` 按绝对路径读取并解析 Excel
- `/api/config/load`、`/api/config/save` 管理默认缓存
- `/api/config/import-dialog`、`/api/config/export-dialog` 通过系统文件对话框导入导出 JSON 配置
- 档案根目录固定为软件本体目录下的 `config/`
- 文件指纹由文件名、文件大小、最后修改时间组成
- 前端使用默认缓存和手动导入导出的配置恢复会话
- `config/cache.db` 保存工作簿、Sheet、单元格、合并区等结构化缓存，并保留 `absolutePath` 以支持“打开所在位置”
- 配置 JSON 仅保存项目索引、工作簿指纹、绝对路径和界面偏好
- 启动恢复时优先通过 `cache.db` 还原工作簿缓存；导入旧版 JSON 时仍兼容历史快照或仅路径记录
- 默认缓存使用固定档名维护当前工作集；导入任意配置后会同步覆盖该默认缓存
- 当本地 API 不可用时，前端回退为浏览器文件导入与浏览器侧配置存储
- 服务端会持续输出结构化运行日志到 `config/runtime-metrics.log`
- 日志内容包含服务端内存快照、API 耗时、Workbook 载入统计、UI 会话快照与搜索耗时

## 6. 开发运行
- `npm run dev` 同时启动本地 API 和 Vite 开发服务
- `npm run preview` 使用本地 API 服务直接承载构建产物

## 7. Windows 测试打包
- Windows 后续版本的桌面交付逻辑，以 `github/Excel Strict Searcher-1.0.0-windows-setup.zip` 为参考基线
- 该基线要求 Windows 散装版和 Windows 安装版最终都表现为桌面应用窗口，而不是浏览器优先体验
- `npm run package:portable-exe` 的封装逻辑必须固定为：
  - `EaaSE.exe` 作为 Windows 启动入口
  - 启动本地 Node.js 服务
  - 使用 WebView2 承载 React 界面
  - 配置统一从软件目录下的 `config/` 读取与写入
  - 缺失 Node.js 时提示安装随包附带的官方 MSI
  - 缺失 WebView2 Runtime 时提示安装随包附带的官方引导程序
- 后续版本迭代时，散装版和安装版都必须沿用这条桌面应用封装链路，不得再回退为浏览器启动器
- `npm run package:github-release` 作为最终发布同步入口，负责重建 `github/` 为 `source + 3 zip`

