---
summary: "Use Anthropic Claude via API keys or Claude Code CLI auth in Clawdbot"
read_when:
  - You want to use Anthropic models in Clawdbot
  - You want setup-token or Claude Code CLI auth instead of API keys
---

# Anthropic（Claude）

Anthropic 开发了 **Claude** 模型系列，并通过 API 提供访问权限。
在 Clawdbot 中，你可以使用 API 密钥进行身份验证，或者复用 **Claude Code CLI** 的凭证（setup-token 或 OAuth）。

## 选项 A：Anthropic API 密钥

**适用场景：** 标准 API 访问和按使用量计费。
请在 Anthropic 控制台中创建你的 API 密钥。

### CLI 设置
bash
clawdbot onboard
# 选择：Anthropic API key

# 或非交互式方式
clawdbot onboard --anthropic-api-key "$ANTHROPIC_API_KEY"
``````
### 配置片段```json5
{
  env: { ANTHROPIC_API_KEY: "sk-ant-..." },
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-5" } } }
}
```
## 提示缓存（Anthropic API）

Clawdbot **不会** 覆盖 Anthropic 的默认缓存 TTL，除非你设置了它。
这是 **仅限 API** 的功能；Claude Code CLI OAuth 会忽略 TTL 设置。

要为每个模型设置 TTL，请在模型的 `params` 中使用 `cacheControlTtl`：
json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-5": {
          params: { cacheControlTtl: "5m" } // 或 "1h"
        }
      }
    }
  }
}
``````
Clawdbot 包含了 `extended-cache-ttl-2025-04-11` 的 beta 标志，用于 Anthropic API 请求；如果你覆盖了提供者头信息，请保留它（参见 [/gateway/configuration](/gateway/configuration)）。

## 选项 B：Claude Code CLI（setup-token 或 OAuth）

**适合人群：** 使用你的 Claude 订阅或已有的 Claude Code CLI 登录。

### 如何获取 setup-token

setup-token 是由 **Claude Code CLI** 生成的，而不是 Anthropic 控制台。你可以在 **任何机器上** 运行它：```bash
claude setup-token
```
将令牌粘贴到 Clawdbot（向导：**Anthropic 令牌（粘贴 setup-token）**），或者在网关主机上运行它：
bash
clawdbot models auth setup-token --provider anthropic```
如果您在其他机器上生成了令牌，请粘贴它：```bash
clawdbot models auth paste-token --provider anthropic
```
### CLI 设置
bash
# 如果已登录，复用 Claude Code CLI 的 OAuth 凭据
clawdbot onboard --auth-choice claude-cli
``````
### 配置片段```json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-5" } } }
}
```
## 注意事项

- 使用 `claude setup-token` 生成 setup-token 并粘贴，或者在网关主机上运行 `clawdbot models auth setup-token`。
- 如果在 Claude 订阅中看到 “OAuth token refresh failed …”，请使用 setup-token 重新授权，或在网关主机上重新同步 Claude Code CLI 的 OAuth。详见 [/gateway/troubleshooting#oauth-token-refresh-failed-anthropic-claude-subscription](/gateway/troubleshooting#oauth-token-refresh-failed-anthropic-claude-subscription)。

- Clawdbot 会将 `auth.profiles["anthropic:claude-cli"].mode` 写入为 `"oauth"`，因此该配置文件会接受 OAuth 和 setup-token 凭证。旧版配置中使用 `"token"` 的会自动迁移到新格式。
- 认证详情和复用规则详见 [/concepts/oauth](/concepts/oauth)。

## 排错指南

**401 错误 / token 突然失效**
- Claude 订阅的认证可能会过期或被撤销。请重新运行 `claude setup-token` 并将其粘贴到 **网关主机** 上。
- 如果 Claude CLI 登录在另一台机器上，请在网关主机上运行 `clawdbot models auth paste-token --provider anthropic`。

**未找到提供者 "anthropic" 的 API 密钥**
- 认证是 **按代理** 的。新代理不会继承主代理的密钥。
- 请重新运行该代理的引导流程，或在网关主机上粘贴一个 setup-token / API 密钥，然后通过 `clawdbot models status` 进行验证。

**未找到配置文件 `anthropic:default` 或 `anthropic:claude-cli` 的凭证**
- 运行 `clawdbot models status` 查看当前使用的认证配置文件。
- 重新运行引导流程，或为该配置文件粘贴一个 setup-token / API 密钥。

**没有可用的认证配置文件（所有配置文件都在冷却中/不可用）**
- 运行 `clawdbot models status --json` 查看 `auth.unusableProfiles`。
- 添加另一个 Anthropic 配置文件，或等待冷却时间结束。

更多内容：[/gateway/troubleshooting](/gateway/troubleshooting) 和 [/help/faq](/help/faq)。