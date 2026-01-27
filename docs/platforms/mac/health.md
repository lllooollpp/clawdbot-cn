---
summary: "How the macOS app reports gateway/Baileys health states"
read_when:
  - Debugging mac app health indicators
---

# macOS 上的健康检查

如何通过菜单栏应用查看链接的频道是否正常。

## 菜单栏
- 状态点现在反映 Baileys 的健康状态：
  - 绿色：已链接 + 最近打开了套接字。
  - 橙色：正在连接/重试中。
  - 红色：已注销或探测失败。
- 次要信息行显示 "已链接 · 认证 12m" 或显示失败原因。
- "运行健康检查" 菜单项会触发一次按需探测。

## 设置
- 通用选项卡新增了一个健康卡片，显示以下信息：已链接的认证时间、session-store 路径/数量、上次检查时间、上次错误/状态码，以及“运行健康检查”和“显示日志”的按钮。
- 使用缓存快照，因此 UI 能快速加载，并且在离线时也能优雅降级。
- **频道选项卡** 显示频道状态，并提供 WhatsApp/Telegram 的控制选项（登录二维码、注销、探测、上次断开/错误）。

## 探测的工作原理
- 应用每隔约 60 秒通过 `ShellExecutor` 运行 `clawdbot health --json`，并可在需要时手动触发。探测会加载凭证并报告状态，但不会发送消息。
- 分别缓存最后一次成功的快照和最后一次错误，以避免状态闪烁；并显示每个的时间戳。

## 如有疑问
- 你仍然可以在 [网关健康](/gateway/health) 中使用 CLI 流程（`clawdbot status`、`clawdbot status --deep`、`clawdbot health --json`），并可通过 `tail /tmp/clawdbot/clawdbot-*.log` 查看 `web-heartbeat` 或 `web-reconnect` 的日志。