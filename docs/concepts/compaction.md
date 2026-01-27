---
summary: "Context window + compaction: how Clawdbot keeps sessions under model limits"
read_when:
  - You want to understand auto-compaction and /compact
  - You are debugging long sessions hitting context limits
---

# 上下文窗口与压缩

每个模型都有一个 **上下文窗口**（它能看到的最大标记数）。长时间运行的聊天会积累消息和工具结果；一旦窗口接近极限，Clawdbot 会 **压缩** 旧的历史记录，以保持在限制范围内。

## 什么是压缩
压缩会将较早的对话 **总结** 成一个简洁的摘要条目，并保留最近的消息。摘要会被存储在会话历史中，因此未来的请求将使用：
- 压缩后的摘要
- 压缩点之后的最近消息

压缩 **会保留在会话的 JSONL 历史记录中**。

## 配置
有关 `agents.defaults.compaction` 设置的详情，请参阅 [压缩配置与模式](/concepts/compaction)。

## 自动压缩（默认开启）
当会话接近或超过模型的上下文窗口时，Clawdbot 会触发自动压缩，并可能使用压缩后的上下文重新尝试原始请求。

你将看到：
- 在 verbose 模式下显示 `🧹 自动压缩完成`
- `/status` 命令显示 `🧹 压缩次数： <数量>`

在压缩之前，Clawdbot 可以运行一个 **无声内存刷新** 的步骤，将持久化的笔记存储到磁盘上。详情和配置请参阅 [内存](/concepts/memory)。

## 手动压缩
使用 `/compact`（可选地附带指令）来强制执行一次压缩操作：

/compact Focus on decisions and open questions``````
## 上下文窗口来源
上下文窗口是模型特定的。Clawdbot 使用配置的提供者目录中的模型定义来确定限制。

## 压缩与修剪
- **压缩（Compaction）**：对内容进行总结并**持久化**为 JSONL 格式。
- **会话修剪（Session pruning）**：仅**修剪旧的工具结果**，**在内存中**，每次请求进行一次。

有关修剪的详细信息，请参阅 [/concepts/session-pruning](/concepts/session-pruning)。

## 提示
- 当会话感觉过时或上下文过于臃肿时，使用 `/compact`。
- 大的工具输出已经进行了截断；修剪可以进一步减少工具结果的积累。
- 如果你需要一个全新的开始，可以使用 `/new` 或 `/reset` 来启动一个新的会话 ID。