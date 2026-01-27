---
summary: "Slack setup for socket or HTTP webhook mode"
read_when: "Setting up Slack or debugging Slack socket/HTTP mode"
---

# Slack

## Socket 模式（默认）

### 快速设置（初学者）
1) 创建一个 Slack 应用并启用 **Socket 模式**。
2) 创建一个 **应用令牌**（`xapp-...`）和一个 **机器人令牌**（`xoxb-...`）。
3) 为 Clawdbot 设置令牌并启动网关。

最小配置：
json5
{
  channels: {
    slack: {
      enabled: true,
      appToken: "xapp-...",
      botToken: "xoxb-..."
    }
  }
}
`````````
### 设置
1) 在 https://api.slack.com/apps 上创建一个 Slack 应用程序（从零开始）。
2) **Socket Mode** → 打开。然后进入 **基本信息** → **应用级令牌** → **生成令牌和作用域**，选择作用域 `connections:write`。复制 **应用令牌**（`xapp-...`）。
3) **OAuth & 权限** → 添加 bot 令牌作用域（使用下面的清单）。点击 **安装到工作区**。复制 **Bot 用户 OAuth 令牌**（`xoxb-...`）。
4) 可选：**OAuth & 权限** → 添加 **用户令牌作用域**（请参见下面的只读列表）。重新安装应用程序并复制 **用户 OAuth 令牌**（`xoxp-...`）。
5) **事件订阅** → 启用事件并订阅以下内容：
   - `message.*`（包括编辑/删除/线程广播）
   - `app_mention`
   - `reaction_added`, `reaction_removed`
   - `member_joined_channel`, `member_left_channel`
   - `channel_rename`
   - `pin_added`, `pin_removed`
6) 邀请 bot 到你希望它读取的频道。
7) 斜杠命令 → 如果你使用 `channels.slack.slashCommand`，请创建 `/clawd`。如果你启用了原生命令，请为每个内置命令添加一个斜杠命令（与 `/help` 的名称相同）。原生命令默认在 Slack 上是关闭的，除非你设置 `channels.slack.commands.native: true`（全局 `commands.native` 默认为 `"auto"`，即保持 Slack 关闭）。
8) 应用主页 → 启用 **消息标签页**，以便用户可以向 bot 发送私信。

使用下面的清单来确保作用域和事件保持同步。

多账户支持：使用 `channels.slack.accounts`，并为每个账户提供令牌和可选的 `name`。有关共享模式，请参见 [`gateway/configuration`](/gateway/configuration#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts)。

### Clawdbot 配置（最小）

通过环境变量设置令牌（推荐）：
- `SLACK_APP_TOKEN=xapp-...`
- `SLACK_BOT_TOKEN=xoxb-...`

或者通过配置文件设置：```json5
{
  channels: {
    slack: {
      enabled: true,
      appToken: "xapp-...",
      botToken: "xoxb-..."
    }
  }
}
```
### 用户令牌（可选）
Clawdbot 可以使用 Slack 用户令牌（`xoxp-...`）进行读取操作（如历史记录、书签、表情、成员信息等）。默认情况下，这保持为只读模式：当存在用户令牌时，优先使用用户令牌进行读取，而写入操作仍然使用机器人令牌，除非你明确选择启用。即使设置 `userTokenReadOnly: false`，当机器人令牌可用时，它仍然优先用于写入操作。

用户令牌在配置文件中进行配置（不支持环境变量）。对于多账户配置，请设置 `channels.slack.accounts.<id>.userToken`。

带有机器人令牌 + 应用令牌 + 用户令牌的示例：
json5
{
  channels: {
    slack: {
      enabled: true,
      appToken: "xapp-...",
      botToken: "xoxb-...",
      userToken: "xoxp-..."
    }
  }
}
`````````
示例中显式设置了 userTokenReadOnly（允许用户令牌写入）：```json5
{
  channels: {
    slack: {
      enabled: true,
      appToken: "xapp-...",
      botToken: "xoxb-...",
      userToken: "xoxp-...",
      userTokenReadOnly: false
    }
  }
}
```
#### Token 使用
- 读取操作（历史记录、表情反应列表、置顶列表、表情符号列表、成员信息、搜索）在配置时优先使用用户令牌，否则使用机器人令牌。
- 写入操作（发送/编辑/删除消息、添加/移除表情反应、置顶/取消置顶、文件上传）默认使用机器人令牌。如果 `userTokenReadOnly: false` 且没有可用的机器人令牌，Clawdbot 将回退到用户令牌。

## 历史记录上下文
- `channels.slack.historyLimit`（或 `channels.slack.accounts.*.historyLimit`）控制多少条最近的频道/群组消息会被包含在提示中。
- 如果未设置，则回退到 `messages.groupChat.historyLimit`。设置 `0` 可以禁用（默认为 50）。

## HTTP 模式（Events API）
当你的网关可以通过 HTTPS 被 Slack 访问时（通常适用于服务器部署），使用 HTTP Webhook 模式。
HTTP 模式使用 Events API + 交互性 + 斜杠命令，并共享一个请求地址。

### 设置步骤
1) 创建一个 Slack 应用，并**禁用 Socket 模式**（如果你只使用 HTTP 模式，这一步是可选的）。
2) **基础信息** → 复制 **Signing Secret**。
3) **OAuth 与权限** → 安装应用并复制 **Bot 用户 OAuth 令牌**（`xoxb-...`）。
4) **事件订阅** → 启用事件，并将 **请求地址** 设置为你的网关 Webhook 路径（默认为 `/slack/events`）。
5) **交互与快捷方式** → 启用并设置相同的 **请求地址**。
6) **斜杠命令** → 为你的命令设置相同的 **请求地址**。

示例请求地址：
`https://gateway-host/slack/events`

### Clawdbot 配置（最小配置）
json5
{
  channels: {
    slack: {
      enabled: true,
      mode: "http",
      botToken: "xoxb-...",
      signingSecret: "your-signing-secret",
      webhookPath: "/slack/events"
    }
  }
}
`````````
多账户 HTTP 模式：设置 `channels.slack.accounts.<id>.mode = "http"`，并为每个账户提供唯一的 `webhookPath`，以便每个 Slack 应用可以指向其自己的 URL。

### 清单文件（可选）
使用此 Slack 应用清单文件快速创建应用（如需，可调整名称/命令）。如果计划配置用户令牌，请包含用户作用域。```json
{
  "display_information": {
    "name": "Clawdbot",
    "description": "Slack connector for Clawdbot"
  },
  "features": {
    "bot_user": {
      "display_name": "Clawdbot",
      "always_online": false
    },
    "app_home": {
      "messages_tab_enabled": true,
      "messages_tab_read_only_enabled": false
    },
    "slash_commands": [
      {
        "command": "/clawd",
        "description": "Send a message to Clawdbot",
        "should_escape": false
      }
    ]
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "chat:write",
        "channels:history",
        "channels:read",
        "groups:history",
        "groups:read",
        "groups:write",
        "im:history",
        "im:read",
        "im:write",
        "mpim:history",
        "mpim:read",
        "mpim:write",
        "users:read",
        "app_mentions:read",
        "reactions:read",
        "reactions:write",
        "pins:read",
        "pins:write",
        "emoji:read",
        "commands",
        "files:read",
        "files:write"
      ],
      "user": [
        "channels:history",
        "channels:read",
        "groups:history",
        "groups:read",
        "im:history",
        "im:read",
        "mpim:history",
        "mpim:read",
        "users:read",
        "reactions:read",
        "pins:read",
        "emoji:read",
        "search:read"
      ]
    }
  },
  "settings": {
    "socket_mode_enabled": true,
    "event_subscriptions": {
      "bot_events": [
        "app_mention",
        "message.channels",
        "message.groups",
        "message.im",
        "message.mpim",
        "reaction_added",
        "reaction_removed",
        "member_joined_channel",
        "member_left_channel",
        "channel_rename",
        "pin_added",
        "pin_removed"
      ]
    }
  }
}
```
如果启用了原生命令，请为每个您希望公开的命令添加一个 `slash_commands` 条目（与 `/help` 列表匹配）。可以通过 `channels.slack.commands.native` 进行覆盖。

## 范围（当前必需 vs 可选）
Slack 的 Conversations API 是按类型范围的：您只需要接触的对话类型（频道、群组、私信、多用户私信）对应的范围。详见 https://docs.slack.dev/apis/web-api/using-the-conversations-api/ 了解概览。

### Bot 令牌范围（必需）
- `chat:write`（通过 `chat.postMessage` 发送/更新/删除消息）
  https://docs.slack.dev/reference/methods/chat.postMessage
- `im:write`（通过 `conversations.open` 打开用户私信）
  https://docs.slack.dev/reference/methods/conversations.open
- `channels:history`, `groups:history`, `im:history`, `mpim:history`
  https://docs.slack.dev/reference/methods/conversations.history
- `channels:read`, `groups:read`, `im:read`, `mpim:read`
  https://docs.slack.dev/reference/methods/conversations.info
- `users:read`（用户查找）
  https://docs.slack.dev/reference/methods/users.info
- `reactions:read`, `reactions:write`（`reactions.get` / `reactions.add`）
  https://docs.slack.dev/reference/methods/reactions.get
  https://docs.slack.dev/reference/methods/reactions.add
- `pins:read`, `pins:write`（`pins.list` / `pins.add` / `pins.remove`）
  https://docs.slack.dev/reference/scopes/pins.read
  https://docs.slack.dev/reference/scopes/pins.write
- `emoji:read`（`emoji.list`）
  https://docs.slack.dev/reference/scopes/emoji.read
- `files:write`（通过 `files.uploadV2` 上传文件）
  https://docs.slack.dev/messaging/working-with-files/#upload

### 用户令牌范围（可选，默认只读）
如果配置了 `channels.slack.userToken`，请在 **用户令牌范围** 下添加这些范围：

- `channels:history`, `groups:history`, `im:history`, `mpim:history`
- `channels:read`, `groups:read`, `im:read`, `mpim:read`
- `users:read`
- `reactions:read`
- `pins:read`
- `emoji:read`
- `search:read`

### 今天不需要（但可能在未来需要）
- `mpim:write`（仅当我们通过 `conversations.open` 添加群组私信或启动私信时需要）
- `groups:write`（仅当我们添加私有频道管理功能：创建/重命名/邀请/归档时需要）
- `chat:write.public`（仅当我们希望机器人向其不在的频道发送消息时需要）
  https://docs.slack.dev/reference/scopes/chat.write.public
- `users:read.email`（仅当我们需要从 `users.info` 获取邮箱字段时需要）
  https://docs.slack.dev/changelog/2017-04-narrowing-email-access
- `files:read`（仅当我们开始列出/读取文件元数据时需要）

## 配置
Slack 仅使用 Socket 模式（没有 HTTP Webhook 服务器）。请提供两个令牌：
json
{
  "slack": {
    "enabled": true,
    "botToken": "xoxb-...",
    "appToken": "xapp-...",
    "groupPolicy": "allowlist",
    "dm": {
      "enabled": true,
      "policy": "pairing",
      "allowFrom": ["U123", "U456", "*"],
      "groupEnabled": false,
      "groupChannels": ["G123"],
      "replyToMode": "all"
    },
    "channels": {
      "C123": { "allow": true, "requireMention": true },
      "#general": {
        "allow": true,
        "requireMention": true,
        "users": ["U123"],
        "skills": ["search", "docs"],
        "systemPrompt": "保持回答简短。"
      }
    },
    "reactionNotifications": "own",
    "reactionAllowlist": ["U123"],
    "replyToMode": "off",
    "actions": {
      "reactions": true,
      "messages": true,
      "pins": true,
      "memberInfo": true,
      "emojiList": true
    },
    "slashCommand": {
      "enabled": true,
      "name": "clawd",
      "sessionPrefix": "slack:slash",
      "ephemeral": true
    },
    "textChunkLimit": 4000,
    "mediaMaxMb": 20
  }
}``````
也可以通过环境变量提供令牌：
- `SLACK_BOT_TOKEN`
- `SLACK_APP_TOKEN`

确认反应（Ack reactions）由 `messages.ackReaction` 和 `messages.ackReactionScope` 全局控制。使用 `messages.removeAckAfterReply` 在机器人回复后清除确认反应。

## 限制
- 出站文本会被拆分为 `channels.slack.textChunkLimit`（默认值为 4000）。
- 可选的换行符拆分：将 `channels.slack.chunkMode="newline"` 设置为按空行（段落边界）拆分，然后再按长度拆分。
- 媒体上传受 `channels.slack.mediaMaxMb` 限制（默认值为 20）。

## 回复线程
默认情况下，Clawdbot 在主频道中回复。使用 `channels.slack.replyToMode` 控制自动线程：

| 模式 | 行为 |
| --- | --- |
| `off` | **默认模式。** 在主频道中回复。只有在触发消息本身已在某个线程中时，才会进行线程回复。 |
| `first` | 第一次回复进入线程（在触发消息下方），后续回复回到主频道。有助于保持上下文可见，同时避免线程混乱。 |
| `all` | 所有回复都进入线程。有助于保持对话集中，但可能降低可见性。 |

此模式适用于自动回复和代理工具调用（`slack sendMessage`）。

### 按聊天类型配置线程
你可以通过设置 `channels.slack.replyToModeByChatType` 来为不同的聊天类型配置不同的线程行为：```json5
{
  channels: {
    slack: {
      replyToMode: "off",        // default for channels
      replyToModeByChatType: {
        direct: "all",           // DMs always thread
        group: "first"           // group DMs/MPIM thread first reply
      },
    }
  }
}
```
支持的聊天类型：
- `direct`：1:1 私聊（Slack `im`）
- `group`：群组私聊 / 多人私聊（Slack `mpim`）
- `channel`：标准频道（公共/私有）

优先级：
1) `replyToModeByChatType.<chatType>`
2) `replyToMode`
3) 供应商默认值（`off`）

旧版 `channels.slack.dm.replyToMode` 仍作为 `direct` 类型的回退选项，当未设置聊天类型覆盖时生效。

示例：

仅线程私聊：
json5
{
  channels: {
    slack: {
      replyToMode: "off",
      replyToModeByChatType: { direct: "all" }
    }
  }
}``````
线程组 DM，但将频道保留在根目录：```json5
{
  channels: {
    slack: {
      replyToMode: "off",
      replyToModeByChatType: { group: "first" }
    }
  }
}
```
{
  channels: {
    slack: {
      replyToMode: "first",
      replyToModeByChatType: { direct: "off", group: "off" }
    }
  }
}

### 手动线程标签
为了更细粒度地控制，请在代理响应中使用以下标签：
- `[[reply_to_current]]` — 回复触发消息（开始/继续线程）。
- `[[reply_to:<id>]]` — 回复特定消息 ID。

## 会话 + 路由
- 私聊（DMs）共享 `main` 会话（如 WhatsApp/Telegram）。
- 频道映射到 `agent:<agentId>:slack:channel:<channelId>` 会话。
- 斜杠命令使用 `agent:<agentId>:slack:slash:<userId>` 会话（前缀可通过 `channels.slack.slashCommand.sessionPrefix` 配置）。
- 如果 Slack 没有提供 `channel_type`，Clawdbot 会根据频道 ID 前缀（`D`、`C`、`G`）进行推断，并默认为 `channel` 以保持会话键的稳定。
- 原生命令注册使用 `commands.native`（全局默认为 `"auto"` → 禁用 Slack）并且可以按工作区覆盖 `channels.slack.commands.native`。文本命令需要独立的 `/...` 消息，并可以通过 `commands.text: false` 禁用。Slack 斜杠命令由 Slack 应用管理，不会自动移除。使用 `commands.useAccessGroups: false` 可以绕过命令的访问组检查。
- 完整命令列表 + 配置：[斜杠命令](/tools/slash-commands)

## 私聊安全（配对）
- 默认：`channels.slack.dm.policy="pairing"` — 未知私聊发送者会收到一个配对码（1 小时后过期）。
- 通过 `clawdbot pairing approve slack <code>` 进行批准。
- 要允许任何人：设置 `channels.slack.dm.policy="open"` 并 `channels.slack.dm.allowFrom=["*"]`。
- `channels.slack.dm.allowFrom` 接受用户 ID、@handle 或电子邮件（当 token 允许时在启动时解析）。向导在 token 允许时接受用户名并在设置过程中解析为 ID。

## 群组策略
- `channels.slack.groupPolicy` 控制频道处理方式（`open|disabled|allowlist`）。
- `allowlist` 需要频道在 `channels.slack.channels` 中列出。
  - 如果你只设置了 `SLACK_BOT_TOKEN`/`SLACK_APP_TOKEN`，但从未创建 `channels.slack` 部分，
    运行时会将 `groupPolicy` 默认设置为 `open`。要锁定它，请添加 `channels.slack.groupPolicy`、
    `channels.defaults.groupPolicy` 或频道允许列表。
  - 配置向导接受 `#channel` 名称并在可能时解析为 ID（公共 + 私有）；如果存在多个匹配项，
    会优先选择活跃的频道。
  - 启动时，Clawdbot 会在 token 允许的情况下将允许列表中的频道/用户名称解析为 ID，
    并记录映射关系；无法解析的条目将保持原样。
  - 要允许 **没有任何频道**，请设置 `channels.slack.groupPolicy: "disabled"`（或保持允许列表为空）。

"频道选项（`channels.slack.channels.<id>` 或 `channels.slack.channels.<name>`）：
- `allow`：当 `groupPolicy="allowlist"` 时，允许/拒绝该频道。
- `requireMention`：频道的提及限制。
- `allowBots`：允许此频道中的机器人发送的消息（默认：false）。
- `users`：可选的按频道用户白名单。
- `skills`：技能过滤器（省略 = 所有技能，空 = 无）。
- `systemPrompt`：为该频道添加的额外系统提示（与主题/目的结合）。
- `enabled`：设置为 `false` 以禁用该频道。

## 交付目标
在使用 cron/CLI 发送时使用：
- `user:<id>` 用于私聊（DMs）
- `channel:<id>` 用于频道

## 工具操作
Slack 工具操作可以通过 `channels.slack.actions.*` 进行控制：

| 操作组 | 默认值 | 说明 |
| --- | --- | --- |
| reactions | enabled | 添加/列出反应 |
| messages | enabled | 读取/发送/编辑/删除 |
| pins | enabled | 置顶/取消置顶/列出 |
| memberInfo | enabled | 成员信息 |
| emojiList | enabled | 自定义表情列表 |

## 安全说明
- 默认情况下，写操作使用机器人令牌，因此状态更改操作将保持在应用的机器人权限和身份范围内。
- 设置 `userTokenReadOnly: false` 允许在没有机器人令牌时使用用户令牌进行写操作，这意味着操作将使用安装用户的权限。请将用户令牌视为高权限，并严格控制操作权限和白名单。
- 如果启用用户令牌写入，请确保用户令牌包含你期望的写入作用域（`chat:write`, `reactions:write`, `pins:write`, `files:write`），否则这些操作将失败。

## 注意事项
- 提及限制由 `channels.slack.channels` 控制（设置 `requireMention` 为 `true`）；`agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）也视为提及。
- 多代理覆盖：在 `agents.list[].groupChat.mentionPatterns` 上设置每代理的提及模式。
- 反应通知遵循 `channels.slack.reactionNotifications`（使用 `reactionAllowlist` 时选择 `allowlist` 模式）。
- 机器人撰写的消息默认被忽略；可通过 `channels.slack.allowBots` 或 `channels.slack.channels.<id>.allowBots` 启用。
- 警告：如果你允许回复其他机器人（`channels.slack.allowBots=true` 或 `channels.slack.channels.<id>.allowBots=true`），请通过 `requireMention`、`channels.slack.channels.<id>.users` 白名单和/或在 `AGENTS.md` 和 `SOUL.md` 中清除防护机制，以防止机器人之间的回复循环。
- 对于 Slack 工具，反应移除语义在 [/tools/reactions](/tools/reactions) 中有说明。
- 当允许且大小在限制内时，附件会被下载到媒体存储中。