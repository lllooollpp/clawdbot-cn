---
summary: "CLI reference for `clawdbot config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
---

# `clawdbot config`

配置助手：通过路径获取/设置/取消设置值。不带子命令运行以打开配置向导（与 `clawdbot configure` 相同）。

## 示例
bash
clawdbot config get browser.executablePath
clawdbot config set browser.executablePath "/usr/bin/google-chrome"
clawdbot config set agents.defaults.heartbeat.every "2h"
clawdbot config set agents.list[0].tools.exec.node "node-id-or-name"
clawdbot config unset tools.web.search.apiKey``````
## 路径

路径使用点符号或方括号符号：```bash
clawdbot config get agents.defaults.workspace
clawdbot config get agents.list[0].id
```
使用代理列表索引来定位特定代理：

clawdbot config get agents.list
clawdbot config set agents.list[1].tools.exec.node "node-id-or-name"

## 值

当可能时，值会被解析为 JSON5；否则会被视为字符串。
使用 `--json` 选项强制要求解析为 JSON5。
bash
clawdbot config set agents.defaults.heartbeat.every "0m"
clawdbot config set gateway.port 19001 --json
clawdbot config set channels.whatsapp.groups '["*"]' --json
``````
"重启网关以应用更改。"