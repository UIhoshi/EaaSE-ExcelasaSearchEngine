# Cross Directory Map

## 1. 总图

当前项目的核心关系可以压缩为：

`main/entrypoints`
→ `REPL / QueryEngine`
→ `query.ts`
→ `tools.ts / Tool.ts`
→ `services/tools/`
→ `raw_tools/*`
→ `permissions / mcp / skills`
→ 结果回流到消息与状态

## 2. 关键跨目录关系

### 入口到核心循环

- `src/entrypoints/cli.tsx`
  负责运行时注入与入口准备。
- `src/main.tsx`
  负责 CLI 层调度。
- `src/QueryEngine.ts`
  负责会话编排。
- `src/query.ts`
  负责单轮 agentic loop。

### 核心循环到工具系统

- `src/query.ts`
  调用工具时依赖：
  - `src/tools.ts`
  - `src/Tool.ts`
  - `src/services/tools/`

### 工具系统到权限系统

- 工具本体目录：
  - `raw_tools/`
- 工具权限边界主要落在：
  - `raw_permissions/`
  - `raw_tools/BashTool/`
  - `raw_tools/PowerShellTool/`

### 工具系统到扩展系统

- MCP 相关：
  - `raw_extensions/mcp/`
- Skills 相关：
  - `raw_extensions/skills/`
- Agent 相关：
  - `raw_tools/AgentTool/`

### 命令面到系统核心

- 命令本体：
  - `raw_commands/`
- 命令一般作为用户入口，向下连接：
  - QueryEngine
  - state/context
  - tools
  - permissions
  - mcp
  - skills

## 3. 阅读顺序建议

如果后续维护者要最快进入系统，建议按这个顺序读：

1. `01_MasterLogic.md`
2. `02_Architecture.md`
3. `03_AgenticLoop.md`
4. `04_Tools.md`
5. `05_PermissionsAndSafety.md`
6. `06_Extensibility.md`
7. `11_CrossDirectoryMap.md`
8. `raw_tooling/`
9. `raw_tools/`
10. `raw_permissions/`
11. `raw_extensions/`
12. `raw_commands/`

## 4. 当前版本的价值

这一版逻辑包已经不仅是“规则汇总”或“工具归档”，而是一个带有：

- 主逻辑
- 能力状态
- 打包策略
- 原始核心层
- 跨目录映射

的维护型逻辑包。

