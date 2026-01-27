---
summary: "Plan: Add OpenResponses /v1/responses endpoint and deprecate chat completions cleanly"
owner: "clawdbot"
status: "draft"
last_updated: "2026-01-19"
---

# OpenResponses 网关集成计划

## 背景

Clawdbot 网关目前在 `/v1/chat/completions` 路径上提供了最小化的 OpenAI 兼容 Chat Completions 端点（参见 [OpenAI Chat Completions](/gateway/openai-http-api)）。

Open Responses 是一个基于 OpenAI Responses API 的开放推理标准。它专为代理工作流设计，并使用基于项目的输入以及语义流事件。OpenResponses 规范定义了 `/v1/responses`，而不是 `/v1/chat/completions`。

## 目标

- 添加一个符合 OpenResponses 语义的 `/v1/responses` 端点。
- 保留 Chat Completions 作为兼容层，易于禁用，并最终移除。
- 通过隔离且可重用的模式来标准化验证和解析。

## 非目标

- 在第一阶段实现完整的 OpenResponses 功能对等（如图像、文件、托管工具）。
- 替换内部代理执行逻辑或工具编排。
- 在第一阶段更改现有 `/v1/chat/completions` 的行为。

## 研究摘要

来源：OpenResponses OpenAPI、OpenResponses 规范网站以及 Hugging Face 的博客文章。

关键点提取如下：

- `POST /v1/responses` 接受 `CreateResponseBody` 字段，如 `model`、`input`（字符串或 `ItemParam[]`）、`instructions`、`tools`、`tool_choice`、`stream`、`max_output_tokens` 和 `max_tool_calls`。
- `ItemParam` 是一个区分联合（discriminated union），包括：
  - `message` 类型的条目，具有角色 `system`、`developer`、`user`、`assistant`
  - `function_call` 和 `function_call_output`
  - `reasoning`
  - `item_reference`
- 成功的响应返回一个 `ResponseResource`，包含 `object: "response"`、`status` 和 `output` 条目。
- 流式传输使用语义事件，例如：
  - `response.created`、`response.in_progress`、`response.completed`、`response.failed`
  - `response.output_item.added`、`response.output_item.done`
  - `response.content_part.added`、`response.content_part.done`
  - `response.output_text.delta`、`response.output_text.done`
- 规范要求：
  - `Content-Type: text/event-stream`
  - `event:` 必须与 JSON 的 `type` 字段匹配
  - 终止事件必须是字面量 `[DONE]`
- `reasoning` 条目可能暴露 `content`、`encrypted_content` 和 `summary`。
- HF 示例中包含 `OpenResponses-Version: latest` 请求头（可选）。

## 提议的架构

- 添加 `src/gateway/open-responses.schema.ts`，仅包含 Zod 模式（不包含网关导入）。
- 添加 `src/gateway/openresponses-http.ts`（或 `open-responses-http.ts`）用于 `/v1/responses`。
- 保持 `src/gateway/openai-http.ts` 完整，作为遗留兼容适配器。
- 添加配置 `gateway.http.endpoints.responses.enabled`（默认为 `false`）。
- 保持 `gateway.http.endpoints.chatCompletions.enabled` 独立；允许两个端点分别切换。
- 当 Chat Completions 被启用时，在启动时发出警告，以表明其为遗留状态。

- 保持严格的模块边界：响应和聊天完成之间不共享模式类型。
- 通过配置将聊天完成设为可选，以便在不修改代码的情况下禁用。
- 更新文档，一旦 `/v1/responses` 稳定，就将聊天完成标记为遗留功能。
- 可选的未来步骤：将聊天完成请求映射到响应处理程序，以简化移除路径。

## 第一阶段支持子集

- 接受 `input` 作为字符串或 `ItemParam[]`，包含消息角色和 `function_call_output`。
- 将系统消息和开发者消息提取到 `extraSystemPrompt` 中。
- 使用最近的 `user` 或 `function_call_output` 作为代理运行的当前消息。
- 对不支持的内容部分（如图片/文件）返回 `invalid_request_error`。
- 返回一个包含 `output_text` 内容的助手消息。
- 返回 `usage`，在令牌计数功能连接之前使用零值。

## 验证策略（无 SDK）

- 为以下支持的子集实现 Zod 模式：
  - `CreateResponseBody`
  - `ItemParam` + 消息内容部分的联合类型
  - `ResponseResource`
  - 网关使用的流事件结构
- 将模式保持在一个单独的、隔离的模块中，以避免模式漂移并便于未来的代码生成。

## 流式实现（第一阶段）

- 使用带有 `event:` 和 `data:` 的 SSE 行。
- 必需的序列（最小可行实现）：
  - `response.created`
  - `response.output_item.added`
  - `response.content_part.added`
  - `response.output_text.delta`（可根据需要重复）
  - `response.output_text.done`
  - `response.content_part.done`
  - `response.completed`
  - `[DONE]`

## 测试与验证计划

- 为 `/v1/responses` 添加端到端测试覆盖：
  - 需要认证
  - 非流式响应结构
  - 流事件顺序和 `[DONE]`
  - 通过请求头和 `user` 进行会话路由
- 保持 `src/gateway/openai-http.e2e.test.ts` 不变。
- 手动测试：使用 `curl` 向 `/v1/responses` 发送请求并设置 `stream: true`，验证事件顺序和最终的 `[DONE]`。

## 文档更新（后续工作）

- 为 `/v1/responses` 的使用和示例添加新的文档页面。
- 在 `/gateway/openai-http-api` 中更新内容，添加遗留说明并指向 `/v1/responses`。