# Capability Matrix

## 1. 状态定义

- `implemented`
  已有真实实现，且当前外部构建中可视为有效能力主体。
- `enabled_conditionally`
  有真实实现，但需平台、环境变量、运行时条件或配置满足才可用。
- `disabled_by_feature_flag`
  代码存在，但默认构建路径下不可达。
- `stub`
  目录或接口存在，但不能视为完整能力。
- `indexed_only`
  逻辑包中只保留索引或说明，不保留完整原始层。

## 2. 当前项目能力矩阵

| 能力域 | 当前状态 | 逻辑包处理方式 | 说明 |
|---|---|---|---|
| Tool 本体 (`src/tools/`) | implemented + mixed states inside | raw 保留 | 工具目录整包进入 `raw_tools/` |
| Tool 注册 (`src/tools.ts`) | implemented | raw 保留 | 进入 `raw_tooling/` |
| Tool 接口 (`src/Tool.ts`) | implemented | raw 保留 | 进入 `raw_tooling/` |
| Tool 执行基础设施 (`src/services/tools/`) | implemented | raw 保留 | 进入 `raw_tooling/` |
| Tool 结果预算 | implemented | raw 保留 | `toolResultStorage.ts` 已进入包 |
| 权限系统 (`src/utils/permissions/`) | implemented | raw 保留 | 进入 `raw_permissions/` |
| Bash / PowerShell 安全模型 | implemented / conditional | raw + abstract | 工具层与权限层共同解释 |
| MCP 核心服务 (`src/services/mcp/`) | implemented | raw 保留 | 进入 `raw_extensions/mcp/` |
| Skills 系统 (`src/skills/`) | implemented | raw 保留 | 进入 `raw_extensions/skills/` |
| Agent 扩展系统 | implemented | abstract + raw overlap | 主要通过 `raw_tools/AgentTool` 与扩展文档体现 |
| 命令面 (`src/commands/`) | implemented | raw 保留 | 当前已进入 `raw_commands/` |
| 文件智能分类器（如 Magika） | candidate | not integrated | 可增强文件路由与类型识别，但不是当前 V6 必需项 |
| UI 组件层 | implemented | indexed_only | 当前不做全量原始层保留 |
| feature flag 关闭工具 | disabled_by_feature_flag | raw 保留但逻辑标注 | 代码保留，能力状态单独声明 |
| stub 工具 | stub | raw 保留但逻辑标注 | 不能误写成可用能力 |

## 3. 当前版本的判断

- 当前逻辑包已经达到“工具与核心外围系统可追溯”的层级。
- 还没有走到“全仓运行时镜像包”的程度。
- 这是刻意选择，而不是遗漏。
