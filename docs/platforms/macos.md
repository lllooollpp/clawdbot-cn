---
summary: "Clawdbot macOS companion app (menu bar + gateway broker)"
read_when:
  - Implementing macOS app features
  - Changing gateway lifecycle or node bridging on macOS
---

# Clawdbot macOS 伴侣（菜单栏 + 网关代理）

macOS 应用是 Clawdbot 的 **菜单栏伴侣**。它拥有权限，管理/连接本地的网关（launchd 或手动），并将 macOS 的功能作为节点暴露给代理。

## 它的功能

- 显示原生通知和菜单栏状态。
- 管理 TCC 提示（通知、辅助功能、屏幕录制、麦克风、语音识别、自动化/AppleScript）。
- 运行或连接到网关（本地或远程）。
- 暴露仅 macOS 可用的工具（Canvas、Camera、屏幕录制、`system.run`）。
- 以 **远程** 模式启动本地节点主机服务（launchd），并在 **本地** 模式下停止它。
- 可选地托管 **PeekabooBridge** 用于 UI 自动化。
- 通过 npm/pnpm 在请求时安装全局 CLI（`clawdbot`）（不推荐使用 bun 作为网关运行时）。

## 本地模式与远程模式

- **本地**（默认）：如果已存在运行中的本地网关，应用会连接它；否则，它会通过 `clawdbot gateway install` 启用 launchd 服务。
- **远程**：应用通过 SSH/Tailscale 连接到网关，并且永远不会启动本地进程。
  应用会启动本地的 **节点主机服务**，以便远程网关可以访问此 Mac。
  应用不会将网关作为子进程启动。
  
## Launchd 控制

应用管理一个每用户（per-user）的 LaunchAgent，标签为 `com.clawdbot.gateway`（当使用 `--profile`/`CLAWDBOT_PROFILE` 时为 `com.clawdbot.<profile>`）。
bash
launchctl kickstart -k gui/$UID/com.clawdbot.gateway
launchctl bootout gui/$UID/com.clawdbot.gateway
``````
当运行命名配置文件时，将标签替换为 `com.clawdbot.<profile>`。

如果未安装 LaunchAgent，请从应用程序中启用它，或运行
`clawdbot gateway install`。

## Node 功能（macOS）

macOS 应用程序会作为 Node 出现。常用命令如下：

- Canvas：`canvas.present`、`canvas.navigate`、`canvas.eval`、`canvas.snapshot`、`canvas.a2ui.*`
- Camera：`camera.snap`、`camera.clip`
- Screen：`screen.record`
- System：`system.run`、`system.notify`

Node 会报告一个 `permissions` 映射，以便代理决定哪些操作是被允许的。

Node 服务 + 应用程序 IPC：
- 当无头 Node 主机服务运行（远程模式）时，它会作为 Node 连接到 Gateway WS。
- `system.run` 在 macOS 应用程序（UI/TCC 上下文）中通过本地 Unix 套接字执行；提示信息和输出将保留在应用程序中。

图示（SCI）：```
Gateway -> Node Service (WS)
                 |  IPC (UDS + token + HMAC + TTL)
                 v
             Mac App (UI + TCC + system.run)
```
## 执行审批（system.run）

`system.run` 由 macOS 应用中的 **执行审批** 控制（设置 → 执行审批）。
安全 + 询问 + 允许列表数据本地存储在 Mac 上，路径为：

~/.clawdbot/exec-approvals.json
``````
```md
{
  "version": 1,
  "defaults": {
    "security": "拒绝",
    "ask": "缺失时询问"
  },
  "agents": {
    "main": {
      "security": "白名单",
      "ask": "缺失时询问",
      "allowlist": [
        { "pattern": "/opt/homebrew/bin/rg" }
      ]
    }
  }
}```
注意事项：
- `allowlist` 条目是已解析二进制路径的通配符模式。
- 在提示中选择“始终允许”会将该命令添加到允许列表中。
- `system.run` 环境覆盖会被过滤（删除 `PATH`、`DYLD_*`、`LD_*`、`NODE_OPTIONS`、`PYTHON*`、`PERL*`、`RUBYOPT`）后，再与应用的环境合并。

## 深度链接

该应用注册了 `clawdbot://` URL 方案用于本地操作。

### `clawdbot://agent`

触发一个网关 `agent` 请求。```bash
open 'clawdbot://agent?message=Hello%20from%20deep%20link'
```
查询参数：
- `message`（必填）
- `sessionKey`（可选）
- `thinking`（可选）
- `deliver` / `to` / `channel`（可选）
- `timeoutSeconds`（可选）
- `key`（可选，无头模式密钥）

安全说明：
- 没有 `key` 时，应用会提示确认。
- 拥有有效的 `key` 时，运行将为无头模式（适用于个人自动化）。

## 注册流程（常规）

1) 安装并启动 **Clawdbot.app**。
2) 完成权限检查清单（TCC 提示）。
3) 确保 **本地** 模式处于激活状态，并且网关正在运行。
4) 如果需要终端访问，请安装 CLI。

## 构建与开发流程（原生）

- `cd apps/macos && swift build`
- `swift run Clawdbot`（或使用 Xcode）
- 打包应用：`scripts/package-mac-app.sh`

## 调试网关连接（macOS CLI）

使用调试 CLI 来测试与 macOS 应用相同的网关 WebSocket 握手和发现逻辑，而无需启动应用。
bash
cd apps/macos
swift run clawdbot-mac connect --json
swift run clawdbot-mac discover --timeout 3000 --json
``````
连接选项：
- `--url <ws://host:port>`：覆盖配置
- `--mode <local|remote>`：从配置中解析（默认：配置或 local）
- `--probe`：强制进行新的健康探测
- `--timeout <ms>`：请求超时时间（默认：`15000`）
- `--json`：结构化输出以便对比

发现选项：
- `--include-local`：包括那些会被过滤为“local”的网关
- `--timeout <ms>`：整体发现窗口时间（默认：`2000`）
- `--json`：结构化输出以便对比

提示：可以通过 `clawdbot gateway discover --json` 对比，查看 macOS 应用的发现流程（NWBrowser + tailnet DNS‑SD 回退）是否与 Node CLI 的 `dns-sd` 基础发现方式不同。

## 远程连接机制（SSH 隧道）

当 macOS 应用在 **Remote** 模式下运行时，它会建立一个 SSH 隧道，使得本地 UI 组件可以像在本地一样与远程网关通信。

### 控制隧道（网关 WebSocket 端口）
- **用途：** 健康检查、状态、网页聊天、配置以及其他控制平面调用。
- **本地端口：** 网关端口（默认 `18789`），始终稳定。
- **远程端口：** 远程主机上的相同网关端口。
- **行为：** 不使用随机本地端口；如果需要，应用会复用已有的健康隧道或重新启动它。
- **SSH 配置：** `ssh -N -L <local>:127.0.0.1:<remote>`，包含 BatchMode + ExitOnForwardFailure + keepalive 选项。
- **IP 报告：** SSH 隧道使用环回地址，因此网关会看到节点 IP 为 `127.0.0.1`。如果希望显示真实的客户端 IP，请使用 **Direct (ws/wss)** 传输方式（参见 [macOS 远程访问](/platforms/mac/remote)）。

有关设置步骤，请参见 [macOS 远程访问](/platforms/mac/remote)。有关协议细节，请参见 [网关协议](/gateway/protocol)。

## 相关文档

- [网关运行手册](/gateway)
- [网关（macOS）](/platforms/mac/bundled-gateway)
- [macOS 权限](/platforms/mac/permissions)
- [Canvas](/platforms/mac/canvas)