---
summary: "CLI reference for `clawdbot directory` (self, peers, groups)"
read_when:
  - You want to look up contacts/groups/self ids for a channel
  - You are developing a channel directory adapter
---

# `clawdbot 目录`

支持目录查找的频道（联系人/对等节点、群组和“我”）。

## 常用标志
- `--channel <名称>`：频道 ID/别名（当配置了多个频道时为必填项；仅当配置了一个频道时会自动填充）
- `--account <ID>`：账户 ID（默认：频道默认账户）
- `--json`：输出 JSON 格式

## 注意事项
- `directory` 命令旨在帮助您找到可以粘贴到其他命令中的 ID（尤其是 `clawdbot message send --target ...`）。
- 对于许多频道，结果是基于配置的（允许列表 / 配置的群组），而不是实时的提供者目录。
- 默认输出是 `id`（有时也包括 `name`），用制表符分隔；使用 `--json` 以便于脚本处理。

## 如何将结果与 `message send` 一起使用
bash
clawdbot directory peers list --channel slack --query "U0"
clawdbot message send --channel slack --target user:U012ABCDEF --message "hello"``````
## ID 格式（按渠道）

- WhatsApp: `+15551234567`（私信），`1234567890-1234567890@g.us`（群组）
- Telegram: `@username` 或数字聊天 ID；群组为数字 ID
- Slack: `user:U…` 和 `channel:C…`
- Discord: `user:<id>` 和 `channel:<id>`
- Matrix（插件）: `user:@user:server`，`room:!roomId:server`，或 `#alias:server`
- Microsoft Teams（插件）: `user:<id>` 和 `conversation:<id>`
- Zalo（插件）: 用户 ID（Bot API）
- Zalo 个人 / `zalouser`（插件）: 从 `zca`（`me`，`好友列表`，`群组列表`）获取的线程 ID（私信/群组）```bash
clawdbot directory self --channel zalouser
```
## 对等节点（联系人/用户）
clawdbot 目录 对等节点 列表 --channel zalouser
clawdbot 目录 对等节点 列表 --channel zalouser --query "name"
clawdbot 目录 对等节点 列表 --channel zalouser --limit 50

## 组
clawdbot 目录 组 列表 --channel zalouser
clawdbot 目录 组 列表 --channel zalouser --query "work"
clawdbot 目录 组 成员 --channel zalouser --group-id <id>```
