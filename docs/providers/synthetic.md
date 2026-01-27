---
summary: "Use Synthetic's Anthropic-compatible API in Clawdbot"
read_when:
  - You want to use Synthetic as a model provider
  - You need a Synthetic API key or base URL setup
---

# Synthetic

Synthetic 提供与 Anthropic 兼容的端点。Clawdbot 将其注册为 `synthetic` 供应商，并使用 Anthropic Messages API。

## 快速设置

1) 设置 `SYNTHETIC_API_KEY`（或运行下面的向导）。
2) 运行入门流程：
bash
clawdbot onboard --auth-choice synthetic-api-key
``````
默认模型已设置为：```
synthetic/hf:MiniMaxAI/MiniMax-M2.1
```
{
  env: { SYNTHETIC_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "synthetic/hf:MiniMaxAI/MiniMax-M2.1" },
      models: { "synthetic/hf:MiniMaxAI/MiniMax-M2.1": { alias: "MiniMax M2.1" } }
    }
  },
  models: {
    mode: "merge",
    providers: {
      synthetic: {
        baseUrl: "https://api.synthetic.new/anthropic",
        apiKey: "${SYNTHETIC_API_KEY}",
        api: "anthropic-messages",
        models: [
          {
            id: "hf:MiniMaxAI/MiniMax-M2.1",
            name: "MiniMax M2.1",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 192000,
            maxTokens: 65536
          }
        ]
      }
    }
  }
}```
注意：Clawdbot 的 Anthropic 客户端会在基础 URL 后添加 `/v1`，因此请使用 `https://api.synthetic.new/anthropic`（而不是 `/anthropic/v1`）。如果 Synthetic 更改了其基础 URL，请覆盖 `models.providers.synthetic.baseUrl`。

## 模型目录

以下所有模型的费用均为 `0`（输入/输出/缓存）。

| 模型 ID | 上下文窗口 | 最大标记数 | 推理 | 输入 |
| --- | --- | --- | --- | --- |
| `hf:MiniMaxAI/MiniMax-M2.1` | 192000 | 65536 | false | 文本 |
| `hf:moonshotai/Kimi-K2-Thinking` | 256000 | 8192 | true | 文本 |
| `hf:zai-org/GLM-4.7` | 198000 | 128000 | false | 文本 |
| `hf:deepseek-ai/DeepSeek-R1-0528` | 128000 | 8192 | false | 文本 |
| `hf:deepseek-ai/DeepSeek-V3-0324` | 128000 | 8192 | false | 文本 |
| `hf:deepseek-ai/DeepSeek-V3.1` | 128000 | 8192 | false | 文本 |
| `hf:deepseek-ai/DeepSeek-V3.1-Terminus` | 128000 | 8192 | false | 文本 |
| `hf:deepseek-ai/DeepSeek-V3.2` | 159000 | 8192 | false | 文本 |
| `hf:meta-llama/Llama-3.3-70B-Instruct` | 128000 | 8192 | false | 文本 |
| `hf:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` | 524000 | 8192 | false | 文本 |
| `hf:moonshotai/Kimi-K2-Instruct-0905` | 256000 | 8192 | false | 文本 |
| `hf:openai/gpt-oss-120b` | 128000 | 8192 | false | 文本 |
| `hf:Qwen/Qwen3-235B-A22B-Instruct-2507` | 256000 | 8192 | false | 文本 |
| `hf:Qwen/Qwen3-Coder-480B-A35B-Instruct` | 256000 | 8192 | false | 文本 |
| `hf:Qwen/Qwen3-VL-235B-A22B-Instruct` | 250000 | 8192 | false | 文本 + 图像 |
| `hf:zai-org/GLM-4.5` | 128000 | 128000 | false | 文本 |
| `hf:zai-org/GLM-4.6` | 198000 | 128000 | false | 文本 |
| `hf:deepseek-ai/DeepSeek-V3` | 128000 | 8192 | false | 文本 |
| `hf:Qwen/Qwen3-235B-A22B-Thinking-2507` | 256000 | 8192 | true | 文本 |

## 注意事项

- 模型引用使用 `synthetic/<modelId>`。
- 如果启用了模型白名单（`agents.defaults.models`），请添加您计划使用的每一个模型。
- 有关提供方规则，请参阅 [模型提供方](/concepts/model-providers)。