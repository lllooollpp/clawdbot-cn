---
summary: "Gateway runtime on macOS (external launchd service)"
read_when:
  - Packaging Clawdbot.app
  - Debugging the macOS gateway launchd service
  - Installing the gateway CLI for macOS
---

# macOS 网关（外部 launchd）

Clawdbot.app 现在不再捆绑 Node/Bun 或网关运行时。macOS 应用程序期望安装一个 **外部** 的 `clawdbot` 命令行工具，并不会作为子进程启动网关，而是通过管理每个用户的 launchd 服务来保持网关运行（或者如果本地已有运行的网关，则会连接到现有的本地网关）。

## 安装 CLI（本地模式所需）

你需要在 Mac 上安装 Node 22+，然后全局安装 `clawdbot`：
bash
npm install -g clawdbot@<version>
``````
macOS 应用的 **Install CLI** 按钮通过 npm/pnpm 运行相同的流程（不推荐在 Gateway 运行时使用 bun）。

## Launchd（Gateway 作为 LaunchAgent）

Label:
- `com.clawdbot.gateway`（或 `com.clawdbot.<profile>`）

Plist 路径（用户级）：
- `~/Library/LaunchAgents/com.clawdbot.gateway.plist`
 （或 `~/Library/LaunchAgents/com.clawdbot.<profile>.plist`）

管理方式：
- macOS 应用在本地模式下负责 LaunchAgent 的安装/更新。
- CLI 也可以安装它：`clawdbot gateway install`。

行为：
- “Clawdbot Active” 可以启用/禁用 LaunchAgent。
- 应用退出 **不会** 停止网关（launchd 会保持其运行）。
- 如果配置的端口上已有 Gateway 在运行，应用会附加到它而不是启动一个新的实例。

日志：
- launchd 的 stdout/err：`/tmp/clawdbot/clawdbot-gateway.log`

## 版本兼容性

macOS 应用会检查网关版本与自身版本是否兼容。如果版本不兼容，请更新全局 CLI 以匹配应用版本。

## 烟雾测试（Smoke check）```bash
clawdbot --version

CLAWDBOT_SKIP_CHANNELS=1 \
CLAWDBOT_SKIP_CANVAS_HOST=1 \
clawdbot gateway --port 18999 --bind loopback
```
然后：
bash
clawdbot gateway call health --url ws://127.0.0.1:18999 --timeout 3000
``````
