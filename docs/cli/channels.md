---
summary: "CLI reference for `clawdbot channels` (accounts, status, login/logout, logs)"
read_when:
  - You want to add/remove channel accounts (WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost (plugin)/Signal/iMessage)
  - You want to check channel status or tail channel logs
---

# `clawdbot channels`

管理网关上的聊天频道账户及其运行状态。

相关文档：
- 频道指南：[频道](/channels/index)
- 网关配置：[配置](/gateway/configuration)

## 常用命令
bash
clawdbot channels list
clawdbot channels status
clawdbot channels capabilities
clawdbot channels capabilities --channel discord --target channel:123
clawdbot channels resolve --channel slack "#general" "@jane"
clawdbot channels logs --channel all``````
## 添加/移除账户```bash
clawdbot channels add --channel telegram --token <bot-token>
clawdbot channels remove --channel telegram --delete
```
提示：`clawdbot channels add --help` 显示每个频道的标志（如 token、app token、signal-cli 路径等）。

## 登录 / 注销（交互式）
bash
clawdbot channels login --channel whatsapp
clawdbot channels logout --channel whatsapp``````
## 故障排除

- 运行 `clawdbot status --deep` 进行全面检查。
- 使用 `clawdbot doctor` 进行引导式修复。
- `clawdbot channels list` 输出 `Claude: HTTP 403 ... user:profile` → 使用快照需要 `user:profile` 权限。可以使用 `--no-usage`，或提供一个 claude.ai 的会话密钥（`CLAUDE_WEB_SESSION_KEY` / `CLAUDE_WEB_COOKIE`），或通过 Claude Code CLI 重新认证。

## 功能探测

获取提供者功能提示（如有可用的意图/权限）以及静态功能支持：```bash
clawdbot channels capabilities
clawdbot channels capabilities --channel discord --target channel:123
```
注意事项：
- `--channel` 是可选的；省略它将列出每个频道（包括扩展频道）。
- `--target` 接受 `channel:<id>` 或原始数字频道 ID，并且仅适用于 Discord。
- 探针是特定于供应商的：Discord 意图 + 可选频道权限；Slack 机器人 + 用户作用域；Telegram 机器人标志 + 网络钩子；Signal 守护进程版本；MS Teams 应用令牌 + Graph 角色/作用域（已知的会进行注释）。没有探针的频道将报告 `Probe: unavailable`。

## 将名称解析为 ID

使用供应商目录将频道/用户名称解析为 ID：
bash
clawdbot channels resolve --channel slack "#general" "@jane"
clawdbot channels resolve --channel discord "My Server/#support" "@someone"
clawdbot channels resolve --channel matrix "Project Room"``````
注意事项：
- 使用 `--kind user|group|auto` 来强制指定目标类型。
- 当多个条目具有相同名称时，优先选择活动匹配项。