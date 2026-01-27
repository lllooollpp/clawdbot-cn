---
summary: "Behavior and config for WhatsApp group message handling (mentionPatterns are shared across surfaces)"
read_when:
  - Changing group message rules or mentions
---

# 群组消息（WhatsApp 网页渠道）

目标：让 Clawd 加入 WhatsApp 群组，仅在被@提及的时候唤醒，并将该线程与个人私聊会话分开。

注意：`agents.list[].groupChat.mentionPatterns` 现在也被 Telegram/Discord/Slack/iMessage 使用；本文档专注于 WhatsApp 的特定行为。对于多代理设置，每个代理可以设置 `agents.list[].groupChat.mentionPatterns`（或使用 `messages.groupChat.mentionPatterns` 作为全局回退）。

## 已实现的功能（2025-12-03）
- 激活模式：`mention`（默认）或 `always`。`mention` 需要@提及（通过 `mentionedJids` 的真实 WhatsApp @提及、正则表达式，或机器人的 E.164 电话号码出现在文本中）。`always` 在每条消息中都会唤醒代理，但应仅在能提供有意义回复时才回应；否则返回静默标记 `NO_REPLY`。默认值可以在配置中设置（`channels.whatsapp.groups`），并通过 `/activation` 命令在群组级别覆盖。当设置 `channels.whatsapp.groups` 时，它也会作为群组允许列表（添加 `"*"` 以允许所有群组）。
- 群组策略：`channels.whatsapp.groupPolicy` 控制是否接受群组消息（`open|disabled|allowlist`）。`allowlist` 使用 `channels.whatsapp.groupAllowFrom`（回退：显式设置 `channels.whatsapp.allowFrom`）。默认为 `allowlist`（在你添加发送者之前为阻止状态）。
- 每个群组的会话：会话键的格式为 `agent:<agentId>:whatsapp:group:<jid>`，因此像 `/verbose on` 或 `/think high`（作为独立消息发送）这样的命令会限定在该群组范围内；个人私聊状态不受影响。群组线程不会发送心跳。
- 上下文注入：**仅等待**的群组消息（默认 50 条）中，那些**未触发运行**的消息会在 `[Chat messages since your last reply - for context]` 下被前置，而触发运行的消息则在 `[Current message - respond to this]` 下。已经存在于会话中的消息不会被重新注入。
- 发送者标识：每个群组消息批次结尾都会加上 `[from: Sender Name (+E164)]`，这样 Pi 能知道是谁在发言。
- 短时/仅看一次消息：在提取文本/提及之前我们会解包这些消息，因此其中的@提及仍然会触发。
- 群组系统提示：在群组会话的第一次交互中（以及每次 `/activation` 改变激活模式时），我们会将一段简短的说明注入到系统提示中，例如 `You are replying inside the WhatsApp group "<subject>". Group members: Alice (+44...), Bob (+43...), … Activation: trigger-only … Address the specific sender noted in the message context.` 如果没有元数据，我们仍然会告诉代理这是群组聊天。``````
注意事项：
- 正则表达式不区分大小写；它们涵盖像 `@clawdbot` 这样的显示名称提及，以及带或不带 `+`/空格的原始号码。
- WhatsApp 在有人点击联系人时仍会通过 `mentionedJids` 发送规范的提及，因此号码回退很少需要，但是一个有用的备用方案。

### 激活命令（仅限群主）

使用群组聊天命令：
- `/activation mention`
- `/activation always`

只有允许的群主号码（来自 `channels.whatsapp.allowFrom`，或当未设置时为机器人的 E.164 号码）可以更改此设置。在群组中发送 `/status` 作为独立消息，以查看当前的激活模式。

## 如何使用
1) 将运行 Clawdbot 的 WhatsApp 账号添加到群组中。
2) 发送 `@clawdbot …`（或包含号码）。除非你设置了 `groupPolicy: "open"`，否则只有允许列表中的发送者才能触发它。
3) 代理提示将包含最近的群组上下文以及尾随的 `[from: …]` 标记，以便它可以正确地回应正确的用户。
4) 会话级指令（`/verbose on`、`/think high`、`/new` 或 `/reset`、`/compact`）仅适用于该群组的会话；请将它们作为独立消息发送，以便生效。你的个人私聊会话保持独立。

## 测试 / 验证
- 手动测试：
  - 在群组中发送 `@clawd` 提及，并确认回复中引用了发送者名称。
  - 发送第二个提及，并验证历史记录块是否被包含，然后在下一轮中被清除。
- 检查网关日志（运行时使用 `--verbose`）以查看 `inbound web message` 条目，显示 `from: <groupJid>` 和 `[from: …]` 后缀。

## 已知注意事项
- 为了防止噪声广播，群组中故意跳过心跳检测。
- 回声抑制使用组合的批次字符串；如果你在没有提及的情况下两次发送相同文本，只有第一次会收到回复。
- 会话存储条目将在会话存储中显示为 `agent:<agentId>:whatsapp:group:<jid>`（默认路径为 `~/.clawdbot/agents/<agentId>/sessions/sessions.json`）；如果没有条目，只是表示该群组尚未触发过运行。
- 群组中的输入指示符遵循 `agents.defaults.typingMode`（默认：未提及情况下为 `message`）。