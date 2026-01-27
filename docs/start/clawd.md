---
summary: "End-to-end guide for running Clawdbot as a personal assistant with safety cautions"
read_when:
  - Onboarding a new assistant instance
  - Reviewing safety/permission implications
---

# 使用 Clawdbot 构建个人助手（Clawd 风格）

Clawdbot 是一个用于 **Pi** 代理的 WhatsApp + Telegram + Discord + iMessage 网关。可以添加插件以支持 Mattermost。本指南是“个人助手”的设置：一个专门的 WhatsApp 号码，表现得像您的常驻代理。

## ⚠️ 安全第一

您正在将一个代理置于以下位置：
- 在您的机器上运行命令（取决于您的 Pi 工具设置）
- 读取/写入您的工作区中的文件
- 通过 WhatsApp/Telegram/Discord/Mattermost 发送消息（插件）

请保持谨慎：
- 始终设置 `channels.whatsapp.allowFrom`（永远不要在您的个人 Mac 上运行对全世界开放的设置）。
- 为助手使用一个专用的 WhatsApp 号码。
- 心跳现在默认为每 30 分钟一次。在您信任该设置之前，可以通过设置 `agents.defaults.heartbeat.every: "0m"` 来禁用心跳。
bash
npm install -g clawdbot@latest
# 或：pnpm add -g clawdbot@latest
``````
来自源代码（开发版）：```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm ui:build # auto-installs UI deps on first run
pnpm build
pnpm link --global
```
## 双机设置（推荐）

你想要这样：

Your Phone (personal)          Second Phone (assistant)
┌─────────────────┐           ┌─────────────────┐
│  Your WhatsApp  │  ──────▶  │  Assistant WA   │
│  +1-555-YOU     │  message  │  +1-555-CLAWD   │
└─────────────────┘           └────────┬────────┘
                                       │ linked via QR
                                       ▼
                              ┌─────────────────┐
                              │  Your Mac       │
                              │  (clawdbot)      │
                              │    Pi agent     │
                              └─────────────────┘
``````
如果你将个人 WhatsApp 与 Clawdbot 连接，那么所有发给你的消息都会变成“代理输入”。这通常不是你想要的。

## 5 分钟快速入门

1) 配对 WhatsApp Web（显示二维码；使用助理手机扫描）：```bash
clawdbot channels login
```
2) 启动网关（保持运行）：
bash
clawdbot gateway --port 18789
``````
3) 在 `~/.clawdbot/clawdbot.json` 中添加一个最小配置：```json5
{
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}
```
现在从你允许的电话号码向助手号码发送消息。

在完成引导设置后，我们将自动打开带有网关令牌的仪表盘，并打印出经过令牌化的链接。如需以后重新打开：`clawdbot dashboard`。

## 为代理提供工作空间（AGENTS）

Clawd 会从其工作空间目录中读取操作说明和“记忆”。

默认情况下，Clawdbot 使用 `~/clawd` 作为代理工作空间，并会在首次运行代理时自动创建它（以及初始的 `AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md` 文件）。`BOOTSTRAP.md` 仅在工作空间是全新时创建（在你删除它之后不应再出现）。

提示：将此文件夹视为 Clawd 的“记忆”，并将其设为一个 git 仓库（最好是私有的），以便备份你的 `AGENTS.md` 和记忆文件。如果已安装 git，全新工作空间会自动初始化。
bash
clawdbot setup
``````完整的工作区布局 + 备份指南：[Agent 工作区](/concepts/agent-workspace)  
记忆工作流：[记忆](/concepts/memory)  

可选：通过 `agents.defaults.workspace` 选择不同的工作区（支持 `~`）。
json5
{
  agent: {
    workspace: "~/clawd"
  }
}
``````
如果您已经从仓库中自行发送工作区文件，可以完全禁用引导文件的创建：```json5
{
  agent: {
    skipBootstrap: true
  }
}
```
## 转换为“助手”模式的配置

Clawdbot 默认已配置为一个优秀的助手模式，但你通常可能需要进行调整：
- 在 `SOUL.md` 中设置 persona/instructions
- 调整思考默认设置（如需要）
- 设置心跳（在你信任它之后）

示例：
json5
{
  logging: { level: "info" },
  agent: {
    model: "anthropic/claude-opus-4-5",
    workspace: "~/clawd",
    thinkingDefault: "high",
    timeoutSeconds: 1800,
    // 从 0 开始启动；稍后启用。
    heartbeat: { every: "0m" }
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: {
        "*": { requireMention: true }
      }
    }
  },
  routing: {
    groupChat: {
      mentionPatterns: ["@clawd", "clawd"]
    }
  },
  session: {
    scope: "per-sender",
    resetTriggers: ["/new", "/reset"],
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 10080
    }
  }
}
``````
## 会话与内存

- 会话文件：`~/.clawdbot/agents/<agentId>/sessions/{{SessionId}}.jsonl`
- 会话元数据（token 使用情况、最后路由等）：`~/.clawdbot/agents/<agentId>/sessions/sessions.json`（旧版：`~/.clawdbot/sessions/sessions.json`）
- `/new` 或 `/reset` 会为该聊天启动一个新的会话（可通过 `resetTriggers` 配置）。如果单独发送，代理会回复一条简短的问候以确认重置。
- `/compact [instructions]` 会压缩会话上下文并报告剩余的上下文预算。

## 心跳（主动模式）

默认情况下，Clawdbot 每 30 分钟运行一次心跳，提示内容为：
`如果存在 HEARTBEAT.md（工作区上下文），请阅读它。严格遵守它。不要推断或重复之前聊天中的旧任务。如果没有需要关注的内容，请回复 HEARTBEAT_OK。`
将 `agents.defaults.heartbeat.every: "0m"` 设置为禁用。

- 如果 `HEARTBEAT.md` 存在但实际上是空的（只有空行和如 `# Heading` 的 markdown 标题），Clawdbot 会跳过心跳以节省 API 调用。
- 如果文件不存在，心跳仍然会运行，模型会自行决定如何处理。
- 如果代理回复 `HEARTBEAT_OK`（可选地带有简短的填充文本；详见 `agents.defaults.heartbeat.ackMaxChars`），Clawdbot 会抑制该心跳的外发通知。
- 心跳会执行完整的代理流程——更短的间隔会消耗更多的 token。```json5
{
  agent: {
    heartbeat: { every: "30m" }
  }
}
```
## 媒体输入与输出

通过模板，可以将传入的附件（图片/音频/文档）展示到你的命令中：
- `{{MediaPath}}`（本地临时文件路径）
- `{{MediaUrl}}`（伪URL）
- `{{Transcript}}`（如果启用了音频转录功能）

代理传出的附件：在其单独的一行中包含 `MEDIA:<路径或URL>`（没有空格）。示例：

Here’s the screenshot.
MEDIA:/tmp/screenshot.png
``````
Clawdbot 会提取这些内容，并将它们作为媒体与文本一起发送。

## 操作检查清单```bash
clawdbot status          # local status (creds, sessions, queued events)
clawdbot status --all    # full diagnosis (read-only, pasteable)
clawdbot status --deep   # adds gateway health probes (Telegram + Discord)
clawdbot health --json   # gateway health snapshot (WS)
```
日志位于 `/tmp/clawdbot/` 目录下（默认文件名为 `clawdbot-YYYY-MM-DD.log`）。

## 下一步操作

- WebChat: [WebChat](/web/webchat)
- 网关操作: [网关操作手册](/gateway)
- 定时任务 + 唤醒: [定时任务](/automation/cron-jobs)
- macOS 菜单栏伴侣应用: [Clawdbot macOS 应用](/platforms/macos)
- iOS 节点应用: [iOS 应用](/platforms/ios)
- Android 节点应用: [Android 应用](/platforms/android)
- Windows 状态: [Windows（WSL2）](/platforms/windows)
- Linux 状态: [Linux 应用](/platforms/linux)
- 安全性: [安全](/gateway/security)