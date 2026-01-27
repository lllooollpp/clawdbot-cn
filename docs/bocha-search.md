````markdown
---
summary: "Bocha Search (博查搜索) API setup for web_search"
read_when:
  - You want to use Bocha Search for domestic (China) optimized web search
  - You need a BOCHA_API_KEY
---

# Bocha Search (博查搜索)

Bocha Search is a search provider optimized for the Chinese market, providing high-quality results for domestic queries.

## Get an API key

1. Register at [Bocha AI](https://open.bochaai.com/).
2. Create an API Key in the developer dashboard.
3. Store the key in your environment or configuration.

## Config example

Set the environment variable:
```bash
export BOCHA_API_KEY="your_api_key_here"
```

Or configure in `clawdbot.json`:

```json5
{
  "tools": {
    "web": {
      "search": {
        "provider": "bocha",
        "apiKey": "your_api_key_here",
        "maxResults": 8,
        "timeoutSeconds": 30
      }
    }
  }
}
```

## Options

- **provider**: Set to `"bocha"`.
- **apiKey**: Your Bocha API key.
- **maxResults**: Number of search results to return (default: 8).
- **timeoutSeconds**: Request timeout (default: 30).

See [Web tools](/tools/web) for more details on search integration.
````