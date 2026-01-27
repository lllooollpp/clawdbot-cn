---
title: "Vercel AI Gateway"
summary: "Vercel AI Gateway setup (auth + model selection)"
read_when:
  - You want to use Vercel AI Gateway with Clawdbot
  - You need the API key env var or CLI auth choice
---

# Vercel AI 网关

[Vercel AI 网关](https://vercel.com/ai-gateway) 通过单一端点提供统一的 API，用于访问数百种模型。

- 供应商: `vercel-ai-gateway`
- 认证: `AI_GATEWAY_API_KEY`
- API: 兼容 Anthropic 消息

## 快速开始

1) 设置 API 密钥（推荐：为网关存储它）:
bash
clawdbot onboard --auth-choice ai-gateway-api-key
``````
2) 设置默认模型：```json5
{
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4.5" }
    }
  }
}
```
## 非交互式示例
bash
clawdbot onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY"
``````
## 环境说明

如果网关以守护进程（launchd/systemd）方式运行，请确保该进程可以访问 `AI_GATEWAY_API_KEY`（例如，放在 `~/.clawdbot/.env` 中，或通过 `env.shellEnv` 提供）。