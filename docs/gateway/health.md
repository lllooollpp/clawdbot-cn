---
summary: "Health check steps for channel connectivity"
read_when:
  - Diagnosing WhatsApp channel health
---

# 健康检查（CLI）

无需猜测即可验证通道连接性的简要指南。

## 快速检查
- `clawdbot status` — 本地摘要：网关可达性/模式、更新提示、已链接通道的认证年龄、会话 + 最近活动。
- `clawdbot status --all` — 完整的本地诊断（只读，带颜色，可用于调试）。
- `clawdbot status --deep` — 还会探测正在运行的网关（当支持时进行每通道探测）。
- `clawdbot health --json` — 向正在运行的网关请求完整的健康快照（仅限 WebSocket；不直接连接 Baileys 套接字）。
- 在 WhatsApp/WebChat 中发送 `/status` 作为独立消息，以获取状态回复而不会触发代理。

## 深度诊断
- 磁盘上的凭证：`ls -l ~/.clawdbot/credentials/whatsapp/<accountId>/creds.json`（mtime 应该是最近的）。
- 会话存储：`ls -l ~/.clawdbot/agents/<agentId>/sessions/sessions.json`（路径可在配置中覆盖）。通过 `status` 命令可以查看会话数量和最近的收件人。
- 重新链接流程：当日志中出现状态码 409–515 或 `loggedOut` 时，使用 `clawdbot channels logout && clawdbot channels login --verbose`。注意：在配对后，QR 登录流程会在状态码 515 时自动重启一次。

## 当出现问题时
- `logged out` 或状态码 409–515 → 使用 `clawdbot channels logout` 然后 `clawdbot channels login` 重新链接。
- 网关不可达 → 启动它：`clawdbot gateway --port 18789`（如果端口被占用，可使用 `--force`）。
- 无入站消息 → 确认已链接的手机在线，并且发送者在允许列表中（`channels.whatsapp.allowFrom`）；对于群聊，确保允许列表和提及规则匹配（`channels.whatsapp.groups`，`agents.list[].groupChat.mentionPatterns`）。

## 专用的 "health" 命令
`clawdbot health --json` 会向正在运行的网关请求健康快照（CLI 不直接连接通道套接字）。它会报告已链接的凭证/认证年龄、每通道探测摘要、会话存储摘要和探测持续时间。如果网关不可达或探测失败/超时，该命令将返回非零退出码。使用 `--timeout <ms>` 可覆盖默认的 10 秒超时时间。