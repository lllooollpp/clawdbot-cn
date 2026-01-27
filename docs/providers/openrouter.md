---
summary: "Use OpenRouter's unified API to access many models in Clawdbot"
read_when:
  - You want a single API key for many LLMs
  - You want to run models via OpenRouter in Clawdbot
---

# OpenRouter

OpenRouter 提供了一个 **统一的 API**，通过一个端点和一个 API 密钥将请求路由到多个模型。它兼容 OpenAI，因此通过切换基础 URL，大多数 OpenAI SDK 都可以正常工作。

## CLI 设置
bash
clawdbot onboard --auth-choice apiKey --token-provider openrouter --token "$OPENROUTER_API_KEY"
``````
## 配置片段```json5
{
  env: { OPENROUTER_API_KEY: "sk-or-..." },
  agents: {
    defaults: {
      model: { primary: "openrouter/anthropic/claude-sonnet-4-5" }
    }
  }
}
```
## 注意事项

- 模型引用格式为 `openrouter/<提供商>/<模型>`.
- 如需了解更多模型/提供商选项，请参阅 [/concepts/model-providers](/concepts/model-providers)。
- OpenRouter 使用 Bearer 令牌和您的 API 密钥进行身份验证。