---
summary: "Use Venice AI privacy-focused models in Clawdbot"
read_when:
  - You want privacy-focused inference in Clawdbot
  - You want Venice AI setup guidance
---

# Venice AI（Venius 亮点）

**Venius** 是我们为隐私优先的推理设计的威尼斯设置，可选择通过匿名代理访问专有模型。

Venice AI 提供注重隐私的 AI 推理，支持无审查的模型，并通过其匿名代理访问主要专有模型。所有推理默认都是私有的——**不会对您的数据进行训练，也不会进行日志记录**。

## 为什么在 Clawdbot 中使用 Venice

- **私有推理**：用于开源模型（无日志记录）。
- **无审查模型**：当您需要时可以使用。
- **匿名访问**：当质量很重要时，可以匿名访问专有模型（Opus/GPT/Gemini）。
- OpenAI 兼容的 `/v1` 端点。

## 隐私模式

Venice 提供两种隐私级别——理解这一点对于选择您的模型至关重要：

| 模式 | 描述 | 模型 |
|------|-------------|--------|
| **私有** | 完全私有。提示/响应 **永远不会存储或记录**。短暂的。 | Llama、Qwen、DeepSeek、Venice 无审查等 |
| **匿名** | 通过 Venice 代理，去除元数据。底层提供者（OpenAI、Anthropic）看到的是匿名请求。 | Claude、GPT-5.2、Gemini、Grok、Kimi、MiniMax |

## 特性

- **注重隐私**：在“私有”（完全私有）和“匿名”（代理）模式之间选择
- **无审查模型**：可以访问没有内容限制的模型
- **主要模型访问**：通过 Venice 的匿名代理使用 Claude、GPT-5.2、Gemini、Grok
- **OpenAI 兼容 API**：标准的 `/v1` 端点，便于集成
- **流式传输**：✅ 所有模型均支持
- **函数调用**：✅ 部分模型支持（请检查模型功能）
- **视觉支持**：✅ 支持具有视觉能力的模型
- **无硬性速率限制**：极端使用情况下可能会有公平使用限流
bash
export VENICE_API_KEY="vapi_xxxxxxxxxxxx"
``````
**选项 B：交互式设置（推荐）**```bash
clawdbot onboard --auth-choice venice-api-key
```
这将：
1. 提示您输入 API 密钥（或使用现有的 `VENICE_API_KEY`）
2. 显示所有可用的 Venice 模型
3. 让您选择默认模型
4. 自动配置提供者

**选项 C：非交互式**
bash
clawdbot onboard --non-interactive \
  --auth-choice venice-api-key \
  --venice-api-key "vapi_xxxxxxxxxxxx"
``````
### 3. 验证设置```bash
clawdbot chat --model venice/llama-3.3-70b "Hello, are you working?"
```
## 模型选择

设置完成后，Clawdbot 会显示所有可用的 Venice 模型。根据您的需求进行选择：

- **默认（我们的推荐）**：`venice/llama-3.3-70b`，适用于私有且性能均衡的场景。
- **最佳整体质量**：`venice/claude-opus-45`，适用于复杂任务（Opus 仍然是最强的）。
- **隐私**：选择“私有”模型以实现完全私有的推理。
- **能力**：选择“匿名化”模型，通过 Venice 的代理访问 Claude、GPT、Gemini 等模型。

您可以随时更改默认模型：
bash
clawdbot models set venice/claude-opus-45
clawdbot models set venice/llama-3.3-70b```
列出所有可用的模型：```bash
clawdbot models list | grep venice
```
## 通过 `clawdbot configure` 进行配置

1. 运行 `clawdbot configure`
2. 选择 **Model/auth**
3. 选择 **Venice AI**

## 我应该使用哪个模型？

| 使用场景 | 推荐模型 | 原因 |
|----------|-------------------|-----|
| **通用聊天** | `llama-3.3-70b` | 适用广泛，完全私有 |
| **整体质量最佳** | `claude-opus-45` | Opus 仍然是处理复杂任务的最强模型 |
| **隐私 + Claude 质量** | `claude-opus-45` | 通过匿名代理实现最佳推理能力 |
| **代码编写** | `qwen3-coder-480b-a35b-instruct` | 代码优化，支持 262k 上下文 |
| **视觉任务** | `qwen3-vl-235b-a22b` | 最佳的私有视觉模型 |
| **无审查** | `venice-uncensored` | 无内容限制 |
| **快速 + 便宜** | `qwen3-4b` | 轻量级，仍具备能力 |
| **复杂推理** | `deepseek-v3.2` | 强大的推理能力，私有 |

## 可用模型（共 25 个）

### 私有模型（15 个）—— 完全私有，无日志记录

| 模型 ID | 名称 | 上下文（tokens） | 特性 |
|----------|------|------------------|----------|
| `llama-3.3-70b` | Llama 3.3 70B | 131k | 通用 |
| `llama-3.2-3b` | Llama 3.2 3B | 131k | 快速、轻量 |
| `hermes-3-llama-3.1-405b` | Hermes 3 Llama 3.1 405B | 131k | 复杂任务 |
| `qwen3-235b-a22b-thinking-2507` | Qwen3 235B Thinking | 131k | 推理 |
| `qwen3-235b-a22b-instruct-2507` | Qwen3 235B Instruct | 131k | 通用 |
| `qwen3-coder-480b-a35b-instruct` | Qwen3 Coder 480B | 262k | 代码 |
| `qwen3-next-80b` | Qwen3 Next 80B | 262k | 通用 |
| `qwen3-vl-235b-a22b` | Qwen3 VL 235B | 262k | 视觉 |
| `qwen3-4b` | Venice Small（Qwen3 4B） | 32k | 快速、推理 |
| `deepseek-v3.2` | DeepSeek V3.2 | 163k | 推理 |
| `venice-uncensored` | Venice Uncensored | 32k | 无审查 |
| `mistral-31-24b` | Venice Medium（Mistral） | 131k | 视觉 |
| `google-gemma-3-27b-it` | Gemma 3 27B Instruct | 202k | 视觉 |
| `openai-gpt-oss-120b` | OpenAI GPT OSS 120B | 131k | 通用 |
| `zai-org-glm-4.7` | GLM 4.7 | 202k | 推理、多语言 |

### 匿名模型（10 个）—— 通过 Venice 代理

| 模型 ID | 原始模型 | 上下文（tokens） | 特性 |
|----------|----------|------------------|----------|
| `claude-opus-45` | Claude Opus 4.5 | 202k | 推理、视觉 |
| `claude-sonnet-45` | Claude Sonnet 4.5 | 202k | 推理、视觉 |
| `openai-gpt-52` | GPT-5.2 | 262k | 推理 |
| `openai-gpt-52-codex` | GPT-5.2 Codex | 262k | 推理、视觉 |
| `gemini-3-pro-preview` | Gemini 3 Pro | 202k | 推理、视觉 |
| `gemini-3-flash-preview` | Gemini 3 Flash | 262k | 推理、视觉 |
| `grok-41-fast` | Grok 4.1 Fast | 262k | 推理、视觉 |
| `grok-code-fast-1` | Grok Code Fast 1 | 262k | 推理、代码 |
| `kimi-k2-thinking` | Kimi K2 Thinking | 262k | 推理 |
| `minimax-m21` | MiniMax M2.1 | 202k | 推理 |

"/models" 端点是公开的（列出模型不需要身份验证），但进行推理需要有效的 API 密钥。

## 流式传输与工具支持

| 功能 | 支持情况 |
|------|----------|
| **流式传输** | ✅ 所有模型 |
| **函数调用** | ✅ 大多数模型（请在 API 中检查 `supportsFunctionCalling`） |
| **视觉/图像** | ✅ 标有 "Vision" 功能的模型 |
| **JSON 模式** | ✅ 通过 `response_format` 支持 |

## 定价

Venice 使用信用积分系统。请查看 [venice.ai/pricing](https://venice.ai/pricing) 了解当前费率：

- **私有模型**：通常成本较低
- **匿名模型**：与直接 API 定价类似 + 小额 Venice 费用

## 对比：Venice 与 直接 API

| 方面 | Venice（匿名） | 直接 API |
|------|----------------|----------|
| **隐私** | 元数据被剥离并匿名化 | 与您的账户相关联 |
| **延迟** | +10-50ms（通过代理） | 直接连接 |
| **功能** | 支持大部分功能 | 支持全部功能 |
| **计费** | Venice 信用积分 | 提供商计费 |
bash
# 使用默认私有模型
clawdbot chat --model venice/llama-3.3-70b

# 通过 Venice 使用 Claude（匿名）
clawdbot chat --model venice/claude-opus-45
```

# 使用无审查模型
clawdbot chat --model venice/venice-uncensored

# 使用带图像功能的视觉模型
clawdbot chat --model venice/qwen3-vl-235b-a22b

# 使用代码模型
clawdbot chat --model venice/qwen3-coder-480b-a35b-instruct```
## 故障排除

### API 密钥未被识别```bash
echo $VENICE_API_KEY
clawdbot models list | grep venice
```
确保密钥以 `vapi_` 开头。

### 模型不可用

Venice 模型库是动态更新的。运行 `clawdbot models list` 可查看当前可用的模型。某些模型可能暂时离线。

### 连接问题

Venice API 地址为 `https://api.venice.ai/api/v1`。请确保您的网络允许 HTTPS 连接。

## 配置文件示例
json5
{
  env: { VENICE_API_KEY: "vapi_..." },
  agents: { defaults: { model: { primary: "venice/llama-3.3-70b" } } },
  models: {
    mode: "merge",
    providers: {
      venice: {
        baseUrl: "https://api.venice.ai/api/v1",
        apiKey: "${VENICE_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "llama-3.3-70b",
            name: "Llama 3.3 70B",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 131072,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
``````
## 链接

- [Venice AI](https://venice.ai)
- [API 文档](https://docs.venice.ai)
- [价格](https://venice.ai/pricing)
- [状态](https://status.venice.ai)