---
summary: "All configuration options for ~/.clawdbot/clawdbot.json with examples"
read_when:
  - Adding or modifying config fields
---

# 配置 🔧

Clawdbot 会从 `~/.clawdbot/clawdbot.json` 读取一个可选的 **JSON5** 配置文件（允许注释和尾随逗号）。

如果文件缺失，Clawdbot 会使用相对安全的默认值（内置的 Pi 代理 + 按发送者会话 + 工作区 `~/clawd`）。你通常只需要配置文件来：
- 限制谁可以触发机器人（`channels.whatsapp.allowFrom`, `channels.telegram.allowFrom` 等）
- 控制群组允许列表和提及行为（`channels.whatsapp.groups`, `channels.telegram.groups`, `channels.discord.guilds`, `agents.list[].groupChat`）
- 自定义消息前缀（`messages`）
- 设置代理的工作区（`agents.defaults.workspace` 或 `agents.list[].workspace`）
- 调整内置代理的默认值（`agents.defaults`）和会话行为（`session`）
- 设置每个代理的身份（`agents.list[].identity`）

> **刚开始配置？** 查看 [配置示例](/gateway/configuration-examples) 指南，获取完整的示例和详细说明！

## 严格配置验证

Clawdbot 仅接受完全匹配模式的配置。
未知的键、类型错误或无效值会导致网关 **拒绝启动**，以确保安全。

当验证失败时：
- 网关不会启动。
- 仅允许诊断命令（例如：`clawdbot doctor`, `clawdbot logs`, `clawdbot health`, `clawdbot status`, `clawdbot service`, `clawdbot help`）。
- 运行 `clawdbot doctor` 以查看具体问题。
- 运行 `clawdbot doctor --fix`（或 `--yes`）来应用迁移/修复。

医生命令只有在你明确选择 `--fix`/`--yes` 时才会写入更改。

## 模式 + UI 提示

网关通过 `config.schema` 暴露配置的 JSON 模式表示。
控制 UI 从该模式中渲染表单，并提供一个 **原始 JSON** 编辑器作为备用方式。

频道插件和扩展可以为它们的配置注册模式 + UI 提示，这样频道设置就可以在各个应用中保持模式驱动，而无需硬编码表单。

提示（标签、分组、敏感字段）与模式一起提供，因此客户端可以在不硬编码配置知识的情况下渲染出更优的表单。
bash
clawdbot gateway call config.get --params '{}' # capture payload.hash
clawdbot gateway call config.apply --params '{
  "raw": "{\\n  agents: { defaults: { workspace: \\"~/clawd\\" } }\\n}\\n",
  "baseHash": "<hash-from-config.get>",
  "sessionKey": "agent:main:whatsapp:dm:+15555550123",
  "restartDelayMs": 1000
}'
``````
## 部分更新（RPC）

使用 `config.patch` 将部分更新合并到现有配置中，而不会覆盖不相关的键。它采用 JSON 合并补丁语义：
- 对象会递归合并
- `null` 会删除一个键
- 数组会替换

与 `config.apply` 类似，它会验证配置、写入配置、存储一个重启标记，并计划网关重启（如果提供了 `sessionKey`，则会触发唤醒 ping）。

参数：
- `raw`（字符串）— 包含要更改的键的 JSON5 数据包
- `baseHash`（必需）— 来自 `config.get` 的配置哈希
- `sessionKey`（可选）— 最近活动的会话密钥，用于唤醒 ping
- `note`（可选）— 要包含在重启标记中的备注
- `restartDelayMs`（可选）— 重启前的延迟时间（默认 2000 毫秒）

示例：```bash
clawdbot gateway call config.get --params '{}' # capture payload.hash
clawdbot gateway call config.patch --params '{
  "raw": "{\\n  channels: { telegram: { groups: { \\"*\\": { requireMention: false } } } }\\n}\\n",
  "baseHash": "<hash-from-config.get>",
  "sessionKey": "agent:main:whatsapp:dm:+15555550123",
  "restartDelayMs": 1000
}'
```
## 最小配置（推荐起点）
json5
{
  agents: { defaults: { workspace: "~/clawd" } },
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}
``````
使用以下命令一次性构建默认镜像：```bash
scripts/sandbox-setup.sh
```
## 自我聊天模式（推荐用于群组控制）

为防止机器人在群组中对 WhatsApp 的 @-提及 作出回应（仅对特定文本触发词作出回应）：
json5
{
  agents: {
    defaults: { workspace: "~/clawd" },
    list: [
      {
        id: "main",
        groupChat: { mentionPatterns: ["@clawd", "reisponde"] }
      }
    ]
  },
  channels: {
    whatsapp: {
      // 允许列表仅限于私聊；包含你自己的号码将启用自我聊天模式。
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } }
    }
  }
}
``````
## 配置包含 (`$include`)

使用 `$include` 指令将配置拆分为多个文件。这在以下情况下非常有用：
- 组织大型配置（例如，按客户划分的代理定义）
- 在不同环境中共享通用设置
- 将敏感配置单独保存```json5
// ~/.clawdbot/clawdbot.json
{
  gateway: { port: 18789 },
  
  // Include a single file (replaces the key's value)
  agents: { "$include": "./agents.json5" },
  
  // Include multiple files (deep-merged in order)
  broadcast: { 
    "$include": [
      "./clients/mueller.json5",
      "./clients/schmidt.json5"
    ]
  }
}
```
"
json5
// ~/.clawdbot/agents.json5
{
  defaults: { sandbox: { mode: "all", scope: "session" } },
  list: [
    { id: "main", workspace: "~/clawd" }
  ]
}
```### 合并行为

- **单个文件**：替换包含 `$include` 的对象
- **文件数组**：按顺序深度合并（后面的文件会覆盖前面的文件）
- **包含兄弟键**：兄弟键在包含之后合并（会覆盖包含的值）
- **兄弟键 + 数组/基本类型**：不支持（包含的内容必须是对象）
json5
// 兄弟键会覆盖包含的值
{
  "$include": "./base.json5",   // { a: 1, b: 2 }
  b: 99                          // 结果：{ a: 1, b: 99 }
}
``````
### 嵌套包含

被包含的文件本身也可以包含 `$include` 指令（最多支持 10 层嵌套）：```json5
// clients/mueller.json5
{
  agents: { "$include": "./mueller/agents.json5" },
  broadcast: { "$include": "./mueller/broadcast.json5" }
}
```
### 路径解析

- **相对路径**：相对于包含文件进行解析
- **绝对路径**：直接使用
- **父目录**：`../` 的引用按预期工作
json5
{ "$include": "./sub/config.json5" }      // 相对路径
{ "$include": "/etc/clawdbot/base.json5" } // 绝对路径
{ "$include": "../shared/common.json5" }   // 父目录
``````
### 错误处理

- **文件缺失**：显示清晰的错误信息及解析后的路径
- **解析错误**：显示哪个包含的文件失败了
- **循环包含**：检测并报告包含链```json5
// ~/.clawdbot/clawdbot.json
{
  gateway: { port: 18789, auth: { token: "secret" } },
  
  // Common agent defaults
  agents: {
    defaults: {
      sandbox: { mode: "all", scope: "session" }
    },
    // Merge agent lists from all clients
    list: { "$include": [
      "./clients/mueller/agents.json5",
      "./clients/schmidt/agents.json5"
    ]}
  },
  
  // Merge broadcast configs
  broadcast: { "$include": [
    "./clients/mueller/broadcast.json5",
    "./clients/schmidt/broadcast.json5"
  ]},
  
  channels: { whatsapp: { groupPolicy: "allowlist" } }
}
```
// ~/.clawdbot/clients/mueller/agents.json5
[
  { id: "mueller-transcribe", workspace: "~/clients/mueller/transcribe" },
  { id: "mueller-docs", workspace: "~/clients/mueller/docs" }
]```
```md
// ~/.clawdbot/clients/mueller/broadcast.json5
{
  "120363403215116621@g.us": ["mueller-transcribe", "mueller-docs"]
}```
## 常见选项

### 环境变量 + `.env`

Clawdbot 从父进程（shell、launchd/systemd、CI 等）中读取环境变量。

此外，它还会加载：
- 当前工作目录中的 `.env` 文件（如果存在）
- 全局回退的 `.env` 文件，位于 `~/.clawdbot/.env`（即 `$CLAWDBOT_STATE_DIR/.env`）

这两个 `.env` 文件都不会覆盖已有的环境变量。

你也可以在配置中直接提供环境变量。这些变量仅在进程环境变量中缺少该键时才会被应用（遵循相同的非覆盖规则）：```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: {
      GROQ_API_KEY: "gsk-..."
    }
  }
}
```
请参阅 [/environment](/environment) 以获取完整的优先级和来源信息。

### `env.shellEnv`（可选）

选择性便利功能：如果启用，并且当前尚未设置任何预期的键，则 Clawdbot 会运行您的登录 shell 并仅导入缺失的预期键（从不覆盖）。
这实际上会加载您的 shell 配置文件。
json5
{
  env: {
    shellEnv: {
      enabled: true,
      timeoutMs: 15000
    }
  }
}
``````
环境变量对应值：
- `CLAWDBOT_LOAD_SHELL_ENV=1`
- `CLAWDBOT_SHELL_ENV_TIMEOUT_MS=15000`

### 配置中的环境变量替换

你可以在任何配置字符串值中直接通过 `${VAR_NAME}` 语法引用环境变量。变量会在配置加载时进行替换，替换发生在验证之前。```json5
{
  models: {
    providers: {
      "vercel-gateway": {
        apiKey: "${VERCEL_GATEWAY_API_KEY}"
      }
    }
  },
  gateway: {
    auth: {
      token: "${CLAWDBOT_GATEWAY_TOKEN}"
    }
  }
}
```
**规则：**
- 仅匹配大写的环境变量名称：`[A-Z_][A-Z0-9_]*`
- 缺失或为空的环境变量会在配置加载时抛出错误
- 使用 `$${VAR}` 来输出一个字面量 `${VAR}`
- 支持 `$include`（包含的文件也会进行替换）
json5
{
  models: {
    providers: {
      custom: {
        baseUrl: "${CUSTOM_API_BASE}/v1"  // → "https://api.example.com/v1"
      }
    }
  }
}
``````
### 认证存储（OAuth + API 密钥）

Clawdbot 会将 **每个代理** 的认证配置（OAuth + API 密钥）存储在：
- `<agentDir>/auth-profiles.json`（默认路径：`~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`）

另请参阅：[/concepts/oauth](/concepts/oauth)

旧版 OAuth 导入：
- `~/.clawdbot/credentials/oauth.json`（或 `$CLAWDBOT_STATE_DIR/credentials/oauth.json`）

嵌入式 Pi 代理会在以下位置维护运行时缓存：
- `<agentDir>/auth.json`（由系统自动管理；请勿手动编辑）

旧版代理目录（多代理之前）：
- `~/.clawdbot/agent/*`（通过 `clawdbot doctor` 迁移至 `~/.clawdbot/agents/<defaultAgentId>/agent/*`）

覆盖设置：
- OAuth 目录（仅限旧版导入）：`CLAWDBOT_OAUTH_DIR`
- 代理目录（默认代理根目录覆盖）：`CLAWDBOT_AGENT_DIR`（推荐），`PI_CODING_AGENT_DIR`（旧版）

首次使用时，Clawdbot 会将 `oauth.json` 中的条目导入到 `auth-profiles.json` 中。

Clawdbot 还会自动将外部 CLI 的 OAuth 令牌同步到 `auth-profiles.json`（当在网关主机上存在时）：
- Claude Code → `anthropic:claude-cli`
  - macOS：Keychain 中的条目 "Claude Code-credentials"（选择“始终允许”以避免 launchd 提示）
  - Linux/Windows：`~/.claude/.credentials.json`
- `~/.codex/auth.json`（Codex CLI）→ `openai-codex:codex-cli`

### `auth`

认证配置的可选元数据。这 **不会** 存储敏感信息；它将配置文件 ID 映射到提供者 + 模式（以及可选的邮箱），并定义用于故障转移的提供者轮换顺序。```json5
{
  auth: {
    profiles: {
      "anthropic:me@example.com": { provider: "anthropic", mode: "oauth", email: "me@example.com" },
      "anthropic:work": { provider: "anthropic", mode: "api_key" }
    },
    order: {
      anthropic: ["anthropic:me@example.com", "anthropic:work"]
    }
  }
}
```
注意：即使存储的凭证是 setup-token，也应使用 `mode: "oauth"`。Clawdbot 会自动迁移之前使用 `mode: "token"` 的配置。

### `agents.list[].identity`

用于默认值和用户体验的可选代理身份信息。这是由 macOS 引导助手写入的。

如果设置了此字段，Clawdbot 会根据**当前代理**的 `identity.emoji` 推导默认值（如果未显式设置）：
- `messages.ackReaction` 从当前代理的 `identity.emoji` 获取（若未设置则回退为 👀）
- `agents.list[].groupChat.mentionPatterns` 从代理的 `identity.name` 或 `identity.emoji` 获取（这样在 Telegram/Slack/Discord/Google Chat/iMessage/WhatsApp 等群组中，“@Samantha” 就可以正常工作）

`identity.avatar` 支持：
- 工作区相对路径（必须位于代理工作区内）
- `http(s)` 协议的 URL
- `data:` 协议的 URI
json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "Samantha",
          theme: "helpful sloth",
          emoji: "🦥",
          avatar: "avatars/samantha.png"
        }
      }
    ]
  }
}
``````
### `wizard`

由 CLI 向导（`onboard`、`configure`、`doctor`）编写的元数据。```json5
{
  wizard: {
    lastRunAt: "2026-01-01T00:00:00.000Z",
    lastRunVersion: "2026.1.4",
    lastRunCommit: "abc1234",
    lastRunCommand: "configure",
    lastRunMode: "local"
  }
}
```
### `logging`

- 默认日志文件：`/tmp/clawdbot/clawdbot-YYYY-MM-DD.log`
- 如果你想使用一个稳定的路径，请将 `logging.file` 设置为 `/tmp/clawdbot/clawdbot.log`。
- 控制台输出可以通过以下选项单独调整：
  - `logging.consoleLevel`（默认为 `info`，当使用 `--verbose` 时提升为 `debug`）
  - `logging.consoleStyle`（`pretty` | `compact` | `json`）
- 工具摘要可以被脱敏以避免泄露敏感信息：
  - `logging.redactSensitive`（`off` | `tools`，默认：`tools`）
  - `logging.redactPatterns`（正则表达式字符串数组；覆盖默认设置）
json5
{
  logging: {
    level: "info",
    file: "/tmp/clawdbot/clawdbot.log",
    consoleLevel: "info",
    consoleStyle: "pretty",
    redactSensitive: "tools",
    redactPatterns: [
      // 示例：使用你自己的规则覆盖默认设置。
      "\\bTOKEN\\b\\s*[=:]\\s*([\"']?)([^\\s\"']+)\\1",
      "/\\bsk-[A-Za-z0-9_-]{8,}\\b/gi"
    ]
  }
}
``````
### `channels.whatsapp.dmPolicy`

控制如何处理 WhatsApp 私人聊天（DM）：
- `"pairing"`（默认）：未知发件人会收到一个配对码；需所有者批准
- `"allowlist"`：仅允许 `channels.whatsapp.allowFrom` 中的发件人（或配对允许的商店）
- `"open"`：允许所有入站 DM（**需要** `channels.whatsapp.allowFrom` 包含 `"*"`）
- `"disabled"`：忽略所有入站 DM

配对码在一小时后过期；机器人仅在创建新请求时发送配对码。默认情况下，待处理的 DM 配对请求上限为 **每频道 3 个**。

配对批准：
- `clawdbot pairing list whatsapp`
- `clawdbot pairing approve whatsapp <code>`

### `channels.whatsapp.allowFrom`

可以触发 WhatsApp 自动回复的 E.164 电话号码白名单（**仅限 DM**）。
如果为空且 `channels.whatsapp.dmPolicy="pairing"`，未知发件人将收到一个配对码。
对于群组，请使用 `channels.whatsapp.groupPolicy` + `channels.whatsapp.groupAllowFrom`。```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "pairing", // pairing | allowlist | open | disabled
      allowFrom: ["+15555550123", "+447700900123"],
      textChunkLimit: 4000, // optional outbound chunk size (chars)
      chunkMode: "length", // optional chunking mode (length | newline)
      mediaMaxMb: 50 // optional inbound media cap (MB)
    }
  }
}
```
### `channels.whatsapp.sendReadReceipts`

控制是否将传入的 WhatsApp 消息标记为已读（蓝色对勾）。默认值：`true`。

在自我聊天模式下，即使已启用，也会跳过已读回执。

按账户覆盖设置：`channels.whatsapp.accounts.<id>.sendReadReceipts`。
json5
{
  channels: {
    whatsapp: { sendReadReceipts: false }
  }
}
``````
### `channels.whatsapp.accounts`（多账号）

在一个网关中运行多个 WhatsApp 账号：```json5
{
  channels: {
    whatsapp: {
      accounts: {
        default: {}, // optional; keeps the default id stable
        personal: {},
        biz: {
          // Optional override. Default: ~/.clawdbot/credentials/whatsapp/biz
          // authDir: "~/.clawdbot/credentials/whatsapp/biz",
        }
      }
    }
  }
}
```
注意事项：
- 如果存在，则出站命令默认使用账户 `default`；否则使用第一个配置的账户 ID（按顺序排序）。
- 旧版的单账户 Baileys 身份验证目录会通过 `clawdbot doctor` 迁移至 `whatsapp/default`。

### `channels.telegram.accounts` / `channels.discord.accounts` / `channels.googlechat.accounts` / `channels.slack.accounts` / `channels.mattermost.accounts` / `channels.signal.accounts` / `channels.imessage.accounts`

每个频道可以运行多个账户（每个账户拥有自己的 `accountId` 和可选的 `name`）：
json5
{
  channels: {
    telegram: {
      accounts: {
        default: {
          name: "主机器人",
          botToken: "123456:ABC..."
        },
        alerts: {
          name: "警报机器人",
          botToken: "987654:XYZ..."
        }
      }
    }
  }
}
``````
说明：
- `default` 在 `accountId` 被省略时使用（CLI + 路由）。
- 环境令牌仅适用于 **默认** 账户。
- 基础频道设置（群组策略、@提醒限制等）适用于所有账户，除非按账户覆盖。

使用 `bindings[].match.accountId` 将每个账户路由到不同的 `agents.defaults`。

### 群组聊天 @提醒限制（`agents.list[].groupChat` + `messages.groupChat`）

群组消息默认设置为 **需要提及**（Either metadata 提及或正则表达式模式）。适用于 WhatsApp、Telegram、Discord、Google Chat 和 iMessage 的群组聊天。

**提及类型：**
- **Metadata 提及**：平台原生的 @ 提及（例如 WhatsApp 的点击提及功能）。在 WhatsApp 自己聊天模式下会被忽略（参见 `channels.whatsapp.allowFrom`）。
- **文本模式**：在 `agents.list[].groupChat.mentionPatterns` 中定义的正则表达式模式。无论是否处于自己聊天模式都会被检查。
- @提醒限制仅在可以检测到提及的情况下生效（原生提及或至少一个 `mentionPattern`）。```json5
{
  messages: {
    groupChat: { historyLimit: 50 }
  },
  agents: {
    list: [
      { id: "main", groupChat: { mentionPatterns: ["@clawd", "clawdbot", "clawd"] } }
    ]
  }
}
```
`messages.groupChat.historyLimit` 用于设置群组历史记录的全局默认值。频道可以通过 `channels.<channel>.historyLimit`（或在多账号情况下使用 `channels.<channel>.accounts.*.historyLimit`）进行覆盖。将值设为 `0` 可以禁用历史记录包裹功能。

#### 私信历史记录限制

私信对话使用由代理管理的会话级历史记录。你可以限制每个私信会话中保留的用户交互次数：
json5
{
  channels: {
    telegram: {
      dmHistoryLimit: 30,  // 限制私信会话中的用户交互次数为 30 次
      dms: {
        "123456789": { historyLimit: 50 }  // 用户ID的单独覆盖设置
      }
    }
  }
}
``````
优先级顺序：
1. 按用户覆盖：`channels.<provider>.dms[userId].historyLimit`
2. 供应商默认值：`channels.<provider>.dmHistoryLimit`
3. 无限制（保留所有历史记录）

支持的供应商：`telegram`、`whatsapp`、`discord`、`slack`、`signal`、`imessage`、`msteams`。

按代理覆盖（设置时具有优先级，即使为 `[]`）：```json5
{
  agents: {
    list: [
      { id: "work", groupChat: { mentionPatterns: ["@workbot", "\\+15555550123"] } },
      { id: "personal", groupChat: { mentionPatterns: ["@homebot", "\\+15555550999"] } }
    ]
  }
}
```
提及过滤器默认按频道开启（`channels.whatsapp.groups`、`channels.telegram.groups`、`channels.imessage.groups`、`channels.discord.guilds`）。当设置 `*.groups` 时，它也会作为群组白名单；若要允许所有群组，请包含 `"*"`。

要**仅**对特定文本触发词作出响应（忽略原生的 @-提及）：
json5
{
  channels: {
    whatsapp: {
      // 将你的号码包含在内以启用自定义聊天模式（忽略原生的 @-提及）。
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } }
    }
  },
  agents: {
    list: [
      {
        id: "main",
        groupChat: {
          // 只有这些文本模式会触发回复
          mentionPatterns: ["reisponde", "@clawd"]
        }
      }
    ]
  }
}
``````
### 每个频道的组策略

使用 `channels.*.groupPolicy` 来控制是否接受组/房间消息：```json5
{
  channels: {
    whatsapp: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"]
    },
    telegram: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["tg:123456789", "@alice"]
    },
    signal: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"]
    },
    imessage: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["chat_id:123"]
    },
    msteams: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["user@org.com"]
    },
    discord: {
      groupPolicy: "allowlist",
      guilds: {
        "GUILD_ID": {
          channels: { help: { allow: true } }
        }
      }
    },
    slack: {
      groupPolicy: "allowlist",
      channels: { "#general": { allow: true } }
    }
  }
}
```
### 注意事项：
- `"open"`：允许所有群组；仍需遵守提及限制。
- `"disabled"`：阻止所有群组/房间消息。
- `"allowlist"`：仅允许与配置的允许列表匹配的群组/房间。
- `channels.defaults.groupPolicy` 设置当提供者未设置 `groupPolicy` 时的默认值。
- WhatsApp/Telegram/Signal/iMessage/Microsoft Teams 使用 `groupAllowFrom`（回退：显式的 `allowFrom`）。
- Discord/Slack 使用频道允许列表（`channels.discord.guilds.*.channels`, `channels.slack.channels`）。
- 群组私信（Discord/Slack）仍由 `dm.groupEnabled` + `dm.groupChannels` 控制。
- 默认为 `groupPolicy: "allowlist"`（除非被 `channels.defaults.groupPolicy` 覆盖）；如果没有配置允许列表，群组消息将被阻止。

### 多代理路由（`agents.list` + `bindings`）

在一个 Gateway 中运行多个隔离的代理（独立的工作空间，`agentDir`，会话）。
入站消息通过 `bindings` 路由到对应的代理。- `agents.list[]`: 每个代理的覆盖配置。
  - `id`: 稳定的代理ID（必填）。
  - `default`: 可选；当设置多个时，第一个生效并记录警告。
    如果未设置，则**列表中的第一个条目**为默认代理。
  - `name`: 代理的显示名称。
  - `workspace`: 默认为 `~/clawd-<agentId>`（对于 `main` 代理，会回退到 `agents.defaults.workspace`）。
  - `agentDir`: 默认为 `~/.clawdbot/agents/<agentId>/agent`。
  - `model`: 每个代理的默认模型，覆盖该代理的 `agents.defaults.model`。
    - 字符串形式：`"provider/model"`，仅覆盖 `agents.defaults.model.primary`。
    - 对象形式：`{ primary, fallbacks }`（fallbacks 覆盖 `agents.defaults.model.fallbacks`；`[]` 会禁用全局 fallbacks）。
  - `identity`: 每个代理的名称/主题/表情符号（用于提及模式 + 确认反应）。
  - `groupChat`: 每个代理的提及控制（`mentionPatterns`）。
  - `sandbox`: 每个代理的沙箱配置（覆盖 `agents.defaults.sandbox`）。
    - `mode`: `"off"` | `"non-main"` | `"all"`
    - `workspaceAccess`: `"none"` | `"ro"` | `"rw"`
    - `scope`: `"session"` | `"agent"` | `"shared"`
    - `workspaceRoot`: 自定义沙箱工作区根目录
    - `docker`: 每个代理的 Docker 覆盖配置（如 `image`、`network`、`env`、`setupCommand`、limits；当 `scope: "shared"` 时被忽略）
    - `browser`: 每个代理的沙箱浏览器覆盖配置（当 `scope: "shared"` 时被忽略）
    - `prune`: 每个代理的沙箱清理覆盖配置（当 `scope: "shared"` 时被忽略）
  - `subagents`: 每个代理的子代理默认配置。
    - `allowAgents`: 允许从该代理启动 `sessions_spawn` 的代理ID白名单（`["*"]` 表示允许任何；默认：仅允许同一代理）。
  - `tools`: 每个代理的工具限制（在沙箱工具策略之前应用）。
    - `profile`: 基础工具配置文件（在允许/拒绝之前应用）
    - `allow`: 允许的工具名称数组
    - `deny`: 拒绝的工具名称数组（拒绝优先）

- `agents.defaults`: 共享的代理默认配置（模型、工作区、沙箱等）。
- `bindings[]`: 将入站消息路由到某个 `agentId`。
  - `match.channel`（必填）
  - `match.accountId`（可选；`*` 表示任何账户；省略表示默认账户）
  - `match.peer`（可选；`{ kind: dm|group|channel, id }`）
  - `match.guildId` / `match.teamId`（可选；与频道相关）

确定性匹配顺序：
1) `match.peer`
2) `match.guildId`
3) `match.teamId`
4) `match.accountId`（精确匹配，不包含 peer/guild/team）
5) `match.accountId: "*"`（频道范围匹配，不包含 peer/guild/team）
6) 默认代理（`agents.list[].default`，否则为列表中的第一个条目，否则为 `"main"`）

在每个匹配层级中，`bindings` 中第一个匹配的条目将被优先使用。

#### 每个代理的访问配置文件（多代理）

每个代理可以拥有自己的沙箱和工具策略。可用于在同一个网关中混合访问级别：
- **全权限**（个人代理）
- **只读工具 + 工作区**
- **无文件系统访问**（仅限消息/会话工具）

有关优先级和更多示例，请参见 [多代理沙箱与工具](/multi-agent-sandbox-tools)。{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/clawd-personal",
        sandbox: { mode: "off" }
      }
    ]
  }
}```
只读工具 + 只读工作区：```json5
{
  agents: {
    list: [
      {
        id: "family",
        workspace: "~/clawd-family",
        sandbox: {
          mode: "all",
          scope: "agent",
          workspaceAccess: "ro"
        },
        tools: {
          allow: ["read", "sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
          deny: ["write", "edit", "apply_patch", "exec", "process", "browser"]
        }
      }
    ]
  }
}
```
无文件系统访问（启用消息/会话工具）：
json5
{
  agents: {
    list: [
      {
        id: "public",
        workspace: "~/clawd-public",
        sandbox: {
          mode: "all",
          scope: "agent",
          workspaceAccess: "none"
        },
        tools: {
          allow: ["sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status", "whatsapp", "telegram", "slack", "discord", "gateway"],
          deny: ["read", "write", "edit", "apply_patch", "exec", "process", "browser", "canvas", "nodes", "cron", "gateway", "image"]
        }
      }
    ]
  }
}
``````
示例：两个 WhatsApp 账户 → 两个代理：```json5
{
  agents: {
    list: [
      { id: "home", default: true, workspace: "~/clawd-home" },
      { id: "work", workspace: "~/clawd-work" }
    ]
  },
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } }
  ],
  channels: {
    whatsapp: {
      accounts: {
        personal: {},
        biz: {},
      }
    }
  }
}
```
### `tools.agentToAgent`（可选）

代理间消息传递是可选的：
json5
{
  tools: {
    agentToAgent: {
      enabled: false,
      allow: ["home", "work"]
    }
  }
}
``````
### `messages.queue`

控制当代理运行已经激活时，传入消息的行为。```json5
{
  messages: {
    queue: {
      mode: "collect", // steer | followup | collect | steer-backlog (steer+backlog ok) | interrupt (queue=steer legacy)
      debounceMs: 1000,
      cap: 20,
      drop: "summarize", // old | new | summarize
      byChannel: {
        whatsapp: "collect",
        telegram: "collect",
        discord: "collect",
        imessage: "collect",
        webchat: "collect"
      }
    }
  }
}
```
### `messages.inbound`

对来自**同一发送者**的快速入站消息进行防抖处理，使连续的消息变为一次代理回复。防抖处理是按渠道 + 会话作用域进行的，并使用最新消息用于回复的线程/ID。
json5
{
  messages: {
    inbound: {
      debounceMs: 2000, // 0 表示禁用
      byChannel: {
        whatsapp: 5000,
        slack: 1500,
        discord: 1500
      }
    }
  }
}
```注意事项：
- 对**纯文本**消息进行防抖处理；媒体/附件消息会立即发送。
- 控制命令（例如 `/queue`, `/new`）会绕过防抖处理，因此它们会单独执行。

### `commands`（聊天命令处理）

控制聊天命令在各个连接器上的启用情况。
json5
{
  commands: {
    native: "auto",         // 在支持时注册原生命令（auto）
    text: true,             // 解析聊天消息中的斜杠命令
    bash: false,            // 允许 !（别名：/bash）（仅限主机；需要 tools.elevated 的允许列表）
    bashForegroundMs: 2000, // bash 前台窗口（0 表示立即后台运行）
    config: false,          // 允许 /config（写入磁盘）
    debug: false,           // 允许 /debug（仅限运行时覆盖）
    restart: false,         // 允许 /restart 以及网关重启工具
    useAccessGroups: true   // 为命令强制执行访问组允许列表/策略
  }
}
``````
注意事项：
- 文本命令必须作为**独立**消息发送，并使用前缀 `/`（不支持纯文本别名）。
- `commands.text: false` 会禁用对聊天消息中命令的解析。
- `commands.native: "auto"`（默认值）会在 Discord/Telegram 上启用原生命令，而 Slack 则关闭；不支持的频道则保持文本模式。
- 设置 `commands.native: true|false` 可以强制启用或禁用所有命令，也可以通过 `channels.discord.commands.native`、`channels.telegram.commands.native`、`channels.slack.commands.native`（布尔值或 `"auto"`）分别设置每个频道的选项。`false` 会在启动时清除 Discord/Telegram 上之前注册的命令；Slack 命令由 Slack 应用管理。
- `channels.telegram.customCommands` 可以添加额外的 Telegram 机器人菜单项。名称会进行标准化处理；与原生命令冲突的会被忽略。
- `commands.bash: true` 会启用 `! <cmd>` 来运行主机上的 shell 命令（`/bash <cmd>` 也可以作为别名使用）。需要 `tools.elevated.enabled` 并在 `tools.elevated.allowFrom.<channel>` 中允许发送者。
- `commands.bashForegroundMs` 控制 bash 在后台运行前等待的时间。当一个 bash 任务正在运行时，新的 `! <cmd>` 请求将被拒绝（一次一个）。
- `commands.config: true` 启用 `/config`（读取/写入 `clawdbot.json`）。
- `channels.<provider>.configWrites` 控制由该频道发起的配置修改（默认：true）。这包括 `/config set|unset` 以及特定于平台的自动迁移（如 Telegram 超级群 ID 变化、Slack 频道 ID 变化）。
- `commands.debug: true` 启用 `/debug`（仅在运行时覆盖）。
- `commands.restart: true` 启用 `/restart` 和网关工具的重启操作。
- `commands.useAccessGroups: false` 允许命令绕过访问组的允许列表/策略。

### `web`（WhatsApp 网页频道运行时）

WhatsApp 通过网关的网页频道（Baileys Web）运行。当存在已链接的会话时，会自动启动。
设置 `web.enabled: false` 可以默认保持关闭状态。```json5
{
  web: {
    enabled: true,
    heartbeatSeconds: 60,
    reconnect: {
      initialMs: 2000,
      maxMs: 120000,
      factor: 1.4,
      jitter: 0.2,
      maxAttempts: 0
    }
  }
}
```
### `channels.telegram`（机器人传输方式）

当存在 `channels.telegram` 配置部分时，Clawdbot 会启动 Telegram。机器人的令牌通过 `channels.telegram.botToken`（或 `channels.telegram.tokenFile`）解析，`TELEGRAM_BOT_TOKEN` 作为默认账户的备用选项。  
将 `channels.telegram.enabled: false` 设置为禁用自动启动。  
多账户支持位于 `channels.telegram.accounts` 下（参见上方的多账户部分）。环境变量令牌仅适用于默认账户。  
将 `channels.telegram.configWrites: false` 设置为阻止 Telegram 引发的配置写入（包括超级群组 ID 迁移和 `/config set|unset` 命令）。
json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "your-bot-token",
      dmPolicy: "pairing",                 // pairing | allowlist | open | disabled
      allowFrom: ["tg:123456789"],         // 可选；"open" 需要 ["*"]
      groups: {
        "*": { requireMention: true },
        "-1001234567890": {
          allowFrom: ["@admin"],
          systemPrompt: "保持回答简洁。",
          topics: {
            "99": {
              requireMention: false,
              skills: ["search"],
              systemPrompt: "紧扣主题。"
            }
          }
        }
      },
      customCommands: [
        { command: "backup", description: "Git 备份" },
        { command: "generate", description: "生成一张图片" }
      ],
      historyLimit: 50,                     // 包含最后 N 条群组消息作为上下文（0 表示禁用）
      replyToMode: "first",                 // off | first | all
      linkPreview: true,                   // 切换出站链接预览
      streamMode: "partial",               // off | partial | block（草稿流模式；与块流模式分开）
      draftChunk: {                        // 可选；仅在 streamMode=block 时使用
        minChars: 200,
        maxChars: 800,
        breakPreference: "paragraph"       // paragraph | newline | sentence
      },
      actions: { reactions: true, sendMessage: true }, // 工具操作开关（false 表示禁用）
      reactionNotifications: "own",   // off | own | all
      mediaMaxMb: 5,
      retry: {                             // 出站重试策略
        attempts: 3,
        minDelayMs: 400,
        maxDelayMs: 30000,
        jitter: 0.1
      },
      proxy: "socks5://localhost:9050",
      webhookUrl: "https://example.com/telegram-webhook",
      webhookSecret: "secret",
      webhookPath: "/telegram-webhook"
    }
  }
}
``````
流式传输说明：
- 使用 Telegram 的 `sendMessageDraft`（草稿气泡，不是真实消息）。
- 需要 **私有聊天主题**（在 DM 中为 message_thread_id；机器人已启用主题功能）。
- `/reasoning stream` 会将推理过程流式传输到草稿中，然后发送最终答案。
重试策略的默认值和行为在 [重试策略](/concepts/retry) 中有文档说明。

### `channels.discord`（机器人传输方式）

通过设置机器人的令牌和可选的访问控制来配置 Discord 机器人：
多账号支持位于 `channels.discord.accounts` 下（请参见上方的多账号部分）。环境变量令牌仅适用于默认账号。```json5
{
  channels: {
    discord: {
      enabled: true,
      token: "your-bot-token",
      mediaMaxMb: 8,                          // clamp inbound media size
      allowBots: false,                       // allow bot-authored messages
      actions: {                              // tool action gates (false disables)
        reactions: true,
        stickers: true,
        polls: true,
        permissions: true,
        messages: true,
        threads: true,
        pins: true,
        search: true,
        memberInfo: true,
        roleInfo: true,
        roles: false,
        channelInfo: true,
        voiceStatus: true,
        events: true,
        moderation: false
      },
      replyToMode: "off",                     // off | first | all
      dm: {
        enabled: true,                        // disable all DMs when false
        policy: "pairing",                    // pairing | allowlist | open | disabled
        allowFrom: ["1234567890", "steipete"], // optional DM allowlist ("open" requires ["*"])
        groupEnabled: false,                 // enable group DMs
        groupChannels: ["clawd-dm"]          // optional group DM allowlist
      },
      guilds: {
        "123456789012345678": {               // guild id (preferred) or slug
          slug: "friends-of-clawd",
          requireMention: false,              // per-guild default
          reactionNotifications: "own",       // off | own | all | allowlist
          users: ["987654321098765432"],      // optional per-guild user allowlist
          channels: {
            general: { allow: true },
            help: {
              allow: true,
              requireMention: true,
              users: ["987654321098765432"],
              skills: ["docs"],
              systemPrompt: "Short answers only."
            }
          }
        }
      },
      historyLimit: 20,                       // include last N guild messages as context
      textChunkLimit: 2000,                   // optional outbound text chunk size (chars)
      chunkMode: "length",                    // optional chunking mode (length | newline)
      maxLinesPerMessage: 17,                 // soft max lines per message (Discord UI clipping)
      retry: {                                // outbound retry policy
        attempts: 3,
        minDelayMs: 500,
        maxDelayMs: 30000,
        jitter: 0.1
      }
    }
  }
}
```
Clawdbot 仅在存在 `channels.discord` 配置部分时才会启动 Discord。`token` 从 `channels.discord.token` 解析，`DISCORD_BOT_TOKEN` 作为默认账户的回退（除非 `channels.discord.enabled` 设置为 `false`）。在指定 cron/CLI 命令的交付目标时，使用 `user:<id>`（私信）或 `channel:<id>`（服务器频道）；纯数字 ID 会产生歧义并被拒绝。

服务器别名（guild slugs）为小写，空格替换为 `-`；频道键使用别名化的频道名称（不带前缀 `#`）。优先使用服务器 ID 作为键，以避免重命名带来的歧义。

默认情况下，机器人发布的消息会被忽略。可通过 `channels.discord.allowBots` 启用。自己的消息仍会被过滤，以防止自我回复循环。

反应通知模式：
- `off`：不接收反应事件。
- `own`：仅接收机器人自己消息上的反应（默认）。
- `all`：接收所有消息上的所有反应。
- `allowlist`：接收 `guilds.<id>.users` 列表中用户的所有消息上的反应（空列表则禁用）。

出站文本会根据 `channels.discord.textChunkLimit` 进行分块（默认为 2000）。设置 `channels.discord.chunkMode="newline"` 可在长度分块前按空行（段落边界）进行分割。Discord 客户端可能会截断非常长的消息，因此 `channels.discord.maxLinesPerMessage`（默认为 17）会在字符数低于 2000 时，仍对长的多行回复进行分割。

重试策略的默认值和行为在 [重试策略](/concepts/retry) 中有文档说明。

### `channels.googlechat`（Chat API 网络钩子）

Google Chat 通过 HTTP 网络钩子运行，并使用应用级认证（服务账户）。
多账户支持位于 `channels.googlechat.accounts` 下（请参见上方的多账户部分）。环境变量仅适用于默认账户。
json5
{
  channels: {
    "googlechat": {
      enabled: true,
      serviceAccountFile: "/path/to/service-account.json",
      audienceType: "app-url",             // app-url | project-number
      audience: "https://gateway.example.com/googlechat",
      webhookPath: "/googlechat",
      botUser: "users/1234567890",        // 可选；提升@检测
      dm: {
        enabled: true,
        policy: "pairing",                // pairing | allowlist | open | disabled
        allowFrom: ["users/1234567890"]   // 可选；"open" 需要 ["*"]
      },
      groupPolicy: "allowlist",
      groups: {
        "spaces/AAAA": { allow: true, requireMention: true }
      },
      actions: { reactions: true },
      typingIndicator: "message",
      mediaMaxMb: 20
    }
  }
}
``````
注意事项：
- 服务账户的 JSON 可以是内联的（`serviceAccount`）或基于文件的（`serviceAccountFile`）。
- 默认账户的环境变量回退：`GOOGLE_CHAT_SERVICE_ACCOUNT` 或 `GOOGLE_CHAT_SERVICE_ACCOUNT_FILE`。
- `audienceType` + `audience` 必须与 Chat 应用的 Webhook 认证配置匹配。
- 设置交付目标时，请使用 `spaces/<spaceId>` 或 `users/<userId|email>`。```json5
{
  channels: {
    slack: {
      enabled: true,
      botToken: "xoxb-...",
      appToken: "xapp-...",
      dm: {
        enabled: true,
        policy: "pairing", // pairing | allowlist | open | disabled
        allowFrom: ["U123", "U456", "*"], // optional; "open" requires ["*"]
        groupEnabled: false,
        groupChannels: ["G123"]
      },
      channels: {
        C123: { allow: true, requireMention: true, allowBots: false },
        "#general": {
          allow: true,
          requireMention: true,
          allowBots: false,
          users: ["U123"],
          skills: ["docs"],
          systemPrompt: "Short answers only."
        }
      },
      historyLimit: 50,          // include last N channel/group messages as context (0 disables)
      allowBots: false,
      reactionNotifications: "own", // off | own | all | allowlist
      reactionAllowlist: ["U123"],
      replyToMode: "off",           // off | first | all
      thread: {
        historyScope: "thread",     // thread | channel
        inheritParent: false
      },
      actions: {
        reactions: true,
        messages: true,
        pins: true,
        memberInfo: true,
        emojiList: true
      },
      slashCommand: {
        enabled: true,
        name: "clawd",
        sessionPrefix: "slack:slash",
        ephemeral: true
      },
      textChunkLimit: 4000,
      chunkMode: "length",
      mediaMaxMb: 20
    }
  }
}
```
多账户支持位于 `channels.slack.accounts` 下（请参见上方的多账户部分）。环境变量令牌仅适用于默认账户。

当提供者启用且两个令牌都已设置时（通过配置或 `SLACK_BOT_TOKEN` + `SLACK_APP_TOKEN`），Clawdbot 会启动 Slack。在指定 cron/CLI 命令的交付目标时，请使用 `user:<id>`（私聊）或 `channel:<id>`。

设置 `channels.slack.configWrites: false` 以阻止由 Slack 引发的配置写入（包括频道 ID 迁移和 `/config set|unset`）。

默认情况下，由机器人发布的消息会被忽略。可以通过 `channels.slack.allowBots` 或 `channels.slack.channels.<id>.allowBots` 启用。

反应通知模式：
- `off`: 不接收反应事件。
- `own`: 仅接收机器人自己消息的反应（默认）。
- `all`: 接收所有消息的所有反应。
- `allowlist`: 接收来自 `channels.slack.reactionAllowlist` 列表中的反应，适用于所有消息（空列表将禁用此功能）。

线程会话隔离：
- `channels.slack.thread.historyScope` 控制线程历史记录是按线程独立（`thread`，默认）还是在频道内共享（`channel`）。
- `channels.slack.thread.inheritParent` 控制新线程会话是否继承父频道的对话记录（默认：false）。

Slack 操作组（门控 `slack` 工具操作）：
| 操作组 | 默认状态 | 说明 |
| --- | --- | --- |
| reactions | 启用 | 添加反应 + 列出反应 |
| messages | 启用 | 读取/发送/编辑/删除消息 |
| pins | 启用 | 置顶/取消置顶 + 列出置顶内容 |
| memberInfo | 启用 | 成员信息 |
| emojiList | 启用 | 自定义表情列表 |

### `channels.mattermost`（机器人令牌）

Mattermost 作为插件提供，不包含在核心安装中。
请先安装它：`clawdbot plugins install @clawdbot/mattermost`（或从 Git 检出目录中使用 `./extensions/mattermost`）。

Mattermost 需要一个机器人令牌以及你的服务器的基础 URL：
json5
{
  channels: {
    mattermost: {
      enabled: true,
      botToken: "mm-token",
      baseUrl: "https://chat.example.com",
      dmPolicy: "pairing",
      chatmode: "oncall", // oncall | onmessage | onchar
      oncharPrefixes: [">", "!"],
      textChunkLimit: 4000,
      chunkMode: "length"
    }
  }
}
``````
Clawdbot 在配置好账户（bot token + 基础 URL）并启用后启动 Mattermost。token 和基础 URL 会从 `channels.mattermost.botToken` + `channels.mattermost.baseUrl` 或 `MATTERMOST_BOT_TOKEN` + `MATTERMOST_URL` 解析得到，除非 `channels.mattermost.enabled` 为 `false`。

聊天模式：
- `oncall`（默认）：仅在 @ 提及机器人时回复频道消息。
- `onmessage`：回复每个频道消息。
- `onchar`：当消息以触发前缀开头时回复（`channels.mattermost.oncharPrefixes`，默认为 `[">", "!"]`）。

访问控制：
- 默认私信（DM）：`channels.mattermost.dmPolicy="pairing"`（未知发送者会收到配对码）。
- 公共私信（DM）：`channels.mattermost.dmPolicy="open"` 并加上 `channels.mattermost.allowFrom=["*"]`。
- 群组：默认为 `channels.mattermost.groupPolicy="allowlist"`（提及权限控制）。可以使用 `channels.mattermost.groupAllowFrom` 来限制发送者。

多账户支持位于 `channels.mattermost.accounts` 下（请参见上面的多账户部分）。环境变量仅适用于默认账户。
在指定交付目标时，请使用 `channel:<id>` 或 `user:<id>`（或 `@username`）；纯 ID 会被视为频道 ID。```json5
{
  channels: {
    signal: {
      reactionNotifications: "own", // off | own | all | allowlist
      reactionAllowlist: ["+15551234567", "uuid:123e4567-e89b-12d3-a456-426614174000"],
      historyLimit: 50 // include last N group messages as context (0 disables)
    }
  }
}
```
### `channels.imessage`（imsg CLI）

Clawdbot 会启动 `imsg rpc`（通过标准输入输出的 JSON-RPC）。无需守护进程或端口。
json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "imsg",
      dbPath: "~/Library/Messages/chat.db",
      remoteHost: "user@gateway-host", // 当使用 SSH 包装器时，用于远程附件的 SCP
      dmPolicy: "pairing", // pairing | allowlist | open | disabled
      allowFrom: ["+15555550123", "user@example.com", "chat_id:123"],
      historyLimit: 50,    // 包含最后 N 条群组消息作为上下文（0 表示禁用）
      includeAttachments: false,
      mediaMaxMb: 16,
      service: "auto",
      region: "US"
    }
  }
}
``````
多账户支持位于 `channels.imessage.accounts` 下（参见上方的多账户部分）。

注意事项：
- 需要对 Messages 数据库的完全磁盘访问权限。
- 第一次发送时会提示请求 Messages 自动化权限。
- 更推荐使用 `chat_id:<id>` 作为目标。使用 `imsg chats --limit 20` 来列出聊天。
- `channels.imessage.cliPath` 可以指向一个包装脚本（例如通过 `ssh` 连接到另一台运行 `imsg rpc` 的 Mac）；使用 SSH 密钥可以避免密码提示。
- 对于远程 SSH 包装器，当启用 `includeAttachments` 时，设置 `channels.imessage.remoteHost` 可通过 SCP 获取附件。

示例包装器：```bash
#!/usr/bin/env bash
exec ssh -T gateway-host imsg "$@"
```

### `channels.feishu` (飞书 Webhook 传输方式)

飞书通过 HTTP Webhook 运行，利用飞书开放平台进行集成。

```json5
{
  channels: {
    feishu: {
      enabled: true,
      appId: "cli_...",
      appSecret: "...",
      encryptKey: "...",              // 可选
      verificationToken: "...",        // 可选
      dmPolicy: "pairing",            // pairing | allowlist | open | disabled
      allowFrom: ["ou_..."],          // 可选；"open" 需要 ["*"]
      groupPolicy: "allowlist",
      groupAllowFrom: ["oc_..."]      // 可选的群组 ID 白名单
    }
  }
}
```

注意事项：
- `appId` 和 `appSecret` 是必填项。
- `encryptKey` 和 `verificationToken` 用于增强 Webhook 的安全性。
- 默认 Webhook 地址为 `http://your-host:port/api/plugins/feishu/webhook/default`。
- 将交付目标设置为 `open_id` (用户) 或 `chat_id` (群组)。

### `agents.defaults.workspace`

设置代理用于文件操作的**单一全局工作目录**。

默认值：`~/clawd`。
json5
{
  agents: { defaults: { workspace: "~/clawd" } }
}
``````
如果启用了 `agents.defaults.sandbox`，非主会话可以在 `agents.defaults.sandbox.workspaceRoot` 下使用自己的作用域工作区进行覆盖。

### `agents.defaults.repoRoot`

可选的仓库根目录，用于在系统提示的 Runtime 行中显示。如果未设置，Clawdbot 会尝试从工作区（以及当前工作目录）向上查找 `.git` 目录。该路径必须存在才能被使用。```json5
{
  agents: { defaults: { repoRoot: "~/Projects/clawdbot" } }
}
```
### `agents.defaults.skipBootstrap`

禁用自动创建工作区引导文件（`AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md` 和 `BOOTSTRAP.md`）。

在预填充部署中使用此选项，其中工作区文件来自仓库。
json5
{
  agents: { defaults: { skipBootstrap: true } }
}
``````
### `agents.defaults.bootstrapMaxChars`

注入到系统提示中的每个工作区启动文件的最大字符数，在截断之前。默认值：`20000`。

当文件超过此限制时，Clawdbot 会记录一条警告信息，并注入一个带有标记的截断头部/尾部。```json5
{
  agents: { defaults: { bootstrapMaxChars: 20000 } }
}
```
### `agents.defaults.userTimezone`

设置用户的时区以用于 **系统提示上下文**（不用于消息信封中的时间戳）。如果未设置，Clawdbot 在运行时会使用主机的时区。
json5
{
  agents: { defaults: { userTimezone: "America/Chicago" } }
}
``````
### `agents.defaults.timeFormat`

控制系统提示中 **时间格式** 的显示方式。
默认值：`auto`（操作系统偏好）。```json5
{
  agents: { defaults: { timeFormat: "auto" } } // auto | 12 | 24
}
```
### `messages`

控制入站/出站前缀和可选的确认反应。
有关队列、会话和流式上下文，请参阅 [Messages](/concepts/messages)。
json5
{
  messages: {
    responsePrefix: "🦞", // 或 "auto"
    ackReaction: "👀",
    ackReactionScope: "group-mentions",
    removeAckAfterReply: false
  }
}
``````
`responsePrefix` 会应用于所有渠道的 **所有出站回复**（工具摘要、块流、最终回复），除非已存在。

如果 `messages.responsePrefix` 未设置，默认情况下不会应用前缀。但 WhatsApp 自己聊天的回复是例外：当设置时，默认使用 `[{identity.name}]`，否则使用 `[clawdbot]`，这样同一手机的对话仍然可以保持可读性。将其设置为 `"auto"` 时，会根据路由的代理自动推导出 `[{identity.name}]`。

#### 模板变量

`responsePrefix` 字符串可以包含动态解析的模板变量：

| 变量         | 描述                     | 示例              |
|--------------|--------------------------|-------------------|
| `{model}`    | 短模型名称               | `claude-opus-4-5`、`gpt-4o` |
| `{modelFull}`| 完整的模型标识符         | `anthropic/claude-opus-4-5` |
| `{provider}` | 提供商名称               | `anthropic`、`openai` |
| `{thinkingLevel}` | 当前思考等级       | `high`、`low`、`off` |
| `{identity.name}` | 代理的身份名称       | （与 `"auto"` 模式相同） |

变量是大小写不敏感的（`{MODEL}` = `{model}`）。`{think}` 是 `{thinkingLevel}` 的别名。未解析的变量将保持为字面文本。```json5
{
  messages: {
    responsePrefix: "[{model} | think:{thinkingLevel}]"
  }
}
```
示例输出：`[claude-opus-4-5 | think:high] 这是我的回复...`

WhatsApp 入站消息前缀通过 `channels.whatsapp.messagePrefix` 配置（已弃用：`messages.messagePrefix`）。默认值保持 **不变**：当 `channels.whatsapp.allowFrom` 为空时为 `"[clawdbot]"`，否则为 `""`（无前缀）。当使用 `"[clawdbot]"` 时，Clawdbot 会改用 `[{identity.name}]`，如果路由的代理有设置 `identity.name`。

`ackReaction` 会在支持反应的渠道（如 Slack/Discord/Telegram/Google Chat）上发送一个尽力而为的 emoji 反应，以确认收到入站消息。当设置了活跃代理的 `identity.emoji` 时，默认使用该 emoji，否则默认为 `"👀"`。设置为 `""` 可以禁用该功能。

`ackReactionScope` 控制反应触发的时机：
- `group-mentions`（默认）：仅当群组/房间需要@提及 **且** 机器人被@时
- `group-all`：所有群组/房间消息
- `direct`：仅限私信
- `all`：所有消息

`removeAckAfterReply` 在发送回复后移除机器人的确认反应（仅限 Slack/Discord/Telegram/Google Chat）。默认值为 `false`。

#### `messages.tts`

启用出站回复的文本转语音功能。当开启时，Clawdbot 会使用 ElevenLabs 或 OpenAI 生成音频，并将其附加到回复中。Telegram 使用 Opus 语音消息；其他渠道发送 MP3 音频。
json5
{
  messages: {
    tts: {
      auto: "always", // off | always | inbound | tagged
      mode: "final", // final | all (包含工具/块回复)
      provider: "elevenlabs",
      summaryModel: "openai/gpt-4.1-mini",
      modelOverrides: {
        enabled: true
      },
      maxTextLength: 4000,
      timeoutMs: 30000,
      prefsPath: "~/.clawdbot/settings/tts.json",
      elevenlabs: {
        apiKey: "elevenlabs_api_key",
        baseUrl: "https://api.elevenlabs.io",
        voiceId: "voice_id",
        modelId: "eleven_multilingual_v2",
        seed: 42,
        applyTextNormalization: "auto",
        languageCode: "en",
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true,
          speed: 1.0
        }
      },
      openai: {
        apiKey: "openai_api_key",
        model: "gpt-4o-mini-tts",
        voice: "alloy"
      }
    }
  }
}
```说明：
- `messages.tts.auto` 控制自动语音合成（TTS）（`off`、`always`、`inbound`、`tagged`）。
- `/tts off|always|inbound|tagged` 设置会话级别的自动模式（覆盖配置）。
- `messages.tts.enabled` 是旧版设置；系统会将其迁移至 `messages.tts.auto`。
- `prefsPath` 存储本地覆盖设置（provider/limit/summarize）。
- `maxTextLength` 是 TTS 输入的硬性限制；摘要内容会被截断以适应限制。
- `summaryModel` 用于自动摘要的模型覆盖；
  - 接受 `provider/model` 格式或 `agents.defaults.models` 中的别名。
- `modelOverrides` 启用基于模型的覆盖设置，如 `[[tts:...]]` 标签（默认开启）。
- `/tts limit` 和 `/tts summary` 控制用户的摘要设置。
- `apiKey` 值在未设置时会回退至 `ELEVENLABS_API_KEY`/`XI_API_KEY` 和 `OPENAI_API_KEY`。
- `elevenlabs.baseUrl` 可覆盖 ElevenLabs API 的基础 URL。
- `elevenlabs.voiceSettings` 支持 `stability`/`similarityBoost`/`style`（0..1）、`useSpeakerBoost` 和 `speed`（0.5..2.0）。

### `talk`

Talk 模式默认设置（适用于 macOS/iOS/Android）。当未设置时，语音 ID 会回退至 `ELEVENLABS_VOICE_ID` 或 `SAG_VOICE_ID`。
`apiKey` 在未设置时会回退至 `ELEVENLABS_API_KEY`（或网关的 shell 配置文件）。
`voiceAliases` 允许 Talk 指令使用友好名称（例如 `"voice":"Clawd"`）。
json5
{
  talk: {
    voiceId: "elevenlabs_voice_id",
    voiceAliases: {
      Clawd: "EXAVITQu4vr4xnSDxMaL",
      Roger: "CwhRBWXzGAHq8TQ4Fs17"
    },
    modelId: "eleven_v3",
    outputFormat: "mp3_44100_128",
    apiKey: "elevenlabs_api_key",
    interruptOnSpeech: true
  }
}
``````
### `agents.defaults`

控制嵌入式代理运行时（模型/思考/详细程度/超时时间）。
`agents.defaults.models` 定义了配置的模型目录（并作为 `/model` 的允许列表）。
`agents.defaults.model.primary` 设置默认模型；`agents.defaults.model.fallbacks` 是全局的备用模型。
`agents.defaults.imageModel` 是可选的，**仅在主模型不支持图像输入时使用**。
每个 `agents.defaults.models` 条目可以包含：
- `alias`（可选的模型快捷方式，例如 `/opus`）。
- `params`（可选的提供方特定 API 参数，传递给模型请求）。

`params` 也适用于流式运行（嵌入式代理 + 压缩）。目前支持的键包括：`temperature`（温度）、`maxTokens`（最大令牌数）。这些参数会与调用时的选项合并；调用者提供的值具有优先权。`temperature` 是一个高级参数——除非你了解模型的默认值并需要更改，否则请不要设置。```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-sonnet-4-5-20250929": {
          params: { temperature: 0.6 }
        },
        "openai/gpt-5.2": {
          params: { maxTokens: 8192 }
        }
      }
    }
  }
}
```
"Z.AI GLM-4.x 模型会自动启用思考模式，除非你：
- 设置 `--thinking off`，或者
- 自行定义 `agents.defaults.models["zai/<model>"].params.thinking`。

Clawdbot 还预装了一些内置的别名快捷方式。默认设置仅在模型已存在于 `agents.defaults.models` 中时生效：

- `opus` -> `anthropic/claude-opus-4-5`
- `sonnet` -> `anthropic/claude-sonnet-4-5`
- `gpt` -> `openai/gpt-5.2`
- `gpt-mini` -> `openai/gpt-5-mini`
- `gemini` -> `google/gemini-3-pro-preview`
- `gemini-flash` -> `google/gemini-3-flash-preview`

如果你自己配置了相同的别名名称（不区分大小写），你的设置将优先生效（默认设置不会被覆盖）。

示例：使用 Opus 4.5 作为主模型，MiniMax M2.1 作为备用模型（托管在 MiniMax）：
json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-5": { alias: "opus" },
        "minimax/MiniMax-M2.1": { alias: "minimax" }
      },
      model: {
        primary: "anthropic/claude-opus-4-5",
        fallbacks: ["minimax/MiniMax-M2.1"]
      }
    }
  }
}
``````
MiniMax 认证：设置 `MINIMAX_API_KEY`（环境变量）或配置 `models.providers.minimax`。

#### `agents.defaults.cliBackends`（CLI 回退）

用于纯文本回退运行（无工具调用）的可选 CLI 后端。当 API 提供商失败时，这些后端可以作为备用路径。当你配置了一个接受文件路径的 `imageArg` 时，支持图像直通。

注意事项：
- CLI 后端为 **纯文本优先**；工具始终被禁用。
- 当设置 `sessionArg` 时支持会话；会话 ID 会按后端进行持久化存储。
- 对于 `claude-cli`，默认值已经内置。如果 PATH 环境变量非常有限（例如 launchd/systemd），可以覆盖命令路径。

示例：```json5
{
  agents: {
    defaults: {
      cliBackends: {
        "claude-cli": {
          command: "/opt/homebrew/bin/claude"
        },
        "my-cli": {
          command: "my-cli",
          args: ["--json"],
          output: "json",
          modelArg: "--model",
          sessionArg: "--session",
          sessionMode: "existing",
          systemPromptArg: "--system",
          systemPromptWhen: "first",
          imageArg: "--image",
          imageMode: "repeat"
        }
      }
    }
  }
}
```
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-5": { alias: "Opus" },
        "anthropic/claude-sonnet-4-1": { alias: "Sonnet" },
        "openrouter/deepseek/deepseek-r1:free": {},
        "zai/glm-4.7": {
          alias: "GLM",
          params: {
            thinking: {
              type: "enabled",
              clear_thinking: false
            }
          }
        }
      },
      model: {
        primary: "anthropic/claude-opus-4-5",
        fallbacks: [
          "openrouter/deepseek/deepseek-r1:free",
          "openrouter/meta-llama/llama-3.3-70b-instruct:free"
        ]
      },
      imageModel: {
        primary: "openrouter/qwen/qwen-2.5-vl-72b-instruct:free",
        fallbacks: [
          "openrouter/google/gemini-2.0-flash-vision:free"
        ]
      },
      thinkingDefault: "low",
      verboseDefault: "off",
      elevatedDefault: "on",
      timeoutSeconds: 600,
      mediaMaxMb: 5,
      heartbeat: {
        every: "30m",
        target: "last"
      },
      maxConcurrent: 3,
      subagents: {
        model: "minimax/MiniMax-M2.1",
        maxConcurrent: 1,
        archiveAfterMinutes: 60
      },
      exec: {
        backgroundMs: 10000,
        timeoutSec: 1800,
        cleanupMs: 1800000
      },
      contextTokens: 200000
    }
  }
}#### `agents.defaults.contextPruning`（上下文裁剪）

`agents.defaults.contextPruning` 在将请求发送到 LLM 之前，从内存中的上下文里**裁剪旧的工具结果**。  
它**不会**修改磁盘上的会话历史记录（`*.jsonl` 文件保持完整）。

此功能旨在减少那些频繁交互的代理在长时间运行后积累大量工具输出所导致的 token 使用量。

高层次说明：
- 从不修改用户/助理的消息。
- 保留最后的 `keepLastAssistants` 条助理消息（该点之后的工具结果不会被裁剪）。
- 保留引导前缀（第一个用户消息之前的任何内容都不会被裁剪）。
- 模式：
  - `adaptive`（自适应）：当估计的上下文比例超过 `softTrimRatio` 时，**软裁剪**过长的工具结果（保留开头和结尾）。  
    然后，当估计的上下文比例超过 `hardClearRatio` **且**有足够的可裁剪工具结果（`minPrunableToolChars`）时，**硬清除**最旧的可裁剪工具结果。
  - `aggressive`（激进）：在截止点之前，总是用 `hardClear.placeholder` 替换可裁剪的工具结果（不进行比例检查）。

软裁剪 vs 硬清除（对发送给 LLM 的上下文的影响）：
- **软裁剪**：仅适用于**过长**的工具结果。保留开头 + 结尾，并在中间插入 `...`。
  - 之前：`toolResult("…非常长的输出…")`
  - 之后：`toolResult("HEAD…\n...\n…TAIL\n\n[工具结果被裁剪：…]")`
- **硬清除**：将整个工具结果替换为占位符。
  - 之前：`toolResult("…非常长的输出…")`
  - 之后：`toolResult("[旧工具结果内容已清除]")`

注意事项 / 当前限制：
- 包含**图像块**的工具结果**会被跳过**（目前不会被裁剪/清除）。
- 估计的“上下文比例”基于**字符数**（近似值），而不是精确的 token 数。
- 如果会话中尚未包含至少 `keepLastAssistants` 条助理消息，则跳过裁剪。
- 在 `aggressive` 模式下，`hardClear.enabled` 会被忽略（可裁剪的工具结果总是被替换为 `hardClear.placeholder`）。

默认模式（自适应）：
json5
{
  agents: { defaults: { contextPruning: { mode: "adaptive" } } }
}
``````
禁用：```json5
{
  agents: { defaults: { contextPruning: { mode: "off" } } }
}
```
当 `mode` 为 `"adaptive"` 或 `"aggressive"` 时的默认值：
- `keepLastAssistants`: `3`
- `softTrimRatio`: `0.3`（仅适用于 adaptive）
- `hardClearRatio`: `0.5`（仅适用于 adaptive）
- `minPrunableToolChars`: `50000`（仅适用于 adaptive）
- `softTrim`: `{ maxChars: 4000, headChars: 1500, tailChars: 1500 }`（仅适用于 adaptive）
- `hardClear`: `{ enabled: true, placeholder: "[已清除旧工具结果内容]" }`

示例（aggressive，最小化）：
json5
{
  agents: { defaults: { contextPruning: { mode: "aggressive" } } }
}
``````
示例（自适应调优）：```json5
{
  agents: {
    defaults: {
      contextPruning: {
        mode: "adaptive",
        keepLastAssistants: 3,
        softTrimRatio: 0.3,
        hardClearRatio: 0.5,
        minPrunableToolChars: 50000,
        softTrim: { maxChars: 4000, headChars: 1500, tailChars: 1500 },
        hardClear: { enabled: true, placeholder: "[Old tool result content cleared]" },
        // Optional: restrict pruning to specific tools (deny wins; supports "*" wildcards)
        tools: { deny: ["browser", "canvas"] },
      }
    }
  }
}
```
有关行为细节，请参见 [/concepts/session-pruning](/concepts/session-pruning)。

#### `agents.defaults.compaction`（保留空间 + 内存刷新）

`agents.defaults.compaction.mode` 选择压缩的摘要策略。默认为 `default`；设置为 `safeguard` 以启用针对非常长的历史记录的分块摘要。请参见 [/concepts/compaction](/concepts/compaction)。

`agents.defaults.compaction.reserveTokensFloor` 为 Pi 压缩设置一个最低的 `reserveTokens` 值（默认：`20000`）。将其设为 `0` 以禁用该下限。

`agents.defaults.compaction.memoryFlush` 在自动压缩之前运行一次 **静默** 的代理操作，指示模型将持久化记忆存储到磁盘（例如 `memory/YYYY-MM-DD.md`）。当会话的令牌估算值低于压缩限制的软阈值时会触发此操作。

旧版默认值：
- `memoryFlush.enabled`: `true`
- `memoryFlush.softThresholdTokens`: `4000`
- `memoryFlush.prompt` / `memoryFlush.systemPrompt`: 内置默认值，包含 `NO_REPLY`
- 注意：当会话工作区为只读时（`agents.defaults.sandbox.workspaceAccess: "ro"` 或 `"none"`），内存刷新会被跳过。

示例（调优后）：
json5
{
  agents: {
    defaults: {
      compaction: {
        mode: "safeguard",
        reserveTokensFloor: 24000,
        memoryFlush: {
          enabled: true,
          softThresholdTokens: 6000,
          systemPrompt: "Session nearing compaction. Store durable memories now.",
          prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store."
        }
      }
    }
  }
}
``````
阻塞流式传输：
- `agents.defaults.blockStreamingDefault`: `"on"`/`"off"`（默认为 off）。
- 通道覆盖：`*.blockStreaming`（以及按账户变体）用于强制开启或关闭阻塞流式传输。
  非 Telegram 通道需要显式设置 `*.blockStreaming: true` 才能启用块回复。
- `agents.defaults.blockStreamingBreak`: `"text_end"` 或 `"message_end"`（默认：text_end）。
- `agents.defaults.blockStreamingChunk`: 用于流式传输块的软分块。默认为 800–1200 个字符，优先使用段落分隔符（`\n\n`），其次是换行符，最后是句子。
  示例：  ```json5
  {
    agents: { defaults: { blockStreamingChunk: { minChars: 800, maxChars: 1200 } } }
  }
  ```
- `agents.defaults.blockStreamingCoalesce`: 在发送前合并流式块。
  默认值为 `{ idleMs: 1000 }`，并继承 `blockStreamingChunk` 中的 `minChars`，同时将 `maxChars` 限制为频道文本限制。Signal/Slack/Discord/Google Chat 的默认值为 `minChars: 1500`，除非被覆盖。
  频道覆盖设置：`channels.whatsapp.blockStreamingCoalesce`、`channels.telegram.blockStreamingCoalesce`、
  `channels.discord.blockStreamingCoalesce`、`channels.slack.blockStreamingCoalesce`、`channels.mattermost.blockStreamingCoalesce`、
  `channels.signal.blockStreamingCoalesce`、`channels.imessage.blockStreamingCoalesce`、`channels.msteams.blockStreamingCoalesce`、
  `channels.googlechat.blockStreamingCoalesce`
  （以及按账户的变体）。
- `agents.defaults.humanDelay`: 在第一次回复之后，**块回复**之间的随机暂停。
  模式：`off`（默认）、`natural`（800–2500ms）、`custom`（使用 `minMs`/`maxMs`）。
  每个代理的覆盖设置：`agents.list[].humanDelay`。
  示例：
json5
  {
    agents: { defaults: { humanDelay: { mode: "natural" } } }
  }
```  ```
有关行为和分块的详细信息，请参阅 [/concepts/streaming](/concepts/streaming)。

打字指示器：
- `agents.defaults.typingMode`: `"never" | "instant" | "thinking" | "message"`。默认值为：直接聊天/提及时为 `instant`，未提及的群聊中为 `message`。
- `session.typingMode`: 会话级别的模式覆盖。
- `agents.defaults.typingIntervalSeconds`: 打字信号刷新的频率（默认：6秒）。
- `session.typingIntervalSeconds`: 会话级别的刷新间隔覆盖。
有关行为细节，请参阅 [/concepts/typing-indicators](/concepts/typing-indicators)。

`agents.defaults.model.primary` 应设置为 `provider/model`（例如 `anthropic/claude-opus-4-5`）。
别名来自 `agents.defaults.models.*.alias`（例如 `Opus`）。
如果你省略了 provider，Clawdbot 目前暂时假设为 `anthropic`。
Z.AI 模型以 `zai/<model>` 的形式提供（例如 `zai/glm-4.7`），并且需要环境变量中的 `ZAI_API_KEY`（或旧版的 `Z_AI_API_KEY`）。

`agents.defaults.heartbeat` 配置定期心跳运行：
- `every`: 持续时间字符串（`ms`、`s`、`m`、`h`）；默认单位为分钟。默认值：`30m`。设置为 `0m` 可禁用。
- `model`: 心跳运行的可选模型覆盖（`provider/model`）。
- `includeReasoning`: 当为 `true` 时，如果可用，心跳也会发送单独的 `Reasoning:` 消息（与 `/reasoning on` 格式相同）。默认值：`false`。
- `session`: 可选的会话键，用于控制心跳运行的会话。默认值：`main`。
- `to`: 可选的接收者覆盖（特定于渠道的 ID，例如 WhatsApp 的 E.164 格式，Telegram 的聊天 ID）。
- `target`: 可选的交付渠道（`last`、`whatsapp`、`telegram`、`discord`、`slack`、`msteams`、`signal`、`imessage`、`none`）。默认值：`last`。
- `prompt`: 可选的心跳内容覆盖（默认：`Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.`）。覆盖内容会原样发送；如果你想仍然读取文件，请包含 `Read HEARTBEAT.md` 这一行。
- `ackMaxChars`: 在发送 `HEARTBEAT_OK` 之前允许的最大字符数（默认：300）。

按代理的心跳：
- 设置 `agents.list[].heartbeat` 可为特定代理启用或覆盖心跳设置。
- 如果任何代理条目定义了 `heartbeat`，**只有这些代理** 会运行心跳；默认值将作为这些代理的共享基础。

心跳会执行完整的代理流程。较短的间隔会消耗更多 tokens，请注意 `every` 参数，保持 `HEARTBEAT.md` 文件小巧，或选择更便宜的 `model`。

`tools.exec` 配置后台执行的默认设置：
- `backgroundMs`: 自动后台执行前的等待时间（毫秒，默认值 10000）
- `timeoutSec`: 执行超过此时间后自动终止（秒，默认值 1800）
- `cleanupMs`: 保留已完成会话在内存中的时间（毫秒，默认值 1800000）
- `notifyOnExit`: 当后台执行退出时，将系统事件加入队列并请求心跳（默认 true）
- `applyPatch.enabled`: 启用实验性的 `apply_patch`（仅限 OpenAI/OpenAI Codex；默认 false）
- `applyPatch.allowModels`: 可选的模型 ID 允许列表（例如 `gpt-5.2` 或 `openai/gpt-5.2`）
注意：`applyPatch` 仅在 `tools.exec` 下可用。

`tools.web` 配置网络搜索和抓取工具：
- `tools.web.search.enabled`（默认：当 API 密钥存在时为 true）
- `tools.web.search.apiKey`（推荐：通过 `clawdbot configure --section web` 设置，或使用 `BRAVE_API_KEY` 环境变量）
- `tools.web.search.maxResults`（1–10，默认值 5）
- `tools.web.search.timeoutSeconds`（默认 30）
- `tools.web.search.cacheTtlMinutes`（默认 15）
- `tools.web.fetch.enabled`（默认 true）
- `tools.web.fetch.maxChars`（默认 50000）
- `tools.web.fetch.timeoutSeconds`（默认 30）
- `tools.web.fetch.cacheTtlMinutes`（默认 15）
- `tools.web.fetch.userAgent`（可选覆盖）
- `tools.web.fetch.readability`（默认 true；禁用以仅使用基础 HTML 清理）
- `tools.web.fetch.firecrawl.enabled`（当 API 密钥设置时默认为 true）
- `tools.web.fetch.firecrawl.apiKey`（可选；默认为 `FIRECRAWL_API_KEY`）
- `tools.web.fetch.firecrawl.baseUrl`（默认值 https://api.firecrawl.dev）
- `tools.web.fetch.firecrawl.onlyMainContent`（默认 true）
- `tools.web.fetch.firecrawl.maxAgeMs`（可选）
- `tools.web.fetch.firecrawl.timeoutSeconds`（可选）

`tools.media` 配置入站媒体理解（图片/音频/视频）：
- `tools.media.models`: 共享模型列表（带有功能标签；在每个功能的列表之后使用）。
- `tools.media.concurrency`: 最大并发功能运行数（默认值为 2）。
- `tools.media.image` / `tools.media.audio` / `tools.media.video`:
  - `enabled`: 可选的关闭开关（默认为 true，当配置了模型时）。
  - `prompt`: 可选的提示覆盖（图片/视频会自动附加 `maxChars` 提示）。
  - `maxChars`: 最大输出字符数（图片/视频默认为 500；音频未设置）。
  - `maxBytes`: 要发送的媒体最大大小（默认：图片 10MB，音频 20MB，视频 50MB）。
  - `timeoutSeconds`: 请求超时时间（默认：图片 60 秒，音频 60 秒，视频 120 秒）。
  - `language`: 可选的音频提示。
  - `attachments`: 附件策略（`mode`、`maxAttachments`、`prefer`）。
  - `scope`: 可选的权限控制（第一个匹配项优先），支持 `match.channel`、`match.chatType` 或 `match.keyPrefix`。
  - `models`: 模型条目有序列表；如果失败或媒体过大，会回退到下一个条目。

每个 `models[]` 条目：
  - 提供商条目（`type: "provider"` 或省略）：
    - `provider`: API 提供商 ID（如 `openai`、`anthropic`、`google`/`gemini`、`groq` 等）。
    - `model`: 模型 ID 覆盖（图片模型为必填；音频提供商会默认为 `gpt-4o-mini-transcribe`/`whisper-large-v3-turbo`，视频默认为 `gemini-3-flash-preview`）。
    - `profile` / `preferredProfile`: 认证配置文件选择。
  - CLI 条目（`type: "cli"`）：
    - `command`: 要运行的可执行文件。
    - `args`: 模板化参数（支持 `{{MediaPath}}`、`{{Prompt}}`、`{{MaxChars}}` 等）。
  - `capabilities`: 可选的功能列表（`image`、`audio`、`video`），用于限制共享条目。当未配置时的默认值：`openai`/`anthropic`/`minimax` → 图片，`google` → 图片+音频+视频，`groq` → 音频。
  - `prompt`、`maxChars`、`maxBytes`、`timeoutSeconds`、`language` 可以在每个条目中被覆盖。

如果没有配置模型（或 `enabled: false`），则跳过理解；模型仍然会接收到原始附件。

提供商标识遵循标准的模型认证顺序（认证配置文件，环境变量如 `OPENAI_API_KEY`/`GROQ_API_KEY`/`GEMINI_API_KEY`，或 `models.providers.*.apiKey`）。

示例：```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        maxBytes: 20971520,
        scope: {
          default: "deny",
          rules: [{ action: "allow", match: { chatType: "direct" } }]
        },
        models: [
          { provider: "openai", model: "gpt-4o-mini-transcribe" },
          { type: "cli", command: "whisper", args: ["--model", "base", "{{MediaPath}}"] }
        ]
      },
      video: {
        enabled: true,
        maxBytes: 52428800,
        models: [{ provider: "google", model: "gemini-3-flash-preview" }]
      }
    }
  }
}
```
配置子代理的默认设置：`agents.defaults.subagents`
- `model`: 生成的子代理的默认模型（字符串或 `{ primary, fallbacks }`）。如果未设置，子代理将继承调用者的模型，除非在特定代理或特定调用中被覆盖。
- `maxConcurrent`: 最大同时运行的子代理数量（默认值为 1）
- `archiveAfterMinutes`: 在 N 分钟后自动归档子代理会话（默认 60；设置 `0` 以禁用）
- 每个子代理的工具策略：`tools.subagents.tools.allow` / `tools.subagents.tools.deny`（拒绝策略优先）

`tools.profile` 在 `tools.allow`/`tools.deny` 之前设置一个**基础工具白名单**：
- `minimal`: 仅允许 `session_status`
- `coding`: `group:fs`, `group:runtime`, `group:sessions`, `group:memory`, `image`
- `messaging`: `group:messaging`, `sessions_list`, `sessions_history`, `sessions_send`, `session_status`
- `full`: 没有限制（与未设置相同）

特定代理的覆盖设置：`agents.list[].tools.profile`。

示例（默认仅允许消息功能，同时允许 Slack 和 Discord 工具）：
json5
{
  tools: {
    profile: "messaging",
    allow: ["slack", "discord"]
  }
}
``````
示例（代码配置文件，但禁止在任何地方执行/处理）：```json5
{
  tools: {
    profile: "coding",
    deny: ["group:runtime"]
  }
}
```
`tools.byProvider` 允许你 **进一步限制** 特定提供者（或单个 `provider/model`）的工具。
按代理覆盖：`agents.list[].tools.byProvider`。

顺序：基础配置文件 → 提供者配置文件 → 允许/拒绝策略。
提供者键可以是 `provider`（例如 `google-antigravity`）或 `provider/model`（例如 `openai/gpt-5.2`）。

示例（保留全局编码配置文件，但为 Google Antigravity 设置最少的工具）：
json5
{
  tools: {
    profile: "coding",
    byProvider: {
      "google-antigravity": { profile: "minimal" }
    }
  }
}
``````
示例（提供者/模型特定的白名单）：```json5
{
  tools: {
    allow: ["group:fs", "group:runtime", "sessions_list"],
    byProvider: {
      "openai/gpt-5.2": { allow: ["group:fs", "sessions_list"] }
    }
  }
}
```
`tools.allow` / `tools.deny` 配置全局工具允许/拒绝策略（拒绝策略优先）。
匹配不区分大小写，并支持 `*` 通配符（`"*"` 表示所有工具）。
即使 Docker 沙箱处于 **关闭** 状态时也会生效。

示例（在所有地方禁用浏览器/画布）：
json5
{
  tools: { deny: ["browser", "canvas"] }
}
``````
工具组（快捷方式）在 **全局** 和 **每个代理** 的工具策略中均适用：
- `group:runtime`: `exec`, `bash`, `process`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:web`: `web_search`, `web_fetch`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:clawdbot`: 所有内置的 Clawdbot 工具（不包括提供者插件）

`tools.elevated` 控制提升（主机）执行访问权限：
- `enabled`: 允许提升模式（默认为 true）
- `allowFrom`: 按频道的允许列表（空值 = 禁用）
  - `whatsapp`: E.164 格式的号码
  - `telegram`: 聊天 ID 或用户名
  - `discord`: 用户 ID 或用户名（如果未指定，则回退到 `channels.discord.dm.allowFrom`）
  - `signal`: E.164 格式的号码
  - `imessage`: 聊天名称或聊天 ID
  - `webchat`: 会话 ID 或用户名

示例：```json5
{
  tools: {
    elevated: {
      enabled: true,
      allowFrom: {
        whatsapp: ["+15555550123"],
        discord: ["steipete", "1234567890123"]
      }
    }
  }
}
```
{
  agents: {
    list: [
      {
        id: "family",
        tools: {
          elevated: { enabled: false }
        }
      }
    ]
  }
}```
说明：
- `tools.elevated` 是全局基线。`agents.list[].tools.elevated` 只能进一步限制（两者都必须允许）。
- `/elevated on|off|ask|full` 会按会话键存储状态；内联指令仅对单条消息生效。
- 提升权限的 `exec` 在主机上运行，并绕过沙箱机制。
- 工具策略仍然适用；如果 `exec` 被拒绝，则无法使用提升权限。

`agents.defaults.maxConcurrent` 设置了跨会话可以并行执行的嵌入式代理的最大数量。每个会话仍然序列化执行（每个会话键一次只运行一个代理）。默认值：1。

### `agents.defaults.sandbox`

可选的 **Docker 沙箱**，用于嵌入式代理。适用于非主会话，以防止其访问你的主机系统。

详情：[沙箱机制](/gateway/sandboxing)

默认值（如果启用）：
- scope: `"agent"`（每个代理一个容器 + 工作区）
- 基于 Debian bookworm-slim 的镜像
- 代理工作区访问：`workspaceAccess: "none"`（默认）
  - `"none"`：使用 `~/.clawdbot/sandboxes` 下的按作用域沙箱工作区
- `"ro"`：将沙箱工作区保留在 `/workspace`，并将代理工作区只读挂载到 `/agent`（禁用 `write`/`edit`/`apply_patch`）
  - `"rw"`：将代理工作区以读写方式挂载到 `/workspace`
- 自动清理：空闲超过 24 小时或年龄超过 7 天
- 工具策略：仅允许 `exec`、`process`、`read`、`write`、`edit`、`apply_patch`、`sessions_list`、`sessions_history`、`sessions_send`、`sessions_spawn`、`session_status`（拒绝优先）
  - 通过 `tools.sandbox.tools` 配置，可通过 `agents.list[].tools.sandbox.tools` 覆盖每个代理
  - 沙箱策略支持工具组简写：`group:runtime`、`group:fs`、`group:sessions`、`group:memory`（参见 [沙箱 vs 工具策略 vs 提升权限](/gateway/sandbox-vs-tool-policy-vs-elevated#tool-groups-shorthands)）
- 可选的沙箱浏览器（Chromium + CDP，noVNC 观察者）
- 加固选项：`network`、`user`、`pidsLimit`、`memory`、`cpus`、`ulimits`、`seccompProfile`、`apparmorProfile`

警告：`scope: "shared"` 表示共享容器和共享工作区。没有跨会话隔离。如需会话隔离，请使用 `scope: "session"`。

遗留支持：`perSession` 仍然有效（`true` → `scope: "session"`，`false` → `scope: "shared"`）。

`setupCommand` 在容器创建后 **仅运行一次**（通过 `sh -lc` 在容器内部运行）。
对于包安装，请确保网络出站、可写根文件系统和 root 用户权限。```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // off | non-main | all
        scope: "agent", // session | agent | shared (agent is default)
        workspaceAccess: "none", // none | ro | rw
        workspaceRoot: "~/.clawdbot/sandboxes",
        docker: {
          image: "clawdbot-sandbox:bookworm-slim",
          containerPrefix: "clawdbot-sbx-",
          workdir: "/workspace",
          readOnlyRoot: true,
          tmpfs: ["/tmp", "/var/tmp", "/run"],
          network: "none",
          user: "1000:1000",
          capDrop: ["ALL"],
          env: { LANG: "C.UTF-8" },
          setupCommand: "apt-get update && apt-get install -y git curl jq",
          // Per-agent override (multi-agent): agents.list[].sandbox.docker.*
          pidsLimit: 256,
          memory: "1g",
          memorySwap: "2g",
          cpus: 1,
          ulimits: {
            nofile: { soft: 1024, hard: 2048 },
            nproc: 256
          },
          seccompProfile: "/path/to/seccomp.json",
          apparmorProfile: "clawdbot-sandbox",
          dns: ["1.1.1.1", "8.8.8.8"],
          extraHosts: ["internal.service:10.0.0.5"],
          binds: ["/var/run/docker.sock:/var/run/docker.sock", "/home/user/source:/source:rw"]
        },
        browser: {
          enabled: false,
          image: "clawdbot-sandbox-browser:bookworm-slim",
          containerPrefix: "clawdbot-sbx-browser-",
          cdpPort: 9222,
          vncPort: 5900,
          noVncPort: 6080,
          headless: false,
          enableNoVnc: true,
          allowHostControl: false,
          allowedControlUrls: ["http://10.0.0.42:18791"],
          allowedControlHosts: ["browser.lab.local", "10.0.0.42"],
          allowedControlPorts: [18791],
          autoStart: true,
          autoStartTimeoutMs: 12000
        },
        prune: {
          idleHours: 24,  // 0 disables idle pruning
          maxAgeDays: 7   // 0 disables max-age pruning
        }
      }
    }
  },
  tools: {
    sandbox: {
      tools: {
        allow: ["exec", "process", "read", "write", "edit", "apply_patch", "sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
        deny: ["browser", "canvas", "nodes", "cron", "discord", "gateway"]
      }
    }
  }
}
```
使用以下命令一次性构建默认的沙盒镜像：
bash
scripts/sandbox-setup.sh
``````
注意：沙盒容器默认使用 `network: "none"`；如果代理需要出站访问，请将 `agents.defaults.sandbox.docker.network` 设置为 `"bridge"`（或您的自定义网络）。

注意：入站附件会被暂存到活动工作区的 `media/inbound/*` 路径下。当使用 `workspaceAccess: "rw"` 时，这意味着文件会被写入代理的工作区。

注意：`docker.binds` 会挂载额外的主机目录；全局绑定和代理级别的绑定会合并。```bash
scripts/sandbox-browser-setup.sh
```
当 `agents.defaults.sandbox.browser.enabled=true` 时，浏览器工具将使用沙盒化的 Chromium 实例（CDP）。如果启用了 noVNC（当 headless=false 时默认启用），则会将 noVNC 的 URL 注入到系统提示中，以便代理可以引用它。这不需要在主配置中设置 `browser.enabled`；沙盒控制 URL 是按会话注入的。

`agents.defaults.sandbox.browser.allowHostControl`（默认值：false）允许沙盒会话通过浏览器工具（`target: "host"`）显式地指向 **主机** 的浏览器控制服务器。如果你希望严格的沙盒隔离，请保持此选项关闭。

远程控制的允许列表：
- `allowedControlUrls`：允许用于 `target: "custom"` 的确切控制 URL。
- `allowedControlHosts`：允许的主机名（仅主机名，不包含端口）。
- `allowedControlPorts`：允许的端口（默认：http=80，https=443）。
默认值：所有允许列表均未设置（无限制）。`allowHostControl` 默认为 false。

### `models`（自定义提供者 + 基础 URL）

Clawdbot 使用 **pi-coding-agent** 模型目录。你可以通过编写 `~/.clawdbot/agents/<agentId>/agent/models.json` 或在 Clawdbot 配置中定义相同结构的 `models.providers` 来添加自定义提供者（如 LiteLLM、本地 OpenAI 兼容服务器、Anthropic 代理等）。
提供者详解 + 示例：[/concepts/model-providers](/concepts/model-providers)。

当 `models.providers` 存在时，Clawdbot 在启动时会将 `models.json` 写入/合并到 `~/.clawdbot/agents/<agentId>/agent/` 目录中：
- 默认行为：**合并**（保留现有提供者，按名称覆盖）
- 设置 `models.mode: "replace"` 以覆盖文件内容

通过 `agents.defaults.model.primary`（提供者/模型）选择模型。
json5
{
  agents: {
    defaults: {
      model: { primary: "custom-proxy/llama-3.1-8b" },
      models: {
        "custom-proxy/llama-3.1-8b": {}
      }
    }
  },
  models: {
    mode: "merge",
    providers: {
      "custom-proxy": {
        baseUrl: "http://localhost:4000/v1",
        apiKey: "LITELLM_KEY",
        api: "openai-completions",
        models: [
          {
            id: "llama-3.1-8b",
            name: "Llama 3.1 8B",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128000,
            maxTokens: 32000
          }
        ]
      }
    }
  }
}
``````
### OpenCode Zen（多模型代理）

OpenCode Zen 是一个具有每个模型端点的多模型网关。Clawdbot 使用 `pi-ai` 中的内置 `opencode` 提供商；从 https://opencode.ai/auth 获取 `OPENCODE_API_KEY`（或 `OPENCODE_ZEN_API_KEY`）。

注意事项：
- 模型引用使用 `opencode/<modelId>` 格式（例如：`opencode/claude-opus-4-5`）。
- 如果通过 `agents.defaults.models` 启用了允许列表，请添加你计划使用的每个模型。
- 快捷方式：`clawdbot onboard --auth-choice opencode-zen`。```json5
{
  agents: {
    defaults: {
      model: { primary: "opencode/claude-opus-4-5" },
      models: { "opencode/claude-opus-4-5": { alias: "Opus" } }
    }
  }
}
```
### Z.AI (GLM-4.7) — 提供商别名支持

Z.AI 模型可以通过内置的 `zai` 提供商进行使用。在您的环境中设置 `ZAI_API_KEY`，并通过 `provider/model` 的方式引用该模型。

快捷方式：`clawdbot onboard --auth-choice zai-api-key`。
json5
{
  agents: {
    defaults: {
      model: { primary: "zai/glm-4.7" },
      models: { "zai/glm-4.7": {} }
    }
  }
}
``````
注意事项：
- `z.ai/*` 和 `z-ai/*` 是被接受的别名，并会标准化为 `zai/*`。
- 如果缺少 `ZAI_API_KEY`，对 `zai/*` 的请求将在运行时因认证错误而失败。
- 示例错误：`No API key found for provider "zai".`
- Z.AI 的通用 API 端点是 `https://api.z.ai/api/paas/v4`。GLM 编码请求使用专用的编码端点 `https://api.z.ai/api/coding/paas/v4`。
  内置的 `zai` 提供者使用编码端点。如果你需要通用端点，请在 `models.providers` 中定义一个自定义提供者，并覆盖基础 URL（参见上方的自定义提供者部分）。
- 在 docs/configs 中使用假占位符；永远不要提交真实的 API 密钥。```json5
{
  env: { MOONSHOT_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "moonshot/kimi-k2-0905-preview" },
      models: { "moonshot/kimi-k2-0905-preview": { alias: "Kimi K2" } }
    }
  },
  models: {
    mode: "merge",
    providers: {
      moonshot: {
        baseUrl: "https://api.moonshot.ai/v1",
        apiKey: "${MOONSHOT_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "kimi-k2-0905-preview",
            name: "Kimi K2 0905 Preview",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 256000,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
```
### 注意事项：
- 在环境变量中设置 `MOONSHOT_API_KEY` 或使用 `clawdbot onboard --auth-choice moonshot-api-key`。
- 模型引用：`moonshot/kimi-k2-0905-preview`。
- 如果需要中国区域的端点，请使用 `https://api.moonshot.cn/v1`。

### Kimi Code

使用 Kimi Code 的专用 OpenAI 兼容端点（与 Moonshot 分离）：
json5
{
  env: { KIMICODE_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "kimi-code/kimi-for-coding" },
      models: { "kimi-code/kimi-for-coding": { alias: "Kimi Code" } }
    }
  },
  models: {
    mode: "merge",
    providers: {
      "kimi-code": {
        baseUrl: "https://api.kimi.com/coding/v1",
        apiKey: "${KIMICODE_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "kimi-for-coding",
            name: "Kimi For Coding",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 262144,
            maxTokens: 32768,
            headers: { "User-Agent": "KimiCLI/0.77" },
            compat: { supportsDeveloperRole: false }
          }
        ]
      }
    }
  }
}
``````
注意事项：
- 在环境变量中设置 `KIMICODE_API_KEY`，或使用 `clawdbot onboard --auth-choice kimi-code-api-key`。
- 模型引用：`kimi-code/kimi-for-coding`。

### Synthetic（Anthropic 兼容）

使用 Synthetic 的 Anthropic 兼容端点：```json5
{
  env: { SYNTHETIC_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "synthetic/hf:MiniMaxAI/MiniMax-M2.1" },
      models: { "synthetic/hf:MiniMaxAI/MiniMax-M2.1": { alias: "MiniMax M2.1" } }
    }
  },
  models: {
    mode: "merge",
    providers: {
      synthetic: {
        baseUrl: "https://api.synthetic.new/anthropic",
        apiKey: "${SYNTHETIC_API_KEY}",
        api: "anthropic-messages",
        models: [
          {
            id: "hf:MiniMaxAI/MiniMax-M2.1",
            name: "MiniMax M2.1",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 192000,
            maxTokens: 65536
          }
        ]
      }
    }
  }
}
```
注意事项：
- 设置 `SYNTHETIC_API_KEY` 或使用 `clawdbot onboard --auth-choice synthetic-api-key`。
- 模型引用：`synthetic/hf:MiniMaxAI/MiniMax-M2.1`。
- 基础 URL 应省略 `/v1`，因为 Anthropic 客户端会自动追加它。

### 本地模型（LM Studio）—— 推荐设置

有关当前本地模型的指导，请参阅 [/gateway/local-models](/gateway/local-models)。TL;DR：在高性能硬件上通过 LM Studio 的 Responses API 运行 MiniMax M2.1；保持托管模型合并以备回退。
json5
{
  agent: {
    model: { primary: "minimax/MiniMax-M2.1" },
    models: {
      "anthropic/claude-opus-4-5": { alias: "Opus" },
      "minimax/MiniMax-M2.1": { alias: "Minimax" }
    }
  },
  models: {
    mode: "merge",
    providers: {
      minimax: {
        baseUrl: "https://api.minimax.io/anthropic",
        apiKey: "${MINIMAX_API_KEY}",
        api: "anthropic-messages",
        models: [
          {
            id: "MiniMax-M2.1",
            name: "MiniMax M2.1",
            reasoning: false,
            input: ["text"],
            // 定价：如需精确成本跟踪，请在 models.json 中更新。
            cost: { input: 15, output: 60, cacheRead: 2, cacheWrite: 10 },
            contextWindow: 200000,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
``````
注意事项：
- 设置 `MINIMAX_API_KEY` 环境变量，或使用 `clawdbot onboard --auth-choice minimax-api`。
- 可用模型：`MiniMax-M2.1`（默认）。
- 如果需要精确的成本跟踪，请更新 `models.json` 中的定价信息。

### Cerebras（GLM 4.6 / 4.7）

通过 Cerebras 的 OpenAI 兼容端点使用 Cerebras：```json5
{
  env: { CEREBRAS_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: {
        primary: "cerebras/zai-glm-4.7",
        fallbacks: ["cerebras/zai-glm-4.6"]
      },
      models: {
        "cerebras/zai-glm-4.7": { alias: "GLM 4.7 (Cerebras)" },
        "cerebras/zai-glm-4.6": { alias: "GLM 4.6 (Cerebras)" }
      }
    }
  },
  models: {
    mode: "merge",
    providers: {
      cerebras: {
        baseUrl: "https://api.cerebras.ai/v1",
        apiKey: "${CEREBRAS_API_KEY}",
        api: "openai-completions",
        models: [
          { id: "zai-glm-4.7", name: "GLM 4.7 (Cerebras)" },
          { id: "zai-glm-4.6", name: "GLM 4.6 (Cerebras)" }
        ]
      }
    }
  }
}
```
注意事项：
- 使用 `cerebras/zai-glm-4.7` 用于 Cerebras；使用 `zai/glm-4.7` 用于 Z.AI 直接接口。
- 在环境变量或配置中设置 `CEREBRAS_API_KEY`。

注意事项：
- 支持的 API：`openai-completions`、`openai-responses`、`anthropic-messages`、
  `google-generative-ai`
- 如需自定义认证，请使用 `authHeader: true` + `headers`。
- 如果希望将 `models.json` 存储在其他位置，可以通过 `CLAWDBOT_AGENT_DIR`（或 `PI_CODING_AGENT_DIR`）
  覆盖代理配置根目录（默认：`~/.clawdbot/agents/main/agent`）。

### `session`

用于控制会话作用域、重置策略、重置触发条件以及会话存储的写入位置。
json5
{
  session: {
    scope: "per-sender",
    dmScope: "main",
    identityLinks: {
      alice: ["telegram:123456789", "discord:987654321012345678"]
    },
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 60
    },
    resetByType: {
      thread: { mode: "daily", atHour: 4 },
      dm: { mode: "idle", idleMinutes: 240 },
      group: { mode: "idle", idleMinutes: 120 }
    },
    resetTriggers: ["/new", "/reset"],
    // 默认存储位置为 ~/.clawdbot/agents/<agentId>/sessions/sessions.json
    // 可以通过 {agentId} 模板进行覆盖：
    store: "~/.clawdbot/agents/{agentId}/sessions/sessions.json",
    // 直接聊天会合并到 agent:<agentId>:<mainKey>（默认："main"）。
    mainKey: "main",
    agentToAgent: {
      // 请求者/目标之间最大回复轮次（0–5）。
      maxPingPongTurns: 5
    },
    sendPolicy: {
      rules: [
        { action: "deny", match: { channel: "discord", chatType: "group" } }
      ],
      default: "allow"
    }
  }
}
``````
字段：
- `mainKey`: 直接聊天（direct-chat）的桶键（默认值为 `"main"`）。当你想“重命名”主聊天线程而不想修改 `agentId` 时很有用。
  - 沙箱说明：`agents.defaults.sandbox.mode: "non-main"` 使用此键来检测主会话。任何不匹配 `mainKey`（群组/频道）的会话键都会被沙箱隔离。
- `dmScope`: DM 会话如何分组（默认值为 `"main"`）。
  - `main`: 所有 DM 会话共享主会话以保持连续性。
  - `per-peer`: 按发送者 ID 隔离 DM 会话，跨频道隔离。
  - `per-channel-peer`: 按频道 + 发送者 ID 隔离 DM 会话（推荐用于多用户收件箱）。
- `identityLinks`: 将规范 ID 映射到由提供者前缀标识的用户，这样在使用 `per-peer` 或 `per-channel-peer` 时，同一人可以在不同频道中共享同一个 DM 会话。
  - 示例：`alice: ["telegram:123456789", "discord:987654321012345678"]`。
- `reset`: 主重置策略。默认在网关主机的每日凌晨 4:00 进行重置。
  - `mode`: `daily` 或 `idle`（默认：当 `reset` 存在时为 `daily`）。
  - `atHour`: 每日重置的本地小时（0-23）。
  - `idleMinutes`: 空闲窗口（分钟数）。当同时配置了 `daily` 和 `idle` 时，先过期的生效。
- `resetByType`: 对 `dm`、`group` 和 `thread` 的会话类型进行重置策略覆盖。
  - 如果你只设置了旧版的 `session.idleMinutes` 而没有设置 `reset` 或 `resetByType`，Clawdbot 会保持在仅空闲模式下以保持向后兼容性。
- `heartbeatIdleMinutes`: 心跳检查的可选空闲超时设置（当启用时，每日重置仍然适用）。
- `agentToAgent.maxPingPongTurns`: 请求者与目标之间的最大回复次数（0–5，默认为 5）。
- `sendPolicy.default`: 当没有规则匹配时的默认发送策略，可为 `allow` 或 `deny`。
- `sendPolicy.rules[]`: 根据 `channel`、`chatType`（`direct|group|room`）或 `keyPrefix`（例如 `cron:`）进行匹配。第一个 `deny` 规则优先；否则允许。

### `skills`（技能配置）

控制内置技能的允许列表、安装偏好、额外技能目录和按技能的覆盖配置。适用于 **内置** 技能和 `~/.clawdbot/skills`（工作区技能在名称冲突时优先）。

字段：
- `allowBundled`: 可选的 **内置** 技能允许列表。如果设置，只有这些内置技能可用（工作区/管理技能不受影响）。
- `load.extraDirs`: 额外的技能目录（扫描顺序最低优先级）。
- `install.preferBrew`: 当可用时优先使用 brew 安装器（默认：true）。
- `install.nodeManager`: Node 安装器偏好（`npm` | `pnpm` | `yarn`，默认：npm）。
- `entries.<skillKey>`: 按技能的配置覆盖。

按技能字段：
- `enabled`: 设置为 `false` 可禁用该技能，即使它是内置或已安装的。
- `env`: 为代理运行注入环境变量（仅在未设置时生效）。
- `apiKey`: 为声明主环境变量的技能提供便捷的 API 密钥（例如 `nano-banana-pro` → `GEMINI_API_KEY`）。

示例：```json5
{
  skills: {
    allowBundled: ["gemini", "peekaboo"],
    load: {
      extraDirs: [
        "~/Projects/agent-scripts/skills",
        "~/Projects/oss/some-skill-pack/skills"
      ]
    },
    install: {
      preferBrew: true,
      nodeManager: "npm"
    },
    entries: {
      "nano-banana-pro": {
        apiKey: "GEMINI_KEY_HERE",
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE"
        }
      },
      peekaboo: { enabled: true },
      sag: { enabled: false }
    }
  }
}
```
### `plugins`（扩展）

控制插件的发现、允许/拒绝以及每个插件的配置。插件将从 `~/.clawdbot/extensions`、`<workspace>/.clawdbot/extensions` 以及任何 `plugins.load.paths` 中的条目加载。**配置更改需要重启网关。**  
有关完整用法，请参见 [/plugin](/plugin)。

字段：
- `enabled`: 插件加载的主开关（默认值：true）。
- `allow`: 可选的插件 ID 允许列表；设置后，仅加载列出的插件。
- `deny`: 可选的插件 ID 拒绝列表（拒绝优先）。
- `load.paths`: 额外的插件文件或目录以加载（可以是绝对路径或 `~`）。
- `entries.<pluginId>`: 每个插件的覆盖配置。
  - `enabled`: 设置为 `false` 以禁用该插件。
  - `config`: 插件特定的配置对象（如果提供，将由插件进行验证）。

示例：
json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    load: {
      paths: ["~/Projects/oss/voice-call-extension"]
    },
    entries: {
      "voice-call": {
        enabled: true,
        config: {
          provider: "twilio"
        }
      }
    }
  }
}
``````
### `browser`（clawd 管理的浏览器）

Clawdbot 可以为 clawd 启动一个 **专用、隔离的** Chrome/Brave/Edge/Chromium 实例，并暴露一个小型的本地回环控制服务器。  
可以通过 `profiles.<name>.cdpUrl` 将配置指向一个 **远程** 的基于 Chromium 的浏览器。远程配置只能附加（无法启动/停止/重置）。

`browser.cdpUrl` 保留用于旧版单配置文件设置，并作为仅设置 `cdpPort` 的配置文件的基准方案。

默认值：
- 启用：`true`
- 控制 URL：`http://127.0.0.1:18791`（CDP 使用 `18792`）
- CDP URL：`http://127.0.0.1:18792`（控制 URL + 1，旧版单配置文件）
- 配置文件颜色：`#FF4500`（龙虾橙色）
- 注意：控制服务器由运行中的网关启动（Clawdbot.app 菜单栏，或 `clawdbot gateway`）。
- 自动检测顺序：如果为基于 Chromium 的浏览器，则使用默认浏览器；否则依次为 Chrome → Brave → Edge → Chromium → Chrome Canary。```json5
{
  browser: {
    enabled: true,
    controlUrl: "http://127.0.0.1:18791",
    // cdpUrl: "http://127.0.0.1:18792", // legacy single-profile override
    defaultProfile: "chrome",
    profiles: {
      clawd: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" },
      remote: { cdpUrl: "http://10.0.0.42:9222", color: "#00AA00" }
    },
    color: "#FF4500",
    // Advanced:
    // headless: false,
    // noSandbox: false,
    // executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    // attachOnly: false, // set true when tunneling a remote CDP to localhost
  }
}
```
### `ui`（外观）

原生应用用于 UI 配色（例如：Talk Mode 气泡的色调）的可选强调色。

如果未设置，客户端将回退到一种柔和的浅蓝色。
json5
{
  ui: {
    seamColor: "#FF4500", // hex (RRGGBB 或 #RRGGBB)
    // 可选：控制 UI 助手身份覆盖。
    // 如果未设置，Control UI 将使用当前活动的代理身份（config 或 IDENTITY.md）。
    assistant: {
      name: "Clawdbot",
      avatar: "CB" // emoji、短文本或图像 URL/数据 URI
    }
  }
}
``````
### `gateway`（网关服务器模式 + 绑定）

使用 `gateway.mode` 明确声明此机器是否应运行网关。

默认值：
- mode: **未设置**（视为“不自动启动”）
- bind: `loopback`
- port: `18789`（用于 WS 和 HTTP 的单一端口）```json5
{
  gateway: {
    mode: "local", // or "remote"
    port: 18789, // WS + HTTP multiplex
    bind: "loopback",
    // controlUi: { enabled: true, basePath: "/clawdbot" }
    // auth: { mode: "token", token: "your-token" } // token gates WS + Control UI access
    // tailscale: { mode: "off" | "serve" | "funnel" }
  }
}
```
Control UI 基础路径：
- `gateway.controlUi.basePath` 设置 Control UI 提供服务的 URL 前缀。
- 示例：`"/ui"`、`"/clawdbot"`、`"/apps/clawdbot"`。
- 默认值：根路径 (`/`)（保持不变）。
- `gateway.controlUi.allowInsecureAuth` 允许仅使用 token 的认证，并跳过设备身份 + 配对（即使在 HTTPS 上）。默认值：`false`。优先使用 HTTPS（Tailscale Serve）或 `127.0.0.1`。

相关文档：
- [Control UI](/web/control-ui)
- [Web 概览](/web)
- [Tailscale](/gateway/tailscale)
- [远程访问](/gateway/remote)

可信代理：
- `gateway.trustedProxies`：列出在 Gateway 前端终止 TLS 的反向代理 IP。
- 当连接来自这些 IP 之一时，Clawdbot 会使用 `x-forwarded-for`（或 `x-real-ip`）来确定客户端 IP，用于本地配对检查和 HTTP 认证/本地检查。
- 仅列出你完全控制的代理，并确保它们 **覆盖** 入站的 `x-forwarded-for`。

注意：
- `clawdbot gateway` 除非设置 `gateway.mode` 为 `local`（或传递覆盖标志），否则不会启动。
- `gateway.port` 控制用于 WebSocket + HTTP 的单一多路复用端口（Control UI、hooks、A2UI）。
- OpenAI Chat Completions 端点：**默认禁用**；通过 `gateway.http.endpoints.chatCompletions.enabled: true` 启用。
- 优先级：`--port` > `CLAWDBOT_GATEWAY_PORT` > `gateway.port` > 默认值 `18789`。
- 非回环绑定（`lan`/`tailnet`/`auto`）需要认证。使用 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）。
- 引导向导默认会生成一个网关 token（即使在回环上）。
- `gateway.remote.token` 仅用于远程 CLI 调用；它不会启用本地网关认证。`gateway.token` 会被忽略。

认证与 Tailscale：
- `gateway.auth.mode` 设置握手要求（`token` 或 `password`）。
- `gateway.auth.token` 存储用于 token 认证的共享 token（用于同一台机器上的 CLI）。
- 当设置 `gateway.auth.mode` 时，仅接受该方法（加上可选的 Tailscale 头信息）。
- `gateway.auth.password` 可以在此设置，或通过 `CLAWDBOT_GATEWAY_PASSWORD`（推荐）。
- `gateway.auth.allowTailscale` 允许 Tailscale Serve 身份头（`tailscale-user-login`）在请求通过回环（`x-forwarded-for`、`x-forwarded-proto` 和 `x-forwarded-host`）到达时满足认证。当为 `true` 时，Serve 请求不需要 token 或密码；设置为 `false` 时需要显式凭证。当 `tailscale.mode = "serve"` 且认证模式不是 `password` 时，默认为 `true`。
- `gateway.tailscale.mode: "serve"` 使用 Tailscale Serve（仅限 tailnet，绑定到回环）。
- `gateway.tailscale.mode: "funnel"` 将仪表板公开暴露；需要认证。
- `gateway.tailscale.resetOnExit` 在关闭时重置 Serve/Funnel 配置。

远程客户端默认设置（CLI）：
- `gateway.remote.url` 用于在 `gateway.mode = "remote"` 时设置 CLI 调用的默认网关 WebSocket 地址。
- `gateway.remote.transport` 选择 macOS 的远程传输方式（`ssh` 为默认，`direct` 用于 ws/wss）。当使用 `direct` 时，`gateway.remote.url` 必须是 `ws://` 或 `wss://`。`ws://host` 默认使用端口 `18789`。
- `gateway.remote.token` 为远程调用提供令牌（不进行认证时可留空）。
- `gateway.remote.password` 为远程调用提供密码（不进行认证时可留空）。

macOS 应用程序行为：
- Clawdbot.app 会监视 `~/.clawdbot/clawdbot.json`，并在 `gateway.mode` 或 `gateway.remote.url` 发生变化时实时切换模式。
- 如果 `gateway.mode` 未设置但 `gateway.remote.url` 已设置，则 macOS 应用程序会将其视为远程模式。
- 当你在 macOS 应用程序中更改连接模式时，它会将 `gateway.mode`（在远程模式下还会写入 `gateway.remote.url` 和 `gateway.remote.transport`）写回配置文件。
json5
{
  gateway: {
    mode: "remote",
    remote: {
      url: "ws://gateway.tailnet:18789",
      token: "your-token",
      password: "your-password"
    }
  }
}
``````
直接传输示例（macOS 应用程序）：```json5
{
  gateway: {
    mode: "remote",
    remote: {
      transport: "direct",
      url: "wss://gateway.example.ts.net",
      token: "your-token"
    }
  }
}
```
### `gateway.reload`（配置热加载）

网关会监视 `~/.clawdbot/clawdbot.json`（或 `CLAWDBOT_CONFIG_PATH`）并自动应用更改。

模式：
- `hybrid`（默认）：热加载安全的更改；对于关键更改需要重启网关。
- `hot`：仅应用热加载安全的更改；当需要重启时进行日志记录。
- `restart`：在任何配置更改时重启网关。
- `off`：禁用热加载。
json5
{
  gateway: {
    reload: {
      mode: "hybrid",
      debounceMs: 300
    }
  }
}
``````
#### 热重载矩阵（文件 + 影响）

监听的文件：
- `~/.clawdbot/clawdbot.json`（或 `CLAWDBOT_CONFIG_PATH`）

热应用（无需重启整个网关）：
- `hooks`（Webhook 认证/路径/映射） + `hooks.gmail`（Gmail 监视器重启）
- `browser`（浏览器控制服务器重启）
- `cron`（定时任务服务重启 + 并发性更新）
- `agents.defaults.heartbeat`（心跳运行器重启）
- `web`（WhatsApp 网页渠道重启）
- `telegram`、`discord`、`signal`、`imessage`（渠道重启）
- `agent`、`models`、`routing`、`messages`、`session`、`whatsapp`、`logging`、`skills`、`ui`、`talk`、`identity`、`wizard`（动态读取）

需要完整网关重启：
- `gateway`（端口/绑定/认证/控制 UI/ tailscale）
- `bridge`（旧版）
- `discovery`
- `canvasHost`
- `plugins`
- 任何未知/不支持的配置路径（默认为重启以确保安全）

### 多实例隔离

要在同一台主机上运行多个网关（用于冗余或救援机器人），请隔离每个实例的状态 + 配置，并使用唯一的端口：
- `CLAWDBOT_CONFIG_PATH`（每个实例的配置）
- `CLAWDBOT_STATE_DIR`（会话/凭证）
- `agents.defaults.workspace`（记忆）
- `gateway.port`（每个实例唯一）

便捷标志（CLI）：
- `clawdbot --dev …` → 使用 `~/.clawdbot-dev` + 从基础端口 `19001` 调整端口
- `clawdbot --profile <name> …` → 使用 `~/.clawdbot-<name>`（端口通过配置/环境变量/标志确定）

有关衍生端口映射（网关/浏览器/canvas）请参见 [网关操作手册](/gateway)。
有关浏览器/CDP 端口隔离的详细信息，请参见 [多个网关](/gateway/multiple-gateways)。

示例：```bash
CLAWDBOT_CONFIG_PATH=~/.clawdbot/a.json \
CLAWDBOT_STATE_DIR=~/.clawdbot-a \
clawdbot gateway --port 19001
```
### `hooks` (网关的 Webhook)

在网关的 HTTP 服务器上启用一个简单的 HTTP Webhook 端点。

默认值：
- enabled: `false`
- path: `/hooks`
- maxBodyBytes: `262144` (256 KB)
json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks",
    presets: ["gmail"],
    transformsDir: "~/.clawdbot/hooks",
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        wakeMode: "now",
        name: "Gmail",
        sessionKey: "hook:gmail:{{messages[0].id}}",
        messageTemplate:
          "From: {{messages[0].from}}\nSubject: {{messages[0].subject}}\n{{messages[0].snippet}}",
        deliver: true,
        channel: "last",
        model: "openai/gpt-5.2-mini",
      },
    ],
  }
}
``````
请求必须包含钩子令牌：
- `Authorization: Bearer <token>` **或**
- `x-clawdbot-token: <token>` **或**
- `?token=<token>`

端点：
- `POST /hooks/wake` → `{ text, mode?: "now"|"next-heartbeat" }`
- `POST /hooks/agent` → `{ message, name?, sessionKey?, wakeMode?, deliver?, channel?, to?, model?, thinking?, timeoutSeconds? }`
- `POST /hooks/<name>` → 通过 `hooks.mappings` 解析

`/hooks/agent` 总是将摘要发送到主会话（并可通过 `wakeMode: "now"` 可选地立即触发心跳）。

映射说明：
- `match.path` 匹配 `/hooks` 之后的子路径（例如 `/hooks/gmail` → `gmail`）。
- `match.source` 匹配一个负载字段（例如 `{ source: "gmail" }`），因此你可以使用通用的 `/hooks/ingest` 路径。
- 模板如 `{{messages[0].subject}}` 从负载中读取数据。
- `transform` 可以指向一个返回钩子动作的 JS/TS 模块。
- `deliver: true` 将最终回复发送到一个频道；`channel` 默认为 `last`（若不可用则回退到 WhatsApp）。
- 如果没有先前的交付路径，请显式设置 `channel` + `to`（对于 Telegram/Discord/Google Chat/Slack/Signal/iMessage/MS Teams 是必需的）。
- `model` 覆盖此次钩子运行的 LLM（格式为 `provider/model` 或别名；如果设置了 `agents.defaults.models`，则必须是允许的模型）。

Gmail 辅助配置（由 `clawdbot webhooks gmail setup` / `run` 使用）：```json5
{
  hooks: {
    gmail: {
      account: "clawdbot@gmail.com",
      topic: "projects/<project-id>/topics/gog-gmail-watch",
      subscription: "gog-gmail-watch-push",
      pushToken: "shared-push-token",
      hookUrl: "http://127.0.0.1:18789/hooks/gmail",
      includeBody: true,
      maxBytes: 20000,
      renewEveryMinutes: 720,
      serve: { bind: "127.0.0.1", port: 8788, path: "/" },
      tailscale: { mode: "funnel", path: "/gmail-pubsub" },

      // Optional: use a cheaper model for Gmail hook processing
      // Falls back to agents.defaults.model.fallbacks, then primary, on auth/rate-limit/timeout
      model: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
      // Optional: default thinking level for Gmail hooks
      thinking: "off",
    }
  }
}
```
Gmail 钩子的模型配置：
- `hooks.gmail.model` 指定用于 Gmail 钩子处理的模型（默认使用会话主模型）。
- 接受来自 `agents.defaults.models` 的 `provider/model` 引用或别名。
- 在认证/速率限制/超时情况下，回退到 `agents.defaults.model.fallbacks`，然后是 `agents.defaults.model.primary`。
- 如果设置了 `agents.defaults.models`，则需要将钩子模型包含在允许列表中。
- 启动时，如果配置的模型不在模型目录或允许列表中，会发出警告。
- `hooks.gmail.thinking` 设置 Gmail 钩子的默认思考级别，并可通过每个钩子的 `thinking` 设置进行覆盖。

网关自动启动：
- 如果 `hooks.enabled=true` 并且设置了 `hooks.gmail.account`，网关会在启动时自动运行 `gog gmail watch serve` 并自动续订监视。
- 设置 `CLAWDBOT_SKIP_GMAIL_WATCHER=1` 可以禁用自动启动（用于手动运行）。
- 避免同时运行单独的 `gog gmail watch serve`；这会导致 `listen tcp 127.0.0.1:8788: bind: address already in use` 错误。

注意：当 `tailscale.mode` 为开启时，Clawdbot 默认将 `serve.path` 设置为 `/`，以便 Tailscale 能正确代理 `/gmail-pubsub`（它会移除设置的路径前缀）。
如果你需要后端接收带有前缀的路径，请将 `hooks.gmail.tailscale.target` 设置为完整 URL（并确保 `serve.path` 一致）。

### `canvasHost`（LAN/Tailnet Canvas 文件服务器 + 实时重载）

网关通过 HTTP 提供一个 HTML/CSS/JS 目录，以便 iOS/Android 节点可以直接通过 `canvas.navigate` 访问它。

默认根目录：`~/clawd/canvas`  
默认端口：`18793`（选择此端口以避免 Clawdbot 浏览器的 CDP 端口 `18792`）  
服务器监听在 **网关绑定的主机**（LAN 或 Tailnet）上，以便节点可以访问它。

该服务器：
- 提供 `canvasHost.root` 下的文件
- 向提供的 HTML 中注入一个小型的实时重载客户端
- 监视目录，并通过 `/__clawdbot/ws` 的 WebSocket 端点广播重载
- 当目录为空时，会自动创建一个初始的 `index.html`（以便立即看到内容）
- 还会在 `/__clawdbot__/a2ui/` 提供 A2UI，并将其作为 `canvasHostUrl` 向节点公开（节点始终使用此 URL 访问 Canvas/A2UI）

如果目录较大或遇到 `EMFILE` 错误，可以禁用实时重载（和文件监视）：
- 配置：`canvasHost: { liveReload: false }`
json5
{
  canvasHost: {
    root: "~/clawd/canvas",
    port: 18793,
    liveReload: true
  }
}
``````
对 `canvasHost.*` 的更改需要重启网关（配置重新加载会重启）。

禁用方式：
- 配置：`canvasHost: { enabled: false }`
- 环境变量：`CLAWDBOT_SKIP_CANVAS_HOST=1`

### `bridge`（旧版 TCP 桥接器，已移除）

当前版本不再包含 TCP 桥接器监听器；`bridge.*` 的配置项将被忽略。  
节点通过网关的 WebSocket 连接。此部分仅保留以供历史参考。

旧版行为：
- 网关可以为节点（iOS/Android）暴露一个简单的 TCP 桥接器，通常在端口 `18790`。

默认值：
- enabled: `true`
- port: `18790`
- bind: `lan`（绑定到 `0.0.0.0`）

绑定模式：
- `lan`: `0.0.0.0`（可通过任何接口访问，包括局域网/Wi-Fi 和 Tailscale）
- `tailnet`: 仅绑定到机器的 Tailscale IP（推荐用于 Vienna ⇄ London）
- `loopback`: `127.0.0.1`（仅本地可用）
- `auto`: 如果存在 Tailscale IP，则优先使用 `tailnet`，否则使用 `lan`

TLS：
- `bridge.tls.enabled`: 为桥接连接启用 TLS（启用时仅支持 TLS）。
- `bridge.tls.autoGenerate`: 当没有证书/密钥时自动生成一个自签名证书（默认：true）。
- `bridge.tls.certPath` / `bridge.tls.keyPath`: 桥接证书和私钥的 PEM 路径。
- `bridge.tls.caPath`: 可选的 PEM CA 证书包（自定义根证书或未来的 mTLS）。

当启用 TLS 时，网关会在发现 TXT 记录中公布 `bridgeTls=1` 和 `bridgeTlsSha256`，以便节点可以固定证书。  
如果尚未存储指纹，手动连接将使用“首次信任”机制。  
自动生成的证书需要 `openssl` 在 PATH 中；如果生成失败，桥接器将无法启动。```json5
{
  bridge: {
    enabled: true,
    port: 18790,
    bind: "tailnet",
    tls: {
      enabled: true,
      // Uses ~/.clawdbot/bridge/tls/bridge-{cert,key}.pem when omitted.
      // certPath: "~/.clawdbot/bridge/tls/bridge-cert.pem",
      // keyPath: "~/.clawdbot/bridge/tls/bridge-key.pem"
    }
  }
}
```
### `discovery.wideArea`（广域Bonjour / 单播DNS-SD）

当启用时，网关会在 `~/.clawdbot/dns/` 目录下为 `_clawdbot-bridge._tcp` 写入一个单播DNS-SD区域，使用标准的发现域 `clawdbot.internal.`。

为了让iOS/Android设备在不同网络之间进行发现（例如：维也纳 ⇄ 伦敦），请配合使用以下工具：
- 网关主机上的DNS服务器，用于解析 `clawdbot.internal.`（推荐使用CoreDNS）
- Tailscale 的 **split DNS** 功能，使客户端通过该DNS服务器解析 `clawdbot.internal`

一次性设置助手（网关主机）：
bash
clawdbot dns setup --apply
``````
"```json5
{
  discovery: { wideArea: { enabled: true } }
}
```
## 模板变量

模板占位符会在 `tools.media.*.models[].args` 和 `tools.media.models[].args`（以及任何未来的模板参数字段）中展开。

| 变量 | 描述 |
|------|------|
| `{{Body}}` | 完整的入站消息内容 |
| `{{RawBody}}` | 原始的入站消息内容（无历史/发送者包装；最适合命令解析） |
| `{{BodyStripped}}` | 去除群组提及后的消息内容（最适合代理的默认值） |
| `{{From}}` | 发送者标识符（WhatsApp 中为 E.164 格式；不同渠道可能不同） |
| `{{To}}` | 目标标识符 |
| `{{MessageSid}}` | 渠道消息 ID（当可用时） |
| `{{SessionId}}` | 当前会话 UUID |
| `{{IsNewSession}}` | 当创建了一个新会话时为 `"true"` |
| `{{MediaUrl}}` | 入站媒体伪 URL（如果存在） |
| `{{MediaPath}}` | 本地媒体路径（如果已下载） |
| `{{MediaType}}` | 媒体类型（image/audio/document/…） |
| `{{Transcript}}` | 音频转录文本（当启用时） |
| `{{Prompt}}` | CLI 条目的解析后媒体提示 |
| `{{MaxChars}}` | CLI 条目的最大输出字符数 |
| `{{ChatType}}` | `"direct"` 或 `"group"` |
| `{{GroupSubject}}` | 群组主题（尽力而为） |
| `{{GroupMembers}}` | 群组成员预览（尽力而为） |
| `{{SenderName}}` | 发送者显示名称（尽力而为） |
| `{{SenderE164}}` | 发送者电话号码（尽力而为） |
| `{{Provider}}` | 提供商提示（whatsapp|telegram|discord|googlechat|slack|signal|imessage|msteams|webchat|…） |

## 定时任务（网关调度器）

定时任务是网关自带的调度器，用于唤醒和定时任务。请参阅 [定时任务](/automation/cron-jobs) 了解该功能的概览和 CLI 示例。
json5
{
  cron: {
    enabled: true,
    maxConcurrentRuns: 2
  }
}
``````
---

*下一个：[Agent 运行时](/concepts/agent)* 🦞