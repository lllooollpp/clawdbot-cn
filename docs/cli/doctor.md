---
summary: "CLI reference for `clawdbot doctor` (health checks + guided repairs)"
read_when:
  - You have connectivity/auth issues and want guided fixes
  - You updated and want a sanity check
---

# `clawdbot doctor`

网关和频道的健康检查 + 快速修复。

相关：
- 故障排除：[故障排除](/gateway/troubleshooting)
- 安全审计：[安全](/gateway/security)

## 示例
bash
clawdbot doctor
clawdbot doctor --repair
clawdbot doctor --deep``````
注意事项：
- 交互式提示（如 keychain/OAuth 修复）仅在 stdin 是 TTY 且未设置 `--non-interactive` 时运行。无头运行（如 cron、Telegram、无终端环境）将跳过提示。
- `--fix`（或 `--repair` 的别名）会将备份写入 `~/.clawdbot/clawdbot.json.bak`，并删除未知的配置键，列出每个被删除的键。```bash
launchctl getenv CLAWDBOT_GATEWAY_TOKEN
launchctl getenv CLAWDBOT_GATEWAY_PASSWORD

launchctl unsetenv CLAWDBOT_GATEWAY_TOKEN
launchctl unsetenv CLAWDBOT_GATEWAY_PASSWORD
```
