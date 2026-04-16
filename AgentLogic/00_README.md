# AgentLogic_V6

本目录是基于当前仓库 `C:\Users\XU RONG\Downloads\claude-code-main\claude-code-main` 提炼出来的分层逻辑包，不是无边界源码镜像。

它的目标是把当前项目中和 Agent、工具、权限、安全、扩展、命令面、源码映射相关的关键信息整理成一套可持续维护的规则包，便于你后续继续升级主逻辑和逻辑包。

## 包内结构

本包采用三层结构：

- 抽象逻辑层
  负责解释系统结构、边界、主链路与维护规则。
- 原始源码层
  直接保留关键工具源码与关键工具基础设施源码。
- 索引映射层
  告诉后续维护者应该先读什么、哪些是条件能力、哪些只是支撑层。

- `AgentLogic_V6.md`
  当前逻辑包内的主逻辑正式版本。
- `01_MasterLogic.md`
  当前主逻辑的增强摘要，承接 `AgentLogic_V6.md` 的方法论。
- `02_Architecture.md`
  系统分层、主要入口、核心调用关系。
- `03_AgenticLoop.md`
  单轮执行链路，从用户输入到模型响应、工具执行、结果回流。
- `04_Tools.md`
  工具系统整合清单，包含分类、启用条件、关键路径。
- `05_PermissionsAndSafety.md`
  权限、计划模式、沙箱、安全判定与验证要求。
- `06_Extensibility.md`
  MCP、Skill、Custom Agent、工作树与插件相关的扩展入口。
- `07_CommandSurface.md`
  斜杠命令与工具/模块的关联视图。
- `08_SourceIndex.md`
  关键文档与关键源码索引，方便后续继续维护。
- `09_CapabilityMatrix.md`
  能力状态矩阵，区分实现、条件启用、stub、flag 关闭等状态。
- `10_PackagingPolicy.md`
  当前逻辑包的分层打包边界和强制保留规则。
- `14_ProjectFactMapTemplate.md`
  项目事实地图标准模板，可直接复制用于新项目接入。
- `15_LogicEntryChecklist.md`
  逻辑入口检查清单标准模板，可直接复制用于启动前核对。
- `16_HeaderRuleTemplate.md`
  固定英文文件头模板，供项目内所有入口源码文件统一复用。
- `raw_tools/`
  直接保留的工具源码层。
- `raw_tooling/`
  工具注册、工具接口、工具编排等关键基础设施源码层。
- `raw_permissions/`
  权限与安全核心源码层。
- `raw_extensions/`
  MCP、skills、agent 扩展核心源码层。
- `raw_commands/`
  命令面原始源码层。
- `11_CrossDirectoryMap.md`
  tools、permissions、mcp、skills、commands 的跨目录关系图。
- `manifest.json`
  当前逻辑包的元信息。

## 维护原则

- 逻辑包优先描述“系统如何工作”，不是机械罗列文件名。
- 工具本体允许直接打包，但必须配套总览和索引。
- 所有关键结论尽量都能回溯到源码或文档。
- 发现更准确的链路、边界、限制时，应优先回写主逻辑文件 `AgentLogic_V6.md`，再同步逻辑包。
- 当前逻辑包是外挂规则包，不是业务项目目录；后续新项目或新模块不得直接在 `AgentLogic_V6` 目录下创建文件。
- 当前逻辑包同样不是具体项目事实本身；项目自己的 `README`、模块文档、接口文档与源码，才是项目事实来源。
- 当 Agent 重新进入项目时，项目主 md 除了承担项目说明职责，还应帮助确认“当前项目逻辑入口是否已定位”；若逻辑文件不在项目目录内，则必须先询问其位置。
- 因此，项目主 README / 主 md 的最小必备项，默认也应包含“当前项目逻辑入口说明”。
- 若项目依赖外部逻辑包，项目内所有入口源码文件顶部都应放置短小逻辑提醒，且项目仓库应提供可执行校验脚本，例如 `node scripts/check-logic-entry.js`，用于检查这些入口提醒是否仍存在。

## 当前输出来源

- 主逻辑基线：`AgentLogic_V6.md`
- 项目说明：`README.md`、`CLAUDE.md`
- 文档目录：`docs/`
- 核心源码目录：`src/`
