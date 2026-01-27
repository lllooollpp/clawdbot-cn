---
summary: "Android app (node): connection runbook + Canvas/Chat/Camera"
read_when:
  - Pairing or reconnecting the Android node
  - Debugging Android gateway discovery or auth
  - Verifying chat history parity across clients
---

# Android 应用（节点）

## 支持快照
- 角色：辅助节点应用（Android 不托管网关）。
- 需要网关：是（在 macOS、Linux 或 Windows 通过 WSL2 运行）。
- 安装：[开始使用](/start/getting-started) + [配对](/gateway/pairing)。
- 网关：[运行手册](/gateway) + [配置](/gateway/configuration)。
  - 协议：[网关协议](/gateway/protocol)（节点 + 控制平面）。

## 系统控制
系统控制（launchd/systemd）位于网关主机上。详见 [网关](/gateway)。

## 连接运行手册

Android 节点应用 ⇄ (mDNS/NSD + WebSocket) ⇄ **网关**

Android 直接连接到网关的 WebSocket（默认 `ws://<host>:18789`），并使用网关拥有的配对方式。

### 前提条件

- 你可以在“主”机器上运行网关。
- Android 设备/模拟器可以访问网关的 WebSocket：
  - 同一局域网（LAN）并使用 mDNS/NSD，**或**
  - 使用 Tailscale 尾网（tailnet）并通过广域网Bonjour / 单播 DNS-SD（详见下文），**或**
  - 手动指定网关主机/端口（备用方案）
- 你可以在网关机器上运行 CLI（`clawdbot`）（或通过 SSH）。

### 1）启动网关
bash
clawdbot gateway --port 18789 --verbose
``````
在日志中确认你看到类似以下内容：
- `listening on ws://0.0.0.0:18789`

对于仅使用 tailnet 的设置（推荐用于维也纳 ⇄ 伦敦），将网关绑定到 tailnet IP：

- 在网关主机上的 `~/.clawdbot/clawdbot.json` 中设置 `gateway.bind: "tailnet"`。
- 重启网关 / macOS 菜单栏应用。

### 2) 验证发现功能（可选）

从网关机器上执行：```bash
dns-sd -B _clawdbot-gw._tcp local.
```
更多调试笔记：[Bonjour](/gateway/bonjour)。

#### Tailnet（维也纳 ⇄ 伦敦）通过单播 DNS-SD 进行发现

Android 的 NSD/mDNS 发现无法跨网络工作。如果你的 Android 节点和网关位于不同的网络，但通过 Tailscale 连接，可以改用 Wide-Area Bonjour / 单播 DNS-SD：

1) 在网关主机上设置一个 DNS-SD 区域（例如 `clawdbot.internal.`），并发布 `_clawdbot-gw._tcp` 记录。
2) 为 `clawdbot.internal` 配置 Tailscale 的 Split DNS，并指向该 DNS 服务器。

详细信息和示例 CoreDNS 配置：[Bonjour](/gateway/bonjour)。

### 3）从 Android 连接

在 Android 应用中：

- 应用通过 **前台服务**（持续通知）保持网关连接。
- 打开 **设置**。
- 在 **发现的网关** 下，选择你的网关并点击 **连接**。
- 如果 mDNS 被阻止，可以使用 **高级 → 手动网关**（主机 + 端口）并点击 **连接（手动）**。

首次成功配对后，Android 会在启动时自动重连：
- 如果启用了手动端点，则使用手动端点；
- 否则，使用最后一次发现的网关（尽力而为）。

### 4）批准配对（CLI）

在网关机器上：
bash
clawdbot nodes pending
clawdbot nodes approve <requestId>
``````
配对详情：[网关配对](/gateway/pairing)。

### 5）验证节点是否已连接

- 通过节点状态：  ```bash
  clawdbot nodes status
  ```
- 通过网关：
bash
  clawdbot gateway call node.list --params "{}"
  ```  ```
### 6) 聊天 + 历史记录

Android 节点的 Chat 表使用网关的 **主会话密钥** (`main`)，因此历史记录和回复与 WebChat 及其他客户端共享：

- 历史记录：`chat.history`
- 发送：`chat.send`
- 推送更新（尽力而为）：`chat.subscribe` → `event:"chat"`

### 7) 画布 + 摄像头

#### 网关画布主机（推荐用于网页内容）

如果你想让节点显示代理可以编辑磁盘上的 HTML/CSS/JS 内容，请将节点指向网关的画布主机。

注意：节点使用 `canvasHost.port` 上的独立画布主机（默认为 `18793`）。

1) 在网关主机上创建 `~/clawd/canvas/index.html`。

2) 将节点导航到该文件（局域网）：```bash
clawdbot nodes invoke --node "<Android Node>" --command canvas.navigate --params '{"url":"http://<gateway-hostname>.local:18793/__clawdbot__/canvas/"}'
```
Tailnet（可选）：如果两台设备都在 Tailscale 上，可以使用 MagicDNS 名称或 tailnet IP 而不是 `.local`，例如 `http://<gateway-magicdns>:18793/__clawdbot__/canvas/`。

此服务器会将 live-reload 客户端注入 HTML，并在文件更改时重新加载。
A2UI 主机位于 `http://<gateway-host>:18793/__clawdbot__/a2ui/`。

Canvas 命令（仅限前台）：
- `canvas.eval`、`canvas.snapshot`、`canvas.navigate`（使用 `{"url":""}` 或 `{"url":"/"}` 返回默认模板）。`canvas.snapshot` 返回 `{ format, base64 }`（默认 `format="jpeg"`）。
- A2UI：`canvas.a2ui.push`、`canvas.a2ui.reset`（`canvas.a2ui.pushJSONL` 是旧版别名）

相机命令（仅限前台；需权限）：
- `camera.snap`（jpg 格式）
- `camera.clip`（mp4 格式）

有关参数和 CLI 辅助工具，请参见 [相机节点](/nodes/camera)。