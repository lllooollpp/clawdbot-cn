# Clawdbot Development and Adaptation Guide

## 1. Integrating Domestic Models (GLM / Qwen)

The solution has already been integrated in `src/agents/models-config.providers.ts`.

### 1.1 Usage Method
1. **Environment Variables**: Set the API Key in `.env`:
   - Zhipu GLM: `ZHIPU_API_KEY`
   - Qwen: `DASHSCOPE_API_KEY`
2. **Testing**:
   Run `pnpm dev models list` to check if the model is enabled.

---

## 2. Integrating Feishu (Feishu)

### 2.1 Steps
1. **Define Schema**: Define Feishu configuration in `src/channels/plugins/config-schema.ts`.
2. **Implement Inbound**: Refer to `src/channels/plugins/onboarding/slack.ts` to implement Feishu's Webhook callback.
3. **Implement Outbound**: Refer to `src/channels/plugins/outbound/slack.ts` to implement Feishu message sending.
4. **Integration**: Register Feishu in `src/channels/plugins/index.ts`.

---

## 3. Integrating WeChat (WeChat)

### 3.1 Recommended Approach
Due to the instability of WeChat's proprietary protocol, it is recommended to:
1. **Wechaty**: Create `extensions/wechaty` and encapsulate Wechaty as a Clawdbot plugin.
2. **WeCom (Enterprise WeChat)**: Use the self-built application mode, with the same process as Feishu.