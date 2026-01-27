---
summary: "Multi-agent routing: isolated agents, channel accounts, and bindings"
title: Multi-Agent Routing
read_when: "You want multiple isolated agents (workspaces + auth) in one gateway process."
status: active
---

# 多智能体路由

目标：在运行中的网关中，包含多个 *独立* 的智能体（独立的工作空间 + `agentDir` + 会话），以及多个频道账户（例如两个 WhatsApp）。入站消息通过绑定路由到相应的智能体。

## 什么是“一个智能体”？

一个 **智能体** 是一个完整作用域的“大脑”，拥有以下独立的组件：

- **工作空间**（文件、AGENTS.md/SOUL.md/USER.md，本地笔记，角色规则）。
- **状态目录** (`agentDir`)，用于存储认证配置文件、模型注册表以及每个智能体的配置。
- **会话存储**（聊天记录 + 路由状态），位于 `~/.clawdbot/agents/<agentId>/sessions` 下。

认证配置文件是 **按智能体区分** 的。每个智能体从其自身的配置中读取数据。

~/.clawdbot/agents/<agentId>/agent/auth-profiles.json``````
主要代理凭据**不会**自动共享。不要在多个代理之间重复使用 `agentDir`（这会导致认证/会话冲突）。如果你想共享凭据，请将 `auth-profiles.json` 复制到其他代理的 `agentDir` 中。

每个工作区的技能是**按代理分配**的，共享技能可以从 `~/.clawdbot/skills` 获取。参见 [技能：按代理 vs 共享](/tools/skills#per-agent-vs-shared-skills)。

网关可以同时托管**一个代理**（默认）或**多个代理**。

**工作区说明：** 每个代理的工作区是**默认的当前工作目录**，而不是一个硬隔离的沙箱。相对路径会在工作区内解析，但绝对路径可以访问主机上的其他位置，除非启用了沙箱功能。参见 [沙箱](/gateway/sandboxing)。

## 路径（快速一览）

- 配置文件：`~/.clawdbot/clawdbot.json`（或 `CLAWDBOT_CONFIG_PATH`）
- 状态目录：`~/.clawdbot`（或 `CLAWDBOT_STATE_DIR`）
- 工作区：`~/clawd`（或 `~/clawd-<agentId>`）
- 代理目录：`~/.clawdbot/agents/<agentId>/agent`（或 `agents.list[].agentDir`）
- 会话：`~/.clawdbot/agents/<agentId>/sessions`

### 单代理模式（默认）

如果你不做任何操作，Clawdbot 将以单代理模式运行：

- `agentId` 默认为 **`main`**。
- 会话键为 `agent:main:<mainKey>`。
- 工作区默认为 `~/clawd`（当设置了 `CLAWDBOT_PROFILE` 时为 `~/clawd-<profile>`）。
- 状态默认为 `~/.clawdbot/agents/main/agent`。

## 代理助手

使用代理向导来添加一个新的隔离代理：```bash
clawdbot agents add work
```
然后添加 `bindings`（或者让向导来添加）以路由传入的消息。

验证方式如下：
bash
clawdbot agents list --bindings``````
## 多个代理 = 多个人，多个个性

使用 **多个代理** 时，每个 `agentId` 会成为一个 **完全隔离的个性角色**：

- **不同的手机号/账号**（每个渠道的 `accountId`）。
- **不同的个性**（每个代理的工作区文件，如 `AGENTS.md` 和 `SOUL.md`）。
- **独立的认证 + 会话**（除非明确启用，否则不会互相通信）。

这使得 **多个人** 可以共享一个 Gateway 服务器，同时保持各自的 AI“大脑”和数据隔离。

## 一个 WhatsApp 号码，多个人使用（私信分流）

你可以在 **使用一个 WhatsApp 账号** 的情况下，将 **不同的 WhatsApp 私信** 分流到不同的代理。通过 `peer.kind: "dm"` 匹配发送方的 E.164 格式（如 `+15551234567`）。回复仍然来自同一个 WhatsApp 号码（没有每个代理的独立发送身份）。

重要说明：私信会合并到代理的 **主会话密钥** 中，因此实现真正的隔离需要 **每人一个代理**。

示例：```json5
{
  agents: {
    list: [
      { id: "alex", workspace: "~/clawd-alex" },
      { id: "mia", workspace: "~/clawd-mia" }
    ]
  },
  bindings: [
    { agentId: "alex", match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551230001" } } },
    { agentId: "mia",  match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551230002" } } }
  ],
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551230001", "+15551230002"]
    }
  }
}
```
## 注意事项：
- DM 访问控制是 **针对 WhatsApp 账户全局的**（配对/允许列表），而不是针对每个代理。
- 对于共享群组，将群组绑定到一个代理，或使用 [广播群组](/broadcast-groups)。

## 路由规则（消息如何选择代理）

绑定是 **确定性的** 且 **最具体的匹配优先**：

1. `peer` 匹配（精确的 DM/群组/频道 ID）
2. `guildId`（Discord）
3. `teamId`（Slack）
4. 频道的 `accountId` 匹配
5. 频道级别的匹配（`accountId: "*"`）
6. 回退到默认代理（`agents.list[].default`，否则为列表中的第一个条目，默认为 `main`）

## 多账户 / 手机号码

支持 **多账户** 的频道（例如 WhatsApp）使用 `accountId` 来标识每个登录。每个 `accountId` 可以被路由到不同的代理，因此一台服务器可以托管多个手机号码而不会混淆会话。

## 概念

- `agentId`: 一个“大脑”（工作区，每个代理的认证，每个代理的会话存储）。
- `accountId`: 一个频道账户实例（例如 WhatsApp 账户的 `"personal"` 与 `"biz"`）。
- `binding`: 通过 `(channel, accountId, peer)` 以及可选的 guild/team ID 将入站消息路由到一个 `agentId`。
- 直接聊天会简化为 `agent:<agentId>:<mainKey>`（每个代理的“主”；`session.mainKey`）。
js
{
  agents: {
    list: [
      {
        id: "home",
        default: true,
        name: "Home",
        workspace: "~/clawd-home",
        agentDir: "~/.clawdbot/agents/home/agent",
      },
      {
        id: "work",
        name: "Work",
        workspace: "~/clawd-work",
        agentDir: "~/.clawdbot/agents/work/agent",
      },
    ],
  },

  // 确定性路由：第一个匹配项优先（最具体优先）。
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },

    // 可选的按 peer 覆盖（例如：将特定群组发送到 work 代理）。
    {
      agentId: "work",
      match: {
        channel: "whatsapp",
        accountId: "personal",
        peer: { kind: "group", id: "1203630...@g.us" },
      },
    },
  ],

  // 默认关闭：代理间消息必须显式启用并被列入允许列表。
  tools: {
    agentToAgent: {
      enabled: false,
      allow: ["home", "work"],
    },
  },

  channels: {
    whatsapp: {
      accounts: {
        personal: {
          // 可选覆盖。默认：~/.clawdbot/credentials/whatsapp/personal
          // authDir: "~/.clawdbot/credentials/whatsapp/personal",
        },
        biz: {
          // 可选覆盖。默认：~/.clawdbot/credentials/whatsapp/biz
          // authDir: "~/.clawdbot/credentials/whatsapp/biz",
        },
      },
    },
  },
}
`````````
## 示例：WhatsApp 日常聊天 + Telegram 深度工作

按渠道拆分：将 WhatsApp 路由到快速日常代理，将 Telegram 路由到 Opus 代理。```json5
{
  agents: {
    list: [
      {
        id: "chat",
        name: "Everyday",
        workspace: "~/clawd-chat",
        model: "anthropic/claude-sonnet-4-5"
      },
      {
        id: "opus",
        name: "Deep Work",
        workspace: "~/clawd-opus",
        model: "anthropic/claude-opus-4-5"
      }
    ]
  },
  bindings: [
    { agentId: "chat", match: { channel: "whatsapp" } },
    { agentId: "opus", match: { channel: "telegram" } }
  ]
}
```
注意事项：
- 如果一个渠道有多个账户，请在绑定中添加 `accountId`（例如 `{ channel: "whatsapp", accountId: "personal" }`）。
- 要将单个私信/群组路由到 Opus，同时将其余消息保留在聊天中，请为该联系人添加 `match.peer` 绑定；联系人匹配规则优先于渠道级别的规则。

## 示例：同一渠道，一个联系人路由到 Opus

将 WhatsApp 保留在快速代理上，但将一个私信路由到 Opus：
json5
{
  agents: {
    list: [
      { id: "chat", name: "Everyday", workspace: "~/clawd-chat", model: "anthropic/claude-sonnet-4-5" },
      { id: "opus", name: "Deep Work", workspace: "~/clawd-opus", model: "anthropic/claude-opus-4-5" }
    ]
  },
  bindings: [
    { agentId: "opus", match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551234567" } } },
    { agentId: "chat", match: { channel: "whatsapp" } }
  ]
}``````
Peer bindings always win, so keep them above the channel-wide rule.

## 家庭代理绑定到 WhatsApp 群组

将专用的家庭代理绑定到一个 WhatsApp 群组，设置提及限制和更严格的工具策略：```json5
{
  agents: {
    list: [
      {
        id: "family",
        name: "Family",
        workspace: "~/clawd-family",
        identity: { name: "Family Bot" },
        groupChat: {
          mentionPatterns: ["@family", "@familybot", "@Family Bot"]
        },
        sandbox: {
          mode: "all",
          scope: "agent"
        },
        tools: {
          allow: ["exec", "read", "sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
          deny: ["write", "edit", "apply_patch", "browser", "canvas", "nodes", "cron"]
        }
      }
    ]
  },
  bindings: [
    {
      agentId: "family",
      match: {
        channel: "whatsapp",
        peer: { kind: "group", id: "120363999999999999@g.us" }
      }
    }
  ]
}
```
## 注意事项：
- 允许/拒绝列表是**工具**，而不是技能。如果某个技能需要运行二进制文件，请确保 `exec` 被允许，并且该二进制文件存在于沙箱中。
- 对于更严格的控制，请设置 `agents.list[].groupChat.mentionPatterns`，并保持频道的允许列表功能开启。

## 每个代理的沙箱和工具配置

从 v2026.1.6 版本开始，每个代理都可以拥有自己的沙箱和工具限制：
js
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/clawd-personal",
        sandbox: {
          mode: "off",  // 个人代理不使用沙箱
        },
        // 没有工具限制 - 所有工具可用
      },
      {
        id: "family",
        workspace: "~/clawd-family",
        sandbox: {
          mode: "all",     // 始终启用沙箱
          scope: "agent",  // 每个代理一个容器
          docker: {
            // 容器创建后可选的一次性设置命令
            setupCommand: "apt-get update && apt-get install -y git curl",
          },
        },
        tools: {
          allow: ["read"],                    // 仅允许读取工具
          deny: ["exec", "write", "edit", "apply_patch"],    // 拒绝其他工具
        },
      },
    ],
  },
}
`````````
注意：`setupCommand` 位于 `sandbox.docker` 下，并在容器创建时运行一次。
当解析的作用域为 `"shared"` 时，针对每个代理的 `sandbox.docker.*` 覆盖将被忽略。

**优势：**
- **安全隔离**：限制不受信任代理的工具
- **资源控制**：对沙箱特定代理进行隔离，同时保持其他代理在主机上
- **灵活策略**：每个代理有不同的权限

注意：`tools.elevated` 是**全局的**，基于发送者；它无法按代理配置。
如果需要按代理设置边界，请使用 `agents.list[].tools` 来拒绝 `exec`。
对于分组目标，使用 `agents.list[].groupChat.mentionPatterns` 以确保 @提及 正确映射到目标代理。

有关详细示例，请参见 [多代理沙箱与工具](/multi-agent-sandbox-tools)。