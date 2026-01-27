---
summary: "Invoke a single tool directly via the Gateway HTTP endpoint"
read_when:
  - Calling tools without running a full agent turn
  - Building automations that need tool policy enforcement
---

# 工具调用（HTTP）

Clawdbot 的网关提供了一个简单的 HTTP 端点，用于直接调用单个工具。该功能始终处于启用状态，但受网关认证和工具策略的限制。

- `POST /tools/invoke`
- 与网关相同的端口（WS + HTTP 多路复用）：`http://<gateway-host>:<port>/tools/invoke`

默认最大负载大小为 2 MB。

## 认证

使用网关的认证配置。发送一个 Bearer 令牌：

- `Authorization: Bearer <token>`

注意事项：
- 当 `gateway.auth.mode="token"` 时，使用 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）。
- 当 `gateway.auth.mode="password"` 时，使用 `gateway.auth.password`（或 `CLAWDBOT_GATEWAY_PASSWORD`）。
json
{
  "tool": "sessions_list",
  "action": "json",
  "args": {},
  "sessionKey": "main",
  "dryRun": false
}
``````
字段：
- `tool` (字符串，必填)：要调用的工具名称。
- `action` (字符串，可选)：如果工具的 schema 支持 `action` 并且 args 负载中未包含它，则将其映射到 args。
- `args` (对象，可选)：工具特定的参数。
- `sessionKey` (字符串，可选)：目标会话密钥。如果省略或为 `"main"`，网关将使用配置的主会话密钥（遵循 `session.mainKey` 和默认代理，或在全局作用域中使用 `global`）。
- `dryRun` (布尔值，可选)：保留供将来使用；目前被忽略。

## 策略 + 路由行为

工具的可用性通过网关代理使用的相同策略链进行过滤：
- `tools.profile` / `tools.byProvider.profile`
- `tools.allow` / `tools.byProvider.allow`
- `agents.<id>.tools.allow` / `agents.<id>.tools.byProvider.allow`
- 如果会话密钥映射到组或频道，则应用组策略
- 子代理策略（当使用子代理会话密钥调用时）

如果工具未通过策略允许，端点将返回 **404**。

为了帮助组策略解析上下文，你可以选择性地设置：
- `x-clawdbot-message-channel: <channel>`（例如：`slack`，`telegram`）
- `x-clawdbot-account-id: <accountId>`（当存在多个账户时）

## 响应

- `200` → `{ ok: true, result }`
- `400` → `{ ok: false, error: { type, message } }`（无效请求或工具错误）
- `401` → 未授权
- `404` → 工具不可用（未找到或未被允许）
- `405` → 方法不允许

## 示例```bash
curl -sS http://127.0.0.1:18789/tools/invoke \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "tool": "sessions_list",
    "action": "json",
    "args": {}
  }'
```
