---
summary: "Poll sending via gateway + CLI"
read_when:
  - Adding or modifying poll support
  - Debugging poll sends from the CLI or gateway
---

# 投票

## 支持的渠道
- WhatsApp（网页渠道）
- Discord
- MS Teams（自适应卡片）

## 命令行界面（CLI）
bash
# WhatsApp
clawdbot message poll --target +15555550123 \
  --poll-question "今天午餐吃什么？" --poll-option "是" --poll-option "否" --poll-option "可能"
clawdbot message poll --target 123456789@g.us \
  --poll-question "会议时间？" --poll-option "10点" --poll-option "2点" --poll-option "4点" --poll-multi

# Discord
clawdbot message poll --channel discord --target channel:123456789 \
  --poll-question "零食？" --poll-option "披萨" --poll-option "寿司"
clawdbot message poll --channel discord --target channel:123456789 \
  --poll-question "计划？" --poll-option "A" --poll-option "B" --poll-duration-hours 48

# MS Teams
clawdbot message poll --channel msteams --target conversation:19:abc@thread.tacv2 \
  --poll-question "午餐？" --poll-option "披萨" --poll-option "寿司"``````
选项：
- `--channel`: `whatsapp`（默认）、`discord` 或 `msteams`
- `--poll-multi`: 允许选择多个选项
- `--poll-duration-hours`: 仅适用于 Discord（当未指定时默认为 24 小时）

## 网关 RPC

方法：`poll`

参数：
- `to`（字符串，必填）
- `question`（字符串，必填）
- `options`（字符串数组，必填）
- `maxSelections`（数字，可选）
- `durationHours`（数字，可选）
- `channel`（字符串，可选，默认值为 `whatsapp`）
- `idempotencyKey`（字符串，必填）

## 渠道差异
- WhatsApp：支持 2-12 个选项，`maxSelections` 必须在选项数量范围内，忽略 `durationHours`。
- Discord：支持 2-10 个选项，`durationHours` 会被限制在 1-768 小时之间（默认 24 小时）。`maxSelections > 1` 会启用多选模式；Discord 不支持“恰好选择 N 个”的模式。
- MS Teams：使用 Adaptive Card 的投票（由 Clawdbot 管理）。不支持原生投票 API；`durationHours` 会被忽略。

## 代理工具（Message）
使用 `message` 工具并指定 `poll` 动作（`to`、`pollQuestion`、`pollOption`，可选 `pollMulti`、`pollDurationHours`、`channel`）。

注意：Discord 没有“恰好选择 N 个”的模式；`pollMulti` 映射为多选。
Teams 的投票会以 Adaptive Card 的形式展示，并且需要网关保持在线以在 `~/.clawdbot/msteams-polls.json` 中记录投票结果。