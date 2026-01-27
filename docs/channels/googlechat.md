---
summary: "Google Chat app support status, capabilities, and configuration"
read_when:
  - Working on Google Chat channel features
---

# Google Chat（Chat API）

状态：可通过 Google Chat API 的 Webhook（仅限 HTTP）接收 DM 和空间消息。

## 快速设置（初学者）
1) 创建一个 Google Cloud 项目并启用 **Google Chat API**。
   - 访问：[Google Chat API 凭据](https://console.cloud.google.com/apis/api/chat.googleapis.com/credentials)
   - 如果尚未启用该 API，请启用它。
2) 创建一个 **服务账户**：
   - 点击 **创建凭据** > **服务账户**。
   - 为其命名（例如：`clawdbot-chat`）。
   - 保留权限为空（点击 **继续**）。
   - 保留有访问权限的主体为空（点击 **完成**）。
3) 创建并下载 **JSON 密钥**：
   - 在服务账户列表中，点击你刚刚创建的那个。
   - 进入 **密钥** 标签页。
   - 点击 **添加密钥** > **创建新密钥**。
   - 选择 **JSON** 并点击 **创建**。
4) 将下载的 JSON 文件存储在你的网关主机上（例如：`~/.clawdbot/googlechat-service-account.json`）。
5) 在 [Google Cloud Console 的 Chat 配置](https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat) 中创建一个 Google Chat 应用：
   - 填写 **应用信息**：
     - **应用名称**：（例如 `Clawdbot`）
     - **头像 URL**：（例如 `https://clawd.bot/logo.png`）
     - **描述**：（例如 `个人 AI 助手`）
   - 启用 **交互功能**。
   - 在 **功能** 部分，勾选 **加入空间和群组对话**。
   - 在 **连接设置** 中，选择 **HTTP 端点 URL**。
   - 在 **触发器** 中，选择 **所有触发器使用一个通用的 HTTP 端点 URL**，并将其设置为你的网关公共 URL 加上 `/googlechat`。
     - *提示：运行 `clawdbot status` 可以找到你的网关公共 URL。*
   - 在 **可见性** 中，勾选 **仅对 &lt;Your Domain&gt; 中的特定人员和群组可用**。
   - 在文本框中输入你的电子邮件地址（例如 `user@example.com`）。
   - 点击底部的 **保存**。
6) **启用应用状态**：
   - 保存后，**刷新页面**。
   - 查找 **应用状态** 部分（通常在保存后位于顶部或底部）。
   - 将状态更改为 **上线 - 对用户可用**。
   - 再次点击 **保存**。
7) 使用服务账户路径和 Webhook 接收者配置 Clawdbot：
   - 环境变量：`GOOGLE_CHAT_SERVICE_ACCOUNT_FILE=/path/to/service-account.json`
   - 或配置文件：`channels.googlechat.serviceAccountFile: "/path/to/service-account.json"`.
8) 设置 Webhook 接收者类型 + 值（需与你的 Chat 应用配置匹配）。
9) 启动网关。Google Chat 将会向你的 Webhook 路径发送 POST 请求。

## 添加到 Google Chat
一旦网关运行，并且你的邮箱已被添加到可见性列表中：
1) 前往 [Google Chat](https://chat.google.com/)。
2) 点击 **Direct Messages**（直接消息）旁边的 **+**（加号）图标。
3) 在搜索栏中（通常用于添加人员的地方），输入你在 Google Cloud Console 中配置的 **应用名称**。
   - **注意**：由于这是一个私有应用，机器人将 *不会* 出现在“市场”浏览列表中。你必须通过名称搜索它。
4) 从搜索结果中选择你的机器人。
5) 点击 **Add**（添加）或 **Chat**（聊天）以开始一对一对话。
6) 发送 "Hello" 来触发助手！

## 公共 URL（仅限 Webhook）
Google Chat 的 Webhook 需要一个公共的 HTTPS 端点。出于安全考虑，**仅将 `/googlechat` 路径暴露给互联网**。请将 Clawdbot 控制面板和其他敏感端点保留在你的私有网络中。

### 选项 A：Tailscale Funnel（推荐）
使用 Tailscale Serve 来托管私有控制面板，并使用 Funnel 来暴露公共的 Webhook 路径。这样可以保持 `/` 路径私有，同时仅公开 `/googlechat`。
1. **检查网关绑定的地址：**
bash
   ss -tlnp | grep 18789```   ```
注意 IP 地址（例如 `127.0.0.1`、`0.0.0.0`，或你的 Tailscale IP 地址如 `100.x.x.x`）。

2. **仅将仪表板暴露给 tailnet（端口 8443）：**   ```bash
   # If bound to localhost (127.0.0.1 or 0.0.0.0):
   tailscale serve --bg --https 8443 http://127.0.0.1:18789

   # If bound to Tailscale IP only (e.g., 100.106.161.80):
   tailscale serve --bg --https 8443 http://100.106.161.80:18789
   ```
3. **仅公开 Webhook 路径：**
bash
   # 如果绑定到 localhost（127.0.0.1 或 0.0.0.0）:
   tailscale funnel --bg --set-path /googlechat http://127.0.0.1:18789/googlechat

   # 如果仅绑定到 Tailscale IP（例如 100.106.161.80）:
   tailscale funnel --bg --set-path /googlechat http://100.106.161.80:18789/googlechat```   ```
4. **为 Funnel 访问授权节点：**  
   如果提示，请访问输出中显示的授权 URL，以在您的 tailnet 策略中为此节点启用 Funnel。

5. **验证配置：**   ```bash
   tailscale serve status
   tailscale funnel status
   ```
您的公共 Webhook URL 将为：
`https://<node-name>.<tailnet>.ts.net/googlechat`

您的私有仪表板将保持为 tailnet 专用：
`https://<node-name>.<tailnet>.ts.net:8443/`

在 Google Chat 应用配置中使用公共 URL（不带 `:8443`）。

> 注意：此配置在重启后仍然有效。如需稍后删除，请运行 `tailscale funnel reset` 和 `tailscale serve reset`。
### 选项 B：反向代理（Caddy）
如果您使用像 Caddy 这样的反向代理，请仅代理特定路径：
caddy
your-domain.com {
    reverse_proxy /googlechat* localhost:18789
}``````
使用此配置，对 `your-domain.com/` 的任何请求将被忽略或返回 404，而 `your-domain.com/googlechat` 会安全地路由到 Clawdbot。

### 选项 C：Cloudflare Tunnel
配置隧道的入口规则，仅路由 Webhook 路径：
- **路径**：`/googlechat` -> `http://localhost:18789/googlechat`
- **默认规则**：HTTP 404（未找到）

## 工作原理

1. Google Chat 会将 Webhook 的 POST 请求发送到网关。每个请求都包含一个 `Authorization: Bearer <token>` 请求头。
2. Clawdbot 会验证该 token 是否与配置的 `audienceType` + `audience` 匹配：
   - `audienceType: "app-url"` → audience 是你的 HTTPS Webhook URL。
   - `audienceType: "project-number"` → audience 是你的 Cloud 项目编号。
3. 消息根据聊天室进行路由：
   - 私人消息使用会话密钥 `agent:<agentId>:googlechat:dm:<spaceId>`。
   - 聊天室使用会话密钥 `agent:<agentId>:googlechat:group:<spaceId>`。
4. 私人消息默认需要配对。未知发送者将收到一个配对码；可通过以下命令批准：
   - `clawdbot pairing approve googlechat <code>`
5. 聊天室默认需要 @ 提及。如果需要提及检测，可以使用 `botUser`。

## 目标
使用这些标识符进行消息投递和允许列表设置：
- 私人消息：`users/<userId>` 或 `users/<email>`（接受邮箱地址）。
- 聊天室：`spaces/<spaceId>`。

## 配置亮点```json5
{
  channels: {
    "googlechat": {
      enabled: true,
      serviceAccountFile: "/path/to/service-account.json",
      audienceType: "app-url",
      audience: "https://gateway.example.com/googlechat",
      webhookPath: "/googlechat",
      botUser: "users/1234567890", // optional; helps mention detection
      dm: {
        policy: "pairing",
        allowFrom: ["users/1234567890", "name@example.com"]
      },
      groupPolicy: "allowlist",
      groups: {
        "spaces/AAAA": {
          allow: true,
          requireMention: true,
          users: ["users/1234567890"],
          systemPrompt: "Short answers only."
        }
      },
      actions: { reactions: true },
      typingIndicator: "message",
      mediaMaxMb: 20
    }
  }
}
```
## 注意事项：
- 服务账户凭据也可以通过 `serviceAccount`（JSON 字符串）内联传递。
- 如果未设置 `webhookPath`，默认的 Webhook 路径为 `/googlechat`。
- 当启用 `actions.reactions` 时，可以通过 `reactions` 工具和 `channels action` 使用反应功能。
- `typingIndicator` 支持 `none`、`message`（默认）和 `reaction`（使用反应功能需要用户 OAuth）。
- 附件通过 Chat API 下载并存储在媒体管道中（大小受 `mediaMaxMb` 限制）。

## 排除故障

### 405 方法不允许
如果 Google Cloud Logs Explorer 显示错误信息如下：

status code: 405, reason phrase: HTTP error response: HTTP/1.1 405 Method Not Allowed```，根据输入
``````
这意味着网络钩子处理程序未被注册。常见原因包括：
1. **未配置频道**：您的配置中缺少 `channels.googlechat` 部分。请验证如下内容：
bash
   clawdbot config get channels.googlechat   ```
如果返回 "Config path not found"，请添加配置（参见 [Config highlights](#config-highlights)）。

2. **插件未启用**：检查插件状态：
bash
   clawdbot plugins list | grep googlechat
```   ```
如果显示 "disabled"，请在您的配置文件中添加 `plugins.entries.googlechat.enabled: true`。

3. **网关未重启**：添加配置后，请重启网关：
bash
clawdbot gateway restart
```   ```
验证频道是否在运行：
bash
clawdbot channels status
# 应显示：Google Chat 默认频道：已启用，已配置，...
``````
### 其他问题
- 检查 `clawdbot channels status --probe` 是否存在认证错误或缺少受众配置。
- 如果没有消息到达，请确认聊天应用的 Webhook URL 和事件订阅。
- 如果提及限制阻止了回复，请将 `botUser` 设置为应用的用户资源名称，并验证 `requireMention`。
- 在发送测试消息时使用 `clawdbot logs --follow`，查看请求是否到达网关。

相关文档：
- [网关配置](/gateway/configuration)
- [安全](/gateway/security)
- [反应](/tools/reactions)