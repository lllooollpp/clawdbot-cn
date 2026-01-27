---
summary: "Matrix support status, capabilities, and configuration"
read_when:
  - Working on Matrix channel features
---

# Matrix（插件）

Matrix 是一个开放且去中心化的消息协议。Clawdbot 作为 Matrix 的 **用户** 连接到任何 homeserver，因此你需要一个 Matrix 账户来使用该机器人。一旦登录，你可以直接向机器人发送私信，或将其邀请到房间（Matrix 中的“群组”）。Beeper 也是一个有效的客户端选项，但需要启用 E2EE（端到端加密）。

状态：通过插件（matrix-bot-sdk）支持。支持私信、房间、线程、媒体、表情反应、投票（通过发送“send + poll-start”作为文本）、位置和 E2EE（需要加密支持）。

## 需要插件

Matrix 作为插件提供，并不包含在核心安装中。

通过 CLI（npm 仓库）安装：
bash
clawdbot plugins install @clawdbot/matrix
`````````
本地结账（当从 git 仓库运行时）：```bash
clawdbot plugins install ./extensions/matrix
```
如果在配置/接入过程中选择 Matrix，并且检测到 git 检出，  
Clawdbot 将会自动提供本地安装路径。

详情：[插件](/plugin)

## 设置

1) 安装 Matrix 插件：  
   - 通过 npm：`clawdbot plugins install @clawdbot/matrix`  
   - 通过本地检出：`clawdbot plugins install ./extensions/matrix`  
2) 在 homeserver 上创建一个 Matrix 账户：  
   - 浏览托管选项：[https://matrix.org/ecosystem/hosting/](https://matrix.org/ecosystem/hosting/)  
   - 或者自行托管。  
3) 获取机器人的访问令牌：  
   - 在你的 homeserver 上使用 Matrix 登录 API 通过 `curl`：
bash
     curl --request POST \
       --url https://matrix.example.org/_matrix/client/v3/login \
       --header 'Content-Type: application/json' \
       --data '{
       "type": "m.login.password",
       "identifier": {
         "type": "m.id.user",
         "user": "your-user-name"
       },
       "password": "your-password"
     }'

- 将 `matrix.example.org` 替换为你的 homeserver 地址。
   - 或者设置 `channels.matrix.userId` 和 `channels.matrix.password`：Clawdbot 调用相同的登录端点，  
     将访问令牌存储在 `~/.clawdbot/credentials/matrix/credentials.json` 中，  
     并在下次启动时重复使用它。
4) 配置凭证：
   - 环境变量：`MATRIX_HOMESERVER`, `MATRIX_ACCESS_TOKEN`（或 `MATRIX_USER_ID` + `MATRIX_PASSWORD`）
   - 或者配置文件：`channels.matrix.*`
   - 如果两者都设置，配置文件的设置会优先。
   - 使用访问令牌时：用户 ID 会通过 `/whoami` 自动获取。
   - 当设置时，`channels.matrix.userId` 应该是完整的 Matrix 用户 ID（例如：`@bot:example.org`）。
5) 重启网关（或完成设置流程）。
6) 在任何 Matrix 客户端（如 Element、Beeper 等；参见 https://matrix.org/ecosystem/clients/）中与机器人开启私聊或将其邀请到房间中。  
   Beeper 需要 E2EE 加密，因此请设置 `channels.matrix.encryption: true` 并验证设备。

最小配置（使用访问令牌，用户 ID 自动获取）：
json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_***",
      dm: { policy: "pairing" }
    }
  }
}
``````
E2EE 配置（端到端加密已启用）：
json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_***",
      encryption: true,
      dm: { policy: "pairing" }
    }
  }
}
``````
## 端到端加密（E2EE）

通过 Rust 加密 SDK 实现的端到端加密是 **支持的**。

通过 `channels.matrix.encryption: true` 启用：

- 如果加密模块加载成功，加密房间将自动解密。
- 发送到加密房间的出站媒体将被加密。
- 在首次连接时，Clawdbot 会向你的其他会话请求设备验证。
- 在另一个 Matrix 客户端（如 Element 等）中验证设备以启用密钥共享。
- 如果加密模块无法加载，E2EE 将被禁用，加密房间将无法解密；
  Clawdbot 会记录一条警告信息。
- 如果你看到加密模块缺失的错误（例如 `@matrix-org/matrix-sdk-crypto-nodejs-*`），
  请允许 `@matrix-org/matrix-sdk-crypto-nodejs` 的构建脚本并运行
  `pnpm rebuild @matrix-org/matrix-sdk-crypto-nodejs` 或使用
  `node node_modules/@matrix-org/matrix-sdk-crypto-nodejs/download-lib.js` 获取二进制文件。

加密状态按账户 + 访问令牌存储在
`~/.clawdbot/matrix/accounts/<account>/<homeserver>__<user>/<token-hash>/crypto/`
（SQLite 数据库）。同步状态则与之一起存储在 `bot-storage.json` 中。
如果访问令牌（设备）发生变化，将创建一个新的存储，并且机器人必须重新验证以解密加密房间。

**设备验证：**
当启用 E2EE 时，机器人会在启动时向你的其他会话请求验证。
打开 Element（或其他客户端）并批准验证请求以建立信任。
一旦验证完成，机器人就可以解密加密房间中的消息。

## 路由模型

- 回复始终返回到 Matrix。
- 私人消息（DMs）共享代理的主要会话；房间映射到群组会话。

## 访问控制（私人消息）

- 默认设置：`channels.matrix.dm.policy = "pairing"`。未知的发送者将获得一个配对码。
- 通过以下方式批准：
  - `clawdbot pairing list matrix`
  - `clawdbot pairing approve matrix <CODE>`
- 公开私人消息：`channels.matrix.dm.policy="open"` 并加上 `channels.matrix.dm.allowFrom=["*"]`。
- `channels.matrix.dm.allowFrom` 接受用户 ID 或显示名称。当目录搜索可用时，向导会将显示名称解析为用户 ID。
json5
{
  channels: {
    matrix: {
      groupPolicy: "allowlist",
      groups: {
        "!roomId:example.org": { allow: true },
        "#alias:example.org": { allow: true }
      },
      groupAllowFrom: ["@owner:example.org"]
    }
  }
}
``````
- `requireMention: false` 启用该房间的自动回复功能。
- `groups."*"` 可以为所有房间设置提及门控的默认值。
- `groupAllowFrom` 限制哪些发送者可以触发房间中的机器人（可选）。
- 每个房间的 `users` 允许列表可以进一步限制特定房间中的发送者。
- 配置向导会提示输入房间允许列表（房间ID、别名或名称），并在可能的情况下解析名称。
- 启动时，Clawdbot 会将允许列表中的房间/用户名称解析为ID，并记录映射；无法解析的条目会保留为原始输入。
- 默认情况下，邀请会自动加入；可通过 `channels.matrix.autoJoin` 和 `channels.matrix.autoJoinAllowlist` 控制。
- 若要允许 **无房间**，请设置 `channels.matrix.groupPolicy: "disabled"`（或保持允许列表为空）。
- 旧版键：`channels.matrix.rooms`（与 `groups` 具有相同的结构）。

## 线程

- 支持回复线程。
- `channels.matrix.threadReplies` 控制是否在线程中保留回复：
  - `off`，`inbound`（默认），`always`
- `channels.matrix.replyToMode` 控制不在线程中回复时的“回复至”元数据：
  - `off`（默认），`first`，`all`

## 功能支持

| 功能 | 状态 |
|------|------|
| 私人消息 | ✅ 支持 |
| 房间 | ✅ 支持 |
| 线程 | ✅ 支持 |
| 多媒体 | ✅ 支持 |
| 端到端加密（E2EE） | ✅ 支持（需要加密模块） |
| 表情反应 | ✅ 支持（通过工具发送/读取） |
| 投票 | ✅ 支持发送；接收的投票开始会被转换为文本（忽略响应/结束） |
| 位置 | ✅ 支持（geo URI；忽略海拔） |
| 原生命令 | ✅ 支持 |

## 配置参考（Matrix）

完整配置：[配置](/gateway/configuration)

提供者选项：

- `channels.matrix.enabled`: 启用/禁用频道启动。
- `channels.matrix.homeserver`: homeserver 的 URL。
- `channels.matrix.userId`: Matrix 用户 ID（可选，配合访问令牌使用）。
- `channels.matrix.accessToken`: 访问令牌。
- `channels.matrix.password`: 登录密码（存储令牌）。
- `channels.matrix.deviceName`: 设备显示名称。
- `channels.matrix.encryption`: 启用端到端加密（默认：false）。
- `channels.matrix.initialSyncLimit`: 初始同步限制。
- `channels.matrix.threadReplies`: `off | inbound | always`（默认：inbound）。
- `channels.matrix.textChunkLimit`: 出站文本块大小（字符数）。
- `channels.matrix.chunkMode`: `length`（默认）或 `newline`，在长度分块前按空行（段落边界）分块。
- `channels.matrix.dm.policy`: `pairing | allowlist | open | disabled`（默认：pairing）。
- `channels.matrix.dm.allowFrom`: DM 允许列表（用户 ID 或显示名称）。`open` 需要 `"*"`。向导在可能的情况下会将名称解析为 ID。
- `channels.matrix.groupPolicy`: `allowlist | open | disabled`（默认：allowlist）。
- `channels.matrix.groupAllowFrom`: 组消息的允许发送者列表。
- `channels.matrix.allowlistOnly`: 强制对 DM 和房间使用允许列表规则。
- `channels.matrix.groups`: 组允许列表 + 每房间设置的映射。
- `channels.matrix.rooms`: 旧版组允许列表/配置。
- `channels.matrix.replyToMode`: 线程/标签的回复模式。
- `channels.matrix.mediaMaxMb`: 入站/出站媒体大小上限（MB）。
- `channels.matrix.autoJoin`: 邀请处理方式（`always | allowlist | off`，默认：always）。
- `channels.matrix.autoJoinAllowlist`: 自动加入的允许房间 ID/别名列表。
- `channels.matrix.actions`: 每个操作的工具 gating（反应/消息/置顶/成员信息/频道信息）。