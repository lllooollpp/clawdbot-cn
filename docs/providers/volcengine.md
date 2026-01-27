````markdown
---
summary: "Configure Volcengine (火山引擎) as a model provider"
read_when:
  - You want to use Volcengine Ark (火山方舟) models
  - You need to configure API keys and automated model discovery
---

# Volcengine (火山引擎)

Clawdbot supports Volcengine's Ark (火山方舟) API for both model inference and automated model discovery (Dify-style).

## Authentication

1. Obtain an API Key from the [火山引擎控制台](https://console.volcengine.com/ark).
2. Set the environment variable:
   ```bash
"export VOLCENGINE_API_KEY="这里填写你的API密钥"

 或在 `clawdbot.json` 中进行配置：
```   ```json5
{
  "models": {
    "providers": {
      "volcengine": {
        "apiKey": "您的API密钥在此处"
      }
    }
  }
}   ```

## Model Discovery (Automated)

Instead of manually entering each endpoint ID, you can use the **“Fetch Models” (获取模型列表)** button in the Clawdbot UI:

1. Open the Clawdbot configuration page.
2. Navigate to **Models -> Providers -> volcengine**.
3. Ensure your `apiKey` is entered.
4. Click the **“获取模型列表” (Fetch Models)** button.

Clawdbot will query the Volcengine API and automatically populate the `models` list with your available inference endpoints.

## Manual Configuration

If you prefer to define models manually, use the following format:

```json5
{
  "models": {
    "providers": {
      "volcengine": {
        "baseUrl": "https://ark.cn-beijing.volces.com/api/v3",
        "apiKey": "your_api_key_here",
        "api": "openai-completions",
        "models": [
          {
            "id": "ep-20230101-xxxx", // 您的端点ID
            "name": "DeepSeek-V3",
            "reasoning": false,
            "input": ["text"],
            "contextWindow": 128000,
            "maxTokens": 4096
          }
        ]
      }
    }
  }
}

## 支持的模型

Volcengine 提供了多种模型的访问，包括：
- **DeepSeek V3 / R1**
- **Doubao (豆包)** 系列
- **Llama 3**（微调版）

标记为 "R1" 或在元数据中包含 "reasoner" 的模型会在 Clawdbot 中自动标记为 `reasoning: true`。

## 相关内容

- [模型提供者](/providers) - 所有支持的后端概述
- [配置](/gateway/configuration) - 完整参考````