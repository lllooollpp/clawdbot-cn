---
summary: "Configure Volcengine (火山引擎) as a model provider"
read_when:
  - You want to use Volcengine Ark (火山方舟) models
  - You need to configure API keys and automated model discovery
---

# 火山引擎 (Volcengine)

Clawdbot 支持通过火山引擎的 **火山方舟 (Ark)** API 使用多种模型，包括 DeepSeek、豆包 (Doubao) 等。它支持自动模型发现和标准的 OpenAI 格式。

## 认证 (Authentication)

1. 从 [火山引擎控制台](https://console.volcengine.com/ark) 获取 API Key。
2. 设置环境变量：
   ```bash
   export VOLCENGINE_API_KEY="您的API密钥"
   ```

   或者在 `clawdbot.json` 中配置：
   ```json5
   {
     "models": {
       "providers": {
         "volcengine": {
           "apiKey": "您的API密钥"
         }
       }
     }
   }
   ```

## 模型发现 (Automated Discovery)

Clawdbot 支持自动获取您的推理接入点（Endpoint）列表：

1. 打开 Clawdbot 控制面板。
2. 前往 **Models -> Providers -> volcengine**。
3. 填入 `apiKey`。
4. 点击 **获取模型列表 (Fetch Models)** 按钮。

网关会自动查询火山引擎 API 并填充可用模型列表。

## 手动配置 (Manual Configuration)

如果您希望手动定义模型，请使用以下格式：

```json5
{
  "models": {
    "providers": {
      "volcengine": {
        "baseUrl": "https://ark.cn-beijing.volces.com/api/v3",
        "apiKey": "您的API密钥",
        "api": "openai-completions",
        "models": [
          {
            "id": "ep-20230101-xxxx", // 您的端点ID
            "name": "DeepSeek-V3",
            "reasoning": false,
            "input": ["text"],
            "contextWindow": 128000
          }
        ]
      }
    }
  }
}
```

## 支持的模型

火山引擎提供了多种模型的访问，包括：
- **DeepSeek V3 / R1**
- **Doubao (豆包)** 系列
- **Llama 3**（微调版）

标记为 "R1" 或在元数据中包含 "reasoner" 的模型会在 Clawdbot 中自动标记为 `reasoning: true`。

## 相关内容

- [模型提供者](/providers) - 所有支持的后端概述
- [配置](/gateway/configuration) - 完整参考
