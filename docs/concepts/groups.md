---
summary: "Group chat behavior across surfaces (WhatsApp/Telegram/Discord/Slack/Signal/iMessage/Microsoft Teams)"
read_when:
  - Changing group chat behavior or mention gating
---

# 群组

Clawdbot 在各个平台的群组聊天中表现一致：WhatsApp、Telegram、Discord、Slack、Signal、iMessage、Microsoft Teams。

## 初学者介绍（2分钟）
Clawdbot“居住”在您自己的消息账户中。没有单独的 WhatsApp 机器人用户。
如果 **您** 在一个群组中，Clawdbot 可以看到该群组并在此回复。

默认行为：
- 群组是受限的（`groupPolicy: "allowlist"`）。
- 回复需要被提及，除非您明确禁用提及 gating。

翻译：被允许的发送者可以通过提及 Clawdbot 来触发它。

> TL;DR
> - **私信访问** 由 `*.allowFrom` 控制。
> - **群组访问** 由 `*.groupPolicy` + 允许列表（`*.groups`、`*.groupAllowFrom`）控制。
> - **回复触发** 由提及 gating 控制（`requireMention`，`/activation`）。

快速流程（群组消息会发生什么）：

groupPolicy? disabled -> drop
groupPolicy? allowlist -> group allowed? no -> drop
requireMention? yes -> mentioned? no -> store for context only
otherwise -> reply``````
![群组消息流程](/images/groups-flow.svg)

如果你想要...
| 目标 | 应设置的值 |
|------|-------------|
| 允许所有群组，但仅通过@提及回复 | `groups: { "*": { requireMention: true } }` |
| 禁用所有群组回复 | `groupPolicy: "disabled"` |
| 仅允许特定群组 | `groups: { "<group-id>": { ... } }`（不使用`"*"`键） |
| 只有你才能在群组中触发 | `groupPolicy: "allowlist"`，`groupAllowFrom: ["+1555..."]` |

## 会话键
- 群组会话使用 `agent:<agentId>:<channel>:group:<id>` 会话键（房间/频道使用 `agent:<agentId>:<channel>:channel:<id>`）。
- Telegram 论坛话题会在群组 ID 后添加 `:topic:<threadId>`，因此每个话题都有自己的会话。
- 私人聊天使用主会话（或如果配置了，使用按发送者区分的会话）。
- 群组会话跳过心跳检测。

## 模式：个人私聊 + 公共群组（单个代理）

是的 —— 如果你的“个人”流量是 **私聊**，而“公共”流量是 **群组**，这种模式效果很好。

原因：在单代理模式下，私聊通常落在 **主** 会话键（`agent:main:main`），而群组总是使用 **非主** 会话键（`agent:main:<channel>:group:<id>`）。如果你启用沙箱模式 `mode: "non-main"`，这些群组会话会在 Docker 中运行，而你的主私聊会话则保持在主机上。

这为你提供了一个代理“大脑”（共享工作区 + 内存），但有两种执行方式：
- **私聊**：完整工具（主机）
- **群组**：沙箱 + 限制工具（Docker）

> 如果你需要真正隔离的工作区/角色（“个人”和“公共”不能混用），请使用第二个代理 + 绑定。详见 [多代理路由](/concepts/multi-agent)。

示例（私聊在主机上，群组在沙箱中并仅使用消息工具）：```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // groups/channels are non-main -> sandboxed
        scope: "session", // strongest isolation (one container per group/channel)
        workspaceAccess: "none"
      }
    }
  },
  tools: {
    sandbox: {
      tools: {
        // If allow is non-empty, everything else is blocked (deny still wins).
        allow: ["group:messaging", "group:sessions"],
        deny: ["group:runtime", "group:fs", "group:ui", "nodes", "cron", "gateway"]
      }
    }
  }
}
```
想要“组只能看到文件夹 X”而不是“无主机访问”？保持 `workspaceAccess: "none"`，并将允许的路径挂载到沙箱中：
json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        scope: "session",
        workspaceAccess: "none",
        docker: {
          binds: [
            // hostPath:containerPath:mode
            "~/FriendsShared:/data:ro"
          ]
        }
      }
    }
  }
}
`````````
相关：
- 配置键和默认值：[网关配置](/gateway/configuration#agentsdefaultssandbox)
- 调试工具被阻止的原因：[沙箱 vs 工具策略 vs 提权](/gateway/sandbox-vs-tool-policy-vs-elevated)
- 绑定挂载详情：[沙箱](/gateway/sandboxing#custom-bind-mounts)

## 显示标签
- UI 标签在可用时使用 `displayName`，格式为 `<channel>:<token>`。
- `#room` 专用于房间/频道；群组聊天使用 `g-<slug>`（小写，空格转为 `-`，保留 `#@+._-`）。```json5
{
  channels: {
    whatsapp: {
      groupPolicy: "disabled", // "open" | "disabled" | "allowlist"
      groupAllowFrom: ["+15551234567"]
    },
    telegram: {
      groupPolicy: "disabled",
      groupAllowFrom: ["123456789", "@username"]
    },
    signal: {
      groupPolicy: "disabled",
      groupAllowFrom: ["+15551234567"]
    },
    imessage: {
      groupPolicy: "disabled",
      groupAllowFrom: ["chat_id:123"]
    },
    msteams: {
      groupPolicy: "disabled",
      groupAllowFrom: ["user@org.com"]
    },
    discord: {
      groupPolicy: "allowlist",
      guilds: {
        "GUILD_ID": { channels: { help: { allow: true } } }
      }
    },
    slack: {
      groupPolicy: "allowlist",
      channels: { "#general": { allow: true } }
    },
    matrix: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["@owner:example.org"],
      groups: {
        "!roomId:example.org": { allow: true },
        "#alias:example.org": { allow: true }
      }
    }
  }
}
```
| 策略 | 行为 |
|--------|----------|
| `"open"` | 群组绕过允许列表；@提及仍然适用。 |
| `"disabled"` | 完全阻止所有群组消息。 |
| `"allowlist"` | 仅允许与配置的允许列表匹配的群组/房间。 |

注意事项：
- `groupPolicy` 与提及 gating（需要 @提及）是分开的。
- WhatsApp/Telegram/iMessage/Microsoft Teams：使用 `groupAllowFrom`（回退：显式 `allowFrom`）。
- Discord：允许列表使用 `channels.discord.guilds.<id>.channels`。
- Slack：允许列表使用 `channels.slack.channels`。
- Matrix：允许列表使用 `channels.matrix.groups`（房间 ID、别名或名称）。使用 `channels.matrix.groupAllowFrom` 来限制发件人；也支持按房间的 `users` 允许列表。
- 群组私信由单独的设置控制（`channels.discord.dm.*`, `channels.slack.dm.*`）。
- Telegram 允许列表可以匹配用户 ID（`"123456789"`，`"telegram:123456789"`，`"tg:123456789"`）或用户名（`"@alice"` 或 `"alice"`）；前缀不区分大小写。
- 默认是 `groupPolicy: "allowlist"`；如果群组允许列表为空，则群组消息将被阻止。

快速理解模型（群组消息的评估顺序）：
1) `groupPolicy`（open/disabled/allowlist）
2) 群组允许列表（`*.groups`, `*.groupAllowFrom`, 频道特定允许列表）
3) 提及 gating（`requireMention`, `/activation`）

## 提及 gating（默认）
除非在群组级别被覆盖，否则群组消息需要提及。默认设置位于每个子系统下的 `*.groups."*"`。

回复机器人消息被视为隐式提及（当频道支持回复元数据时）。这适用于 Telegram、WhatsApp、Slack、Discord 和 Microsoft Teams。
json5
{
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: true },
        "123@g.us": { requireMention: false }
      }
    },
    telegram: {
      groups: {
        "*": { requireMention: true },
        "123456789": { requireMention: false }
      }
    },
    imessage: {
      groups: {
        "*": { requireMention: true },
        "123": { requireMention: false }
      }
    }
  },
  agents: {
    list: [
      {
        id: "main",
        groupChat: {
          mentionPatterns: ["@clawd", "clawdbot", "\\+15555550123"],
          historyLimit: 50
        }
      }
    ]
  }
}``````
说明：
- `mentionPatterns` 是不区分大小写的正则表达式。
- 提供显式提及的表面仍然会通过；模式仅作为备用方案。
- 每个代理的覆盖设置：`agents.list[].groupChat.mentionPatterns`（当多个代理共享一个群组时很有用）。
- 提及门控仅在可以进行提及检测时生效（配置了原生提及或 `mentionPatterns`）。
- Discord 默认配置位于 `channels.discord.guilds."*"`（可按服务器/频道覆盖）。
- 群组历史记录上下文在所有频道中统一处理，并且是 **仅限待处理** 的（由于提及门控而被跳过的消息）；使用 `messages.groupChat.historyLimit` 设置全局默认值，使用 `channels.<channel>.historyLimit`（或 `channels.<channel>.accounts.*.historyLimit`）进行覆盖。设置 `0` 可以禁用该功能。

## 群组允许列表
当配置了 `channels.whatsapp.groups`、`channels.telegram.groups` 或 `channels.imessage.groups` 时，这些键会作为群组允许列表使用。使用 `"*"` 可以允许所有群组，同时仍然设置默认的提及行为。

常用意图（复制/粘贴）：

1) 禁用所有群组回复```json5
{
  channels: { whatsapp: { groupPolicy: "disabled" } }
}
```
2) 仅允许特定群组（WhatsApp）
json5
{
  channels: {
    whatsapp: {
      groups: {
        "123@g.us": { requireMention: true },
        "456@g.us": { requireMention: false }
      }
    }
  }
}``````
3) 允许所有群组，但需要提及（显式）```json5
{
  channels: {
    whatsapp: {
      groups: { "*": { requireMention: true } }
    }
  }
}
```
4) 只有群主可以触发群组（WhatsApp）
json5
{
  channels: {
    whatsapp: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"],
      groups: { "*": { requireMention: true } }
    }
  }
}``````
## 激活（仅限群主）
群主可以切换群组的激活状态：
- `/activation mention`
- `/activation always`

群主由 `channels.whatsapp.allowFrom` 确定（如果未设置，则使用机器人的自身 E.164 号码）。请将命令作为独立消息发送。其他界面目前会忽略 `/activation` 命令。

## 上下文字段
群组入站数据包会设置以下字段：
- `ChatType=group`
- `GroupSubject`（如果已知）
- `GroupMembers`（如果已知）
- `WasMentioned`（提及门控结果）
- Telegram 论坛主题还会包含 `MessageThreadId` 和 `IsForum`。

代理系统提示会在新群组会话的第一次交互中包含一个群组介绍。它提醒模型以人类的方式回应，避免使用 Markdown 表格，并避免输入字面的 `\n` 序列。

## iMessage 特定内容
- 在路由或允许列表中优先使用 `chat_id:<id>`。
- 列出聊天：`imsg chats --limit 20`。
- 群组回复始终返回到同一个 `chat_id`。

## WhatsApp 特定内容
有关 WhatsApp 专有的行为（如历史注入、提及处理细节），请参阅 [群组消息](/concepts/group-messages)。