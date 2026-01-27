---
summary: "Remote access using SSH tunnels (Gateway WS) and tailnets"
read_when:
  - Running or troubleshooting remote gateway setups
---

# 远程访问（SSH、隧道和tailnet）

此仓库支持通过在专用主机（桌面/服务器）上运行一个单一的网关（主节点）并让客户端连接到它来实现“通过SSH的远程访问”。

- 对于 **操作者（你 / macOS 应用程序）**：SSH 隧道是通用的备用方案。
- 对于 **节点（iOS/Android 和未来设备）**：通过 **WebSocket** 连接到网关（根据需要使用局域网/tailnet 或 SSH 隧道）。

## 核心理念

- 网关 WebSocket 绑定到你配置的端口上的 **本地回环地址**（默认为 18789）。
- 对于远程使用，你可以通过 SSH 转发该本地回环端口（或使用 tailnet/VPN 并减少隧道使用）。

## 常见的VPN/tailnet 设置（代理所在的位置）

将 **网关主机** 看作是“代理所在的地方”。它负责管理会话、认证配置文件、频道和状态。
你的笔记本电脑/桌面（以及节点）连接到该主机。

### 1）在你的 tailnet 中运行的常驻网关（VPS 或家庭服务器）

在持久主机上运行网关，并通过 **Tailscale** 或 SSH 进行访问。

- **最佳用户体验：** 保持 `gateway.bind: "loopback"`，并通过 **Tailscale Serve** 为控制界面提供服务。
- **备用方案：** 保持本地回环 + 从任何需要访问的机器建立 SSH 隧道。
- **示例：** [exe.dev](/platforms/exe-dev)（易于使用的虚拟机）或 [Hetzner](/platforms/hetzner)（生产用 VPS）。

当你的笔记本电脑经常休眠但你希望代理始终在线时，这种设置非常理想。

### 2）家庭桌面运行网关，笔记本作为远程控制

笔记本电脑 **不运行代理**。它通过远程连接：

- 使用 macOS 应用程序的 **通过 SSH 远程访问** 模式（设置 → 常规 → “Clawdbot 运行”）。
- 应用程序会打开并管理隧道，因此 WebChat 和健康检查“直接可用”。

操作手册：[macOS 远程访问](/platforms/mac/remote)。

### 3）笔记本运行网关，其他机器进行远程访问

保持网关本地运行但安全地暴露它：

- 从其他机器通过 SSH 隧道连接到笔记本，或者
- 通过 Tailscale 为控制界面提供服务，并保持网关仅绑定本地回环地址。

指南：[Tailscale](/gateway/tailscale) 和 [Web 概览](/web)。

## 命令流程（在哪里运行什么）

一个网关服务负责管理状态和频道。节点是外围设备。

流程示例（Telegram → 节点）：
- Telegram 消息到达 **网关**。
- 网关运行 **代理**，并决定是否调用节点工具。
- 网关通过网关 WebSocket 调用 **节点**（`node.*` RPC）。
- 节点返回结果；网关将其回复回 Telegram。

注意事项：
- **节点不运行网关服务。** 每个主机上只能运行一个网关，除非你有意运行隔离的配置文件（参见 [多个网关](/gateway/multiple-gateways)）。
- macOS 应用程序的“节点模式”只是通过网关 WebSocket 的节点客户端。
bash
ssh -N -L 18789:127.0.0.1:18789 user@host```
当隧道已开启时：
- `clawdbot health` 和 `clawdbot status --deep` 现在会通过 `ws://127.0.0.1:18789` 连接到远程网关。
- `clawdbot gateway {status,health,send,agent,call}` 也可以在需要时通过 `--url` 指定转发的 URL。

注意：将 `18789` 替换为你的配置中的 `gateway.port`（或 `--port`/`CLAWDBOT_GATEWAY_PORT`）。```json5
{
  gateway: {
    mode: "remote",
    remote: {
      url: "ws://127.0.0.1:18789",
      token: "your-token"
    }
  }
}
```
当网关仅限回环（loopback-only）时，保持 URL 为 `ws://127.0.0.1:18789`，并首先打开 SSH 隧道。

## 通过 SSH 的 Chat UI

WebChat 不再使用单独的 HTTP 端口。SwiftUI 的聊天界面直接连接到网关的 WebSocket。

- 通过 SSH 转发 `18789` 端口（见上文），然后将客户端连接到 `ws://127.0.0.1:18789`。
- 在 macOS 上，建议使用应用的“通过 SSH 远程”模式，该模式会自动管理隧道。

## macOS 应用“通过 SSH 远程”

macOS 菜单栏应用可以端到端地驱动相同的设置（远程状态检查、WebChat 和语音唤醒转发）。

运行手册：[macOS 远程访问](/platforms/mac/remote)。

## 安全规则（远程/VPN）

简要说明：**除非你确定需要绑定，否则请保持网关为回环模式**。

- **回环 + SSH/Tailscale Serve** 是最安全的默认设置（不暴露公网）。
- **非回环绑定**（`lan`/`tailnet`/`custom`，或当回环不可用时的 `auto`）必须使用认证令牌/密码。
- `gateway.remote.token` 仅用于远程 CLI 调用 —— 它**不会**启用本地认证。
- `gateway.remote.tlsFingerprint` 在使用 `wss://` 时用于固定远程 TLS 证书。
- **Tailscale Serve** 可以在 `gateway.auth.allowTailscale: true` 时通过身份头进行认证。
  如果你希望使用令牌/密码，请将其设置为 `false`。
- 将 `browser.controlUrl` 视为管理 API：仅限 tailnet + 令牌认证。

深入解析：[安全](/gateway/security)。