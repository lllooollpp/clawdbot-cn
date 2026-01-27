---
summary: "Loopback WebChat static host and Gateway WS usage for chat UI"
read_when:
  - Debugging or configuring WebChat access
---

# WebChat（网关 WebSocket UI）

状态：macOS/iOS 的 SwiftUI 聊天 UI 直接与网关 WebSocket 通信。

## 它是什么
- 一个原生的网关聊天 UI（不使用嵌入式浏览器，也不使用本地静态服务器）。
- 使用与其他通道相同的会话和路由规则。
- 确定性路由：回复始终返回到 WebChat。

## 快速开始
1) 启动网关。
2) 打开 WebChat UI（macOS/iOS 应用）或 Control UI 的聊天标签页。
3) 如果您不在 loopback 网络上，请确保已配置网关认证。

## 工作原理（行为）
- UI 连接到网关 WebSocket，并使用 `chat.history`、`chat.send` 和 `chat.inject`。
- `chat.inject` 直接将助理备注添加到对话记录中，并广播到 UI（不经过代理执行）。
- 历史记录始终从网关获取（不本地文件监控）。
- 如果网关不可达，WebChat 将变为只读模式。

## 远程使用
- 远程模式通过 SSH/Tailscale 隧道传输网关 WebSocket。
- 您不需要运行单独的 WebChat 服务器。

## 配置参考（WebChat）
完整配置：[配置](/gateway/configuration)

频道选项：
- 没有专门的 `webchat.*` 块。WebChat 使用网关端点 + 下面的认证设置。

相关全局选项：
- `gateway.port`、`gateway.bind`：WebSocket 主机/端口。
- `gateway.auth.mode`、`gateway.auth.token`、`gateway.auth.password`：WebSocket 认证。
- `gateway.remote.url`、`gateway.remote.token`、`gateway.remote.password`：远程网关目标。
- `session.*`：会话存储和主键默认值。