---
summary: "Model providers (LLMs) supported by Clawdbot"
read_when:
  - You want to choose a model provider
  - You want quick setup examples for LLM auth + model selection
---

# 模型提供者

Clawdbot 可以使用许多 LLM 提供者。选择一个，进行认证，然后将默认模型设置为 `provider/model`。

## 亮点：Venius（Venice AI）

Venius 是我们推荐的 Venice AI 设置，专注于隐私优先的推理，并可以选择使用 Opus 处理最困难的任务。

- 默认模型：`venice/llama-3.3-70b`
- 总体最佳模型：`venice/claude-opus-45`（Opus 仍然是最强的）

有关更多信息，请参阅 [Venice AI](/providers/venice)。

## 快速开始（两步）

1) 与提供者进行认证（通常通过 `clawdbot onboard`）。
2) 设置默认模型：
json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-5" } } }
}
``````
## 支持的提供者（基础集合）

- [OpenAI（API + Codex）](/providers/openai)
- [Anthropic（API + Claude Code CLI）](/providers/anthropic)
- [OpenRouter](/providers/openrouter)
- [Vercel AI Gateway](/providers/vercel-ai-gateway)
- [Moonshot AI（Kimi + Kimi Code）](/providers/moonshot)
- [Synthetic](/providers/synthetic)
- [OpenCode Zen](/providers/opencode)
- [Z.AI](/providers/zai)
- [GLM 模型](/providers/glm)
- [MiniMax](/providers/minimax)
- [Venius（Venice AI）](/providers/venice)
- [Amazon Bedrock](/bedrock)

有关完整的提供者目录（xAI、Groq、Mistral 等）和高级配置，
请参见 [模型提供者](/concepts/model-providers)。