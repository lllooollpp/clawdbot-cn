---
summary: "Usage tracking surfaces and credential requirements"
read_when:
  - You are wiring provider usage/quota surfaces
  - You need to explain usage tracking behavior or auth requirements
---

# 使用情况跟踪

## 什么是它
- 直接从其使用端点拉取提供方的使用情况/配额。
- 没有估算费用；仅显示提供方报告的使用情况。

## 显示位置
- 在聊天中的 `/status`：带有表情符号的详细状态卡，显示会话令牌 + 估算费用（仅限API密钥）。当可用时，显示当前模型提供方的使用情况。
- 在聊天中的 `/usage off|tokens|full`：每条响应的使用情况页脚（OAuth仅显示令牌）。
- 在聊天中的 `/usage cost`：从Clawdbot会话日志中聚合的本地费用汇总。
- CLI：`clawdbot status --usage` 会打印每个提供方的完整使用情况分解。
- CLI：`clawdbot channels list` 会打印相同的使用情况快照，同时显示提供方配置（使用 `--no-usage` 可跳过）。
- macOS菜单栏：“Usage”部分位于Context下（仅在可用时显示）。

## 提供方与凭证
- **Anthropic（Claude）**：OAuth令牌在认证配置文件中。
- **GitHub Copilot**：OAuth令牌在认证配置文件中。
- **Gemini CLI**：OAuth令牌在认证配置文件中。
- **Antigravity**：OAuth令牌在认证配置文件中。
- **OpenAI Codex**：OAuth令牌在认证配置文件中（当存在accountId时使用）。
- **MiniMax**：API密钥（编码计划密钥；`MINIMAX_CODE_PLAN_KEY` 或 `MINIMAX_API_KEY`）；使用5小时编码计划窗口。
- **z.ai**：通过环境变量/配置/认证存储的API密钥。

如果没有对应的OAuth/API凭证，则隐藏使用情况。