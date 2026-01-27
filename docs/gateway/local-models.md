---
summary: "Run Clawdbot on local LLMs (LM Studio, vLLM, LiteLLM, custom OpenAI endpoints)"
read_when:
  - You want to serve models from your own GPU box
  - You are wiring LM Studio or an OpenAI-compatible proxy
  - You need the safest local model guidance
---

# 本地模型

在本地运行是可行的，但 Clawdbot 需要大上下文 + 强大的对抗提示注入的防御机制。小模型会截断上下文并泄露安全机制。目标要高：**至少 2 台满配的 Mac Studios 或等效的 GPU 设备（约 3 万美元以上）**。单台 **24 GB** 的 GPU 只能处理较轻的提示，并且会有更高的延迟。请使用你能够运行的**最大/全尺寸模型版本**；过度量化或“小”版本的检查点会增加提示注入的风险（参见 [安全](/gateway/security)）。

## 推荐：LM Studio + MiniMax M2.1（Responses API，全尺寸）

当前最佳的本地部署方案。在 LM Studio 中加载 MiniMax M2.1，启用本地服务器（默认为 `http://127.0.0.1:1234`），并使用 Responses API 将推理过程与最终文本分离。
json5
{
  agents: {
    defaults: {
      model: { primary: "lmstudio/minimax-m2.1-gs32" },
      models: {
        "anthropic/claude-opus-4-5": { alias: "Opus" },
        "lmstudio/minimax-m2.1-gs32": { alias: "Minimax" }
      }
    }
  },
  models: {
    mode: "merge",
    providers: {
      lmstudio: {
        baseUrl: "http://127.0.0.1:1234/v1",
        apiKey: "lmstudio",
        api: "openai-responses",
        models: [
          {
            id: "minimax-m2.1-gs32",
            name: "MiniMax M2.1 GS32",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 196608,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
``````
**设置检查清单**
- 安装 LM Studio: https://lmstudio.ai
- 在 LM Studio 中，下载 **可用的最大的 MiniMax M2.1 版本**（避免“小”/经过大量量化处理的版本），启动服务器，并确认 `http://127.0.0.1:1234/v1/models` 中列出了该模型。
- 保持模型常驻内存；冷加载会增加启动延迟。
- 如果你的 LM Studio 版本不同，请调整 `contextWindow`/`maxTokens`。
- 对于 WhatsApp，请使用 Responses API，这样只有最终文本会被发送。

即使在本地运行时，也请保持托管模型的配置；使用 `models.mode: "merge"` 以确保回退选项仍然可用。

### 混合配置：托管为主，本地回退```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-sonnet-4-5",
        fallbacks: ["lmstudio/minimax-m2.1-gs32", "anthropic/claude-opus-4-5"]
      },
      models: {
        "anthropic/claude-sonnet-4-5": { alias: "Sonnet" },
        "lmstudio/minimax-m2.1-gs32": { alias: "MiniMax Local" },
        "anthropic/claude-opus-4-5": { alias: "Opus" }
      }
    }
  },
  models: {
    mode: "merge",
    providers: {
      lmstudio: {
        baseUrl: "http://127.0.0.1:1234/v1",
        apiKey: "lmstudio",
        api: "openai-responses",
        models: [
          {
            id: "minimax-m2.1-gs32",
            name: "MiniMax M2.1 GS32",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 196608,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
```
### 本地优先，辅以托管安全网

交换主用和备用的顺序；保留相同的提供者块和 `models.mode: "merge"`，以便在本地服务器不可用时回退到 Sonnet 或 Opus。

### 区域托管 / 数据路由

- 在 OpenRouter 上也存在托管的 MiniMax/Kimi/GLM 变体，并且有地域绑定的端点（例如，美国托管的）。在那里选择地域版本，以确保流量在您选择的司法管辖区内部流动，同时仍可使用 `models.mode: "merge"` 进行 Anthropic/OpenAI 的回退。
- 仅本地托管仍然是最强的隐私路径；当您需要提供者功能但又希望控制数据流向时，托管区域路由则是一个折中方案。
json5
{
  models: {
    mode: "merge",
    providers: {
      local: {
        baseUrl: "http://127.0.0.1:8000/v1",
        apiKey: "sk-local",
        api: "openai-responses",
        models: [
          {
            id: "my-local-model",
            name: "Local Model",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 120000,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
``````
保持 `models.mode: "merge"`，以便托管模型作为备用选项仍然可用。

## 故障排除
- 网关可以访问代理吗？运行 `curl http://127.0.0.1:1234/v1/models`。
- LM Studio 中的模型是否已卸载？请重新加载；冷启动是常见的“卡住”原因。
- 上下文错误吗？降低 `contextWindow` 或提高服务器限制。
- 安全性：本地模型会跳过提供方的过滤器；请保持代理范围狭窄，并开启压缩功能，以限制提示注入的扩散范围。