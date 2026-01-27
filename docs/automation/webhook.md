---
summary: "Webhook ingress for wake and isolated agent runs"
read_when:
  - Adding or changing webhook endpoints
  - Wiring external systems into Clawdbot
---

# Webhooks

网关可以为外部触发提供一个小型的 HTTP webhook 端点。

## 启用
json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks"
  }
}``````
说明：
- 当 `hooks.enabled=true` 时，`hooks.token` 是必需的。
- `hooks.path` 的默认值为 `/hooks`。

## 认证

每个请求都必须包含 hook 令牌：
- `Authorization: Bearer <token>`
- 或 `x-clawdbot-token: <token>`
- 或 `?token=<token>````json
{ "text": "System line", "mode": "now" }
```
- `text` **必须** (字符串): 事件的描述（例如：“收到新邮件”）。
- `mode` 可选 (`now` | `next-heartbeat`): 是否立即触发心跳（默认为 `now`），或者等待下一次周期性检查。

效果：
- 将系统事件加入 **主** 会话的队列中
- 如果 `mode=now`，则立即触发心跳

### `POST /hooks/agent`

请求体：
json
{
  "message": "Run this",
  "name": "Email",
  "sessionKey": "hook:email:msg-123",
  "wakeMode": "now",
  "deliver": true,
  "channel": "last",
  "to": "+15551234567",
  "model": "openai/gpt-5.2-mini",
  "thinking": "low",
  "timeoutSeconds": 120
}
`````````
- `message` **必需** (字符串): 代理要处理的提示或消息。
- `name` 可选 (字符串): 钩子的可读名称（例如："GitHub"），在会话摘要中用作前缀。
- `sessionKey` 可选 (字符串): 用于标识代理会话的键。默认为随机生成的 `hook:<uuid>`。使用一致的键可以在钩子上下文中实现多轮对话。
- `wakeMode` 可选 (`now` | `next-heartbeat`): 是否立即触发心跳（默认为 `now`），或者等待下一次定期检查。
- `deliver` 可选 (布尔值): 如果为 `true`，代理的响应将发送到消息通道。默认为 `true`。仅用于心跳确认的响应会自动跳过。
- `channel` 可选 (字符串): 用于发送的通讯渠道。可选值包括：`last`、`whatsapp`、`telegram`、`discord`、`slack`、`mattermost`（插件）、`signal`、`imessage`、`msteams`。默认为 `last`。
- `to` 可选 (字符串): 渠道中的接收者标识符（例如，WhatsApp/Signal的电话号码，Telegram的聊天ID，Discord/Slack/Mattermost（插件）的频道ID，MS Teams的会话ID）。默认为当前主会话中的最后一位接收者。
- `model` 可选 (字符串): 模型覆盖（例如：`anthropic/claude-3-5-sonnet` 或别名）。如果有限制，必须在允许的模型列表中。
- `thinking` 可选 (字符串): 思考级别覆盖（例如：`low`、`medium`、`high`）。
- `timeoutSeconds` 可选 (数字): 代理运行的最大持续时间（以秒为单位）。

效果：
- 运行一个 **独立的** 代理回合（使用独立的会话键）
- 始终将摘要发布到 **主** 会话中
- 如果 `wakeMode=now`，则触发立即的心跳

### `POST /hooks/<name>` (映射)

自定义钩子名称通过 `hooks.mappings` 解析（参见配置）。一个映射可以将任意负载转换为 `wake` 或 `agent` 操作，也可以选择性地使用模板或代码转换。

映射选项（摘要）：
- `hooks.presets: ["gmail"]` 启用内置的 Gmail 映射。
- `hooks.mappings` 允许你在配置中定义 `match`、`action` 和模板。
- `hooks.transformsDir` + `transform.module` 加载一个 JS/TS 模块以实现自定义逻辑。
- 使用 `match.source` 来保持一个通用的接收端点（基于负载的路由）。
- TS 转换需要 TS 加载器（例如：`bun` 或 `tsx`）或运行时预编译的 `.js` 文件。
- 在映射中设置 `deliver: true` + `channel`/`to` 可以将回复路由到聊天界面（`channel` 默认为 `last`，并回退到 WhatsApp）。
- `clawdbot webhooks gmail setup` 会为 `clawdbot webhooks gmail run` 写入 `hooks.gmail` 配置。
参见 [Gmail Pub/Sub](/automation/gmail-pubsub) 了解完整的 Gmail 监听流程。

## 响应

- `/hooks/wake` 返回 `200`
- `/hooks/agent` 返回 `202`（异步运行已启动）
- 认证失败返回 `401`
- 无效负载返回 `400`
- 负载过大返回 `413````bash
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"text":"New email received","mode":"now"}'
```
bash
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'x-clawdbot-token: SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"message":"总结收件箱","name":"邮件","wakeMode":"下次心跳"}'

### 使用不同的模型

在代理的负载（或映射）中添加 `model` 以覆盖本次运行的模型：
bash
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'x-clawdbot-token: SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"message":"Summarize inbox","name":"Email","model":"openai/gpt-5.2-mini"}'``````
如果您强制使用 `agents.defaults.models`，请确保覆盖模型包含在其中。```bash
curl -X POST http://127.0.0.1:18789/hooks/gmail \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gmail","messages":[{"from":"Ada","subject":"Hello","snippet":"Hi"}]}'
```
## 安全

- 将 hook 端点置于环回地址（loopback）、内网（tailnet）或受信任的反向代理之后。
- 使用专用的 hook 令牌；不要复用网关的认证令牌。
- 避免在 webhook 日志中包含敏感的原始数据。