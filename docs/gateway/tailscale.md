---
summary: "Integrated Tailscale Serve/Funnel for the Gateway dashboard"
read_when:
  - Exposing the Gateway Control UI outside localhost
  - Automating tailnet or public dashboard access
---

# Tailscale（网关仪表板）

Clawdbot 可以自动配置 Tailscale **Serve**（tailnet）或 **Funnel**（公共）用于网关仪表板和 WebSocket 端口。这会将网关绑定到 loopback，同时 Tailscale 提供 HTTPS、路由以及（对于 Serve）身份标识头。

## 模式

- `serve`: 通过 `tailscale serve` 实现的仅 tailnet 的 Serve。网关保持在 `127.0.0.1`。
- `funnel`: 通过 `tailscale funnel` 实现的公共 HTTPS。Clawdbot 需要一个共享密码。
- `off`: 默认模式（不使用 Tailscale 自动化）。

## 认证

设置 `gateway.auth.mode` 以控制握手方式：

- `token`（当设置 `CLAWDBOT_GATEWAY_TOKEN` 时为默认值）
- `password`（通过 `CLAWDBOT_GATEWAY_PASSWORD` 或配置的共享密钥）

当 `tailscale.mode = "serve"` 且 `gateway.auth.allowTailscale` 设置为 `true` 时，有效的 Serve 代理请求可以通过 Tailscale 身份标识头（`tailscale-user-login`）进行身份验证，而无需提供 token 或密码。Clawdbot 仅在请求来自 loopback 并带有 Tailscale 的 `x-forwarded-for`、`x-forwarded-proto` 和 `x-forwarded-host` 头时，才将该请求视为 Serve 请求。
如需要显式的凭据，请将 `gateway.auth.allowTailscale` 设置为 `false` 或强制设置 `gateway.auth.mode: "password"`。
json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "serve" }
  }
}
``````
Open: `https://<magicdns>/`（或你配置的 `gateway.controlUi.basePath`）

### 仅限 Tailnet（绑定到 Tailnet IP）

当您希望网关直接在 Tailnet IP 上监听时使用此选项（无需 Serve/Funnel）。```json5
{
  gateway: {
    bind: "tailnet",
    auth: { mode: "token", token: "your-token" }
  }
}
```
从另一个 Tailnet 设备连接：
- 控制面板：`http://<tailscale-ip>:18789/`
- WebSocket：`ws://<tailscale-ip>:18789`

注意：此模式下，回环地址（`http://127.0.0.1:18789`）将**不起作用**。
json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "funnel" },
    auth: { mode: "password", password: "replace-me" }
  }
}
``````
优先使用 `CLAWDBOT_GATEWAY_PASSWORD` 而不是将密码写入磁盘。```bash
clawdbot gateway --tailscale serve
clawdbot gateway --tailscale funnel --auth password
```
## 注意事项

- Tailscale Serve/Funnel 需要安装并登录 `tailscale` CLI。
- `tailscale.mode: "funnel"` 除非认证模式为 `password`，否则不会启动，以避免公开暴露。
- 如果你希望 Clawdbot 在关闭时撤销 `tailscale serve` 或 `tailscale funnel` 的配置，请设置 `gateway.tailscale.resetOnExit`。
- `gateway.bind: "tailnet"` 是直接的 Tailnet 绑定（不使用 HTTPS，也不使用 Serve/Funnel）。
- `gateway.bind: "auto"` 优先使用本地回环地址；如果你想仅使用 Tailnet，请使用 `tailnet`。
- Serve/Funnel 仅暴露 **网关控制 UI + WS**。节点通过相同的网关 WS 端点连接，因此 Serve 可以用于节点访问。

## 浏览器控制服务器（远程网关 + 本地浏览器）

如果你在一台机器上运行网关，但希望在另一台机器上操作浏览器，请使用一个 **独立的浏览器控制服务器**，并通过 Tailscale **Serve**（仅 Tailnet）进行发布。
bash
# 在运行 Chrome 的机器上
clawdbot browser serve --bind 127.0.0.1 --port 18791 --token <token>
tailscale serve https / http://127.0.0.1:18791
``````
然后将网关配置指向 HTTPS URL：```json5
{
  browser: {
    enabled: true,
    controlUrl: "https://<magicdns>/"
  }
}
```
并且使用相同的令牌从网关进行身份验证（优先使用环境变量）：  
export CLAWDBOT_BROWSER_CONTROL_TOKEN="<token>"```
避免在浏览器控制端点上使用 Funnel，除非你明确希望公开暴露。

## Tailscale 的先决条件和限制

- Serve 要求你的 tailnet 必须启用 HTTPS；如果缺少 HTTPS，CLI 会发出提示。
- Serve 会注入 Tailscale 身份验证头；Funnel 不会。
- Funnel 要求 Tailscale v1.38.3+、MagicDNS、HTTPS 已启用，并且需要一个 funnel 节点属性。
- Funnel 仅支持通过 TLS 的端口 `443`、`8443` 和 `10000`。
- macOS 上的 Funnel 需要使用开源版的 Tailscale 应用程序。

## 了解更多

- Tailscale Serve 概述：https://tailscale.com/kb/1312/serve
- `tailscale serve` 命令：https://tailscale.com/kb/1242/tailscale-serve
- Tailscale Funnel 概述：https://tailscale.com/kb/1223/tailscale-funnel
- `tailscale funnel` 命令：https://tailscale.com/kb/1311/tailscale-funnel