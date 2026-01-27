---
summary: "Discord bot support status, capabilities, and configuration"
read_when:
  - Working on Discord channel features
---

# Discord（Bot API）

状态：可通过官方 Discord Bot 网关访问私信和服务器文本频道。

## 快速设置（初学者）
1) 创建一个 Discord 机器人并复制机器人的令牌。
2) 为 Clawdbot 设置令牌：
   - 环境变量：`DISCORD_BOT_TOKEN=...`
   - 或配置文件：`channels.discord.token: "..."`。
   - 如果同时设置了两者，配置文件的设置将优先（环境变量作为备用仅适用于默认账户）。
3) 使用消息权限将机器人邀请到你的服务器。
4) 启动网关。
5) 私信访问默认为配对模式；在首次联系时请批准配对代码。

最小配置：
json5
{
  channels: {
    discord: {
      enabled: true,
      token: "YOUR_BOT_TOKEN"
    }
  }
}
`````````
## 目标
- 通过 Discord 私信或服务器频道与 Clawdbot 进行交流。
- 直接聊天会合并到代理的主会话中（默认为 `agent:main:main`）；服务器频道则保持独立，格式为 `agent:<agentId>:discord:channel:<channelId>`（显示名称使用 `discord:<guildSlug>#<channelSlug>`）。
- 群组私信默认被忽略；可通过 `channels.discord.dm.groupEnabled` 启用，并可选择通过 `channels.discord.dm.groupChannels` 进行限制。
- 保持路由的确定性：回复始终发送回消息到达的频道。

## 它是如何工作的
1. 创建一个 Discord 应用程序 → 作为 Bot，启用你需要的 intents（私信 + 服务器消息 + 消息内容），并获取 Bot 的 token。
2. 通过所需的权限将 Bot 邀请到你的服务器中，以便它可以在你希望使用的地方读取和发送消息。
3. 使用 `channels.discord.token`（或作为备用的 `DISCORD_BOT_TOKEN`）配置 Clawdbot。
4. 运行网关；当有 token 可用时，它会自动启动 Discord 频道（优先使用配置，环境变量作为备用），并且 `channels.discord.enabled` 不为 `false`。
   - 如果你更喜欢使用环境变量，请设置 `DISCORD_BOT_TOKEN`（配置块是可选的）。
5. 私信聊天：在发送时使用 `user:<id>`（或 `<@id>` 提及方式）；所有对话都会落在共享的 `main` 会话中。纯数字 ID 是模糊的，会被拒绝。
6. 服务器频道：使用 `channel:<channelId>` 进行发送。默认情况下需要提及，也可以按服务器或频道设置。
7. 私信聊天：默认通过 `channels.discord.dm.policy` 进行安全控制（默认为 `"pairing"`）。未知发送者会收到一个配对码（1 小时后过期）；通过 `clawdbot pairing approve discord <code>` 进行批准。
   - 如果要保留旧的“对任何人开放”的行为：设置 `channels.discord.dm.policy="open"` 并设置 `channels.discord.dm.allowFrom=["*"]`。
   - 如果要严格允许白名单：设置 `channels.discord.dm.policy="allowlist"` 并在 `channels.discord.dm.allowFrom` 中列出允许的发送者。
   - 如果要忽略所有私信：设置 `channels.discord.dm.enabled=false` 或 `channels.discord.dm.policy="disabled"`。
8. 默认情况下，群组私信会被忽略；通过 `channels.discord.dm.groupEnabled` 启用，并可选择通过 `channels.discord.dm.groupChannels` 进行限制。
9. 可选的服务器规则：通过 `channels.discord.guilds` 设置，以服务器 ID（推荐）或 slug 为键，并可设置每个频道的规则。
10. 可选的原生命令：`commands.native` 默认为 `"auto"`（对 Discord/Telegram 为开启，对 Slack 为关闭）。可通过 `channels.discord.commands.native: true|false|"auto"` 覆盖；设置 `false` 会清除之前注册的命令。文本命令由 `commands.text` 控制，必须作为独立的 `/...` 消息发送。使用 `commands.useAccessGroups: false` 可绕过命令的访问组检查。
    - 完整的命令列表 + 配置：[斜杠命令](/tools/slash-commands)
11. 可选的服务器上下文历史记录：设置 `channels.discord.historyLimit`（默认为 20，若未设置则回退到 `messages.groupChat.historyLimit`），以在回复提及消息时包含最后 N 条服务器消息作为上下文。设置 `0` 可禁用。
12. 反应：代理可以通过 `discord` 工具触发反应（由 `channels.discord.actions.*` 控制）。
    - 反应移除语义：详见 [/tools/reactions](/tools/reactions)。
    - `discord` 工具仅在当前频道为 Discord 时可用。
13. 原生命令使用独立的会话密钥（`agent:<agentId>:discord:slash:<userId>`），而不是共享的 `main` 会话。

注意：名称 → ID 的解析使用服务器成员搜索，并需要服务器成员权限；如果机器人无法搜索成员，请使用 ID 或 `<@id>` 的提及方式。
注意：别名（Slugs）为小写，空格替换为 `-`。频道名称的别名不包含前导的 `#`。
注意：服务器上下文 `[from:]` 行包含 `author.tag` + `id`，以便轻松生成可@的回复。

## 配置写入
默认情况下，Discord 允许通过 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

禁用方式为：```json5
{
  channels: { discord: { configWrites: false } }
}
```
## 如何创建你自己的机器人

这是在服务器（guild）频道中运行 Clawdbot 的“Discord 开发者门户”设置，例如 `#help` 频道。

### 1) 创建 Discord 应用 + 机器人用户
1. Discord 开发者门户 → **Applications** → **New Application**
2. 在你的应用中：
   - **Bot** → **Add Bot**
   - 复制 **Bot Token**（这就是你要放入 `DISCORD_BOT_TOKEN` 中的内容）

### 2) 启用 Clawdbot 所需的网关意图（Gateway Intents）
Discord 默认会阻止“特权意图”（privileged intents），除非你明确启用它们。

在 **Bot** → **Privileged Gateway Intents** 中启用：
- **消息内容意图**（用于在大多数服务器中读取消息内容；如果不启用，你可能会看到“Used disallowed intents”或者机器人虽然连接但不会对消息做出反应）
- **服务器成员意图**（推荐；用于某些成员/用户查找以及服务器的允许列表匹配）

你通常不需要 **状态意图**（Presence Intent）。

### 3) 生成邀请链接（OAuth2 链接生成器）
在你的应用中：**OAuth2** → **URL Generator**

**作用域（Scopes）**
- ✅ `bot`
- ✅ `applications.commands`（用于原生命令）

**机器人权限（最小基础权限）**
- ✅ 查看频道
- ✅ 发送消息
- ✅ 读取消息历史
- ✅ 嵌入链接
- ✅ 上传文件
- ✅ 添加反应（可选但推荐）
- ✅ 使用外部表情/贴图（可选；如果你希望使用这些功能）

除非你在调试并且完全信任机器人，否则请避免使用 **管理员** 权限。

复制生成的链接，打开它，选择你的服务器，然后安装机器人。

### 4) 获取 ID（服务器/用户/频道）
Discord 在很多地方都使用数字 ID；Clawdbot 的配置更倾向于使用 ID。

1. Discord（桌面/网页）→ **用户设置** → **高级** → 启用 **开发者模式**
2. 右键点击：
   - 服务器名称 → **复制服务器 ID**（guild id）
   - 频道（例如 `#help`）→ **复制频道 ID**
   - 你的用户 → **复制用户 ID**

### 5) 配置 Clawdbot

#### Token
通过环境变量设置机器人 token（在服务器上推荐）：
- `DISCORD_BOT_TOKEN=...`

或者通过配置文件设置：
python
# 示例配置
token = "你的Bot Token"
````````````json5
{
  channels: {
    discord: {
      enabled: true,
      token: "YOUR_BOT_TOKEN"
    }
  }
}
```
多账号支持：使用 `channels.discord.accounts`，每个账号可以设置独立的令牌，并且可选设置 `name`。详见 [`gateway/configuration`](/gateway/configuration#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts) 中的通用模式。

#### 允许列表 + 频道路由  
示例：“仅允许我，仅允许 #help 频道”：
json5
{
  channels: {
    discord: {
      enabled: true,
      dm: { enabled: false },
      guilds: {
        "YOUR_GUILD_ID": {
          users: ["YOUR_USER_ID"],
          requireMention: true,
          channels: {
            help: { allow: true, requireMention: true }
          }
        }
      },
      retry: {
        attempts: 3,
        minDelayMs: 500,
        maxDelayMs: 30000,
        jitter: 0.1
      }
    }
  }
}``````
注意事项：
- `requireMention: true` 表示机器人仅在被@提及的时候才会回复（推荐用于共享频道）。
- `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）也适用于服务器消息的提及。
- 多代理覆盖：在 `agents.list[].groupChat.mentionPatterns` 上为每个代理设置提及模式。
- 如果 `channels` 存在，则未列出的频道将默认被拒绝。
- 使用 `"*"` 的频道条目可以将默认设置应用于所有频道；显式的频道条目会覆盖通配符。
- 线程会继承父频道的配置（允许列表、`requireMention`、技能、提示等），除非你显式添加了线程频道 ID。
- 机器人发送的消息默认会被忽略；设置 `channels.discord.allowBots=true` 可以允许它们（自己的消息仍然会被过滤）。
- 警告：如果你允许机器人回复其他机器人（`channels.discord.allowBots=true`），请通过 `requireMention`、`channels.discord.guilds.*.channels.<id>.users` 的允许列表，或清除 `AGENTS.md` 和 `SOUL.md` 中的防护规则来防止机器人之间的回复循环。

### 6）验证是否正常工作
1. 启动网关。
2. 在你的服务器频道中发送：`@Krill hello`（或你机器人的名称）。
3. 如果没有任何反应：请查看下方的 **故障排除** 部分。

### 故障排除
- 首先：运行 `clawdbot doctor` 和 `clawdbot channels status --probe`（可操作的警告 + 快速检查）。
- **“使用了不允许的意图”**：在开发者门户中启用 **消息内容意图**（可能还需要 **服务器成员意图**），然后重启网关。
- **机器人连接了但未在服务器频道中回复**：
  - 缺少 **消息内容意图**，或者
  - 机器人没有频道权限（查看/发送/读取历史记录），或者
  - 你的配置要求提及，但你没有提及它，或者
  - 你的服务器/频道允许列表拒绝了该频道/用户。
- **`requireMention: false` 但仍然没有回复**：
  - `channels.discord.groupPolicy` 默认为 **允许列表**；将其设置为 `"open"` 或在 `channels.discord.guilds` 下添加一个服务器条目（可选地在 `channels.discord.guilds.<id>.channels` 下列出频道以进行限制）。
  - 如果你只设置了 `DISCORD_BOT_TOKEN` 而从未创建 `channels.discord` 部分，运行时会将 `groupPolicy` 默认设为 `open`。要锁定它，请添加 `channels.discord.groupPolicy`、`channels.defaults.groupPolicy` 或服务器/频道允许列表。
- `requireMention` 必须位于 `channels.discord.guilds`（或具体频道）下。顶层的 `channels.discord.requireMention` 会被忽略。
- **权限检查**（`channels status --probe`）仅检查数字频道 ID。如果你使用的是别名/名称作为 `channels.discord.guilds.*.channels` 的键，检查无法验证权限。
- **私信（DMs）不起作用**：可能是 `channels.discord.dm.enabled=false`、`channels.discord.dm.policy="disabled"`，或者你尚未获得批准（`channels.discord.dm.policy="pairing"`）。

## 功能与限制
- 支持私信（DMs）和服务器文本频道（threads 被视为独立频道；不支持语音频道）。
- 输入指示器以最佳努力方式发送；消息分块使用 `channels.discord.textChunkLimit`（默认值为 2000）并根据行数拆分长回复（`channels.discord.maxLinesPerMessage`，默认值为 17）。
- 可选的换行分块：设置 `channels.discord.chunkMode="newline"` 会在长度分块前根据空行（段落边界）进行拆分。
- 支持上传文件，最大支持配置的 `channels.discord.mediaMaxMb`（默认值为 8 MB）。
- 默认对服务器回复进行提及限制，以避免嘈杂的机器人。
- 当消息引用其他消息时（引用内容 + ID），会注入回复上下文。
- 原生回复线程默认是 **关闭的**；可以通过 `channels.discord.replyToMode` 和回复标签来启用。```json5
{
  channels: {
    discord: {
      enabled: true,
      token: "abc.123",
      groupPolicy: "allowlist",
      guilds: {
        "*": {
          channels: {
            general: { allow: true }
          }
        }
      },
      mediaMaxMb: 8,
      actions: {
        reactions: true,
        stickers: true,
        emojiUploads: true,
        stickerUploads: true,
        polls: true,
        permissions: true,
        messages: true,
        threads: true,
        pins: true,
        search: true,
        memberInfo: true,
        roleInfo: true,
        roles: false,
        channelInfo: true,
        channels: true,
        voiceStatus: true,
        events: true,
        moderation: false
      },
      replyToMode: "off",
      dm: {
        enabled: true,
        policy: "pairing", // pairing | allowlist | open | disabled
        allowFrom: ["123456789012345678", "steipete"],
        groupEnabled: false,
        groupChannels: ["clawd-dm"]
      },
      guilds: {
        "*": { requireMention: true },
        "123456789012345678": {
          slug: "friends-of-clawd",
          requireMention: false,
          reactionNotifications: "own",
          users: ["987654321098765432", "steipete"],
          channels: {
            general: { allow: true },
            help: {
              allow: true,
              requireMention: true,
              users: ["987654321098765432"],
              skills: ["search", "docs"],
              systemPrompt: "Keep answers short."
            }
          }
        }
      }
    }
  }
}
```
ACK 操作通过 `messages.ackReaction` 和 `messages.ackReactionScope` 在全局范围内进行控制。使用 `messages.removeAckAfterReply` 可在机器人回复后清除 ACK 反应。

- `dm.enabled`: 设置为 `false` 以忽略所有私信（默认为 `true`）。
- `dm.policy`: 私信访问控制（推荐使用 `pairing`）。`"open"` 需要 `dm.allowFrom=["*"]`。
- `dm.allowFrom`: 私信允许列表（用户ID或用户名）。用于 `dm.policy="allowlist"` 和 `dm.policy="open"` 的验证。向导接受用户名，并在机器人可以搜索成员时将其解析为ID。
- `dm.groupEnabled`: 启用群组私信（默认为 `false`）。
- `dm.groupChannels`: 可选的群组私信频道ID或别名允许列表。
- `groupPolicy`: 控制服务器频道的处理方式（`open|disabled|allowlist`）；`allowlist` 需要频道允许列表。
- `guilds`: 按服务器设置的规则，以服务器ID（推荐）或别名作为键。
- `guilds."*"`: 当没有显式条目时应用的默认服务器设置。
- `guilds.<id>.slug`: 可选的友好别名，用于显示名称。
- `guilds.<id>.users`: 可选的服务器用户允许列表（ID或用户名）。
- `guilds.<id>.channels.<channel>.allow`: 当 `groupPolicy="allowlist"` 时，允许/拒绝该频道。
- `guilds.<id>.channels.<channel>.requireMention`: 频道的@提醒限制。
- `guilds.<id>.channels.<channel>.users`: 可选的频道用户允许列表。
- `guilds.<id>.channels.<channel>.skills`: 技能过滤器（省略表示允许所有技能，空表示不允许任何技能）。
- `guilds.<id>.channels.<channel>.systemPrompt`: 频道的额外系统提示（与频道主题合并）。
- `guilds.<id>.channels.<channel>.enabled`: 设置为 `false` 以禁用该频道。
- `guilds.<id>.channels`: 频道规则（键为频道别名或ID）。
- `guilds.<id>.requireMention`: 服务器级别的@提醒要求（可被频道覆盖）。
- `guilds.<id>.reactionNotifications`: 反应系统事件模式（`off`, `own`, `all`, `allowlist`）。
- `textChunkLimit`: 出站文本块大小（字符数）。默认：2000。
- `chunkMode`: `length`（默认）仅在超过 `textChunkLimit` 时拆分；`newline` 在长度拆分前按空行（段落边界）拆分。
- `maxLinesPerMessage`: 每条消息的软性最大行数。默认：17。
- `mediaMaxMb`: 限制保存到磁盘的入站媒体大小（MB）。
- `historyLimit`: 回复@消息时包含的最近服务器消息数量（默认20；若未设置则使用 `messages.groupChat.historyLimit`；设置为 `0` 则禁用）。
- `dmHistoryLimit`: 私信历史限制（用户轮次）。每个用户的覆盖设置：`dms["<user_id>"].historyLimit`。
- `retry`: 出站Discord API调用的重试策略（尝试次数、最小延迟毫秒、最大延迟毫秒、随机抖动）。
- `actions`: 每个操作的工具限制；省略表示允许所有（设置为 `false` 表示禁用）。
  - `reactions`（涵盖反应和查看反应）
  - `stickers`, `emojiUploads`, `stickerUploads`, `polls`, `permissions`, `messages`, `threads`, `pins`, `search`
  - `memberInfo`, `roleInfo`, `channelInfo`, `voiceStatus`, `events`
  - `channels`（创建/编辑/删除频道 + 分类 + 权限）
  - `roles`（角色添加/移除，默认为 `false`）
  - `moderation`（禁言/踢出/封禁，默认为 `false`）

"反应通知使用 `guilds.<id>.reactionNotifications`:
- `off`: 不接收任何反应事件。
- `own`: 仅接收机器人自身消息的反应（默认）。
- `all`: 接收所有消息的所有反应。
- `allowlist`: 仅接收 `guilds.<id>.users` 中指定用户在所有消息上的反应（空列表表示禁用）。

### 工具操作默认设置

| 操作组 | 默认值 | 说明 |
| --- | --- | --- |
| reactions | 启用 | 反应 + 列出反应 + 表情列表 |
| stickers | 启用 | 发送贴纸 |
| emojiUploads | 启用 | 上传表情 |
| stickerUploads | 启用 | 上传贴纸 |
| polls | 启用 | 创建投票 |
| permissions | 启用 | 频道权限快照 |
| messages | 启用 | 读取/发送/编辑/删除 |
| threads | 启用 | 创建/列出/回复 |
| pins | 启用 | 置顶/取消置顶/列出 |
| search | 启用 | 消息搜索（预览功能） |
| memberInfo | 启用 | 成员信息 |
| roleInfo | 启用 | 角色列表 |
| channelInfo | 启用 | 频道信息 + 列出 |
| channels | 启用 | 频道/分类管理 |
| voiceStatus | 启用 | 语音状态查询 |
| events | 启用 | 列出/创建计划事件 |
| roles | 禁用 | 角色添加/移除 |
| moderation | 禁用 | 限制/踢出/封禁 |

- `replyToMode`: `off`（默认）、`first` 或 `all`。仅在模型包含回复标签时生效。

## 回复标签
为了请求线程回复，模型可以在输出中包含一个标签：
- `[[reply_to_current]]` — 回复到触发该回复的Discord消息。
- `[[reply_to:<id>]]` — 回复到上下文/历史中的特定消息ID。
当前消息的ID会以 `[message_id: …]` 的形式附加到提示中；历史条目中已经包含ID。

行为由 `channels.discord.replyToMode` 控制：
- `off`: 忽略标签。
- `first`: 只有第一个出站块/附件是回复。
- `all`: 每个出站块/附件都是回复。

允许列表匹配说明：
- `allowFrom`/`users`/`groupChannels` 可以接受ID、名称、标签或提及（如 `<@id>`）。
- 支持前缀如 `discord:`/`user:`（用户）和 `channel:`（群组DM）。
- 使用 `*` 可以允许任何发送者/频道。
- 当 `guilds.<id>.channels` 存在时，默认拒绝未列出的频道。
- 当 `guilds.<id>.channels` 被省略时，默认允许允许列表中的所有频道。
- 要允许 **没有任何频道**，请设置 `channels.discord.groupPolicy: "disabled"`（或保留一个空的允许列表）。
- 配置向导可以接受 `Guild/Channel` 名称（公共 + 私有），并在可能的情况下将其解析为ID。
- 启动时，Clawdbot 会将允许列表中的频道/用户名称解析为ID（当机器人可以搜索成员时），并记录映射关系；无法解析的条目会保留为原始输入。

原生命令说明：
- 注册的命令与Clawdbot的聊天命令相对应。
- 原生命令遵循与DM/服务器消息相同的允许列表规则（`channels.discord.dm.allowFrom`, `channels.discord.guilds`，以及每频道规则）。
- 未被允许的用户仍可能在Discord UI中看到斜杠命令；Clawdbot在执行时会强制执行允许列表，并回复“未授权”。

## 工具操作
代理可以使用以下操作调用 `discord`：
- `react` / `reactions`（添加或列出反应）
- `sticker`、`poll`、`permissions`
- `readMessages`、`sendMessage`、`editMessage`、`deleteMessage`
- 读取/搜索/置顶工具的有效载荷包括标准化的 `timestampMs`（UTC 时间戳，毫秒）和 `timestampUtc`，以及原始的 Discord `timestamp`。
- `threadCreate`、`threadList`、`threadReply`
- `pinMessage`、`unpinMessage`、`listPins`
- `searchMessages`、`memberInfo`、`roleInfo`、`roleAdd`、`roleRemove`、`emojiList`
- `channelInfo`、`channelList`、`voiceStatus`、`eventList`、`eventCreate`
- `timeout`、`kick`、`ban`

Discord 消息 ID 会在注入的上下文中显示（例如 `[discord message id: …]` 和历史记录行），以便代理可以进行定位。
表情符号可以是 Unicode（例如 `✅`）或自定义表情符号语法，如 `<:party_blob:1234567890>`。

## 安全与运维
- 将机器人令牌视为密码对待；在受监管的主机上优先使用 `DISCORD_BOT_TOKEN` 环境变量，或限制配置文件的权限。
- 仅授予机器人所需的权限（通常是读取/发送消息）。
- 如果机器人卡住或被速率限制，请在确认没有其他进程占用 Discord 会话后，重启网关（`clawdbot gateway --force`）。