---
summary: "CLI reference for `clawdbot onboard` (interactive onboarding wizard)"
read_when:
  - You want guided setup for gateway, workspace, auth, channels, and skills
---

# `clawdbot onboard`

交互式引导向导（本地或远程网关设置）。

相关：
- 引导指南：[引导](/start/onboarding)
bash
clawdbot onboard
clawdbot onboard --flow quickstart
clawdbot onboard --flow manual
clawdbot onboard --mode remote --remote-url ws://gateway-host:18789``````
流程说明：
- `quickstart`：最小化提示，自动生成网关令牌。
- `manual`：完整的端口/绑定/认证提示（`advanced` 的别名）。