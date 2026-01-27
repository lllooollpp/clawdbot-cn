---
summary: "Telegram Bot API integration via grammY with setup notes"
read_when:
  - Working on Telegram or grammY pathways
---

# grammY 集成（Telegram Bot API）

# 为什么选择 grammY
- 以 TypeScript 为优先的 Bot API 客户端，内置长轮询 + Webhook 辅助工具、中间件、错误处理和速率限制器。
- 更简洁的媒体辅助工具，优于手动实现 fetch + FormData；支持所有 Bot API 方法。
- 可扩展性：通过自定义 fetch 实现代理支持，可选的会话中间件（session middleware），类型安全的上下文（context）。

# 我们已经实现的功能
- **单一客户端路径：** 基于 fetch 的实现已移除；grammY 现在是唯一的 Telegram 客户端（发送 + 网关），默认启用 grammY 的节流器（throttler）。
- **网关（Gateway）：** `monitorTelegramProvider` 构建一个 grammY `Bot`，连接 @提及/允许列表的权限控制，通过 `getFile`/`download` 实现媒体下载，并使用 `sendMessage/sendPhoto/sendVideo/sendAudio/sendDocument` 发送回复。支持通过 `webhookCallback` 使用长轮询或 Webhook。
- **代理（Proxy）：** 可选的 `channels.telegram.proxy` 通过 grammY 的 `client.baseFetch` 使用 `undici.ProxyAgent`。
- **Webhook 支持：** `webhook-set.ts` 包装了 `setWebhook/deleteWebhook`；`webhook.ts` 主机回调函数，包含健康检查和优雅关闭。当 `channels.telegram.webhookUrl` 被设置时，网关会启用 Webhook 模式（否则使用长轮询）。
- **会话（Sessions）：** 私人对话会合并到代理主会话（`agent:<agentId>:<mainKey>`）；群组使用 `agent:<agentId>:telegram:group:<chatId>`；回复会路由回同一个频道。
- **配置开关（Config knobs）：** `channels.telegram.botToken`、`channels.telegram.dmPolicy`、`channels.telegram.groups`（允许列表 + @提及默认设置）、`channels.telegram.allowFrom`、`channels.telegram.groupAllowFrom`、`channels.telegram.groupPolicy`、`channels.telegram.mediaMaxMb`、`channels.telegram.linkPreview`、`channels.telegram.proxy`、`channels.telegram.webhookSecret`、`channels.telegram.webhookUrl`。
- **草稿流式传输（Draft streaming）：** 可选的 `channels.telegram.streamMode` 在私有主题聊天中使用 `sendMessageDraft`（需要 Bot API 9.3+）。这与频道块流式传输是分开的。
- **测试（Tests）：** grammy 模拟测试覆盖了 DM 和群组 @提及 权限控制及出站发送；仍欢迎更多媒体/Webhook 的测试用例。

待解决的问题
- 如果遇到 Bot API 429 错误，是否需要可选的 grammY 插件（如节流器）。
- 增加更结构化的媒体测试（如贴纸、语音消息）。
- 使 Webhook 监听端口可配置（目前固定为 8787，除非通过网关配置）。