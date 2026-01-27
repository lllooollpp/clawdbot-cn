---
summary: "WebSocket gateway architecture, components, and client flows"
read_when:
  - Working on gateway protocol, clients, or transports
---

# 网关架构

最后更新：2026-01-22

## 概述

- 一个长期运行的 **网关** 拥有所有消息界面（通过 Baileys 的 WhatsApp，通过 grammY 的 Telegram，Slack，Discord，Signal，iMessage，WebChat）。
- 控制平面客户端（macOS 应用、CLI、网页管理界面、自动化脚本）通过 **WebSocket** 连接到网关，连接的绑定主机为配置的地址（默认为 `127.0.0.1:18789`）。
- **节点**（macOS/iOS/Android/无头设备）也通过 **WebSocket** 连接，但声明 `role: node` 并带有明确的权限/命令。
- 每个主机有一个网关；它是唯一可以打开 WhatsApp 会话的地方。
- 一个 **画布主机**（默认 `18793`）提供可由代理编辑的 HTML 和 A2UI。

## 组件与流程

### 网关（守护进程）
- 维护提供者连接。
- 提供类型化的 WS API（请求、响应、服务器推送事件）。
- 对入站帧进行 JSON Schema 验证。
- 发送事件如 `agent`、`chat`、`presence`、`health`、`heartbeat`、`cron`。

### 客户端（mac 应用 / CLI / 网页管理）
- 每个客户端有一个 WS 连接。
- 发送请求（`health`、`status`、`send`、`agent`、`system-presence`）。
- 订阅事件（`tick`、`agent`、`presence`、`shutdown`）。

### 节点（macOS / iOS / Android / 无头设备）
- 通过 `role: node` 连接到 **相同的 WS 服务器**。
- 在 `connect` 时提供设备身份；配对是 **基于设备的**（角色为 `node`），并且批准信息存储在设备配对存储中。
- 暴露命令如 `canvas.*`、`camera.*`、`screen.record`、`location.get`。

协议细节：
- [网关协议](/gateway/protocol)

### WebChat
- 静态用户界面，使用网关的 WS API 获取聊天历史和发送消息。
- 在远程设置中，通过与其它客户端相同的 SSH/Tailscale 隧道连接。

## 网络协议（概要）

- 传输方式：WebSocket，使用文本帧和JSON负载。
- 第一帧 **必须** 是 `connect`。
- 握手完成后：
  - 请求：`{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
  - 事件：`{type:"event", event, payload, seq?, stateVersion?}`
- 如果设置了 `CLAWDBOT_GATEWAY_TOKEN`（或 `--token`），则 `connect.params.auth.token` 必须匹配，否则连接会关闭。
- 对于有副作用的方法（如 `send`、`agent`），需要使用**幂等性键**以安全地重试；服务器会维护一个**短期去重缓存**。
- 节点必须包含 `role: "node"`，以及在 `connect` 中的**能力/命令/权限**。

## 配对与本地信任

- 所有WS客户端（操作员 + 节点）在 `connect` 中都必须包含一个 **设备身份**。
- 新的设备ID需要经过配对审批；网关会颁发一个 **设备令牌** 用于后续连接。
- **本地** 连接（回环地址或网关自身的tailnet地址）可以自动审批，以保持同一主机的用户体验流畅。
- **非本地** 连接必须对 `connect.challenge` 的随机数进行签名，并且需要显式审批。
- 网关认证（`gateway.auth.*`）仍然适用于 **所有** 连接，无论是本地还是远程。

详细信息：[网关协议](/gateway/protocol)，[配对](/start/pairing)，[安全](/gateway/security)。

## 协议类型与代码生成

- 协议由 **TypeBox** 的模式定义。
- JSON Schema 从这些模式生成。
- Swift 模型也从 JSON Schema 生成。

## 远程访问

- 推荐方式：Tailscale 或 VPN。
- 替代方式：SSH 隧道
bash
  ssh -N -L 18789:127.0.0.1:18789 user@host
```  ```
- 相同的握手 + 认证令牌通过隧道应用。
- 可以在远程设置中为 WS 启用 TLS + 可选的证书锁定。

## 操作快照

- 启动：`clawdbot gateway`（前台运行，日志输出到 stdout）。
- 健康检查：通过 WS 的 `health`（也包含在 `hello-ok` 中）。
- 监控：使用 launchd/systemd 实现自动重启。

## 不变性

- 每个主机仅由一个网关控制一个 Baileys 会话。
- 握手是强制性的；任何非 JSON 或非连接的第一个帧都会导致强制关闭。
- 事件不会重放；客户端必须在出现断点时刷新。