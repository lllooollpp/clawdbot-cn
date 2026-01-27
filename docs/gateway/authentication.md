---
summary: "Model authentication: OAuth, API keys, and Claude Code token reuse"
read_when:
  - Debugging model auth or OAuth expiry
  - Documenting authentication or credential storage
---

# 认证

Clawdbot 支持 OAuth 和 API 密钥用于模型提供者。对于 Anthropic 账户，我们推荐使用 **API 密钥**。Clawdbot 也可以复用 Claude Code 的凭据，包括由 `claude setup-token` 创建的长期令牌。

有关完整的 OAuth 流程和存储结构，请参阅 [/concepts/oauth](/concepts/oauth)。

## 推荐的 Anthropic 设置（API 密钥）

如果你直接使用 Anthropic，请使用 API 密钥。

1) 在 Anthropic 控制台中创建一个 API 密钥。
2) 将其放置在 **网关主机**（运行 `clawdbot gateway` 的机器）上。
bash
export ANTHROPIC_API_KEY="..."
clawdbot models status``````
3) 如果 Gateway 在 systemd/launchd 下运行，请将密钥放在 `~/.clawdbot/.env` 中，以便守护进程可以读取它：```bash
cat >> ~/.clawdbot/.env <<'EOF'
ANTHROPIC_API_KEY=...
EOF
```
然后重启守护进程（或重启您的网关进程），并重新检查：
bash
clawdbot models status
clawdbot doctor``````
如果您不想自己管理环境变量，入门向导可以存储用于守护进程的API密钥：`clawdbot onboard`。

有关环境变量继承的详情，请参见[帮助](/help)（`env.shellEnv`、`~/.clawdbot/.env`、systemd/launchd）。

## Anthropic：Claude Code CLI 设置令牌（支持）

对于Anthropic，推荐的方式是使用**API密钥**。如果您已经在使用Claude Code CLI，也支持设置令牌流程。
请在**网关主机**上运行该流程：```bash
claude setup-token
```
然后验证并同步到 Clawdbot 中：
bash  
clawdbot models status  
clawdbot doctor

这应该会在代理的认证存储中创建（或刷新）一个类似 `anthropic:claude-cli` 的认证配置文件。

Clawdbot 配置将 `auth.profiles["anthropic:claude-cli"].mode` 设置为 `"oauth"`，因此该配置文件接受 OAuth 和 setup-token 凭据。在加载时，旧版使用 `"token"` 的配置会自动迁移。

如果你看到类似 Anthropic 的错误：


This credential is only authorized for use with Claude Code and cannot be used for other API requests.```
…使用 Anthropic 的 API 密钥代替。

替代方法：运行包装器（同时会更新 Clawdbot 配置）：
bash
clawdbot models auth setup-token --provider anthropic
``````
手动输入令牌（任何提供商；写入 `auth-profiles.json` + 更新配置）：
bash  
clawdbot models auth paste-token --provider anthropic  
clawdbot models auth paste-token --provider openrouter```
自动化友好的检查（过期/缺失时退出 `1`，即将过期时退出 `2`）：
bash
clawdbot models status --check```
可选的操作脚本（systemd/Termux）在此处有文档说明：
[/automation/auth-monitoring](/automation/auth-monitoring)

`clawdbot models status` 会将 Claude Code 的凭据加载到 Clawdbot 的
`auth-profiles.json` 中，并显示过期时间（默认在 24 小时内警告）。
`clawdbot doctor` 在运行时也会执行同步操作。

> `claude setup-token` 需要交互式 TTY。```bash
clawdbot models status
clawdbot doctor
```
## 控制使用哪个凭据

### 每个会话（聊天命令）

使用 `/model <别名或ID>@<profileId>` 为当前会话固定使用特定的提供者凭据（示例的 profile id：`anthropic:claude-cli`，`anthropic:default`）。

使用 `/model`（或 `/model list`）来选择一个简化的选项；使用 `/model status` 查看完整视图（包括候选凭据和下一个认证凭据，以及配置时的提供者端点信息）。

### 每个代理（CLI 覆盖）

为代理设置显式的认证凭据顺序覆盖（存储在该代理的 `auth-profiles.json` 中）：
bash
clawdbot models auth order get --provider anthropic
clawdbot models auth order set --provider anthropic anthropic:claude-cli
clawdbot models auth order clear --provider anthropic
`````````
使用 `--agent <id>` 来指定特定的代理；省略此参数将使用配置的默认代理。

## 同步工作原理

1. **Claude Code** 会将凭据存储在 `~/.claude/.credentials.json`（或 macOS 上的 Keychain）中。
2. **Clawdbot** 在加载认证存储时，会将这些凭据同步到 `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`。
3. 可刷新的 OAuth 凭据可以在使用时自动刷新。静态令牌凭据（包括 Claude Code CLI 的 setup-token）无法通过 Clawdbot 刷新。

## 故障排除

### “未找到凭据”

如果缺少 Anthropic 令牌配置文件，请在 **网关主机** 上运行 `claude setup-token`，然后重新检查：```bash
clawdbot models status
```
### Token 过期/已过期

运行 `clawdbot models status` 以确认哪个配置文件即将过期。如果配置文件是 `anthropic:claude-cli`，请重新运行 `claude setup-token`。

## 要求

- Claude Max 或 Pro 订阅（用于 `claude setup-token`）
- 已安装 Claude Code CLI（`claude` 命令可用）