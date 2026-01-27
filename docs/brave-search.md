---
summary: "Brave Search API setup for web_search"
read_when:
  - You want to use Brave Search for web_search
  - You need a BRAVE_API_KEY or plan details
---

# Brave Search API

Clawdbot 默认使用 Brave Search 作为 `web_search` 的提供者。

## 获取 API 密钥

1) 在 https://brave.com/search/api/ 创建一个 Brave Search API 账户。
2) 在仪表板中，选择 **Data for Search** 计划并生成 API 密钥。
3) 将密钥存储在配置文件中（推荐）或在 Gateway 环境中设置 `BRAVE_API_KEY`。```json5
{
  tools: {
    web: {
      search: {
        provider: "brave",
        apiKey: "BRAVE_API_KEY_HERE",
        maxResults: 5,
        timeoutSeconds: 30
      }
    }
  }
}
```
## 注意事项

- AI 计划的数据 **不** 兼容 `web_search`。
- Brave 提供免费层级以及付费计划；请查看 Brave API 门户以了解当前的限制。

有关完整的 `web_search` 配置，请参阅 [网络工具](/tools/web)。