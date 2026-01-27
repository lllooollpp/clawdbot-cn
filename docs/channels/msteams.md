---
summary: "Microsoft Teams bot support status, capabilities, and configuration"
read_when:
  - Working on MS Teams channel features
---

# Microsoft Teams（插件）

> “进入此处者，放弃一切希望。”

更新时间：2026-01-21

状态：支持文本和私信附件；发送频道/群组文件需要 `sharePointSiteId` + Graph 权限（详见 [在群组聊天中发送文件](#sending-files-in-group-chats)）。投票通过 Adaptive Cards 发送。

## 需要插件
Microsoft Teams 作为插件提供，不包含在核心安装中。

**重大变更（2026.1.15）：** MS Teams 已从核心组件中移除。如果使用它，必须安装插件。

可解释性：保持核心安装更轻量，并允许 MS Teams 的依赖项独立更新。

通过 CLI 安装（npm 仓库）：
bash
clawdbot plugins install @clawdbot/msteams``````
本地签出（当从 git 仓库运行时）：```bash
clawdbot plugins install ./extensions/msteams
```
如果在配置/引导过程中选择了 Teams，并且检测到 git 检出，  
Clawdbot 将会自动提供本地安装路径。

详细信息：[插件](/plugin)

## 快速设置（初学者）
1) 安装 Microsoft Teams 插件。  
2) 创建一个 **Azure Bot**（应用 ID + 客户端密钥 + 租户 ID）。  
3) 使用这些凭据配置 Clawdbot。  
4) 通过公共 URL 或隧道公开 `/api/messages`（默认端口为 3978）。  
5) 安装 Teams 应用程序包并启动网关。

最小配置：
json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      appPassword: "<APP_PASSWORD>",
      tenantId: "<TENANT_ID>",
      webhook: { port: 3978, path: "/api/messages" }
    }
  }
}
`````````
注意：群组聊天默认被阻止（`channels.msteams.groupPolicy: "allowlist"`）。要允许群组回复，请设置 `channels.msteams.groupAllowFrom`（或使用 `groupPolicy: "open"` 以允许任何成员回复，但需提及）。

## 目标
- 通过 Teams 私聊、群组聊天或频道与 Clawdbot 交流。
- 保持路由确定性：回复始终返回到它们到达的频道。
- 默认采用安全的频道行为（除非另行配置，否则需要提及）。

## 配置写入
默认情况下，Microsoft Teams 允许通过 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

禁用方式为：```json5
{
  channels: { msteams: { configWrites: false } }
}
```
## 访问控制（私聊 + 群组）

**私聊访问**
- 默认值：`channels.msteams.dmPolicy = "pairing"`。未知发件人将被忽略，直到获得批准。
- `channels.msteams.allowFrom` 接受 AAD 对象 ID、UPN 或显示名称。当凭证允许时，向导会通过 Microsoft Graph 解析名称为 ID。

**群组访问**
- 默认值：`channels.msteams.groupPolicy = "allowlist"`（除非你添加 `groupAllowFrom`，否则将被阻止）。当未设置时，可以使用 `channels.defaults.groupPolicy` 覆盖默认值。
- `channels.msteams.groupAllowFrom` 控制哪些发件人可以在群组聊天/频道中触发消息（若未设置则回退到 `channels.msteams.allowFrom`）。
- 设置 `groupPolicy: "open"` 以允许任何成员（默认仍受提及限制）。
- 若要允许 **所有频道**，请设置 `channels.msteams.groupPolicy: "disabled"`。

示例：
json5
{
  channels: {
    msteams: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["user@org.com"]
    }
  }
}
`````````
**Teams + 通道白名单**
- 通过在 `channels.msteams.teams` 下列出 Teams 和通道来限制群组/通道的回复范围。
- 键可以是团队 ID 或名称；通道键可以是对话 ID 或名称。
- 当 `groupPolicy="allowlist"` 并且存在 Teams 白名单时，仅接受列出的 Teams/通道（提及限制）。
- 配置向导会接受 `团队/通道` 的条目并为您保存。
- 在启动时，Clawdbot 会将团队/通道和用户白名单的名称解析为 ID（当 Graph 权限允许时），
  并记录映射关系；无法解析的条目会以原始输入形式保留。
  
示例：```json5
{
  channels: {
    msteams: {
      groupPolicy: "allowlist",
      teams: {
        "My Team": {
          channels: {
            "General": { requireMention: true }
          }
        }
      }
    }
  }
}
```
## 它是如何工作的
1. 安装 Microsoft Teams 插件。
2. 创建一个 **Azure Bot**（应用 ID + 密钥 + 租户 ID）。
3. 构建一个 **Teams 应用包**，该包引用 bot 并包含以下 RSC 权限。
4. 将 Teams 应用上传/安装到一个团队（或用于私聊的个人范围）。
5. 在 `~/.clawdbot/clawdbot.json`（或环境变量）中配置 `msteams`，然后启动网关。
6. 网关默认在 `/api/messages` 上监听 Bot Framework 的 webhook 流量。

## Azure Bot 设置（先决条件）

在配置 Clawdbot 之前，你需要创建一个 Azure Bot 资源。

### 步骤 1：创建 Azure Bot

1. 前往 [创建 Azure Bot](https://portal.azure.com/#create/Microsoft.AzureBot)
2. 填写 **基础信息** 选项卡：

   | 字段 | 值 |
   |-------|-------|
   | **Bot 名称** | 你的 bot 名称，例如 `clawdbot-msteams`（必须唯一） |
   | **订阅** | 选择你的 Azure 订阅 |
   | **资源组** | 创建新组或使用现有组 |
   | **定价层级** | **免费**（用于开发和测试） |
   | **应用类型** | **单租户**（推荐 - 请参见下面的说明） |
   | **创建类型** | **创建新的 Microsoft 应用 ID** |

> **弃用通知：** 从 2025-07-31 起，不再支持创建新的多租户 bot。请为新 bot 使用 **单租户**。

3. 点击 **审核 + 创建** → **创建**（等待约 1-2 分钟）

### 步骤 2：获取凭据

1. 前往你的 Azure Bot 资源 → **配置**
2. 复制 **Microsoft 应用 ID** → 这是你的 `appId`
3. 点击 **管理密码** → 进入应用注册页面
4. 在 **证书与密码** 下 → 点击 **新建客户端密码** → 复制 **值** → 这是你的 `appPassword`
5. 前往 **概览** → 复制 **目录（租户）ID** → 这是你的 `tenantId`

### 步骤 3：配置消息端点

1. 在 Azure Bot 中 → **配置**
2. 将 **消息端点** 设置为你的 webhook URL：
   - 生产环境：`https://your-domain.com/api/messages`
   - 本地开发：使用隧道（请参见下方的 [本地开发](#local-development) 隧道部分）

### 步骤 4：启用 Teams 渠道

1. 在 Azure Bot 中 → **渠道**
2. 点击 **Microsoft Teams** → 配置 → 保存
3. 接受服务条款


## 本地开发（隧道）  

Teams 无法访问 `localhost`。请使用隧道进行本地开发：  

**选项 A：ngrok**
bash
ngrok http 3978
# Copy the https URL, e.g., https://abc123.ngrok.io
# Set messaging endpoint to: https://abc123.ngrok.io/api/messages``````
**选项 B：Tailscale Funnel**```bash
tailscale funnel 3978
# Use your Tailscale funnel URL as the messaging endpoint
```
## Teams 开发者门户（替代方法）

除了手动创建清单 ZIP 文件外，您还可以使用 [Teams 开发者门户](https://dev.teams.microsoft.com/apps)：

1. 点击 **+ 新建应用**
2. 填写基本信息（名称、描述、开发者信息）
3. 进入 **应用功能** → **Bot**
4. 选择 **手动输入 Bot ID** 并粘贴您的 Azure Bot 应用 ID
5. 勾选作用域：**个人**, **团队**, **群组聊天**
6. 点击 **分发** → **下载应用包**
7. 在 Teams 中：**应用** → **管理您的应用** → **上传自定义应用** → 选择 ZIP 文件

这种方法通常比手动编辑 JSON 清单更容易。

## 测试 Bot

**选项 A：Azure Web Chat（先验证 Webhook）**
1. 在 Azure 门户 → 您的 Azure Bot 资源 → **在 Web Chat 中测试**
2. 发送一条消息 - 您应该会看到回复
3. 这可以确认您的 Webhook 端点在 Teams 设置前正常工作

**选项 B：Teams（应用安装后）**
1. 安装 Teams 应用（侧载或组织目录）
2. 在 Teams 中找到 Bot 并发送私信
3. 检查网关日志以查看传入的活动

## 设置（最小文本模式）
1. **安装 Microsoft Teams 插件**
   - 从 npm 安装：`clawdbot plugins install @clawdbot/msteams`
   - 从本地检出安装：`clawdbot plugins install ./extensions/msteams`

2. **Bot 注册**
   - 创建 Azure Bot（请参见上文），并记录以下信息：
     - 应用 ID
     - 客户端密钥（应用密码）
     - 租户 ID（单租户）

3. **Teams 应用清单**
   - 包含一个 `bot` 条目，其中 `botId = <应用 ID>`。
   - 作用域：`personal`, `team`, `groupChat`。
   - `supportsFiles: true`（用于个人作用域的文件处理）。
   - 添加 RSC 权限（如下所述）。
   - 创建图标：`outline.png`（32x32）和 `color.png`（192x192）。
   - 将三个文件一起压缩：`manifest.json`, `outline.png`, `color.png`。

4. **配置 Clawdbot**
json
{
  "msteams": {
    "enabled": true,
    "appId": "<APP_ID>",
    "appPassword": "<APP_PASSWORD>",
    "tenantId": "<TENANT_ID>",
    "webhook": { "port": 3978, "path": "/api/messages" }
  }
}
``````   ```
您可以使用环境变量代替配置键：
- `MSTEAMS_APP_ID`
- `MSTEAMS_APP_PASSWORD`
- `MSTEAMS_TENANT_ID`

5. **Bot 端点**
   - 将 Azure Bot 消息端点设置为：
     - `https://<host>:3978/api/messages`（或您选择的路径/端口）。

6. **运行网关**
   - 当插件安装并存在 `msteams` 配置及凭证时，Teams 通道会自动启动。

## 历史记录上下文
- `channels.msteams.historyLimit` 控制多少条最近的频道/群组消息会被包含到提示中。
- 如果未设置，则会回退到 `messages.groupChat.historyLimit`。设置 `0` 表示禁用（默认为 50）。
- 可以通过 `channels.msteams.dmHistoryLimit` 限制私聊历史记录（按用户轮次）。每个用户的覆盖设置为：`channels.msteams.dms["<user_id>"].historyLimit`。

## 当前 Teams RSC 权限（Manifest）
这是我们 Teams 应用程序的 **现有资源特定权限**。这些权限仅在应用被安装的团队/聊天中生效。

**对于频道（团队范围）：**
- `ChannelMessage.Read.Group`（应用程序） - 无需@提醒即可接收所有频道消息
- `ChannelMessage.Send.Group`（应用程序）
- `Member.Read.Group`（应用程序）
- `Owner.Read.Group`（应用程序）
- `ChannelSettings.Read.Group`（应用程序）
- `TeamMember.Read.Group`（应用程序）
- `TeamSettings.Read.Group`（应用程序）

**对于群组聊天：**
- `ChatMessage.Read.Chat`（应用程序） - 无需@提醒即可接收所有群组聊天消息

## 示例 Teams Manifest（已脱敏）
一个包含必要字段的最小有效示例。请替换 ID 和 URL。```json
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.23/MicrosoftTeams.schema.json",
  "manifestVersion": "1.23",
  "version": "1.0.0",
  "id": "00000000-0000-0000-0000-000000000000",
  "name": { "short": "Clawdbot" },
  "developer": {
    "name": "Your Org",
    "websiteUrl": "https://example.com",
    "privacyUrl": "https://example.com/privacy",
    "termsOfUseUrl": "https://example.com/terms"
  },
  "description": { "short": "Clawdbot in Teams", "full": "Clawdbot in Teams" },
  "icons": { "outline": "outline.png", "color": "color.png" },
  "accentColor": "#5B6DEF",
  "bots": [
    {
      "botId": "11111111-1111-1111-1111-111111111111",
      "scopes": ["personal", "team", "groupChat"],
      "isNotificationOnly": false,
      "supportsCalling": false,
      "supportsVideo": false,
      "supportsFiles": true
    }
  ],
  "webApplicationInfo": {
    "id": "11111111-1111-1111-1111-111111111111"
  },
  "authorization": {
    "permissions": {
      "resourceSpecific": [
        { "name": "ChannelMessage.Read.Group", "type": "Application" },
        { "name": "ChannelMessage.Send.Group", "type": "Application" },
        { "name": "Member.Read.Group", "type": "Application" },
        { "name": "Owner.Read.Group", "type": "Application" },
        { "name": "ChannelSettings.Read.Group", "type": "Application" },
        { "name": "TeamMember.Read.Group", "type": "Application" },
        { "name": "TeamSettings.Read.Group", "type": "Application" },
        { "name": "ChatMessage.Read.Chat", "type": "Application" }
      ]
    }
  }
}
```
### 清单注意事项（必须包含的字段）
- `bots[].botId` **必须** 与 Azure Bot 应用 ID 匹配。
- `webApplicationInfo.id` **必须** 与 Azure Bot 应用 ID 匹配。
- `bots[].scopes` 必须包含你计划使用的表面（`personal`、`team`、`groupChat`）。
- `bots[].supportsFiles: true` 是在个人作用域中处理文件所必需的。
- 如果你想读取或发送频道消息，`authorization.permissions.resourceSpecific` 必须包含 `channel read` 和 `channel send`。

### 更新现有应用

要更新已安装的 Teams 应用（例如，添加 RSC 权限）：

1. 使用新设置更新你的 `manifest.json`
2. **增加 `version` 字段**（例如，`1.0.0` → `1.1.0`）
3. **重新压缩** 包含图标（`manifest.json`、`outline.png`、`color.png`）的清单文件
4. 上传新的 zip 文件：
   - **选项 A（Teams 管理中心）：** Teams 管理中心 → Teams 应用 → 管理应用 → 找到你的应用 → 上传新版本
   - **选项 B（侧载）：** 在 Teams 中 → 应用 → 管理你的应用 → 上传自定义应用
5. **对于团队频道：** 在每个团队中重新安装应用，以使新权限生效
6. **完全退出并重新启动 Teams**（不只是关闭窗口），以清除缓存的应用元数据

## 功能：仅 RSC 与 Graph

### 仅使用 **Teams RSC**（应用已安装，无 Graph API 权限）
可以实现：
- 读取频道消息的 **文本内容**。
- 发送频道消息的 **文本内容**。
- 接收 **个人聊天（DM）** 中的文件附件。

无法实现：
- 读取频道/群组中的 **图片或文件内容**（仅包含 HTML 占位符）。
- 从 SharePoint/OneDrive 下载附件。
- 读取消息历史记录（超出实时 webhook 事件之外）。

### 使用 **Teams RSC + Microsoft Graph 应用权限**
新增功能包括：
- 下载消息中插入的图片。
- 从 SharePoint/OneDrive 下载文件附件。
- 通过 Graph 读取频道/聊天的消息历史记录。

## RSC 与 Graph API 对比

| 功能 | RSC 权限 | Graph API |
|------|----------|-----------|
| **实时消息** | 是（通过 webhook） | 否（仅支持轮询） |
| **历史消息** | 否 | 是（可以查询历史） |
| **设置复杂度** | 仅需应用清单 | 需要管理员同意 + 令牌流程 |
| **离线工作** | 否（必须运行） | 是（随时可查询） |

**总结：** RSC 用于实时监听；Graph API 用于历史访问。如果你需要在离线时查看错过的消息，你需要使用 Graph API 并授予 `ChannelMessage.Read.All` 权限（需要管理员同意）。

## 启用 Graph 的媒体和历史记录（用于频道的必要条件）
如果你需要在 **频道** 中获取图片/文件，或者想要获取 **消息历史记录**，你必须启用 Microsoft Graph 权限并获得管理员同意。

1. 在 Entra ID（Azure AD）**应用注册**中，添加 Microsoft Graph **应用权限**：
   - `ChannelMessage.Read.All`（频道附件 + 历史记录）
   - `Chat.Read.All` 或 `ChatMessage.Read.All`（群组聊天）
2. **为租户授予管理员同意**。
3. 升级 Teams 应用的 **manifest 版本**，重新上传，并**在 Teams 中重新安装应用**。
4. **完全退出并重新启动 Teams** 以清除缓存的应用元数据。

## 已知限制

### Webhook 超时
Teams 通过 HTTP webhook 发送消息。如果处理时间过长（例如，LLM 响应缓慢），可能会出现以下情况：
- 网关超时
- Teams 重试消息（导致重复）
- 回复被丢弃

Clawdbot 通过快速返回并主动发送回复来处理这些问题，但非常慢的响应仍可能导致问题。

### 格式化
Teams 的 Markdown 功能比 Slack 或 Discord 更有限：
- 基础格式有效：**加粗**，*斜体*，`代码`，链接
- 复杂的 Markdown（如表格、嵌套列表）可能无法正确显示
- Adaptive Cards 支持用于投票和任意卡片发送（见下文）

## 配置
关键设置（详见 `/gateway/configuration` 以了解共享频道模式）：

- `channels.msteams.enabled`: 启用或禁用该频道。
- `channels.msteams.appId`, `channels.msteams.appPassword`, `channels.msteams.tenantId`: 机器人的凭据。
- `channels.msteams.webhook.port`（默认值为 `3978`）
- `channels.msteams.webhook.path`（默认值为 `/api/messages`）
- `channels.msteams.dmPolicy`: `pairing | allowlist | open | disabled`（默认值：`pairing`）
- `channels.msteams.allowFrom`: 允许的 DM 来源（AAD 对象 ID、UPN 或显示名称）。当拥有 Graph 访问权限时，向导会在设置过程中解析名称为 ID。
- `channels.msteams.textChunkLimit`: 出站文本块大小。
- `channels.msteams.chunkMode`: `length`（默认）或 `newline`，在按长度分块之前先按空行（段落边界）分块。
- `channels.msteams.mediaAllowHosts`: 允许的入站附件主机（默认为 Microsoft/Teams 域）。
- `channels.msteams.requireMention`: 在频道/群组中是否需要 @ 提及（默认为 `true`）。
- `channels.msteams.replyStyle`: `thread | top-level`（见 [回复样式](#reply-style-threads-vs-posts)）。
- `channels.msteams.teams.<teamId>.replyStyle`: 按团队覆盖的回复样式。
- `channels.msteams.teams.<teamId>.requireMention`: 按团队覆盖的 @ 提及要求。
- `channels.msteams.teams.<teamId>.channels.<conversationId>.replyStyle`: 按频道覆盖的回复样式。
- `channels.msteams.teams.<teamId>.channels.<conversationId>.requireMention`: 按频道覆盖的 @ 提及要求。
- `channels.msteams.sharePointSiteId`: 群组聊天/频道中文件上传的 SharePoint 站点 ID（见 [在群组聊天中发送文件](#sending-files-in-group-chats)）。

## 路由与会话
- 会话密钥遵循标准代理格式（参见 [/concepts/session](/concepts/session)）：
  - 直接消息使用主会话（`agent:<agentId>:<mainKey>`）。
  - 频道/群组消息使用对话 ID：
    - `agent:<agentId>:msteams:channel:<conversationId>`
    - `agent:<agentId>:msteams:group:<conversationId>`

## 回复样式：线程 vs 帖子

Teams 最近引入了两种频道 UI 样式，基于相同的底层数据模型：

| 样式 | 描述 | 推荐的 `replyStyle` |
|-------|-------------|--------------------------|
| **帖子**（经典） | 消息以卡片形式显示，线程回复在下方 | `thread`（默认） |
| **线程**（类似 Slack） | 消息线性流动，更像 Slack | `top-level` |

**问题：** Teams API 并不暴露频道使用的 UI 样式。如果你使用了错误的 `replyStyle`：
- 在线程样式频道中使用 `thread` → 回复会以嵌套的方式显示，显得不自然
- 在帖子样式频道中使用 `top-level` → 回复会作为独立的顶层帖子显示，而不是在消息内线程中

**解决方案：** 根据频道的设置为每个频道配置 `replyStyle`：
json
{
  "msteams": {
    "replyStyle": "thread",
    "teams": {
      "19:abc...@thread.tacv2": {
        "channels": {
          "19:xyz...@thread.tacv2": {
            "replyStyle": "top-level"
          }
        }
      }
    }
  }
}
`````````
## 附件与图片

**当前限制：**
- **私聊（DMs）:** 图片和文件附件通过 Teams bot 文件 API 实现。
- **频道/群组:** 附件存储在 M365 存储中（SharePoint/OneDrive）。Webhook 的 payload 仅包含 HTML 占位符，而非实际文件字节。**需要 Graph API 权限** 才能下载频道附件。

没有 Graph 权限的情况下，频道中的图片消息将仅以文本形式接收（图片内容无法被 bot 访问）。
默认情况下，Clawdbot 仅下载来自 Microsoft/Teams 主机名的媒体。可通过 `channels.msteams.mediaAllowHosts` 覆盖（使用 `["*"]` 允许任何主机）。

## 在群组聊天中发送文件

Bots 可以通过 FileConsentCard 流程在私聊中发送文件（内置功能）。然而，**在群组聊天/频道中发送文件** 需要额外的设置：

| 上下文 | 文件如何发送 | 需要的设置 |
|--------|----------------|-------------|
| **私聊** | FileConsentCard → 用户接受 → bot 上传 | 无需额外设置 |
| **群组聊天/频道** | 上传到 SharePoint → 生成分享链接 | 需要 `sharePointSiteId` + Graph 权限 |
| **图片（任何上下文）** | Base64 编码的内联图片 | 无需额外设置 |

### 为什么群组聊天需要 SharePoint

Bots 没有个人的 OneDrive 驱动器（对于应用身份，`/me/drive` Graph API 端点无法使用）。要在群组聊天/频道中发送文件，bot 需要将文件上传到一个 **SharePoint 站点**，并创建一个分享链接。   ```bash
   # Via Graph Explorer or curl with a valid token:
   curl -H "Authorization: Bearer $TOKEN" \
     "https://graph.microsoft.com/v1.0/sites/{hostname}:/{site-path}"

   # Example: for a site at "contoso.sharepoint.com/sites/BotFiles"
   curl -H "Authorization: Bearer $TOKEN" \
     "https://graph.microsoft.com/v1.0/sites/contoso.sharepoint.com:/sites/BotFiles"

   # Response includes: "id": "contoso.sharepoint.com,guid1,guid2"
   ```
4. **配置 Clawdbot：**
json5
{
  channels: {
    msteams: {
      // ... 其他配置 ...
      sharePointSiteId: "contoso.sharepoint.com,guid1,guid2"
    }
  }
}```   ```
### 共享行为

| 权限 | 共享行为 |
|------------|------------------|
| 仅 `Sites.ReadWrite.All` | 组织范围内的共享链接（组织内任何人都可以访问） |
| `Sites.ReadWrite.All` + `Chat.Read.All` | 按用户共享链接（只有聊天成员可以访问） |

按用户共享更安全，因为只有聊天参与者才能访问文件。如果缺少 `Chat.Read.All` 权限，机器人将回退到组织范围内的共享。

### 回退行为

| 场景 | 结果 |
|----------|--------|
| 群组聊天 + 文件 + 配置了 `sharePointSiteId` | 上传到 SharePoint，发送共享链接 |
| 群组聊天 + 文件 + 未配置 `sharePointSiteId` | 尝试上传到 OneDrive（可能会失败），仅发送文本 |
| 个人聊天 + 文件 | 文件同意卡片流程（无需 SharePoint 即可工作） |
| 任何上下文 + 图像 | Base64 编码的内联图像（无需 SharePoint 即可工作） |

### 文件存储位置

上传的文件存储在配置的 SharePoint 站点的默认文档库中的 `/ClawdbotShared/` 文件夹中。

## 投票（自适应卡片）
Clawdbot 通过 Teams 发送自适应卡片格式的投票（Teams 没有原生的投票 API）。

- CLI: `clawdbot message poll --channel msteams --target conversation:<id> ...`
- 投票结果由网关记录在 `~/.clawdbot/msteams-polls.json` 中。
- 网关必须保持在线以记录投票。
- 投票目前还不支持自动发布结果摘要（如需查看，请检查存储文件）。

## 自适应卡片（任意）
使用 `message` 工具或 CLI 向 Teams 用户或聊天发送任意的自适应卡片 JSON。

`card` 参数接受一个自适应卡片 JSON 对象。当提供 `card` 时，消息文本是可选的。

**代理工具：**```json
{
  "action": "send",
  "channel": "msteams",
  "target": "user:<id>",
  "card": {
    "type": "AdaptiveCard",
    "version": "1.5",
    "body": [{"type": "TextBlock", "text": "Hello!"}]
  }
}
```
**命令行界面（CLI）:**
bash
clawdbot message send --channel msteams \
  --target "conversation:19:abc...@thread.tacv2" \
  --card '{"type":"AdaptiveCard","version":"1.5","body":[{"type":"TextBlock","text":"Hello!"}]}'

有关卡片架构和示例，请参阅 [Adaptive Cards 文档](https://adaptivecards.io/)。有关目标格式的详细信息，请参阅下面的 [目标格式](#target-formats)。

## 目标格式

MSTeams 的目标使用前缀来区分用户和对话：

| 目标类型 | 格式 | 示例 |
|-------------|--------|---------|
| 用户（通过 ID） | `user:<aad-object-id>` | `user:40a1a0ed-4ff2-4164-a219-55518990c197` |
| 用户（通过名称） | `user:<display-name>` | `user:John Smith`（需要 Graph API） |
| 群组/频道 | `conversation:<conversation-id>` | `conversation:19:abc123...@thread.tacv2` |
| 群组/频道（原始格式） | `<conversation-id>` | `19:abc123...@thread.tacv2`（如果包含 `@thread`） |

**CLI 示例：**```bash
# 通过用户 ID 发送消息
clawdbot message send --channel msteams --target "user:40a1a0ed-..." --message "Hello"

# 通过显示名称发送消息（会触发 Graph API 查询）
clawdbot message send --channel msteams --target "user:John Smith" --message "Hello"

# 发送到群组聊天或频道
clawdbot message send --channel msteams --target "conversation:19:abc...@thread.tacv2" --message "Hello"

# 向对话发送 Adaptive Card
clawdbot message send --channel msteams --target "conversation:19:abc...@thread.tacv2" \
  --card '{"type":"AdaptiveCard","version":"1.5","body":[{"type":"TextBlock","text":"Hello"}]}'
``````
**代理工具示例：**
json
{
  "action": "send",
  "channel": "msteams",
  "target": "user:John Smith",
  "message": "Hello!"
}
``````
{
  "action": "发送",
  "channel": "msteams",
  "target": "conversation:19:abc...@thread.tacv2",
  "card": {"type": "自适应卡片", "version": "1.5", "body": [{"type": "文本块", "text": "你好"}]}
}


注意：当没有 `user:` 前缀时，名称默认为组/团队解析。在通过显示名称定位人员时，始终使用 `user:`。

## 主动消息
- 只有在用户进行过互动之后，才能发送主动消息，因为在那时我们才会存储对话引用。
- 请查看 `/gateway/configuration` 中的 `dmPolicy` 和允许列表限制。

## 团队和频道 ID（常见陷阱）

Teams URL 中的 `groupId` 查询参数 **不是** 用于配置的团队 ID。请从 URL 路径中提取 ID：

**团队 URL：**
https://teams.microsoft.com/l/team/19%3ABk4j...%40thread.tacv2/conversations?groupId=...
                                    └────────────────────────────┘
                                    Team ID (URL-decode this)**频道网址：**

https://teams.microsoft.com/l/channel/19%3A15bc...%40thread.tacv2/ChannelName?groupId=...
                                      └─────────────────────────┘
                                      频道 ID（对这部分进行 URL 解码）``````
**关于配置：**
- **Team ID** = `/team/` 之后的路径段（URL解码，例如 `19:Bk4j...@thread.tacv2`）
- **Channel ID** = `/channel/` 之后的路径段（URL解码）
- **忽略** `groupId` 查询参数

## 私有频道

机器人在私有频道中的支持有限：

| 功能 | 标准频道 | 私有频道 |
|------|----------|----------|
| 机器人安装 | 是 | 有限 |
| 实时消息（webhook） | 是 | 可能无法工作 |
| RSC 权限 | 是 | 行为可能不同 |
| @提及 | 是 | 如果机器人可访问 |
| Graph API 历史记录 | 是 | 是（需权限） |

**如果私有频道不工作，可以尝试以下解决方法：**
1. 在标准频道中进行机器人交互
2. 使用直接消息（DM） - 用户始终可以与机器人直接聊天
3. 使用 Graph API 获取历史记录（需要 `ChannelMessage.Read.All` 权限）

## 故障排除

### 常见问题

- **频道中图片不显示：** 缺少 Graph 权限或管理员授权。重新安装 Teams 应用并彻底退出/重新打开 Teams。
- **频道中没有响应：** 默认需要 @提及；可以设置 `channels.msteams.requireMention=false` 或按团队/频道配置。
- **版本不匹配（Teams 仍显示旧的 manifest）：** 卸载并重新添加应用，并彻底退出 Teams 以刷新。
- **webhook 返回 401 未授权：** 在未使用 Azure JWT 手动测试时是正常的，表示端点可达但认证失败。请使用 Azure Web Chat 进行正确测试。

### manifest 上传错误

- **"图标文件不能为空"：** manifest 引用了大小为 0 字节的图标文件。请创建有效的 PNG 图标（`outline.png` 为 32x32，`color.png` 为 192x192）。
- **"webApplicationInfo.Id 已被使用"：** 应用仍在其他团队/聊天中安装。请先找到并卸载它，或等待 5-10 分钟以等待传播。
- **上传时出现 "Something went wrong"：** 请通过 https://admin.teams.microsoft.com 上传，打开浏览器的 DevTools（F12）→ Network 标签，查看响应体以获取实际错误信息。
- **侧载失败：** 尝试使用 "将应用上传到组织的应用目录" 而不是 "上传自定义应用" - 这通常可以绕过侧载限制。

### RSC 权限不起作用

1. 确认 `webApplicationInfo.id` 与机器人的 App ID 完全一致
2. 重新上传应用并重新在团队/聊天中安装
3. 检查组织管理员是否阻止了 RSC 权限
4. 确认使用了正确的权限范围：团队使用 `ChannelMessage.Read.Group`，群组聊天使用 `ChatMessage.Read.Chat`

## 参考资料
- [创建 Azure Bot](https://learn.microsoft.com/zh-cn/azure/bot-service/bot-service-quickstart-registration) - Azure Bot 设置指南
- [Teams 开发者门户](https://dev.teams.microsoft.com/apps) - 创建/管理 Teams 应用
- [Teams 应用清单架构](https://learn.microsoft.com/zh-cn/microsoftteams/platform/resources/schema/manifest-schema)
- [通过 RSC 接收频道消息](https://learn.microsoft.com/zh-cn/microsoftteams/platform/bots/how-to/conversations/channel-messages-with-rsc)
- [RSC 权限参考](https://learn.microsoft.com/zh-cn/microsoftteams/platform/graph-api/rsc/resource-specific-consent)
- [Teams bot 文件处理](https://learn.microsoft.com/zh-cn/microsoftteams/platform/bots/how-to/bots-filesv4)（频道/群组需要 Graph）
- [主动消息](https://learn.microsoft.com/zh-cn/microsoftteams/platform/bots/how-to/conversations/send-proactive-messages)