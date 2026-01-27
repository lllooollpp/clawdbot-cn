---
summary: "Gateway lifecycle on macOS (launchd)"
read_when:
  - Integrating the mac app with the gateway lifecycle
---

# macOS 上的网关生命周期

默认情况下，macOS 应用程序通过 **launchd** 管理网关，并不会将网关作为子进程启动。它首先尝试连接配置端口上正在运行的网关；如果无法连接到任何网关，它将通过外部的 `clawdbot` CLI 工具（不包含嵌入式运行时）启用 launchd 服务。这可以确保在登录时可靠地自动启动，并在崩溃后自动重启。

子进程模式（网关由应用程序直接启动）**目前未使用**。  
如果你需要与 UI 更紧密的耦合，请在终端中手动运行网关。

## 默认行为（launchd）

- 应用程序会安装一个用户级的 LaunchAgent，标识为 `com.clawdbot.gateway`  
  （使用 `--profile`/`CLAWDBOT_PROFILE` 时为 `com.clawdbot.<profile>`）。
- 当启用本地模式时，应用程序会确保 LaunchAgent 已加载，并在需要时启动网关。
- 日志会被写入 launchd 网关的日志路径（可在调试设置中查看）。

常用命令：
bash
launchctl kickstart -k gui/$UID/com.clawdbot.gateway
launchctl bootout gui/$UID/com.clawdbot.gateway
``````
将标签替换为 `com.clawdbot.<profile>`，当运行命名的配置文件时。

## 未签名的开发构建

`scripts/restart-mac.sh --no-sign` 用于在没有签名密钥的情况下进行快速本地构建。为防止 launchd 指向一个未签名的中继二进制文件，它会：

- 写入 `~/.clawdbot/disable-launchagent`。

对 `scripts/restart-mac.sh` 的签名运行会清除此覆盖（如果存在标记文件）。如需手动重置：```bash
rm ~/.clawdbot/disable-launchagent
```
## 仅附加模式

为了强制 macOS 应用 **从不安装或管理 launchd**，可以使用 `--attach-only`（或 `--no-launchd`）启动应用。这将创建 `~/.clawdbot/disable-launchagent` 文件，因此应用只会附加到一个已经运行的网关（Gateway）。你也可以在调试设置中切换相同的行为。

## 远程模式

远程模式永远不会启动本地网关。应用通过 SSH 隧道连接到远程主机，并通过该隧道进行连接。

## 为什么我们更倾向于使用 launchd

- 登录时自动启动。
- 内置的重启/保持运行（KeepAlive）机制。
- 可预测的日志和监控。

如果将来再次需要真正的子进程模式，应将其记录为一个单独的、明确的开发专用模式。