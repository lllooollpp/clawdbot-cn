---
summary: "Routing rules per channel (WhatsApp, Telegram, Discord, Slack) and shared context"
read_when:
  - Changing channel routing or inbox behavior
---

# 通道与路由

Clawdbot 会将回复 **路由回消息来源的通道**。模型不会选择通道；路由是确定性的，并由主机配置控制。

## 关键术语

- **通道**：`whatsapp`、`telegram`、`discord`、`slack`、`signal`、`imessage`、`webchat`。
- **AccountId**：每个通道的账户实例（当支持时）。
- **AgentId**：一个隔离的工作区 + 会话存储器（“大脑”）。
- **SessionKey**：用于存储上下文和控制并发的桶键。

## 会话键结构（示例）

私聊会合并到代理的 **主** 会话中：

- `agent:<agentId>:<mainKey>`（默认为 `agent:main:main`）

群组和通道在每个通道中保持隔离：

- 群组：`agent:<agentId>:<channel>:group:<id>`
- 通道/房间：`agent:<agentId>:<channel>:channel:<id>`

线程：

- Slack/Discord 线程会在基础键后附加 `:thread:<threadId>`。
- Telegram 论坛主题则会嵌入 `:topic:<topicId>` 到群组键中。

示例：

- `agent:main:telegram:group:-1001234567890:topic:42`
- `agent:main:discord:channel:123456:thread:987654`

## 路由规则（如何选择代理）

路由为每个传入消息选择 **一个代理**：

1. **精确对等匹配**（通过 `bindings` 中的 `peer.kind` + `peer.id`）。
2. **服务器匹配**（Discord）通过 `guildId`。
3. **团队匹配**（Slack）通过 `teamId`。
4. **账户匹配**（通过通道上的 `accountId`）。
5. **通道匹配**（该通道上的任何账户）。
6. **默认代理**（`agents.list[].default`，否则为第一个列表项，回退到 `main`）。

匹配的代理决定了使用哪个工作区和会话存储器。
json5
{
  broadcast: {
    strategy: "parallel",
    "120363403215116621@g.us": ["alfred", "baerbel"],
    "+15555550123": ["support", "logger"]
  }
}``````
参见：[广播组](/broadcast-groups)。

## 配置概览

- `agents.list`: 命名的代理定义（工作区、模型等）。
- `bindings`: 将入站渠道/账户/对等方映射到代理。```json5
{
  agents: {
    list: [
      { id: "support", name: "Support", workspace: "~/clawd-support" }
    ]
  },
  bindings: [
    { match: { channel: "slack", teamId: "T123" }, agentId: "support" },
    { match: { channel: "telegram", peer: { kind: "group", id: "-100123" } }, agentId: "support" }
  ]
}
```
## 会话存储

会话存储位于状态目录下（默认为 `~/.clawdbot`）：

- `~/.clawdbot/agents/<agentId>/sessions/sessions.json`
- 与存储文件一同存在的对话记录为 JSONL 格式

你可以通过 `session.store` 和 `{agentId}` 模板来覆盖存储路径。