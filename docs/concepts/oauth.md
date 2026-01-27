---
summary: "OAuth in Clawdbot: token exchange, storage, CLI sync, and multi-account patterns"
read_when:
  - You want to understand Clawdbot OAuth end-to-end
  - You hit token invalidation / logout issues
  - You want to reuse Claude Code / Codex CLI OAuth tokens
  - You want multiple accounts or profile routing
---

# OAuth

Clawdbot 支持通过 OAuth 为提供方（尤其是 **Anthropic (Claude Pro/Max)** 和 **OpenAI Codex (ChatGPT OAuth)**）提供“订阅认证”功能。本页面将解释以下内容：

- OAuth **令牌交换** 的工作原理（PKCE）
- 令牌的 **存储位置**（以及原因）
- 如何 **复用外部 CLI 令牌**（Claude Code / Codex CLI）
- 如何处理 **多个账户**（配置文件 + 每会话覆盖）

Clawdbot 还支持自带 OAuth 或 API 密钥流程的 **提供方插件**。可以通过以下方式运行它们：
bash
clawdbot models auth login --provider <id>
`````````
## token sink（为什么存在）

OAuth 提供商通常在登录/刷新流程中生成一个新的 **刷新令牌**。一些提供方（或 OAuth 客户端）会在为同一用户/应用颁发新令牌时使旧的刷新令牌失效。

实际表现症状：
- 你通过 Clawdbot *和* 通过 Claude Code / Codex CLI 登录 → 其中一个会随机地“被登出”

为减少这种情况，Clawdbot 将 `auth-profiles.json` 视为一个 **token sink**：
- 运行时从 **一个地方** 读取凭证
- 我们可以 **同步** 从外部 CLI 获取的凭证，而不是进行第二次登录
- 我们可以保存多个配置文件，并以确定性方式路由它们

## 存储（token 存放的位置）

凭证是 **按代理存储** 的：

- 认证配置文件（OAuth + API 密钥）：`~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`
- 运行时缓存（自动管理；不要手动编辑）：`~/.clawdbot/agents/<agentId>/agent/auth.json`

仅用于导入的旧文件（仍然支持，但不是主要存储）：
- `~/.clawdbot/credentials/oauth.json`（在首次使用时会被导入到 `auth-profiles.json` 中）

以上所有路径都支持 `$CLAWDBOT_STATE_DIR`（状态目录覆盖）。完整说明：[/gateway/configuration](/gateway/configuration#auth-storage-oauth--api-keys)

## 重用 Claude Code / Codex CLI 的 OAuth token（推荐方式）

如果你已经在网关主机上通过外部 CLI 登录过，Clawdbot 可以直接复用这些 token，而无需启动新的 OAuth 流程：

- Claude Code: `anthropic:claude-cli`
  - macOS：Keychain 中的条目 "Claude Code-credentials"（选择“始终允许”以避免 launchd 提示）
  - Linux/Windows：`~/.claude/.credentials.json`
- Codex CLI：读取 `~/.codex/auth.json` → 配置文件 `openai-codex:codex-cli`

同步操作会在 Clawdbot 加载认证存储时发生（因此当 CLI 刷新 token 时，Clawdbot 的 token 也会保持同步）。
在 macOS 上，第一次读取可能会触发 Keychain 提示；如果网关以无头模式运行且无法访问该条目，可在终端中运行一次 `clawdbot models status`。```bash
clawdbot models status
clawdbot channels list
```
或者 JSON：
bash
clawdbot channels list --json```## OAuth 交换（如何登录）

Clawdbot 的交互式登录流程在 `@mariozechner/pi-ai` 中实现，并连接到向导/命令中。

### Anthropic（Claude Pro/Max）

流程形状（PKCE）：

1) 生成 PKCE 验证器/挑战
2) 打开 `https://claude.ai/oauth/authorize?...`
3) 用户粘贴 `code#state`
4) 在 `https://console.anthropic.com/v1/oauth/token` 进行交换
5) 将 `{ access, refresh, expires }` 存储在认证配置文件下

向导路径是 `clawdbot onboard` → 认证选择 `oauth`（Anthropic）。

### OpenAI Codex（ChatGPT OAuth）

流程形状（PKCE）：

1) 生成 PKCE 验证器/挑战 + 随机 `state`
2) 打开 `https://auth.openai.com/oauth/authorize?...`
3) 尝试在 `http://127.0.0.1:1455/auth/callback` 捕获回调
4) 如果无法绑定回调（或你处于远程/无头环境），请粘贴重定向 URL/code
5) 在 `https://auth.openai.com/oauth/token` 进行交换
6) 从访问令牌中提取 `accountId` 并存储 `{ access, refresh, expires, accountId }`

向导路径是 `clawdbot onboard` → 认证选择 `openai-codex`（或 `codex-cli` 以复用现有的 Codex CLI 登录）。

## 刷新 + 过期

配置文件中存储了 `expires` 时间戳。

在运行时：
- 如果 `expires` 在未来 → 使用存储的访问令牌
- 如果已过期 → 刷新（在文件锁下）并覆盖存储的凭据

刷新流程是自动的；你通常不需要手动管理令牌。

### 与 Claude Code 的双向同步

当 Clawdbot 刷新 Anthropic OAuth 令牌（配置文件 `anthropic:claude-cli`）时，它会**将新凭据写回** Claude Code 的存储中：

- **Linux/Windows**：更新 `~/.claude/.credentials.json`
- **macOS**：更新 Keychain 项 "Claude Code-credentials"

这确保了两个工具保持同步，且在另一个刷新后不会“被登出”。

**为什么这对长时间运行的代理很重要：**

Anthropic OAuth 令牌在几小时后会过期。如果没有双向同步：
1. Clawdbot 刷新令牌 → 获得新访问令牌
2. Claude Code 仍然使用旧令牌 → 被登出

有了双向同步，两个工具始终拥有最新的有效令牌，使得代理可以自主运行数天甚至数周，无需手动干预。

## 多账户（配置文件） + 路由

两种模式：

### 1) 推荐：使用独立的代理

如果你希望“个人”和“工作”账户从不交互，可以使用隔离的代理（独立的会话 + 凭据 + 工作区）：
bash
clawdbot agents add work
clawdbot agents add personal
``````
然后为每个代理配置身份验证（向导），并将聊天路由到正确的代理。

### 2）高级用法：一个代理中的多个配置文件

`auth-profiles.json` 支持为同一提供者设置多个配置文件 ID。

选择使用哪个配置文件：
- 全局通过配置顺序选择 (`auth.order`)
- 每个会话通过 `/model ...@<profileId>` 选择

示例（会话覆盖）：
- `/model Opus@anthropic:work`

如何查看存在的配置文件 ID：
- `clawdbot channels list --json`（显示 `auth[]`）

相关文档：
- [/concepts/model-failover](/concepts/model-failover)（轮换 + 冷却规则）
- [/tools/slash-commands](/tools/slash-commands)（命令界面）