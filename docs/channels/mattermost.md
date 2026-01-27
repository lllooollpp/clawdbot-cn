---
summary: "Mattermost bot setup and Clawdbot config"
read_when:
  - Setting up Mattermost
  - Debugging Mattermost routing
---

# Mattermost（插件）

状态：通过插件支持（机器人令牌 + WebSocket 事件）。支持频道、群组和私信。
Mattermost 是一个可自托管的团队消息平台；请访问官方网站 [mattermost.com](https://mattermost.com) 了解产品详情和下载信息。

## 需要插件
Mattermost 作为插件提供，并未包含在核心安装中。

通过 CLI 安装（npm 仓库）：
bash
clawdbot plugins install @clawdbot/mattermost``````
本地签出（当从 git 仓库运行时）：```bash
clawdbot plugins install ./extensions/mattermost
```
如果您在配置/引导过程中选择使用 Mattermost，并且检测到 git 检出，Clawdbot 将会自动提供本地安装路径。

详情：[插件](/plugin)

## 快速设置
1) 安装 Mattermost 插件。
2) 创建一个 Mattermost 机器人账户并复制 **机器人令牌**。
3) 复制 Mattermost 的 **基础 URL**（例如 `https://chat.example.com`）。
4) 配置 Clawdbot 并启动网关。

最小配置：
json5
{
  channels: {
    mattermost: {
      enabled: true,
      botToken: "mm-token",
      baseUrl: "https://chat.example.com",
      dmPolicy: "pairing"
    }
  }
}
`````````
## 环境变量（默认账户）
如果在网关主机上希望使用环境变量，请设置以下内容：

- `MATTERMOST_BOT_TOKEN=...`
- `MATTERMOST_URL=https://chat.example.com`

环境变量仅适用于 **默认** 账户（`default`）。其他账户必须使用配置值。

## 聊天模式
Mattermost 会自动回复私信。频道行为由 `chatmode` 控制：

- `oncall`（默认）：仅在频道中被@提及的时候回复。
- `onmessage`：回复每个频道消息。
- `onchar`：当消息以触发前缀开头时回复。

配置示例：```json5
{
  channels: {
    mattermost: {
      chatmode: "onchar",
      oncharPrefixes: [">", "!"]
    }
  }
}
```
## 注意事项：
- `onchar` 仍然会响应显式的 @ 提及。
- `channels.mattermost.requireMention` 会保留用于旧配置，但推荐使用 `chatmode`。

## 访问控制（私信）
- 默认设置：`channels.mattermost.dmPolicy = "pairing"`（未知发件人会收到配对码）。
- 审批方式：
  - `clawdbot pairing list mattermost`
  - `clawdbot pairing approve mattermost <CODE>`
- 公开私信：设置 `channels.mattermost.dmPolicy="open"` 并且 `channels.mattermost.allowFrom=["*"]`。

## 频道（群组）
- 默认设置：`channels.mattermost.groupPolicy = "allowlist"`（提及限制）。
- 允许列表中的发件人通过 `channels.mattermost.groupAllowFrom`（用户 ID 或 `@username`）。
- 公开频道：`channels.mattermost.groupPolicy="open"`（提及限制）。

## 出站消息的目标地址
使用以下目标格式与 `clawdbot message send` 或 cron/webhooks 配合使用：

- `channel:<id>` 表示一个频道
- `user:<id>` 表示一个私信
- `@username` 表示一个私信（通过 Mattermost API 解析）

纯 ID 被视为频道。
json5
{
  channels: {
    mattermost: {
      accounts: {
        default: { name: "Primary", botToken: "mm-token", baseUrl: "https://chat.example.com" },
        alerts: { name: "Alerts", botToken: "mm-token-2", baseUrl: "https://alerts.example.com" }
      }
    }
  }
}
`````````
## 故障排除
- 频道中没有回复：确保机器人在频道中并@它（oncall），使用触发前缀（onchar），或设置 `chatmode: "onmessage"`。
- 认证错误：检查机器人的令牌、基础URL以及账户是否已启用。
- 多账户问题：环境变量仅适用于 `default` 账户。