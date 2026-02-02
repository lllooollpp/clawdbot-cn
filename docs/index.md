---
summary: "Top-level overview of Clawdbot, features, and purpose"
read_when:
  - Introducing Clawdbot to newcomers
---

# Clawdbot 🦞

> *"去角质！去角质！"* — 一个外星龙虾，可能是

<p align="center">
  <img src="whatsapp-clawd.jpg" alt="Clawdbot" width="420" />
</p>

<p align="center">
  <strong>任何操作系统 + 用于 AI 代理（Pi）的 WhatsApp/Telegram/Discord/iMessage 网关。</strong><br />
  插件支持 Mattermost 等更多平台。
  发送一条消息，获取代理的回复 —— 从你的口袋中。
</p>

<p align="center">
  <a href="https://github.com/clawdbot/clawdbot">GitHub</a> ·
  <a href="https://github.com/clawdbot/clawdbot/releases">发布版本</a> ·
  <a href="/">文档</a> ·
  <a href="/start/clawd">Clawdbot 助手设置</a>
</p>

Clawdbot 通过 WhatsApp Web / Baileys、Telegram（Bot API / grammY）、Discord（Bot API / channels.discord.js）、iMessage（imsg CLI）、飞书（Feishu/Lark API）和 企业微信（WeCom API）将 WhatsApp、Telegram、Discord、iMessage、飞书 和 企业微信 连接到像 [Pi](https://github.com/badlogic/pi-mono) 这样的代码代理。插件支持 Mattermost（Bot API + WebSocket）等更多平台。
Clawdbot 还为 [Clawd](https://clawd.me)（外星龙虾助手）提供支持。

## 从这里开始

- **从零开始安装新版本：** [入门指南](/start/getting-started.md)
- **引导式设置（推荐）：** [向导](/start/wizard.md) (`clawdbot onboard`)
- **桌面版快捷配置：** 在桌面端“设置”菜单中选择“配置向导”，或在网页端侧边栏点击“配置向导”图标，即可开始图形化上线流程。
- **Shell 自动补全：** 使用 `clawdbot completion` 为 Bash/Zsh 生成补全脚本。
- **打开仪表盘（本地网关）：** http://127.0.0.1:18789/（或 http://localhost:18789/）

如果网关运行在同一台计算机上，该链接会立即打开浏览器控制界面。如果无法打开，请先启动网关：`clawdbot gateway`。

## 仪表盘（浏览器控制界面）

仪表盘是用于聊天、配置、节点、会话等的浏览器控制界面。
本地默认地址：http://127.0.0.1:18789/
远程访问：[网络界面](/web/index.md) 和 [Tailscale](/gateway/tailscale.md)
```
WhatsApp / Telegram / Discord / iMessage / 飞书 (+ 插件)
        │
        ▼
  ┌───────────────────────────┐
  │          Gateway          │  ws://127.0.0.1:18789 (loopback-only)
  │     (single source)       │
  │                           │  http://<gateway-host>:18793
  │                           │    /__clawdbot__/canvas/ (Canvas host)
  └───────────┬───────────────┘
              │
              ├─ Pi agent (RPC)
              ├─ CLI (clawdbot …)
              ├─ Chat UI (SwiftUI)
              ├─ macOS app (Clawdbot.app)
              ├─ iOS node via Gateway WS + pairing
              └─ Android node via Gateway WS + pairing
```
大多数操作都通过 **网关** (`clawdbot gateway`) 运行，这是一个单一的长期运行进程，负责管理通道连接和 WebSocket 控制平面。

## 网络模型

- **每个主机一个网关（推荐）**：它是唯一允许拥有 WhatsApp Web 会话的进程。如果你需要救援机器人或严格的隔离，可以运行多个网关，使用隔离的配置文件和端口；详见 [多个网关](/gateway/multiple-gateways.md)。
- **回环优先**：网关的 WebSocket 默认使用 `ws://127.0.0.1:18789`。
  - 向导现在默认会生成一个网关令牌（即使对于回环连接也如此）。
  - 对于 Tailnet 访问，请运行 `clawdbot gateway --bind tailnet --token ...`（非回环绑定需要令牌）。
- **节点**：连接到网关的 WebSocket（根据需要使用 LAN/Tailnet/SSH）；旧版 TCP 桥接已弃用/移除。
- **Canvas 主机**：HTTP 文件服务器在 `canvasHost.port`（默认 `18793`），为节点的 WebViews 提供 `/__clawdbot__/canvas/`；详见 [网关配置](/gateway/configuration.md)（`canvasHost`）。
- **远程使用**：通过 SSH 隧道或 Tailnet/VPN；详见 [远程访问](/gateway/remote.md) 和 [发现](/gateway/discovery.md)。

## 特性（高级功能）

- 📱 **WhatsApp 集成** — 使用 Baileys 实现 WhatsApp Web 协议
- ✈️ **Telegram 机器人** — 通过 grammY 实现私信 + 群组
- 🎮 **Discord 机器人** — 通过 channels.discord.js 实现私信 + 频道
- 🧩 **Mattermost 机器人（插件）** — 机器人令牌 + WebSocket 事件
- 💬 **iMessage** — 本地 imsg CLI 集成（macOS）
- 🤖 **代理桥接** — Pi（RPC 模式）支持工具流式传输
- ⏱️ **流式传输 + 分块** — 块流式传输 + Telegram 草稿流式传输细节 ([/concepts/streaming](/concepts/streaming.md))
- 🧠 **多代理路由** — 将提供者账户/对等方路由到隔离的代理（工作区 + 每代理会话）
- 🔐 **订阅认证** — 通过 OAuth 实现 Anthropic（Claude Pro/Max） + OpenAI（ChatGPT/Codex）
- 💬 **会话** — 直接聊天会合并为共享的 `main`（默认）；群组是隔离的
- 👥 **群组聊天支持** — 默认基于@提及；所有者可以切换 `/activation always|mention`
- 📎 **媒体支持** — 支持发送和接收图片、音频、文档
- 🎤 **语音备忘录** — 可选的语音转文字钩子
- 🖥️ **WebChat + macOS 应用** — 本地 UI + 菜单栏伴侣用于操作和语音唤醒
- 📱 **iOS 节点** — 作为节点配对，并暴露一个 Canvas 表面
- 📱 **Android 节点** — 作为节点配对，并暴露 Canvas + 聊天 + 摄像头

注意：旧版 Claude/Codex/Gemini/Opencode 路径已被移除；Pi 是唯一的编码代理路径。
```bash
# Recommended: global install (npm/pnpm)
npm install -g clawdbot@latest
# or: pnpm add -g clawdbot@latest

# Onboard + install the service (launchd/systemd user service)
clawdbot onboard --install-daemon

# Pair WhatsApp Web (shows QR)
clawdbot channels login

# Gateway runs via the service after onboarding; manual run is still possible:
clawdbot gateway --port 18789
```
在之后切换 npm 和 git 安装方式非常简单：安装另一种方式的版本，然后运行 `clawdbot doctor` 来更新网关服务的入口点。
```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm ui:build # auto-installs UI deps on first run
pnpm build
clawdbot onboard --install-daemon
```
如果你还没有全局安装，請從存儲庫中通過 `pnpm clawdbot ...` 進行入門步驟。

多實例快速入門（可選）：
```bash
CLAWDBOT_CONFIG_PATH=~/.clawdbot/a.json \
CLAWDBOT_STATE_DIR=~/.clawdbot-a \
clawdbot gateway --port 19001
```
发送测试消息（需要运行中的网关）：
```bash
clawdbot message send --target +15555550123 --message "Hello from Clawdbot"
```
## 配置（可选）

配置文件位于 `~/.clawdbot/clawdbot.json`。

- 如果你 **什么也不做**，Clawdbot 将使用内置的 Pi 二进制文件以 RPC 模式运行，并为每个发送者启用会话。
- 如果你想对其进行限制，可以从 `channels.whatsapp.allowFrom` 开始，并（对于群组）设置相关规则。

示例：
```json5
{
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } }
    }
  },
  messages: { groupChat: { mentionPatterns: ["@clawd"] } }
}
```
## 文档

- 从这里开始：
  - [文档中心（所有页面链接）](/start/hubs.md)
  - [帮助](/help/index.md) ← *常见修复 + 排除故障*
  - [配置](/gateway/configuration.md)
  - [配置示例](/gateway/configuration-examples.md)
  - [斜杠命令](/tools/slash-commands.md)
  - [多代理路由](/concepts/multi-agent.md)
  - [更新 / 回滚](/install/updating.md)
  - [配对（私聊 + 节点）](/start/pairing.md)
  - [Nix 模式](/install/nix.md)
  - [Clawdbot 助手设置（Clawd）](/start/clawd.md)
  - [技能](/tools/skills.md)
  - [技能配置](/tools/skills-config.md)
  - [工作区模板](/reference/templates/AGENTS.md)
  - [RPC 适配器](/reference/rpc.md)
  - [网关操作手册](/gateway/index.md)
  - [节点（iOS/Android）](/nodes/index.md)
  - [网页界面（Control UI）](/web/index.md)
  - [发现 + 传输方式](/gateway/discovery.md)
  - [远程访问](/gateway/remote.md)
- 提供商与用户体验：
  - [网页聊天](/web/webchat.md)
  - [Control UI（浏览器）](/web/control-ui.md)
  - [Telegram](/channels/telegram.md)
  - [Discord](/channels/discord.md)
  - [飞书 (Feishu/Lark)](/channels/feishu.md)
  - [企业微信 (WeCom)](/channels/wecom.md)
  - [Mattermost（插件）](/channels/mattermost.md)
  - [iMessage](/channels/imessage.md)
  - [群组](/concepts/groups.md)
  - [WhatsApp 群消息](/concepts/group-messages.md)
  - [媒体：图片](/nodes/images.md)
  - [媒体：音频](/nodes/audio.md)
- 配套应用：
  - [macOS 应用](/platforms/macos.md)
  - [iOS 应用](/platforms/ios.md)
  - [Android 应用](/platforms/android.md)
  - [Windows（WSL2）](/platforms/windows.md)
  - [Linux 应用](/platforms/linux.md)
- 运维与安全：
  - [会话](/concepts/session.md)
  - [定时任务](/automation/cron-jobs.md)
  - [Webhook](/automation/webhook.md)
  - [Gmail 钩子（Pub/Sub）](/automation/gmail-pubsub.md)
  - [安全](/gateway/security.md)
  - [故障排查](/gateway/troubleshooting.md)

## 名称

**Clawdbot = CLAW + TARDIS** — 因为每只空间龙虾都需要一台时空机器。

---

*"我们都在玩弄自己的提示词。"* — 一个 AI，可能消耗了太多 Token

## 致谢

本项目基于开源社区的努力成果进行汉化和改进。感谢所有在上游项目中做出贡献的开发者。

## 许可证

MIT 许可证 — 像深海里的龙虾一样自由 🦞

---

*"我们都在玩弄自己的提示词。"* — 某个可能消耗了太多 Token 的 AI