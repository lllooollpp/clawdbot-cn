---
summary: "CLI reference for `clawdbot message` (send + channel actions)"
read_when:
  - Adding or modifying message CLI actions
  - Changing outbound channel behavior
---

# `clawdbot message`

用于发送消息和频道操作的单个传出命令  
(Discord/Google Chat/Slack/Mattermost（插件）/Telegram/WhatsApp/Signal/iMessage/MS Teams)。

## 使用方法

clawdbot message <子命令> [标志]``````
频道选择：
- 如果配置了多个频道，则必须使用 `--channel`。
- 如果仅配置了一个频道，则会成为默认频道。
- 可选值：`whatsapp|telegram|discord|googlechat|slack|mattermost|signal|imessage|msteams`（Mattermost 需要插件）

目标格式（`--target`）：
- WhatsApp：E.164 格式或群组 JID
- Telegram：聊天 ID 或 `@username`
- Discord：`channel:<id>` 或 `user:<id>`（或 `<@id>` 提及；原始数字 ID 会被视为频道）
- Google Chat：`spaces/<spaceId>` 或 `users/<userId>`
- Slack：`channel:<id>` 或 `user:<id>`（接受原始频道 ID）
- Mattermost（插件）：`channel:<id>`、`user:<id>` 或 `@username`（原始 ID 会被视为频道）
- Signal：`+E.164`、`group:<id>`、`signal:+E.164`、`signal:group:<id>` 或 `username:<name>`/`u:<name>`
- iMessage：handle、`chat_id:<id>`、`chat_guid:<guid>` 或 `chat_identifier:<id>`
- MS Teams：对话 ID（`19:...@thread.tacv2`）或 `conversation:<id>` 或 `user:<aad-object-id>`

名称查找：
- 对于支持的提供者（Discord/Slack 等），频道名称如 `Help` 或 `#help` 会通过目录缓存进行解析。
- 如果缓存未命中，当提供者支持时，Clawdbot 会尝试进行实时目录查找。

## 常用标志

- `--channel <name>`
- `--account <id>`
- `--target <dest>`（发送/轮询/读取等操作的目标频道或用户）
- `--targets <name>`（重复使用；仅用于广播）
- `--json`
- `--dry-run`
- `--verbose`

## 操作

### 核心操作

- `send`
  - 支持的频道：WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost（插件）/Signal/iMessage/MS Teams
  - 必需参数：`--target`，以及 `--message` 或 `--media`
  - 可选参数：`--media`、`--reply-to`、`--thread-id`、`--gif-playback`
  - 仅 Telegram：`--buttons`（需要 `channels.telegram.capabilities.inlineButtons` 来启用）
  - 仅 Telegram：`--thread-id`（论坛话题 ID）
  - 仅 Slack：`--thread-id`（线程时间戳；`--reply-to` 使用相同字段）
  - 仅 WhatsApp：`--gif-playback`

- `poll`
  - 支持的频道：WhatsApp/Discord/MS Teams
  - 必需参数：`--target`、`--poll-question`、`--poll-option`（可重复）
  - 可选参数：`--poll-multi`
  - 仅 Discord：`--poll-duration-hours`、`--message`

- `react`
  - 支持的频道：Discord/Google Chat/Slack/Telegram/WhatsApp/Signal
  - 必需参数：`--message-id`、`--target`
  - 可选参数：`--emoji`、`--remove`、`--participant`、`--from-me`、`--target-author`、`--target-author-uuid`
  - 注意：`--remove` 需要 `--emoji`（在支持的场景中，省略 `--emoji` 可清除自己的反应；详见 /tools/reactions）
  - 仅 WhatsApp：`--participant`、`--from-me`
  - Signal 群组反应：需要 `--target-author` 或 `--target-author-uuid`

- `reactions`
  - 支持的频道：Discord/Google Chat/Slack
  - 必需参数：`--message-id`、`--target`
  - 可选参数：`--limit`

- `read`
  - 支持的频道：Discord/Slack
  - 必需参数：`--target`
  - 可选参数：`--limit`、`--before`、`--after`
  - 仅 Discord：`--around`

- `edit`
  - 支持的频道：Discord/Slack
  - 必需参数：`--message-id`、`--message`、`--target`

```md
- `delete`
  - 频道：Discord/Slack/Telegram
  - 必要参数：`--message-id`，`--target`

- `pin` / `unpin`
  - 频道：Discord/Slack
  - 必要参数：`--message-id`，`--target`

- `pins`（列表）
  - 频道：Discord/Slack
  - 必要参数：`--target`

- `permissions`
  - 频道：Discord
  - 必要参数：`--target`

- `search`
  - 频道：Discord
  - 必要参数：`--guild-id`，`--query`
  - 可选参数：`--channel-id`，`--channel-ids`（可重复），`--author-id`，`--author-ids`（可重复），`--limit`

### 线程

- `thread create`
  - 频道：Discord
  - 必要参数：`--thread-name`，`--target`（频道 ID）
  - 可选参数：`--message-id`，`--auto-archive-min`

- `thread list`
  - 频道：Discord
  - 必要参数：`--guild-id`
  - 可选参数：`--channel-id`，`--include-archived`，`--before`，`--limit`

- `thread reply`
  - 频道：Discord
  - 必要参数：`--target`（线程 ID），`--message`
  - 可选参数：`--media`，`--reply-to`

### 表情符号

- `emoji list`
  - Discord：`--guild-id`
  - Slack：无额外参数

- `emoji upload`
  - 频道：Discord
  - 必要参数：`--guild-id`，`--emoji-name`，`--media`
  - 可选参数：`--role-ids`（可重复）

### 贴纸

- `sticker send`
  - 频道：Discord
  - 必要参数：`--target`，`--sticker-id`（可重复）
  - 可选参数：`--message`

- `sticker upload`
  - 频道：Discord
  - 必要参数：`--guild-id`，`--sticker-name`，`--sticker-desc`，`--sticker-tags`，`--media`

### 角色 / 频道 / 成员 / 音频

- `role info`（Discord）：`--guild-id`
- `role add` / `role remove`（Discord）：`--guild-id`，`--user-id`，`--role-id`
- `channel info`（Discord）：`--target`
- `channel list`（Discord）：`--guild-id`
- `member info`（Discord/Slack）：`--user-id`（Discord 需额外 `--guild-id`）
- `voice status`（Discord）：`--guild-id`，`--user-id`

### 事件

- `event list`（Discord）：`--guild-id`
- `event create`（Discord）：`--guild-id`，`--event-name`，`--start-time`
  - 可选参数：`--end-time`，`--desc`，`--channel-id`，`--location`，`--event-type`

### 管理（Discord）

- `timeout`：`--guild-id`，`--user-id`（可选 `--duration-min` 或 `--until`；不提供两者则清除超时）
- `kick`：`--guild-id`，`--user-id`（需额外 `--reason`）
- `ban`：`--guild-id`，`--user-id`（需额外 `--delete-days`，`--reason`）
  - `timeout` 也支持 `--reason`

### 广播

- `broadcast`
  - 频道：任何配置的频道；使用 `--channel all` 可以针对所有提供者
  - 必要参数：`--targets`（可重复）
  - 可选参数：`--message`，`--media`，`--dry-run`

## 示例

发送一条 Discord 回复：

clawdbot message send --channel discord \
  --target channel:123 --message "hi" --reply-to 456

创建一个 Discord 投票：

clawdbot message poll --channel discord \
  --target channel:123 \
  --poll-question "Snack?" \
  --poll-option Pizza --poll-option Sushi \
  --poll-multi --poll-duration-hours 48
``````
发送一条 Teams 的主动消息：
clawdbot message send --channel msteams \  
  --target conversation:19:abc@thread.tacv2 --message "hi"```
创建一个团队投票：```
clawdbot message poll --channel msteams \
  --target conversation:19:abc@thread.tacv2 \
  --poll-question "Lunch?" \
  --poll-option Pizza --poll-option Sushi
```
在 Slack 中使用 React：
clawdbot 消息 react --channel slack \  
  --target C123 --message-id 456 --emoji "✅"

在 Signal 组中使用 React：
clawdbot 消息 react --channel signal \
  --target signal:group:abc123 --message-id 1737630212345 \
  --emoji "✅" --target-author-uuid 123e4567-e89b-12d3-a456-426614174000```
发送 Telegram 内联按钮：
clawdbot message send --channel telegram --target @mychat --message "请选择：" \
  --buttons '[ [{"text":"是","callback_data":"cmd:yes"}], [{"text":"否","callback_data":"cmd:no"}] ]'```
