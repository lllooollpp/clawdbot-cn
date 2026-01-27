---
summary: "CLI reference for `clawdbot nodes` (list/status/approve/invoke, camera/canvas/screen)"
read_when:
  - You’re managing paired nodes (cameras, screen, canvas)
  - You need to approve requests or invoke node commands
---

# `clawdbot nodes`

管理配对的节点（设备）并调用节点功能。

相关：
- 节点概览：[节点](/nodes)
- 摄像头：[摄像头节点](/nodes/camera)
- 图像：[图像节点](/nodes/images)

常用选项：
- `--url`，`--token`，`--timeout`，`--json`

## 常用命令
bash
clawdbot nodes list
clawdbot nodes list --connected
clawdbot nodes list --last-connected 24h
clawdbot nodes pending
clawdbot nodes approve <requestId>
clawdbot nodes status
clawdbot nodes status --connected
clawdbot nodes status --last-connected 24h``````
`nodes list` 会显示挂起/配对的表格。已配对的行包括最近的连接时间（Last Connect）。
使用 `--connected` 仅显示当前已连接的节点。使用 `--last-connected <duration>` 可以筛选出在指定时间段内连接过的节点（例如 `24h`、`7d`）。```bash
clawdbot nodes invoke --node <id|name|ip> --command <command> --params <json>
clawdbot nodes run --node <id|name|ip> <command...>
clawdbot nodes run --raw "git status"
clawdbot nodes run --agent main --node <id|name|ip> --raw "git status"
```
调用标志：
- `--params <json>`：JSON 对象字符串（默认 `{}`）。
- `--invoke-timeout <ms>`：节点调用超时（默认 `15000`）。
- `--idempotency-key <key>`：可选的幂等性键。

### 执行风格默认值

`nodes run` 模拟模型的执行行为（默认值 + 审批）：

- 读取 `tools.exec.*`（以及 `agents.list[].tools.exec.*` 的覆盖设置）。
- 在调用 `system.run` 之前使用执行审批（`exec.approval.request`）。
- 当 `tools.exec.node` 被设置时，可以省略 `--node`。
- 需要一个提供 `system.run` 功能的节点（macOS 伴侣应用或无头节点主机）。

标志：
- `--cwd <path>`：工作目录。
- `--env <key=val>`：环境变量覆盖（可重复）。
- `--command-timeout <ms>`：命令超时。
- `--invoke-timeout <ms>`：节点调用超时（默认 `30000`）。
- `--needs-screen-recording`：需要屏幕录制权限。
- `--raw <command>`：运行一个 shell 字符串（`/bin/sh -lc` 或 `cmd.exe /c`）。
- `--agent <id>`：代理作用域的审批/允许列表（默认使用配置的代理）。
- `--ask <off|on-miss|always>`，`--security <deny|allowlist|full>`：覆盖设置。