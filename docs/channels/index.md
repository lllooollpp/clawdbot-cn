---
summary: "Messaging platforms Clawdbot can connect to"
read_when:
  - You want to choose a chat channel for Clawdbot
  - You need a quick overview of supported messaging platforms
---

# 聊天频道

Clawdbot 可以在你已有的任何聊天应用上与你交流。每个频道都通过网关连接。  
文字支持所有平台；媒体和表情反应则根据频道而有所不同。

## 支持的频道

- [WhatsApp](/channels/whatsapp) — 最受欢迎的；使用 Baileys 并需要二维码配对。  
- [Telegram](/channels/telegram) — 通过 grammY 的 Bot API；支持群组。  
- [Discord](/channels/discord) — Discord Bot API + 网关；支持服务器、频道和私信。  
- [Feishu (飞书)](/channels/feishu) — 通过飞书开放平台 Webhook 集成；支持私信和群组。  
- [Slack](/channels/slack) — Bolt SDK；工作区应用。  
- [Google Chat](/channels/googlechat) — 通过 HTTP webhook 的 Google Chat API 应用。  
- [Mattermost](/channels/mattermost) — Bot API + WebSocket；支持频道、群组和私信（插件，需单独安装）。  
- [Signal](/channels/signal) — signal-cli；注重隐私。  
- [BlueBubbles](/channels/bluebubbles) — **推荐用于 iMessage**；使用 BlueBubbles macOS 服务器的 REST API，支持完整功能（编辑、撤回、特效、表情、群组管理 — macOS 26 Tahoe 上的编辑功能目前存在问题）。  
- [iMessage](/channels/imessage) — 仅限 macOS；通过 imsg 的原生集成（旧版，新设置建议使用 BlueBubbles）。  
- [Microsoft Teams](/channels/msteams) — Bot Framework；企业支持（插件，需单独安装）。  
- [Nextcloud Talk](/channels/nextcloud-talk) — 自托管聊天通过 Nextcloud Talk（插件，需单独安装）。  
- [Matrix](/channels/matrix) — Matrix 协议（插件，需单独安装）。  
- [Nostr](/channels/nostr) — 通过 NIP-04 的去中心化私信（插件，需单独安装）。  
- [Tlon](/channels/tlon) — 基于 Urbit 的消息应用（插件，需单独安装）。  
- [Zalo](/channels/zalo) — Zalo Bot API；越南流行的消息应用（插件，需单独安装）。  
- [Zalo 个人账号](/channels/zalouser) — 通过二维码登录的 Zalo 个人账号（插件，需单独安装）。  
- [WebChat](/web/webchat) — 通过 WebSocket 的网关 WebChat 界面。

## 注意事项

- 频道可以同时运行；配置多个频道后，Clawdbot 会根据聊天进行路由。  
- 通常最快的设置是 **Telegram**（简单的 bot 令牌）。WhatsApp 需要二维码配对，并在磁盘上存储更多状态。  
- 群组行为因频道而异；请参阅 [群组](/concepts/groups)。  
- 私信配对和允许列表用于安全；请参阅 [安全](/gateway/security)。  
- Telegram 内部细节：[grammY 说明](/channels/grammy)。  
- 故障排除：[频道故障排除](/channels/troubleshooting)。  
- 模型提供者文档另见；请参阅 [模型提供者](/providers/models)。