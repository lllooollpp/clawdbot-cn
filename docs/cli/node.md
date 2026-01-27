---
summary: "CLI reference for `clawdbot node` (headless node host)"
read_when:
  - Running the headless node host
  - Pairing a non-macOS node for system.run
---

# `clawdbot node`

运行一个 **无头节点主机**，连接到网关 WebSocket，并在此机器上暴露 `system.run` / `system.which`。

## 为什么使用节点主机？

当您希望代理在 **网络中的其他机器上运行命令**，而无需在那些机器上安装完整的 macOS 伴侣应用时，可以使用节点主机。

常见使用场景：
- 在远程 Linux/Windows 服务器（构建服务器、实验室机器、NAS）上运行命令。
- 在网关上保持执行 **沙箱化**，但将经过批准的执行任务委托给其他主机。
- 为自动化或 CI 节点提供轻量级、无头的执行目标。

执行仍然受到 **执行审批** 和节点主机上的 **每代理允许列表** 的保护，因此您可以保持命令访问权限的范围和明确性。

## 浏览器代理（零配置）

如果节点上的 `browser.enabled` 没有被禁用，节点主机将自动广播一个浏览器代理。这使得代理可以在该节点上使用浏览器自动化，而无需额外配置。

如需禁用，请在节点上进行设置：
json5
{
  nodeHost: {
    browserProxy: {
      enabled: false
    }
  }
}
`````````
## 运行（前台）```bash
clawdbot node run --host <gateway-host> --port 18789
```
选项：
- `--host <host>`：网关 WebSocket 主机（默认：`127.0.0.1`）
- `--port <port>`：网关 WebSocket 端口（默认：`18789`）
- `--tls`：使用 TLS 连接网关
- `--tls-fingerprint <sha256>`：预期的 TLS 证书指纹（sha256）
- `--node-id <id>`：覆盖节点 ID（会清除配对令牌）
- `--display-name <name>`：覆盖节点显示名称

## 服务（后台运行）

将无头节点主机安装为用户服务。
bash
clawdbot node install --host <gateway-host> --port 18789``````
选项：
- `--host <host>`：网关 WebSocket 主机（默认：`127.0.0.1`）
- `--port <port>`：网关 WebSocket 端口（默认：`18789`）
- `--tls`：使用 TLS 连接网关
- `--tls-fingerprint <sha256>`：预期的 TLS 证书指纹（sha256）
- `--node-id <id>`：覆盖节点 ID（会清除配对令牌）
- `--display-name <name>`：覆盖节点显示名称
- `--runtime <runtime>`：服务运行时（`node` 或 `bun`）
- `--force`：如果已安装则重新安装/覆盖

管理服务：```bash
clawdbot node status
clawdbot node stop
clawdbot node restart
clawdbot node uninstall
```
使用 `clawdbot node run` 来启动一个前台节点主机（不作为服务运行）。

服务命令支持 `--json` 参数，用于输出可机器读取的格式。

## 配对

第一次连接会在网关上创建一个待处理的节点配对请求。
通过以下方式批准它：
bash
clawdbot nodes pending
clawdbot nodes approve <requestId>``````
节点主机在其 `~/.clawdbot/node.json` 文件中存储节点 ID、令牌、显示名称和网关连接信息。

## 执行审批

`system.run` 命令受本地执行审批的限制：

- `~/.clawdbot/exec-approvals.json`
- [执行审批](/tools/exec-approvals)
- `clawdbot approvals --node <id|name|ip>`（从网关进行编辑）