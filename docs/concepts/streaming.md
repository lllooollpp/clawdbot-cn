---
summary: "Streaming + chunking behavior (block replies, draft streaming, limits)"
read_when:
  - Explaining how streaming or chunking works on channels
  - Changing block streaming or channel chunking behavior
  - Debugging duplicate/early block replies or draft streaming
---

# 流式传输 + 分块传输

Clawdbot 有两个独立的“流式传输”层：
- **块流式传输（频道消息）：** 当助手撰写时，发出已完成的 **块**。这些是正常的频道消息（不是 token 的增量）。
- **类似 token 的流式传输（仅限 Telegram）：** 在生成过程中，用部分文本更新 **草稿气泡**；最终消息在最后发送。

目前 **没有真正的 token 流式传输** 发送到外部频道消息。Telegram 的草稿流式传输是唯一的部分流式传输界面。
## 块流式传输（频道消息）

块流式传输在内容可用时以粗粒度的块形式发送助手输出。

说明：
- `text_delta/events`: 模型流式事件（非流式模型可能较少）。
- `chunker`: `EmbeddedBlockChunker` 应用最小/最大限制 + 拆分偏好。
- `channel send`: 实际的出站消息（块回复）。

**控制选项：**
- `agents.defaults.blockStreamingDefault`: `"on"`/`"off"`（默认为 off）。
- 通道覆盖：`*.blockStreaming`（以及按账号的变体）用于按通道强制设置 `"on"`/`"off"`。
- `agents.defaults.blockStreamingBreak`: `"text_end"` 或 `"message_end"`。
- `agents.defaults.blockStreamingChunk`: `{ minChars, maxChars, breakPreference? }`。
- `agents.defaults.blockStreamingCoalesce`: `{ minChars?, maxChars?, idleMs? }`（在发送前合并流式块）。
- 通道硬性限制：`*.textChunkLimit`（例如 `channels.whatsapp.textChunkLimit`）。
- 通道拆分模式：`*.chunkMode`（`length` 为默认模式，`newline` 在长度拆分前按空行（段落边界）拆分）。
- Discord 软性限制：`channels.discord.maxLinesPerMessage`（默认为 17），用于拆分高回复以避免界面裁剪。

**边界语义：**
- `text_end`: 一旦 chunker 发出块就立即流式传输；每次 `text_end` 都会刷新。
- `message_end`: 等待助手消息完成后再刷新缓冲的输出。

即使使用 `message_end`，如果缓冲文本超过 `maxChars`，仍然会使用 chunker，因此可能在最后发出多个块。

## 拆分算法（低/高限制）

块拆分由 `EmbeddedBlockChunker` 实现：
- **低限制：** 不要发出块，直到缓冲区 >= `minChars`（除非强制）。
- **高限制：** 优先在 `maxChars` 之前拆分；如果强制拆分，则在 `maxChars` 处拆分。
- **拆分偏好：** `paragraph` → `newline` → `sentence` → `whitespace` → 硬性拆分。
- **代码块：** 永远不在代码块内部拆分；如果强制在 `maxChars` 处拆分，则关闭并重新打开代码块以保持 Markdown 有效性。

`maxChars` 会被限制在通道的 `textChunkLimit` 内，因此你无法超过每个通道的限制。

## 合并（合并流式块）

当启用块流式传输时，Clawdbot 可以**在发送前合并连续的块片段**。这可以减少“单行垃圾信息”，同时仍提供渐进式输出。

- 合并会等待**空闲间隔**（`idleMs`）后再刷新。
- 缓冲区受 `maxChars` 限制，如果超过则会刷新。
- `minChars` 防止小片段在文本累积到足够之前被发送（最终刷新总会发送剩余文本）。
- 拼接符由 `blockStreamingChunk.breakPreference` 推导得出：
  (`paragraph` → `\n\n`, `newline` → `\n`, `sentence` → 空格)。
- 可通过 `*.blockStreamingCoalesce`（包括按账号配置）进行通道覆盖。
- 默认的合并 `minChars` 为 Signal/Slack/Discord 设置为 1500，除非被覆盖。

## 块之间的自然节奏

当启用块流式传输时，你可以在**块回复之间添加随机暂停**（第一个块之后）。这可以让多气泡回复显得更自然。
```- 配置项：`agents.defaults.humanDelay`（可通过 `agents.list[].humanDelay` 为每个代理单独覆盖）。
- 模式：`off`（默认），`natural`（800–2500 毫秒），`custom`（`minMs`/`maxMs`）。
- 仅适用于 **块回复**，不适用于最终回复或工具摘要。

## "流式传输块或全部内容"

这对应于：
- **流式传输块**：`blockStreamingDefault: "on"` + `blockStreamingBreak: "text_end"`（边生成边发送）。非 Telegram 频道还需要设置 `*.blockStreaming` 为 `true`。
- **在最后流式传输全部内容**：`blockStreamingBreak: "message_end"`（一次性刷新，如果内容很长可能会有多个块）。
- **不进行块流式传输**：`blockStreamingDefault: "off"`（仅发送最终回复）。

**频道说明**：对于非 Telegram 频道，块流式传输默认是 **关闭的**，除非显式设置 `*.blockStreaming` 为 `true`。Telegram 可以在不使用块回复的情况下流式传输草稿（`channels.telegram.streamMode`）。

配置位置提醒：`blockStreaming*` 的默认值位于 `agents.defaults` 下，而不是根配置。

## Telegram 草稿流式传输（类似 token）

Telegram 是唯一支持草稿流式传输的频道：
- 在 **私聊频道中使用话题** 时，使用 Bot API 的 `sendMessageDraft`。
- `channels.telegram.streamMode: "partial" | "block" | "off"`。
  - `partial`：用最新的流式文本更新草稿。
  - `block`：以块的形式更新草稿（遵循相同的分块规则）。
  - `off`：不进行草稿流式传输。
- 草稿块配置（仅在 `streamMode: "block"` 时有效）：`channels.telegram.draftChunk`（默认值：`minChars: 200`，`maxChars: 800`）。
- 草稿流式传输与块流式传输是独立的；块回复默认是关闭的，仅在非 Telegram 频道上通过 `*.blockStreaming: true` 才会启用。
- 最终回复仍然是一个普通消息。
- `/reasoning stream` 会将推理内容写入草稿气泡（仅限 Telegram）。

当草稿流式传输启用时，Clawdbot 会禁用该回复的块流式传输，以避免重复流式传输。

Telegram (private + topics)
  └─ sendMessageDraft (草稿气泡)
       ├─ streamMode=partial → 更新最新文本
       └─ streamMode=block   → 块处理器更新草稿
  └─ 最终回复 → 普通消息图例：
- `sendMessageDraft`: Telegram 草稿气泡（不是真实消息）。
- `final reply`: 正常的 Telegram 消息发送。