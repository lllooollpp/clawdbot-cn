---
summary: "Sign in to GitHub Copilot from Clawdbot using the device flow"
read_when:
  - You want to use GitHub Copilot as a model provider
  - You need the `clawdbot models auth login-github-copilot` flow
---

# GitHub Copilot

## 什么是 GitHub Copilot？

GitHub Copilot 是 GitHub 的 AI 编程助手。它为您的 GitHub 账户和计划提供对 Copilot 模型的访问权限。Clawdbot 可以通过两种不同的方式使用 Copilot 作为模型提供者。

## Clawdbot 中使用 Copilot 的两种方式

### 1) 内置的 GitHub Copilot 提供者 (`github-copilot`)

通过原生的设备登录流程获取 GitHub 令牌，然后在 Clawdbot 运行时将其交换为 Copilot API 令牌。这是**默认**且最简单的路径，因为它不需要 VS Code。

### 2) Copilot 代理插件 (`copilot-proxy`)

使用 **Copilot Proxy** VS Code 扩展作为本地桥梁。Clawdbot 与代理的 `/v1` 端点进行通信，并使用您在该处配置的模型列表。如果您已经在 VS Code 中运行 Copilot Proxy 或需要通过它进行路由，请选择此方式。您必须启用该插件并保持 VS Code 扩展在运行状态。

使用 GitHub Copilot 作为模型提供者 (`github-copilot`)。登录命令会运行 GitHub 设备流程，保存认证配置文件，并更新您的配置以使用该配置文件。
bash
clawdbot models auth login-github-copilot
``````
您将被提示访问一个网址并输入一次性验证码。请保持终端打开直到操作完成。

### 可选标志```bash
clawdbot models auth login-github-copilot --profile-id github-copilot:work
clawdbot models auth login-github-copilot --yes
```
## 设置默认模型
bash
clawdbot models set github-copilot/gpt-4o
``````
### 配置片段```json5
{
  agents: { defaults: { model: { primary: "github-copilot/gpt-4o" } } }
}
```
## 注意事项

- 需要交互式 TTY；请直接在终端中运行。
- Copilot 模型的可用性取决于您的计划；如果某个模型被拒绝，请尝试另一个 ID（例如 `github-copilot/gpt-4.1`）。
- 登录时会将 GitHub 令牌存储在身份验证配置文件存储中，并在 Clawdbot 运行时将其兑换为 Copilot API 令牌。