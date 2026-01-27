---
summary: "Configure Moonshot K2 vs Kimi Code (separate providers + keys)"
read_when:
  - You want Moonshot K2 (Moonshot Open Platform) vs Kimi Code setup
  - You need to understand separate endpoints, keys, and model refs
  - You want copy/paste config for either provider
---

# Moonshot AI（Kimi）

Moonshot 提供了与 OpenAI 兼容的 Kimi API 接口。可以配置提供者并将默认模型设置为 `moonshot/kimi-k2-0905-preview`，或者使用 Kimi Code 的 `kimi-code/kimi-for-coding`。

当前 Kimi K2 模型 ID：
{/* moonshot-kimi-k2-ids:start */}
- `kimi-k2-0905-preview`
- `kimi-k2-turbo-preview`
- `kimi-k2-thinking`
- `kimi-k2-thinking-turbo`
{/* moonshot-kimi-k2-ids:end */}
bash
clawdbot onboard --auth-choice moonshot-api-key
``````
Kimi Code:```bash
clawdbot onboard --auth-choice kimi-code-api-key
```
注意：Moonshot 和 Kimi Code 是不同的提供方。它们的密钥不能互换，端点不同，模型引用也不同（Moonshot 使用 `moonshot/...`，Kimi Code 使用 `kimi-code/...`）。
json5
{
  env: { MOONSHOT_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "moonshot/kimi-k2-0905-preview" },
      models: {
        // moonshot-kimi-k2-aliases:start
        "moonshot/kimi-k2-0905-preview": { alias: "Kimi K2" },
        "moonshot/kimi-k2-turbo-preview": { alias: "Kimi K2 Turbo" },
        "moonshot/kimi-k2-thinking": { alias: "Kimi K2 Thinking" },
        "moonshot/kimi-k2-thinking-turbo": { alias: "Kimi K2 Thinking Turbo" }
        // moonshot-kimi-k2-aliases:end
      }
    }
  },
  models: {
    mode: "merge",
    providers: {
      moonshot: {
        baseUrl: "https://api.moonshot.ai/v1",
        apiKey: "${MOONSHOT_API_KEY}",
        api: "openai-completions",
        models: [
          // moonshot-kimi-k2-models:start
          {
            id: "kimi-k2-0905-preview",
            name: "Kimi K2 0905 Preview",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 256000,
            maxTokens: 8192
          },
          {
            id: "kimi-k2-turbo-preview",
            name: "Kimi K2 Turbo",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 256000,
            maxTokens: 8192
          },
          {
            id: "kimi-k2-thinking",
            name: "Kimi K2 Thinking",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 256000,
            maxTokens: 8192
          },
          {
            id: "kimi-k2-thinking-turbo",
            name: "Kimi K2 Thinking Turbo",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 256000,
            maxTokens: 8192
          }
          // moonshot-kimi-k2-models:end
        ]
      }
    }
  }
}
``````
## Kimi Code```json5
{
  env: { KIMICODE_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "kimi-code/kimi-for-coding" },
      models: {
        "kimi-code/kimi-for-coding": { alias: "Kimi Code" }
      }
    }
  },
  models: {
    mode: "merge",
    providers: {
      "kimi-code": {
        baseUrl: "https://api.kimi.com/coding/v1",
        apiKey: "${KIMICODE_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "kimi-for-coding",
            name: "Kimi For Coding",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 262144,
            maxTokens: 32768,
            headers: { "User-Agent": "KimiCLI/0.77" },
            compat: { supportsDeveloperRole: false }
          }
        ]
      }
    }
  }
}
```
## 注意事项

- Moonshot 模型引用使用 `moonshot/<modelId>`。Kimi Code 模型引用使用 `kimi-code/<modelId>`。
- 如需，可以在 `models.providers` 中覆盖定价和上下文元数据。
- 如果 Moonshot 为某个模型发布了不同的上下文限制，请相应调整 `contextWindow`。
- 如需使用中国端点，请使用 `https://api.moonshot.cn/v1`。