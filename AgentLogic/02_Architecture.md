# Architecture

## 1. 五层结构

当前仓库适合按五层结构理解：

1. 交互层
   `src/screens/REPL.tsx`、`src/components/`、`src/ink/`
2. 编排层
   `src/QueryEngine.ts`
3. 核心循环层
   `src/query.ts`
4. 工具层
   `src/Tool.ts`、`src/tools.ts`、`src/tools/*`
5. 通信层
   `src/services/api/claude.ts`

## 2. 主入口

- `src/entrypoints/cli.tsx`
  注入运行时 polyfill、feature 宏替代和环境常量。
- `src/main.tsx`
  解析 CLI 参数、初始化服务、启动 REPL 或 pipe 模式。
- `src/entrypoints/init.ts`
  一次性初始化，如遥测、配置、信任相关启动逻辑。

## 3. 核心状态面

- `src/state/AppState.tsx`
  UI 和会话的中心状态定义。
- `src/state/store.ts`
  状态存储。
- `src/bootstrap/state.ts`
  进程级、会话级共享状态。
- `src/context.ts`
  构造系统上下文，拼接日期、git、CLAUDE.md、memory 等。

## 4. 项目结构上最重要的目录

- `docs/`
  已整理的架构、工具、安全、扩展说明，是理解当前项目最优先入口之一。
- `src/tools/`
  工具实现主体。
- `src/commands/`
  斜杠命令面。
- `src/services/tools/`
  工具调度、执行、hook 等基础设施。
- `src/utils/permissions/`
  权限模型与规则引擎。
- `src/skills/`
  skills 体系与加载。
- `src/services/mcp/`
  MCP 相关服务。

## 5. 当前项目的结构判断

- 这是“工具驱动型 CLI Agent 系统”，不是普通 CLI。
- 入口层和 UI 层只是表面，真正的系统边界在：
  - `query.ts`
  - `tools.ts`
  - `permissions/`
  - `services/tools/`
- 若后续继续完善逻辑包，优先维护这些模块的映射精度。

