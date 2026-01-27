---
summary: "Bonjour/mDNS discovery + debugging (Gateway beacons, clients, and common failure modes)"
read_when:
  - Debugging Bonjour discovery issues on macOS/iOS
  - Changing mDNS service types, TXT records, or discovery UX
---

# Bonjour / mDNS 发现

Clawdbot 使用 Bonjour（mDNS / DNS-SD）作为 **局域网内的一种便捷方式**，用于发现活动的网关（WebSocket 端点）。这是一种尽力而为的机制，并 **不能替代** SSH 或 Tailnet 的连接方式。

## 跨区域 Bonjour（单播 DNS-SD）通过 Tailscale

如果节点和网关位于不同的网络中，组播 mDNS 将无法跨越网络边界。你可以通过 **单播 DNS-SD**（“跨区域 Bonjour”）在 Tailscale 上保持相同的发现用户体验。

高级步骤如下：

1) 在网关主机上运行一个 DNS 服务器（可通过 Tailnet 访问）。
2) 在一个专用区域下发布 DNS-SD 记录 `_clawdbot-gw._tcp`（例如：`clawdbot.internal.`）。
3) 配置 Tailscale **分割 DNS**，使得客户端（包括 iOS）能够通过该 DNS 服务器解析 `clawdbot.internal`。

Clawdbot 在这种模式下统一使用 `clawdbot.internal.`。iOS/Android 节点会自动浏览 `local.` 和 `clawdbot.internal`。
json5
{
  gateway: { bind: "tailnet" }, // 仅限 Tailnet（推荐）
  discovery: { wideArea: { enabled: true } } // 启用 clawdbot.internal 的 DNS-SD 发布
}``````
### 一次性 DNS 服务器设置（网关主机）```bash
clawdbot dns setup --apply
```
这将安装 CoreDNS 并将其配置为：
- 仅在网关的 Tailscale 接口上监听端口 53
- 从 `~/.clawdbot/dns/clawdbot.internal.db` 提供 `clawdbot.internal.` 域名解析

从已连接到 tailnet 的机器上进行验证：
bash
dns-sd -B _clawdbot-gw._tcp clawdbot.internal.
dig @<TAILNET_IPV4> -p 53 _clawdbot-gw._tcp.clawdbot.internal PTR +short``````
### Tailscale DNS 设置

在 Tailscale 管理控制台中：

- 添加一个指向网关的 tailnet IP 的 nameserver（UDP/TCP 53）。
- 添加 split DNS，使得域名 `clawdbot.internal` 使用该 nameserver。

一旦客户端接受 tailnet DNS，iOS 节点就可以在 `clawdbot.internal` 中浏览 `_clawdbot-gw._tcp`，而无需使用多播。

### 网关监听器安全（推荐）

网关的 WS 端口（默认为 `18789`）默认绑定到 loopback。对于局域网（LAN）或 tailnet 访问，请显式绑定并保持认证功能开启。

对于仅 tailnet 的设置：
- 在 `~/.clawdbot/clawdbot.json` 中设置 `gateway.bind: "tailnet"`。
- 重启网关（或重启 macOS 菜单栏应用）。

## 哪些服务被公告

只有网关会公告 `_clawdbot-gw._tcp`。

## 服务类型

- `_clawdbot-gw._tcp` —— 网关传输信标（用于 macOS/iOS/Android 节点）。

## TXT 键（非秘密提示）

网关会公告一些小的非秘密提示，以方便用户界面操作：

- `role=gateway`
- `displayName=<友好名称>`
- `lanHost=<主机名>.local`
- `gatewayPort=<端口>`（网关 WS + HTTP）
- `gatewayTls=1`（仅当启用 TLS 时）
- `gatewayTlsSha256=<sha256>`（仅当启用 TLS 并且可用指纹时）
- `canvasPort=<端口>`（仅当启用了画布主机时；默认为 `18793`）
- `sshPort=<端口>`（未覆盖时默认为 22）
- `transport=gateway`
- `cliPath=<路径>`（可选；可运行的 `clawdbot` 入口路径）
- `tailnetDns=<magicdns>`（当 Tailnet 可用时的可选提示）

## macOS 上的调试

有用的内置工具：

- 浏览实例：  ```bash
  dns-sd -B _clawdbot-gw._tcp local.
  ```
- 解决一个实例（替换 `<instance>`）:
bash
  dns-sd -L "<instance>" _clawdbot-gw._tcp local.  ```  ```
如果浏览功能正常但解析失败，通常是因为局域网策略或 mDNS 解析器的问题。

## 在网关日志中进行调试

网关会写入一个滚动日志文件（启动时会打印为 `gateway log file: ...`）。请查找包含 `bonjour:` 的日志行，特别是以下内容：

- `bonjour: advertise failed ...`
- `bonjour: ... name conflict resolved` / `hostname conflict resolved`
- `bonjour: watchdog detected non-announced service ...`

## 在 iOS 节点上进行调试

iOS 节点使用 `NWBrowser` 来发现 `_clawdbot-gw._tcp` 服务。

要捕获日志：
- 设置 → 网关 → 高级 → **发现调试日志**
- 设置 → 网关 → 高级 → **发现日志** → 重现问题 → **复制**

日志中包括浏览器状态转换和结果集变化。

## 常见故障模式

- **Bonjour 无法跨网络工作**：请使用 Tailnet 或 SSH。
- **组播被阻止**：某些 Wi-Fi 网络会禁用 mDNS。
- **睡眠 / 接口频繁变化**：macOS 可能会暂时丢失 mDNS 结果；请重试。
- **浏览正常但解析失败**：请保持机器名称简单（避免使用表情符号或标点），然后重新启动网关。服务实例名称源自主机名，过于复杂的名称可能会让某些解析器混淆。

## 转义的实例名称（`\032`）

Bonjour/DNS-SD 经常将服务实例名称中的字节转义为十进制 `\DDD` 序列（例如，空格会变成 `\032`）。

- 这在协议层是正常的。
- UI 应该对内容进行解码以显示（iOS 使用 `BonjourEscapes.decode`）。

## 禁用 / 配置

- `CLAWDBOT_DISABLE_BONJOUR=1` 禁用广告功能。
- `gateway.bind` 在 `~/.clawdbot/clawdbot.json` 中控制网关绑定模式。
- `CLAWDBOT_SSH_PORT` 覆盖 TXT 记录中广告的 SSH 端口。
- `CLAWDBOT_TAILNET_DNS` 在 TXT 中发布一个 MagicDNS 提示。
- `CLAWDBOT_CLI_PATH` 覆盖广告的 CLI 路径。

## 相关文档

- 发现策略与传输选择：[发现](/gateway/discovery)
- 节点配对 + 审批：[网关配对](/gateway/pairing)