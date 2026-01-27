---
summary: "Web search + fetch tools (Brave Search API, Perplexity direct/OpenRouter)"
read_when:
  - You want to enable web_search or web_fetch
  - You need Brave Search API key setup
  - You want to use Perplexity Sonar for web search
---

# 网络工具

Clawdbot 配备了两个轻量级网络工具：

- `web_search` — 通过 Brave Search API（默认）、Bocha Search（国内优化）或 Perplexity Sonar（直接或通过 OpenRouter）搜索网络。
- `web_fetch` — HTTP 获取 + 可读提取（HTML → markdown/文本）。

这些工具**不是**浏览器自动化工具。对于需要 JavaScript 或登录的网站，请使用 [浏览器工具](/tools/browser)。

## 工作原理

- `web_search` 调用您配置的提供者并返回结果。
  - **Brave**（默认）：返回结构化结果（标题、URL、摘要）。
  - **Perplexity**：返回由实时网络搜索生成的 AI 合成答案，并附有引用。
- 结果按查询缓存 15 分钟（可配置）。
- `web_fetch` 执行普通的 HTTP GET 请求并提取可读内容
  （HTML → markdown/文本）。它**不会**执行 JavaScript。
- `web_fetch` 默认是启用的（除非被显式禁用）。

## 选择搜索提供者

| 提供者 | 优点 | 缺点 | API 密钥 |
|----------|------|------|---------|
| **Brave**（默认） | 快速，结构化结果，免费套餐 | 传统搜索结果 | `BRAVE_API_KEY` |
| **Bocha** | 针对中国市场优化，提供国内结果 | 需要 Bocha API 账户 | `BOCHA_API_KEY` |
| **Perplexity** | AI 合成答案，带引用，实时 | 需要 Perplexity 或 OpenRouter 访问权限 | `OPENROUTER_API_KEY` 或 `PERPLEXITY_API_KEY` |

有关提供者特定的详细信息，请参见 [Brave Search 设置](/brave-search)、[Bocha Search 设置](/bocha-search) 和 [Perplexity Sonar](/perplexity)。
json5
{
  tools: {
    web: {
      search: {
        provider: "brave"  // 或 "perplexity"
      }
    }
  }
}
``````
示例：切换到 Perplexity Sonar（直接 API）：```json5
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
## 获取 Brave API 密钥

1) 在 https://brave.com/search/api/ 创建一个 Brave Search API 账户。
2) 在仪表板中，选择 **Data for Search** 计划（不要选择“Data for AI”），并生成一个 API 密钥。
3) 运行 `clawdbot configure --section web` 将密钥存储在配置中（推荐），或者在你的环境变量中设置 `BRAVE_API_KEY`。

Brave 提供了免费层级以及付费计划；请查看 Brave API 门户以了解当前的限制和定价。

### 推荐设置密钥的位置

**推荐方式：** 运行 `clawdbot configure --section web`。它会将密钥存储在 `~/.clawdbot/clawdbot.json` 中的 `tools.web.search.apiKey` 下。

**环境变量方式：** 在网关进程的环境变量中设置 `BRAVE_API_KEY`。对于网关安装，将其放在 `~/.clawdbot/.env` 文件中（或你的服务环境变量中）。参见 [环境变量](/help/faq#how-does-clawdbot-load-environment-variables)。

## 使用 Perplexity（直接使用或通过 OpenRouter）

Perplexity Sonar 模型内置了网络搜索功能，并返回带有引用的 AI 合成答案。你可以通过 OpenRouter 使用它们（无需信用卡 - 支持加密货币/预付费）。

### 获取 OpenRouter API 密钥

1) 在 https://openrouter.ai/ 创建一个账户。
2) 添加信用额度（支持加密货币、预付费或信用卡）。
3) 在你的账户设置中生成一个 API 密钥。

### 设置 Perplexity 搜索
json5
{
  tools: {
    web: {
      search: {
        enabled: true,
        provider: "perplexity",
        perplexity: {
          // API 密钥（如果已设置 OPENROUTER_API_KEY 或 PERPLEXITY_API_KEY，则为可选）
          apiKey: "sk-or-v1-...",
          // 基础 URL（如果省略，则使用 key-aware 默认值）
          baseUrl: "https://openrouter.ai/api/v1",
          // 模型（默认为 perplexity/sonar-pro）
          model: "perplexity/sonar-pro"
        }
      }
    }
  }
}
``````
**环境替代方案:** 在网关的环境变量中设置 `OPENROUTER_API_KEY` 或 `PERPLEXITY_API_KEY`。对于网关安装，将其放在 `~/.clawdbot/.env` 中。

如果未设置基础 URL，Clawdbot 会根据 API 密钥来源选择默认值：

- `PERPLEXITY_API_KEY` 或 `pplx-...` → `https://api.perplexity.ai`
- `OPENROUTER_API_KEY` 或 `sk-or-...` → `https://openrouter.ai/api/v1`
- 未知的密钥格式 → OpenRouter（安全回退）

### 可用的 Perplexity 模型

| 模型 | 描述 | 适用于 |
|-------|-------------|----------|
| `perplexity/sonar` | 快速问答并结合网络搜索 | 快速查询 |
| `perplexity/sonar-pro`（默认） | 多步骤推理并结合网络搜索 | 复杂问题 |
| `perplexity/sonar-reasoning-pro` | 思维链分析 | 深度研究 |

## web_search

使用您配置的提供者进行网络搜索。

### 要求

- `tools.web.search.enabled` 必须不是 `false`（默认：启用）
- 您所选提供者的 API 密钥：
  - **Brave**: `BRAVE_API_KEY` 或 `tools.web.search.apiKey`
  - **Perplexity**: `OPENROUTER_API_KEY`、`PERPLEXITY_API_KEY` 或 `tools.web.search.perplexity.apiKey````json5
{
  tools: {
    web: {
      search: {
        enabled: true,
        apiKey: "BRAVE_API_KEY_HERE", // optional if BRAVE_API_KEY is set
        maxResults: 5,
        timeoutSeconds: 30,
        cacheTtlMinutes: 15
      }
    }
  }
}
```
### 工具参数

- `query` (必填)
- `count` (1–10；默认值由配置决定)
- `country` (可选)：用于区域特定结果的两位国家代码（例如 "DE", "US", "ALL"）。如果省略，Brave 将选择其默认区域。
- `search_lang` (可选)：用于搜索结果的 ISO 语言代码（例如 "de", "en", "fr"）
- `ui_lang` (可选)：用于用户界面元素的 ISO 语言代码
- `freshness` (可选，仅限 Brave)：按发现时间过滤（`pd`、`pw`、`pm`、`py` 或 `YYYY-MM-DDtoYYYY-MM-DD`）

**示例：**
javascript
// 德国特定的搜索
await web_search({
  query: "TV online schauen",
  count: 10,
  country: "DE",
  search_lang: "de"
});

// 法语搜索，使用法语用户界面
await web_search({
  query: "actualités",
  country: "FR",
  search_lang: "fr",
  ui_lang: "fr"
});

// 最近的结果（过去一周）
await web_search({
  query: "TMBG interview",
  freshness: "pw"
});
``````
## web_fetch

获取 URL 并提取可读内容。

### 要求

- `tools.web.fetch.enabled` 必须不是 `false`（默认值：启用）
- 可选的 Firecrawl 回退：设置 `tools.web.fetch.firecrawl.apiKey` 或 `FIRECRAWL_API_KEY`。

### 配置```json5
{
  tools: {
    web: {
      fetch: {
        enabled: true,
        maxChars: 50000,
        timeoutSeconds: 30,
        cacheTtlMinutes: 15,
        maxRedirects: 3,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        readability: true,
        firecrawl: {
          enabled: true,
          apiKey: "FIRECRAWL_API_KEY_HERE", // optional if FIRECRAWL_API_KEY is set
          baseUrl: "https://api.firecrawl.dev",
          onlyMainContent: true,
          maxAgeMs: 86400000, // ms (1 day)
          timeoutSeconds: 60
        }
      }
    }
  }
}
```
### 工具参数

- `url` (必填项，仅支持 http/https)
- `extractMode` (`markdown` | `text`)
- `maxChars` (截断长页面)

注意事项：
- `web_fetch` 会首先使用 Readability（主内容提取），然后使用 Firecrawl（如果已配置）。如果两者都失败，工具将返回错误。
- Firecrawl 请求默认使用机器人绕过模式并缓存结果。
- `web_fetch` 默认发送 Chrome 类似的 User-Agent 和 `Accept-Language`；如需覆盖，请设置 `userAgent`。
- `web_fetch` 会阻止私有/内部的主机名，并重新检查重定向（可通过 `maxRedirects` 限制次数）。
- `web_fetch` 是尽力而为的内容提取；某些网站可能需要使用浏览器工具。
- 请参阅 [Firecrawl](/tools/firecrawl) 了解密钥设置和服务详情。
- 响应默认缓存 15 分钟，以减少重复获取。
- 如果您使用工具配置文件/允许列表，请添加 `web_search`/`web_fetch` 或 `group:web`。
- 如果缺少 Brave 密钥，`web_search` 将返回一个简短的设置提示并附带文档链接。