---
summary: "Heartbeat polling messages and notification rules"
read_when:
  - Adjusting heartbeat cadence or messaging
  - Deciding between heartbeat and cron for scheduled tasks
---

# 心跳（网关）

> **心跳与定时任务？** 有关何时使用每种方式的指导，请参阅 [定时任务与心跳](/automation/cron-vs-heartbeat)。

Heartbeat 在主会话中运行**周期性代理轮次**，这样模型可以在不频繁打扰你的前提下，突出显示需要关注的内容。

## 快速入门（初学者）

1. 保持心跳功能开启（默认为 `30m`，或对于 Anthropic OAuth/setup-token 为 `1h`），或设置你自己的周期。
2. 在代理工作区中创建一个简短的 `HEARTBEAT.md` 检查清单（可选但推荐）。
3. 决定心跳消息应该发送到哪里（`target: "last"` 是默认设置）。
4. 可选：启用心跳推理输出以提高透明度。
5. 可选：将心跳限制在工作时间（本地时间）。
  
示例配置：
json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last",
        // activeHours: { start: "08:00", end: "24:00" },
        // includeReasoning: true, // 可选：同时发送单独的 `Reasoning:` 消息
      }
    }
  }
}
``````
## 默认设置

- 间隔：`30m`（当检测到 Anthropic OAuth/setup-token 认证模式时为 `1h`）。设置 `agents.defaults.heartbeat.every` 或每个代理的 `agents.list[].heartbeat.every`；使用 `0m` 来禁用。
- 心跳提示内容（可通过 `agents.defaults.heartbeat.prompt` 配置）：
  `如果存在 HEARTBEAT.md（工作区上下文），请阅读它。严格遵循提示。不要推断或重复之前的聊天中的旧任务。如果没有需要关注的内容，请回复 HEARTBEAT_OK。`
- 心跳提示内容会**原样**作为用户消息发送。系统提示中包含一个“心跳”部分，并且该运行会在内部被标记。

- 活动时段（`heartbeat.activeHours`）会在配置的时区中进行检查。在时段外时，心跳会被跳过，直到下一个在时段内的时间点。

## 心跳提示的用途

默认提示是故意设计得比较宽泛的：
- **后台任务**：“考虑未完成的任务”会提示代理检查跟进事项（收件箱、日历、提醒、排队任务），并突出显示任何紧急事项。
- **人工检查**：“在白天有时检查你的用户”会提示代理偶尔发送一个轻量级的“你有什么需要吗？”消息，但通过使用你配置的本地时区避免夜间骚扰（参见 [/concepts/timezone](/concepts/timezone)）。

如果你希望心跳执行非常特定的任务（例如“检查 Gmail PubSub 统计”或“验证网关健康”），请将 `agents.defaults.heartbeat.prompt`（或 `agents.list[].heartbeat.prompt`）设置为自定义内容（原样发送）。

## 响应协议

- 如果没有需要关注的内容，请回复 **`HEARTBEAT_OK`**。
- 在心跳运行期间，Clawdbot 会将 `HEARTBEAT_OK` 视为确认信号，当它出现在回复的**开头或结尾**时。如果剩余内容**≤ `ackMaxChars`**（默认：300），则会移除该标记并丢弃回复。
- 如果 `HEARTBEAT_OK` 出现在回复的**中间**，则不会被特殊处理。
- 对于警报信息，**不要**包含 `HEARTBEAT_OK`；只返回警报文本。

在非心跳时段，如果消息的开头或结尾出现了多余的 `HEARTBEAT_OK`，则会被移除并记录；如果消息仅包含 `HEARTBEAT_OK`，则会被丢弃。```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",           // default: 30m (0m disables)
        model: "anthropic/claude-opus-4-5",
        includeReasoning: false, // default: false (deliver separate Reasoning: message when available)
        target: "last",         // last | none | <channel id> (core or plugin, e.g. "bluebubbles")
        to: "+15551234567",     // optional channel-specific override
        prompt: "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.",
        ackMaxChars: 300         // max chars allowed after HEARTBEAT_OK
      }
    }
  }
}
```
### 范围与优先级

- `agents.defaults.heartbeat` 设置全局的心跳行为。
- `agents.list[].heartbeat` 会在其上合并；如果任何代理有 `heartbeat` 块，**只有这些代理** 会运行心跳。
- `channels.defaults.heartbeat` 为所有频道设置默认可见性。
- `channels.<channel>.heartbeat` 覆盖频道的默认设置。
- `channels.<channel>.accounts.<id>.heartbeat`（多账号频道）覆盖频道级别的设置。

### 每个代理的心跳

如果任何 `agents.list[]` 条目包含 `heartbeat` 块，**只有这些代理** 会运行心跳。每个代理的块会合并到 `agents.defaults.heartbeat` 上（因此你可以统一设置共享默认值，并根据需要逐个代理进行覆盖）。

示例：两个代理，只有第二个代理运行心跳。
json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last"
      }
    },
    list: [
      { id: "main", default: true },
      {
        id: "ops",
        heartbeat: {
          every: "1h",
          target: "whatsapp",
          to: "+15551234567",
          prompt: "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK."
        }
      }
    ]
  }
}
``````
### 场地笔记

- `every`: 心跳间隔（持续时间字符串；默认单位 = 分钟）。
- `model`: 可选的模型覆盖，用于心跳运行（`provider/model`）。
- `includeReasoning`: 当启用时，也会在可用的情况下发送单独的 `Reasoning:` 消息（格式与 `/reasoning on` 相同）。
- `session`: 可选的会话键，用于心跳运行。
  - `main`（默认）：代理主会话。
  - 显式会话键（从 `clawdbot sessions --json` 或 [sessions CLI](/cli/sessions) 复制）。
  - 会话键格式：参见 [会话](/concepts/session) 和 [组](/concepts/groups)。
- `target`:
  - `last`（默认）：发送到最后一个使用的外部渠道。
  - 显式渠道：`whatsapp` / `telegram` / `discord` / `googlechat` / `slack` / `msteams` / `signal` / `imessage`。
  - `none`：运行心跳但**不**对外发送。
- `to`: 可选的接收者覆盖（渠道特定的 ID，例如 WhatsApp 的 E.164 格式或 Telegram 的聊天 ID）。
- `prompt`: 覆盖默认提示内容（不合并）。
- `ackMaxChars`: 在发送 `HEARTBEAT_OK` 之前允许的最大字符数。

## 交付行为

- 心跳默认在代理的主会话中运行（`agent:<id>:<mainKey>`），
  或者当 `session.scope = "global"` 时为 `global`。可以通过设置 `session` 覆盖到特定渠道会话（Discord/WhatsApp 等）。
- `session` 仅影响运行上下文；交付由 `target` 和 `to` 控制。
- 要发送到特定渠道/接收者，请设置 `target` + `to`。当 `target: "last"` 时，交付将使用该会话的最后一个外部渠道。
- 如果主队列正在忙碌，心跳将被跳过并在稍后重试。
- 如果 `target` 无法解析为外部目标，运行仍会执行，但不会发送出站消息。
- 仅心跳回复的响应**不会**保持会话活跃；`updatedAt` 会被恢复，因此空闲超时行为保持正常。

## 可见性控制

默认情况下，在交付警报内容时会隐藏 `HEARTBEAT_OK` 确认信息。你可以根据渠道或账户进行调整：```yaml
channels:
  defaults:
    heartbeat:
      showOk: false      # Hide HEARTBEAT_OK (default)
      showAlerts: true   # Show alert messages (default)
      useIndicator: true # Emit indicator events (default)
  telegram:
    heartbeat:
      showOk: true       # Show OK acknowledgments on Telegram
  whatsapp:
    accounts:
      work:
        heartbeat:
          showAlerts: false # Suppress alert delivery for this account
```
优先级：按账户 → 按频道 → 频道默认 → 内置默认。

### 每个标志的作用

- `showOk`：当模型返回仅 OK 的回复时，发送 `HEARTBEAT_OK` 确认消息。
- `showAlerts`：当模型返回非 OK 的回复时，发送警报内容。
- `useIndicator`：为 UI 状态面板发出指示器事件。

如果 **全部三个** 都为 false，Clawdbot 将完全跳过心跳检测（不调用模型）。

### 按频道与按账户的示例
yaml
channels:
  defaults:
    heartbeat:
      showOk: false
      showAlerts: true
      useIndicator: true
  slack:
    heartbeat:
      showOk: true # 所有 Slack 账户
    accounts:
      ops:
        heartbeat:
          showAlerts: false # 仅对 ops 账户抑制警报
  telegram:
    heartbeat:
      showOk: true
``````
### 常见配置模式

| 目标 | 配置 |
| --- | --- |
| 默认行为（静默OK，开启警报） | *(无需配置)* |
| 完全静默（无消息，无指示器） | `channels.defaults.heartbeat: { showOk: false, showAlerts: false, useIndicator: false }` |
| 仅显示指示器（无消息） | `channels.defaults.heartbeat: { showOk: false, showAlerts: false, useIndicator: true }` |
| 仅在一个频道显示OK | `channels.telegram.heartbeat: { showOk: true }` |

## HEARTBEAT.md（可选）

如果工作区中存在 `HEARTBEAT.md` 文件，代理会根据默认提示读取它。可以把它看作你的“心跳检查清单”：简短、稳定，并且可以每30分钟安全地包含一次。

如果 `HEARTBEAT.md` 存在但内容实际上为空（只有空行和Markdown标题如 `# 标题`），Clawdbot 会跳过心跳运行以节省API调用次数。如果文件不存在，心跳仍然会运行，模型会自行决定如何处理。

保持内容简短（简短的清单或提醒）以避免提示过长。# 心跳检查清单

- 快速浏览：收件箱里有紧急的事情吗？
- 如果是白天，如果没有其他事情要处理，做一个轻量级的问候。
- 如果某个任务被阻塞了，写下*缺少什么*，下次问 Peter。### 代理可以更新 HEARTBEAT.md 吗？

可以——只要你让它这么做。

`HEARTBEAT.md` 只是代理工作区中的一个普通文件，因此你可以在正常聊天中告诉代理：
- “更新 `HEARTBEAT.md` 以添加每日日历检查。”
- “重写 `HEARTBEAT.md`，使其更简短并专注于收件箱跟进。”

如果你想让这个操作主动执行，也可以在你的心跳提示中包含一条明确的指令，例如：“如果检查表过时了，用更好的版本更新 HEARTBEAT.md。”

安全提示：不要在 `HEARTBEAT.md` 中放入敏感信息（如 API 密钥、电话号码、私有令牌）——它会成为提示上下文的一部分。```bash
clawdbot system event --text "Check for urgent follow-ups" --mode now
```
如果多个代理配置了 `heartbeat`，手动唤醒将立即运行每个代理的心跳。

使用 `--mode next-heartbeat` 可以等待下一个计划的心跳周期。

## 理性推理（可选）

默认情况下，心跳仅传递最终的“答案”负载。

如果你想获得透明度，可以启用：
- `agents.defaults.heartbeat.includeReasoning: true`

启用后，心跳还将传递一个以 `Reasoning:` 为前缀的单独消息（格式与 `/reasoning on` 相同）。这在代理管理多个会话/代码库时很有用，你可以看到它为什么决定向你发送心跳——但这也可能泄露你不想暴露的内部信息。在群组聊天中建议保持关闭。

## 成本意识

心跳会执行完整的代理流程。较短的间隔会消耗更多令牌。请保持 `HEARTBEAT.md` 的内容简短，并在你只需要内部状态更新时，考虑使用更便宜的 `model` 或设置 `target: "none"`。