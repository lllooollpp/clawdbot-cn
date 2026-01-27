---
summary: "Slash commands: text vs native, config, and supported commands"
read_when:
  - Using or configuring chat commands
  - Debugging command routing or permissions
---

# 斜杠命令

命令由网关处理。大多数命令必须作为以 `/` 开头的**独立消息**发送。
仅限主机的 bash 聊天命令使用 `! <cmd>`（`/bash <cmd>` 作为别名）。

存在两个相关系统：

- **命令**：独立的 `/...` 消息。
- **指令**：`/think`、`/verbose`、`/reasoning`、`/elevated`、`/exec`、`/model`、`/queue`。
  - 在模型看到消息之前，这些指令会被移除。
  - 在普通的聊天消息中（不是仅包含指令的消息），它们被视为“内联提示”，并且**不会**保留会话设置。
  - 在仅包含指令的消息中（消息中只包含指令），它们会保留到会话中，并回复确认信息。

还有一些**内联快捷方式**（仅允许授权发送者使用）：`/help`、`/commands`、`/status`、`/whoami`（`/id`）。
它们会立即执行，在模型看到消息之前会被移除，剩余文本会继续通过正常的处理流程。
json5
{
  commands: {
    native: "auto",
    nativeSkills: "auto",
    text: true,
    bash: false,
    bashForegroundMs: 2000,
    config: false,
    debug: false,
    restart: false,
    useAccessGroups: true
  }
}
``````
- `commands.text`（默认值为 `true`）启用聊天消息中的 `/...` 命令解析。
  - 在没有原生命令支持的平台（如 WhatsApp/WebChat/Signal/iMessage/Google Chat/MS Teams）上，即使将此设置为 `false`，文本命令仍然可以正常工作。
- `commands.native`（默认值为 `"auto"`）注册原生命令。
  - Auto：对于 Discord/Telegram 开启；对于 Slack 关闭（直到你添加斜杠命令）；对于没有原生支持的平台则被忽略。
  - 可通过设置 `channels.discord.commands.native`、`channels.telegram.commands.native` 或 `channels.slack.commands.native` 来为每个平台单独覆盖（布尔值或 `"auto"`）。
  - `false` 会在 Discord/Telegram 启动时清除之前注册的命令。Slack 命令在 Slack 应用中管理，不会自动清除。
- `commands.nativeSkills`（默认值为 `"auto"`）在支持时原生注册 **skill** 命令。
  - Auto：对于 Discord/Telegram 开启；对于 Slack 关闭（Slack 需要为每个 skill 创建斜杠命令）。
  - 可通过设置 `channels.discord.commands.nativeSkills`、`channels.telegram.commands.nativeSkills` 或 `channels.slack.commands.nativeSkills` 来为每个平台单独覆盖（布尔值或 `"auto"`）。
- `commands.bash`（默认值为 `false`）启用 `! <cmd>` 来运行主机 shell 命令（`/bash <cmd>` 是别名；需要 `tools.elevated` 允许列表）。
- `commands.bashForegroundMs`（默认值为 `2000`）控制 bash 在切换到后台模式前等待的时间（`0` 表示立即后台运行）。
- `commands.config`（默认值为 `false`）启用 `/config`（读取/写入 `clawdbot.json`）。
- `commands.debug`（默认值为 `false`）启用 `/debug`（仅在运行时覆盖）。
- `commands.useAccessGroups`（默认值为 `true`）对命令强制执行允许列表/策略。

**文本 + 原生命令（当启用时）：**
- `/help`
- `/commands`
- `/skill <名称> [输入]`（通过名称运行一个技能）
- `/status`（显示当前状态；当可用时包括当前模型提供者的使用情况/配额）
- `/allowlist`（列出/添加/删除允许列表条目）
- `/approve <id> allow-once|allow-always|deny`（解决执行审批提示）
- `/context [list|detail|json]`（解释“上下文”；`detail` 显示每文件 + 每工具 + 每技能 + 系统提示的大小）
- `/whoami`（显示你的发送者 ID；别名：`/id`）
- `/subagents list|stop|log|info|send`（检查、停止、记录或向当前会话的子代理发送消息）
- `/config show|get|set|unset`（将配置持久化到磁盘，仅限所有者；需要 `commands.config: true`）
- `/debug show|set|unset|reset`（运行时覆盖，仅限所有者；需要 `commands.debug: true`）
- `/usage off|tokens|full|cost`（每条响应的使用情况页脚或本地成本摘要）
- `/tts off|always|inbound|tagged|status|provider|limit|summary|audio`（控制语音合成；详见 [/tts](/tts)）
  - Discord：原生命令是 `/voice`（Discord 保留了 `/tts`）；文本 `/tts` 仍然有效。
- `/stop`
- `/restart`
- `/dock-telegram`（别名：`/dock_telegram`）（切换回复到 Telegram）
- `/dock-discord`（别名：`/dock_discord`）（切换回复到 Discord）
- `/dock-slack`（别名：`/dock_slack`）（切换回复到 Slack）
- `/activation mention|always`（仅限群组）
- `/send on|off|inherit`（仅限所有者）
- `/reset` 或 `/new [model]`（可选模型提示；其余内容将被传递）
- `/think <off|minimal|low|medium|high|xhigh>`（根据模型/提供者动态选择；别名：`/thinking`，`/t`）
- `/verbose on|full|off`（别名：`/v`）
- `/reasoning on|off|stream`（别名：`/reason`；当开启时，会发送一个以 `Reasoning:` 为前缀的单独消息；`stream` = 仅限 Telegram 草稿）
- `/elevated on|off|ask|full`（别名：`/elev`；`full` 跳过执行审批）
- `/exec host=<sandbox|gateway|node> security=<deny|allowlist|full> ask=<off|on-miss|always> node=<id>`（发送 `/exec` 以查看当前设置）
- `/model <名称>`（别名：`/models`；或从 `agents.defaults.models.*.alias` 中使用 `/<别名>`）
- `/queue <模式>`（加上如 `debounce:2s cap:25 drop:summarize` 等选项；发送 `/queue` 以查看当前设置）
- `/bash <命令>`（仅限主机；别名 `! <命令>`；需要 `commands.bash: true` + `tools.elevated` 允许列表）

**纯文本命令：**
- `/compact [说明]`（详见 [/concepts/compaction](/concepts/compaction)）
- `! <命令>`（仅限主机；一次一条；使用 `!poll` + `!stop` 来处理长时间运行的任务）
- `!poll`（检查输出/状态；可选 `sessionId`；`/bash poll` 也有效）
- `!stop`（停止正在运行的 bash 任务；可选 `sessionId`；`/bash stop` 也有效）

注意事项：
- 命令可以在命令和参数之间接受一个可选的 `:`（例如 `/think: high`，`/send: on`，`/help:`）。
- `/new <model>` 接受一个模型别名、`provider/model` 或提供者名称（模糊匹配）；如果没有匹配，文本将被视为消息正文。
- 有关完整的提供者使用说明，请使用 `clawdbot status --usage`。
- `/allowlist add|remove` 需要 `commands.config=true`，并遵守频道的 `configWrites` 设置。
- `/usage` 控制每条回复的使用说明页脚；`/usage cost` 会从 Clawdbot 会话日志中打印本地成本摘要。
- `/restart` 默认是禁用的；设置 `commands.restart: true` 来启用它。
- `/verbose` 用于调试和额外的可见性；在正常使用中请保持 **关闭**。
- `/reasoning`（以及 `/verbose`）在群组环境中是危险的：它们可能会暴露你未打算公开的内部推理或工具输出。尤其在群聊中，建议保持关闭。
- **快速路径**：来自允许列表发送者的纯命令消息会立即处理（绕过队列 + 模型）。
- **群组提及限制**：来自允许列表发送者的纯命令消息可以绕过提及要求。
- **内联快捷方式（仅允许列表发送者）**：某些命令也可以嵌入在普通消息中，并在模型看到剩余文本之前被剥离。
  - 示例：`hey /status` 会触发状态回复，剩余文本将继续通过正常流程处理。
- 当前支持的命令：`/help`，`/commands`，`/status`，`/whoami`（`/id`）。
- 未授权的纯命令消息会被静默忽略，内联的 `/...` 令牌会被视为普通文本。
- **技能命令**：`user-invocable` 技能会作为斜杠命令暴露出来。名称会被清理为 `a-z0-9_`（最大 32 个字符）；如果有冲突，会添加数字后缀（例如 `_2`）。
  - `/skill <name> [input]` 通过名称运行一个技能（当原生命令限制阻止每个技能的命令时很有用）。
  - 默认情况下，技能命令会被转发给模型作为普通请求。
  - 技能可以可选地声明 `command-dispatch: tool`，以将命令直接路由到工具（确定性操作，不经过模型）。
  - 示例：`/prose`（OpenProse 插件）—— 请参见 [OpenProse](/prose)。
- **原生命令参数**：Discord 会为动态选项提供自动补全（当你省略必填参数时，会显示按钮菜单）。Telegram 和 Slack 在命令支持选项且你省略参数时会显示按钮菜单。

## 使用界面（显示位置）

- **提供者使用/配额**（例如：“Claude 80% 剩余”）会在启用使用跟踪时显示在 `/status` 中，针对当前模型提供者。
- **每条回复的令牌/成本** 由 `/usage off|tokens|full` 控制（附加到正常回复中）。
- `/model status` 是关于 **模型/认证/端点** 的，而不是关于使用情况的。```
/model
/model list
/model 3
/model openai/gpt-5.2
/model opus@anthropic:claude-cli
/model status
```
注意事项：
- `/model` 和 `/model list` 显示一个简洁的、带编号的选取器（模型系列 + 可用提供者）。
- `/model <#>` 从该选取器中选择（在可能的情况下优先使用当前提供者）。
- `/model status` 显示详细视图，包括配置的提供者端点（`baseUrl`）和 API 模式（`api`）（如果可用的话）。

## 调试覆盖

`/debug` 允许你设置 **仅运行时** 的配置覆盖（内存中，而非磁盘）。仅限所有者使用。默认情况下已禁用；可通过 `commands.debug: true` 启用。

/debug show
/debug set messages.responsePrefix="[clawdbot]"
/debug set channels.whatsapp.allowFrom=["+1555","+4477"]
/debug unset messages.responsePrefix
/debug reset
``````
注意事项：
- 覆盖设置会立即应用于新的配置读取，但不会写入 `clawdbot.json` 文件。
- 使用 `/debug reset` 来清除所有覆盖设置，并返回到磁盘上的配置。

## 配置更新

`/config` 会将配置写入磁盘上的配置文件 (`clawdbot.json`)。仅限所有者使用。默认情况下已禁用；可以通过 `commands.config: true` 启用。```
/config show
/config show messages.responsePrefix
/config get messages.responsePrefix
/config set messages.responsePrefix="[clawdbot]"
/config unset messages.responsePrefix
```
## 注意事项

- 配置在写入前会进行验证；无效的更改将被拒绝。
- `/config` 的更新会在重启后仍然保留。

## 表面注意事项

- **文本命令** 在正常的聊天会话中运行（私聊共享 `main`，群组有各自的会话）。
- **原生命令** 使用隔离的会话：
  - Discord: `agent:<agentId>:discord:slash:<userId>`
  - Slack: `agent:<agentId>:slack:slash:<userId>`（前缀可通过 `channels.slack.slashCommand.sessionPrefix` 配置）
  - Telegram: `telegram:slash:<userId>`（通过 `CommandTargetSessionKey` 指定聊天会话）
- **`/stop`** 命令会针对当前活动的聊天会话，以中止当前的运行。
- **Slack：** `channels.slack.slashCommand` 仍然支持单个 `/clawd` 风格的命令。如果你启用了 `commands.native`，你必须为每个内置命令创建一个 Slack 斜杠命令（命令名称与 `/help` 相同）。Slack 的命令参数菜单会以临时的 Block Kit 按钮形式发送。