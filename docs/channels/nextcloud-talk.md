---
summary: "Nextcloud Talk support status, capabilities, and configuration"
read_when:
  - Working on Nextcloud Talk channel features
---

# Nextcloud Talk（插件）

状态：通过插件（webhook 机器人）支持。支持直接消息、房间、表情反应和 Markdown 消息。

## 需要的插件
Nextcloud Talk 作为插件提供，并不包含在核心安装中。

通过 CLI 安装（npm 仓库）：
bash
clawdbot plugins install @clawdbot/nextcloud-talk``````
本地签出（当从 git 仓库运行时）：```bash
clawdbot plugins install ./extensions/nextcloud-talk
```
如果在配置/引导过程中选择了 Nextcloud Talk，并且检测到 git 检出，  
Clawdbot 将会自动提供本地安装路径。

详情：[插件](/plugin)

## 快速设置（初学者）
1) 安装 Nextcloud Talk 插件。  
2) 在您的 Nextcloud 服务器上，创建一个机器人：```bash
./occ talk:bot:install "Clawdbot" "<shared-secret>" "<webhook-url>" --feature reaction
```   ```
3) 在目标房间中启用机器人。
4) 配置 Clawdbot：
   - 配置项：`channels.nextcloud-talk.baseUrl` + `channels.nextcloud-talk.botSecret`
   - 或环境变量：`NEXTCLOUD_TALK_BOT_SECRET`（仅限默认账户）
5) 重启网关（或完成引导流程）。

最小配置：
json5
{
  channels: {
    "nextcloud-talk": {
      enabled: true,
      baseUrl: "https://cloud.example.com",
      botSecret: "shared-secret",
      dmPolicy: "pairing"
    }
  }
}
``````
## 注意事项
- 机器人不能主动发起私信（DM）。用户必须先向机器人发送消息。
- Webhook 的 URL 必须能被网关访问；如果在代理后面，请设置 `webhookPublicUrl`。
- 机器人 API 不支持媒体上传；媒体将以 URL 的形式发送。
- Webhook 的负载无法区分私信（DM）和房间（rooms）；请设置 `apiUser` + `apiPassword` 以启用房间类型查询（否则私信会被视为房间）。

## 访问控制（私信）
- 默认设置：`channels.nextcloud-talk.dmPolicy = "pairing"`。未知发送者会收到一个配对码。
- 通过以下方式批准配对：
  - `clawdbot pairing list nextcloud-talk`
  - `clawdbot pairing approve nextcloud-talk <CODE>`
- 公共私信：设置 `channels.nextcloud-talk.dmPolicy="open"` 并且 `channels.nextcloud-talk.allowFrom=["*"]`。

## 房间（群组）
- 默认设置：`channels.nextcloud-talk.groupPolicy = "allowlist"`（提及权限）。
- 允许列表中的房间通过 `channels.nextcloud-talk.rooms` 设置。
json5
{
  channels: {
    "nextcloud-talk": {
      rooms: {
        "room-token": { requireMention: true }
      }
    }
  }
}
``````
- 如果要禁用所有房间，请保持 allowlist 为空，或设置 `channels.nextcloud-talk.groupPolicy="disabled"`。

## 功能支持情况
| 功能 | 状态 |
|---------|--------|
| 私人消息 | 支持 |
| 房间 | 支持 |
| 线程 | 不支持 |
| 媒体 | 仅支持 URL |
| 表情反应 | 支持 |
| 原生命令 | 不支持 |

## 配置参考（Nextcloud Talk）
完整配置：[配置](/gateway/configuration)

提供者选项：
- `channels.nextcloud-talk.enabled`: 启用/禁用频道。
- `channels.nextcloud-talk.baseUrl`: Nextcloud 实例的 URL。
- `channels.nextcloud-talk.botSecret`: 机器人共享密钥。
- `channels.nextcloud-talk.botSecretFile`: 密钥文件路径。
- `channels.nextcloud-talk.apiUser`: 用于查找房间（检测私人消息）的 API 用户。
- `channels.nextcloud-talk.apiPassword`: 用于查找房间的 API/App 密码。
- `channels.nextcloud-talk.apiPasswordFile`: API 密码文件路径。
- `channels.nextcloud-talk.webhookPort`: Webhook 监听端口（默认：8788）。
- `channels.nextcloud-talk.webhookHost`: Webhook 主机（默认：0.0.0.0）。
- `channels.nextcloud-talk.webhookPath`: Webhook 路径（默认：/nextcloud-talk-webhook）。
- `channels.nextcloud-talk.webhookPublicUrl`: 可外部访问的 Webhook URL。
- `channels.nextcloud-talk.dmPolicy`: `pairing | allowlist | open | disabled`。
- `channels.nextcloud-talk.allowFrom`: 私人消息允许列表（用户 ID）。`open` 需要设置为 `"*"`。
- `channels.nextcloud-talk.groupPolicy`: `allowlist | open | disabled`。
- `channels.nextcloud-talk.groupAllowFrom`: 群组允许列表（用户 ID）。
- `channels.nextcloud-talk.rooms`: 每个房间的设置和允许列表。
- `channels.nextcloud-talk.historyLimit`: 群组消息历史限制（0 表示禁用）。
- `channels.nextcloud-talk.dmHistoryLimit`: 私人消息历史限制（0 表示禁用）。
- `channels.nextcloud-talk.dms`: 每个私人消息的覆盖设置（如 historyLimit）。
- `channels.nextcloud-talk.textChunkLimit`: 出站文本块大小（字符数）。
- `channels.nextcloud-talk.chunkMode`: `length`（默认）或 `newline`，在按长度分块前按空行（段落边界）分块。
- `channels.nextcloud-talk.blockStreaming`: 禁用此频道的块流传输。
- `channels.nextcloud-talk.blockStreamingCoalesce`: 块流传输的合并调整参数。
- `channels.nextcloud-talk.mediaMaxMb`: 入站媒体大小上限（MB）。