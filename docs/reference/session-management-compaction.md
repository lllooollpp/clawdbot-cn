---
summary: "Deep dive: session store + transcripts, lifecycle, and (auto)compaction internals"
read_when:
  - You need to debug session ids, transcript JSONL, or sessions.json fields
  - You are changing auto-compaction behavior or adding “pre-compaction” housekeeping
  - You want to implement memory flushes or silent system turns
---

# 会话管理与压缩（深入解析）

本文档解释了Clawdbot如何端到端地管理会话：

- **会话路由**（如何将传入的消息映射到`sessionKey`）
- **会话存储**（`sessions.json`）及其跟踪内容
- **对话记录持久化**（`*.jsonl`）及其结构
- **对话记录清理**（运行前的特定提供者修复）
- **上下文限制**（上下文窗口 vs 跟踪的token数）
- **压缩**（手动 + 自动压缩）以及在哪里插入压缩前的处理逻辑
- **静默维护**（例如不应产生用户可见输出的内存写入）

如果你想先获得一个更高层次的概述，请从以下内容开始：
- [/concepts/session](/concepts/session)
- [/concepts/compaction](/concepts/compaction)
- [/concepts/session-pruning](/concepts/session-pruning)
- [/reference/transcript-hygiene](/reference/transcript-hygiene)

---

## 真实数据源：Gateway

Clawdbot围绕一个单一的 **Gateway进程** 设计，该进程拥有会话状态的所有权。

- UI（macOS应用、网页控制UI、TUI）应向Gateway查询会话列表和token数量。
- 在远程模式下，会话文件位于远程主机上；“检查你的本地Mac文件”不会反映Gateway正在使用的文件。

---

## 两个持久化层

Clawdbot在两个层中持久化会话：

1) **会话存储（`sessions.json`）**
   - 键值映射：`sessionKey -> SessionEntry`
   - 小型、可变、可以安全地编辑（或删除条目）
   - 跟踪会话元数据（当前会话ID、最后活动时间、开关、token计数器等）

2) **对话记录（`<sessionId>.jsonl`）**
   - 仅追加的对话记录，带有树状结构（条目有`id` + `parentId`）
   - 存储实际的对话内容 + 工具调用 + 压缩摘要
   - 用于重建模型上下文以进行后续对话

---

## 磁盘上的位置

每个代理在Gateway主机上的路径如下：

- 存储位置：`~/.clawdbot/agents/<agentId>/sessions/sessions.json`
- 对话记录：`~/.clawdbot/agents/<agentId>/sessions/<sessionId>.jsonl`
  - Telegram话题会话：`.../<sessionId>-topic-<threadId>.jsonl`

Clawdbot通过`src/config/sessions.ts`解析这些路径。

---

## 会话键（`sessionKey`）

`sessionKey`用于标识你所在的*哪个对话桶*（路由 + 隔离）。

常见模式：

- 主要/直接聊天（每个代理）：`agent:<agentId>:<mainKey>`（默认为`main`）
- 群组：`agent:<agentId>:<channel>:group:<id>`
- 房间/频道（Discord/Slack）：`agent:<agentId>:<channel>:channel:<id>` 或 `...:room:<id>`
- 定时任务：`cron:<job.id>`
- 网络钩子：`hook:<uuid>`（除非被覆盖）

规范规则在 [/concepts/session](/concepts/session) 中有详细说明。

---

## 会话ID（`sessionId`）

每个`sessionKey`指向一个当前的`sessionId`（即继续对话的对话记录文件）。

经验法则：
- **重置** (`/new`, `/reset`) 为该 `sessionKey` 创建一个新的 `sessionId`。
- **每日重置**（默认在网关主机的本地时间凌晨4点）会在重置边界后的下一条消息中创建一个新的 `sessionId`。
- **空闲超时** (`session.reset.idleMinutes` 或旧版 `session.idleMinutes`) 会在空闲时间段后收到消息时创建一个新的 `sessionId`。当同时配置了每日重置和空闲超时时，先到期的那个会生效。

实现细节：决策发生在 `src/auto-reply/reply/session.ts` 中的 `initSessionState()` 方法中。

---

## 会话存储结构（`sessions.json`）

存储的值类型是 `src/config/sessions.ts` 中的 `SessionEntry`。

关键字段（不完整）：

- `sessionId`: 当前对话 ID（文件名由此生成，除非设置了 `sessionFile`）
- `updatedAt`: 最后活动时间戳
- `sessionFile`: 可选的显式对话路径覆盖
- `chatType`: `direct | group | room`（帮助 UI 和发送策略）
- `provider`, `subject`, `room`, `space`, `displayName`: 用于群组/频道标签的元数据
- 切换选项：
  - `thinkingLevel`, `verboseLevel`, `reasoningLevel`, `elevatedLevel`
  - `sendPolicy`（会话级别的覆盖）
- 模型选择：
  - `providerOverride`, `modelOverride`, `authProfileOverride`
- 令牌计数器（最佳努力 / 依赖于提供者）：
  - `inputTokens`, `outputTokens`, `totalTokens`, `contextTokens`
- `compactionCount`: 该会话键完成自动压缩的次数
- `memoryFlushAt`: 上次压缩前内存刷新的时间戳
- `memoryFlushCompactionCount`: 上次刷新运行时的压缩次数

该存储可以安全地编辑，但网关是权威：它可能在会话运行时重新写入或重新加载条目。

值得注意的条目类型：
- `message`: 用户/助手/工具结果消息
- `custom_message`: 扩展注入的消息，**会进入模型上下文**（可以隐藏在 UI 中）
- `custom`: 扩展状态，**不会进入模型上下文**
- `compaction`: 持久化的压缩摘要，包含 `firstKeptEntryId` 和 `tokensBefore`
- `branch_summary`: 在导航树分支时持久化的摘要

Clawdbot **故意不**“修复”对话记录；网关使用 `SessionManager` 来读写它们。

---

## 上下文窗口 vs 跟踪的令牌数

有两个不同的概念需要关注：

1) **模型上下文窗口**：每个模型的硬性限制（模型可见的令牌数）
2) **会话存储计数器**：写入到 `sessions.json` 中的滚动统计（用于 `/status` 和仪表板）

如果你在调整限制：
- 上下文窗口来自模型目录（可以通过配置覆盖）。
- 存储中的 `contextTokens` 是运行时的估计/报告值；不要将其视为严格的保证。

有关更多信息，请参见 [/token-use](/token-use)。

---

## 压缩：它是什么

压缩会将较早的对话内容总结为一个持久化的 `compaction` 条目，并保留最近的消息不变。

压缩之后，后续的对话轮次将看到：
- 压缩后的摘要
- `firstKeptEntryId` 之后的消息

压缩是 **持久化的**（不同于会话修剪）。请参见 [/concepts/session-pruning](/concepts/session-pruning)。

---

## 自动压缩发生的时间（Pi 运行时）

在嵌入式 Pi 代理中，自动压缩会在以下两种情况下触发：

1) **溢出恢复**：模型返回上下文溢出错误 → 压缩 → 重试。
2) **阈值维护**：在一次成功的对话轮次之后，当满足以下条件时：

`contextTokens > contextWindow - reserveTokens`

其中：
- `contextWindow` 是模型的上下文窗口大小
- `reserveTokens` 是为提示词 + 下一个模型输出预留的缓冲空间

这些是 Pi 运行时的语义（Clawdbot 会消费事件，但 Pi 决定何时进行压缩）。

---

## 压缩设置（`reserveTokens`，`keepRecentTokens`）

Pi 的压缩设置位于 Pi 的配置中：
json5
{
  compaction: {
    enabled: true,
    reserveTokens: 16384,
    keepRecentTokens: 20000
  }
}
``````
Clawdbot 还对嵌入式运行设置了安全下限：

- 如果 `compaction.reserveTokens < reserveTokensFloor`，Clawdbot 会将其提升。
- 默认下限为 `20000` 个 token。
- 设置 `agents.defaults.compaction.reserveTokensFloor: 0` 可以禁用该下限。
- 如果当前值已经高于该下限，Clawdbot 会保持原样。

原因：在自动压缩变得不可避免之前，为多轮“后台任务”（如内存写入）留出足够的缓冲空间。

实现方式：`ensurePiCompactionReserveTokens()` 函数位于 `src/agents/pi-settings.ts` 中（在 `src/agents/pi-embedded-runner.ts` 中被调用）。

---

## 用户可见的界面

你可以通过以下方式观察压缩和会话状态：

- `/status`（在任何聊天会话中）
- `clawdbot status`（CLI）
- `clawdbot sessions` / `sessions --json`
- 详细模式：`🧹 Auto-compaction complete` + 压缩次数

---

## 静默后台任务（`NO_REPLY`）

Clawdbot 支持“静默”回合，用于执行后台任务，用户不会看到中间输出。

约定：
- 助手在输出开头使用 `NO_REPLY` 来表示“不要向用户发送回复”。
- Clawdbot 在交付层会移除/抑制这个标记。

截至 `2026.1.10`，Clawdbot 还会在部分 chunk 以 `NO_REPLY` 开头时抑制**草稿/输入流**，因此静默操作不会在回合中途泄露部分输出。

---

## 压缩前的“内存刷新”（已实现）

目标：在自动压缩发生之前，运行一个静默的代理回合，将持久化的状态写入磁盘（例如代理工作区中的 `memory/YYYY-MM-DD.md`），以防止压缩擦除关键上下文。

Clawdbot 使用的是 **预阈值刷新** 方法：

1) 监控会话上下文的使用情况。
2) 当使用量超过“软阈值”（低于 Pi 的压缩阈值）时，向代理发送一个静默的“立即写入内存”指令。
3) 使用 `NO_REPLY`，因此用户不会看到任何内容。

配置（`agents.defaults.compaction.memoryFlush`）：
- `enabled`（默认：`true`）
- `softThresholdTokens`（默认：`4000`）
- `prompt`（用于刷新回合的用户消息）
- `systemPrompt`（为刷新回合附加的额外系统提示）

备注：
- 默认的提示/系统提示中包含 `NO_REPLY` 提示以抑制交付。
- 每个压缩周期只运行一次刷新（记录在 `sessions.json` 中）。
- 仅对嵌入式 Pi 会话运行刷新（CLI 后端会跳过）。
- 当会话工作区为只读时（`workspaceAccess: "ro"` 或 `"none"`）会跳过刷新。
- 有关工作区文件结构和写入模式，请参阅 [Memory](/concepts/memory)。

Pi 还在扩展 API 中暴露了 `session_before_compact` 钩子，但目前 Clawdbot 的刷新逻辑是在网关端实现的。

---

## 排查问题清单

- 会话密钥错误？从 [/concepts/session](/concepts/session) 开始，并确认 `/status` 中的 `sessionKey`。
- 存储与转录不匹配？确认 `clawdbot status` 中的网关主机和存储路径。
- 压缩日志过多？检查以下内容：
  - 模型上下文窗口（太小）
  - 压缩设置（`reserveTokens` 设置过高可能导致早期压缩）
  - 工具结果膨胀：启用/调整会话修剪
- 静默回合泄露？确认回复以 `NO_REPLY`（精确的标记）开头，并且你使用的是包含流式抑制修复的版本。