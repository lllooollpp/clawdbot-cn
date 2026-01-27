# Clawdbot 开发与适配指南

## 1. 接入国内模型 (GLM / Qwen)

目前已在 `src/agents/models-config.providers.ts` 中集成了方案。

### 1.1 使用方法
1. **环境变量**: 在 `.env` 中设置 API Key：
   - 智谱 GLM: `ZHIPU_API_KEY`
   - 通义千问: `DASHSCOPE_API_KEY`
2. **测试**:
   运行 `pnpm dev models list` 检查模型是否已启用。

---

## 2. 接入飞书 (Feishu)

### 2.1 步骤
1. **定义 Schema**: 在 `src/channels/plugins/config-schema.ts` 中定义飞书配置。
2. **实现 Inbound**: 参考 `src/channels/plugins/onboarding/slack.ts` 实现飞书的 Webhook 回调。
3. **实现 Outbound**: 参考 `src/channels/plugins/outbound/slack.ts` 实现飞书消息发送。
4. **集成**: 在 `src/channels/plugins/index.ts` 中注册飞书。

---

## 3. 接入微信 (WeChat)

### 3.1 方案建议
由于微信私有协议的不稳定性，建议：
1. **Wechaty**: 创建 `extensions/wechaty`，将 Wechaty 封装为 Clawdbot 插件。
2. **企业微信**: 使用自建应用模式，流程同飞书。
