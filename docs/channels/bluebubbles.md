---
summary: "iMessage via BlueBubbles macOS server (REST send/receive, typing, reactions, pairing, advanced actions)."
read_when:
  - Setting up BlueBubbles channel
  - Troubleshooting webhook pairing
  - Configuring iMessage on macOS
---

# BlueBubbles (macOS REST)

状态：捆绑插件，通过 HTTP 与 BlueBubbles macOS 服务器通信。**由于其更丰富的 API 和更简单的设置，推荐用于 iMessage 集成**，相较于传统的 imsg 通道。

## 概述
- 通过 BlueBubbles 辅助应用程序（[bluebubbles.app](https://bluebubbles.app)）在 macOS 上运行。
- 推荐/测试：macOS Sequoia（15）。macOS Tahoe（26）也支持；但目前在 Tahoe 上编辑功能有故障，群组图标更新可能报告成功但不会同步。
- Clawdbot 通过其 REST API 与其通信（`GET /api/v1/ping`，`POST /message/text`，`POST /chat/:id/*`）。
- 入站消息通过 Webhook 到达；出站回复、输入指示、已读回执和点赞操作则通过 REST 调用。
- 附件和贴纸作为入站媒体被处理（并在可能时展示给代理）。
- 配对/允许列表的工作方式与其他通道相同（如 `/start/pairing` 等），使用 `channels.bluebubbles.allowFrom` 加配对码。
- 反应操作作为系统事件呈现，就像 Slack/Telegram 一样，代理可以在回复前“提及”这些反应。
- 高级功能：编辑、撤回、回复线程、消息特效、群组管理。

## 快速开始
1. 在你的 Mac 上安装 BlueBubbles 服务器（按照 [bluebubbles.app/install](https://bluebubbles.app/install) 上的说明进行操作）。
2. 在 BlueBubbles 配置中，启用 Web API 并设置密码。
3. 运行 `clawdbot onboard` 并选择 BlueBubbles，或手动配置：
json5
{
  channels: {
    bluebubbles: {
      enabled: true,
      serverUrl: "http://192.168.1.100:1234",
      password: "example-password",
      webhookPath: "/bluebubbles-webhook"
    }
  }
}
```   ```   ```
4. 将 BlueBubbles 的 Webhook 指向您的网关（例如：`https://your-gateway-host:3000/bluebubbles-webhook?password=<password>`）。
5. 启动网关；它会注册 Webhook 处理器并开始配对。

## 上线流程
BlueBubbles 可在交互式设置向导中使用：```
clawdbot onboard
```
向导提示需要填写：
- **服务器地址**（必填）：BlueBubbles 服务器地址（例如：`http://192.168.1.100:1234`）
- **密码**（必填）：来自 BlueBubbles 服务器设置的 API 密码
- **Webhook 路径**（可选）：默认为 `/bluebubbles-webhook`
- **私信策略**：配对、允许列表、公开 或 禁用
- **允许列表**：电话号码、电子邮件或聊天目标

你也可以通过 CLI 添加 BlueBubbles：

clawdbot channels add bluebubbles --http-url http://192.168.1.100:1234 --password <password>``````
## 访问控制（私信 + 群组）
私信：
- 默认值：`channels.bluebubbles.dmPolicy = "pairing"`。
- 未知发件人会收到一个配对码；消息在未被批准前会被忽略（配对码一小时后过期）。
- 批准方式：
  - `clawdbot pairing list bluebubbles`
  - `clawdbot pairing approve bluebubbles <CODE>`
- 配对是默认的令牌交换方式。详情：[配对](/start/pairing)

群组：
- `channels.bluebubbles.groupPolicy = open | allowlist | disabled`（默认：`allowlist`）。
- `channels.bluebubbles.groupAllowFrom` 控制当设置为 `allowlist` 时，谁可以在群组中触发消息。

### 群组提及限制（Mention gating）
BlueBubbles 支持群组聊天中的提及限制，行为与 iMessage/WhatsApp 一致：
- 使用 `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）来检测提及。
- 当群组启用了 `requireMention` 时，代理只会回应被提及的消息。
- 来自授权发件人的控制命令可以绕过提及限制。

按群组配置：```json5
{
  channels: {
    bluebubbles: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15555550123"],
      groups: {
        "*": { requireMention: true },  // default for all groups
        "iMessage;-;chat123": { requireMention: false }  // override for specific group
      }
    }
  }
}
```
### 命令权限控制
- 控制命令（例如 `/config`, `/model`）需要授权。
- 使用 `allowFrom` 和 `groupAllowFrom` 来确定命令的授权范围。
- 被授权的发送者可以在群组中运行控制命令，而无需被特别提及。

## 输入指示器 + 已读回执
- **输入指示器**：在响应生成前和生成期间会自动发送。
- **已读回执**：由 `channels.bluebubbles.sendReadReceipts` 控制（默认值：`true`）。
- **输入指示器**：Clawdbot 会发送“输入开始”事件；BlueBubbles 在发送消息或超时后会自动清除输入状态（通过 DELETE 手动停止不可靠）。
json5
{
  channels: {
    bluebubbles: {
      sendReadReceipts: false  // 禁用已读回执
    }
  }
}
`````````
## 高级操作
当在配置中启用时，BlueBubbles 支持高级消息操作：```json5
{
  channels: {
    bluebubbles: {
      actions: {
        reactions: true,       // tapbacks (default: true)
        edit: true,            // edit sent messages (macOS 13+, broken on macOS 26 Tahoe)
        unsend: true,          // unsend messages (macOS 13+)
        reply: true,           // reply threading by message GUID
        sendWithEffect: true,  // message effects (slam, loud, etc.)
        renameGroup: true,     // rename group chats
        setGroupIcon: true,    // set group chat icon/photo (flaky on macOS 26 Tahoe)
        addParticipant: true,  // add participants to groups
        removeParticipant: true, // remove participants from groups
        leaveGroup: true,      // leave group chats
        sendAttachment: true   // send attachments/media
      }
    }
  }
}
```
可用的操作：
- **react**: 添加/移除点击反馈反应 (`messageId`, `emoji`, `remove`)
- **edit**: 编辑已发送的消息 (`messageId`, `text`)
- **unsend**: 撤回消息 (`messageId`)
- **reply**: 回复特定消息 (`messageId`, `text`, `to`)
- **sendWithEffect**: 以 iMessage 效果发送消息 (`text`, `to`, `effectId`)
- **renameGroup**: 重命名群组聊天 (`chatGuid`, `displayName`)
- **setGroupIcon**: 设置群组聊天的图标/照片 (`chatGuid`, `media`) —— 在 macOS 26 Tahoe 上可能不稳定（API 可能返回成功，但图标不会同步）。
- **addParticipant**: 将某人添加到群组 (`chatGuid`, `address`)
- **removeParticipant**: 从群组中移除某人 (`chatGuid`, `address`)
- **leaveGroup**: 退出群组聊天 (`chatGuid`)
- **sendAttachment**: 发送媒体/文件 (`to`, `buffer`, `filename`, `asVoice`)
  - 语音备忘录：使用 **MP3** 或 **CAF** 音频时设置 `asVoice: true` 以作为 iMessage 语音消息发送。BlueBubbles 会将 MP3 转换为 CAF 后发送语音备忘录。

### 消息 ID（短 ID 与全 ID）
Clawdbot 可能会显示 *短* 消息 ID（例如 `1`、`2`）以节省令牌。
- `MessageSid` / `ReplyToId` 可以是短 ID。
- `MessageSidFull` / `ReplyToIdFull` 包含提供者的完整 ID。
- 短 ID 是内存中的；在重启或缓存清除后可能会过期。
- 操作可以接受短 ID 或全 ID，但如果短 ID 不再可用，会报错。

对于持久化自动化和存储，请使用全 ID：
- 模板：`{{MessageSidFull}}`，`{{ReplyToIdFull}}`
- 上下文：在入站负载中使用 `MessageSidFull` / `ReplyToIdFull`

有关模板变量，请参阅 [配置](/gateway/configuration)。
json5
{
  channels: {
    bluebubbles: {
      blockStreaming: true  // 启用阻塞流（默认行为）
    }
  }
}``````
## 媒体 + 限制
- 入站附件会下载并存储在媒体缓存中。
- 媒体限制通过 `channels.bluebubbles.mediaMaxMb` 设置（默认：8 MB）。
- 出站文本按 `channels.bluebubbles.textChunkLimit` 分块（默认：4000 个字符）。

## 配置参考
完整配置：[Configuration](/gateway/configuration)

提供者选项：
- `channels.bluebubbles.enabled`: 启用/禁用该通道。
- `channels.bluebubbles.serverUrl`: BlueBubbles REST API 基础 URL。
- `channels.bluebubbles.password`: API 密码。
- `channels.bluebubbles.webhookPath`: Webhook 端点路径（默认：`/bluebubbles-webhook`）。
- `channels.bluebubbles.dmPolicy`: `pairing | allowlist | open | disabled`（默认：`pairing`）。
- `channels.bluebubbles.allowFrom`: DM 允许列表（可以是 handles、emails、E.164 号码、`chat_id:*`、`chat_guid:*`）。
- `channels.bluebubbles.groupPolicy`: `open | allowlist | disabled`（默认：`allowlist`）。
- `channels.bluebubbles.groupAllowFrom`: 群组发送者允许列表。
- `channels.bluebubbles.groups`: 每个群组的配置（如 `requireMention` 等）。
- `channels.bluebubbles.sendReadReceipts`: 是否发送已读回执（默认：`true`）。
- `channels.bluebubbles.blockStreaming`: 启用块流（默认：`true`）。
- `channels.bluebubbles.textChunkLimit`: 出站分块大小（字符数，默认：4000）。
- `channels.bluebubbles.chunkMode`: `length`（默认）仅在超过 `textChunkLimit` 时拆分；`newline` 在长度拆分前按空行（段落边界）拆分。
- `channels.bluebubbles.mediaMaxMb`: 入站媒体限制（MB，默认：8）。
- `channels.bluebubbles.historyLimit`: 最大群组消息数用于上下文（0 表示禁用）。
- `channels.bluebubbles.dmHistoryLimit`: DM 历史记录限制。
- `channels.bluebubbles.actions`: 启用/禁用特定操作。
- `channels.bluebubbles.accounts`: 多账户配置。

相关全局选项：
- `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）。
- `messages.responsePrefix`。

## 地址 / 交付目标
推荐使用 `chat_guid` 进行稳定路由：
- `chat_guid:iMessage;-;+15555550123`（推荐用于群组）
- `chat_id:123`
- `chat_identifier:...`
- 直接 handles：`+15555550123`、`user@example.com`
  - 如果直接 handle 没有现有的 DM 聊天，Clawdbot 会通过 `POST /api/v1/chat/new` 创建一个。这需要 BlueBubbles 私有 API 被启用。

## 安全
- Webhook 请求通过比较 `guid`/`password` 查询参数或头信息与 `channels.bluebubbles.password` 来进行身份验证。来自 `localhost` 的请求也会被接受。
- 请保密 API 密码和 Webhook 端点（将其视为凭证对待）。
- 如果将 BlueBubbles 服务器暴露在局域网外，请启用 HTTPS + 防火墙规则。

## 故障排除
- 如果输入/读取事件无法正常工作，请检查 BlueBubbles 的 webhook 日志，并确认网关路径与 `channels.bluebubbles.webhookPath` 匹配。
- 配对码在一小时后过期；请使用 `clawdbot pairing list bluebubbles` 和 `clawdbot pairing approve bluebubbles <code>` 来处理。
- 反应功能需要 BlueBubbles 的私有 API（`POST /api/v1/message/react`）；请确保服务器版本支持该接口。
- 编辑/撤回消息功能需要 macOS 13+ 和兼容的 BlueBubbles 服务器版本。在 macOS 26（Tahoe）上，由于私有 API 的更改，编辑功能目前存在问题。
- 在 macOS 26（Tahoe）上，群组图标更新可能会不稳定：API 可能返回成功，但新图标无法同步。
- Clawdbot 会根据 BlueBubbles 服务器的 macOS 版本自动隐藏已知损坏的操作。如果在 macOS 26（Tahoe）上编辑功能仍然显示，请手动禁用它：`channels.bluebubbles.actions.edit=false`。
- 查看状态/健康信息：使用 `clawdbot status --all` 或 `clawdbot status --deep`。

有关通用频道工作流程的参考，请参阅 [频道](/channels) 和 [插件](/plugins) 指南。