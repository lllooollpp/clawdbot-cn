---
summary: "Nodes: pairing, capabilities, permissions, and CLI helpers for canvas/camera/screen/system"
read_when:
  - Pairing iOS/Android nodes to a gateway
  - Using node canvas/camera for agent context
  - Adding new node commands or CLI helpers
---

# 节点

**节点** 是一个配套设备（macOS/iOS/Android/无头设备），通过 `role: "node"` 连接到网关的 **WebSocket**（与操作员使用相同的端口），并通过 `node.invoke` 暴露命令接口（例如 `canvas.*`, `camera.*`, `system.*`）。协议详情：[网关协议](/gateway/protocol)。

旧版传输方式：[桥接协议](/gateway/bridge-protocol)（TCP JSONL；已弃用/移除，不再适用于当前节点）。

macOS 也可以在 **节点模式** 下运行：菜单栏应用连接到网关的 WS 服务器，并将其本地的 canvas/camera 命令作为节点暴露出来（因此 `clawdbot nodes …` 命令可以在这台 Mac 上运行）。

注意事项：
- 节点是 **外设**，而不是网关。它们不运行网关服务。
- Telegram/WhatsApp 等消息会到达 **网关**，而不是节点。
bash
clawdbot devices list
clawdbot devices approve <requestId>
clawdbot devices reject <requestId>
clawdbot nodes status
clawdbot nodes describe --node <idOrNameOrIp>
``````
注意事项：
- `nodes status` 在设备配对角色包含 `node` 时，会将节点标记为 **已配对**。
- `node.pair.*`（CLI：`clawdbot nodes pending/approve/reject`）是一个由网关拥有独立的节点配对存储；它**不会**控制 WS 的 `connect` 握手过程。

## 远程节点主机（system.run）

当你的网关运行在一台机器上，而你希望在另一台机器上执行命令时，请使用 **节点主机**。模型仍然与 **网关** 进行通信；当选择 `host=node` 时，网关会将 `exec` 调用转发到 **节点主机**。

### 哪里运行什么
- **网关主机**：接收消息，运行模型，路由工具调用。
- **节点主机**：在节点机器上执行 `system.run` / `system.which`。
- **审批**：通过 `~/.clawdbot/exec-approvals.json` 在节点主机上进行强制审批。

### 启动节点主机（前台运行）

在节点机器上执行：```bash
clawdbot node run --host <gateway-host> --port 18789 --display-name "Build Node"
```
### 启动节点主机（服务）
bash
clawdbot node install --host <gateway-host> --port 18789 --display-name "构建节点"
clawdbot node restart
``````
### Pair + 名称

在网关主机上：```bash
clawdbot nodes pending
clawdbot nodes approve <requestId>
clawdbot nodes list
```
命名选项：
- 在 `clawdbot node run` / `clawdbot node install` 上使用 `--display-name`（在节点上的 `~/.clawdbot/node.json` 中持久化）。
- `clawdbot nodes rename --node <id|name|ip> --name "Build Node"`（网关覆盖）。

### 允许列表中的命令

执行审批是 **按节点主机** 进行的。从网关添加允许列表条目：
bash
clawdbot approvals allowlist add --node <id|name|ip> "/usr/bin/uname"
clawdbot approvals allowlist add --node <id|name|ip> "/usr/bin/sw_vers"
``````
批准信息存储在节点主机上的 `~/.clawdbot/exec-approvals.json` 文件中。

### 将 exec 指向节点

配置默认值（网关配置）：```bash
clawdbot config set tools.exec.host node
clawdbot config set tools.exec.security allowlist
clawdbot config set tools.exec.node "<id-or-name>"
```
或按会话：

/exec host=node security=allowlist node=<id-or-name>
``````
一旦设置，任何带有 `host=node` 的 `exec` 调用都会在节点主机上运行（受节点允许列表/批准限制）。

相关：
- [节点主机 CLI](/cli/node)
- [Exec 工具](/tools/exec)
- [Exec 批准](/tools/exec-approvals)

## 调用命令

低级（原始 RPC）：```bash
clawdbot nodes invoke --node <idOrNameOrIp> --command canvas.eval --params '{"javaScript":"location.href"}'
```
存在更高层次的辅助工具，用于常见的“给代理提供 MEDIA 附件”工作流程。

## 屏幕截图（画布快照）

如果节点显示的是 Canvas（WebView），则 `canvas.snapshot` 返回 `{ format, base64 }`。

CLI 辅助工具（将截图写入临时文件并输出 `MEDIA:<path>`）：  
```bash
clawdbot nodes canvas snapshot --node <idOrNameOrIp> --format png
clawdbot nodes canvas snapshot --node <idOrNameOrIp> --format jpg --max-width 1200 --quality 0.9
``````
### 画布控制```bash
clawdbot nodes canvas present --node <idOrNameOrIp> --target https://example.com
clawdbot nodes canvas hide --node <idOrNameOrIp>
clawdbot nodes canvas navigate https://example.com --node <idOrNameOrIp>
clawdbot nodes canvas eval --node <idOrNameOrIp> --js "document.title"
```
说明：
- `canvas present` 接受 URL 或本地文件路径（`--target`），并可选地接受 `--x/--y/--width/--height` 用于定位。
- `canvas eval` 接受内联 JavaScript（`--js`）或位置参数。

### A2UI（画布）
bash
clawdbot nodes canvas a2ui push --node <idOrNameOrIp> --text "Hello"
clawdbot nodes canvas a2ui push --node <idOrNameOrIp> --jsonl ./payload.jsonl
clawdbot nodes canvas a2ui reset --node <idOrNameOrIp>
``````
注意事项：
- 仅支持 A2UI v0.8 的 JSONL 格式（v0.9/createSurface 被拒绝）。

## 照片 + 视频（节点 camera）

照片（`jpg`）：```bash
clawdbot nodes camera list --node <idOrNameOrIp>
clawdbot nodes camera snap --node <idOrNameOrIp>            # default: both facings (2 MEDIA lines)
clawdbot nodes camera snap --node <idOrNameOrIp> --facing front
```
视频剪辑（`mp4`）：
bash
clawdbot nodes camera clip --node <idOrNameOrIp> --duration 10s
clawdbot nodes camera clip --node <idOrNameOrIp> --duration 3000 --no-audio```
注意事项：
- 该节点必须处于**前台**状态，才能使用 `canvas.*` 和 `camera.*`（后台调用会返回 `NODE_BACKGROUND_UNAVAILABLE`）。
- 录制时长会被限制（目前为 `<= 60s`），以避免过大的 base64 数据负载。
- 在 Android 上，当可能时会提示请求 `CAMERA`/`RECORD_AUDIO` 权限；如果权限被拒绝，则会以 `*_PERMISSION_REQUIRED` 失败。```bash
clawdbot nodes screen record --node <idOrNameOrIp> --duration 10s --fps 10
clawdbot nodes screen record --node <idOrNameOrIp> --duration 10s --fps 10 --no-audio
```
注意事项：
- `screen.record` 需要节点应用处于前台运行。
- 在开始录制之前，Android 会显示系统屏幕捕获提示。
- 屏幕录制时间限制为 `<= 60 秒`。
- `--no-audio` 用于禁用麦克风录制（支持 iOS/Android；macOS 使用系统音频录制）。
- 当有多个屏幕可用时，使用 `--screen <index>` 来选择显示屏幕。

## 位置（节点）

当设置中启用了位置功能时，节点会暴露 `location.get`。
bash
clawdbot nodes location get --node <idOrNameOrIp>
clawdbot nodes location get --node <idOrNameOrIp> --accuracy precise --max-age 15000 --location-timeout 10000
``````
备注：
- 位置信息默认是**关闭**的。
- “始终”选项需要系统权限；后台获取是**尽力而为**的。
- 响应包含纬度/经度、精度（米）和时间戳。

## 短信（Android 节点）

当用户授予 **短信** 权限且设备支持电话功能时，Android 节点可以暴露 `sms.send` 接口。

低级别调用：```bash
clawdbot nodes invoke --node <idOrNameOrIp> --command sms.send --params '{"to":"+15555550123","message":"Hello from Clawdbot"}'
```
## 注意事项：
- 在功能被宣传之前，必须在 Android 设备上接受权限提示。
- 仅支持 Wi-Fi 而没有电话功能的设备不会宣传 `sms.send`。

## 系统命令（node host / mac node）

macOS 节点支持 `system.run`、`system.notify` 和 `system.execApprovals.get/set`。
无头节点主机支持 `system.run`、`system.which` 和 `system.execApprovals.get/set`。

示例：
bash
clawdbot nodes run --node <idOrNameOrIp> -- echo "Hello from mac node"
clawdbot nodes notify --node <idOrNameOrIp> --title "Ping" --body "Gateway ready"
``````
注意事项：
- `system.run` 在 payload 中返回 stdout/stderr/退出代码。
- `system.notify` 会尊重 macOS 应用中的通知权限状态。
- `system.run` 支持 `--cwd`、`--env KEY=VAL`、`--command-timeout` 和 `--needs-screen-recording` 参数。
- `system.notify` 支持 `--priority <passive|active|timeSensitive>` 和 `--delivery <system|overlay|auto>` 参数。
- macOS 节点会忽略 `PATH` 的覆盖；无头节点主机仅在 `PATH` 以节点主机的 `PATH` 开头时接受 `PATH`。
- 在 macOS 节点模式下，`system.run` 受 macOS 应用中的执行批准限制（设置 → 执行批准）。
  “询问/允许列表/全部” 的行为与无头节点主机相同；被拒绝的提示将返回 `SYSTEM_RUN_DENIED`。
- 在无头节点主机上，`system.run` 受执行批准限制（`~/.clawdbot/exec-approvals.json`）。

## 执行节点绑定

当有多个节点可用时，可以将执行绑定到特定节点。
这会设置 `exec host=node` 的默认节点（也可以在每个代理中覆盖）。

全局默认：```bash
clawdbot config set tools.exec.node "node-id-or-name"
```
单个代理覆盖：
bash
clawdbot config get agents.list
clawdbot config set agents.list[0].tools.exec.node "node-id-or-name"
``````
取消设置以允许任何节点：```bash
clawdbot config unset tools.exec.node
clawdbot config unset agents.list[0].tools.exec.node
```
## 权限映射

节点可以在 `node.list` / `node.describe` 中包含一个 `permissions` 映射，以权限名称为键（例如 `screenRecording`, `accessibility`），对应的值为布尔值（`true` 表示已授予）。

## 无头节点主机（跨平台）

Clawdbot 可以运行一个 **无头节点主机**（无用户界面），连接到网关的 WebSocket，并暴露 `system.run` / `system.which`。这在 Linux/Windows 上非常有用，或者用于在运行服务器的同时启动一个最小节点。
bash
clawdbot node run --host <gateway-host> --port 18789
``````
注意事项：
- 配对仍然是必需的（网关会显示节点批准提示）。
- 节点主机将它的节点 ID、令牌、显示名称和网关连接信息存储在 `~/.clawdbot/node.json` 文件中。
- 执行批准通过 `~/.clawdbot/exec-approvals.json` 在本地强制执行
  （参见 [执行批准](/tools/exec-approvals)）。
- 在 macOS 上，无头节点主机在可到达时优先使用配套应用的执行主机，如果应用不可用则回退到本地执行。设置 `CLAWDBOT_NODE_EXEC_HOST=app` 可强制使用应用，或设置 `CLAWDBOT_NODE_EXEC_FALLBACK=0` 来禁用回退。
- 当网关 WS 使用 TLS 时，添加 `--tls` / `--tls-fingerprint` 参数。

## macOS 节点模式

- macOS 菜单栏应用作为节点连接到网关 WS 服务器（因此 `clawdbot nodes …` 命令可以针对此 Mac 执行）。
- 在远程模式下，应用会为网关端口打开一个 SSH 隧道并连接到 `localhost`。