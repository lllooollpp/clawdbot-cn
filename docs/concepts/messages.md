---
summary: "Message flow, sessions, queueing, and reasoning visibility"
read_when:
  - Explaining how inbound messages become replies
  - Clarifying sessions, queueing modes, or streaming behavior
  - Documenting reasoning visibility and usage implications
---

# 消息

本页介绍了 Clawdbot 如何处理传入消息、会话、队列、流式传输以及推理的可见性。

## 消息流程（概述）

传入消息
  -> 路由/绑定 -> 会话密钥
  -> 队列（如果运行正在激活中）
  -> 代理运行（流式传输 + 工具）
  -> 传出回复（频道限制 + 分块处理）``````
关键配置选项位于配置中：
- `messages.*` 用于前缀、队列和群组行为。
- `agents.defaults.*` 用于块流式传输和分块的默认设置。
- 渠道覆盖配置（如 `channels.whatsapp.*`、`channels.telegram.*` 等）用于功能限制和流式传输开关。

有关完整配置结构，请参见 [Configuration](/gateway/configuration)。

## 入站去重

渠道在重新连接后可能会重复发送同一条消息。Clawdbot 会根据渠道/账号/对端/会话/消息 ID 建立一个短期缓存，以防止重复发送触发另一个代理运行。

## 入站防抖

来自**同一发送者**的快速连续消息可以通过 `messages.inbound` 被批量处理为一次代理交互。防抖功能按渠道 + 会话作用域，并使用最近一条消息进行回复的线程处理/ID 识别。

配置（全局默认值 + 每个渠道的覆盖配置）：```json5
{
  messages: {
    inbound: {
      debounceMs: 2000,
      byChannel: {
        whatsapp: 5000,
        slack: 1500,
        discord: 1500
      }
    }
  }
}
```
```md
注意事项：
- 防抖机制仅适用于**纯文本**消息；媒体/附件会立即发送。

- 控制命令会绕过防抖机制，因此它们保持独立。

## 会话与设备

会话由网关拥有，而不是由客户端拥有。
- 直接聊天会合并到代理的主要会话密钥中。
- 群组/频道会拥有自己的会话密钥。
- 会话存储和对话记录都位于网关主机上。

多个设备/频道可以映射到同一个会话，但历史记录不会完全同步到每个客户端。建议：在长时间对话中使用一个主要设备，以避免上下文分歧。控制UI和TUI始终显示由网关支持的会话记录，因此它们是事实的来源。

详情：[会话管理](/concepts/session)。

## 入站内容与历史上下文

Clawdbot 将**提示内容**与**命令内容**分开：
- `Body`：发送给代理的提示文本。这可能包括频道的包裹信息和可选的历史包装。
- `CommandBody`：用于指令/命令解析的原始用户文本。
- `RawBody`：`CommandBody` 的旧版别名（为兼容性保留）。

当频道提供历史记录时，它会使用共享的包装：
- `[自你上次回复以来的聊天消息 - 用于上下文]`
- `[当前消息 - 回应此消息]`

对于**非直接聊天**（群组/频道/房间），**当前消息内容**会以发送者标签作为前缀（与历史条目使用的样式相同）。这确保了代理提示中的实时消息和队列/历史消息保持一致。

历史缓冲区是**仅待处理的**：它们包含那些**未触发执行**的群组消息（例如，提及限制的消息），并且**不包含**已经存在于会话记录中的消息。

指令剥离仅适用于**当前消息**部分，因此历史记录保持完整。那些包装历史的频道应将 `CommandBody`（或 `RawBody`）设置为原始消息文本，并将 `Body` 保持为组合提示。历史缓冲区可以通过 `messages.groupChat.historyLimit`（全局默认值）以及每频道的覆盖设置（如 `channels.slack.historyLimit` 或 `channels.telegram.accounts.<id>.historyLimit`）进行配置（设置 `0` 以禁用）。

## 队列与后续回复

如果一个执行正在运行中，入站消息可以被排队、引导到当前执行中，或收集用于后续回复。

- 通过 `messages.queue`（以及 `messages.queue.byChannel`）进行配置。
- 模式：`interrupt`、`steer`、`followup`、`collect`，以及后备模式。

详情：[队列](/concepts/queue)。

## 流式传输、分块与批处理

块流式传输会在模型生成文本块时发送部分回复。
分块会尊重频道的文本限制，并避免拆分代码块。

关键设置：
- `agents.defaults.blockStreamingDefault` (`on|off`, 默认为 off)
- `agents.defaults.blockStreamingBreak` (`text_end|message_end`)
- `agents.defaults.blockStreamingChunk` (`minChars|maxChars|breakPreference`)
- `agents.defaults.blockStreamingCoalesce` (基于空闲的批次处理)
- `agents.defaults.humanDelay` (块回复之间的类人暂停)
- 渠道覆盖：`*.blockStreaming` 和 `*.blockStreamingCoalesce` (非 Telegram 渠道需要显式设置 `*.blockStreaming: true`)

详细信息：[流式传输 + 分块](/concepts/streaming)。

## 推理可见性与令牌

Clawdbot 可以暴露或隐藏模型推理：
- `/reasoning on|off|stream` 控制可见性。
- 当模型生成推理内容时，仍会计算到令牌使用中。
- Telegram 支持将推理流式传输到草稿气泡中。

详细信息：[思考 + 推理指令](/tools/thinking) 和 [令牌使用](/token-use)。

## 前缀、线程与回复

出站消息格式化集中于 `messages`：
- `messages.responsePrefix` (出站前缀) 和 `channels.whatsapp.messagePrefix` (WhatsApp 入站前缀)
- 通过 `replyToMode` 和各渠道默认设置实现回复线程化

详细信息：[配置](/gateway/configuration#messages) 和 渠道文档。