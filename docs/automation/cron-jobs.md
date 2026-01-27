---
summary: "Cron jobs + wakeups for the Gateway scheduler"
read_when:
  - Scheduling background jobs or wakeups
  - Wiring automation that should run with or alongside heartbeats
  - Deciding between heartbeat and cron for scheduled tasks
---

# 定时任务（网关调度器）

> **Cron 与 Heartbeat 的区别？** 有关何时使用每种机制的指导，请参阅 [Cron 与 Heartbeat](/automation/cron-vs-heartbeat)。

Cron 是网关内置的调度器。它可以持久化任务，在正确的时间唤醒代理，并且可以可选地将输出返回到聊天中。

如果你想实现 *“每天早上运行一次”* 或者 *“20 分钟后唤醒代理”*，那么 cron 是你所需要的机制。

## 快速入门
- Cron 在 **网关内部** 运行（不是在模型内部）。
- 任务会持久化存储在 `~/.clawdbot/cron/` 下，因此重启不会丢失计划。
- 有两种执行方式：
  - **主会话**：将系统事件加入队列，然后在下一个心跳时运行。
  - **独立会话**：在 `cron:<jobId>` 中运行一个专用的代理回合，可选地发送输出。
- 唤醒是第一类操作：任务可以请求“立即唤醒”或“下次心跳时唤醒”。

## 面向初学者的概述
可以将 cron 任务理解为：**何时运行** + **要做什么**。

1) **选择一个计划**
   - 一次性提醒 → `schedule.kind = "at"`（CLI：`--at`）
   - 重复任务 → `schedule.kind = "every"` 或 `schedule.kind = "cron"`
   - 如果你的 ISO 时间戳没有指定时区，则会被视为 **UTC**。

2) **选择任务运行的位置**
   - `sessionTarget: "main"` → 在下一个心跳期间使用主会话上下文运行。
   - `sessionTarget: "isolated"` → 在 `cron:<jobId>` 中运行一个专用的代理回合。

3) **选择负载内容**
   - 主会话 → `payload.kind = "systemEvent"`
   - 独立会话 → `payload.kind = "agentTurn"`

可选：`deleteAfterRun: true` 会在一次性任务成功运行后将其从存储中删除。

## 概念

### 任务
一个 cron 任务是一个存储的记录，包含以下内容：
- 一个 **计划**（何时运行）
- 一个 **负载**（要做什么）
- 可选的 **交付设置**（输出应该发送到哪里）
- 可选的 **代理绑定**（`agentId`）：在特定代理下运行任务；如果未指定或未知，网关将回退到默认代理。

任务由一个稳定的 `jobId`（CLI/网关 API 使用）来标识。
在代理工具调用中，`jobId` 是标准的；为了兼容性，也接受旧版的 `id`。
任务可以可选地在成功运行一次性任务后自动删除，通过设置 `deleteAfterRun: true`。

#### 独立任务（专用的 cron 会话）
独立任务会在会话 `cron:<jobId>` 中运行一个专用的代理回合。

关键行为：
- 为了可追溯性，提示前会加上 `[cron:<jobId> <任务名称>]`。
- 每次运行都会启动一个**新的会话 ID**（不会保留之前的对话内容）。
- 会将摘要发布到主会话（前缀为 `Cron`，可配置）。
- `wakeMode: "now"` 会在发布摘要后立即触发一次心跳。
- 如果 `payload.deliver: true`，则输出会发送到指定的频道；否则输出仅保留在内部。

使用独立任务来执行那些嘈杂、频繁或“后台任务”，以免污染你的主聊天记录。

### Payload 结构（执行内容）
支持两种 payload 类型：
- `systemEvent`：仅限主会话，通过心跳提示进行路由。
- `agentTurn`：仅限独立会话，运行一个专用的代理回合。

`agentTurn` 的通用字段：
- `message`：必需的文本提示。
- `model` / `thinking`：可选覆盖（见下文）。
- `timeoutSeconds`：可选的超时覆盖。
- `deliver`：`true` 表示将输出发送到频道目标。
- `channel`：`last` 或特定频道。
- `to`：频道特定的目标（电话/聊天/频道 ID）。
- `bestEffortDeliver`：即使发送失败也避免任务失败。

隔离选项（仅适用于 `session=isolated`）：
- `postToMainPrefix`（CLI：`--post-prefix`）：主会话中的系统事件前缀。
- `postToMainMode`：`summary`（默认）或 `full`。
- `postToMainMaxChars`：当 `postToMainMode=full` 时的最大字符数（默认 8000）。

### 模型和思考层级覆盖
独立任务（`agentTurn`）可以覆盖模型和思考层级：
- `model`：提供者/模型字符串（例如 `anthropic/claude-sonnet-4-20250514`）或别名（例如 `opus`）
- `thinking`：思考层级（`off`、`minimal`、`low`、`medium`、`high`、`xhigh`；仅限 GPT-5.2 和 Codex 模型）

注意：你也可以在主会话任务中设置 `model`，但这会改变共享主会话的模型。我们建议仅在独立任务中使用模型覆盖，以避免意外的上下文切换。

优先级顺序：
1. 任务 payload 覆盖（最高优先级）
2. 钩子特定的默认值（例如 `hooks.gmail.model`）
3. 代理配置默认值

### 交付（频道 + 目标）
独立任务可以将输出交付到指定频道。任务 payload 可以指定：
- `channel`：`whatsapp` / `telegram` / `discord` / `slack` / `mattermost`（插件）/ `signal` / `imessage` / `last`
- `to`：频道特定的接收目标

如果 `channel` 或 `to` 被省略，cron 可以回退到主会话的“最后路由”（即代理最后一次回复的地方）。

交付说明：
- 如果设置了 `to`，即使 `deliver` 被省略，cron 也会自动将代理的最终输出发送出去。
- 当你希望使用最后路由发送输出但没有显式设置 `to` 时，使用 `deliver: true`。
- 使用 `deliver: false` 可以即使设置了 `to` 也保持输出在内部。

目标格式提醒：
- Slack/Discord/Mattermost（插件）目标应使用显式的前缀（例如 `channel:<id>`、`user:<id>`）以避免歧义。
- Telegram 的话题应使用 `:topic:` 的形式（见下文）。

#### Telegram 送达目标（话题 / 论坛线程）
Telegram 通过 `message_thread_id` 支持论坛话题。对于定时任务的送达，你可以将话题/线程编码到 `to` 字段中：例如 `telegram:123456789:topic:987654321`。

- `-1001234567890`（仅聊天 ID）
- `-1001234567890:topic:123`（推荐：显式话题标记）
- `-1001234567890:123`（简写：数字后缀）

也接受带有前缀的目标，如 `telegram:...` / `telegram:group:...`：
- `telegram:group:-1001234567890:topic:123`

## 存储与历史记录
- 任务存储：`~/.clawdbot/cron/jobs.json`（由网关管理的 JSON 文件）。
- 运行历史：`~/.clawdbot/cron/runs/<jobId>.jsonl`（JSONL 格式，自动清理）。
- 覆盖存储路径：在配置中设置 `cron.store`。
json5
{
  cron: {
    enabled: true, // 默认为 true
    store: "~/.clawdbot/cron/jobs.json",
    maxConcurrentRuns: 1 // 默认为 1
  }
}
`````````
禁用所有 cron：
- `cron.enabled: false`（配置）
- `CLAWDBOT_SKIP_CRON=1`（环境变量）

## CLI 快速入门

一次性提醒（UTC ISO 时间，成功后自动删除）：```bash
clawdbot cron add \
  --name "Send reminder" \
  --at "2026-01-12T18:00:00Z" \
  --session main \
  --system-event "Reminder: submit expense report." \
  --wake now \
  --delete-after-run
```
单次提醒（主会话，立即唤醒）：
bash
clawdbot cron add \
  --name "日历检查" \
  --at "20m" \
  --session main \
  --system-event "下一个心跳：检查日历。" \
  --wake now``````
定期单独任务（发送至 WhatsApp）：```bash
clawdbot cron add \
  --name "Morning status" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Summarize inbox + calendar for today." \
  --deliver \
  --channel whatsapp \
  --to "+15551234567"
```
定期独立任务（发送到 Telegram 话题）：
bash
clawdbot cron add \
  --name "夜间摘要（话题）" \
  --cron "0 22 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "总结今天的内容；发送到夜间话题。" \
  --deliver \
  --channel telegram \
  --to "-1001234567890:topic:123"``````
独立任务，带有模型和思维覆盖：```bash
clawdbot cron add \
  --name "Deep analysis" \
  --cron "0 6 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Weekly deep analysis of project progress." \
  --model "opus" \
  --thinking high \
  --deliver \
  --channel whatsapp \
  --to "+15551234567"

Agent selection (multi-agent setups):
```bash
# 将任务固定到代理 "ops"（如果该代理缺失，则回退到默认代理）
clawdbot cron add --name "Ops 清扫" --cron "0 6 * * *" --session isolated --message "检查 ops 队列" --agent ops

# 修改或清除现有任务的代理
clawdbot cron edit <jobId> --agent ops
clawdbot cron edit <jobId> --clear-agent

手动运行（调试）：
bash
clawdbot cron run <jobId> --force
``````
编辑现有任务（部分字段）：
bash
clawdbot cron edit <jobId> \
  --message "更新后的提示" \
  --model "opus" \
  --thinking low
``````
运行历史：
bash
clawdbot cron runs --id <jobId> --limit 50
``````
无需创建任务的即时系统事件：
bash
clawdbot system event --mode now --text "Next heartbeat: check battery."
``````
## 网关 API 接口
- `cron.list`, `cron.status`, `cron.add`, `cron.update`, `cron.remove`
- `cron.run`（强制执行或到期执行），`cron.runs`

对于没有任务的即时系统事件，请使用 [`clawdbot 系统事件`](/cli/system)。

## 故障排除

### “没有任务运行”
- 检查 cron 是否已启用：`cron.enabled` 和 `CLAWDBOT_SKIP_CRON`。
- 检查网关是否持续运行（cron 在网关进程中运行）。
- 对于 `cron` 的调度：确认时区（`--tz`）与主机时区是否一致。

### Telegram 将消息发送到错误的位置
- 对于论坛主题，请使用 `-100…:topic:<id>` 以确保明确且无歧义。
- 如果在日志或存储的“最后路由”目标中看到 `telegram:...` 前缀，这是正常现象；
  cron 传输会接受这些前缀，并且仍然可以正确解析主题 ID。