---
summary: "Use Z.AI (GLM models) with Clawdbot"
read_when:
  - You want Z.AI / GLM models in Clawdbot
  - You need a simple ZAI_API_KEY setup
---

# Z.AI

Z.AI 是 **GLM** 模型的 API 平台。它为 GLM 提供了 REST API，并使用 API 密钥进行身份验证。请在 Z.AI 控制台中创建您的 API 密钥。Clawdbot 使用 `zai` 提供者，并需要一个 Z.AI 的 API 密钥。
bash
clawdbot onboard --auth-choice zai-api-key
# 或者非交互式方式
clawdbot onboard --zai-api-key "$ZAI_API_KEY"
``````
## 配置片段```json5
{
  env: { ZAI_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "zai/glm-4.7" } } }
}
```
## 说明

- GLM 模型可通过 `zai/<model>` 提供（例如：`zai/glm-4.7`）。
- 有关模型系列的概述，请参见 [/providers/glm](/providers/glm)。
- Z.AI 使用 Bearer 认证，并需要您的 API 密钥。