---
summary: "Perplexity Sonar setup for web_search"
read_when:
  - You want to use Perplexity Sonar for web search
  - You need PERPLEXITY_API_KEY or OpenRouter setup
---

# Perplexity Sonar

Clawdbot 可以使用 Perplexity Sonar 作为 `web_search` 工具。您可以通过 Perplexity 的直接 API 连接，也可以通过 OpenRouter 连接。

## API 选项

### Perplexity（直接）

- 基础 URL：https://api.perplexity.ai
- 环境变量：`PERPLEXITY_API_KEY`

### OpenRouter（替代方案）

- 基础 URL：https://openrouter.ai/api/v1
- 环境变量：`OPENROUTER_API_KEY`
- 支持预付/加密货币积分。```json5
{
  tools: {
    web: {
      search: {
        provider: "perplexity",
        perplexity: {
          apiKey: "pplx-...",
          baseUrl: "https://api.perplexity.ai",
          model: "perplexity/sonar-pro"
        }
      }
    }
  }
}
```
## 从 Brave 切换```json5
{
  tools: {
    web: {
      search: {
        provider: "perplexity",
        perplexity: {
          apiKey: "pplx-...",
          baseUrl: "https://api.perplexity.ai"
        }
      }
    }
  }
}
```
如果同时设置了 `PERPLEXITY_API_KEY` 和 `OPENROUTER_API_KEY`，请设置 `tools.web.search.perplexity.baseUrl`（或 `tools.web.search.perplexity.apiKey`）以消除歧义。

如果没有设置基础 URL，Clawdbot 会根据 API 密钥来源选择一个默认值：

- `PERPLEXITY_API_KEY` 或 `pplx-...` → 直接使用 Perplexity (`https://api.perplexity.ai`)
- `OPENROUTER_API_KEY` 或 `sk-or-...` → 使用 OpenRouter (`https://openrouter.ai/api/v1`)
- 未知的密钥格式 → 使用 OpenRouter（安全回退）

## 模型

- `perplexity/sonar` — 快速问答 + 网络搜索
- `perplexity/sonar-pro`（默认） — 多步骤推理 + 网络搜索
- `perplexity/sonar-reasoning-pro` — 深度研究

有关完整的 `web_search` 配置，请参见 [Web 工具](/tools/web)。