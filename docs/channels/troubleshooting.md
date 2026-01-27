---
summary: "Channel-specific troubleshooting shortcuts (Discord/Telegram/WhatsApp)"
read_when:
  - A channel connects but messages don’t flow
  - Investigating channel misconfiguration (intents, permissions, privacy mode)
---

# 通道故障排除

从以下内容开始：
bash
clawdbot doctor
clawdbot channels status --probe``````
`channels status --probe` 在检测到常见的频道配置错误时会打印警告信息，并包含一些小的实时检查（凭据、部分权限/成员资格）。

## 频道
- Discord: [/channels/discord#troubleshooting](/channels/discord#troubleshooting)
- Telegram: [/channels/telegram#troubleshooting](/channels/telegram#troubleshooting)
- WhatsApp: [/channels/whatsapp#troubleshooting-quick](/channels/whatsapp#troubleshooting-quick)

## Telegram 快速修复方法
- 日志显示 `HttpError: Network request for 'sendMessage' failed` 或 `sendChatAction` → 检查 IPv6 DNS。如果 `api.telegram.org` 首先解析为 IPv6，而主机没有 IPv6 出站流量，则强制使用 IPv4 或启用 IPv6。参见 [/channels/telegram#troubleshooting](/channels/telegram#troubleshooting)。
- 日志显示 `setMyCommands failed` → 检查对 `api.telegram.org` 的出站 HTTPS 和 DNS 可达性（常见于受限制的 VPS 或代理环境）。