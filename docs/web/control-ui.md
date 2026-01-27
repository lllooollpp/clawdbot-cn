---
summary: "Browser-based control UI for the Gateway (chat, nodes, config)"
read_when:
  - You want to operate the Gateway from a browser
  - You want Tailnet access without SSH tunnels
---

# 控制 UI（浏览器）

Control UI 是一个由网关提供的小型 **Vite + Lit** 单页应用：

- 默认地址：`http://<host>:18789/`
- 可选前缀：设置 `gateway.controlUi.basePath`（例如 `/clawdbot`）

它通过相同端口的 **Gateway WebSocket** 与网关直接通信。

## 快速打开（本地）

如果网关在同台计算机上运行，请打开：

- http://127.0.0.1:18789/（或 http://localhost:18789/）

如果页面无法加载，请先启动网关：`clawdbot gateway`

通过以下方式在 WebSocket 握手时提供认证信息：
- `connect.params.auth.token`
- `connect.params.auth.password`
仪表盘设置面板允许你存储一个 token；密码不会被持久化保存。
首次连接时，引导向导会默认生成一个网关 token，因此请将它粘贴到这里。

## 当前它可以做什么
- 通过网关 WebSocket 与模型聊天（`chat.history`, `chat.send`, `chat.abort`, `chat.inject`）
- 在聊天中流式传输工具调用和实时工具输出卡片（代理事件）
- 频道：WhatsApp/Telegram/Discord/Slack + 插件频道（如 Mattermost）的状态 + 二维码登录 + 每个频道的配置（`channels.status`, `web.login.*`, `config.patch`）
- 实例：存在性列表 + 刷新（`system-presence`）
- 会话：列表 + 每个会话的思考/详细模式覆盖（`sessions.list`, `sessions.patch`）
- 定时任务：列表/添加/运行/启用/禁用 + 运行历史（`cron.*`）
- 技能：状态、启用/禁用、安装、API 密钥更新（`skills.*`）
- 节点：列表 + 能力（`node.list`）
- 执行批准：编辑网关或节点的允许列表 + 为 `exec host=gateway/node` 请求策略（`exec.approvals.*`）
- 配置：查看/编辑 `~/.clawdbot/clawdbot.json`（`config.get`, `config.set`）
- 配置：应用并重启（带验证）并唤醒最后活跃的会话
- 配置写入包含一个基础哈希保护，以防止覆盖并发编辑
- 配置模式 + 表单渲染（`config.schema`，包括插件和频道模式）；仍然可以使用原始 JSON 编辑器
- 调试：状态/健康/模型快照 + 事件日志 + 手动 RPC 调用（`status`, `health`, `models.list`）
- 日志：网关文件日志的实时尾部，支持过滤和导出（`logs.tail`）
- 更新：运行包/git 更新 + 重启（`update.run`），并生成重启报告"将网关设置为回环地址，并让 Tailscale 通过 HTTPS 为其提供代理服务：
"
bash
clawdbot gateway --tailscale serve
```"打开：
- `https://<magicdns>/`（或你配置的 `gateway.controlUi.basePath`）

默认情况下，Serve 请求可以通过 Tailscale 身份头（`tailscale-user-login`）进行身份验证，当 `gateway.auth.allowTailscale` 为 `true` 时有效。Clawdbot 仅在请求通过环回地址（loopback）并带有 Tailscale 的 `x-forwarded-*` 头时接受这些身份验证方式。如果你希望即使是 Serve 流量也需要令牌/密码，可以将 `gateway.auth.allowTailscale` 设置为 `false`（或强制设置 `gateway.auth.mode: "password"`）。
bash
clawdbot gateway --bind tailnet --token "$(openssl rand -hex 32)"
``````
然后打开：
- `http://<tailscale-ip>:18789/`（或你配置的 `gateway.controlUi.basePath`）

将令牌粘贴到UI设置中（作为 `connect.params.auth.token` 发送）。

## 不安全的HTTP

如果你通过普通的HTTP打开控制面板（`http://<lan-ip>` 或 `http://<tailscale-ip>`），
浏览器会运行在**非安全上下文**中，并会阻止WebCrypto。默认情况下，
Clawdbot **会阻止**没有设备身份的Control UI连接。

**推荐的解决方案**：使用HTTPS（Tailscale Serve）或者本地打开UI：
- `https://<magicdns>/`（Serve）
- `http://127.0.0.1:18789/`（在网关主机上）

**降级示例（仅通过HTTP使用令牌）：**```json5
{
  gateway: {
    controlUi: { allowInsecureAuth: true },
    bind: "tailnet",
    auth: { mode: "token", token: "replace-me" }
  }
}
```
这会禁用控制UI的设备身份验证和配对功能（即使在HTTPS下也如此）。仅在您信任网络的情况下使用。

有关HTTPS设置的指导，请参阅 [Tailscale](/gateway/tailscale)。
bash
pnpm ui:build # 首次运行时会自动安装UI依赖项
``````
可选的绝对基础路径（当你需要固定资产 URL 时）：```bash
CLAWDBOT_CONTROL_UI_BASE_PATH=/clawdbot/ pnpm ui:build
```
对于本地开发（独立的开发服务器）：
bash
pnpm ui:dev # 首次运行时会自动安装 UI 依赖
``````
然后将 UI 指向你的网关 WS 地址（例如 `ws://127.0.0.1:18789`）。

## 调试/测试：开发服务器 + 远程网关

Control UI 是静态文件；WebSocket 的目标地址是可配置的，可以与 HTTP 原始地址不同。这在你希望本地使用 Vite 开发服务器而网关运行在其他地方时非常方便。

1) 启动 UI 开发服务器：`pnpm ui:dev`
2) 打开一个类似这样的网址：```text
http://localhost:5173/?gatewayUrl=ws://<gateway-host>:18789
```
可选的一次性认证（如需的话）：
text
http://localhost:5173/?gatewayUrl=wss://<gateway-host>:18789&token=<gateway-token>
``````
说明：
- `gatewayUrl` 在加载后存储在 localStorage 中，并从 URL 中移除。
- `token` 存储在 localStorage 中；`password` 仅保留在内存中。
- 当网关位于 TLS（Tailscale Serve、HTTPS 代理等）之后时，使用 `wss://`。