---
summary: "PeekabooBridge integration for macOS UI automation"
read_when:
  - Hosting PeekabooBridge in Clawdbot.app
  - Integrating Peekaboo via Swift Package Manager
  - Changing PeekabooBridge protocol/paths
---

# Peekaboo Bridge（macOS UI自动化）

Clawdbot 可以作为本地的、具有权限感知的 UI 自动化代理程序 **PeekabooBridge**。这使得 `peekaboo` 命令行工具可以驱动 UI 自动化，同时复用 macOS 应用的 TCC 权限。

## 这是什么（以及不是什么）

- **主机**：Clawdbot.app 可以作为 PeekabooBridge 的主机。
- **客户端**：使用 `peekaboo` 命令行工具（没有单独的 `clawdbot ui ...` 接口）。
- **UI**：视觉叠加层保留在 Peekaboo.app 中；Clawdbot 是一个轻量级的代理主机。

## 启用桥接

在 macOS 应用中：
- 设置 → **启用 Peekaboo Bridge**

启用后，Clawdbot 会启动一个本地 UNIX 套接字服务器。如果禁用，主机将停止，`peekaboo` 会回退到其他可用的主机。

## 客户端发现顺序

Peekaboo 客户端通常按以下顺序尝试主机：

1. Peekaboo.app（完整用户体验）
2. Claude.app（如果已安装）
3. Clawdbot.app（轻量级代理）

使用 `peekaboo bridge status --verbose` 可查看当前活动的主机以及使用的套接字路径。你可以通过以下方式进行覆盖：
bash
export PEEKABOO_BRIDGE_SOCKET=/path/to/bridge.sock
``````
## 安全与权限

- 桥接器会验证 **调用者代码签名**；会强制执行 TeamIDs 的白名单（Peekaboo 主机 TeamID + Clawdbot 应用 TeamID）。
- 请求在约 10 秒后超时。
- 如果缺少必要的权限，桥接器会返回清晰的错误信息，而不是直接跳转到系统设置。

## 快照行为（自动化）

快照存储在内存中，并在短时间内自动过期。  
如果需要更长的保留时间，请从客户端重新捕获。

## 故障排除

- 如果 `peekaboo` 报错“bridge client is not authorized”，请确保客户端已正确签名，或仅在 **调试** 模式下使用 `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1` 运行主机。
- 如果未找到任何主机，请打开其中一个主机应用（Peekaboo.app 或 Clawdbot.app）并确认已授予权限。