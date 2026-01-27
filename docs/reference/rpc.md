---
summary: "RPC adapters for external CLIs (signal-cli, imsg) and gateway patterns"
read_when:
  - Adding or changing external CLI integrations
  - Debugging RPC adapters (signal-cli, imsg)
---

# RPC 适配器

Clawdbot 通过 JSON-RPC 集成外部 CLI。目前使用了两种模式。

## 模式 A：HTTP 守护进程（signal-cli）
- `signal-cli` 以守护进程方式运行，通过 HTTP 进行 JSON-RPC。
- 事件流使用 SSE（`/api/v1/events`）。
- 健康检查接口：`/api/v1/check`。
- 当 `channels.signal.autoStart=true` 时，Clawdbot 负责管理生命周期。

有关设置和端点，请参见 [Signal](/channels/signal)。

## 模式 B：标准输入输出子进程（imsg）
- Clawdbot 启动 `imsg rpc` 作为子进程。
- JSON-RPC 通过 stdin/stdout 以行分隔的方式进行（每行一个 JSON 对象）。
- 不需要 TCP 端口，也不需要守护进程。

核心方法包括：
- `watch.subscribe` → 通知（`method: "message"`）
- `watch.unsubscribe`
- `send`
- `chats.list`（探测/诊断）

有关设置和地址（`chat_id` 优先），请参见 [iMessage](/channels/imessage)。

## 适配器指南
- 网关负责管理进程（启动/停止与提供者生命周期绑定）。
- 保持 RPC 客户端的健壮性：设置超时，进程退出时重启。
- 优先使用稳定 ID（例如 `chat_id`）而不是显示字符串。