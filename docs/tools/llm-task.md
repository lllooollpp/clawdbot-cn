---
summary: "JSON-only LLM tasks for workflows (optional plugin tool)"
read_when:
  - You want a JSON-only LLM step inside workflows
  - You need schema-validated LLM output for automation
---

# LLM 任务

`llm-task` 是一个 **可选的插件工具**，用于运行仅包含 JSON 的 LLM 任务，并返回结构化的输出（可根据 JSON Schema 进行可选验证）。

这对于工作流引擎（如 Lobster）非常理想：你可以在每个工作流中添加一个 LLM 步骤，而无需为每个工作流编写自定义的 Clawdbot 代码。

## 启用插件

1) 启用插件：
json
{
  "plugins": {
    "entries": {
      "llm-task": { "enabled": true }
    }
  }
}
``````
2) 将工具加入白名单（它已使用 `optional: true` 注册）：```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": { "allow": ["llm-task"] }
      }
    ]
  }
}
```
## 配置（可选）
json
{
  "plugins": {
    "entries": {
      "llm-task": {
        "enabled": true,
        "config": {
          "defaultProvider": "openai-codex",
          "defaultModel": "gpt-5.2",
          "defaultAuthProfileId": "main",
          "allowedModels": ["openai-codex/gpt-5.2"],
          "maxTokens": 800,
          "timeoutMs": 30000
        }
      }
    }
  }
}
``````
`allowedModels` 是一个 `provider/model` 字符串的白名单。如果设置了该参数，则白名单之外的任何请求都会被拒绝。

## 工具参数

- `prompt` (字符串，必填)
- `input` (任意类型，可选)
- `schema` (对象，可选 JSON Schema)
- `provider` (字符串，可选)
- `model` (字符串，可选)
- `authProfileId` (字符串，可选)
- `temperature` (数字，可选)
- `maxTokens` (数字，可选)
- `timeoutMs` (数字，可选)

## 输出

返回 `details.json`，其中包含解析后的 JSON（当提供 `schema` 时会进行验证）。

## 示例：Lobster 工作流步骤```lobster
clawd.invoke --tool llm-task --action json --args-json '{
  "prompt": "Given the input email, return intent and draft.",
  "input": {
    "subject": "Hello",
    "body": "Can you help?"
  },
  "schema": {
    "type": "object",
    "properties": {
      "intent": { "type": "string" },
      "draft": { "type": "string" }
    },
    "required": ["intent", "draft"],
    "additionalProperties": false
  }
}'
```
## 安全注意事项

- 该工具仅支持 **JSON** 输出，并指示模型仅输出 JSON（不包括代码块，不包括注释）。
- 此次运行中未向模型暴露任何工具。
- 除非通过 `schema` 进行验证，否则应将输出视为不可信。
- 在执行任何有副作用的操作（如发送、提交、执行）之前，请先获得批准。