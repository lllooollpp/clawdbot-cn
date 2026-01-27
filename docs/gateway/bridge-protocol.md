---
summary: "Bridge protocol (legacy nodes): TCP JSONL, pairing, scoped RPC"
read_when:
  - Building or debugging node clients (iOS/Android/macOS node mode)
  - Investigating pairing or bridge auth failures
  - Auditing the node surface exposed by the gateway
---

# 桥接协议（旧版节点传输）

桥接协议是一种 **旧版** 的节点传输协议（TCP JSONL）。新的节点客户端应改用统一的网关 WebSocket 协议。

如果您正在构建一个操作员或节点客户端，请使用 [网关协议](/gateway/protocol)。

**注意：** 当前的 Clawdbot 构建不再包含 TCP 桥接监听器；本文档仅供历史参考。  
旧版的 `bridge.*` 配置键已不再包含在配置模式中。

## 为什么同时存在两种协议

- **安全边界**：桥接协议暴露的是一个小型允许列表，而不是完整的网关 API 表面。
- **配对 + 节点身份**：节点准入由网关管理，并与每个节点的令牌相关联。
- **发现用户体验**：节点可以通过局域网上的 Bonjour 发现网关，或直接通过 tailnet 连接。
- **回环 WebSocket**：完整的 WebSocket 控制平面保持在本地，除非通过 SSH 隧道。

## 传输方式

- TCP，每行一个 JSON 对象（JSONL）。
- 可选 TLS（当 `bridge.tls.enabled` 为 true 时启用）。
- 旧版默认监听端口为 `18790`（当前构建不再启动 TCP 桥接）。

当启用 TLS 时，发现 TXT 记录中会包含 `bridgeTls=1` 以及 `bridgeTlsSha256`，以便节点可以固定证书。

## 握手与配对

1) 客户端发送 `hello`，包含节点元数据 + 已配对的令牌（如果已配对）。  
2) 如果未配对，网关回复 `error`（`NOT_PAIRED`/`UNAUTHORIZED`）。  
3) 客户端发送 `pair-request`。  
4) 网关等待批准，然后发送 `pair-ok` 和 `hello-ok`。

`hello-ok` 返回 `serverName`，并可能包含 `canvasHostUrl`。

## 帧

客户端 → 网关：
- `req` / `res`：作用域网关 RPC（聊天、会话、配置、健康、语音唤醒、skills.bins）
- `event`：节点信号（语音转录、代理请求、聊天订阅、执行生命周期）

网关 → 客户端：
- `invoke` / `invoke-res`：节点命令（`canvas.*`、`camera.*`、`screen.record`、`location.get`、`sms.send`）
- `event`：已订阅会话的聊天更新
- `ping` / `pong`：保持连接

旧版的允许列表强制执行逻辑位于 `src/gateway/server-bridge.ts`（已移除）。

## 执行生命周期事件

节点可以发出 `exec.finished` 或 `exec.denied` 事件，以显示 `system.run` 的活动。  
这些事件会被映射到网关中的系统事件。（旧版节点可能仍会发出 `exec.started`。）

有效载荷字段（除非特别说明，否则均为可选）：
- `sessionKey`（必需）：接收系统事件的代理会话。
- `runId`：用于分组的唯一执行 ID。
- `command`：原始或格式化的命令字符串。
- `exitCode`、`timedOut`、`success`、`output`：完成详情（仅在 `exec.finished` 时有效）。
- `reason`：拒绝原因（仅在 `exec.denied` 时有效）。

## Tailnet 使用

- 将桥接绑定到 tailnet IP：在 `~/.clawdbot/clawdbot.json` 中设置 `bridge.bind: "tailnet"`。
- 客户端通过 MagicDNS 名称或 tailnet IP 连接。
- Bonjour **不会**跨网络传播；如需跨广域网，请使用手动主机/端口或广域 DNS‑SD。