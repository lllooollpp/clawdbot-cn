---
summary: "CLI reference for `clawdbot cron` (schedule and run background jobs)"
read_when:
  - You want scheduled jobs and wakeups
  - You’re debugging cron execution and logs
---

# `clawdbot cron`

为网关调度器管理定时任务（cron jobs）。

相关：
- 定时任务：[定时任务](/automation/cron-jobs)

提示：运行 `clawdbot cron --help` 以查看完整的命令功能。
``````bash
clawdbot cron edit <job-id> --deliver --channel telegram --to "123456789"
```
<think>

</think>

```md
禁用独立任务的交付：
``````bash
clawdbot cron edit <job-id> --no-deliver
```
