---
summary: "Use OpenCode Zen (curated models) with Clawdbot"
read_when:
  - You want OpenCode Zen for model access
  - You want a curated list of coding-friendly models
---

# OpenCode Zen

OpenCode Zen 是 **由 OpenCode 团队推荐的模型列表**，适用于代码代理。
它是一个可选的、托管的模型访问路径，使用 API 密钥和 `opencode` 提供商。
Zen 目前处于测试阶段（Beta）。

## CLI 设置
bash
clawdbot onboard --auth-choice opencode-zen
# 或者非交互式方式
clawdbot onboard --opencode-zen-api-key "$OPENCODE_API_KEY"
``````
## 配置片段```json5
{
  env: { OPENCODE_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "opencode/claude-opus-4-5" } } }
}
```
## 说明

- 同样支持 `OPENCODE_ZEN_API_KEY`。
- 您需要登录 Zen，添加账单信息，并复制您的 API 密钥。
- OpenCode Zen 按请求计费；请查看 OpenCode 仪表板以获取详细信息。