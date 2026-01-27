---
summary: "Gateway dashboard (Control UI) access and auth"
read_when:
  - Changing dashboard authentication or exposure modes
---

# 仪表盘（控制界面）

网关仪表盘默认通过 `/` 路径提供浏览器控制界面（可通过 `gateway.controlUi.basePath` 覆盖）。

快速打开（本地网关）：
- http://127.0.0.1:18789/（或 http://localhost:18789/）

关键参考：
- [控制界面](/web/control-ui) 用于使用和界面功能。
- [Tailscale](/gateway/tailscale) 用于 Serve/Funnel 自动化。
- [Web 表面](/web) 用于绑定模式和安全注意事项。

通过 `connect.params.auth`（令牌或密码）在 WebSocket 握手时强制进行身份验证。参见 [网关配置](/gateway/configuration) 中的 `gateway.auth`。

## 快速路径（推荐）

- 上线后，CLI 会自动使用你的令牌打开仪表盘，并打印相同的带令牌链接。
- 随时重新打开：`clawdbot dashboard`（复制链接，如果可能则打开浏览器，如果无头模式则显示 SSH 提示）。
- 令牌仅在本地（查询参数中）；仪表盘在首次加载后会将其移除，并保存到 localStorage 中。

## 令牌基础（本地与远程）

- **本地主机**：打开 `http://127.0.0.1:18789/`。如果你看到“未授权”，请运行 `clawdbot dashboard` 并使用带令牌的链接（`?token=...`）。
- **令牌来源**：`gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）；仪表盘在首次加载后会存储该令牌。
- **非本地主机**：使用 Tailscale Serve（如果 `gateway.auth.allowTailscale: true`，则无需令牌）、tailnet 绑定并使用令牌，或通过 SSH 隧道。参见 [Web 表面](/web)。

## 如果看到“未授权” / 1008

- 运行 `clawdbot dashboard` 获取一个新的带令牌链接。
- 确保网关可以访问（本地：`clawdbot status`；远程：使用 SSH 隧道 `ssh -N -L 18789:127.0.0.1:18789 user@host`，然后打开 `http://127.0.0.1:18789/?token=...`）。
- 在仪表盘设置中，粘贴你在 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）中配置的相同令牌。