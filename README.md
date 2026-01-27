# 🦞 Clawdbot — 个人 AI 助手

<p align="center">
  <img src="https://raw.githubusercontent.com/clawdbot/clawdbot/main/docs/whatsapp-clawd.jpg" alt="Clawdbot" width="400">
</p>

<p align="center">
  <img src="./images/chat.jpg" alt="Chat Example" width="400">
</p>

<p align="center">
  <strong>EXFOLIATE! EXFOLIATE!</strong>
</p>

<p align="center">
  <a href="https://github.com/clawdbot/clawdbot/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/clawdbot/clawdbot/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/clawdbot/clawdbot/releases"><img src="https://img.shields.io/github/v/release/clawdbot/clawdbot?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="https://deepwiki.com/clawdbot/clawdbot"><img src="https://img.shields.io/badge/DeepWiki-clawdbot-111111?style=for-the-badge" alt="DeepWiki"></a>
  <a href="https://discord.gg/clawd"><img src="https://img.shields.io/discord/1456350064065904867?label=Discord&logo=discord&logoColor=white&color=5865F2&style=for-the-badge" alt="Discord"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**Clawdbot** 是一个你可以在自己设备上运行的*个人 AI 助手*。
它通过你常用的渠道回复你（WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage、Microsoft Teams、WebChat），以及扩展渠道如 BlueBubbles、Matrix、Zalo 和 Zalo Personal。它可以在 macOS/iOS/Android 上说话和聆听，并可以渲染你控制的实时 Canvas。Gateway 只是控制平面——产品是助手。

如果你想要一个感觉本地、快速、始终在线的个人单用户助手，这就是它。

[网站](https://clawdbot.com) · [文档](https://docs.clawd.bot) · [入门](https://docs.clawd.bot/start/getting-started) · [更新](https://docs.clawd.bot/install/updating) · [展示](https://docs.clawd.bot/start/showcase) · [FAQ](https://docs.clawd.bot/start/faq) · [向导](https://docs.clawd.bot/start/wizard) · [Nix](https://github.com/clawdbot/nix-clawdbot) · [Docker](https://docs.clawd.bot/install/docker) · [Discord](https://discord.gg/clawd)

首选设置：运行入门向导（`clawdbot onboard`）。它会引导你完成 Gateway、Workspace、Channels 和 Skills。CLI 向导是推荐路径，在 **macOS、Linux 和 Windows（通过 WSL2；强烈推荐）** 上工作。
支持 npm、pnpm 或 bun。
新安装？从这里开始：[入门](https://docs.clawd.bot/start/getting-started)

**订阅（OAuth）：**
- **[Anthropic](https://www.anthropic.com/)** (Claude Pro/Max)
- **[OpenAI](https://openai.com/)** (ChatGPT/Codex)
- **[智谱](https://open.bigmodel.cn/)** (ChatGLM 4.7)

模型说明：虽然支持任何模型，但我强烈推荐 **Anthropic Pro/Max (100/200) + Opus 4.5** 用于长上下文强度和更好的提示注入抵抗。也支持 **ChatGLM 4.7** 用于中文用户。见 [入门](https://docs.clawd.bot/start/onboarding)。

## 模型（选择 + 认证）

- 模型配置 + CLI：[模型](https://docs.clawd.bot/concepts/models)
- 认证配置文件轮换（OAuth vs API 密钥）+ 回退：[模型故障转移](https://docs.clawd.bot/concepts/model-failover)

## 安装（推荐）

运行时：**Node ≥22**。

```bash
npm install -g clawdbot@latest
# 或: pnpm add -g clawdbot@latest

clawdbot onboard --install-daemon
```

向导会安装 Gateway 守护进程（launchd/systemd 用户服务），使其保持运行。

## 快速开始（TL;DR）

运行时：**Node ≥22**。

完整初学者指南（认证、配对、渠道）：[入门](https://docs.clawd.bot/start/getting-started)

```bash
clawdbot onboard --install-daemon

clawdbot gateway --port 18789 --verbose

# 发送消息
clawdbot message send --to +1234567890 --message "Hello from Clawdbot"

# 与助手对话（可选地传回任何连接的渠道：WhatsApp/Telegram/Slack/Discord/Google Chat/Signal/iMessage/BlueBubbles/Microsoft Teams/Matrix/Zalo/Zalo Personal/WebChat）
clawdbot agent --message "Ship checklist" --thinking high
```

升级？[更新指南](https://docs.clawd.bot/install/updating)（并运行 `clawdbot doctor`）。

## 开发渠道

- **stable**：标记发布（`vYYYY.M.D` 或 `vYYYY.M.D-<patch>`），npm dist-tag `latest`。
- **beta**：预发布标记（`vYYYY.M.D-beta.N`），npm dist-tag `beta`（macOS 应用可能缺失）。
- **dev**：`main` 的移动头，npm dist-tag `dev`（发布时）。

切换渠道（git + npm）：`clawdbot update --channel stable|beta|dev`。
详情：[开发渠道](https://docs.clawd.bot/install/development-channels)。

## 从源码（开发）

从源码构建时首选 `pnpm`。Bun 可选用于直接运行 TypeScript。

```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot

pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖
pnpm build

pnpm clawdbot onboard --install-daemon

# 开发循环（TS 更改时自动重载）
pnpm gateway:watch
```

注意：`pnpm clawdbot ...` 通过 `tsx` 直接运行 TypeScript。`pnpm build` 生成 `dist/` 用于通过 Node / 打包的 `clawdbot` 二进制运行。

## 安全默认（DM 访问）

Clawdbot 连接到真实的通讯表面。将入站 DM 视为**不受信任的输入**。

完整安全指南：[安全](https://docs.clawd.bot/gateway/security)

Telegram/WhatsApp/Signal/iMessage/Microsoft Teams/Discord/Google Chat/Slack 的默认行为：
- **DM 配对**（`dmPolicy="pairing"` / `channels.discord.dm.policy="pairing"` / `channels.slack.dm.policy="pairing"`）：未知发送者收到一个简短配对代码，机器人不会处理他们的消息。
- 批准：`clawdbot pairing approve <channel> <code>`（然后发送者被添加到本地允许列表存储）。
- 公共入站 DM 需要明确选择加入：设置 `dmPolicy="open"` 并在渠道允许列表中包含 `"*"`（`allowFrom` / `channels.discord.dm.allowFrom` / `channels.slack.dm.allowFrom`）。

运行 `clawdbot doctor` 以突出风险/错误配置的 DM 策略。

## 亮点

- **[本地优先 Gateway](https://docs.clawd.bot/gateway)** — 会话、渠道、工具和事件的单一控制平面。
- **[多渠道收件箱](https://docs.clawd.bot/channels)** — WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage、BlueBubbles、Microsoft Teams、Matrix、Zalo、Zalo Personal、WebChat、macOS、iOS/Android。
- **[多代理路由](https://docs.clawd.bot/gateway/configuration)** — 将入站渠道/账户/对等方路由到隔离代理（工作区 + 每个代理会话）。
- **[语音唤醒](https://docs.clawd.bot/nodes/voicewake) + [对话模式](https://docs.clawd.bot/nodes/talk)** — macOS/iOS/Android 的始终在线语音与 ElevenLabs。
- **[实时 Canvas](https://docs.clawd.bot/platforms/mac/canvas)** — 代理驱动的视觉工作区与 [A2UI](https://docs.clawd.bot/platforms/mac/canvas#canvas-a2ui)。
- **[一流工具](https://docs.clawd.bot/tools)** — 浏览器、Canvas、节点、Cron、会话和 Discord/Slack 操作。
- **[配套应用](https://docs.clawd.bot/platforms/macos)** — macOS 菜单栏应用 + iOS/Android [节点](https://docs.clawd.bot/nodes)。
- **[入门](https://docs.clawd.bot/start/wizard) + [技能](https://docs.clawd.bot/tools/skills)** — 向导驱动设置与捆绑/管理/工作区技能。

## 星标历史

[![Star History Chart](https://api.star-history.com/svg?repos=clawdbot/clawdbot&type=date&legend=top-left)](https://www.star-history.com/#clawdbot/clawdbot&type=date&legend=top-left)

## 我们迄今为止构建的一切

### 核心平台
- [Gateway WS 控制平面](https://docs.clawd.bot/gateway) 与会话、存在、配置、Cron、Webhook、[控制 UI](https://docs.clawd.bot/web) 和 [Canvas 主机](https://docs.clawd.bot/platforms/mac/canvas#canvas-a2ui)。
- [CLI 表面](https://docs.clawd.bot/tools/agent-send)：Gateway、代理、发送、[向导](https://docs.clawd.bot/start/wizard) 和 [医生](https://docs.clawd.bot/gateway/doctor)。
- [Pi 代理运行时](https://docs.clawd.bot/concepts/agent) 在 RPC 模式下与工具流和块流。
- [会话模型](https://docs.clawd.bot/concepts/session)：`main` 用于直接聊天、组隔离、激活模式、队列模式、回复。组规则：[组](https://docs.clawd.bot/concepts/groups)。
- [媒体管道](https://docs.clawd.bot/nodes/images)：图像/音频/视频、转录钩子、大小上限、临时文件生命周期。音频详情：[音频](https://docs.clawd.bot/nodes/audio)。

### 渠道
- [渠道](https://docs.clawd.bot/channels)：[WhatsApp](https://docs.clawd.bot/channels/whatsapp) (Baileys)、[Telegram](https://docs.clawd.bot/channels/telegram) (grammY)、[Slack](https://docs.clawd.bot/channels/slack) (Bolt)、[Discord](https://docs.clawd.bot/channels/discord) (discord.js)、[Google Chat](https://docs.clawd.bot/channels/googlechat) (Chat API)、[Signal](https://docs.clawd.bot/channels/signal) (signal-cli)、[iMessage](https://docs.clawd.bot/channels/imessage) (imsg)、[BlueBubbles](https://docs.clawd.bot/channels/bluebubbles) (扩展)、[Microsoft Teams](https://docs.clawd.bot/channels/msteams) (扩展)、[Matrix](https://docs.clawd.bot/channels/matrix) (扩展)、[Zalo](https://docs.clawd.bot/channels/zalo) (扩展)、[Zalo Personal](https://docs.clawd.bot/channels/zalouser) (扩展)、[WebChat](https://docs.clawd.bot/web/webchat)。

### 节点
- [节点](https://docs.clawd.bot/nodes)：[macOS](https://docs.clawd.bot/platforms/mac) (菜单栏应用)、[iOS](https://docs.clawd.bot/platforms/ios) (节点应用)、[Android](https://docs.clawd.bot/platforms/android) (节点应用)、[Pi](https://docs.clawd.bot/nodes/pi) (Raspberry Pi)、[语音唤醒](https://docs.clawd.bot/nodes/voicewake)、[对话](https://docs.clawd.bot/nodes/talk)、[图像](https://docs.clawd.bot/nodes/images)、[音频](https://docs.clawd.bot/nodes/audio)、[视频](https://docs.clawd.bot/nodes/video)、[浏览器](https://docs.clawd.bot/nodes/browser)、[Canvas](https://docs.clawd.bot/platforms/mac/canvas)。

### 工具
- [工具](https://docs.clawd.bot/tools)：[代理发送](https://docs.clawd.bot/tools/agent-send)、[浏览器](https://docs.clawd.bot/tools/browser)、[Canvas](https://docs.clawd.bot/tools/canvas)、[Cron](https://docs.clawd.bot/tools/cron)、[会话](https://docs.clawd.bot/tools/sessions)、[Discord 操作](https://docs.clawd.bot/tools/discord)、[Slack 操作](https://docs.clawd.bot/tools/slack)、[技能](https://docs.clawd.bot/tools/skills)。

### 平台
- [平台](https://docs.clawd.bot/platforms)：[macOS](https://docs.clawd.bot/platforms/mac) (菜单栏应用 + Canvas)、[iOS](https://docs.clawd.bot/platforms/ios) (节点应用)、[Android](https://docs.clawd.bot/platforms/android) (节点应用)、[Web](https://docs.clawd.bot/web) (控制 UI + WebChat)、[Docker](https://docs.clawd.bot/install/docker)、[Nix](https://github.com/clawdbot/nix-clawdbot)。

### 概念
- [概念](https://docs.clawd.bot/concepts)：[代理](https://docs.clawd.bot/concepts/agent)、[会话](https://docs.clawd.bot/concepts/session)、[组](https://docs.clawd.bot/concepts/groups)、[模型](https://docs.clawd.bot/concepts/models)、[模型故障转移](https://docs.clawd.bot/concepts/model-failover)、[工具](https://docs.clawd.bot/concepts/tools)、[技能](https://docs.clawd.bot/concepts/skills)。

### 调试
- [调试](https://docs.clawd.bot/debugging)：[日志](https://docs.clawd.bot/debugging/logging)、[诊断](https://docs.clawd.bot/debugging/diagnostics)、[医生](https://docs.clawd.bot/gateway/doctor)、[测试](https://docs.clawd.bot/testing)。

### 安装
- [安装](https://docs.clawd.bot/install)：[入门](https://docs.clawd.bot/start/getting-started)、[向导](https://docs.clawd.bot/start/wizard)、[更新](https://docs.clawd.bot/install/updating)、[开发渠道](https://docs.clawd.bot/install/development-channels)、[Docker](https://docs.clawd.bot/install/docker)、[Nix](https://github.com/clawdbot/nix-clawdbot)。

### 入门
- [入门](https://docs.clawd.bot/start)：[入门](https://docs.clawd.bot/start/getting-started)、[向导](https://docs.clawd.bot/start/wizard)、[展示](https://docs.clawd.bot/start/showcase)、[FAQ](https://docs.clawd.bot/start/faq)。

## 贡献与社区

查看 `CONTRIBUTING.md` 获取贡献指南与提交 PR 的方式。

特别感谢所有贡献者与社区支持。

---

*Clawdbot 是一个开源项目。*

