---
summary: "CLI reference for `clawdbot status` (diagnostics, probes, usage snapshots)"
read_when:
  - You want a quick diagnosis of channel health + recent session recipients
  - You want a pasteable “all” status for debugging
---

# `clawdbot status`

通道和会话的诊断信息。  
bash  
clawdbot status  
clawdbot status --all  
clawdbot status --deep  
clawdbot status --usage``````
注意事项：
- `--deep` 会运行实时探测（WhatsApp Web + Telegram + Discord + Google Chat + Slack + Signal）。
- 当配置了多个代理时，输出将包含每个代理的会话存储。
- 概览部分会显示网关 + 节点主机服务的安装/运行状态（如果可用）。
- 概览部分会显示更新渠道 + git SHA（用于源代码检出）。
- 更新信息会在概览中显示；如果检测到有更新可用，状态会提示运行 `clawdbot update`（参见 [更新说明](/install/updating)）。