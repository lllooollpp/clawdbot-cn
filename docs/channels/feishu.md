---
summary: "飞书 (Feishu/Lark) 渠道集成：设置、Webhook、私信、群组、媒体和流式输出。"
read_when:
  - 配置飞书/Lark 渠道
---

# 飞书 (Feishu/Lark)

状态：通过飞书开放平台（Feishu Open Platform）集成。网关通过 Webhook 接收事件。

## 快速设置
1) 在 [飞书开放平台](https://open.feishu.cn/app) 创建一个**企业自建应用**。
2) 在应用设置中启用“机器人”功能。
3) 在“事件订阅”中设置 Webhook 地址（路径：`http://your-host:port/api/plugins/feishu/webhook/default`，如果是多账号，请将 `default` 替换为相应的账号 ID）。
4) 在 `~/.clawdbot/clawdbot.json` 中配置飞书凭证。
5) 启动网关。

最小配置：
```json5
{
  channels: {
    feishu: {
      appId: "cli_a123...",
      appSecret: "your-app-secret",
      encryptKey: "your-encrypt-key", // 可选（推荐）
      verificationToken: "your-verification-token", // 可选（推荐）
      allowFrom: ["your-user-id"]
    }
  }
}
```

## 配置项详解

| 配置项 | 类型 | 描述 |
| --- | --- | --- |
| `appId` | 字符串 | 飞书应用的 App ID |
| `appSecret` | 字符串 | 飞书应用的 App Secret |
| `encryptKey` | 字符串 | 用于 Webhook 事件解码的 Encrypt Key（可选） |
| `verificationToken` | 字符串 | 用于 Webhook 校验的 Verification Token（可选） |
| `baseUrl` | 字符串 | 飞书 API 基础地址（默认：`https://open.feishu.cn`） |
| `webhookPath` | 字符串 | 网关监听 Webhook 的路径（默认：`/feishu/webhook`） |
| `dmPolicy` | 字符串 | 私信策略：`pairing` (配对), `allowlist` (白名单), `open` (开放), `disabled` (禁用) |
| `allowFrom` | 字符串数组 | 允许触发机器人的用户 ID (open_id/user_id) 白名单 |
| `groupPolicy` | 字符串 | 群组策略：`allowlist` (白名单), `open` (开放), `disabled` (禁用) |
| `groupAllowFrom` | 字符串数组| 允许的群组 ID 白名单 |
| `historyLimit` | 数字 | 包含最后 N 条群组消息作为上下文（默认：50） |
| `mediaMaxMb` | 数字 | 入站媒体（图片、音频等）的大小限制（单位：MB） |
| `streamMode` | 字符串 | 流式输出模式：`off` (关闭), `partial` (部分更新), `block` (分块发送) |

## 事件订阅设置
为了使机器人能够接收消息和提及，你需要在飞书开放平台的“事件订阅”部分添加以下事件：
- `接收消息 v2.0` (`im.message.receive_v1`)
- `消息已读 v2.0` (`im.message.read_v1`)

并将 Webhook 地址指向你的网关。如果你的网关在公网不可达，你可能需要使用隧道工具（如 `ngrok` 或 `cloudflare tunnel`）。

## 多账号支持
你可以配置多个飞书应用：
```json5
{
  channels: {
    feishu: {
      accounts: {
        default: {
          appId: "cli_...",
          appSecret: "..."
        },
        work: {
          appId: "cli_...",
          appSecret: "..."
        }
      }
    }
  }
}
```

## 机器人权限
确保你的应用拥有以下权限：
- `im:message` (读取和发送消息)
- `im:resource` (获取资源文件)
- `im:chat` (获取群组信息)

## 群组聊天
- 飞书群组通过 `agent:<agentId>:feishu:group:<chat_id>` 进行会话管理。
- 在群组中，机器人默认需要被 **@提及** 才会触发。
- 你可以通过 `agents.list[].groupChat.mentionPatterns` 配置额外的触发词。

## 媒体支持
- **图片**：支持接收和发送图片。
- **音频**：支持将语音消息转换为文本处理。
- **卡片消息**：网关会将复杂的回复渲染为飞书消息卡片。

## 局限性与说明
- **Webhook 响应**：飞书要求 Webhook 在 3 秒内响应。网关会立即确认请求并在后台处理代理任务。
- **流式输出**：由于飞书消息编辑功能的限制，`streamMode="partial"` 可能无法在所有客户端上完美呈现。推荐使用 `block` 模式。
