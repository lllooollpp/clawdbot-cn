---
summary: "Gateway WebSocket protocol: handshake, frames, versioning"
read_when:
  - Implementing or updating gateway WS clients
  - Debugging protocol mismatches or connect failures
  - Regenerating protocol schema/models
---

# 网关协议（WebSocket）

网关 WebSocket 协议是 Clawdbot 的 **单一控制平面 + 节点传输** 协议。所有客户端（CLI、网页界面、macOS 应用、iOS/Android 节点、无头节点）通过 WebSocket 连接，并在握手时声明其 **角色** + **作用域**。

## 传输

- 使用 WebSocket，文本帧携带 JSON 数据。
- 第一个帧 **必须** 是一个 `connect` 请求。

## 握手（connect）

网关 → 客户端（预连接挑战）：
json
{
  "type": "event",
  "event": "connect.challenge",
  "payload": { "nonce": "…", "ts": 1737264000000 }
}
``````
客户端 → 网关：```json
{
  "type": "req",
  "id": "…",
  "method": "connect",
  "params": {
    "minProtocol": 3,
    "maxProtocol": 3,
    "client": {
      "id": "cli",
      "version": "1.2.3",
      "platform": "macos",
      "mode": "operator"
    },
    "role": "operator",
    "scopes": ["operator.read", "operator.write"],
    "caps": [],
    "commands": [],
    "permissions": {},
    "auth": { "token": "…" },
    "locale": "en-US",
    "userAgent": "clawdbot-cli/1.2.3",
    "device": {
      "id": "device_fingerprint",
      "publicKey": "…",
      "signature": "…",
      "signedAt": 1737264000000,
      "nonce": "…"
    }
  }
}
```
{
  "type": "res",
  "id": "…",
  "ok": true,
  "payload": { "type": "hello-ok", "protocol": 3, "policy": { "tickIntervalMs": 15000 } }
}```
当设备令牌被颁发时，`hello-ok` 还包括：```json
{
  "auth": {
    "deviceToken": "…",
    "role": "operator",
    "scopes": ["operator.read", "operator.write"]
  }
}
```
```json
{
  "type": "req",
  "id": "…",
  "method": "connect",
  "params": {
    "minProtocol": 3,
    "maxProtocol": 3,
    "client": {
      "id": "ios-node",
      "version": "1.2.3",
      "platform": "ios",
      "mode": "node"
    },
    "role": "node",
    "scopes": [],
    "caps": ["相机", "画布", "屏幕", "位置", "语音"],
    "commands": ["相机.拍摄", "画布.导航", "屏幕.录制", "位置.获取"],
    "permissions": { "相机.拍摄": true, "屏幕.录制": false },
    "auth": { "token": "…" },
    "locale": "en-US",
    "userAgent": "clawdbot-ios/1.2.3",
    "device": {
      "id": "设备指纹",
      "publicKey": "…",
      "signature": "…",
      "signedAt": 1737264000000,
      "nonce": "…"
    }
  }
}
``````
## 封装

- **请求**: `{type:"req", id, method, params}`  
- **响应**: `{type:"res", id, ok, payload|error}`  
- **事件**: `{type:"event", event, payload, seq?, stateVersion?}`

需要副作用的方法需要 **幂等性键**（参见模式）。

## 角色 + 范围

### 角色
- `operator` = 控制平面客户端（CLI/UI/自动化）。
- `node` = 能力主机（摄像头/屏幕/画布/system.run）。

### 范围（operator）
通用范围：
- `operator.read`
- `operator.write`
- `operator.admin`
- `operator.approvals`
- `operator.pairing`

### 能力/命令/权限（node）
节点在连接时声明能力声明：
- `caps`: 高级能力类别。
- `commands`: 调用允许列表。
- `permissions`: 细粒度开关（例如 `screen.record`, `camera.capture`）。

网关将这些视为 **声明** 并强制执行服务器端的允许列表。

## 在线状态

- `system-presence` 返回以设备身份为键的条目。
- 在线状态条目包含 `deviceId`, `roles` 和 `scopes`，以便 UI 能够在设备同时以 **operator** 和 **node** 身份连接时，仍能显示每台设备一行。

### 节点辅助方法

- 节点可以调用 `skills.bins` 来获取当前技能可执行文件列表，用于自动允许检查。

## 执行批准

- 当执行请求需要批准时，网关会广播 `exec.approval.requested`。
- 操作员客户端通过调用 `exec.approval.resolve` 进行解决（需要 `operator.approvals` 范围）。

## 版本控制

- `PROTOCOL_VERSION` 位于 `src/gateway/protocol/schema.ts` 中。
- 客户端发送 `minProtocol` + `maxProtocol`；服务器会拒绝不匹配的情况。
- 模式 + 模型是从 TypeBox 定义生成的：
  - `pnpm protocol:gen`
  - `pnpm protocol:gen:swift`
  - `pnpm protocol:check`

## 认证

- 如果设置了 `CLAWDBOT_GATEWAY_TOKEN`（或 `--token`），则 `connect.params.auth.token` 必须匹配，否则套接字会被关闭。
- 配对后，网关会为设备 + 角色颁发一个 **设备令牌**。它会在 `hello-ok.auth.deviceToken` 中返回，客户端应将其保存用于未来的连接。
- 可以通过 `device.token.rotate` 和 `device.token.revoke` 旋转/吊销设备令牌（需要 `operator.pairing` 范围）。

## 设备身份 + 配对

- 节点应包含一个稳定的设备身份（`device.id`），该身份来源于密钥对指纹。
- 网关按设备 + 角色颁发令牌。
- 新设备 ID 需要配对批准，除非启用了本地自动批准。
- **本地** 连接包括环回地址和网关主机自身的 tailnet 地址（因此同一主机的 tailnet 绑定仍可自动批准）。
- 所有 WebSocket 客户端在 `connect` 时都必须包含 `device` 身份（operator + node）。
  控制 UI 只有在 `gateway.controlUi.allowInsecureAuth` 启用时才可以省略它。
- 非本地连接必须对服务器提供的 `connect.challenge` 非法值进行签名。

## TLS + 固定

- TLS 支持用于 WS 连接。
- 客户端可以选择固定网关证书指纹（参见 `gateway.tls` 配置以及 `gateway.remote.tlsFingerprint` 或 CLI 参数 `--tls-fingerprint`）。

## 作用范围

此协议公开了 **完整的网关 API**（状态、频道、模型、聊天、代理、会话、节点、批准等）。具体的功能面由 `src/gateway/protocol/schema.ts` 中的 TypeBox 模式定义。