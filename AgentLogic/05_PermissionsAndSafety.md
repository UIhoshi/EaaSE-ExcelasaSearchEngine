# Permissions And Safety

## 1. 权限体系的地位

当前项目的权限系统不是附属逻辑，而是工具系统的实际边界层。

如果不理解权限模型，就无法准确理解：

- 哪些工具只是“注册了”
- 哪些工具真的能执行
- 哪些执行会 ask
- 哪些执行会 deny

## 2. 三种权限结果

- allow
- ask
- deny

这三种行为共同决定用户体验、安全边界和 agentic loop 的可持续性。

## 3. 当前项目的关键权限路径

- `src/utils/permissions/permissions.ts`
- `src/utils/permissions/PermissionRule.ts`
- `src/utils/permissions/PermissionResult.ts`
- `src/utils/permissions/permissionSetup.ts`
- `src/utils/permissions/denialTracking.ts`

## 4. 计划模式

计划模式是当前项目非常关键的一层执行分流：

- 探索阶段优先只读
- 退出计划模式后再进入执行
- 允许在“先理解再修改”的工程纪律上形成系统化约束

相关工具：

- `src/tools/EnterPlanModeTool/`
- `src/tools/ExitPlanModeTool/`

## 5. 沙箱与命令安全

命令执行安全重点集中在：

- `src/tools/BashTool/`
- `src/tools/PowerShellTool/`
- `docs/safety/sandbox.mdx`

需要长期维护的关键点：

- 是否走沙箱
- 是否允许 unsandboxed
- 平台差异
- 只读命令与有副作用命令的区分
- 命令模式匹配和危险命令识别

## 6. Denial Tracking

该机制的工程价值很高，应持续写入主逻辑：

- 防止模型在被拒后无限重复同类请求
- 将拒绝记录转化为执行策略调整
- 让权限系统不只是“拦截”，而是“控制行为收敛”

## 7. 验证标准

与当前项目相关的验证，不应只停留在工具能调通，而应至少考虑：

- 规则命中是否符合预期
- 计划模式切换后权限是否回滚
- 沙箱与 bypass 是否符合配置
- 同一工具被拒多次后的行为是否正确
- 高风险写操作是否存在恢复路径

