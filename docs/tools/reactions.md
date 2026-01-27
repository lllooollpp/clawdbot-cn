---
summary: "Reaction semantics shared across channels"
read_when:
  - Working on reactions in any channel
---

# 反应工具

跨渠道的共享反应语义：

- 添加反应时必须提供 `emoji`。
- `emoji=""` 在支持的情况下会移除机器人的反应。
- `remove: true` 在支持的情况下会移除指定的 emoji（需要 `emoji` 参数）。

渠道说明：

- **Discord/Slack**：空的 `emoji` 会移除消息上的所有机器人反应；`remove: true` 仅移除该 emoji。
- **Google Chat**：空的 `emoji` 会移除消息上的应用反应；`remove: true` 仅移除该 emoji。
- **Telegram**：空的 `emoji` 会移除机器人的反应；`remove: true` 也会移除反应，但仍然需要非空的 `emoji` 来进行工具验证。
- **WhatsApp**：空的 `emoji` 会移除机器人的反应；`remove: true` 会映射为空 emoji（仍然需要 `emoji`）。
- **Signal**：当启用 `channels.signal.reactionNotifications` 时，入站的反应通知会触发系统事件。