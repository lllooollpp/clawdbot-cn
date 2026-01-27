---
summary: "Gateway singleton guard using the WebSocket listener bind"
read_when:
  - Running or debugging the gateway process
  - Investigating single-instance enforcement
---

# 网关锁

最后更新时间：2025-12-11

## 原因
- 确保在同一台主机上每个基础端口只运行一个网关实例；额外的网关必须使用隔离的配置文件和唯一的端口。
- 在崩溃/SIGKILL的情况下不会留下过期的锁文件。
- 当控制端口已被占用时，快速失败并显示明确的错误信息。

## 机制
- 网关在启动时立即使用独占的TCP监听器绑定WebSocket监听器（默认为 `ws://127.0.0.1:18789`）。
- 如果绑定失败并返回 `EADDRINUSE` 错误，启动过程会抛出 `GatewayLockError("另一个网关实例已经在 ws://127.0.0.1:<port> 上监听")`。
- 操作系统会在任何进程退出时（包括崩溃和 SIGKILL）自动释放监听器——无需单独的锁文件或清理步骤。
- 在关闭时，网关会关闭WebSocket服务器和底层的HTTP服务器，以及时释放端口。

## 错误表现
- 如果另一个进程占用了端口，启动时会抛出 `GatewayLockError("另一个网关实例已经在 ws://127.0.0.1:<port> 上监听")`。
- 其他绑定失败的情况会显示为 `GatewayLockError("在 ws://127.0.0.1:<port> 上绑定网关套接字失败：…")`。

## 操作说明
- 如果端口被 *其他* 进程占用，错误信息相同；请释放端口或使用 `clawdbot gateway --port <port>` 选择其他端口。
- macOS 应用程序在启动网关之前仍会维护一个轻量级的 PID 保护机制；运行时的锁由 WebSocket 绑定来强制执行。