---
summary: "CLI reference for `clawdbot agent` (send one agent turn via the Gateway)"
read_when:
  - You want to run one agent turn from scripts (optionally deliver reply)
---

# `clawdbot agent`

通过网关运行一个代理回合（使用 `--local` 为嵌入式模式）。
使用 `--agent <id>` 直接指定一个已配置的代理。

相关：
- 代理发送工具：[代理发送](/tools/agent-send)
bash
clawdbot agent --to +15555550123 --message "status update" --deliver
clawdbot agent --agent ops --message "Summarize logs"
clawdbot agent --session-id 1234 --message "Summarize inbox" --thinking medium
clawdbot agent --agent ops --message "Generate report" --deliver --reply-channel slack --reply-to "#reports"``````
