---
summary: "Gateway web surfaces: Control UI, bind modes, and security"
read_when:
  - You want to access the Gateway over Tailscale
  - You want the browser Control UI and config editing
---

# 网络（网关）

网关通过与网关 WebSocket 相同的端口提供一个小型的 **浏览器控制 UI**（Vite + Lit）：

- 默认地址：`http://<host>:18789/`
- 可选前缀：设置 `gateway.controlUi.basePath`（例如 `/clawdbot`）

功能详情请参见 [控制 UI](/web/control-ui)。
本页面主要介绍绑定模式、安全性和面向网络的接口。

## Webhooks

当 `hooks.enabled=true` 时，网关还会在同一个 HTTP 服务器上暴露一个小型的 webhook 端点。
有关身份验证和数据内容的详情，请参见 [网关配置](/gateway/configuration) → `hooks`。
json5
{
  gateway: {
    controlUi: { enabled: true, basePath: "/clawdbot" } // basePath 为可选
  }
}
``````
## Tailscale 访问

### 集成 Serve（推荐）

将网关保持在环回地址上，并让 Tailscale Serve 代理它：```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "serve" }
  }
}
```
然后启动网关：  

clawdbot gateway```
打开：
- `https://<magicdns>/`（或你配置的 `gateway.controlUi.basePath`）

### Tailnet 绑定 + 令牌```json5
{
  gateway: {
    bind: "tailnet",
    controlUi: { enabled: true },
    auth: { mode: "token", token: "your-token" }
  }
}
```
然后启动网关（非环回绑定需要令牌）：
bash
clawdbot gateway
``````
打开：
- `http://<tailscale-ip>:18789/`（或你配置的 `gateway.controlUi.basePath`）

### 公共互联网（Funnel）```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "funnel" },
    auth: { mode: "password" } // or CLAWDBOT_GATEWAY_PASSWORD
  }
}
```
## 安全注意事项

- 将网关绑定到非回环地址 **需要** 身份验证（`gateway.auth` 或 `CLAWDBOT_GATEWAY_TOKEN`）。
- 向导默认会生成一个网关令牌（即使在回环地址上也是如此）。
- UI 会发送 `connect.params.auth.token` 或 `connect.params.auth.password`。
- 使用 Serve 时，当 `gateway.auth.allowTailscale` 为 `true`，Tailscale 身份头可以满足身份验证（不需要令牌/密码）。设置 `gateway.auth.allowTailscale: false` 以要求显式凭证。参见 [Tailscale](/gateway/tailscale) 和 [安全](/gateway/security)。
- `gateway.tailscale.mode: "funnel"` 需要 `gateway.auth.mode: "password"`（共享密码）。
bash
pnpm ui:build # 首次运行时会自动安装 UI 依赖
``````
