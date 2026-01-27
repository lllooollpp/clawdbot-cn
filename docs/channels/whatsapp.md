---
summary: "WhatsApp (web channel) integration: login, inbox, replies, media, and ops"
read_when:
  - Working on WhatsApp/web channel behavior or inbox routing
---

# WhatsApp（网页渠道）

状态：仅通过 Baileys 使用 WhatsApp Web。网关拥有会话（s）。

## 快速设置（初学者）
1) 如果可能的话，使用一个 **独立的手机号码**（推荐）。
2) 在 `~/.clawdbot/clawdbot.json` 中配置 WhatsApp。
3) 运行 `clawdbot channels login` 扫描二维码（已链接设备）。
4) 启动网关。

最小配置：
json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551234567"]
    }
  }
}
`````````
## 目标
- 在一个网关进程（Gateway process）中支持多个 WhatsApp 账户（多账户）。
- 确定性路由：回复返回到 WhatsApp，不使用模型路由。
- 模型能够获得足够的上下文以理解引用回复。

## 配置写入
默认情况下，允许 WhatsApp 通过 `/config set|unset` 触发配置更新（需要 `commands.config: true`）。

禁用方法：```json5
{
  channels: { whatsapp: { configWrites: false } }
}
```
## 架构（谁拥有什么）
- **Gateway** 拥有 Baileys 的 socket 和 inbox 循环。
- **CLI / macOS 应用程序** 与 Gateway 通信；不直接使用 Baileys。
- **活跃监听器** 是发送的必要条件；否则发送会快速失败。

## 获取手机号码（两种模式）

WhatsApp 需要一个真实的手机号码用于验证。VoIP 和虚拟号码通常会被阻止。在 WhatsApp 上运行 Clawdbot 有两种支持的方式：

### 专用号码（推荐）
为 Clawdbot 使用一个**单独的手机号码**。用户体验最佳，路由清晰，不会有自聊的奇怪问题。理想配置：**备用/旧的安卓手机 + eSIM**。保持其连接到 Wi-Fi 和电源，并通过二维码进行绑定。

**WhatsApp Business：** 你可以在同一台设备上使用 WhatsApp Business，并使用另一个号码。这对于将你的个人 WhatsApp 与 Clawdbot 分开非常有用——安装 WhatsApp Business 并在其中注册 Clawdbot 的号码。
json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551234567"]
    }
  }
}
`````````
**配对模式（可选）：**
如果你希望使用配对模式而不是允许列表，请将 `channels.whatsapp.dmPolicy` 设置为 `pairing`。未知发件人会收到一个配对代码；可以通过以下命令进行批准：
`clawdbot pairing approve whatsapp <code>`

### 个人号码（备用方案）
快速备用方案：在 **你自己的号码** 上运行 Clawdbot。为了测试，可以给自己发消息（WhatsApp 中的“给自己发消息”），以免骚扰联系人。在设置和实验过程中，预计需要在主手机上阅读验证码。**必须启用自对话模式。**
当向导询问你的个人 WhatsApp 号码时，请输入你将用于发送消息的号码（即主人/发件人号码），而不是助手号码。```json
{
  "whatsapp": {
    "selfChatMode": true,
    "dmPolicy": "allowlist",
    "allowFrom": ["+15551234567"]
  }
}
```
当设置时，Self-chat 回复默认为 `[{identity.name}]`（否则为 `[clawdbot]`）  
如果未设置 `messages.responsePrefix`，则会如此。请显式设置以自定义或禁用前缀（使用 `""` 来移除它）。

### 号码来源提示
- **本地 eSIM**：来自你所在国家的移动运营商（最可靠）
  - 奥地利：[hot.at](https://www.hot.at)
  - 英国：[giffgaff](https://www.giffgaff.com) — 免费 SIM 卡，无合约
- **预付费 SIM 卡** — 便宜，只需要接收一条短信即可验证

**避免使用**：TextNow、Google Voice、大多数“免费短信”服务 — WhatsApp 会强烈屏蔽这些。

**提示**：号码只需接收一条验证短信即可。之后，WhatsApp Web 会话将通过 `creds.json` 持续存在。

## 为什么不用 Twilio？
- 早期的 Clawdbot 版本支持 Twilio 的 WhatsApp Business 集成。
- WhatsApp Business 号码不适合用作个人助手。
- Meta 强制要求 24 小时回复窗口；如果你在过去 24 小时内没有回复，业务号码将无法发起新消息。
- 高频或“频繁交流”的使用会触发强烈的屏蔽，因为业务账户并非用于发送数十条个人助手消息。
- 结果：消息发送不可靠且经常被屏蔽，因此移除了对该功能的支持。

## 登录与凭证
- 登录命令：`clawdbot channels login`（通过“已链接设备”生成二维码）。
- 多账户登录：`clawdbot channels login --account <id>`（`<id>` = `accountId`）。
- 默认账户（当未指定 `--account` 时）：如果存在 `default`，则使用 `default`，否则使用第一个配置的账户 ID（按顺序排序）。
- 凭证存储在 `~/.clawdbot/credentials/whatsapp/<accountId>/creds.json`。
- 备份副本在 `creds.json.bak`（在损坏时恢复）。
- 兼容性：旧版本安装直接将 Baileys 文件存储在 `~/.clawdbot/credentials/` 中。
- 注销：`clawdbot channels logout`（或 `--account <id>`）会删除 WhatsApp 的认证状态（但保留共享的 `oauth.json`）。
- 注销后的 socket 会报错，提示需要重新链接。

## 入站流程（私信 + 群组）
- WhatsApp 事件来自 `messages.upsert`（Baileys）。
- 在关机时会断开收件箱监听器，以避免在测试/重启时累积事件处理程序。
- 忽略状态/广播聊天。
- 私信使用 E.164 格式；群组使用群组 JID。
- **私信策略**：`channels.whatsapp.dmPolicy` 控制私信访问（默认：`pairing`）。
  - 配对：未知发送者会收到一个配对码（通过 `clawdbot pairing approve whatsapp <code>` 批准；配对码 1 小时后过期）。
  - 公开：需要 `channels.whatsapp.allowFrom` 包含 `"*"`。
  - 自己的消息始终被允许；即使在“自聊天模式”下，也需确保 `channels.whatsapp.allowFrom` 包含自己的号码。

### 个人号码模式（备用方案）
如果你使用的是自己的 **个人 WhatsApp 号码**，请启用 `channels.whatsapp.selfChatMode`（请参见上面的示例）。

行为：
- 外发的私信不会触发配对回复（防止骚扰联系人）。
- 来自未知发件人的私信仍然遵循 `channels.whatsapp.dmPolicy` 策略。
- 自我聊天模式（allowFrom 包含你的号码）会避免自动已读回执，并忽略提及的 JID。
- 非自我聊天的私信会发送已读回执。

## 已读回执
默认情况下，网关在接收 inbound WhatsApp 消息后会将其标记为已读（蓝色勾选）。
json5
{
  channels: { whatsapp: { sendReadReceipts: false } }
}
`````````
按账户禁用：```json5
{
  channels: {
    whatsapp: {
      accounts: {
        personal: { sendReadReceipts: false }
      }
    }
  }
}
```
## 注意事项：
- 自我聊天模式始终会跳过已读回执。

## WhatsApp 常见问题：发送消息 + 配对

**当我链接 WhatsApp 时，Clawdbot 会随机给联系人发送消息吗？**  
不会。默认的私信策略是 **配对**，因此未知发件人只会收到一个配对代码，而他们的消息 **不会被处理**。Clawdbot 只会回复它收到的聊天，或者由你显式触发的发送（通过代理/CLI）。

**WhatsApp 上的配对是如何工作的？**  
配对是针对未知发件人的私信门禁机制：
- 来自新发件人的第一条私信会返回一个短代码（消息不会被处理）。
- 通过命令 `clawdbot pairing approve whatsapp <code>` 进行批准（通过 `clawdbot pairing list whatsapp` 查看列表）。
- 代码在一小时内过期；每个渠道的待处理请求上限为 3 个。

**能否在同一个 WhatsApp 号码上让多个人使用不同的 Clawdbot？**  
可以，通过 `bindings` 将每个发件人路由到不同的代理（peer `kind: "dm"`，发件人 E.164 格式如 `+15551234567`）。回复仍然来自 **同一个 WhatsApp 账号**，直接聊天会合并到每个代理的主要会话中，因此请使用 **每人一个代理**。私信访问控制（`dmPolicy`/`allowFrom`）是针对每个 WhatsApp 账号全局的。详见 [多代理路由](/concepts/multi-agent)。

**为什么向导要询问我的电话号码？**  
向导会使用它来设置你的 **允许列表/所有者**，这样你自己的私信将被允许。它不会用于自动发送。如果你使用个人 WhatsApp 号码运行，请使用相同的号码并启用 `channels.whatsapp.selfChatMode`。

[回复 +1555 id:ABC123]
<quoted text or <media:...>>
[/回复]```  ```
- 回复元数据也已设置：
  - `ReplyToId` = stanzaId
  - `ReplyToBody` = 引用的内容或媒体占位符
  - `ReplyToSender` = 当已知时为 E.164 格式
- 仅媒体的入站消息使用占位符：
  - `<media:image|video|audio|document|sticker>`

## 群组
- 群组映射到 `agent:<agentId>:whatsapp:group:<jid>` 会话。
- 群组策略：`channels.whatsapp.groupPolicy = open|disabled|allowlist`（默认为 `allowlist`）。
- 激活模式：
  - `mention`（默认）：需要 @ 提及或正则匹配。
  - `always`：总是触发。
- `/activation mention|always` 仅限管理员使用，必须作为独立消息发送。
- 管理员 = `channels.whatsapp.allowFrom`（如果未设置，则为自身 E.164）。
- **历史注入**（仅限当前会话）：
  - 最近的 *未处理* 消息（默认 50 条）插入到以下位置：
    `[自你上次回复以来的聊天消息 - 用于提供上下文]`（会话中已存在的消息不会被重新注入）
  - 当前消息插入到以下位置：
    `[当前消息 - 请对此进行回复]`
  - 在发送者后添加后缀：`[from: 名字 (+E164)]`
- 群组元数据缓存 5 分钟（主题 + 参与者）。

## 回复传递（线程处理）
- WhatsApp Web 发送标准消息（当前网关不支持引用回复线程）。
- 此频道会忽略回复标签。

## 确认反应（自动反应）
- WhatsApp 可以在机器人生成回复之前，立即对收到的消息自动发送表情符号反应。这为用户提供即时反馈，表明他们的消息已被接收。

**配置：**```json
{
  "whatsapp": {
    "ackReaction": {
      "emoji": "👀",
      "direct": true,
      "group": "mentions"
    }
  }
}
```
**选项：**
- `emoji` (字符串): 用于确认的表情符号（例如："👀", "✅", "📨"）。空或省略 = 该功能被禁用。
- `direct` (布尔值，默认：`true`): 在私信/直接消息中发送反应。
- `group` (字符串，默认："mentions"): 群组聊天行为：
  - `"always"`: 对所有群组消息进行反应（即使没有@提及）
  - `"mentions"`: 仅在机器人被@提及的时候进行反应
  - `"never"`: 在群组中从不进行反应

**账户级覆盖：**
json
{
  "whatsapp": {
    "accounts": {
      "work": {
        "ackReaction": {
          "emoji": "✅",
          "direct": false,
          "group": "always"
        }
      }
    }
  }
}``````
**行为说明：**
- 反应会在消息接收后**立即**发送，早于输入指示器或机器人回复。
- 在 `requireMention: false`（激活：始终）的群组中，`group: "mentions"` 会响应所有消息（而不仅仅是 @ 提及）。
- 一次性发送：反应失败会被记录，但不会阻止机器人回复。
- 参与者 JID 会自动包含在群组反应中。
- WhatsApp 会忽略 `messages.ackReaction`；请改用 `channels.whatsapp.ackReaction`。

## 代理工具（反应）
- 工具：`whatsapp`，使用 `react` 动作（`chatJid`、`messageId`、`emoji`，可选 `remove`）。
- 可选参数：`participant`（群组发送者）、`fromMe`（对自己消息的反应）、`accountId`（多账号）。
- 反应移除语义：参见 [/tools/reactions](/tools/reactions)。
- 工具控制：`channels.whatsapp.actions.reactions`（默认：启用）。

## 限制
- 出站文本会被拆分为 `channels.whatsapp.textChunkLimit`（默认 4000 字符）。
- 可选换行拆分：设置 `channels.whatsapp.chunkMode="newline"` 会在长度拆分前按空行（段落边界）拆分。
- 入站媒体保存受 `channels.whatsapp.mediaMaxMb` 限制（默认 50 MB）。
- 出站媒体项受 `agents.defaults.mediaMaxMb` 限制（默认 5 MB）。

## 出站发送（文本 + 媒体）
- 使用活动的 Web 监听器；如果网关未运行则会报错。
- 文本拆分：每条消息最多 4000 字符（可通过 `channels.whatsapp.textChunkLimit` 配置，可选 `channels.whatsapp.chunkMode`）。
- 媒体：
  - 支持图像、视频、音频、文档。
  - 音频作为 PTT 发送；`audio/ogg` 会被转换为 `audio/ogg; codecs=opus`。
  - 仅在第一条媒体项上添加描述。
  - 媒体获取支持 HTTP(S) 和本地路径。
  - 动画 GIF：WhatsApp 需要 MP4 格式并设置 `gifPlayback: true` 来实现内联循环。
    - CLI：`clawdbot message send --media <mp4> --gif-playback`
    - 网关：`send` 参数中包含 `gifPlayback: true`

## 语音备忘录（PTT 音频）
WhatsApp 将音频作为 **语音备忘录**（PTT 气泡）发送。
- 最佳效果：OGG/Opus 格式。Clawdbot 会将 `audio/ogg` 转换为 `audio/ogg; codecs=opus`。
- `[[audio_as_voice]]` 对 WhatsApp 无效（音频已默认作为语音备忘录发送）。

## 媒体限制 + 优化
- 默认出站限制：5 MB（每项媒体）。
- 覆盖设置：`agents.defaults.mediaMaxMb`。
- 图像在限制内自动优化为 JPEG（调整尺寸 + 质量扫描）。
- 超出大小的媒体 => 报错；媒体回复将回退为文本警告。

```md
## 心跳检测
- **网关心跳** 记录连接健康状态 (`web.heartbeatSeconds`，默认 60 秒)。
- **代理心跳** 可以按代理配置 (`agents.list[].heartbeat`) 或通过 `agents.defaults.heartbeat` 全局配置（当未设置代理级配置时作为回退）。
  - 使用配置的心跳提示（默认：`Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.`） + `HEARTBEAT_OK` 跳过行为。
  - 默认发送到最后一次使用的频道（或配置的目标频道）。

## 重连行为
- 重连策略：`web.reconnect`:
  - `initialMs`（初始延迟毫秒数），`maxMs`（最大延迟毫秒数），`factor`（增长因子），`jitter`（随机抖动），`maxAttempts`（最大尝试次数）。
- 如果达到最大尝试次数，网页监控将停止（降级状态）。
- 未登录 => 停止并需要重新连接。

## 配置速查表
- `channels.whatsapp.dmPolicy`（私信策略：配对/允许列表/开放/禁用）。
- `channels.whatsapp.selfChatMode`（同手机号设置；机器人使用你的个人 WhatsApp 号码）。
- `channels.whatsapp.allowFrom`（私信允许列表）。WhatsApp 使用 E.164 电话号码（无用户名）。
- `channels.whatsapp.mediaMaxMb`（入站媒体保存上限）。
- `channels.whatsapp.ackReaction`（消息接收时的自动回复：`{emoji, direct, group}`）。
- `channels.whatsapp.accounts.<accountId>.*`（按账户设置，可选 `authDir`）。
- `channels.whatsapp.accounts.<accountId>.mediaMaxMb`（按账户的入站媒体上限）。
- `channels.whatsapp.accounts.<accountId>.ackReaction`（按账户的确认回复覆盖）。
- `channels.whatsapp.groupAllowFrom`（群组发送者允许列表）。
- `channels.whatsapp.groupPolicy`（群组策略）。
- `channels.whatsapp.historyLimit` / `channels.whatsapp.accounts.<accountId>.historyLimit`（群组历史上下文；`0` 表示禁用）。
- `channels.whatsapp.dmHistoryLimit`（用户对话历史限制）。按用户覆盖：`channels.whatsapp.dms["<phone>"].historyLimit`。
- `channels.whatsapp.groups`（群组允许列表 + 提及限制默认值；使用 `"*"` 表示允许所有）。
- `channels.whatsapp.actions.reactions`（限制 WhatsApp 工具的反应）。
- `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）。
- `messages.groupChat.historyLimit`。
- `channels.whatsapp.messagePrefix`（入站消息前缀；按账户：`channels.whatsapp.accounts.<accountId>.messagePrefix`；已弃用：`messages.messagePrefix`）。
- `messages.responsePrefix`（出站消息前缀）。
- `agents.defaults.mediaMaxMb`。
- `agents.defaults.heartbeat.every`。
- `agents.defaults.heartbeat.model`（可选覆盖）。
- `agents.defaults.heartbeat.target`。
- `agents.defaults.heartbeat.to`。
- `agents.defaults.heartbeat.session`。
- `agents.list[].heartbeat.*`（代理级覆盖）。
- `session.*`（作用域、空闲、存储、主键）。
- `web.enabled`（为 false 时禁用频道启动）。
- `web.heartbeatSeconds`。
- `web.reconnect.*`。

## 日志与故障排除
- 子系统: `whatsapp/inbound`, `whatsapp/outbound`, `web-heartbeat`, `web-reconnect`。
- 日志文件: `/tmp/clawdbot/clawdbot-YYYY-MM-DD.log`（可配置）。
- 故障排除指南: [网关故障排除](/gateway/troubleshooting)。

## 快速故障排除

**未链接 / 需要二维码登录**
- 症状: `channels status` 显示 `linked: false` 或提示“未链接”。
- 解决方法: 在网关主机上运行 `clawdbot channels login` 并扫描二维码（WhatsApp → 设置 → 已链接设备）。

**已链接但断开 / 重连循环**
- 症状: `channels status` 显示 `running, disconnected` 或提示“已链接但断开”。
- 解决方法: 运行 `clawdbot doctor`（或重启网关）。如果问题仍然存在，请通过 `channels login` 重新链接，并检查 `clawdbot logs --follow`。

**Bun 运行时**
- Bun **不被推荐**。在 Bun 上 WhatsApp（Baileys）和 Telegram 不稳定。
  请使用 **Node** 运行网关。（参见“开始使用”中的运行时说明。）