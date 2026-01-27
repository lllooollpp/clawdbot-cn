---
summary: "Use OpenAI via API keys or Codex subscription in Clawdbot"
read_when:
  - You want to use OpenAI models in Clawdbot
  - You want Codex subscription auth instead of API keys
---

# OpenAI

OpenAI 为 GPT 模型提供了开发者 API。Codex 支持 **ChatGPT 登录** 以获得订阅访问权限，或 **API 密钥** 登录以获得按使用量计费的访问权限。Codex 云服务需要 ChatGPT 登录，而 Codex CLI 支持任一登录方式。Codex CLI 会将登录信息缓存到 `~/.codex/auth.json`（或你的操作系统凭证存储器）中，Clawdbot 可以重复使用这些信息。

## 选项 A：OpenAI API 密钥（OpenAI 平台）

**适用于：** 直接 API 访问和按使用量计费。
从 OpenAI 仪表板获取你的 API 密钥。

### CLI 设置
bash
clawdbot onboard --auth-choice openai-api-key
# 或非交互模式
clawdbot onboard --openai-api-key "$OPENAI_API_KEY"
``````
### 配置片段```json5
{
  env: { OPENAI_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "openai/gpt-5.2" } } }
}
```
## 选项 B：OpenAI Code（Codex）订阅

**适用对象:** 使用 ChatGPT/Codex 订阅访问权限，而不是 API 密钥。
Codex 云服务需要登录 ChatGPT，而 Codex CLI 支持通过 ChatGPT 或 API 密钥进行登录。

Clawdbot 可以复用你的 **Codex CLI** 登录信息 (`~/.codex/auth.json`)，或者运行 OAuth 流程。

### CLI 设置
bash
# 复用已有的 Codex CLI 登录信息
clawdbot onboard --auth-choice codex-cli

# 或者在向导中运行 Codex OAuth
clawdbot onboard --auth-choice openai-codex
``````
### 配置片段```json5
{
  agents: { defaults: { model: { primary: "openai-codex/gpt-5.2" } } }
}
```
## 注意事项

- 模型引用始终使用 `provider/model`（参见 [/concepts/models](/concepts/models)）。
- 认证详情和复用规则请参见 [/concepts/oauth](/concepts/oauth)。