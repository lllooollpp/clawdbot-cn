---
summary: "Model provider overview with example configs + CLI flows"
read_when:
  - You need a provider-by-provider model setup reference
  - You want example configs or CLI onboarding commands for model providers
---

# 模型提供者

本页面介绍 **LLM/模型提供者**（不包括 WhatsApp/Telegram 等聊天渠道）。
关于模型选择规则，请参见 [/concepts/models](/concepts/models)。

## 快速规则

- 模型引用使用 `provider/model` 格式（例如：`opencode/claude-opus-4-5`）。
- 如果你设置了 `agents.defaults.models`，它将成为允许的模型列表。
- CLI 工具：`clawdbot onboard`、`clawdbot models list`、`clawdbot models set <provider/model>`。

## 内置提供者（pi-ai 目录）

Clawdbot 自带 pi‑ai 目录。这些提供者 **不需要** `models.providers` 配置；只需设置认证信息并选择一个模型即可。

### OpenAI

- 提供者：`openai`
- 认证：`OPENAI_API_KEY`
- 示例模型：`openai/gpt-5.2`
- CLI：`clawdbot onboard --auth-choice openai-api-key`
json5
{
  agents: { defaults: { model: { primary: "openai/gpt-5.2" } } }
}
`````````
### Anthropic

- 提供商: `anthropic`
- 认证: `ANTHROPIC_API_KEY` 或 `claude setup-token`
- 示例模型: `anthropic/claude-opus-4-5`
- 命令行界面: `clawdbot onboard --auth-choice token` (粘贴 setup-token) 或 `clawdbot models auth paste-token --provider anthropic````json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-5" } } }
}
```
### OpenAI 代码（Codex）

- 供应商: `openai-codex`
- 认证方式: OAuth 或 Codex CLI (`~/.codex/auth.json`)
- 示例模型: `openai-codex/gpt-5.2`
- 命令行工具: `clawdbot onboard --auth-choice openai-codex` 或 `codex-cli`
json5
{
  agents: { defaults: { model: { primary: "openai-codex/gpt-5.2" } } }
}``````
### OpenCode Zen

- 提供商: `opencode`
- 认证: `OPENCODE_API_KEY` (或 `OPENCODE_ZEN_API_KEY`)
- 示例模型: `opencode/claude-opus-4-5`
- 命令行界面: `clawdbot onboard --auth-choice opencode-zen````json5
{
  agents: { defaults: { model: { primary: "opencode/claude-opus-4-5" } } }
}
```
### Google Gemini (API 密钥)

- 供应商: `google`
- 认证: `GEMINI_API_KEY`
- 示例模型: `google/gemini-3-pro-preview`
- CLI: `clawdbot onboard --auth-choice gemini-api-key`

### Google Vertex / Antigravity / Gemini CLI

- 供应商: `google-vertex`, `google-antigravity`, `google-gemini-cli`
- 认证: Vertex 使用 gcloud ADC；Antigravity/Gemini CLI 使用各自的认证流程
- Antigravity OAuth 作为内置插件提供（`google-antigravity-auth`），默认是禁用的。
  - 启用: `clawdbot plugins enable google-antigravity-auth`
  - 登录: `clawdbot models auth login --provider google-antigravity --set-default`
- Gemini CLI OAuth 作为内置插件提供（`google-gemini-cli-auth`），默认是禁用的。
  - 启用: `clawdbot plugins enable google-gemini-cli-auth`
  - 登录: `clawdbot models auth login --provider google-gemini-cli --set-default`
  - 注意：你**不要**将客户端 ID 或密钥粘贴到 `clawdbot.json` 中。CLI 登录流程会在网关主机上将令牌存储在认证配置文件中。

### Z.AI (GLM)

- 供应商: `zai`
- 认证: `ZAI_API_KEY`
- 示例模型: `zai/glm-4.7`
- CLI: `clawdbot onboard --auth-choice zai-api-key`
  - 别名: `z.ai/*` 和 `z-ai/*` 会被归一化为 `zai/*`

### Vercel AI 网关

- 供应商: `vercel-ai-gateway`
- 认证: `AI_GATEWAY_API_KEY`
- 示例模型: `vercel-ai-gateway/anthropic/claude-opus-4.5`
- CLI: `clawdbot onboard --auth-choice ai-gateway-api-key`

### 其他内置供应商

- OpenRouter: `openrouter` (`OPENROUTER_API_KEY`)
- 示例模型: `openrouter/anthropic/claude-sonnet-4-5`
- xAI: `xai` (`XAI_API_KEY`)
- Groq: `groq` (`GROQ_API_KEY`)
- Cerebras: `cerebras` (`CEREBRAS_API_KEY`)
  - Cerebras 上的 GLM 模型使用 ID `zai-glm-4.7` 和 `zai-glm-4.6`。
  - OpenAI 兼容的基础 URL: `https://api.cerebras.ai/v1`。
- Mistral: `mistral` (`MISTRAL_API_KEY`)
- GitHub Copilot: `github-copilot` (`COPILOT_GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_TOKEN`)

## 通过 `models.providers` 添加的供应商（自定义/基础 URL）

使用 `models.providers`（或 `models.json`）来添加**自定义**的供应商或 OpenAI/Anthropic 兼容的代理。

### Moonshot AI (Kimi)

Moonshot 使用 OpenAI 兼容的端点，因此可以将其配置为自定义供应商：

- 供应商: `moonshot`
- 认证: `MOONSHOT_API_KEY`
- 示例模型: `moonshot/kimi-k2-0905-preview`
- Kimi K2 模型 ID:
  {/* moonshot-kimi-k2-model-refs:start */}
  - `moonshot/kimi-k2-0905-preview`
  - `moonshot/kimi-k2-turbo-preview`
  - `moonshot/kimi-k2-thinking`
  - `moonshot/kimi-k2-thinking-turbo`
  {/* moonshot-kimi-k2-model-refs:end */}
json5
{
  agents: {
    defaults: { model: { primary: "moonshot/kimi-k2-0905-preview" } }
  },
  models: {
    mode: "merge",
    providers: {
      moonshot: {
        baseUrl: "https://api.moonshot.ai/v1",
        apiKey: "${MOONSHOT_API_KEY}",
        api: "openai-completions",
        models: [{ id: "kimi-k2-0905-preview", name: "Kimi K2 0905 预览版" }]
      }
    }
  }
}
`````````
### Kimi Code

Kimi Code 使用专用的端点和密钥（与 Moonshot 不同）：

- 提供商：`kimi-code`
- 认证：`KIMICODE_API_KEY`
- 示例模型：`kimi-code/kimi-for-coding````json5
{
  env: { KIMICODE_API_KEY: "sk-..." },
  agents: {
    defaults: { model: { primary: "kimi-code/kimi-for-coding" } }
  },
  models: {
    mode: "merge",
    providers: {
      "kimi-code": {
        baseUrl: "https://api.kimi.com/coding/v1",
        apiKey: "${KIMICODE_API_KEY}",
        api: "openai-completions",
        models: [{ id: "kimi-for-coding", name: "Kimi For Coding" }]
      }
    }
  }
}
```
### Qwen OAuth（免费版）

Qwen 通过设备码流程为 Qwen Coder + Vision 提供 OAuth 访问权限。
启用内置插件，然后登录：
bash
clawdbot plugins enable qwen-portal-auth
clawdbot models auth login --provider qwen-portal --set-default``````
Model refs:
- `qwen-portal/coder-model`
- `qwen-portal/vision-model`

有关设置细节和注意事项，请参阅 [/providers/qwen](/providers/qwen)。

### Synthetic

Synthetic 在 `synthetic` 提供商后端提供了与 Anthropic 兼容的模型：

- 提供商：`synthetic`
- 认证：`SYNTHETIC_API_KEY`
- 示例模型：`synthetic/hf:MiniMaxAI/MiniMax-M2.1`
- CLI：`clawdbot onboard --auth-choice synthetic-api-key````json5
{
  agents: {
    defaults: { model: { primary: "synthetic/hf:MiniMaxAI/MiniMax-M2.1" } }
  },
  models: {
    mode: "merge",
    providers: {
      synthetic: {
        baseUrl: "https://api.synthetic.new/anthropic",
        apiKey: "${SYNTHETIC_API_KEY}",
        api: "anthropic-messages",
        models: [{ id: "hf:MiniMaxAI/MiniMax-M2.1", name: "MiniMax M2.1" }]
      }
    }
  }
}
```
### MiniMax

MiniMax 通过 `models.providers` 进行配置，因为它使用自定义端点：

- MiniMax（Anthropic 兼容）：`--auth-choice minimax-api`
- 认证：`MINIMAX_API_KEY`

有关设置细节、模型选项和配置片段，请参阅 [/providers/minimax](/providers/minimax)。

### Ollama

Ollama 是一个本地 LLM 运行时，提供 OpenAI 兼容的 API：

- 供应商：`ollama`
- 认证：无需提供（本地服务器）
- 示例模型：`ollama/llama3.3`
- 安装：https://ollama.ai
bash
# 安装 Ollama，然后拉取一个模型：
ollama pull llama3.3``````
```md
{
  agents: {
    defaults: { model: { primary: "ollama/llama3.3" } }
  }
}

当在本地运行时，Ollama 会自动被检测到，地址为 `http://127.0.0.1:11434/v1`。有关模型推荐和自定义配置，请参见 [/providers/ollama](/providers/ollama)。

### 本地代理（LM Studio、vLLM、LiteLLM 等）

示例（OpenAI 兼容）：```json5
{
  agents: {
    defaults: {
      model: { primary: "lmstudio/minimax-m2.1-gs32" },
      models: { "lmstudio/minimax-m2.1-gs32": { alias: "Minimax" } }
    }
  },
  models: {
    providers: {
      lmstudio: {
        baseUrl: "http://localhost:1234/v1",
        apiKey: "LMSTUDIO_KEY",
        api: "openai-completions",
        models: [
          {
            id: "minimax-m2.1-gs32",
            name: "MiniMax M2.1",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 200000,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
``````
注意事项：
- 对于自定义提供者，`reasoning`、`input`、`cost`、`contextWindow` 和 `maxTokens` 是可选的。
  当省略时，Clawdbot 默认使用：
  - `reasoning: false`
  - `input: ["text"]`
  - `cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }`
  - `contextWindow: 200000`
  - `maxTokens: 8192`
- 推荐：设置明确的值，以匹配你的代理/模型限制。

## CLI 示例
bash
clawdbot onboard --auth-choice opencode-zen
clawdbot models set opencode/claude-opus-4-5
clawdbot models list
``````
另请参阅：[/gateway/configuration](/gateway/configuration) 以获取完整的配置示例。