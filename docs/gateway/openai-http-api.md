---
summary: "Expose an OpenAI-compatible /v1/chat/completions HTTP endpoint from the Gateway"
read_when:
  - Integrating tools that expect OpenAI Chat Completions
---

# OpenAI Chat Completions (HTTP)

Clawdbot 的网关可以提供一个小型的 OpenAI 兼容的 Chat Completions 端点。

该端点 **默认是禁用的**。请先在配置中启用它。

- `POST /v1/chat/completions`
- 与网关相同的端口（WS + HTTP 复用）：`http://<gateway-host>:<port>/v1/chat/completions`

在底层，请求会以正常的网关代理运行方式执行（与 `clawdbot agent` 使用相同的代码路径），因此路由/权限/配置与您的网关一致。

## 认证

使用网关的认证配置。发送一个 Bearer 令牌：

- `Authorization: Bearer <token>`

注意：
- 当 `gateway.auth.mode="token"` 时，使用 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）。
- 当 `gateway.auth.mode="password"` 时，使用 `gateway.auth.password`（或 `CLAWDBOT_GATEWAY_PASSWORD`）。

## 选择代理

无需自定义头：将代理 ID 编码在 OpenAI 的 `model` 字段中：

- `model: "clawdbot:<agentId>"`（例如：`"clawdbot:main"`，`"clawdbot:beta"`）
- `model: "agent:<agentId>"`（别名）

或通过头信息指定特定的 Clawdbot 代理：

- `x-clawdbot-agent-id: <agentId>`（默认：`main`）

高级用法：
- 使用 `x-clawdbot-session-key: <sessionKey>` 完全控制会话路由。
json5
{
  gateway: {
    http: {
      endpoints: {
        chatCompletions: { enabled: true }
      }
    }
  }
}
``````
## 禁用端点

将 `gateway.http.endpoints.chatCompletions.enabled` 设置为 `false`：```json5
{
  gateway: {
    http: {
      endpoints: {
        chatCompletions: { enabled: false }
      }
    }
  }
}
```
## 会话行为

默认情况下，端点是**每次请求无状态**的（每次调用都会生成一个新的会话密钥）。

如果请求中包含 OpenAI 的 `user` 字符串，网关会从该字符串派生一个稳定的会话密钥，因此重复调用可以共享一个代理会话。

## 流式传输（SSE）

设置 `stream: true` 以接收服务器发送事件（SSE）：

- `Content-Type: text/event-stream`
- 每个事件行是 `data: <json>`
- 流以 `data: [DONE]` 结束

## 示例

非流式传输：
bash
curl -sS http://127.0.0.1:18789/v1/chat/completions \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-clawdbot-agent-id: main' \
  -d '{
    "model": "clawdbot",
    "messages": [{"role":"user","content":"hi"}]
  }'
``````
流式传输：```bash
curl -N http://127.0.0.1:18789/v1/chat/completions \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-clawdbot-agent-id: main' \
  -d '{
    "model": "clawdbot",
    "stream": true,
    "messages": [{"role":"user","content":"hi"}]
  }'
```
