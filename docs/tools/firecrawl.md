---
summary: "Firecrawl fallback for web_fetch (anti-bot + cached extraction)"
read_when:
  - You want Firecrawl-backed web extraction
  - You need a Firecrawl API key
  - You want anti-bot extraction for web_fetch
---

# Firecrawl

当 `web_fetch` 遇到问题时，Clawdbot 可以使用 **Firecrawl** 作为备用提取器。它是一个托管的内容提取服务，支持机器人绕过和缓存功能，这有助于处理 JavaScript 丰富的网站或阻止普通 HTTP 请求的页面。

## 获取 API 密钥

1) 创建 Firecrawl 账户并生成 API 密钥。
2) 将其存储在配置文件中，或在网关环境中设置 `FIRECRAWL_API_KEY`。

## 配置 Firecrawl
json5
{
  tools: {
    web: {
      fetch: {
        firecrawl: {
          apiKey: "FIRECRAWL_API_KEY_HERE",
          baseUrl: "https://api.firecrawl.dev",
          onlyMainContent: true,
          maxAgeMs: 172800000,
          timeoutSeconds: 60
        }
      }
    }
  }
}
``````
注意事项：
- 当存在 API 密钥时，`firecrawl.enabled` 默认为 true。
- `maxAgeMs` 控制缓存结果可以有多旧（单位：毫秒）。默认是 2 天。

## 隐蔽模式 / 机器人绕过

Firecrawl 提供了一个 **代理模式** 参数用于绕过机器人检测（`basic`、`stealth` 或 `auto`）。
Clawdbot 对 Firecrawl 请求始终使用 `proxy: "auto"` 加上 `storeInCache: true`。
如果未指定代理模式，Firecrawl 默认使用 `auto`。`auto` 在 basic 模式尝试失败后会使用 stealth 代理重试，这可能比仅使用 basic 模式消耗更多的积分。

## `web_fetch` 如何使用 Firecrawl

`web_fetch` 的提取顺序：
1) 可读性（本地）
2) Firecrawl（如果已配置）
3) 基本 HTML 清理（最后的备选方案）

有关完整的 web 工具设置，请参见 [Web 工具](/tools/web)。