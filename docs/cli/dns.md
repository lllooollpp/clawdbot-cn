---
summary: "CLI reference for `clawdbot dns` (wide-area discovery helpers)"
read_when:
  - You want wide-area discovery (DNS-SD) via Tailscale + CoreDNS
  - You’re setting up split DNS for clawdbot.internal
---

# `clawdbot dns`

用于广域发现的 DNS 工具（Tailscale + CoreDNS）。目前专注于 macOS + Homebrew CoreDNS。

相关：
- 网关发现：[Discovery](/gateway/discovery)
- 广域发现配置：[Configuration](/gateway/configuration)

## 安装
bash
clawdbot dns setup
clawdbot dns setup --apply``````
"