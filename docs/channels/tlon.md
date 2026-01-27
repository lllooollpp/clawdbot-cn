---
summary: "Tlon/Urbit support status, capabilities, and configuration"
read_when:
  - Working on Tlon/Urbit channel features
---

# Tlon（插件）

Tlon 是一个基于 Urbit 的去中心化消息应用。Clawdbot 可以连接到你的 Urbit 船，并能够回复私信和群聊消息。默认情况下，群聊回复需要 @ 提及，并可以通过允许列表进一步限制。

状态：通过插件支持。支持私信、群聊提及、线程回复以及纯文本媒体回退（URL 会附加在标题后）。不支持表情、投票和原生媒体上传。
bash
clawdbot plugins install @clawdbot/tlon``````
本地签出（当从 Git 仓库运行时）：```bash
clawdbot plugins install ./extensions/tlon
```
"Details: [Plugins](/plugin)

## 安装步骤

1) 安装 Tlon 插件。
2) 收集你的船坞 URL 和登录代码。
3) 配置 `channels.tlon`。
4) 重启网关。
5) 向机器人发送私信或在群组频道中提及它。

最小配置（单账户）：
json5
{
  channels: {
    tlon: {
      enabled: true,
      ship: "~sampel-palnet",
      url: "https://your-ship-host",
      code: "lidlut-tabwed-pillex-ridrup"
    }
  }
}``````
## 群组频道

自动发现功能默认已启用。您也可以手动固定频道：```json5
{
  channels: {
    tlon: {
      groupChannels: [
        "chat/~host-ship/general",
        "chat/~host-ship/support"
      ]
    }
  }
}
```
禁用自动发现：
json5
{
  channels: {
    tlon: {
      autoDiscoverChannels: false
    }
  }
}``````
## 访问控制

DM 允许列表（空 = 允许所有）：```json5
{
  channels: {
    tlon: {
      dmAllowlist: ["~zod", "~nec"]
    }
  }
}
```
组授权（默认受限）：
json5
{
  channels: {
    tlon: {
      defaultAuthorizedShips: ["~zod"],
      authorization: {
        channelRules: {
          "chat/~host-ship/general": {
            mode: "受限",
            allowedShips: ["~zod", "~nec"]
          },
          "chat/~host-ship/announcements": {
            mode: "公开"
          }
        }
      }
    }
  }
}``````
## 交付目标（CLI/定时任务）

使用这些目标与 `clawdbot message send` 或定时任务进行消息传递：

- 私信：`~sampel-palnet` 或 `dm/~sampel-palnet`
- 群组：`chat/~host-ship/channel` 或 `group:~host-ship/channel`

## 注意事项

- 群组回复需要提及（例如 `~your-bot-ship`）才能响应。
- 线程回复：如果传入的消息在某个线程中，Clawdbot 会在该线程中回复。
- 媒体：`sendMedia` 会回退为文本 + 链接（不支持原生上传）。