# Source Index

## 1. 主文档入口

- `README.md`
- `CLAUDE.md`
- `docs/introduction/architecture-overview.mdx`
- `docs/tools/what-are-tools.mdx`
- `docs/safety/permission-model.mdx`
- `docs/extensibility/custom-agents.mdx`

## 2. 关键源码入口

- `src/entrypoints/cli.tsx`
- `src/main.tsx`
- `src/QueryEngine.ts`
- `src/query.ts`
- `src/context.ts`
- `src/Tool.ts`
- `src/tools.ts`

## 3. 工具系统

- `src/tools/`
- `src/services/tools/toolOrchestration.ts`
- `src/services/tools/toolExecution.ts`
- `src/services/tools/toolHooks.ts`
- `src/utils/toolResultStorage.ts`
- `src/Tool.ts`
- `src/tools.ts`

## 4. 权限与安全

- `src/utils/permissions/`
- `src/tools/BashTool/`
- `src/tools/PowerShellTool/`
- `docs/safety/sandbox.mdx`
- `docs/safety/plan-mode.mdx`
- `docs/safety/permission-model.mdx`

## 5. 扩展

- `src/services/mcp/`
- `src/skills/`
- `src/tools/AgentTool/`
- `docs/extensibility/mcp-protocol.mdx`
- `docs/extensibility/skills.mdx`
- `docs/extensibility/custom-agents.mdx`

## 6. 命令面

- `src/commands/`

## 6.1 当前逻辑包中的原始层位置

- `raw_tools/`
- `raw_tooling/`
- `raw_permissions/`
- `raw_extensions/`
- `raw_commands/`

## 7. 当前整理结论

- 当前项目并不适合被简单理解为“一个 CLI 仓库”。
- 它更准确的定义是“一个带工具系统、权限系统、扩展系统和多轮执行循环的 Agentic CLI 平台”。
- 因此，后续任何逻辑包升级，都应围绕平台级边界维护，而不是围绕单个文件维护。
- 对当前项目，工具源码层应长期保留在逻辑包中，而不是只保留摘要。
