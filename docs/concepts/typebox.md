---
summary: "TypeBox schemas as the single source of truth for the gateway protocol"
read_when:
  - Updating protocol schemas or codegen
---

# TypeBox 作为协议的唯一事实来源

最后更新时间：2026-01-10

TypeBox 是一个以 TypeScript 为先的模式库。我们使用它来定义 **Gateway WebSocket 协议**（握手、请求/响应、服务器事件）。这些模式用于 **运行时验证**、**JSON Schema 导出** 以及 **Swift 代码生成**，用于 macOS 应用程序。一个事实来源；其他一切均由其生成。

如果你想了解更高层次的协议背景，可以从 [Gateway 架构](/concepts/architecture) 开始。

## 思维模型（30 秒）

每个 Gateway WS 消息都是三种帧中的一种：

- **请求**：`{ type: "req", id, method, params }`
- **响应**：`{ type: "res", id, ok, payload | error }`
- **事件**：`{ type: "event", event, payload, seq?, stateVersion? }`

第一个帧 **必须** 是一个 `connect` 请求。之后，客户端可以调用方法（例如 `health`、`send`、`chat.send`）并订阅事件（例如 `presence`、`tick`、`agent`）。

连接流程（最小化）：

Client                    Gateway
  |---- req:connect -------->|
  |<---- res:hello-ok --------|
  |<---- event:tick ----------|
  |---- req:health ---------->|
  |<---- res:health ----------|``````
常用方法 + 事件：

| 分类 | 示例 | 说明 |
| --- | --- | --- |
| 核心 | `connect`, `health`, `status` | `connect` 必须是第一个消息 |
| 消息 | `send`, `poll`, `agent`, `agent.wait` | 需要 `idempotencyKey` 来处理副作用 |
| 聊天 | `chat.history`, `chat.send`, `chat.abort`, `chat.inject` | WebChat 使用这些 |
| 会话 | `sessions.list`, `sessions.patch`, `sessions.delete` | 会话管理 |
| 节点 | `node.list`, `node.invoke`, `node.pair.*` | 网关 WS + 节点操作 |
| 事件 | `tick`, `presence`, `agent`, `chat`, `health`, `shutdown` | 服务器推送 |

权威列表位于 `src/gateway/server.ts` 中（`METHODS`, `EVENTS`）。

## 模式定义所在位置

- 源码：`src/gateway/protocol/schema.ts`
- 运行时验证器（AJV）：`src/gateway/protocol/index.ts`
- 服务器握手 + 方法分发：`src/gateway/server.ts`
- 节点客户端：`src/gateway/client.ts`
- 生成的 JSON Schema：`dist/protocol.schema.json`
- 生成的 Swift 模型：`apps/macos/Sources/ClawdbotProtocol/GatewayModels.swift`

## 当前流程

- `pnpm protocol:gen`
  - 将 JSON Schema（draft-07）写入 `dist/protocol.schema.json`
- `pnpm protocol:gen:swift`
  - 生成 Swift 网关模型
- `pnpm protocol:check`
  - 运行两个生成器并验证输出是否已提交

## 模式在运行时的使用方式

- **服务器端**：每个传入的帧都会通过 AJV 验证。握手阶段仅接受参数符合 `ConnectParams` 的 `connect` 请求。
- **客户端**：JS 客户端会在使用事件和响应帧之前进行验证。
- **方法接口**：网关在 `hello-ok` 中声明支持的 `methods` 和 `events`。```json
{
  "type": "req",
  "id": "c1",
  "method": "connect",
  "params": {
    "minProtocol": 2,
    "maxProtocol": 2,
    "client": {
      "id": "clawdbot-macos",
      "displayName": "macos",
      "version": "1.0.0",
      "platform": "macos 15.1",
      "mode": "ui",
      "instanceId": "A1B2"
    }
  }
}
```
{
  "type": "res",
  "id": "c1",
  "ok": true,
  "payload": {
    "type": "hello-ok",
    "protocol": 2,
    "server": { "version": "dev", "connId": "ws-1" },
    "features": { "methods": ["health"], "events": ["tick"] },
    "snapshot": { "presence": [], "health": {}, "stateVersion": { "presence": 0, "health": 0 }, "uptimeMs": 0 },
    "policy": { "maxPayload": 1048576, "maxBufferedBytes": 1048576, "tickIntervalMs": 30000 }
  }
}```
"
json
{ "type": "res", "id": "r1", "ok": true, "payload": { "ok": true } }
```"
```{
  "type": "事件",
  "event": "tick",
  "payload": {
    "ts": 1730000000
  },
  "seq": 12
}```
## 最小客户端（Node.js）

最小的有用流程：连接 + 健康检查。```ts
import { WebSocket } from "ws";

const ws = new WebSocket("ws://127.0.0.1:18789");

ws.on("open", () => {
  ws.send(JSON.stringify({
    type: "req",
    id: "c1",
    method: "connect",
    params: {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: "cli",
        displayName: "example",
        version: "dev",
        platform: "node",
        mode: "cli"
      }
    }
  }));
});

ws.on("message", (data) => {
  const msg = JSON.parse(String(data));
  if (msg.type === "res" && msg.id === "c1" && msg.ok) {
    ws.send(JSON.stringify({ type: "req", id: "h1", method: "health" }));
  }
  if (msg.type === "res" && msg.id === "h1") {
    console.log("health:", msg.payload);
    ws.close();
  }
});
```
## 工作示例：端到端添加一个方法

示例：添加一个新的 `system.echo` 请求，返回 `{ ok: true, text }`。

1) **Schema（真相来源）**

将以下内容添加到 `src/gateway/protocol/schema.ts` 中：
ts
export const SystemEchoParamsSchema = Type.Object(
  { text: NonEmptyString },
  { additionalProperties: false },
);

export const SystemEchoResultSchema = Type.Object(
  { ok: Type.Boolean(), text: NonEmptyString },
  { additionalProperties: false },
);``````
将两者都添加到 `ProtocolSchemas` 并导出类型：```ts
  SystemEchoParams: SystemEchoParamsSchema,
  SystemEchoResult: SystemEchoResultSchema,
```
ts
export type SystemEchoParams = Static<typeof SystemEchoParamsSchema>;
export type SystemEchoResult = Static<typeof SystemEchoResultSchema>;

2) **验证**

在 `src/gateway/protocol/index.ts` 中，导出一个 AJV 验证器：
ts
export const validateSystemEchoParams =
  ajv.compile<SystemEchoParams>(SystemEchoParamsSchema);``````
3) **服务器行为**

在 `src/gateway/server-methods/system.ts` 中添加一个处理程序：```ts
export const systemHandlers: GatewayRequestHandlers = {
  "system.echo": ({ params, respond }) => {
    const text = String(params.text ?? "");
    respond(true, { ok: true, text });
  },
};
```
在 `src/gateway/server-methods.ts` 中注册它（已合并 `systemHandlers`），
然后将 `"system.echo"` 添加到 `src/gateway/server.ts` 中的 `METHODS` 列表中。

4) **重新生成**
bash
pnpm protocol:check``````
5) **Tests + docs**

在 `src/gateway/server.*.test.ts` 中添加一个服务器测试，并在文档中注明该方法。

## Swift 代码生成行为

Swift 生成器会生成：

- `GatewayFrame` 枚举，包含 `req`、`res`、`event` 和 `unknown` 情况
- 强类型的 payload 结构体/枚举
- `ErrorCode` 值和 `GATEWAY_PROTOCOL_VERSION`

未知的 frame 类型会被保留为原始 payload，以保证向前兼容性。

## 版本控制与兼容性

- `PROTOCOL_VERSION` 存在于 `src/gateway/protocol/schema.ts` 中。
- 客户端发送 `minProtocol` 和 `maxProtocol`；服务器会拒绝不匹配的版本。
- Swift 模型会保留未知的 frame 类型，以避免影响旧客户端。

## 模式与约定

- 大多数对象使用 `additionalProperties: false` 来保证严格的 payload 格式。
- `NonEmptyString` 是 ID 和方法/事件名称的默认类型。
- 顶层的 `GatewayFrame` 使用 **discriminator**（鉴别器）来区分 `type`。
- 有副作用的方法通常需要在参数中包含一个 `idempotencyKey`（例如：`send`、`poll`、`agent`、`chat.send`）。

## 实时 Schema JSON

生成的 JSON Schema 文件位于仓库中的 `dist/protocol.schema.json`。发布的原始文件通常可以通过以下链接获取：

- https://raw.githubusercontent.com/clawdbot/clawdbot/main/dist/protocol.schema.json

## 当你修改 Schema 时

1) 更新 TypeBox 的 Schema。
2) 运行 `pnpm protocol:check`。
3) 提交重新生成的 Schema 和 Swift 模型。