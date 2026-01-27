---
summary: "CLI reference for `clawdbot security` (audit and fix common security footguns)"
read_when:
  - You want to run a quick security audit on config/state
  - You want to apply safe “fix” suggestions (chmod, tighten defaults)
---

# `clawdbot security`

安全工具（审计 + 可选修复）。

相关：
- 安全指南：[安全](/gateway/security)

## 审计
bash
clawdbot security audit
clawdbot security audit --deep
clawdbot security audit --fix``````
审计提示：当多个 DM 发送者共享主会话时，会发出警告，并建议为共享收件箱设置 `session.dmScope="per-channel-peer"`。
当未启用沙箱且启用了网络/浏览器工具时，使用小型模型（`<=300B`）也会发出警告。