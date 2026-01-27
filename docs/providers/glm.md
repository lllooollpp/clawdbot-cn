---
summary: "GLM model family overview + how to use it in Clawdbot"
read_when:
  - You want GLM models in Clawdbot
  - You need the model naming convention and setup
---

# GLM 模型

GLM 是一种 **模型系列**（不是一家公司），可通过 Z.AI 平台使用。在 Clawdbot 中，GLM 模型通过 `zai` 提供商和模型 ID 如 `zai/glm-4.7` 进行访问。

## CLI 设置
bash
clawdbot onboard --auth-choice zai-api-key
``````
## 配置片段```json5
{
  env: { ZAI_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "zai/glm-4.7" } } }
}
```
## 注意事项

- GLM 的版本和可用性可能会发生变化；请查看 Z.AI 的文档以获取最新信息。
- 示例模型 ID 包括 `glm-4.7` 和 `glm-4.6`。
- 有关提供方的详细信息，请参阅 [/providers/zai](/providers/zai)。