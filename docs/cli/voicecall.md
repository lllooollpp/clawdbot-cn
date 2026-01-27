---
summary: "CLI reference for `clawdbot voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
---

# `clawdbot voicecall`

`voicecall` 是一个由插件提供的命令。只有在安装并启用了语音通话插件后才会出现。

主要文档：
- 语音通话插件：[语音通话](/plugins/voice-call)
bash
clawdbot voicecall status --call-id <id>
clawdbot voicecall call --to "+15555550123" --message "Hello" --mode notify
clawdbot voicecall continue --call-id <id> --message "Any questions?"
clawdbot voicecall end --call-id <id>``````
## 暴露 Webhook（Tailscale）```bash
clawdbot voicecall expose --mode serve
clawdbot voicecall expose --mode funnel
clawdbot voicecall unexpose
```
"安全提示：仅将 Webhook 端点暴露给您信任的网络。在可能的情况下，优先使用 Tailscale Serve 而不是 Funnel。"