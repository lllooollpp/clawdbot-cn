---
summary: "How the mac app embeds the gateway WebChat and how to debug it"
read_when:
  - Debugging mac WebChat view or loopback port
---

# WebChat（macOS 应用）

macOS 菜单栏应用将 WebChat UI 作为原生 SwiftUI 视图嵌入。它连接到网关，并默认使用所选代理的 **主会话**（支持切换其他会话）。

- **本地模式**：直接连接到本地网关的 WebSocket。
- **远程模式**：通过 SSH 转发网关控制端口，并使用该隧道作为数据平面。

## 启动与调试

- 手动启动：Lobster 菜单 → “打开聊天”。
- 自动打开用于测试：
bash
  dist/Clawdbot.app/Contents/MacOS/Clawdbot --webchat
  ```  ```
- 日志：`./scripts/clawlog.sh`（子系统 `com.clawdbot`，分类 `WebChatSwiftUI`）。

## 它是如何连接的

- 数据平面：网关 WS 方法 `chat.history`、`chat.send`、`chat.abort`、`chat.inject` 和事件 `chat`、`agent`、`presence`、`tick`、`health`。
- 会话：默认使用主会话（`main`，或在作用域为全局时使用 `global`）。UI 可以在不同会话之间切换。
- 首次使用流程使用专用会话，以将首次运行的设置与其它会话区分开。

## 安全面

- 远程模式仅通过 SSH 转发网关 WebSocket 控制端口。

## 已知限制

- UI 优化用于聊天会话（不是完整的浏览器沙箱）。