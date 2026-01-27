---
summary: "Telegram bot support status, capabilities, and configuration"
read_when:
  - Working on Telegram features or webhooks
---

# Telegram（Bot API）

状态：通过 grammY 实现的 bot 私信 + 群组功能已处于生产就绪状态；默认使用长轮询；Webhook 为可选。

## 快速设置（初学者）
1) 通过 **@BotFather** 创建一个 bot 并复制 token。
2) 设置 token：
   - 环境变量：`TELEGRAM_BOT_TOKEN=...`
   - 或配置文件：`channels.telegram.botToken: "..."`。
   - 如果两者都设置了，配置文件的优先级更高（环境变量仅作为默认账户的后备）。
3) 启动网关。
4) 私信访问默认为配对模式；在首次联系时请批准配对代码。

最小配置：
json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing"
    }
  }
}
`````````
## 它是什么
- 一个由网关拥有的 Telegram Bot API 频道。
- 确定性路由：回复会返回到 Telegram；模型从不选择频道。
- 私信共享代理的主要会话；群组保持隔离 (`agent:<agentId>:telegram:group:<chatId>`).

## 设置（快速路径）
### 1) 创建一个机器人令牌（BotFather）
1) 打开 Telegram 并与 **@BotFather** 聊天。
2) 运行 `/newbot`，然后按照提示操作（名称 + 用户名以 `bot` 结尾）。
3) 复制令牌并妥善保存。

可选的 BotFather 设置：
- `/setjoingroups` — 允许/禁止将机器人添加到群组。
- `/setprivacy` — 控制机器人是否能看到所有群组消息。```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } }
    }
  }
}
```
环境变量选项：`TELEGRAM_BOT_TOKEN=...`（适用于默认账户）。
如果同时设置了环境变量和配置文件，配置文件具有优先级。

多账户支持：使用 `channels.telegram.accounts`，每个账户可以设置独立的令牌和可选的 `name`。详见 [`gateway/configuration`](/gateway/configuration#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts) 中的通用模式。

3) 启动网关。当解析到令牌时启动 Telegram（优先使用配置文件，环境变量作为备用）。
4) 私信访问默认为配对模式。当机器人第一次被联系时，批准代码。
5) 对于群组：添加机器人，决定隐私/管理员行为（见下文），然后设置 `channels.telegram.groups` 以控制@提及规则 + 允许列表。

## 令牌 + 隐私 + 权限（Telegram 侧）

### 令牌创建（BotFather）
- `/newbot` 创建机器人并返回令牌（请保密）。
- 如果令牌泄露，请通过 @BotFather 撤销/重新生成，并更新配置文件。

### 群组消息可见性（隐私模式）
Telegram 机器人的默认设置是 **隐私模式**，这限制了机器人能接收到的群组消息。
如果你的机器人需要查看 *所有* 群组消息，你有两个选择：
- 使用 `/setprivacy` 关闭隐私模式 **或**
- 将机器人添加为群组的 **管理员**（管理员机器人会接收到所有消息）。

**注意：** 当你切换隐私模式时，Telegram 要求你从每个群组中移除并重新添加机器人，才能使更改生效。

### 群组权限（管理员权限）
管理员状态在群组内部设置（通过 Telegram 界面）。管理员机器人总是能接收到所有群组消息，因此如果你需要完全可见性，请使用管理员身份。

## 工作方式（行为逻辑）
- 入站消息会被标准化为共享频道的封装格式，并包含回复上下文和媒体占位符。
- 群组回复默认需要@提及（原生 @mention 或 `agents.list[].groupChat.mentionPatterns` / `messages.groupChat.mentionPatterns`）。
- 多代理覆盖：可在 `agents.list[].groupChat.mentionPatterns` 上设置每个代理的提及模式。
- 所有回复都会返回到同一个 Telegram 聊天中。
- 长轮询使用 grammY 运行器，并按聊天顺序处理；整体并发数由 `agents.defaults.maxConcurrent` 限制。
- Telegram Bot API 不支持已读回执；没有 `sendReadReceipts` 选项。

## 格式（Telegram HTML）
- 出站 Telegram 文本使用 `parse_mode: "HTML"`（Telegram 支持的标签子集）。
- 类似 Markdown 的输入会被渲染为 **Telegram 安全的 HTML**（加粗/斜体/删除线/代码/链接）；块级元素会被转换为文本，使用换行符/项目符号。
- 来自模型的原始 HTML 会被转义，以避免 Telegram 解析错误。
- 如果 Telegram 拒绝 HTML 消息，Clawdbot 会以纯文本重新尝试发送相同的消息。

## 命令（原生 + 自定义）
Clawdbot 在启动时会向 Telegram 的机器人菜单注册原生命令（如 `/status`、`/reset`、`/model`）。
你可以通过配置文件向菜单中添加自定义命令：
json5
{
  channels: {
    telegram: {
      customCommands: [
        { command: "backup", description: "Git backup" },
        { command: "generate", description: "Create an image" }
      ]
    }
  }
}
`````````
## 故障排除

- 日志中出现 `setMyCommands failed` 通常意味着到 `api.telegram.org` 的出站 HTTPS/DNS 被阻止。
- 如果看到 `sendMessage` 或 `sendChatAction` 失败，请检查 IPv6 路由和 DNS。

更多帮助：[频道故障排除](/channels/troubleshooting)。

注意事项：
- 自定义命令是 **菜单项**；除非你在其他地方处理，否则 Clawdbot 不会实现它们。
- 命令名称会被标准化（去掉前导 `/`，转为小写），并且必须匹配 `a-z`、`0-9`、`_`（1–32 个字符）。
- 自定义命令 **不能覆盖原生命令**。冲突会被忽略并记录日志。
- 如果 `commands.native` 被禁用，只有自定义命令会被注册（如果没有自定义命令，则会被清除）。

## 限制

- 出站文本会被拆分为 `channels.telegram.textChunkLimit`（默认 4000）。
- 可选的换行拆分：设置 `channels.telegram.chunkMode="newline"` 以在长度拆分之前按空行（段落边界）拆分。
- 媒体下载/上传受 `channels.telegram.mediaMaxMb`（默认 5）的限制。
- Telegram Bot API 请求会在 `channels.telegram.timeoutSeconds`（默认 500，通过 grammY）后超时。设置较低的值以避免长时间挂起。
- 群组历史记录上下文使用 `channels.telegram.historyLimit`（或 `channels.telegram.accounts.*.historyLimit`），如果没有设置则会回退到 `messages.groupChat.historyLimit`。设置 `0` 以禁用（默认 50）。
- 私聊历史记录可以通过 `channels.telegram.dmHistoryLimit` 限制（用户轮次）。每个用户的覆盖设置：`channels.telegram.dms["<user_id>"].historyLimit`。```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": { requireMention: false }  // always respond in this group
      }
    }
  }
}
```
**重要提示:** 设置 `channels.telegram.groups` 会创建一个 **白名单** - 仅列出的群组（或 `"*"`）会被接受。  
论坛主题会继承其父群组的配置（allowFrom、requireMention、skills、prompts），除非你在 `channels.telegram.groups.<groupId>.topics.<topicId>` 下添加了针对该主题的覆盖设置。

要允许所有群组并始终回复：
json5
{
  channels: {
    telegram: {
      groups: {
        "*": { requireMention: false }  // 所有群组，始终回复
      }
    }
  }
}``````
保持仅提及所有组（默认行为）：```json5
{
  channels: {
    telegram: {
      groups: {
        "*": { requireMention: true }  // or omit groups entirely
      }
    }
  }
}
```
### 通过命令（会话级别）

在群组中发送：
- `/activation always` - 回复所有消息
- `/activation mention` - 需要@提及（默认）

**注意：** 命令仅更新会话状态。如需在重启后保持行为，请使用配置。

### 获取群组聊天ID

将群组中的任意消息转发给 Telegram 上的 `@userinfobot` 或 `@getidsbot`，即可看到聊天ID（负数，如 `-1001234567890`）。

**提示：** 要获取自己的用户ID，可以私信该机器人，它会回复你的用户ID（配对消息），或者在命令启用后使用 `/whoami`。

**隐私提示：** `@userinfobot` 是第三方机器人。如果你更倾向于隐私，可以将机器人添加到群组中，发送一条消息，然后使用 `clawdbot logs --follow` 来查看 `chat.id`，或者使用 Bot API 的 `getUpdates`。``````
## 话题（论坛超级群）
Telegram 论坛话题中，每个消息都包含一个 `message_thread_id`。Clawdbot：
- 将 `:topic:<threadId>` 追加到 Telegram 群组的会话键中，以便每个话题相互隔离。
- 发送输入指示并使用 `message_thread_id` 进行回复，以确保回复保持在对应的话题中。
- 通用话题（thread id 为 `1`）是特殊的：发送消息时会省略 `message_thread_id`（Telegram 会拒绝此操作），但输入指示仍会包含它。
- 在模板上下文中暴露 `MessageThreadId` 和 `IsForum` 用于路由/模板渲染。
- 话题特定的配置位于 `channels.telegram.groups.<chatId>.topics.<threadId>` 下（技能、允许列表、自动回复、系统提示、禁用）。
- 话题配置会继承群组设置（需要提及、允许列表、技能、提示、启用状态），除非在话题级别被覆盖。

私有聊天在某些边缘情况下可能包含 `message_thread_id`。Clawdbot 保持 DM 会话键不变，但在存在 thread id 时仍会使用它进行回复/草稿流传输。```json5
{
  "channels": {
    "telegram": {
      "capabilities": {
        "inlineButtons": "allowlist"
      }
    }
  }
}
```
对于每个账户的配置：
json5
{
  "channels": {
    "telegram": {
      "accounts": {
        "main": {
          "capabilities": {
            "inlineButtons": "allowlist"
          }
        }
      }
    }
  }
}``````
作用域：
- `off` — 禁用内联按钮
- `dm` — 仅限私信（阻止群组目标）
- `group` — 仅限群组（阻止私信目标）
- `all` — 私信 + 群组
- `allowlist` — 私信 + 群组，但仅限 `allowFrom`/`groupAllowFrom` 中允许的发送者（与控制命令相同的规则）

默认值：`allowlist`。
旧版：`capabilities: ["inlineButtons"]` = `inlineButtons: "all"`。

### 发送按钮

使用带有 `buttons` 参数的消息工具：```json5
{
  "action": "send",
  "channel": "telegram",
  "to": "123456789",
  "message": "Choose an option:",
  "buttons": [
    [
      {"text": "Yes", "callback_data": "yes"},
      {"text": "No", "callback_data": "no"}
    ],
    [
      {"text": "Cancel", "callback_data": "cancel"}
    ]
  ]
}
```
当用户点击按钮时，回调数据会以以下格式作为消息发送回代理：
`callback_data: value`

### 配置选项

Telegram 的功能可以在两个层级进行配置（上面显示的是对象形式；仍支持旧版的字符串数组）：

- `channels.telegram.capabilities`: 全局默认功能配置，适用于所有 Telegram 账户，除非被覆盖。
- `channels.telegram.accounts.<account>.capabilities`: 每个账户的功能配置，用于覆盖该特定账户的全局默认设置。

当所有 Telegram 机器人/账户的行为相同时，使用全局设置。当不同的机器人需要不同的行为时（例如，一个账户仅处理私信，而另一个账户允许在群组中使用），则使用每账户配置。

## 访问控制（私信 + 群组）

### 私信访问权限
- 默认值：`channels.telegram.dmPolicy = "pairing"`。未知发件人会收到一个配对代码；消息在未获得批准前会被忽略（代码一小时后过期）。
- 批准方式：
  - `clawdbot pairing list telegram`
  - `clawdbot pairing approve telegram <CODE>`
- 配对是 Telegram 私信中默认的令牌交换方式。详情请参阅：[配对](/start/pairing)
- `channels.telegram.allowFrom` 接受数字用户 ID（推荐）或 `@username` 条目。**不是**机器人的用户名；请使用真实用户发送者的 ID。向导支持 `@username`，并在可能的情况下将其解析为数字 ID。

#### 查找你的 Telegram 用户 ID
更安全（无需第三方机器人）：
1) 启动网关并私信你的机器人。
2) 运行 `clawdbot logs --follow`，并查找 `from.id`。

替代方法（官方 Bot API）：
1) 私信你的机器人。
2) 使用你的机器人令牌获取更新，并读取 `message.from.id`。
bash
   curl "https://api.telegram.org/bot<bot_token>/getUpdates"```   ```
第三方（ less private）：
- 向 `@userinfobot` 或 `@getidsbot` 发送 DM，并使用返回的用户 ID。

### 群组访问

两个独立的控制项：

**1. 哪些群组被允许**（通过 `channels.telegram.groups` 设置群组白名单）：
- 没有 `groups` 配置 = 允许所有群组
- 有 `groups` 配置 = 仅允许列出的群组或 `"*"`（通配符）
- 示例：`"groups": { "-1001234567890": {}, "*": {} }` 允许所有群组

**2. 哪些发送者被允许**（通过 `channels.telegram.groupPolicy` 设置发送者过滤）：
- `"open"` = 允许所有在允许群组中的发送者发送消息
- `"allowlist"` = 仅允许在 `channels.telegram.groupAllowFrom` 中的发送者发送消息
- `"disabled"` = 完全不允许群组消息
默认值为 `groupPolicy: "allowlist"`（除非你添加了 `groupAllowFrom`，否则默认是被阻止的）

大多数用户希望的配置是：`groupPolicy: "allowlist"` + `groupAllowFrom` + 在 `channels.telegram.groups` 中列出特定群组

## 长轮询 vs Webhook
- 默认：长轮询（不需要公网 URL）。
- Webhook 模式：设置 `channels.telegram.webhookUrl`（可选设置 `channels.telegram.webhookSecret` 和 `channels.telegram.webhookPath`）。
  - 本地监听器默认绑定到 `0.0.0.0:8787`，并提供 `POST /telegram-webhook` 接口。
  - 如果你的公网 URL 不同，可以使用反向代理，并将 `channels.telegram.webhookUrl` 指向公网端点。

## 回复线程
Telegram 支持通过标签实现可选的线程回复：
- `[[reply_to_current]]` —— 回复触发消息。
- `[[reply_to:<id>]]` —— 回复特定的消息 ID。

通过 `channels.telegram.replyToMode` 控制：
- `first`（默认）、`all`、`off`。

## 音频消息（语音 vs 文件）
Telegram 区分 **语音备忘录**（圆形气泡）和 **音频文件**（元数据卡片）。
Clawdbot 默认使用音频文件以保持向后兼容性。

如需在代理回复中强制使用语音备忘录气泡，请在回复中的任何位置包含此标签：
- `[[audio_as_voice]]` —— 将音频作为语音备忘录发送，而不是作为文件。

该标签在传递给用户的消息中会被移除。其他渠道会忽略此标签。

对于消息工具发送的音频，设置 `asVoice: true` 并提供一个支持语音的音频 `media` URL（当存在 `media` 时，`message` 是可选的）：```json5
{
  "action": "send",
  "channel": "telegram",
  "to": "123456789",
  "media": "https://example.com/voice.ogg",
  "asVoice": true
}
```
## 流式传输（草稿）
当代理生成回复时，Telegram 可以流式传输 **草稿气泡**。
Clawdbot 使用 Bot API 的 `sendMessageDraft`（不是真实消息）来发送草稿，然后将最终回复作为普通消息发送。

要求（Telegram Bot API 9.3+）：
- **与话题已启用的私聊**（机器人论坛主题模式）。
- 入站消息必须包含 `message_thread_id`（私有话题线程）。
- 流式传输在群组/超群/频道中被忽略。

配置：
- `channels.telegram.streamMode: "off" | "partial" | "block"`（默认值：`partial`）
  - `partial`：用最新的流式文本更新草稿气泡。
  - `block`：以较大的块（分块）更新草稿气泡。
  - `off`：禁用草稿流式传输。
- 可选（仅适用于 `streamMode: "block"`）：
  - `channels.telegram.draftChunk: { minChars?, maxChars?, breakPreference? }`
    - 默认值：`minChars: 200`, `maxChars: 800`, `breakPreference: "paragraph"`（受限于 `channels.telegram.textChunkLimit`）。

注意：草稿流式传输与 **块流式传输**（频道消息）是分开的。  
块流式传输默认是关闭的，如果你想在生成回复时提前发送 Telegram 消息而不是草稿更新，需要将 `channels.telegram.blockStreaming: true` 设置为开启。

## 推理流（仅限 Telegram）
- `/reasoning stream` 在回复生成期间将推理内容流式传输到草稿气泡中，然后发送最终答案而不包含推理过程。
- 如果 `channels.telegram.streamMode` 设置为 `off`，则禁用推理流。

更多背景信息：[流式传输 + 分块](/concepts/streaming)。

## 重试策略
出站的 Telegram API 调用会在遇到临时网络错误或 429 错误时进行重试，采用指数退避和随机抖动机制。可以通过 `channels.telegram.retry` 进行配置。  
更多信息：[重试策略](/concepts/retry)。

## 代理工具（消息 + 反应）
- 工具：`telegram`，带有 `sendMessage` 操作（`to`、`content`、可选 `mediaUrl`、`replyToMessageId`、`messageThreadId`）。
- 工具：`telegram`，带有 `react` 操作（`chatId`、`messageId`、`emoji`）。
- 工具：`telegram`，带有 `deleteMessage` 操作（`chatId`、`messageId`）。
- 反应移除语义：详见 [/tools/reactions](/tools/reactions)。
- 工具门控：`channels.telegram.actions.reactions`、`channels.telegram.actions.sendMessage`、`channels.telegram.actions.deleteMessage`（默认：启用）。

## 反应通知

**反应的工作方式：**
Telegram 的反应作为 **单独的 `message_reaction` 事件** 到达，而不是作为消息负载中的属性。当用户添加反应时，Clawdbot 会：

1. 从 Telegram API 接收 `message_reaction` 更新
2. 将其转换为一个 **系统事件**，格式为：`"Telegram 反应已添加：{emoji} 由 {user} 在消息 {id} 上添加"`
3. 使用 **相同的会话密钥** 将系统事件放入队列
4. 当下一条消息到达该对话时，系统事件会被清空并添加到代理的上下文开头

代理在对话历史中看到反应时，将其视为 **系统通知**，而不是消息元数据。

**配置项：**
- `channels.telegram.reactionNotifications`: 控制哪些反应会触发通知
  - `"off"` — 忽略所有反应
  - `"own"` — 当用户对机器人的消息进行反应时通知（尽力而为；基于内存）（默认）
  - `"all"` — 所有反应都会通知

- `channels.telegram.reactionLevel`: 控制代理的反应能力
  - `"off"` — 代理无法对消息进行反应
  - `"ack"` — 机器人发送确认反应（处理时使用 👀）（默认）
  - `"minimal"` — 代理可以适度反应（建议：每5-10次交流反应一次）
  - `"extensive"` — 代理在适当的时候可以自由反应

**论坛群组：** 在论坛群组中的反应会包含 `message_thread_id`，并使用类似 `agent:main:telegram:group:{chatId}:topic:{threadId}` 的会话密钥。这确保了同一主题中的反应和消息能够保持关联。
json5
{
  channels: {
    telegram: {
      reactionNotifications: "all",  // 查看所有反应
      reactionLevel: "minimal"        // 代理可以适度反应
    }
  }
}
`````````
**要求：**
- Telegram 机器人必须在 `allowed_updates` 中显式请求 `message_reaction`（由 Clawdbot 自动配置）
- 对于 webhook 模式，反应包含在 webhook 的 `allowed_updates` 中
- 对于 polling 模式，反应包含在 `getUpdates` 的 `allowed_updates` 中

## 交付目标（CLI/cron）
- 使用聊天 ID（`123456789`）或用户名（`@name`）作为目标。
- 示例：`clawdbot message send --channel telegram --target 123456789 --message "hi"`。

## 故障排除

**机器人在群组中不响应未@的消息：**
- 如果你设置了 `channels.telegram.groups.*.requireMention=false`，必须关闭 Telegram 的 Bot API **隐私模式**。
  - BotFather: `/setprivacy` → **关闭**（然后移除并重新添加机器人到群组）
- `clawdbot channels status` 在配置期望未@的群组消息时会显示警告。
- `clawdbot channels status --probe` 可以进一步检查显式数字群组 ID 的成员资格（它无法审计通配符 `"*"` 规则）。
- 快速测试：`/activation always`（仅会话有效；使用配置实现持久化）

**机器人完全看不到群组消息：**
- 如果设置了 `channels.telegram.groups`，群组必须被列出或使用 `"*"`
- 检查 @BotFather 中的隐私设置 → "Group Privacy" 应该是 **关闭**
- 确认机器人确实是群组成员（不仅仅是管理员但没有读取权限）
- 检查网关日志：`clawdbot logs --follow`（查找 "skipping group message"）

**机器人响应@消息，但不响应 `/activation always`：**
- `/activation` 命令会更新会话状态，但不会持久化到配置中
- 要实现持久行为，请将群组添加到 `channels.telegram.groups` 中，并设置 `requireMention: false`

**像 `/status` 这样的命令不起作用：**
- 确保你的 Telegram 用户 ID 已授权（通过配对或 `channels.telegram.allowFrom`）
- 即使在 `groupPolicy: "open"` 的群组中，命令也需要授权

**在 Node 22+ 上长期轮询立即中止（通常与代理/自定义 fetch 有关）：**
- Node 22+ 对 `AbortSignal` 实例的处理更严格；外部的信号可能会立即中止 `fetch` 请求。
- 升级到一个对中止信号进行标准化处理的 Clawdbot 版本，或在 Node 20 上运行网关，直到你可以升级。

**机器人启动后，静默停止响应（或日志中出现 `HttpError: Network request ... failed`）：**
- 一些主机将 `api.telegram.org` 解析为 IPv6。如果你的服务器没有工作中的 IPv6 出站连接，grammY 可能会卡在 IPv6 请求上。
- 解决方法：启用 IPv6 出站连接 **或** 强制 `api.telegram.org` 解析为 IPv4（例如，在 `/etc/hosts` 中添加使用 IPv4 A 记录的条目，或在操作系统 DNS 栈中优先使用 IPv4），然后重启网关。
- 快速检查：运行 `dig +short api.telegram.org A` 和 `dig +short api.telegram.org AAAA` 来确认 DNS 返回的结果。

提供者选项：
- `channels.telegram.enabled`: 启用/禁用频道启动。
- `channels.telegram.botToken`: 机器人的令牌（来自 BotFather）。
- `channels.telegram.tokenFile`: 从文件路径读取令牌。
- `channels.telegram.dmPolicy`: `pairing | allowlist | open | disabled`（默认：pairing）。
- `channels.telegram.allowFrom`: DM 允许列表（ID/用户名）。`open` 需要 `"*"`。
- `channels.telegram.groupPolicy`: `open | allowlist | disabled`（默认：allowlist）。
- `channels.telegram.groupAllowFrom`: 群组发送者允许列表（ID/用户名）。
- `channels.telegram.groups`: 每个群组的默认值 + 允许列表（使用 `"*"` 表示全局默认值）。
  - `channels.telegram.groups.<id>.requireMention`: 默认的提及限制。
  - `channels.telegram.groups.<id>.skills`: 技能过滤器（省略 = 所有技能，空 = 无技能）。
  - `channels.telegram.groups.<id>.allowFrom`: 每个群组的发送者允许列表覆盖。
  - `channels.telegram.groups.<id>.systemPrompt`: 该群组的额外系统提示。
  - `channels.telegram.groups.<id>.enabled`: 当为 `false` 时禁用该群组。
  - `channels.telegram.groups.<id>.topics.<threadId>.*`: 每个话题的覆盖设置（与群组相同的字段）。
  - `channels.telegram.groups.<id>.topics.<threadId>.requireMention`: 每个话题的提及限制覆盖。
- `channels.telegram.capabilities.inlineButtons`: `off | dm | group | all | allowlist`（默认：allowlist）。控制内联按钮功能。
- `channels.telegram.accounts.<account>.capabilities.inlineButtons`: 每个账户的内联按钮功能覆盖。
- `channels.telegram.replyToMode`: `off | first | all`（默认：`first`）。控制回复模式。
- `channels.telegram.textChunkLimit`: 出站消息的分块大小（字符数）。
- `channels.telegram.chunkMode`: `length`（默认）或 `newline`，在长度分块前按空行（段落边界）分块。
- `channels.telegram.linkPreview`: 控制出站消息的链接预览（默认：true）。
- `channels.telegram.streamMode`: `off | partial | block`（草案流模式）。
- `channels.telegram.mediaMaxMb`: 入站/出站媒体的大小限制（MB）。
- `channels.telegram.retry`: 出站 Telegram API 调用的重试策略（尝试次数、最小延迟毫秒、最大延迟毫秒、抖动）。
- `channels.telegram.proxy`: Bot API 调用的代理 URL（SOCKS/HTTP）。
- `channels.telegram.webhookUrl`: 启用 Webhook 模式。
- `channels.telegram.webhookSecret`: Webhook 密钥（可选）。
- `channels.telegram.webhookPath`: 本地 Webhook 路径（默认 `/telegram-webhook`）。
- `channels.telegram.actions.reactions`: 控制 Telegram 工具的反应功能。
- `channels.telegram.actions.sendMessage`: 控制 Telegram 工具发送消息的功能。
- `channels.telegram.actions.deleteMessage`: 控制 Telegram 工具删除消息的功能。
- `channels.telegram.reactionNotifications`: `off | own | all` — 控制哪些反应会触发系统事件（默认：未设置时为 `own`）。
- `channels.telegram.reactionLevel`: `off | ack | minimal | extensive` — 控制代理的反应能力（默认：未设置时为 `minimal`）。

相关全局选项：
- `agents.list[].groupChat.mentionPatterns`（提及过滤模式）。
- `messages.groupChat.mentionPatterns`（全局默认值）。
- `commands.native`（默认值为 `"auto"` → 对 Telegram/Discord 为开启，对 Slack 为关闭），`commands.text`，`commands.useAccessGroups`（命令行为）。可通过 `channels.telegram.commands.native` 覆盖。
- `messages.responsePrefix`，`messages.ackReaction`，`messages.ackReactionScope`，`messages.removeAckAfterReply`。