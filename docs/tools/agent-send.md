---
summary: "Direct `clawdbot agent` CLI runs (with optional delivery)"
read_when:
  - Adding or modifying the agent CLI entrypoint
---

# `clawdbot agent`（直接代理运行）

`clawdbot agent` 在不需要入站聊天消息的情况下运行单个代理回合。
默认情况下，它会通过 **网关** 运行；添加 `--local` 参数可以强制在当前机器上使用嵌入式运行时。

## 行为

- 必需参数：`--message <文本>`
- 会话选择：
  - `--to <目标>` 通过目标推导会话密钥（群组/频道目标保持隔离；私聊会话会合并为 `main`），**或者**
  - `--session-id <id>` 通过 ID 重用现有会话，**或者**
  - `--agent <id>` 直接针对配置的代理（使用该代理的 `main` 会话密钥）
- 运行与正常入站回复相同的嵌入式代理运行时。
- 思考/详细模式标志会保存到会话存储中。
- 输出：
  - 默认：打印回复文本（加上 `MEDIA:<url>` 行）
  - `--json`：打印结构化负载 + 元数据
- 可选：使用 `--deliver` + `--channel` 将回复发送回频道（目标格式与 `clawdbot message --target` 相匹配）。
- 使用 `--reply-channel`/`--reply-to`/`--reply-account` 覆盖发送设置，而无需更改会话。

如果网关不可达，CLI **会回退** 到嵌入式本地运行。
bash
clawdbot agent --to +15555550123 --message "status update"
clawdbot agent --agent ops --message "Summarize logs"
clawdbot agent --session-id 1234 --message "Summarize inbox" --thinking medium
clawdbot agent --to +15555550123 --message "Trace logs" --verbose on --json
clawdbot agent --to +15555550123 --message "Summon reply" --deliver
clawdbot agent --agent ops --message "Generate report" --deliver --reply-channel slack --reply-to "#reports"
``````
## 标志

- `--local`: 本地运行（需要在你的 shell 中设置模型提供者的 API 密钥）
- `--deliver`: 将回复发送到所选频道
- `--channel`: 交付频道 (`whatsapp|telegram|discord|googlechat|slack|signal|imessage`, 默认: `whatsapp`)
- `--reply-to`: 交付目标覆盖
- `--reply-channel`: 交付频道覆盖
- `--reply-account`: 交付账户 ID 覆盖
- `--thinking <off|minimal|low|medium|high|xhigh>`: 持久化思考级别（仅适用于 GPT-5.2 + Codex 模型）
- `--verbose <on|full|off>`: 持久化 verbose 级别
- `--timeout <秒数>`: 覆盖代理超时时间
- `--json`: 输出结构化的 JSON