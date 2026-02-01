---
summary: "Signal support via signal-cli (JSON-RPC + SSE), setup, and number model"
read_when:
  - Setting up Signal support
  - Debugging Signal send/receive
---

# Signal（signal-cli）

状态：外部 CLI 集成。网关通过 HTTP JSON-RPC + SSE 与 `signal-cli` 进行通信。

## 快速设置（初学者）
1) 为机器人使用一个**单独的 Signal 号码**（推荐）。
2) 安装 `signal-cli`（需要 Java）。
3) 链接机器人设备并启动守护进程：
   - `signal-cli link -n "Clawdbot"`
4) 配置 Clawdbot 并启动网关。

最小配置：
json5
{
  channels: {
    signal: {
      enabled: true,
      account: "+15551234567",
      cliPath: "signal-cli",
      dmPolicy: "pairing",
      allowFrom: ["+15557654321"]
    }
  }
}
```
## 它是什么
- 通过 `signal-cli` 的信号通道（非嵌入式 libsignal）。
- 确定性路由：回复始终返回到 Signal。
- 私信共享代理的主要会话；群组是隔离的（`agent:<agentId>:signal:group:<groupId>`）。

## 配置写入
默认情况下，Signal 被允许写入由 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

禁用方式为：
```json5
{
  channels: { signal: { configWrites: false } }
}
```
## 数字模型（重要）
- 网关连接到一个 **信号设备**（`signal-cli` 账户）。
- 如果你在 **你的个人 Signal 账户** 上运行机器人，它将忽略你自己的消息（防止循环）。
- 对于“我给机器人发消息，它回复”，请使用一个 **单独的机器人号码**。

## 快速设置步骤
1) 安装 `signal-cli`（需要 Java）。
2) 链接一个机器人账户：
   - `signal-cli link -n "Clawdbot"` 然后在 Signal 中扫描二维码。
3) 配置 Signal 并启动网关。

示例：
json5
{
  channels: {
    signal: {
      enabled: true,
      account: "+15551234567",
      cliPath: "signal-cli",
      dmPolicy: "pairing",
      allowFrom: ["+15557654321"]
    }
  }
}
```
多账户支持：使用 `channels.signal.accounts` 并为每个账户配置选项以及可选的 `name`。有关共享模式，请参见 [`gateway/configuration`](/gateway/configuration.md#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts)。

## 外部守护进程模式（httpUrl）
如果你想自己管理 `signal-cli`（例如，为了避免缓慢的 JVM 冷启动、容器初始化或共享 CPU 的问题），请单独运行守护进程，并将其指向 Clawdbot：
```json5
{
  channels: {
    signal: {
      httpUrl: "http://127.0.0.1:8080",
      autoStart: false
    }
  }
}
```
这会跳过 Clawdbot 中的自动启动和启动等待时间。对于自动启动时的慢启动情况，请设置 `channels.signal.startupTimeoutMs`。

## 访问控制（私信 + 群组）
私信：
- 默认值：`channels.signal.dmPolicy = "pairing"`。
- 未知发送者会收到一个配对代码；消息在被批准前会被忽略（代码在一小时后过期）。
- 批准方式：
  - `clawdbot pairing list signal`
  - `clawdbot pairing approve signal <CODE>`
- 配对是 Signal 私信的默认令牌交换方式。详情：[配对](/start/pairing.md)
- 仅 UUID 发送者（来自 `sourceUuid`）会被存储为 `uuid:<id>`，在 `channels.signal.allowFrom` 中。

群组：
- `channels.signal.groupPolicy = open | allowlist | disabled`。
- 当设置为 `allowlist` 时，`channels.signal.groupAllowFrom` 控制谁可以在群组中触发消息。

## 工作方式（行为）
- `signal-cli` 以后台进程方式运行；网关通过 SSE 读取事件。
- 入站消息会被标准化为共享频道的信封格式。
- 回复始终路由回同一个号码或群组。

## 媒体 + 限制
- 出站文本会被拆分为 `channels.signal.textChunkLimit`（默认为 4000）。
- 可选的换行拆分：设置 `channels.signal.chunkMode="newline"` 会在长度拆分前按空行（段落边界）拆分。
- 支持附件（通过 `signal-cli` 获取 base64 编码）。
- 默认媒体大小限制：`channels.signal.mediaMaxMb`（默认为 8）。
- 使用 `channels.signal.ignoreAttachments` 可跳过下载媒体。
- 群组历史上下文使用 `channels.signal.historyLimit`（或 `channels.signal.accounts.*.historyLimit`），如果没有设置则回退到 `messages.groupChat.historyLimit`。设为 `0` 可禁用（默认为 50）。

## 输入状态 + 已读回执
- **输入指示**：Clawdbot 通过 `signal-cli sendTyping` 发送输入信号，并在回复进行时持续刷新。
- **已读回执**：当 `channels.signal.sendReadReceipts` 为 true 时，Clawdbot 会转发允许的私信已读回执。
- Signal-cli 不会暴露群组的已读回执。

## 反应（消息工具）
- 使用 `message action=react` 并设置 `channel=signal`。
- 目标：发送者 E.164 号码或 UUID（可使用配对输出的 `uuid:<id>`；裸 UUID 也可以）。
- `messageId` 是你所回应消息的 Signal 时间戳。
- 群组反应需要 `targetAuthor` 或 `targetAuthorUuid`。

示例：

message action=react channel=signal target=uuid:123e4567-e89b-12d3-a456-426614174000 messageId=1737630212345 emoji=🔥
message action=react channel=signal target=+15551234567 messageId=1737630212345 emoji=🔥 remove=true
message action=react channel=signal target=signal:group:<groupId> targetAuthor=uuid:<sender-uuid> messageId=1737630212345 emoji=✅
```
配置：
- `channels.signal.actions.reactions`: 启用/禁用反应操作（默认为 true）。
- `channels.signal.reactionLevel`: `off | ack | minimal | extensive`。
  - `off`/`ack` 禁用代理反应（消息工具 `react` 会报错）。
  - `minimal`/`extensive` 启用代理反应并设置引导级别。

按账户覆盖设置：`channels.signal.accounts.<id>.actions.reactions`，`channels.signal.accounts.<id>.reactionLevel`。

## 交付目标（CLI/定时任务）
- 私信：`signal:+15551234567`（或纯 E.164 格式）。
- UUID 私信：`uuid:<id>`（或裸 UUID）。
- 群组：`signal:group:<groupId>`。
- 用户名：`username:<name>`（如果您的 Signal 账户支持）。

## 配置参考（Signal）
完整配置：[配置](/gateway/configuration.md)

提供者选项：
- `channels.signal.enabled`: 启用/禁用频道启动。
- `channels.signal.account`: 机器人的 E.164 号码。
- `channels.signal.cliPath`: `signal-cli` 的路径。
- `channels.signal.httpUrl`: 完整的守护进程 URL（覆盖 host/port）。
- `channels.signal.httpHost`，`channels.signal.httpPort`: 守护进程绑定地址（默认为 127.0.0.1:8080）。
- `channels.signal.autoStart`: 自动启动守护进程（默认为 true，如果未设置 `httpUrl`）。
- `channels.signal.startupTimeoutMs`: 启动等待超时时间（毫秒），上限为 120000。
- `channels.signal.receiveMode`: `on-start | manual`。
- `channels.signal.ignoreAttachments`: 跳过附件下载。
- `channels.signal.ignoreStories`: 忽略来自守护进程的动态消息。
- `channels.signal.sendReadReceipts`: 转发已读回执。
- `channels.signal.dmPolicy`: `pairing | allowlist | open | disabled`（默认：pairing）。
- `channels.signal.allowFrom`: 私信允许列表（E.164 或 `uuid:<id>`）。`open` 需要 `"*"`。Signal 不支持用户名；请使用电话号码/UUID 标识。
- `channels.signal.groupPolicy`: `open | allowlist | disabled`（默认：allowlist）。
- `channels.signal.groupAllowFrom`: 群组发送者允许列表。
- `channels.signal.historyLimit`: 最多包含多少条群组消息作为上下文（0 表示禁用）。
- `channels.signal.dmHistoryLimit`: 私信历史记录限制（用户轮次）。按用户覆盖设置：`channels.signal.dms["<phone_or_uuid>"].historyLimit`。
- `channels.signal.textChunkLimit`: 出站分块大小（字符数）。
- `channels.signal.chunkMode`: `length`（默认）或 `newline`，在长度分块前按空行（段落边界）进行分割。
- `channels.signal.mediaMaxMb`: 入站/出站媒体大小限制（MB）。

相关全局选项：
- `agents.list[].groupChat.mentionPatterns`（Signal 不支持原生@提及）。
- `messages.groupChat.mentionPatterns`（全局回退）。
- `messages.responsePrefix`。
```
