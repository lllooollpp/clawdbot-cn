---
summary: "macOS app flow for controlling a remote Clawdbot gateway over SSH"
read_when:
  - Setting up or debugging remote mac control
---

# 远程 Clawdbot（macOS ⇄ 远程主机）

此流程允许 macOS 应用程序作为另一台主机（桌面/服务器）上运行的 Clawdbot 网关的完整远程控制工具。这是应用程序的 **通过 SSH 的远程运行**（远程执行）功能。所有功能——健康检查、语音唤醒转发、Web 聊天——都将复用 *设置 → 常规* 中的相同远程 SSH 配置。

## 模式

- **本地（本台 Mac）**：所有内容都在笔记本电脑上运行。不涉及 SSH。
- **通过 SSH 的远程（默认）**：Clawdbot 命令在远程主机上执行。macOS 应用程序会通过 `-o BatchMode` 以及您选择的身份/密钥和本地端口转发建立 SSH 连接。
- **直接远程（ws/wss）**：不使用 SSH 隧道。macOS 应用程序直接连接到网关 URL（例如，通过 Tailscale Serve 或公共 HTTPS 反向代理）。

## 远程传输方式

远程模式支持两种传输方式：
- **SSH 隧道（默认）**：使用 `ssh -N -L ...` 将网关端口转发到 localhost。由于隧道是回环的，网关将看到节点的 IP 为 `127.0.0.1`。
- **直接（ws/wss）**：直接连接到网关 URL。网关将看到真实的客户端 IP。

## 远程主机的前置条件

1) 安装 Node + pnpm 并构建/安装 Clawdbot CLI（`pnpm install && pnpm build && pnpm link --global`）。
2) 确保 `clawdbot` 在非交互式 shell 中位于 PATH 中（如需要，可将其链接到 `/usr/local/bin` 或 `/opt/homebrew/bin`）。
3) 开启 SSH 密钥认证。我们推荐使用 **Tailscale** 的 IP 地址以实现离网的稳定可达性。

## macOS 应用设置

1) 打开 *设置 → 常规*。
2) 在 **Clawdbot 运行** 下选择 **通过 SSH 的远程**，并设置：
   - **传输方式**：**SSH 隧道** 或 **直接（ws/wss）**。
   - **SSH 目标**：`user@host`（可选 `:port`）。
     - 如果网关在同一局域网内并通过 Bonjour 广播，可以从发现列表中选择它，以自动填充此字段。
   - **网关 URL**（仅直接方式）：`wss://gateway.example.ts.net`（或 `ws://...` 用于本地/局域网）。
   - **身份文件**（高级设置）：您的密钥路径。
   - **项目根目录**（高级设置）：远程代码仓库路径，用于执行命令。
   - **CLI 路径**（高级设置）：可选的 `clawdbot` 可执行文件/入口路径（当网关广播时会自动填充）。
3) 点击 **测试远程**。成功表示远程 `clawdbot status --json` 能正常运行。失败通常意味着 PATH 或 CLI 的问题；退出码 127 表示远程未找到 CLI。
4) 健康检查和 Web 聊天现在将通过此 SSH 隧道自动运行。

## Web 聊天

- **SSH 隧道**：Web 聊天通过转发的 WebSocket 控制端口（默认 18789）连接到网关。
- **直接（ws/wss）**：Web 聊天直接连接到配置的网关 URL。
- 现在不再需要单独的 WebChat HTTP 服务器。

## 权限

- 远程主机需要与本地相同的 TCC 批准（自动化、辅助功能、屏幕录制、麦克风、语音识别、通知）。在该机器上运行引导流程以一次性授予这些权限。
- 节点通过 `node.list` / `node.describe` 广播其权限状态，以便代理知道哪些功能可用。

## 安全注意事项
- 在远程主机上优先使用环回绑定（loopback bind），并通过 SSH 或 Tailscale 连接。
- 如果将网关绑定到非环回接口，请启用令牌/密码认证。
- 请参阅 [安全](/gateway/security) 和 [Tailscale](/gateway/tailscale)。

## WhatsApp 登录流程（远程）
- 在 **远程主机** 上运行 `clawdbot channels login --verbose`。使用手机上的 WhatsApp 扫描二维码。
- 如果认证过期，请在该主机上重新运行登录。健康检查将显示连接问题。

## 故障排除
- **exit 127 / 未找到**：`clawdbot` 在非登录 shell 中未在 PATH 中。请将其添加到 `/etc/paths`、你的 shell rc 文件中，或创建符号链接到 `/usr/local/bin` 或 `/opt/homebrew/bin`。
- **健康检查失败**：检查 SSH 可达性、PATH 环境变量以及 Baileys 是否已登录（使用 `clawdbot status --json` 检查）。
- **网页聊天卡住**：确认网关在远程主机上运行，并且转发的端口与网关的 WS 端口一致；UI 需要健康的 WS 连接。
- **Node IP 显示为 127.0.0.1**：这是使用 SSH 隧道时的正常现象。如果你想让网关看到真实的客户端 IP，请切换 **传输方式** 为 **直接（ws/wss）**。
- **语音唤醒**：在远程模式下，触发短语会自动转发；不需要单独的转发器。

## 通知声音
可以通过脚本使用 `clawdbot` 和 `node.invoke` 为每条通知选择声音，例如：
bash
clawdbot nodes notify --node <id> --title "Ping" --body "Remote gateway ready" --sound Glass
``````
```md
"The app no longer has a global 'default sound' switch; each time a request is made, the caller can choose a sound (or choose none)."