---
summary: "Expose an OpenResponses-compatible /v1/responses HTTP endpoint from the Gateway"
read_when:
  - Integrating clients that speak the OpenResponses API
  - You want item-based inputs, client tool calls, or SSE events
---

# OpenResponses API（HTTP）

Clawdbot 的网关可以提供一个兼容 OpenResponses 的 `POST /v1/responses` 端点。

该端点默认是**禁用的**。请先在配置中启用它。

- `POST /v1/responses`
- 与网关相同的端口（WS + HTTP 复用）：`http://<gateway-host>:<port>/v1/responses`

在内部，请求会以正常的网关代理运行方式执行（与 `clawdbot agent` 使用相同的代码路径），因此路由/权限/配置会与你的网关保持一致。

## 认证

使用网关的认证配置。发送一个 Bearer 令牌：

- `Authorization: Bearer <token>`

注意事项：
- 当 `gateway.auth.mode="token"` 时，使用 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）。
- 当 `gateway.auth.mode="password"` 时，使用 `gateway.auth.password`（或 `CLAWDBOT_GATEWAY_PASSWORD`）。

## 选择代理

不需要自定义头部：在 OpenResponses 的 `model` 字段中编码代理 ID：

- `model: "clawdbot:<agentId>"`（例如：`"clawdbot:main"`，`"clawdbot:beta"`）
- `model: "agent:<agentId>"`（别名）

或通过头部指定特定的 Clawdbot 代理：

- `x-clawdbot-agent-id: <agentId>`（默认值：`main`）

进阶用法：
- 使用 `x-clawdbot-session-key: <sessionKey>` 来完全控制会话路由。
json5
{
  gateway: {
    http: {
      endpoints: {
        responses: { enabled: true }
      }
    }
  }
}
``````
## 禁用端点

将 `gateway.http.endpoints.responses.enabled` 设置为 `false`：```json5
{
  gateway: {
    http: {
      endpoints: {
        responses: { enabled: false }
      }
    }
  }
}
```
## 会话行为

默认情况下，端点是**无状态的**（每次请求都会生成一个新的会话密钥）。

如果请求中包含 OpenResponses 的 `user` 字符串，网关会根据它生成一个稳定的会话密钥，因此重复调用可以共享一个代理会话。

## 请求结构（支持的）

请求遵循 OpenResponses API 的基于项的输入方式。当前支持的内容如下：

- `input`: 字符串或项对象的数组。
- `instructions`: 合并到系统提示中。
- `tools`: 客户端工具定义（函数工具）。
- `tool_choice`: 过滤或要求客户端工具。
- `stream`: 启用 SSE 流式传输。
- `max_output_tokens`: 最佳努力的输出限制（与提供方有关）。
- `user`: 稳定的会话路由。

已接受但**目前被忽略**的字段包括：

- `max_tool_calls`
- `reasoning`
- `metadata`
- `store`
- `previous_response_id`
- `truncation`

## 项（输入）

### `message`
角色：`system`、`developer`、`user`、`assistant`。

- `system` 和 `developer` 会被追加到系统提示中。
- 最近的 `user` 或 `function_call_output` 项将成为“当前消息”。
- 更早的用户/助手消息会作为历史记录包含在内以提供上下文。
json
{
  "type": "function_call_output",
  "call_id": "call_123",
  "output": "{\"temperature\": \"72F\"}"
}
``````
### `reasoning` 和 `item_reference`

为了保持模式兼容性而接受，但在构建提示时会被忽略。

## 工具（客户端函数工具）

通过 `tools: [{ type: "function", function: { name, description?, parameters? } }]` 提供工具。

如果代理决定调用一个工具，响应将返回一个 `function_call` 输出项。
然后你需要发送一个后续请求，包含 `function_call_output` 以继续这一轮对话。```json
{
  "type": "input_image",
  "source": { "type": "url", "url": "https://example.com/image.png" }
}
```
允许的 MIME 类型（当前）：`image/jpeg`、`image/png`、`image/gif`、`image/webp`。  
最大大小（当前）：10MB。

## 文件（`input_file`）

支持 base64 或 URL 来源：
json
{
  "type": "input_file",
  "source": {
    "type": "base64",
    "media_type": "text/plain",
    "data": "SGVsbG8gV29ybGQh",
    "filename": "hello.txt"
  }
}
``````
允许的 MIME 类型（当前）：`text/plain`、`text/markdown`、`text/html`、`text/csv`、`application/json`、`application/pdf`。

最大文件大小（当前）：5MB。

当前行为：
- 文件内容会被解码并添加到 **系统提示** 中，而不是用户消息中，
  因此它是短暂的（不会保存在会话历史中）。
- PDF 文件会被解析以提取文本。如果发现的文本较少，会将前几页转换为图像并传递给模型。

PDF 解析使用的是 Node 友好的 `pdfjs-dist` 旧版构建（无 worker）。现代版的 PDF.js 需要浏览器 worker/DOM 全局变量，因此在 Gateway 中未被使用。

URL 获取默认设置：
- `files.allowUrl`: `true`
- `images.allowUrl`: `true`
- 请求受到保护（DNS 解析、私有 IP 阻止、重定向限制、超时设置）。

## 文件和图像限制（配置）

默认值可以在 `gateway.http.endpoints.responses` 下进行调整：```json5
{
  gateway: {
    http: {
      endpoints: {
        responses: {
          enabled: true,
          maxBodyBytes: 20000000,
          files: {
            allowUrl: true,
            allowedMimes: ["text/plain", "text/markdown", "text/html", "text/csv", "application/json", "application/pdf"],
            maxBytes: 5242880,
            maxChars: 200000,
            maxRedirects: 3,
            timeoutMs: 10000,
            pdf: {
              maxPages: 4,
              maxPixels: 4000000,
              minTextChars: 200
            }
          },
          images: {
            allowUrl: true,
            allowedMimes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
            maxBytes: 10485760,
            maxRedirects: 3,
            timeoutMs: 10000
          }
        }
      }
    }
  }
}
```
默认值（省略时）：
- `maxBodyBytes`: 20MB
- `files.maxBytes`: 5MB
- `files.maxChars`: 200k
- `files.maxRedirects`: 3
- `files.timeoutMs`: 10s
- `files.pdf.maxPages`: 4
- `files.pdf.maxPixels`: 4,000,000
- `files.pdf.minTextChars`: 200
- `images.maxBytes`: 10MB
- `images.maxRedirects`: 3
- `images.timeoutMs`: 10s

## 流式传输（SSE）

设置 `stream: true` 以接收服务器发送事件（SSE）：

- `Content-Type: text/event-stream`
- 每个事件行格式为 `event: <type>` 和 `data: <json>`
- 流结束时以 `data: [DONE]` 标识

当前发出的事件类型：
- `response.created`
- `response.in_progress`
- `response.output_item.added`
- `response.content_part.added`
- `response.output_text.delta`
- `response.output_text.done`
- `response.content_part.done`
- `response.output_item.done`
- `response.completed`
- `response.failed`（发生错误时）

## 使用情况

`usage` 会在底层提供者报告 token 数量时被填充。

## 错误

错误使用如下类似的 JSON 对象表示：
json
{
  "error": {
    "message": "错误信息",
    "type": "错误类型",
    "param": "参数",
    "code": "错误代码"
  }
}
`````````json
{ "error": { "message": "...", "type": "invalid_request_error" } }
```
常见错误代码：
- `401` 缺失或无效的认证信息
- `400` 无效的请求体
- `405` 方法错误

## 示例

非流式传输：
bash
curl -sS http://127.0.0.1:18789/v1/responses \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-clawdbot-agent-id: main' \
  -d '{
    "model": "clawdbot",
    "input": "hi"
  }'
``````
流媒体：```bash
curl -N http://127.0.0.1:18789/v1/responses \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-clawdbot-agent-id: main' \
  -d '{
    "model": "clawdbot",
    "stream": true,
    "input": "hi"
  }'
```
