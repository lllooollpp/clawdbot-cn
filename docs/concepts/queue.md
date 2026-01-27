---
summary: "Command queue design that serializes inbound auto-reply runs"
read_when:
  - Changing auto-reply execution or concurrency
---

# 命令队列 (2026-01-16)

我们通过一个轻量的进程内队列对所有渠道的入站自动回复运行进行序列化，以防止多个代理运行发生冲突，同时仍允许跨会话的安全并行。

## 为什么

- 自动回复运行可能很昂贵（涉及大语言模型调用），当多个入站消息同时到达时可能会发生冲突。
- 序列化可以避免共享资源（会话文件、日志、CLI 标准输入）的竞争，并减少上游速率限制的可能性。

## 它是如何工作的

- 一个感知渠道的先进先出队列，每个渠道的运行数量受可配置的并发限制（未配置的渠道默认为 1；主渠道默认为 4，子代理默认为 8）。
- `runEmbeddedPiAgent` 通过 **会话键**（通道 `session:<key>`）将运行加入队列，以确保每个会话只有一个活动的运行。
- 每个会话运行随后被加入一个 **全局渠道**（默认为 `main`），因此整体并行性受 `agents.defaults.maxConcurrent` 的限制。
- 当启用详细日志时，如果运行等待超过约 2 秒才开始，会发出简短的通知。
- 当渠道支持时，打字指示器会在加入队列时立即触发，因此在我们等待轮次时用户体验不受影响。

## 队列模式（按渠道）

入站消息可以引导当前运行、等待下一次代理轮次，或两者都做：
- `steer`：立即将消息注入到当前运行中（在下一个工具边界后取消待处理的工具调用）。如果不是流式传输，则回退到下一次轮次。
- `followup`：在当前运行结束后，将消息加入下一次代理轮次的队列。
- `collect`：将所有队列中的消息合并为一个 **单次** 下一次轮次（默认）。如果消息针对不同的渠道/线程，它们会分别处理以保留路由。
- `steer-backlog`（也称为 `steer+backlog`）：立即引导当前运行 **并** 保留消息以供下一次轮次使用。
- `interrupt`（旧模式）：中止该会话的当前运行，然后执行最新消息。
- `queue`（旧别名）：与 `steer` 相同。

`steer-backlog` 意味着在引导运行后可以得到下一次轮次的响应，因此流式界面可能会显示为重复内容。如果你希望每条入站消息只得到一次响应，请优先使用 `collect` 或 `steer`。

可以通过发送 `/queue collect` 作为独立命令（按会话）或设置 `messages.queue.byChannel.discord: "collect"` 来配置。

默认值（当配置未设置时）：
- 所有界面 → `collect`

可以通过 `messages.queue` 全局或按渠道进行配置：
json5
{
  messages: {
    queue: {
      mode: "collect",
      debounceMs: 1000,
      cap: 20,
      drop: "summarize",
      byChannel: { discord: "collect" }
    }
  }
}
`````````
## 队列选项
这些选项适用于 `followup`、`collect` 和 `steer-backlog`（以及当 `steer` 回退到 `followup` 时）：
- `debounceMs`: 在开始下一轮 followup 之前等待静默时间（防止“继续，继续”）。
- `cap`: 每个会话的最大队列消息数。
- `drop`: 溢出策略（`old`、`new`、`summarize`）。

`summarize` 会保留一个简短的被丢弃消息列表，并将其作为合成的 followup 提示注入。
默认值：`debounceMs: 1000`，`cap: 20`，`drop: summarize`。

## 每个会话的覆盖设置
- 发送 `/queue <mode>` 作为独立命令，以存储当前会话的模式。
- 可以组合使用选项：`/queue collect debounce:2s cap:25 drop:summarize`
- `/queue default` 或 `/queue reset` 会清除会话的覆盖设置。

## 作用域与保证
- 适用于所有使用网关回复流程（WhatsApp web、Telegram、Slack、Discord、Signal、iMessage、网页聊天等）的入站渠道的自动回复代理运行。
- 默认流程（`main`）是针对所有入站消息和主心跳的全局流程；设置 `agents.defaults.maxConcurrent` 可允许多个会话并行运行。
- 可能存在其他流程（例如 `cron`、`subagent`），以便后台任务可以并行运行而不会阻塞入站回复。
- 每个会话的流程保证同一时间只有一个代理运行会触碰该会话。
- 不依赖外部服务或后台线程；纯 TypeScript + promises 实现。