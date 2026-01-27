---
summary: "macOS IPC architecture for Clawdbot app, gateway node transport, and PeekabooBridge"
read_when:
  - Editing IPC contracts or menu bar app IPC
---

# Clawdbot macOS IPC 架构

**当前模型：** 一个本地 Unix 套接字连接 **node host service** 和 **macOS 应用程序**，用于执行授权和 `system.run`。存在一个 `clawdbot-mac` 调试 CLI 用于发现和连接检查；代理操作仍然通过 Gateway WebSocket 和 `node.invoke` 流动。UI 自动化使用 PeekabooBridge。

## 目标
- 一个单一的 GUI 应用程序实例，负责所有与 TCC 相关的工作（通知、屏幕录制、麦克风、语音、AppleScript）。
- 一个小型自动化界面：Gateway + node 命令，加上 PeekabooBridge 用于 UI 自动化。
- 可预测的权限：始终使用相同的签名 Bundle ID，并由 launchd 启动，因此 TCC 授权会保持一致。

## 工作原理
### Gateway + node 传输
- 应用程序运行 Gateway（本地模式）并作为 node 连接到它。
- 代理操作通过 `node.invoke` 执行（例如 `system.run`、`system.notify`、`canvas.*`）。

### Node 服务 + 应用程序 IPC
- 一个无头的 node host service 连接到 Gateway WebSocket。
- `system.run` 请求通过本地 Unix 套接字转发到 macOS 应用程序。
- 应用程序在 UI 上下文中执行该操作，如有需要会提示用户，并返回输出结果。

图示（SCI）：

Agent -> Gateway -> Node Service (WS)
                      |  IPC (UDS + token + HMAC + TTL)
                      v
                  Mac App (UI + TCC + system.run)
``````
```md
### PeekabooBridge（UI自动化）
- UI自动化使用一个名为 `bridge.sock` 的独立UNIX套接字和 PeekabooBridge JSON协议。
- 主机优先级顺序（客户端侧）：Peekaboo.app → Claude.app → Clawdbot.app → 本地执行。
- 安全性：bridge主机需要允许的TeamID；DEBUG模式下允许同UID的绕过机制由 `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1`（Peekaboo约定）保护。
- 详情请参见：[PeekabooBridge使用说明](/platforms/mac/peekaboo)。

## 操作流程
- 重启/重建：`SIGN_IDENTITY="Apple Development: <Developer Name> (<TEAMID>)" scripts/restart-mac.sh`
  - 杀死现有实例
  - Swift构建 + 包管理
  - 写入/引导/启动LaunchAgent

## 加固注意事项
- 建议对所有特权接口都要求TeamID匹配。
- PeekabooBridge：`PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1`（仅限DEBUG）可能允许本地开发时的同UID调用者。
- 所有通信均为本地；不暴露网络套接字。
- TCC提示仅来自GUI应用程序包；在重建过程中保持已签名的包ID稳定。
- IPC加固：套接字模式 `0600`，令牌、对等UID检查、HMAC挑战/响应、短TTL。