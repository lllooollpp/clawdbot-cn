---
summary: "Clawdbot Gateway CLI (`clawdbot gateway`) — run, query, and discover gateways"
read_when:
  - Running the Gateway from the CLI (dev or servers)
  - Debugging Gateway auth, bind modes, and connectivity
  - Discovering gateways via Bonjour (LAN + tailnet)
---

# 网关 CLI

网关是 Clawdbot 的 WebSocket 服务器（频道、节点、会话、钩子）。

本页面中的子命令位于 `clawdbot gateway …` 下。

相关文档：
- [/gateway/bonjour](/gateway/bonjour)
- [/gateway/discovery](/gateway/discovery)
- [/gateway/configuration](/gateway/configuration)

## 运行网关

运行本地的网关进程：
bash
clawdbot gateway``````
前景别名：```bash
clawdbot gateway run
```
### 注意事项：
- 默认情况下，当 `~/.clawdbot/clawdbot.json` 中未设置 `gateway.mode=local` 时，网关将拒绝启动。可以在临时/开发环境中使用 `--allow-unconfigured` 参数来允许启动。
- 对于绑定到环回地址以外的地址且未经过认证的请求，将被阻止（安全防护）。
- 在授权后，`SIGUSR1` 信号将触发进程内重启（需要启用 `commands.restart` 或通过网关工具/配置进行应用/更新）。
- `SIGINT`/`SIGTERM` 处理器将停止网关进程，但不会恢复任何自定义终端状态。如果你使用 TUI 或原始模式包装了 CLI，请在退出前恢复终端。

### 选项

- `--port <port>`：WebSocket 端口（默认值来自配置/环境变量；通常为 `18789`）。
- `--bind <loopback|lan|tailnet|auto|custom>`：监听绑定模式。
- `--auth <token|password>`：覆盖认证模式。
- `--token <token>`：覆盖令牌（同时设置进程中的 `CLAWDBOT_GATEWAY_TOKEN`）。
- `--password <password>`：覆盖密码（同时设置进程中的 `CLAWDBOT_GATEWAY_PASSWORD`）。
- `--tailscale <off|serve|funnel>`：通过 Tailscale 暴露网关。
- `--tailscale-reset-on-exit`：关闭时重置 Tailscale 的 serve/funnel 配置。
- `--allow-unconfigured`：允许在配置中未设置 `gateway.mode=local` 的情况下启动网关。
- `--dev`：如果缺失则创建开发配置 + 工作区（跳过 BOOTSTRAP.md）。
- `--reset`：重置开发配置 + 凭据 + 会话 + 工作区（需要配合 `--dev` 使用）。
- `--force`：在启动前终止选定端口上的任何现有监听器。
- `--verbose`：详细日志。
- `--claude-cli-logs`：仅在控制台中显示 claude-cli 的日志（并启用其 stdout/stderr）。
- `--ws-log <auto|full|compact>`：WebSocket 日志样式（默认为 `auto`）。
- `--compact`：`--ws-log compact` 的别名。
- `--raw-stream`：将原始模型流事件记录为 jsonl 格式。
- `--raw-stream-path <path>`：原始流 jsonl 的路径。

## 查询正在运行的网关

所有查询命令都使用 WebSocket RPC。

输出模式：
- 默认：人类可读（在 TTY 中带颜色）。
- `--json`：机器可读的 JSON（无样式/加载动画）。
- `--no-color`（或 `NO_COLOR=1`）：禁用 ANSI 颜色，同时保持人类可读的布局。

共享选项（适用于支持的命令）：
- `--url <url>`：网关 WebSocket 地址。
- `--token <token>`：网关令牌。
- `--password <password>`：网关密码。
- `--timeout <ms>`：超时/预算（根据命令不同而变化）。
- `--expect-final`：等待“最终”响应（代理调用）。

### `gateway health`
bash
clawdbot gateway health --url ws://127.0.0.1:18789``````
### `gateway status`

`gateway status` 显示网关服务（launchd/systemd/schtasks）以及可选的 RPC 探针。```bash
clawdbot gateway status
clawdbot gateway status --json
```
选项：
- `--url <url>`：覆盖探测的 URL。
- `--token <token>`：用于探测的令牌认证。
- `--password <password>`：用于探测的密码认证。
- `--timeout <ms>`：探测超时时间（默认为 `10000` 毫秒）。
- `--no-probe`：跳过 RPC 探测（仅显示服务视图）。
- `--deep`：同时扫描系统级服务。

### `gateway probe`

`gateway probe` 是“调试所有内容”的命令。它始终会进行探测：
- 您配置的远程网关（如果已设置），以及
- 本地主机（回环地址）**即使已配置远程网关**。

如果存在多个可访问的网关，它会列出所有网关。当您使用隔离的配置文件/端口（例如救援机器人）时，支持多个网关，但大多数安装仍然只运行一个网关。
bash
clawdbot gateway probe
clawdbot gateway probe --json``````
#### 通过 SSH 的远程连接（Mac 应用程序功能对等）

MacOS 应用程序“通过 SSH 的远程连接”模式使用本地端口转发，使得远程网关（可能仅绑定到环回地址）可以通过 `ws://127.0.0.1:<端口>` 访问。

CLI 对等命令：```bash
clawdbot gateway probe --ssh user@gateway-host
```
选项：
- `--ssh <目标>`: `user@host` 或 `user@host:port`（端口默认为 `22`）。
- `--ssh-identity <路径>`: 身份文件。
- `--ssh-auto`: 自动选择第一个发现的网关主机作为 SSH 目标（仅限 LAN/WAB）。

配置（可选，用作默认值）：
- `gateway.remote.sshTarget`
- `gateway.remote.sshIdentity`

### `gateway call <方法>`

低级 RPC 辅助工具。
bash
clawdbot gateway call status
clawdbot gateway call logs.tail --params '{"sinceMs": 60000}'``````
## 管理网关服务```bash
clawdbot gateway install
clawdbot gateway start
clawdbot gateway stop
clawdbot gateway restart
clawdbot gateway uninstall
```
说明：
- `gateway install` 支持 `--port`、`--runtime`、`--token`、`--force`、`--json` 参数。
- 生命周期命令支持 `--json` 用于脚本编写。

## 发现网关（Bonjour）

`gateway discover` 会扫描网关信标（`_clawdbot-gw._tcp`）。

- 多播 DNS-SD：`local.`
- 单播 DNS-SD（广域 Bonjour）：`clawdbot.internal.`（需要拆分 DNS + DNS 服务器；详见 [/gateway/bonjour](/gateway/bonjour)）

只有启用了 Bonjour 发现功能的网关（默认启用）会广播该信标。

广域发现记录包含（TXT）：
- `role`（网关角色提示）
- `transport`（传输提示，例如 `gateway`）
- `gatewayPort`（WebSocket 端口，通常为 `18789`）
- `sshPort`（SSH 端口；若未提供则默认为 `22`）
- `tailnetDns`（MagicDNS 主机名，当可用时）
- `gatewayTls` / `gatewayTlsSha256`（TLS 是否启用 + 证书指纹）
- `cliPath`（远程安装的可选提示）

### `gateway discover`
bash
clawdbot gateway discover``````
选项：
- `--timeout <ms>`：每个命令的超时时间（浏览/解析）；默认值为 `2000`。
- `--json`：机器可读的输出（同时禁用样式/加载动画）。

示例：```bash
clawdbot gateway discover --timeout 4000
clawdbot gateway discover --json | jq '.beacons[].wsUrl'
```
