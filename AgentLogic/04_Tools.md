# Tools

## 1. 工具系统总述

当前项目的工具系统由三部分构成：

- 抽象接口：`src/Tool.ts`
- 工具注册：`src/tools.ts`
- 工具执行基础设施：`src/services/tools/`

这三者共同决定“模型能看到什么工具、能否调用、怎么执行、结果怎么回流”。

## 2. 工具分类

### 文件与搜索类

- `FileReadTool`
- `FileEditTool`
- `FileWriteTool`
- `NotebookEditTool`
- `GlobTool`
- `GrepTool`

### 命令执行类

- `BashTool`
- `PowerShellTool`
- `TerminalCaptureTool`
- `REPLTool`

### Agent / 任务 / 协作类

- `AgentTool`
- `AskUserQuestionTool`
- `SendMessageTool`
- `TaskCreateTool`
- `TaskGetTool`
- `TaskListTool`
- `TaskUpdateTool`
- `TaskOutputTool`
- `TaskStopTool`
- `TodoWriteTool`
- `TeamCreateTool`
- `TeamDeleteTool`

### Web / 外部信息类

- `WebFetchTool`
- `WebSearchTool`
- `WebBrowserTool`

### 计划 / 工作树 / 辅助类

- `EnterPlanModeTool`
- `ExitPlanModeTool`
- `EnterWorktreeTool`
- `ExitWorktreeTool`
- `ToolSearchTool`
- `BriefTool`
- `SkillTool`
- `ScheduleCronTool`

### MCP 资源类

- `MCPTool`
- `McpAuthTool`
- `ListMcpResourcesTool`
- `ReadMcpResourceTool`

## 3. 当前项目中工具的能力状态

基于仓库现有文档与目录结构，可将工具状态分为：

- 始终可用的核心工具
  例如 `BashTool`、`FileReadTool`、`FileEditTool`、`FileWriteTool`、`AgentTool`
- 条件启用工具
  受平台、环境变量、运行时能力或开关控制
- feature flag 关闭工具
  在当前外部构建下存在代码，但默认不可达
- stub 工具
  目录存在，但不能视为完整能力

## 4. 工具整合的关键问题

整理工具时，必须一起回答：

1. 工具定义在哪里
2. 工具何时注册
3. 工具是否默认可见
4. 工具是否默认可用
5. 工具是否需要权限审批
6. 工具是否支持并发
7. 工具结果如何回流

## 5. 当前项目的关键工具源码路径

- 工具接口：`src/Tool.ts`
- 工具注册：`src/tools.ts`
- 工具编排：`src/services/tools/toolOrchestration.ts`
- 工具 hooks：`src/services/tools/toolHooks.ts`
- 工具执行：`src/services/tools/toolExecution.ts`
- 结果预算：`src/utils/toolResultStorage.ts`

## 6. 高风险工具

后续维护时，应持续单独盯紧以下高风险工具族：

- `BashTool`
- `PowerShellTool`
- `FileEditTool`
- `FileWriteTool`
- `AgentTool`
- `WebFetchTool`
- MCP 相关工具

原因不是它们名字危险，而是它们最直接涉及：

- 文件系统写入
- 命令执行
- 子 Agent 派生
- 外部网络访问
- 权限模型穿透

## 7. 对逻辑包的建议

后续每次升级逻辑包时，优先补充：

- 工具状态矩阵
- 启用条件矩阵
- 权限模式矩阵
- 关键源码映射

## 8. 文件智能增强候选

当前项目已经有自己的文件读取分流逻辑，尤其在以下方向已有处理：

- 文本文件读取
- 图片读取
- PDF 读取
- Notebook 读取
- 二进制扩展名拒绝或特殊处理

因此，像 `Magika` 这类“文件内容类型识别”工具，对当前系统属于增强项，而不是当前主链路的必需项。

它更适合补强这些场景：

- 文件扩展名不可信
- 无扩展名文件
- 文本类格式需要更精准预判
- 大批量文件目录的预扫描和预路由

当前逻辑建议：

- 可以纳入 V6 的候选增强说明
- 不应直接升级为主逻辑强制依赖
- 只有当仓库正式集成并形成稳定调用链后，再考虑提升为更高优先级能力

## 8. 当前包内的工具源码层说明

本逻辑包已经按主逻辑要求保留了两层与工具直接相关的原始源码：

- `raw_tools/`
  对应 `src/tools/`，保留工具本体。
- `raw_tooling/`
  保留工具接口、工具注册、工具编排与执行基础设施。

这样做的目的不是把所有逻辑重新写一遍，而是确保后续维护者既能看总览，也能立即落到真实实现。
