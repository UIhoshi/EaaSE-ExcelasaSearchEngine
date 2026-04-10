# EaaSE Agent Logic 项目映射说明

本文件不替代 [agentlogic.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/agentlogic.md)。

它的职责只有一个：
- 把 `agentlogic.md` 的抽象 L1 / L2 / L3 协作框架，映射到当前 EaaSE 仓库的真实文件、真实流程和真实交付规则

若只需要最快进入项目，请先看：
- [AI_SESSION_QUICKSTART.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/AI_SESSION_QUICKSTART.md)

---

## 1. 使用原则
- `agentlogic.md` 继续作为总框架，不直接修改，除非项目出现明显更优的通用改进点并且得到用户确认
- 当前仓库的 AI 执行，应优先读取本文件，再按任务性质进入对应层级
- 若任务同时涉及代码、文档、打包，则默认使用 `L2 + L3 + Sync Gatekeeper` 组合视角

---

## 2. L1 / L2 / L3 映射

### 2.1 L1: 战略与入口层
当前仓库中，L1 对应这些文件：
- [PLAN_ENHANCEMENT_V1.1.0.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/PLAN_ENHANCEMENT_V1.1.0.md)
- [README.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/README.md)

L1 负责回答：
- 当前版本目标是什么
- 产品当前架构是什么
- Windows 交付方向是什么
- 本轮迭代是否偏架构、偏修复、偏发布

### 2.2 L2: 领域架构层
当前仓库中，L2 对应这些文件：
- [REQUIREMENTS.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/REQUIREMENTS.md)
- [TECHNICAL_SPEC.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/TECHNICAL_SPEC.md)
- [UI_UX_SPEC.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/UI_UX_SPEC.md)
- [BUILD_RELEASE_REQUIREMENTS.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/BUILD_RELEASE_REQUIREMENTS.md)

L2 负责回答：
- 搜索、配置、文件管理、结果渲染应该怎么实现
- UI 布局和交互应该遵守什么规则
- 打包、发布、目录清理应该遵守什么规则

### 2.3 L3: 原子执行层
当前仓库中，L3 暂不单独拆出 `L3_FUNCTION_REGISTRY.md`。

当前阶段，L3 由以下内容共同承担：
- 真实源码文件
- 根目录分层 md
- 本文件中的执行顺序与项目硬约束

后续若项目继续扩大，再考虑单独拆出：
- `L3_FUNCTION_REGISTRY.md`
- `tasks/todo.md`
- `tasks/lessons.md`

---

## 3. 当前默认角色判定

### 3.1 默认规则
- 小型修复、UI 微调、明确 bug：默认 `L3 + Sync Gatekeeper`
- 中型功能、跨模块修改：默认 `L2 + L3 + Sync Gatekeeper`
- 架构重构、版本规划、打包策略变更：默认 `L1 + L2 + Sync Gatekeeper`

### 3.2 何时需要主动问用户角色
只有在以下情况才需要显式确认：
- 任务跨 L1 / L2 / L3 边界且方向不明确
- 需要新增新的分层文档或改变文档体系
- 需要改变既有产品方向，而不只是同步已确认实现

若任务本身已经很明确，则不必每次先问“当前扮演哪个层级”。

---

## 4. EaaSE 项目硬约束

以下规则优先级很高，后续 AI 进入本仓库时应默认遵守：

- 搜索逻辑必须保持严格 `String.includes()` 语义不变
- UI 必须持续支持 `zh-CN / en-US / ja-JP`
- 语言切换必须是全局界面语言入口，不能埋在配置区里
- 默认缓存与手动配置统一读写软件目录下的 `config/`
- 手动导入任意配置后，当前工作集必须覆盖默认缓存
- 文件管理区必须保持精简树状结构
- 查询结果区必须保留直观的“打开所在位置”入口
- 若当前模式无法获得真实绝对路径，仍需显示相关操作，但以禁用态说明原因
- 扩展模式优先适配当前窗口，再让局部表格横向滚动

### 4.1 Windows 封装铁律
- Windows 散装版与正式安装包都以旧 `windows-setup.zip` 的桌面窗口逻辑为基线
- 当前已确认的 Windows 桌面封装逻辑是：
  - `EaaSE.exe`
  - 本地 Node.js 服务
  - WebView2 桌面窗口承载 React UI
  - 配置统一使用软件目录 `config/`
- 不得再次把“浏览器启动器”当作正式 Windows 方向

### 4.2 发布目录铁律
- [artifacts/windows-portable-exe](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/artifacts/windows-portable-exe) 是当前保留的 Windows 散装测试包
- [scripts/sync-github-release.mjs](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/scripts/sync-github-release.mjs) 是当前 GitHub 发布目录重建脚本
- `artifacts/` 中其他临时打包目录在最终同步后应清理
- [github](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/github) 最终只保留：
  - `source/`
  - `windows-setup.zip`
  - `windows-lightweight.zip`
  - `linux.zip`

### 4.3 稳定源码回退基线
- 当前仓库已保留一份可回退的 v2.0 稳定源码快照：
  - [EaaSE-v2.0-stable-source.zip](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/version-backups/v2.0-stable-source/EaaSE-v2.0-stable-source.zip)
- 该快照的职责是：
  - 作为后续 v2.x 迭代的稳定源码基线
  - 作为需要人工回退时的源码参照
  - 作为 AI 后续进入仓库时的“已确认稳定状态”快照
- 这类源码快照默认不应包含：
  - `node_modules`
  - 本地运行缓存
  - 临时构建副产物
  - 日志与临时配置状态
- 当前这份快照的包含/排除说明见：
  - [MANIFEST.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/version-backups/v2.0-stable-source/MANIFEST.md)

---

## 5. 标准执行顺序

### 5.1 代码任务
1. 先读相关 L1 / L2 文档
2. 再读目标源码文件
3. 修改代码
4. 运行最小必要验证
5. 同步更新对应根目录 md
6. 如果涉及打包或目录结构，再更新发布相关 md

### 5.2 打包任务
1. 先读 [BUILD_RELEASE_REQUIREMENTS.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/BUILD_RELEASE_REQUIREMENTS.md)
2. 再读当前打包脚本
3. 生成目标产物
4. 校验 `artifacts/` 与 `github/` 结构
5. 删除副产物
6. 把最终规则回写到根目录 md

### 5.3 UI 任务
1. 先读 [UI_UX_SPEC.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/UI_UX_SPEC.md)
2. 再读相关组件与样式
3. 修改实现
4. 自检窗口缩放、标题换行、树状区、结果区入口可见性
5. 把新增 UI 规则同步到相关 md

---

## 6. 同步协议落地版

### 6.1 允许同步更新文档
当前项目不采用“L3 严禁碰 L1/L2 文档”的硬限制。

实际规则是：
- L3 可以更新 L1 / L2 文档
- 但只能做“实现落地同步、规则补全、状态更新”
- 不得擅自改变产品方向或推翻既定架构

### 6.2 何时必须同步 md
以下情况必须同步根目录 md：
- 新增或删除功能
- UI 行为改变
- 配置逻辑改变
- Windows 打包逻辑改变
- 发布目录结构改变
- 用户明确要求“写进 md”

---

## 7. 日志自治协议

以后在这个项目里，遇到运行失败时，优先由 AI 主动读取日志，而不是要求用户手贴。

### 7.1 常见日志入口
- [artifacts/windows-portable-exe/config/startup.log](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/artifacts/windows-portable-exe/config/startup.log)
- [artifacts/windows-portable-exe/config/server.log](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/artifacts/windows-portable-exe/config/server.log)

### 7.2 默认动作
- 用户提到“启动失败 / 定位失败 / 打包失败 / 没反应”时
- 应优先读日志、查当前产物、再给结论
- 不能把“先贴日志”当默认第一反应

### 7.3 安装器无响应的默认排查顺序
- 若用户反馈“安装包双击无反应”，优先排查顺序固定为：
  1. 是否成功创建进程
  2. 是否存在主窗口句柄
  3. Windows Application 日志中的 `.NET Runtime` / `Application Error` / `Windows Error Reporting`
- 当前仓库已经发生过一个真实故障：
  - `InstallerForm.ApplyText()` 在安装器控件未完成初始化时被过早触发
  - 直接导致 `NullReferenceException`
  - 用户体感上表现为“双击安装包无反应”
- 以后做 WinForms/WPF 多语言安装器时，应优先避免“事件先触发、控件后初始化”的写法

---

## 8. UI 回归重点

每次涉及界面改动时，至少应复核这些点：
- 标题区在窗口缩放时不能突然挤成一条
- 全局语言切换区域不能在窄窗口塌成细条
- 扩展模式优先贴合窗口，再局部横向滚动
- 文件树必须可折叠
- 结果区左侧“打开所在位置”入口必须明显
- 中文路径、中文文件名、日文内容不能乱码

---

## 9. 后续演进建议

当前不直接修改 [agentlogic.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/agentlogic.md)。

若未来项目继续扩大，可以在得到用户确认后再考虑：
- 拆出 `L3_FUNCTION_REGISTRY.md`
- 拆出 `tasks/todo.md`
- 拆出 `tasks/lessons.md`
- 把本文件中已经稳定的项目规则，上收合并回 `agentlogic.md`
