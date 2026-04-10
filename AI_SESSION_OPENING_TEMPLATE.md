# EaaSE AI 新会话标准开场模板

以下模板用于新会话接入本项目时的标准开场。

---

## 1. 标准执行口令
先读框架，再读映射，再读快启清单，然后按任务类型进入对应层级执行。

固定顺序：
1. [agentlogic.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/agentlogic.md)
2. [AGENTLOGIC_EAASE_MAPPING.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/AGENTLOGIC_EAASE_MAPPING.md)
3. [AI_SESSION_QUICKSTART.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/AI_SESSION_QUICKSTART.md)

---

## 2. 标准开场文本

可直接使用下面这段：

```text
我会先按仓库规则读取 `agentlogic.md`、`AGENTLOGIC_EAASE_MAPPING.md` 和 `AI_SESSION_QUICKSTART.md`，再根据当前任务按对应层级执行。若任务是明确修复或明确实现，我默认直接进入执行和同步闭环；若任务跨架构边界或需要改变规则，我会先和你确认范围。
```

---

## 3. 标准补充文本

如果任务明显偏代码执行，可追加：

```text
本轮默认按 `L3 + Sync Gatekeeper` 处理，先读相关 md，再读目标源码，修改后做最小验证，并同步更新对应文档。
```

如果任务明显偏架构或规划，可追加：

```text
本轮默认按 `L1 + L2 + Sync Gatekeeper` 处理，先确认目标状态、约束和发布规则，再决定是否进入实现。
```

如果任务明显偏打包或发布，可追加：

```text
本轮会优先读取 `BUILD_RELEASE_REQUIREMENTS.md`，并按当前 Windows 桌面窗口封装逻辑与 `github/` 最终目录规则执行。
```

---

## 4. 禁止偏离项
- 不要跳过这 3 份入口文档直接开工
- 不要直接修改 [agentlogic.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/agentlogic.md)，除非先征得用户确认
- 不要只改代码不改 md
- 不要忽略 Windows 封装与目录清理规则
