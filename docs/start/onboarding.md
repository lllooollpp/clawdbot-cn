---
summary: "First-run onboarding flow for Clawdbot (macOS app)"
read_when:
  - Designing the macOS onboarding assistant
  - Implementing auth or identity setup
---

# 注册流程（macOS 应用）

本文档描述了**当前**的首次运行注册流程。目标是提供一个流畅的“第一天”体验：选择 Gateway 的运行位置，连接认证，运行设置向导，并让代理程序自动启动。

## 当前页面顺序

1) 欢迎页面 + 安全提示  
2) **Gateway 选择**（本地 / 远程 / 稍后配置）  
3) **认证（Anthropic OAuth）** —— 仅限本地  
4) **设置向导**（由 Gateway 驱动）  
5) **权限**（TCC 提示）  
6) **CLI**（可选）  
7) **注册聊天**（专用会话）  
8) 准备就绪  

## 1) 本地 vs 远程

**Gateway** 在哪里运行？

- **本地（本台 Mac）**：注册流程可以运行 OAuth 流程，并在本地写入凭据。  
- **远程（通过 SSH/Tailnet）**：注册流程**不会**在本地运行 OAuth；凭据必须存在于 gateway 主机上。  
- **稍后配置**：跳过设置，保持应用未配置状态。

Gateway 认证提示：
- 现在向导即使在 loopback 情况下也会生成一个 **token**，因此本地 WS 客户端必须进行认证。  
- 如果你禁用认证，任何本地进程都可以连接；仅在完全可信的机器上使用此选项。  
- 使用 **token** 来实现多机器访问或非 loopback 绑定。

## 2) 本地专用认证（Anthropic OAuth）

macOS 应用支持 Anthropic OAuth（Claude Pro/Max）。流程如下：

- 打开浏览器进行 OAuth（PKCE）  
- 询问用户粘贴 `code#state` 值  
- 将凭据写入 `~/.clawdbot/credentials/oauth.json`  

其他提供者（如 OpenAI、自定义 API）目前通过环境变量或配置文件进行配置。

## 3) 设置向导（由 Gateway 驱动）

应用可以运行与 CLI 相同的设置向导。这可以确保注册流程与 Gateway 端的行为保持一致，并避免在 SwiftUI 中重复逻辑。

## 4) 权限

注册流程请求以下 TCC 权限：

- 通知  
- 可访问性  
- 屏幕录制  
- 麦克风 / 语音识别  
- 自动化（AppleScript）  

## 5) CLI（可选）

应用可以通过 npm/pnpm 安装全局的 `clawdbot` CLI，这样终端工作流和 launchd 任务就可以开箱即用。

## 6) 注册聊天（专用会话）

设置完成后，应用会打开一个专用的注册聊天会话，以便代理程序可以自我介绍并引导下一步操作。这将首次运行的指导与你的正常对话区分开来。

## 代理程序启动流程

在第一次运行代理程序时，Clawdbot 会自动创建一个工作区（默认为 `~/clawd`）：

- 填充 `AGENTS.md`、`BOOTSTRAP.md`、`IDENTITY.md`、`USER.md`  
- 运行简短的问答流程（一次一个问题）  
- 将身份信息和偏好写入 `IDENTITY.md`、`USER.md`、`SOUL.md`  
- 完成后删除 `BOOTSTRAP.md`，确保仅运行一次
bash
clawdbot webhooks gmail setup --account you@gmail.com```
详见 [/automation/gmail-pubsub](/automation/gmail-pubsub)。

## 远程模式注意事项

当网关运行在另一台机器上时，凭证和工作区文件位于**该主机**上。如果需要在远程模式下使用OAuth，请在网关主机上创建：

- `~/.clawdbot/credentials/oauth.json`
- `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`