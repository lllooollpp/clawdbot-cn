---
summary: "CLI reference for `clawdbot system` (system events, heartbeat, presence)"
read_when:
  - You want to enqueue a system event without creating a cron job
  - You need to enable or disable heartbeats
  - You want to inspect system presence entries
---

# `clawdbot 系统`

网关的系统级助手：排队系统事件、控制心跳以及查看在线状态。

## 常用命令
bash
clawdbot system event --text "检查紧急后续跟进" --mode now
clawdbot system heartbeat enable
clawdbot system heartbeat last
clawdbot system presence``````
## `system event`

在**主**会话中加入一个系统事件。下一个心跳将把它作为 `System:` 行注入到提示中。使用 `--mode now` 可立即触发心跳；`next-heartbeat` 会等待下一个预定的周期。

标志：
- `--text <text>`：必需的系统事件文本。
- `--mode <mode>`：`now` 或 `next-heartbeat`（默认）。
- `--json`：机器可读的输出。

## `system heartbeat last|enable|disable`

心跳控制：
- `last`：显示上一个心跳事件。
- `enable`：重新开启心跳（如果之前被禁用过，请使用此命令）。
- `disable`：暂停心跳。

标志：
- `--json`：机器可读的输出。

## 注意事项

- 需要一个正在运行的网关，且可通过当前配置（本地或远程）访问。
- 系统事件是短暂的，不会在重启后保留。