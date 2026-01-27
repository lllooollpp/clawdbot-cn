---
summary: "CLI reference for `clawdbot cron` (schedule and run background jobs)"
read_when:
  - You want scheduled jobs and wakeups
  - You’re debugging cron execution and logs
---

# `clawdbot cron`

管理网关调度器的定时任务（cron jobs）。

相关：
- 定时任务：[定时任务](/automation/cron-jobs)

提示：运行 `clawdbot cron --help` 以查看完整的命令列表。

## 常见操作

在不更改消息的情况下更新交付设置：
bash
clawdbot cron edit <job-id> --deliver --channel telegram --to "123456789"``````
为孤立任务禁用交付：```bash
clawdbot cron edit <job-id> --no-deliver
```
