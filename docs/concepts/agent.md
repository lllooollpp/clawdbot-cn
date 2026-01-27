---
summary: "Agent runtime (embedded p-mono), workspace contract, and session bootstrap"
read_when:
  - Changing agent runtime, workspace bootstrap, or session behavior
---

# Agent Runtime 🤖

Clawdbot 运行一个基于 **p-mono** 的嵌入式代理运行时。

## 工作区（必需）

Clawdbot 使用一个单一的代理工作区目录（`agents.defaults.workspace`）作为代理的 **唯一** 工作目录（cwd）用于工具和上下文。

推荐：如果缺少 `~/.clawdbot/clawdbot.json`，请使用 `clawdbot setup` 来创建并初始化工作区文件。

完整的工作区结构 + 备份指南：[代理工作区](/concepts/agent-workspace)

如果启用了 `agents.defaults.sandbox`，非主会话可以通过 `agents.defaults.sandbox.workspaceRoot` 下的会话级工作区进行覆盖（参见 [网关配置](/gateway/configuration)）。

## 引导文件（注入）

在 `agents.defaults.workspace` 目录中，Clawdbot 期望这些可由用户编辑的文件：
- `AGENTS.md` — 操作说明 + “记忆”
- `SOUL.md` — 代理的人格、边界、语气
- `TOOLS.md` — 用户维护的工具说明（例如 `imsg`、`sag` 的约定）
- `BOOTSTRAP.md` — 一次性首次运行仪式（完成后会被删除）
- `IDENTITY.md` — 代理名称/氛围/表情符号
- `USER.md` — 用户资料 + 偏好的地址

在新会话的第一次运行时，Clawdbot 会将这些文件的内容直接注入到代理上下文中。

空白文件将被跳过。大文件会被修剪并截断，以标记的方式保留部分内容，确保提示保持简洁（完整内容请查看文件）。

如果文件缺失，Clawdbot 会注入一行“缺失文件”的标记（并且 `clawdbot setup` 会创建一个安全的默认模板）。

`BOOTSTRAP.md` 仅在 **全新工作区** 中创建（当其他引导文件不存在时）。如果你在完成仪式后删除了它，它在后续重启时不应被重新创建。

要完全禁用引导文件的创建（用于预填充的工作区），请设置：
json5
{ agent: { skipBootstrap: true } }
`````````
```md
## 内置工具

核心工具（读取/执行/编辑/写入及相关系统工具）始终可用，具体取决于工具策略。`apply_patch` 是可选的，并由 `tools.exec.applyPatch` 控制。`TOOLS.md` **不**控制哪些工具存在；它是关于 *你* 希望它们如何被使用的指南。

## 技能

Clawdbot 从三个位置加载技能（在名称冲突时，工作区的技能优先）：
- 内置（随安装一起提供）
- 管理/本地：`~/.clawdbot/skills`
- 工作区：`<workspace>/skills`

技能可以受配置/环境变量控制（参见 [网关配置](/gateway/configuration) 中的 `skills`）。

## p-mono 集成

Clawdbot 重用了 p-mono 代码库的一部分（模型/工具），但 **会话管理、发现和工具连接由 Clawdbot 自有**。

- 没有 p-coding 代理运行时。
- 不会检查 `~/.pi/agent` 或 `<workspace>/.pi` 的设置。

## 会话

会话记录以 JSONL 格式存储在以下路径：
- `~/.clawdbot/agents/<agentId>/sessions/<SessionId>.jsonl`

会话 ID 是稳定的，由 Clawdbot 选择。
旧版 Pi/Tau 会话文件夹 **不会**被读取。

## 流式传输时的引导

当队列模式为 `steer` 时，传入的消息会被注入到当前运行中。
在 **每次工具调用之后** 会检查队列；如果存在排队的消息，则跳过当前助手消息的剩余工具调用（工具结果会报错 "Skipped due to queued user message."），然后在下一次助手响应前注入排队的用户消息。

当队列模式为 `followup` 或 `collect` 时，传入的消息会被保留，直到当前轮次结束，然后以排队的内容启动一个新的代理轮次。有关模式 + 去抖/限制行为的更多信息，请参见 [队列](/concepts/queue)。

块流式传输会在块完成时立即发送；它 **默认关闭**（`agents.defaults.blockStreamingDefault: "off"`）。
可以通过 `agents.defaults.blockStreamingBreak` 调整边界（`text_end` 与 `message_end`；默认为 `text_end`）。
通过 `agents.defaults.blockStreamingChunk` 控制软块分片（默认为 800–1200 字符；优先段落分隔符，然后是换行符；最后是句子）。
使用 `agents.defaults.blockStreamingCoalesce` 合并流式分片以减少单行垃圾信息（基于空闲状态在发送前合并）。
非 Telegram 通道需要显式设置 `*.blockStreaming: true` 以启用块回复。
工具摘要的详细信息会在工具启动时发出（无去抖）；当可用时，通过代理事件控制 UI 流式输出工具结果。
更多细节：[流式传输 + 分片](/concepts/streaming)。

## 模型引用

配置中的模型引用（例如 `agents.defaults.model` 和 `agents.defaults.models`）通过分割 **第一个** `/` 进行解析。

- 配置模型时使用 `provider/model`。
- 如果模型 ID 本身包含 `/`（如 OpenRouter 风格），请包含提供者前缀（例如：`openrouter/moonshotai/kimi-k2`）。
- 如果省略提供者，Clawdbot 会将输入视为别名或 **默认提供者** 的模型（仅当模型 ID 中没有 `/` 时有效）。

## 配置（最小配置）"

至少设置以下参数：
- `agents.defaults.workspace`
- `channels.whatsapp.allowFrom`（强烈建议设置）

---

*下一步：[群组聊天](/concepts/group-messages)* 🦞