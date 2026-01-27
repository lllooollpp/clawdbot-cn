---
summary: "Agent loop lifecycle, streams, and wait semantics"
read_when:
  - You need an exact walkthrough of the agent loop or lifecycle events
---

# 代理循环（Clawdbot）

代理循环是代理的完整“真实”运行流程：输入 → 上下文组装 → 模型推理 → 工具执行 → 流式回复 → 持久化。这是将消息转化为动作和最终回复的权威路径，同时保持会话状态的一致性。

在 Clawdbot 中，一个循环是每个会话的一次序列化运行，它在模型思考、调用工具和流式输出时发出生命周期和流事件。本文档解释了这一真实循环如何从端到端进行连接。

## 入口点
- 网关 RPC：`agent` 和 `agent.wait`。
- CLI：`agent` 命令。

## 工作原理（概要）
1) `agent` RPC 验证参数，解析会话（sessionKey/sessionId），持久化会话元数据，立即返回 `{ runId, acceptedAt }`。
2) `agentCommand` 运行代理：
   - 解析模型 + 思考/详细模式的默认值
   - 加载技能快照
   - 调用 `runEmbeddedPiAgent`（pi-agent-core 运行时）
   - 如果嵌入式循环没有发出生命周期结束/错误事件，则发出 **生命周期结束/错误** 事件
3) `runEmbeddedPiAgent`：
   - 通过每个会话和全局队列序列化运行
   - 解析模型 + 认证配置文件并构建 pi 会话
   - 订阅 pi 事件并流式传输助手/工具的增量更新
   - 强制执行超时 -> 如果超过限制则中止运行
   - 返回数据负载 + 使用量元数据
4) `subscribeEmbeddedPiSession` 将 pi-agent-core 事件桥接到 Clawdbot 的 `agent` 流：
   - 工具事件 => `stream: "tool"`
   - 助手增量 => `stream: "assistant"`
   - 生命周期事件 => `stream: "lifecycle"`（`phase: "start" | "end" | "error"`）
5) `agent.wait` 使用 `waitForAgentJob`：
   - 等待 `runId` 的 **生命周期结束/错误** 事件
   - 返回 `{ status: ok|error|timeout, startedAt, endedAt, error? }`

## 队列与并发
- 每个会话键（会话车道）的运行是序列化的，也可以选择通过全局车道进行。
- 这可以防止工具/会话竞争，并保持会话历史的一致性。
- 消息通道可以选择队列模式（collect/steer/followup），这些模式会进入这个车道系统。
  请参阅 [命令队列](/concepts/queue)。

## 会话与工作区准备
- 工作区被解析并创建；沙盒运行可能会重定向到沙盒工作区根目录。
- 技能被加载（或从快照中复用）并注入到环境和提示中。
- 启动/上下文文件被解析并注入到系统提示报告中。
- 获取会话写锁；在流式传输前，`SessionManager` 被打开并准备就绪。

## 提示组装与系统提示
- 系统提示由 Clawdbot 的基础提示、技能提示、启动上下文和每次运行的覆盖项组成。
- 强制执行模型特定的限制和压缩预留标记。
- 有关模型看到的内容，请参阅 [系统提示](/concepts/system-prompt)。

## 钩子点（你可以拦截的地方）
Clawdbot 有两个钩子系统：
- **内部钩子**（网关钩子）：用于命令和生命周期事件的事件驱动脚本。
- **插件钩子**：代理/工具生命周期和网关管道中的扩展点。

### 内部钩子（网关钩子）
- **`agent:bootstrap`**：在系统提示最终确定之前构建启动文件时运行。
  用于添加/删除启动上下文文件。
- **命令钩子**：`/new`、`/reset`、`/stop` 和其他命令事件（详见 Hooks 文档）。

有关设置和示例，请参阅 [Hooks](/hooks)。

### 插件钩子（agent + gateway 生命周期）
这些钩子在 agent 循环或 gateway 管道中运行：
- **`before_agent_start`**：在运行开始前注入上下文或覆盖系统提示。
- **`agent_end`**：在运行完成后检查最终的消息列表和运行元数据。
- **`before_compaction` / `after_compaction`**：观察或注释压缩周期。
- **`before_tool_call` / `after_tool_call`**：拦截工具参数/结果。
- **`tool_result_persist`**：在将工具结果写入会话记录之前同步转换。
- **`message_received` / `message_sending` / `message_sent`**：入站和出站消息钩子。
- **`session_start` / `session_end`**：会话生命周期的边界。
- **`gateway_start` / `gateway_stop`**：网关生命周期事件。

有关钩子 API 和注册详情，请参阅 [Plugins](/plugin#plugin-hooks)。

## 流式传输 + 部分回复
- 助手的增量（deltas）由 pi-agent-core 流式传输，并作为 `assistant` 事件发出。
- 块流式传输可以在 `text_end` 或 `message_end` 上发出部分回复。
- 推理流式传输可以作为独立流或块回复发出。
- 有关分块和块回复行为，请参阅 [Streaming](/concepts/streaming)。

## 工具执行 + 消息工具
- 工具的开始/更新/结束事件会在 `tool` 流上发出。
- 工具结果在记录/发出前会进行大小和图片负载的清理。
- 消息工具的发送会被跟踪，以避免重复的助手确认。

## 回复塑造 + 抑制
- 最终的回复内容由以下部分组成：
  - 助手文本（以及可选的推理过程）
  - 内联工具摘要（当 verbose 且允许时）
  - 模型出错时的助手错误文本
- `NO_REPLY` 被视为静默标记，并从传出的回复中过滤掉。
- 消息工具的重复项会从最终回复列表中移除。
- 如果没有可渲染的回复内容，并且工具出错，则会发出一个备用工具错误回复（除非消息工具已经发出用户可见的回复）。

## 压缩 + 重试
- 自动压缩会发出 `compaction` 流事件，并可能触发重试。
- 在重试时，内存缓冲区和工具摘要会被重置，以避免重复输出。
- 有关压缩流程，请参阅 [Compaction](/concepts/compaction)。

## 事件流（当前）
- `lifecycle`：由 `subscribeEmbeddedPiSession` 发出（作为后备由 `agentCommand` 发出）
- `assistant`：由 pi-agent-core 流式传输的助手增量
- `tool`：由 pi-agent-core 流式传输的工具事件

## 聊天频道处理
- 助手增量会被缓冲为聊天的 `delta` 消息。
- 在 **生命周期结束/错误** 时会发出聊天的 `final` 消息。

## 超时设置
- `agent.wait` 默认值：30秒（仅等待）。`timeoutMs` 参数会覆盖默认值。
- 代理运行时：`agents.defaults.timeoutSeconds` 默认值为 600 秒；在 `runEmbeddedPiAgent` 中强制执行中止计时器。

## 可能提前结束的情况
- 代理超时（中止）
- `AbortSignal`（取消）
- 网关断开或 RPC 超时
- `agent.wait` 超时（仅等待，不会停止代理）