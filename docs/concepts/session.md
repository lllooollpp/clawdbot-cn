---
summary: "Session management rules, keys, and persistence for chats"
read_when:
  - Modifying session handling or storage
---

# 会话管理

Clawdbot 将 **每个代理的单个直接聊天会话** 视为主要会话。直接聊天会合并为 `agent:<agentId>:<mainKey>`（默认为 `main`），而群组/频道聊天则会拥有自己的键。`session.mainKey` 会被保留。

使用 `session.dmScope` 来控制 **直接消息** 的分组方式：
- `main`（默认）：所有 DM 消息共享主会话以保持连续性。
- `per-peer`：按发送者 ID 进行隔离，跨频道。
- `per-channel-peer`：按频道 + 发送者进行隔离（推荐用于多用户收件箱）。

使用 `session.identityLinks` 将带有提供者前缀的发送者 ID 映射到一个规范身份，这样当使用 `per-peer` 或 `per-channel-peer` 时，同一个人在不同频道之间的 DM 会话可以共享。

## 网关是唯一真相来源
所有会话状态都由 **网关**（“主” Clawdbot）拥有。UI 客户端（如 macOS 应用、WebChat 等）必须从网关查询会话列表和令牌计数，而不是读取本地文件。

- 在 **远程模式** 下，你关心的会话存储位于远程网关主机上，而不是你的 Mac 上。
- UI 中显示的令牌计数来自网关的存储字段（`inputTokens`、`outputTokens`、`totalTokens`、`contextTokens`）。客户端不会解析 JSONL 转录文件来“修复”总数。

## 状态存储位置
- 在 **网关主机** 上：
  - 存储文件：`~/.clawdbot/agents/<agentId>/sessions/sessions.json`（每个代理一个）。
- 转录文件：`~/.clawdbot/agents/<agentId>/sessions/<SessionId>.jsonl`（Telegram 话题会话使用 `.../<SessionId>-topic-<threadId>.jsonl`）。
- 存储是一个映射 `sessionKey -> { sessionId, updatedAt, ... }`。删除条目是安全的；它们会在需要时重新创建。
- 群组条目可能包含 `displayName`、`channel`、`subject`、`room` 和 `space` 以在 UI 中标记会话。
- 会话条目包含 `origin` 元数据（标签 + 路由提示），以便 UI 能解释该会话的来源。
- Clawdbot **不会** 读取旧版 Pi/Tau 会话文件夹。

## 会话清理
Clawdbot 默认在调用 LLM 之前会从内存上下文中 **清理旧的工具结果**。
这 **不会** 重写 JSONL 历史记录。请参见 [/concepts/session-pruning](/concepts/session-pruning)。

## 预压缩内存刷新
当会话接近自动压缩时，Clawdbot 可以执行一个 **无声内存刷新**，提醒模型将持久化的笔记写入磁盘。这仅在工作区可写时运行。请参见 [Memory](/concepts/memory) 和 [Compaction](/concepts/compaction)。

## 传输方式 → 会话密钥映射
- 私聊遵循 `session.dmScope`（默认为 `main`）。
  - `main`：`agent:<agentId>:<mainKey>`（跨设备/渠道的连续性）。
    - 多个手机号和渠道可以映射到同一个代理主密钥；它们作为进入同一对话的传输方式。
  - `per-peer`：`agent:<agentId>:dm:<peerId>`。
  - `per-channel-peer`：`agent:<agentId>:<channel>:dm:<peerId>`。
  - 如果 `session.identityLinks` 匹配到带有提供者前缀的 peer id（例如 `telegram:123`），则使用规范密钥替换 `<peerId>`，这样同一个人可以在不同渠道间共享一个会话。
- 群聊隔离状态：`agent:<agentId>:<channel>:group:<id>`（房间/渠道使用 `agent:<agentId>:<channel>:channel:<id>`）。
  - Telegram 论坛主题会为群组 id 添加 `:topic:<threadId>` 以实现隔离。
  - 旧版的 `group:<id>` 密钥仍然被识别，用于迁移。
- 入站上下文可能仍使用 `group:<id>`；渠道由 `Provider` 推断得出，并标准化为规范的 `agent:<agentId>:<channel>:group:<id>` 格式。
- 其他来源：
  - 定时任务：`cron:<job.id>`
  - 网页钩子：`hook:<uuid>`（除非网页钩子明确设置）
  - 节点运行：`node-<nodeId>`

## 生命周期
- 重置策略：会话在过期前会被重复使用，过期判断在下一条入站消息时进行。
- 每日重置：默认为 **网关主机的本地时间凌晨 4:00**。一旦会话的最后更新时间早于最近一次每日重置时间，该会话即被视为过时。
- 空闲重置（可选）：`idleMinutes` 添加一个滑动的空闲窗口。当同时配置了每日重置和空闲重置时，**先过期的那个** 会强制生成一个新的会话。
- 旧版空闲重置：如果你只设置了 `session.idleMinutes` 而没有配置 `session.reset` 或 `resetByType`，Clawdbot 会保持空闲-only 模式以确保向后兼容。
- 按类型覆盖（可选）：`resetByType` 允许你为 `dm`、`group` 和 `thread` 会话覆盖重置策略（thread = Slack/Discord 线程、Telegram 主题、当由连接器提供时的 Matrix 线程）。
- 按渠道覆盖（可选）：`resetByChannel` 会覆盖某个渠道的重置策略（适用于该渠道的所有会话类型，并且优先级高于 `session.reset` 或 `resetByType`）。
- 重置触发器：精确的 `/new` 或 `/reset`（加上 `resetTriggers` 中的任何附加内容）会启动一个新的会话 ID 并传递消息的其余部分。`/new <model>` 可接受一个模型别名、`provider/model` 或提供者名称（模糊匹配）来设置新会话的模型。如果仅发送 `/new` 或 `/reset`，Clawdbot 会运行一个简短的“你好”问候回合以确认重置。
- 手动重置：从存储中删除特定密钥或移除 JSONL 转录记录；下一条消息会重新创建它们。
- 隔离的定时任务每次运行都会生成一个新的 `sessionId`（不会重复使用空闲会话）。

## 发送策略（可选）
对于特定的会话类型，可以阻止消息传递，而无需列出具体的 ID。
json5
{
  session: {
    sendPolicy: {
      rules: [
        { action: "拒绝", match: { channel: "discord", chatType: "群组" } },
        { action: "拒绝", match: { keyPrefix: "cron:" } }
      ],
      default: "允许"
    }
  }
}``````
运行时覆盖（仅限拥有者）：
- `/send on` → 允许当前会话
- `/send off` → 拒绝当前会话
- `/send inherit` → 清除覆盖并使用配置规则

请将这些命令作为独立消息发送，以便注册。```json5
// ~/.clawdbot/clawdbot.json
{
  session: {
    scope: "per-sender",      // keep group keys separate
    dmScope: "main",          // DM continuity (set per-channel-peer for shared inboxes)
    identityLinks: {
      alice: ["telegram:123456789", "discord:987654321012345678"]
    },
    reset: {
      // Defaults: mode=daily, atHour=4 (gateway host local time).
      // If you also set idleMinutes, whichever expires first wins.
      mode: "daily",
      atHour: 4,
      idleMinutes: 120
    },
    resetByType: {
      thread: { mode: "daily", atHour: 4 },
      dm: { mode: "idle", idleMinutes: 240 },
      group: { mode: "idle", idleMinutes: 120 }
    },
    resetByChannel: {
      discord: { mode: "idle", idleMinutes: 10080 }
    },
    resetTriggers: ["/new", "/reset"],
    store: "~/.clawdbot/agents/{agentId}/sessions/sessions.json",
    mainKey: "main",
  }
}
```
## 检查状态
- `clawdbot status` — 显示存储路径和最近的会话。
- `clawdbot sessions --json` — 导出所有条目（可通过 `--active <分钟>` 进行过滤）。
- `clawdbot gateway call sessions.list --params '{}'` — 从正在运行的网关获取会话（使用 `--url`/`--token` 可远程访问网关）。
- 在聊天中单独发送 `/status` 消息，查看代理是否可达、会话上下文使用情况、当前的思考/详细模式切换，以及 WhatsApp Web 凭据最后一次刷新时间（有助于发现是否需要重新连接）。
- 发送 `/context list` 或 `/context detail` 查看系统提示中包含的内容和注入的工作区文件（以及最大的上下文贡献者）。
- 单独发送 `/stop` 消息以中止当前运行，清除该会话的待处理后续操作，并停止从该会话派生的所有子代理运行（回复中会包含中止的数量）。
- 单独发送 `/compact`（可选指令）以总结较旧的上下文并腾出窗口空间。详见 [/concepts/compaction](/concepts/compaction)。
- JSONL 格式的对话记录可以直接打开以查看完整的对话回合。

## 小贴士
- 保持主键专门用于一对一通信；让群组使用自己的键。
- 在自动化清理时，删除单个键而不是整个存储，以保留其他地方的上下文。

## 会话来源元数据
每个会话条目会在 `origin` 字段中记录其来源（尽最大努力）：
- `label`: 人工标签（从对话标签 + 群组主题/频道解析而来）
- `provider`: 标准化的频道 ID（包括扩展）
- `from`/`to`: 来自入站信封的原始路由 ID
- `accountId`: 提供商账户 ID（当支持多账户时）
- `threadId`: 当频道支持时的线程/话题 ID
来源字段适用于直接消息、频道和群组。如果一个连接器仅用于更新传递路由（例如，保持一对一主会话的活跃状态），它仍应提供入站上下文，以使会话保持其解释器元数据。扩展可以通过在入站上下文中发送 `ConversationLabel`、`GroupSubject`、`GroupChannel`、`GroupSpace` 和 `SenderName`，并调用 `recordSessionMetaFromInbound`（或向 `updateLastRoute` 传递相同的上下文）来实现这一点。