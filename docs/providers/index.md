---
summary: "Model providers (LLMs) supported by Clawdbot"
read_when:
  - You want to choose a model provider
  - You need a quick overview of supported LLM backends
---

# 模型提供者

Clawdbot 可以使用许多 LLM 提供者。选择一个提供者，进行身份验证，然后将默认模型设置为 `provider/model`。

需要查看聊天频道文档（WhatsApp/Telegram/Discord/Slack/Mattermost（插件）/等）？请参阅 [频道](/channels)。

## 亮点：Venius（Venice AI）

Venius 是我们推荐的 Venice AI 设置，专注于隐私优先的推理，并可选择使用 Opus 处理复杂任务。

- 默认模型：`venice/llama-3.3-70b`
- 总体最佳模型：`venice/claude-opus-45`（Opus 仍然是最强的）

请参阅 [Venice AI](/providers/venice)。
json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-5" } } }
}
``````
## 提供商文档

- [OpenAI (API + Codex)](/providers/openai)
- [Anthropic (API + Claude Code CLI)](/providers/anthropic)
- [Qwen (OAuth)](/providers/qwen)
- [OpenRouter](/providers/openrouter)
- [Vercel AI 网关](/providers/vercel-ai-gateway)
- [Moonshot AI (Kimi + Kimi Code)](/providers/moonshot)
- [OpenCode Zen](/providers/opencode)
- [Amazon Bedrock](/bedrock)
- [Z.AI](/providers/zai)
- [GLM 模型](/providers/glm)
- [智谱 AI (Zhipu AI)](/providers/zhipu)
- [MiniMax](/providers/minimax)
- [Venius (Venice AI，注重隐私)](/providers/venice)
- [Ollama (本地模型)](/providers/ollama)
- [火山引擎 (Volcengine)](/providers/volcengine)

## 语音转文字提供商

- [Deepgram (音频转文字)](/providers/deepgram)

## 社区工具

- [Claude Max API 代理](/providers/claude-max-api-proxy) - 将 Claude Max/Pro 订阅用作 OpenAI 兼容的 API 端点

有关完整的提供商目录（xAI、Groq、Mistral 等）和高级配置，请参阅 [模型提供商](/concepts/model-providers)。