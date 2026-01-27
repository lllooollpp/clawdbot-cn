---
summary: "Node discovery and transports (Bonjour, Tailscale, SSH) for finding the gateway"
read_when:
  - Implementing or changing Bonjour discovery/advertising
  - Adjusting remote connection modes (direct vs SSH)
  - Designing node discovery + pairing for remote nodes
---

```md
# 发现与传输

Clawdbot 有两个不同的问题，表面上看起来相似：

1) **操作员远程控制**：macOS 菜单栏应用控制运行在其他地方的网关。
2) **节点配对**：iOS/Android（以及未来的节点）发现网关并安全配对。

设计目标是将所有网络发现/广告功能保留在 **Node Gateway**（`clawd` / `clawdbot gateway`）中，而客户端（mac 应用、iOS）则作为消费者。

## 术语

- **网关**：一个长期运行的网关进程，负责维护状态（会话、配对、节点注册表）并运行通道。大多数设置使用每个主机一个；也支持隔离的多网关设置。
- **网关 WS（控制平面）**：默认的 WebSocket 端点在 `127.0.0.1:18789`；可以通过 `gateway.bind` 绑定到局域网或 tailnet。
- **直接 WS 传输**：面向局域网或 tailnet 的网关 WS 端点（无需 SSH）。
- **SSH 传输（备用方案）**：通过 SSH 转发 `127.0.0.1:18789` 实现远程控制。
- **旧版 TCP 桥接（已弃用/移除）**：旧的节点传输方式（参见 [桥接协议](/gateway/bridge-protocol)）；不再用于发现。

协议细节：
- [网关协议](/gateway/protocol)
- [桥接协议（旧版）](/gateway/bridge-protocol)

## 为什么同时保留“直接”和 SSH

- **直接 WS** 在同一网络或 tailnet 内提供最佳用户体验：
  - 通过 Bonjour 在局域网内自动发现
  - 配对令牌 + ACL 由网关拥有
  - 无需 shell 访问；协议面可以保持紧凑且可审计
- **SSH** 仍然是通用的备用方案：
  - 可在任何有 SSH 访问的地方使用（即使跨不同网络）
  - 能够绕过多播/mDNS 的问题
  - 除了 SSH 之外，不需要新的入站端口

## 发现输入（客户端如何得知网关的位置）

### 1) Bonjour / mDNS（仅限局域网）

Bonjour 是一种尽力而为的协议，不能跨网络工作。它仅用于“同一局域网”内的便利性。

目标方向：
- **网关** 通过 Bonjour 广告其 WebSocket 端点。
- 客户端浏览并显示“选择一个网关”的列表，然后存储所选的端点。

故障排查和信标详情：[Bonjour](/gateway/bonjour)。

#### 服务信标详情

- 服务类型：
  - `_clawdbot-gw._tcp`（网关传输信标）
- TXT 键（非秘密）：
  - `role=gateway`
  - `lanHost=<hostname>.local`
  - `sshPort=22`（或所广告的端口）
  - `gatewayPort=18789`（网关 WS + HTTP）
  - `gatewayTls=1`（当 TLS 启用时）
  - `gatewayTlsSha256=<sha256>`（当 TLS 启用且有指纹时）
  - `canvasPort=18793`（默认画布主机端口；提供 `/__clawdbot__/canvas/`）
  - `cliPath=<path>`（可选；`clawdbot` 可运行入口或二进制文件的绝对路径）
  - `tailnetDns=<magicdns>`（可选提示；当 Tailscale 可用时自动检测）

### 禁用/覆盖：
- `CLAWDBOT_DISABLE_BONJOUR=1` 禁用广告功能。
- `gateway.bind` 在 `~/.clawdbot/clawdbot.json` 中控制网关绑定模式。
- `CLAWDBOT_SSH_PORT` 覆盖 TXT 中广告的 SSH 端口（默认为 22）。
- `CLAWDBOT_TAILNET_DNS` 发布一个 `tailnetDns` 提示（MagicDNS）。
- `CLAWDBOT_CLI_PATH` 覆盖广告的 CLI 路径。

### 2) 尾网（跨网络）

对于伦敦/维也纳风格的设置，Bonjour 无法提供帮助。推荐的“直接”目标是：
- Tailscale MagicDNS 名称（首选）或稳定的尾网 IP。

如果网关能够检测到它正在 Tailscale 下运行，它会发布 `tailnetDns` 作为客户端的可选提示（包括广域网信标）。

### 3) 手动/SSH 目标

当没有直接路由（或直接路由被禁用）时，客户端始终可以通过转发回环网关端口来通过 SSH 连接。

参见 [远程访问](/gateway/remote)。

## 传输选择（客户端策略）

推荐的客户端行为：

1) 如果配置了并可达的直接端点，使用它。
2) 否则，如果Bonjour在局域网中找到了网关，提供一个一键“使用此网关”的选项，并将其保存为直接端点。
3) 否则，如果配置了尾网 DNS/IP，尝试直接连接。
4) 否则，回退到 SSH。

## 配对 + 认证（直接传输）

网关是节点/客户端准入的唯一权威来源。

- 配对请求在网关中创建/批准/拒绝（参见 [网关配对](/gateway/pairing)）。
- 网关强制执行：
  - 认证（令牌 / 密钥对）
  - 范围/ACL（网关不是到每个方法的原始代理）
  - 速率限制

## 各组件的职责

- **网关**：发布发现信标，负责配对决策，并托管 WebSocket 端点。
- **macOS 应用**：帮助你选择网关，显示配对提示，并仅在必要时使用 SSH。
- **iOS/Android 节点**：通过Bonjour浏览作为便利功能，并连接到已配对的网关 WebSocket。