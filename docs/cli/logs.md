---
summary: "CLI reference for `clawdbot logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
---

# `clawdbot 日志`

通过 RPC 尾随网关文件日志（仅在远程模式下有效）。

相关：
- 日志概览：[日志](/logging)

## 示例
bash
clawdbot logs
clawdbot logs --follow
clawdbot logs --json
clawdbot logs --limit 500``````
```md
"""