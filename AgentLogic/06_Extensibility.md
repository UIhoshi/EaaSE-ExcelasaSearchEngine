# Extensibility

## 1. 扩展面总览

当前项目的扩展面主要有四个：

- MCP
- Skills
- Custom Agents
- Worktree / 多 Agent 协作

## 2. MCP

关键目标：

- 将外部工具或资源以统一协议注入系统
- 让工具面不局限于内置工具

重点路径：

- `docs/extensibility/mcp-protocol.mdx`
- `src/services/mcp/`
- `src/tools/MCPTool/`
- `src/tools/ListMcpResourcesTool/`
- `src/tools/ReadMcpResourceTool/`

维护逻辑包时，必须区分：

- MCP 工具
- MCP 资源
- MCP 认证
- MCP server 级 deny / allow

## 3. Skills

Skills 是对执行策略和知识片段的再封装。

重点路径：

- `docs/extensibility/skills.mdx`
- `src/skills/`
- `src/tools/SkillTool/`

维护重点：

- skill 如何被发现
- skill 如何被调用
- skill 与工具权限之间是什么关系

## 4. Custom Agents

当前项目支持通过 Markdown 定义 Agent。

重点路径：

- `docs/extensibility/custom-agents.mdx`
- `src/tools/AgentTool/`
- `src/tools/AgentTool/built-in/`

维护重点：

- agent 来源
- tools / disallowedTools 过滤
- model / effort / permissionMode / isolation
- memory 与 system prompt 注入

## 5. Worktree 与隔离

当前项目把 worktree 视作重要隔离能力之一。

重点路径：

- `docs/agent/worktree-isolation.mdx`
- `src/tools/EnterWorktreeTool/`
- `src/tools/ExitWorktreeTool/`
- `src/utils/worktree.ts`

## 6. 后续逻辑包迭代建议

扩展系统后续最容易失真，因此每次升级逻辑包时应优先补：

- 真实可用的扩展面
- 仅目录存在但默认不可达的扩展面
- 权限对扩展工具的影响
- 外部构建与内部构建的差异

