# Agentic Loop

## 1. 主链路

当前项目的一次标准执行链路可以写成：

1. 用户输入进入 REPL 或 pipe 模式
2. `QueryEngine` 收集状态、上下文、消息、权限上下文
3. `query()` 发起一次模型请求
4. 模型返回文本块和 `tool_use`
5. 系统根据工具类型与并发安全性执行工具
6. 工具结果转成 `tool_result` 回写会话
7. 如果需要追问，则进入下一轮循环
8. 如果任务结束，则输出最终结果并记录状态

## 2. 关键函数责任

- `src/QueryEngine.ts`
  负责会话级编排、成本、摘要、文件历史、turn bookkeeping。
- `src/query.ts`
  负责单轮的真实执行循环。
- `src/services/tools/toolOrchestration.ts`
  负责任务批次划分、串行或并行执行。
- `src/services/tools/toolExecution.ts`
  负责单个工具执行细节与上下文衔接。
- `src/services/tools/toolHooks.ts`
  负责 pre/post tool use hook 相关逻辑。

## 3. 上下文预处理

在模型请求之前，当前项目包含较重的上下文预算与压缩逻辑，核心目标是：

- 防止历史消息无限膨胀
- 保持工具结果的可回溯性
- 在 token 超限前主动做 compact

相关关键词：

- auto compact
- micro compact
- tool result budget
- prompt cache

## 4. 工具结果回流

工具执行不是终点，真正重要的是结果如何回流：

- 结果会被映射为结构化 `tool_result`
- 结果可能被裁剪、摘要或持久化到磁盘
- 模型在下一轮看到的是“工具结果消息”，而不是直接操作系统状态

因此，逻辑整理时必须同时记录：

- 工具执行方式
- 工具结果格式
- 结果预算控制
- 结果如何影响下一轮推理

## 5. 维护逻辑包时的注意点

- 不要只写“query 是核心”，要补齐它与 `QueryEngine`、工具编排、权限上下文之间的关系。
- 不要把并行执行能力泛化为“所有工具都并行”。
- 当前项目明确区分只读并发安全工具与有副作用工具，这一点必须长期保留在逻辑包中。

