---
summary: "Background exec execution and process management"
read_when:
  - Adding or modifying background exec behavior
  - Debugging long-running exec tasks
---

# 后台执行 + 进程工具

Clawdbot 通过 `exec` 工具运行 shell 命令，并将长时间运行的任务保留在内存中。`process` 工具用于管理这些后台会话。

## exec 工具

关键参数：
- `command`（必需）
- `yieldMs`（默认 10000）：在此延迟后自动后台运行
- `background`（布尔值）：立即后台运行
- `timeout`（秒，默认 1800）：在此超时后终止进程
- `elevated`（布尔值）：如果启用/允许提升模式，则在主机上运行
- 是否需要真实的 TTY？设置 `pty: true`。
- `workdir`, `env`

行为：
- 前台运行返回直接输出。
- 当后台运行（显式或超时）时，工具返回 `status: "running"` + `sessionId` 和简短的尾部输出。
- 输出会保留在内存中，直到会话被轮询或清除。
- 如果 `process` 工具被禁止，`exec` 会同步运行，并忽略 `yieldMs`/`background`。

## 子进程桥接

当在 `exec`/`process` 工具之外启动长时间运行的子进程（例如 CLI 重启或网关助手）时，请附加子进程桥接辅助程序，以便终止信号被转发，并在退出/错误时断开监听器。这可以避免在 systemd 上出现孤儿进程，并确保跨平台的关机行为一致。

环境变量覆盖：
- `PI_BASH_YIELD_MS`：默认的 yield 时间（毫秒）
- `PI_BASH_MAX_OUTPUT_CHARS`：内存中的输出上限（字符数）
- `CLAWDBOT_BASH_PENDING_MAX_OUTPUT_CHARS`：每个流的待处理 stdout/stderr 上限（字符数）
- `PI_BASH_JOB_TTL_MS`：已结束会话的 TTL（毫秒，限制在 1 分钟到 3 小时之间）

配置（推荐方式）：
- `tools.exec.backgroundMs`（默认 10000）
- `tools.exec.timeoutSec`（默认 1800）
- `tools.exec.cleanupMs`（默认 1800000）
  - `tools.exec.notifyOnExit`（默认 true）：当后台执行结束时，将系统事件加入队列并请求心跳。

## process 工具

动作：
- `list`：列出正在运行和已结束的会话
- `poll`：为某个会话获取新的输出（同时报告退出状态）
- `log`：读取聚合的输出（支持 `offset` + `limit`）
- `write`：发送 stdin（`data`，可选 `eof`）
- `kill`：终止一个后台会话
- `clear`：从内存中移除一个已结束的会话
- `remove`：如果正在运行则终止，否则如果已结束则清除

注意事项：
- 仅后台运行的会话会被列出/保留在内存中。
- 重启进程后会话将丢失（没有磁盘持久化）。
- 会话日志只有在运行 `process poll/log` 并且工具结果被记录时才会保存到聊天历史中。
- `process` 按 agent 作用域；它只能看到由该 agent 启动的会话。
- `process list` 包含一个派生的 `name`（命令动词 + 目标），便于快速查看。
- `process log` 使用基于行的 `offset`/`limit`（省略 `offset` 以获取最后 N 行）。

## 示例

运行一个长时间任务并稍后轮询：
json
{"tool": "exec", "command": "sleep 5 && echo done", "yieldMs": 1000}
`````````
```json
{"tool": "process", "action": "poll", "sessionId": "<id>"}

在后台立即开始：```json
{"tool": "exec", "command": "npm run build", "background": true}
``````
发送标准输入：
json
{"tool": "process", "action": "write", "sessionId": "<id>", "data": "y\n"}
``````
