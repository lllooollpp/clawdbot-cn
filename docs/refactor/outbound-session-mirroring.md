---
title: Outbound Session Mirroring Refactor (Issue #1520)
description: Track outbound session mirroring refactor notes, decisions, tests, and open items.
---

# 出站会话镜像重构（问题 #1520）

## 状态
- 进行中。
- 出站镜像的 core + plugin 通道路由已更新。
- 网关发送在未提供 sessionKey 时会推导出目标会话。

## 背景
出站消息曾被镜像到 *当前* 代理会话（工具会话键）中，而不是目标通道会话。由于入站路由使用通道/对等会话键，因此出站响应常常被放入错误的会话中，且首次联系的目标通常缺少会话条目。

## 目标
- 将出站消息镜像到目标通道会话键中。
- 在出站时缺少会话条目时创建会话条目。
- 保持线程/主题作用域与入站会话键一致。
- 覆盖 core 通道以及捆绑的扩展。

## 实现摘要
- 新的出站会话路由辅助函数：
  - `src/infra/outbound/outbound-session.ts`
  - `resolveOutboundSessionRoute` 使用 `buildAgentSessionKey`（dmScope + identityLinks）构建目标会话键。
  - `ensureOutboundSessionEntry` 通过 `recordSessionMetaFromInbound` 写入最小的 `MsgContext`。
- `runMessageAction`（发送）推导出目标会话键，并将其传递给 `executeSendAction` 进行镜像。
- `message-tool` 不再直接进行镜像；它仅从当前会话键中解析 agentId。
- 插件发送路径通过 `appendAssistantMessageToSessionTranscript` 使用推导出的会话键进行镜像。
- 网关发送在未提供会话键时推导出目标会话键（默认代理），并确保创建会话条目。

## 线程/主题处理
- Slack：replyTo/threadId -> `resolveThreadSessionKeys`（后缀）。
- Discord：threadId/replyTo -> `resolveThreadSessionKeys`，并设置 `useSuffix=false` 以匹配入站（线程频道 ID 已经作用域会话）。
- Telegram：主题 ID 通过 `buildTelegramGroupPeerId` 映射为 `chatId:topic:<id>`。

## 覆盖的扩展
- Matrix, MS Teams, Mattermost, BlueBubbles, Nextcloud Talk, Zalo, Zalo Personal, Nostr, Tlon。
- 注意事项：
  - Mattermost 目标现在会去除 `@` 符号用于 DM 会话键路由。
  - Zalo Personal 使用 DM 对等类型用于一对一目标（仅当存在 `group:` 时使用群组）。
  - BlueBubbles 群组目标会去除 `chat_*` 前缀以匹配入站会话键。
  - Slack 自动线程镜像会不区分大小写地匹配频道 ID。
  - 网关发送在镜像前会将提供的会话键转换为小写。

## 决策
- **网关发送会话推导**：如果提供了 `sessionKey`，则使用它。如果未提供，则从目标 + 默认代理推导出 `sessionKey` 并在该处进行镜像。
- **会话条目创建**：始终使用 `recordSessionMetaFromInbound`，并确保 `Provider/From/To/ChatType/AccountId/Originating*` 与入站格式一致。
- **目标标准化**：出站路由在有可用目标时使用解析后的目标（在 `resolveChannelTarget` 之后）。
- **会话键大小写**：在写入和迁移期间，将会话键标准化为小写。

## 新增/更新的测试用例
- `src/infra/outbound/outbound-session.test.ts`
  - Slack 线程会话密钥。
  - Telegram 话题会话密钥。
  - dmScope 与 Discord 的 identityLinks。
- `src/agents/tools/message-tool.test.ts`
  - 从会话密钥推导出 agentId（未传递 sessionKey）。
- `src/gateway/server-methods/send.test.ts`
  - 当省略会话密钥时推导出会话密钥并创建会话条目。

## 待办事项 / 后续工作
- 语音通话插件使用自定义的 `voice:<phone>` 会话密钥。此处的出站映射未标准化；如果 message-tool 需要支持语音通话发送，请添加显式映射。
- 确认是否有任何外部插件使用超出内置集合的非标准 `From/To` 格式。