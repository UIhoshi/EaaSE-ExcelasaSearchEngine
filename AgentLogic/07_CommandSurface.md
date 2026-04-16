# Command Surface

## 1. 斜杠命令的作用

`src/commands/` 是当前项目对用户暴露的命令面。它不是简单菜单，而是：

- 功能入口集合
- 工具能力的用户级编排层
- 配置、诊断、状态与管理操作的分发层

## 2. 当前命令面的大类

### 会话与交互

- `context`
- `resume`
- `session`
- `status`
- `rewind`
- `compact`

### 配置与环境

- `config`
- `permissions`
- `sandbox-toggle`
- `model`
- `output-style`
- `theme`
- `keybindings`

### 扩展与集成

- `mcp`
- `skills`
- `plugin`
- `agents`
- `remote-env`
- `chrome`

### 分析与维护

- `doctor`
- `stats`
- `usage`
- `cost`
- `review`
- `security-review`

### 项目与版本控制

- `branch`
- `tasks`
- `memory`
- `add-dir`
- `tag`

## 3. 命令面与工具面的关系

要避免一个常见误解：

- 命令面不等于工具面
- 工具面是给模型调用的能力
- 命令面是给用户直接操作的入口

但两者经常在内部复用相同模块，因此后续维护逻辑包时，命令面应当补充它们与核心模块之间的映射。

## 4. 建议维护方式

每次逻辑包升级时，应持续整理：

- 命令名称
- 对应目录
- 对应核心模块
- 是否受 feature flag 或平台限制

## 5. 当前包内的命令原始层

当前版本已补入：

- `raw_commands/`

其作用不是替代命令总览，而是为后续维护保留命令面真实入口实现。
