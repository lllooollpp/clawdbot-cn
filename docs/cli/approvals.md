---
summary: "CLI reference for `clawdbot approvals` (exec approvals for gateway or node hosts)"
read_when:
  - You want to edit exec approvals from the CLI
  - You need to manage allowlists on gateway or node hosts
---

# `clawdbot approvals`

管理 **本地主机**、**网关主机** 或 **节点主机** 的执行批准。
默认情况下，命令会针对磁盘上的本地批准文件。使用 `--gateway` 来针对网关，或使用 `--node` 来针对特定节点。

相关：
- 执行批准：[执行批准](/tools/exec-approvals)
- 节点：[节点](/nodes)

## 常用命令
bash
clawdbot approvals get
clawdbot approvals get --node <id|name|ip>
clawdbot approvals get --gateway``````
## 从文件中替换审批```bash
clawdbot approvals set --file ./exec-approvals.json
clawdbot approvals set --node <id|name|ip> --file ./exec-approvals.json
clawdbot approvals set --gateway --file ./exec-approvals.json
```
## 白名单助手
clawdbot approvals allowlist add "~/Projects/**/bin/rg"
clawdbot approvals allowlist add --agent main --node <id|name|ip> "/usr/bin/uptime"
clawdbot approvals allowlist add --agent "*" "/usr/bin/uname"

clawdbot approvals allowlist remove "~/Projects/**/bin/rg"

## 说明

- `--node` 使用与 `clawdbot nodes` 相同的解析器（可以通过 id、name、ip 或 id 前缀进行解析）。
- `--agent` 默认值为 `"*"`, 表示适用于所有代理。
- 节点主机必须公开 `system.execApprovals.get/set`（适用于 macOS 应用或无头节点主机）。
- 审批文件按主机存储在 `~/.clawdbot/exec-approvals.json`。