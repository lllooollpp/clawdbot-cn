---
summary: "Monitor OAuth expiry for model providers"
read_when:
  - Setting up auth expiry monitoring or alerts
  - Automating Claude Code / Codex OAuth refresh checks
---

# 认证监控

Clawdbot 通过 `clawdbot models status` 暴露 OAuth 过期的健康状态。可用于自动化和警报；脚本是可选的额外功能，用于电话工作流。

## 推荐：CLI 检查（可移植）
bash
clawdbot models status --check``````
退出代码：
- `0`: 正常
- `1`: 凭据已过期或缺失
- `2`: 即将过期（24小时内）

此功能可在 cron/systemd 中运行，无需额外脚本。

## 可选脚本（用于操作 / 手机工作流）

这些脚本位于 `scripts/` 目录下，是**可选的**。它们假设可以访问网关主机的 SSH，并针对 systemd + Termux 进行了优化。

- `scripts/claude-auth-status.sh` 现在使用 `clawdbot models status --json` 作为权威来源（如果 CLI 不可用，则回退到直接读取文件），因此请确保 `clawdbot` 在 `PATH` 中，以便定时器使用。
- `scripts/auth-monitor.sh`: cron/systemd 定时任务目标；用于发送警报（ntfy 或手机）。
- `scripts/systemd/clawdbot-auth-monitor.{service,timer}`: systemd 用户定时任务。
- `scripts/claude-auth-status.sh`: Claude Code + Clawdbot 认证检查器（完整/JSON/简洁模式）。
- `scripts/mobile-reauth.sh`: 通过 SSH 引导重新认证流程。
- `scripts/termux-quick-auth.sh`: 一键小部件状态 + 打开认证链接。
- `scripts/termux-auth-widget.sh`: 完整的引导小部件流程。
- `scripts/termux-sync-widget.sh`: 同步 Claude Code 凭据到 Clawdbot。

如果你不需要手机自动化或 systemd 定时器，请跳过这些脚本。