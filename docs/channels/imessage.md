---
summary: "iMessage support via imsg (JSON-RPC over stdio), setup, and chat_id routing"
read_when:
  - Setting up iMessage support
  - Debugging iMessage send/receive
---

# iMessage (imsg)

状态：外部 CLI 集成。网关将通过 stdio 的 JSON-RPC 启动 `imsg rpc`。

## 快速设置（新手）

1) 确保此 Mac 上已登录 Messages。
2) 安装 `imsg`：
   - `brew install steipete/tap/imsg`
3) 使用 `channels.imessage.cliPath` 和 `channels.imessage.dbPath` 配置 Clawdbot。
4) 启动网关并批准任何 macOS 的提示（自动化 + 全盘访问）。

最小配置：
json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "/usr/local/bin/imsg",
      dbPath: "/Users/<you>/Library/Messages/chat.db"
    }
  }
}
`````````
## 它是什么
- 基于 `imsg` 的 macOS 上的 iMessage 通道。
- 确定性路由：回复始终返回到 iMessage。
- 私信共享代理的主要会话；群组是隔离的 (`agent:<agentId>:imessage:group:<chat_id>`)。
- 如果一个多方参与的线程传入 `is_group=false`，你仍然可以通过 `chat_id` 使用 `channels.imessage.groups` 进行隔离（参见下面的“类似群组的线程”）。

## 配置写入
默认情况下，iMessage 允许通过 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

禁用方法为：```json5
{
  channels: { imessage: { configWrites: false } }
}
```
## 要求
- macOS 并且已登录 Messages。
- Clawdbot 对 `imsg`（Messages 数据库访问）具有完全磁盘访问权限。
- 发送时需要自动化权限。
- `channels.imessage.cliPath` 可以指向任何可以代理 stdin/stdout 的命令（例如，一个通过 SSH 连接到另一台 Mac 并运行 `imsg rpc` 的包装脚本）。

## 设置（快速路径）
1) 确保此 Mac 上已登录 Messages。
2) 配置 iMessage 并启动网关。

### 专用机器人 macOS 用户（用于隔离身份）
如果你想让机器人使用一个 **独立的 iMessage 身份**（并保持你个人的 Messages 账户干净），请使用一个专用的 Apple ID 和一个专用的 macOS 用户。

1) 创建一个专用的 Apple ID（例如：`my-cool-bot@icloud.com`）。
   - Apple 可能需要一个电话号码用于验证 / 两步验证。
2) 创建一个 macOS 用户（例如：`clawdshome`）并登录该用户。
3) 在该 macOS 用户中打开 Messages 并使用机器人 Apple ID 登录 iMessage。
4) 启用远程登录（系统设置 → 通用 → 共享 → 远程登录）。
5) 安装 `imsg`：
   - `brew install steipete/tap/imsg`
6) 配置 SSH，使得 `ssh <bot-macos-user>@localhost true` 能够无需密码即可运行。
7) 将 `channels.imessage.accounts.bot.cliPath` 指向一个 SSH 包装脚本，该脚本以机器人用户身份运行 `imsg`。

首次运行注意事项：发送/接收可能需要在 *机器人 macOS 用户* 中进行 GUI 批准（自动化权限 + 完全磁盘访问）。如果 `imsg rpc` 看起来卡住或退出，请登录该用户（屏幕共享有助于操作），运行一次 `imsg chats --limit 1` / `imsg send ...`，批准提示，然后重试。

包装脚本示例（需 `chmod +x`）。将 `<bot-macos-user>` 替换为你的实际 macOS 用户名：
bash
#!/usr/bin/env bash
set -euo pipefail

# 首先运行一次交互式 SSH 以接受主机密钥：
#   ssh <bot-macos-user>@localhost true
exec /usr/bin/ssh -o BatchMode=yes -o ConnectTimeout=5 -T <bot-macos-user>@localhost \
  "/usr/local/bin/imsg" "$@"``````
示例配置：```json5
{
  channels: {
    imessage: {
      enabled: true,
      accounts: {
        bot: {
          name: "Bot",
          enabled: true,
          cliPath: "/path/to/imsg-bot",
          dbPath: "/Users/<bot-macos-user>/Library/Messages/chat.db"
        }
      }
    }
  }
}
```
对于单账户设置，请使用平铺选项（`channels.imessage.cliPath`、`channels.imessage.dbPath`），而不是 `accounts` 映射。

### 远程/SSH 变体（可选）
如果你想在另一台 Mac 上使用 iMessage，请将 `channels.imessage.cliPath` 设置为在一个运行在远程 macOS 主机上的 SSH 会话中执行 `imsg` 的包装脚本。Clawdbot 仅需要标准输入输出。
bash
#!/usr/bin/env bash
exec ssh -T gateway-host imsg "$@"``````
**远程附件**：当 `cliPath` 通过 SSH 指向远程主机时，Messages 数据库中的附件路径会引用远程机器上的文件。Clawdbot 可以通过设置 `channels.imessage.remoteHost` 自动通过 SCP 获取这些文件：```json5
{
  channels: {
    imessage: {
      cliPath: "~/imsg-ssh",                     // SSH wrapper to remote Mac
      remoteHost: "user@gateway-host",           // for SCP file transfer
      includeAttachments: true
    }
  }
}
```
如果未设置 `remoteHost`，Clawdbot 会尝试通过解析你在包装脚本中的 SSH 命令来自动检测它。为了保证可靠性，建议进行显式配置。

#### 通过 Tailscale 连接远程 Mac（示例）
如果网关运行在 Linux 主机/虚拟机上，但 iMessage 必须在 Mac 上运行，Tailscale 是最简单的桥梁：网关通过 tailnet 与 Mac 通信，通过 SSH 运行 `imsg`，并将附件通过 SCP 传回。

┌──────────────────────────────┐          SSH (imsg rpc)          ┌──────────────────────────┐
│ 网关主机（Linux/VM）         │──────────────────────────────────▶│ 运行 Messages + imsg 的 Mac │
│ - clawdbot 网关               │          SCP（附件）              │ - 已登录 Messages          │
│ - channels.imessage.cliPath   │◀──────────────────────────────────│ - 已启用远程登录           │
└──────────────────────────────┘                                   └──────────────────────────┘
              ▲
              │ Tailscale tailnet（主机名或 100.x.y.z）
              ▼
        user@gateway-host``````
混凝土配置示例（Tailscale 主机名）：```json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "~/.clawdbot/scripts/imsg-ssh",
      remoteHost: "bot@mac-mini.tailnet-1234.ts.net",
      includeAttachments: true,
      dbPath: "/Users/bot/Library/Messages/chat.db"
    }
  }
}
```
示例包装器（`~/.clawdbot/scripts/imsg-ssh`）：
bash
#!/usr/bin/env bash
exec ssh -T bot@mac-mini.tailnet-1234.ts.net imsg "$@"

注意事项：
- 确保 Mac 已登录到 Messages，并且启用了远程登录（Remote Login）。
- 使用 SSH 密钥，使得 `ssh bot@mac-mini.tailnet-1234.ts.net` 可以无需提示直接登录。
- `remoteHost` 应该与 SSH 目标匹配，以便 SCP 可以获取附件。

多账号支持：使用 `channels.imessage.accounts` 进行每个账号的配置，并可选地设置 `name`。有关共享模式，请参阅 [`gateway/configuration`](/gateway/configuration#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts)。不要提交 `~/.clawdbot/clawdbot.json`（其中通常包含令牌）。

## 访问控制（私聊 + 群组）
私聊：
- 默认设置为 `channels.imessage.dmPolicy = "pairing"`。
- 未知发件人会收到一个配对码；消息在未获得批准前会被忽略（配对码在一小时后过期）。
- 批准方式：
  - `clawdbot pairing list imessage`
  1. `clawdbot pairing approve imessage <CODE>`
- 配对是 iMessage 私聊的默认令牌交换方式。详情请参阅：[配对](/start/pairing)

群组：
- `channels.imessage.groupPolicy = open | allowlist | disabled`。
- 当设置为 `allowlist` 时，`channels.imessage.groupAllowFrom` 控制谁可以在群组中触发消息。
- 提及控制使用 `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`），因为 iMessage 没有原生的提及元数据。
- 多代理覆盖：在 `agents.list[].groupChat.mentionPatterns` 上为每个代理设置提及模式。

## 工作方式（行为）
- `imsg` 流式传输消息事件；网关将其标准化为统一的频道封装格式。
- 回复始终路由回相同的聊天 ID 或处理方式。

## 类群组线程（`is_group=false`）
某些 iMessage 线程可能有多个参与者，但由于 Messages 存储聊天标识符的方式，它们仍可能以 `is_group=false` 的形式出现。

如果你在 `channels.imessage.groups` 下显式配置了 `chat_id`，Clawdbot 会将该线程视为“群组”，用于：
- 会话隔离（独立的 `agent:<agentId>:imessage:group:<chat_id>` 会话密钥）
- 群组允许列表 / 提及控制行为

示例：
json5
{
  channels: {
    imessage: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15555550123"],
      groups: {
        "42": { "requireMention": false }
      }
    }
  }
}
``````
这在您希望为特定线程提供隔离的个性/模型时很有用（参见 [多代理路由](/concepts/multi-agent)）。关于文件系统隔离，请参见 [沙箱](/gateway/sandboxing)。

## 媒体 + 限制
- 通过 `channels.imessage.includeAttachments` 可选地接收附件。
- 媒体容量限制通过 `channels.imessage.mediaMaxMb` 设置。

## 限制
- 出站文本会被分块为 `channels.imessage.textChunkLimit`（默认为 4000）。
- 可选的换行符分块：将 `channels.imessage.chunkMode="newline"` 设置为在长度分块前按空行（段落边界）进行分割。
- 媒体上传受 `channels.imessage.mediaMaxMb` 限制（默认为 16）。

## 地址 / 传递目标
推荐使用 `chat_id` 进行稳定路由：
- `chat_id:123`（推荐）
- `chat_guid:...`
- `chat_identifier:...`
- 直接联系方式：`imessage:+1555` / `sms:+1555` / `user@example.com`

列出聊天：

imsg chats --limit 20
``````
## 配置参考（iMessage）
完整配置：[配置](/gateway/configuration)

提供者选项：
- `channels.imessage.enabled`: 启用/禁用该频道。
- `channels.imessage.cliPath`: `imsg` 的路径。
- `channels.imessage.dbPath`: Messages 数据库路径。
- `channels.imessage.remoteHost`: 当 `cliPath` 指向远程 Mac 时，用于 SCP 附件传输的 SSH 主机（例如 `user@gateway-host`）。如果没有设置，将从 SSH 包装器中自动检测。
- `channels.imessage.service`: `imessage | sms | auto`。
- `channels.imessage.region`: SMS 区域。
- `channels.imessage.dmPolicy`: `pairing | allowlist | open | disabled`（默认：pairing）。
- `channels.imessage.allowFrom`: DM 允许列表（可以是 handles、emails、E.164 号码，或 `chat_id:*`）。`open` 需要设置为 `"*"`。iMessage 没有用户名；请使用 handles 或 chat 目标。
- `channels.imessage.groupPolicy`: `open | allowlist | disabled`（默认：allowlist）。
- `channels.imessage.groupAllowFrom`: 群组发送者允许列表。
- `channels.imessage.historyLimit` / `channels.imessage.accounts.*.historyLimit`: 最多包含的群组消息数量作为上下文（0 表示禁用）。
- `channels.imessage.dmHistoryLimit`: DM 历史记录限制（用户轮次）。支持按用户覆盖：`channels.imessage.dms["<handle>"].historyLimit`。
- `channels.imessage.groups`: 每个群组的默认值 + 允许列表（使用 `"*"` 表示全局默认值）。
- `channels.imessage.includeAttachments`: 将附件纳入上下文。
- `channels.imessage.mediaMaxMb`: 入站/出站媒体容量（MB）。
- `channels.imessage.textChunkLimit`: 出站分块大小（字符数）。
- `channels.imessage.chunkMode`: 分块方式，`length`（默认）或 `newline`（在长度分块前按空行分割，即段落边界）。

相关全局选项：
- `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）。
- `messages.responsePrefix`。