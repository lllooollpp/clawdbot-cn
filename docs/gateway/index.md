---
summary: "Runbook for the Gateway service, lifecycle, and operations"
read_when:
  - Running or debugging the gateway process
---

# 网关服务运行手册

最后更新时间：2025-12-09

## 它是什么
- 一个持续运行的进程，负责管理与 Baileys/Telegram 的单一连接以及控制/事件平面。
- 替代了旧版的 `gateway` 命令。CLI 入口点：`clawdbot gateway`。
- 持续运行直到被停止；在发生严重错误时返回非零退出码，以便监督程序重启它。
bash
clawdbot gateway --port 18789
# 用于在标准输出中获取完整的调试/追踪日志：
clawdbot gateway --port 18789 --verbose
# 如果端口被占用，终止监听器后重新启动：
clawdbot gateway --force
# 开发模式（TS 文件更改时自动重新加载）：
pnpm gateway:watch
``````
- 配置热重载会监视 `~/.clawdbot/clawdbot.json`（或 `CLAWDBOT_CONFIG_PATH`）。
  - 默认模式：`gateway.reload.mode="hybrid"`（热应用安全更改，关键更改时重启）。
  - 热重载在需要时通过 **SIGUSR1** 进程内重启。
  - 通过 `gateway.reload.mode="off"` 禁用。
- 将 WebSocket 控制平面绑定到 `127.0.0.1:<port>`（默认端口 18789）。
- 同一端口也提供 HTTP 服务（控制 UI、钩子、A2UI）。单端口多路复用。
  - OpenAI 聊天完成（HTTP）：[`/v1/chat/completions`](/gateway/openai-http-api)。
  - OpenResponses（HTTP）：[`/v1/responses`](/gateway/openresponses-http-api)。
  - 工具调用（HTTP）：[`/tools/invoke`](/gateway/tools-invoke-http-api)。
- 默认在 `canvasHost.port`（默认 `18793`）启动 Canvas 文件服务器，从 `~/clawd/canvas` 提供 `http://<gateway-host>:18793/__clawdbot__/canvas/`。通过 `canvasHost.enabled=false` 或 `CLAWDBOT_SKIP_CANVAS_HOST=1` 禁用。
- 日志输出到 stdout；使用 launchd/systemd 来保持运行并轮换日志。
- 通过 `--verbose` 参数可以将日志文件中的调试日志（握手、请求/响应、事件）镜像到 stdio，用于故障排查。
- `--force` 会使用 `lsof` 查找选定端口上的监听者，发送 **SIGTERM**，记录被终止的内容，然后启动网关（如果缺少 `lsof` 则快速失败）。
- 如果在 supervisor（launchd/systemd/mac 应用子进程模式）下运行，停止/重启通常会发送 **SIGTERM**；旧版本可能将此显示为 `pnpm` 的 `ELIFECYCLE` 退出码 **143**（即 **SIGTERM**），这是正常关闭，不是崩溃。
- **SIGUSR1** 在授权后触发进程内重启（网关工具/配置应用/更新，或启用 `commands.restart` 手动重启）。
- 网关认证：设置 `gateway.auth.mode=token` + `gateway.auth.token`（或通过 `--token <value>` / `CLAWDBOT_GATEWAY_TOKEN` 传递），要求客户端发送 `connect.params.auth.token`。
- 向导现在默认生成一个 token，即使是在 loopback 模式下。
- 端口优先级：`--port` > `CLAWDBOT_GATEWAY_PORT` > `gateway.port` > 默认 `18789`。

## 远程访问
- 推荐使用 Tailscale/VPN；否则使用 SSH 隧道：  ```bash
  ssh -N -L 18789:127.0.0.1:18789 user@host
  ```
- 客户端通过隧道连接到 `ws://127.0.0.1:18789`。
- 如果配置了令牌，客户端即使在隧道中也必须在 `connect.params.auth.token` 中包含该令牌。

## 多个网关（同一主机）

通常不需要：一个网关可以为多个消息通道和代理提供服务。仅在需要冗余或严格隔离时（例如救援机器人）使用多个网关。

如果隔离状态 + 配置并使用不同的端口，则支持多个网关。完整指南：[多个网关](/gateway/multiple-gateways)。

服务名称具有配置文件感知性：
- macOS: `com.clawdbot.<profile>`
- Linux: `clawdbot-gateway-<profile>.service`
- Windows: `Clawdbot 网关 (<profile>)`

安装元数据嵌入在服务配置中：
- `CLAWDBOT_SERVICE_MARKER=clawdbot`
- `CLAWDBOT_SERVICE_KIND=gateway`
- `CLAWDBOT_SERVICE_VERSION=<version>`

救援机器人模式：使用独立的配置文件、状态目录、工作区和基础端口间隔，保持第二个网关隔离。完整指南：[救援机器人指南](/gateway/multiple-gateways#rescue-bot-guide)。

### 开发配置文件 (`--dev`)

快速路径：在不干扰主设置的情况下运行一个完全隔离的开发实例（配置/状态/工作区）。
bash
clawdbot --dev setup
clawdbot --dev gateway --allow-unconfigured
# 然后指向开发实例：
clawdbot --dev status
clawdbot --dev health
``````
默认值（可以通过环境变量/标志/配置覆盖）：
- `CLAWDBOT_STATE_DIR=~/.clawdbot-dev`
- `CLAWDBOT_CONFIG_PATH=~/.clawdbot-dev/clawdbot.json`
- `CLAWDBOT_GATEWAY_PORT=19001`（网关 WS + HTTP）
- `browser.controlUrl=http://127.0.0.1:19003`（派生自：`gateway.port + 2`）
- `canvasHost.port=19005`（派生自：`gateway.port + 4`）
- `agents.defaults.workspace` 默认值在你使用 `--dev` 运行 `setup`/`onboard` 时变为 `~/clawd-dev`。

派生端口（经验法则）：
- 基础端口 = `gateway.port`（或 `CLAWDBOT_GATEWAY_PORT` / `--port`）
- `browser.controlUrl` 端口 = 基础端口 + 2（或 `CLAWDBOT_BROWSER_CONTROL_URL` / 配置覆盖）
- `canvasHost.port` = 基础端口 + 4（或 `CLAWDBOT_CANVAS_HOST_PORT` / 配置覆盖）
- 浏览器配置文件的 CDP 端口会从 `browser.controlPort + 9` 到 `+ 108` 自动分配（每个配置文件独立保存）。

每个实例的检查清单：
- 独立的 `gateway.port`
- 独立的 `CLAWDBOT_CONFIG_PATH`
- 独立的 `CLAWDBOT_STATE_DIR`
- 独立的 `agents.defaults.workspace`
- 独立的 WhatsApp 号码（如果使用 WA）

每个配置文件的服务安装：```bash
clawdbot --profile main gateway install
clawdbot --profile rescue gateway install
```
示例：
bash
CLAWDBOT_CONFIG_PATH=~/.clawdbot/a.json CLAWDBOT_STATE_DIR=~/.clawdbot-a clawdbot gateway --port 19001
CLAWDBOT_CONFIG_PATH=~/.clawdbot/b.json CLAWDBOT_STATE_DIR=~/.clawdbot-b clawdbot gateway --port 19002
``````
## 协议（操作员视角）
- 完整文档：[网关协议](/gateway/protocol) 和 [桥接协议（旧版）](/gateway/bridge-protocol)。
- 客户端必须发送的第一个帧：`req {type:"req", id, method:"connect", params:{minProtocol,maxProtocol,client:{id,displayName?,version,platform,deviceFamily?,modelIdentifier?,mode,instanceId?}, caps, auth?, locale?, userAgent? } }`。
- 网关回复 `res {type:"res", id, ok:true, payload:hello-ok }`（或 `ok:false` 并附带错误信息，然后关闭连接）。
- 握手完成后：
  - 请求：`{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
  - 事件：`{type:"event", event, payload, seq?, stateVersion?}`

- 结构化存在条目：`{host, ip, version, platform?, deviceFamily?, modelIdentifier?, mode, lastInputSeconds?, ts, reason?, tags?[], instanceId? }`（对于 WebSocket 客户端，`instanceId` 来自 `connect.client.instanceId`）。
- `agent` 响应是两阶段的：首先 `res` 确认 `{runId,status:"accepted"}`，然后在运行完成后发送最终 `res` `{runId,status:"ok"|"error",summary}`；流式输出通过 `event:"agent"` 返回。

## 方法（初始集合）
- `health` — 完整的健康快照（与 `clawdbot health --json` 的结构相同）。
- `status` — 简短摘要。
- `system-presence` — 当前的存在列表。
- `system-event` — 发布一个存在/系统备注（结构化）。
- `send` — 通过活动的通道发送消息。
- `agent` — 运行一个代理流程（通过同一连接流式返回事件）。
- `node.list` — 列出配对和当前连接的节点（包括 `caps`、`deviceFamily`、`modelIdentifier`、`paired`、`connected` 和发布的 `commands`）。
- `node.describe` — 描述一个节点（功能和支持的 `node.invoke` 命令；适用于已配对的节点以及当前连接的未配对节点）。
- `node.invoke` — 在节点上执行一个命令（例如 `canvas.*`, `camera.*`）。
- `node.pair.*` — 配对生命周期（`request`、`list`、`approve`、`reject`、`verify`）。

另见：[存在](/concepts/presence) 了解存在信息是如何生成/去重的，以及为什么稳定的 `client.instanceId` 很重要。

## 类型与验证
- 服务器使用 AJV 对协议定义生成的 JSON Schema 验证每个传入的帧。
- 客户端（TS/Swift）使用生成的类型（TS 直接使用；Swift 通过仓库的生成器）。
- 协议定义是唯一的真实来源；要重新生成 schema/models，请使用：
  - `pnpm protocol:gen`
  - `pnpm protocol:gen:swift`

## 连接快照
- `hello-ok` 包含一个带有 `presence`、`health`、`stateVersion` 和 `uptimeMs` 的 `snapshot`，以及 `policy {maxPayload, maxBufferedBytes, tickIntervalMs}`，因此客户端可以在无需额外请求的情况下立即渲染。
- `health`/`system-presence` 仍可用于手动刷新，但在连接时不是必需的。

## 错误代码（res.error 结构）
- 错误使用 `{ code, message, details?, retryable?, retryAfterMs? }`。
- 标准错误代码：
  - `NOT_LINKED` — WhatsApp 未通过身份验证。
  - `AGENT_TIMEOUT` — 代理在配置的截止时间前未响应。
  - `INVALID_REQUEST` — schema/参数验证失败。
  - `UNAVAILABLE` — 网关正在关闭或某个依赖不可用。

## 保活机制
- 定期发出 `tick` 事件（或 WS 的 ping/pong），以便客户端在没有流量时也能知道网关是活跃的。
- 发送/代理确认应作为独立响应处理；不要将发送操作叠加到 ticks 上。

## 重放 / 数据缺口
- 事件不会被重放。客户端应检测序列号缺口，并在继续之前刷新（`health` + `system-presence`）。WebChat 和 macOS 客户端现在会在检测到缺口时自动刷新。

## 监督（macOS 示例）
- 使用 launchd 保持服务运行：
  - 程序：`clawdbot` 的路径
  - 参数：`gateway`
  - KeepAlive：true
  - StandardOut/Err：文件路径或 `syslog`
- 在失败时，launchd 会重启服务；严重的配置错误应导致进程退出，以便操作员注意到。
- LaunchAgents 是按用户配置的，需要登录会话；对于无头环境，请使用自定义的 LaunchDaemon（不随发行版提供）。
  - `clawdbot gateway install` 会生成 `~/Library/LaunchAgents/com.clawdbot.gateway.plist`
    （或 `com.clawdbot.<profile>.plist`）。
  - `clawdbot doctor` 会检查 LaunchAgent 配置，并可以将其更新为当前默认设置。

## 网关服务管理（CLI）

使用网关 CLI 进行安装/启动/停止/重启/状态检查：```bash
clawdbot gateway status
clawdbot gateway install
clawdbot gateway stop
clawdbot gateway restart
clawdbot logs --follow
```
注意事项：
- `gateway status` 默认通过服务的解析端口/配置来探测 Gateway RPC（可通过 `--url` 覆盖）。
- `gateway status --deep` 添加系统级扫描（LaunchDaemons/system units）。
- `gateway status --no-probe` 跳过 RPC 探测（当网络中断时很有用）。
- `gateway status --json` 对脚本来说是稳定的。
- `gateway status` 会分别报告 **supervisor 运行时**（launchd/systemd 正在运行）和 **RPC 可达性**（WS 连接 + status RPC）。
- `gateway status` 会打印配置路径 + 探测目标，以避免“localhost vs LAN 绑定”混淆和配置文件不匹配。
- 当服务看起来在运行但端口关闭时，`gateway status` 会包含最后一次的网关错误信息。
- `logs` 通过 RPC 尾随 Gateway 文件日志（无需手动使用 `tail`/`grep`）。
- 如果检测到其他类似 Gateway 的服务，CLI 会发出警告，除非它们是 Clawdbot 配置文件服务。
  我们仍然建议大多数设置中 **每台机器只运行一个 Gateway**；若需要冗余或救援机器人，请使用隔离的配置文件/端口。参见 [多个网关](/gateway/multiple-gateways)。
  - 清理：`clawdbot gateway uninstall`（当前服务）和 `clawdbot doctor`（旧版迁移）。

捆绑的 macOS 应用程序：
- Clawdbot.app 可以捆绑一个基于 Node 的 Gateway 中继，并为每个用户安装一个名为 `com.clawdbot.gateway`（或 `com.clawdbot.<profile>`）的 LaunchAgent。
- 要干净地停止它，请使用 `clawdbot gateway stop`（或 `launchctl bootout gui/$UID/com.clawdbot.gateway`）。
- 要重启，请使用 `clawdbot gateway restart`（或 `launchctl kickstart -k gui/$UID/com.clawdbot.gateway`）。
  - `launchctl` 仅在 LaunchAgent 已安装时才有效；否则请先使用 `clawdbot gateway install`。
  - 当运行命名配置文件时，将标签替换为 `com.clawdbot.<profile>`。

## 监督（systemd 用户单元）
Clawdbot 默认在 Linux/WSL2 上安装一个 **systemd 用户服务**。我们建议在单用户机器上使用用户服务（更简单的环境，每个用户独立配置）。
对于多用户或始终运行的服务器，请使用 **system 服务**（不需要 linger，共享监督）。

`clawdbot gateway install` 会写入用户单元。`clawdbot doctor` 会检查该单元，并可以将其更新为与当前推荐默认设置一致。

创建 `~/.config/systemd/user/clawdbot-gateway[-<profile>].service`：

[Unit]
Description=Clawdbot Gateway (profile: <profile>, v<version>)
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/clawdbot gateway --port 18789
Restart=always
RestartSec=5
Environment=CLAWDBOT_GATEWAY_TOKEN=
WorkingDirectory=/home/youruser

[Install]
WantedBy=default.target
``````
"启用持久化（确保用户服务在注销/空闲时仍然运行）：```
sudo loginctl enable-linger youruser
```
在 Linux/WSL2 上运行 Onboarding（可能会提示输入 sudo；会写入 `/var/lib/systemd/linger`）。
然后启用服务：

systemctl --user enable --now clawdbot-gateway[-<profile>].service
``````
**替代（系统服务）** - 对于始终运行或多用户服务器，您可以安装一个 systemd **系统** 服务单元，而不是用户单元（不需要持久化）。
创建 `/etc/systemd/system/clawdbot-gateway[-<profile>].service`（复制上面的单元文件，将 `WantedBy=multi-user.target` 改为 `WantedBy=multi-user.target`，设置 `User=` 和 `WorkingDirectory=`），然后执行以下操作：```
sudo systemctl daemon-reload
sudo systemctl enable --now clawdbot-gateway[-<profile>].service
```
## Windows (WSL2)

Windows 系统的安装应使用 **WSL2**，并遵循上述 Linux systemd 部分的说明。

## 操作性检查
- 活性检查：打开 WebSocket 并发送 `req:connect` → 应期望收到 `res`，其中 `payload.type="hello-ok"`（包含快照）。
- 就绪性检查：调用 `health` → 应期望 `ok: true` 和 `linkChannel` 中的链接通道（在适用时）。
- 调试：订阅 `tick` 和 `presence` 事件；确保 `status` 显示链接/认证时间；presence 条目显示网关主机和已连接的客户端。

## 安全保证
- 默认情况下，每个主机只假设一个网关；如果你运行多个配置文件，请隔离端口/状态并指向正确的实例。
- 不会回退到直接的 Baileys 连接；如果网关宕机，发送将快速失败。
- 非连接首帧或格式错误的 JSON 将被拒绝，并关闭套接字。
- 优雅关闭：关闭前发出 `shutdown` 事件；客户端必须处理关闭并重新连接。

## CLI 辅助工具
- `clawdbot gateway health|status` — 通过网关 WebSocket 请求健康状态。
- `clawdbot message send --target <num> --message "hi" [--media ...]` — 通过网关发送消息（对 WhatsApp 是幂等的）。
- `clawdbot agent --message "hi" --to <num>` — 运行一个代理回合（默认等待最终结果）。
- `clawdbot gateway call <method> --params '{"k":"v"}'` — 用于调试的原始方法调用器。
- `clawdbot gateway stop|restart` — 停止/重启受监督的网关服务（launchd/systemd）。
- 网关辅助命令假设 `--url` 上运行着一个网关；它们不再自动启动网关。

## 迁移指导
- 废弃 `clawdbot gateway` 和旧版 TCP 控制端口的使用。
- 更新客户端，使其通过 WebSocket 协议通信，要求连接和结构化的 presence 信息。