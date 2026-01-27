---
summary: "Guidance for choosing between heartbeat and cron jobs for automation"
read_when:
  - Deciding how to schedule recurring tasks
  - Setting up background monitoring or notifications
  - Optimizing token usage for periodic checks
---

# Cron 与 Heartbeat：何时使用各自机制

Cron 任务和 Heartbeat 都可以让您按计划运行任务。本指南帮助您根据使用场景选择合适的机制。

## 快速决策指南

| 使用场景 | 推荐方式 | 原因 |
|----------|-------------|-----|
| 每 30 分钟检查一次收件箱 | Heartbeat | 可与其他检查任务合并，具有上下文感知能力 |
| 每天早上 9 点准时发送日报 | Cron（独立） | 需要精确的时间点 |
| 监控日历上的即将发生的事件 | Heartbeat | 适合周期性感知的自然场景 |
| 每周运行一次深度分析 | Cron（独立） | 独立任务，可以使用不同的模型 |
| 20 分钟后提醒我 | Cron（主任务，`--at`） | 一次性任务，需要精确的时间 |
| 后台项目健康检查 | Heartbeat | 可以依托现有的周期运行 |

## Heartbeat：周期性感知

Heartbeat 在 **主会话** 中以固定时间间隔（默认：30 分钟）运行。它设计用于让代理定期检查某些内容，并突出显示重要的信息。

### 何时使用 Heartbeat

- **多个周期性检查**：与其使用 5 个独立的 Cron 任务来检查收件箱、日历、天气、通知和项目状态，不如使用一个 Heartbeat 来合并所有这些检查。
- **上下文感知的决策**：代理拥有完整的主会话上下文，因此可以根据情况判断哪些任务紧急，哪些可以延后。
- **对话的连续性**：Heartbeat 任务共享同一个会话，代理可以记住最近的对话，并自然地进行后续跟进。
- **低开销的监控**：一个 Heartbeat 任务可以替代多个小型轮询任务。

### Heartbeat 的优势

- **批量执行多项检查**：一个代理运行可以同时检查收件箱、日历和通知。
- **减少 API 调用次数**：一个 Heartbeat 任务比 5 个独立的 Cron 任务更经济。
- **上下文感知**：代理知道您最近在做什么，并可以据此进行优先级排序。
- **智能抑制**：如果没有需要关注的内容，代理会回复 `HEARTBEAT_OK`，不会发送任何消息。
- **自然的时间安排**：根据队列负载略有浮动，对于大多数监控任务来说是完全可以接受的。

### Heartbeat 示例：HEARTBEAT.md 检查清单

- 检查电子邮件是否有紧急信息
- 查看日历中接下来 2 小时的活动
- 如果后台任务已完成，总结结果
- 如果空闲超过 8 小时，发送简短的报到

代理在每次心跳时读取此内容，并在一次循环中处理所有项目。

### 配置心跳
json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",        // 时间间隔
        target: "last",      // 用于发送警报的位置
        activeHours: { start: "08:00", end: "22:00" }  // 可选
      }
    }
  }
}
`````````
有关完整配置，请参见 [Heartbeat](/gateway/heartbeat)。

## Cron：精确调度

Cron 任务在 **精确的时间点** 运行，并且可以在隔离的会话中执行，而不会影响主上下文。

### 何时使用 Cron

- **需要精确时间**：例如“每周一早上9点发送”（而不是“大约9点的时候”）。
- **独立任务**：不需要对话上下文的任务。
- **不同的模型/思考方式**：需要更强大模型进行深度分析的任务。
- **一次性提醒**：例如“20分钟后提醒我”，使用 `--at` 参数。
- **噪声/频繁任务**：可能会干扰主会话历史的任务。
- **外部触发**：任务应独立于代理是否活跃而运行。

### Cron 的优势

- **精确时间控制**：支持带有时区的 5 字段 Cron 表达式。
- **会话隔离**：在 `cron:<jobId>` 中运行，不会污染主会话历史。
- **模型覆盖**：每个任务可以使用更便宜或更强大的模型。
- **交付控制**：可以直接发送到某个频道；默认仍会向主频道发送摘要（可配置）。
- **无需代理上下文**：即使主会话处于空闲或压缩状态，也能运行。
- **支持一次性任务**：使用 `--at` 进行精确的未来时间戳设置。

### Cron 示例：每日早间简报```bash
clawdbot cron add \
  --name "Morning briefing" \
  --cron "0 7 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Generate today's briefing: weather, calendar, top emails, news summary." \
  --model opus \
  --deliver \
  --channel whatsapp \
  --to "+15551234567"
```
它在纽约时间早上7:00准时运行，使用Opus保证音质，并直接发送到WhatsApp。

### 定时任务示例：一次性提醒
bash
clawdbot cron add \
  --name "会议提醒" \
  --at "20m" \
  --session main \
  --system-event "提醒：站立会议将在10分钟后开始。" \
  --wake now \
  --delete-after-run``````
有关完整的 CLI 参考，请参见 [Cron 作业](/automation/cron-jobs)。

## 决策流程图```
Does the task need to run at an EXACT time?
  YES -> Use cron
  NO  -> Continue...

Does the task need isolation from main session?
  YES -> Use cron (isolated)
  NO  -> Continue...

Can this task be batched with other periodic checks?
  YES -> Use heartbeat (add to HEARTBEAT.md)
  NO  -> Use cron

Is this a one-shot reminder?
  YES -> Use cron with --at
  NO  -> Continue...

Does it need a different model or thinking level?
  YES -> Use cron (isolated) with --model/--thinking
  NO  -> Use heartbeat
```
## 结合两者

最高效的设置是**同时使用**两者：

1. **心跳机制（Heartbeat）** 在每30分钟的一个批次中处理常规监控（收件箱、日历、通知）。
2. **定时任务（Cron）** 处理精确的计划任务（每日报告、每周回顾）和一次性提醒。

### 示例：高效的自动化设置

**HEARTBEAT.md**（每30分钟检查一次）：# 心跳检查清单
- 检查收件箱中的紧急邮件
- 查看接下来2小时的日历安排
- 审阅任何待处理的任务
- 如果安静超过8小时，进行简短的报到

**计划任务**（精确时间）：
bash
# 每天早上7点的简报
clawdbot cron add --name "Morning brief" --cron "0 7 * * *" --session isolated --message "..." --deliver

# 每周一早上9点的项目回顾
clawdbot cron add --name "Weekly review" --cron "0 9 * * 1" --session isolated --message "..." --model opus

# 一次性提醒
clawdbot cron add --name "Call back" --at "2h" --session main --system-event "Call back the client" --wake now``````
## Lobster：具有审批的确定性工作流

Lobster 是用于 **多步骤工具管道** 的工作流运行时，这些管道需要 **确定性执行** 和 **显式审批**。
当你需要一个可以从中断处恢复的工作流，并且在某些步骤需要人工检查点时，可以使用它。

### 当 Lobster 适用时

- **多步骤自动化**：你需要一个固定的工具调用流程，而不是一次性的提示。
- **审批节点**：副作用应在你批准后才继续执行。
- **可恢复的运行**：在暂停的工作流中继续执行，而无需重新运行之前的步骤。

### 它如何与 heartbeat 和 cron 配合使用

- **Heartbeat/cron** 决定 *何时* 运行一个任务。
- **Lobster** 定义 *任务开始后执行哪些步骤*。

对于计划性工作流，使用 cron 或 heartbeat 来触发一个调用 Lobster 的 agent 轮次。
对于临时性工作流，可以直接调用 Lobster。

### 操作注意事项（来自代码）

- Lobster 以 **本地子进程** (`lobster` CLI) 的形式运行，并返回一个 **JSON 包装器**。
- 如果工具返回 `needs_approval`，你可以使用 `resumeToken` 和 `approve` 标志来恢复。
- 工具是一个 **可选插件**；你必须在 `tools.allow` 中允许 `lobster`。
- 如果你传递了 `lobsterPath`，它必须是一个 **绝对路径**。

有关完整用法和示例，请参见 [Lobster](/tools/lobster)。

## 主会话与隔离会话

Heartbeat 和 cron 都可以与主会话交互，但方式不同：

| | Heartbeat | Cron（主会话） | Cron（隔离会话） |
|---|---|---|---|
| 会话 | 主会话 | 主会话（通过系统事件） | `cron:<jobId>` |
| 历史记录 | 共享 | 共享 | 每次运行都是新的 |
| 上下文 | 完整 | 完整 | 无（从干净状态开始） |
| 模型 | 主会话模型 | 主会话模型 | 可覆盖 |
| 输出 | 如果不是 `HEARTBEAT_OK`，则会输出 | Heartbeat 提示 + 事件 | 输出到主会话 |

### 何时使用主会话 cron

当你要：
- 让提醒/事件出现在主会话上下文中
- 让 agent 在下一次 heartbeat 时处理它，并带有完整的上下文
- 不需要单独的隔离运行

使用 `--session main` 和 `--system-event`。```bash
clawdbot cron add \
  --name "Check project" \
  --every "4h" \
  --session main \
  --system-event "Time for a project health check" \
  --wake now
```
### 何时使用独立的 cron

使用 `--session isolated` 时，适用于以下情况：
- 清空之前的上下文，从零开始
- 使用不同的模型或思维设置
- 输出直接发送到频道（摘要默认仍发送到主频道）
- 历史记录不会干扰主会话
bash
clawdbot cron add \
  --name "深度分析" \
  --cron "0 6 * * 0" \
  --session isolated \
  --message "每周代码库分析..." \
  --model opus \
  --thinking high \
  --deliver``````
## 成本考量

| 机制 | 成本概况 |
|-----------|--------------|
| 心跳 (Heartbeat) | 每 N 分钟一次心跳；成本与 `HEARTBEAT.md` 的大小成正比 |
| Cron（主流程） | 将事件添加到下一个心跳中（不单独运行） |
| Cron（独立运行） | 每个任务运行一次完整代理流程；可以使用更便宜的模型 |

**提示**：
- 保持 `HEARTBEAT.md` 小型化以减少 token 开销。
- 将类似的检查任务合并到心跳中，而不是使用多个 Cron 任务。
- 如果你只需要内部处理，可以在心跳中使用 `target: "none"`。
- 对于常规任务，可以使用更便宜的模型进行独立 Cron 运行。