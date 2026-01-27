---
summary: "Context: what the model sees, how it is built, and how to inspect it"
read_when:
  - You want to understand what “context” means in Clawdbot
  - You are debugging why the model “knows” something (or forgot it)
  - You want to reduce context overhead (/context, /status, /compact)
---

# 上下文

“上下文”是 **Clawdbot 在每次运行时发送给模型的所有内容**。它受到模型的 **上下文窗口**（令牌限制）的限制。

初学者的思维模型：
- **系统提示**（Clawdbot 构建的）：规则、工具、技能列表、时间/运行时间，以及注入的工作区文件。
- **对话历史**：你在此会话中的消息 + 助手的消息。
- **工具调用/结果 + 附件**：命令输出、文件读取、图片/音频等。

上下文 **不是“记忆”**：记忆可以存储在磁盘上并稍后重新加载；上下文是模型当前窗口内的内容。

## 快速入门（检查上下文）

- `/status` → 快速查看“我的窗口还有多少空间？”以及会话设置。
- `/context list` → 显示注入的内容以及大致的大小（按文件 + 总计）。
- `/context detail` → 更详细的分析：按文件、按工具模式的大小、按技能条目的大小，以及系统提示的大小。
- `/usage tokens` → 在正常回复的末尾添加每条回复的令牌使用情况。
- `/compact` → 将较旧的对话历史浓缩为一个简洁的条目，以腾出窗口空间。

另见：[斜杠命令](/tools/slash-commands)，[令牌使用与成本](/token-use)，[压缩](/concepts/compaction)。

## 示例输出

数值因模型、提供者、工具策略和工作区内容而异。

### `/context list`
🧠 上下文分析
工作区：`<workspaceDir>`
引导最大/文件：20,000 字符
沙盒：mode=non-main sandboxed=false
系统提示（运行中）：38,412 字符（~9,603 令牌）（项目上下文 23,901 字符（~5,976 令牌））

注入的工作区文件：
- AGENTS.md：OK | 原始 1,742 字符（~436 令牌） | 注入 1,742 字符（~436 令牌）
- SOUL.md：OK | 原始 912 字符（~228 令牌） | 注入 912 字符（~228 令牌）
- TOOLS.md：TRUNCATED | 原始 54,210 字符（~13,553 令牌） | 注入 20,962 字符（~5,241 令牌）
- IDENTITY.md：OK | 原始 211 字符（~53 令牌） | 注入 211 字符（~53 令牌）
- USER.md：OK | 原始 388 字符（~97 令牌） | 注入 388 字符（~97 令牌）
- HEARTBEAT.md：MISSING | 原始 0 | 注入 0
- BOOTSTRAP.md：OK | 原始 0 字符（~0 令牌） | 注入 0 字符（~0 令牌）

技能列表（系统提示文本）：2,184 字符（~546 令牌）（12 个技能）
工具：read, edit, write, exec, process, browser, message, sessions_send, …

工具列表（系统提示文本）：1,032 字符（~258 令牌）
工具模式（JSON）：31,988 字符（~7,997 令牌）（计入上下文；不以文本形式显示）
工具：（与上述相同）

会话令牌（缓存）：14,250 总数 / ctx=32,000


### `/context detail`
🧠 Context breakdown (detailed)
…
Top skills (prompt entry size):
- frontend-design: 412 chars (~103 tok)
- oracle: 401 chars (~101 tok)
… (+10 more skills)

Top tools (schema size):
- browser: 9,812 chars (~2,453 tok)
- exec: 6,240 chars (~1,560 tok)
… (+N more tools)
``````
## 什么是计入上下文窗口的内容

模型接收到的所有内容都会被计入，包括：
- 系统提示（所有部分）。
- 对话历史。
- 工具调用 + 工具结果。
- 附件/转录文本（图片/音频/文件）。
- 压缩摘要和修剪的痕迹。
- 供应商的“包装器”或隐藏的头部（不可见，但仍被计入）。

## Clawdbot 如何构建系统提示

系统提示是 **Clawdbot 所有** 的，并在每次运行时重新构建。它包括：
- 工具列表 + 简短描述。
- 技能列表（仅元数据；详见下文）。
- 工作区位置。
- 时间（UTC + 如果配置了用户时间则转换）。
- 运行时元数据（主机/操作系统/模型/思考过程）。
- 在 **项目上下文** 下注入的工作区启动文件。

详细说明：[系统提示](/concepts/system-prompt)。

## 注入的工作区文件（项目上下文）

默认情况下，Clawdbot 会注入一组固定的工作区文件（如果存在）：
- `AGENTS.md`
- `SOUL.md`
- `TOOLS.md`
- `IDENTITY.md`
- `USER.md`
- `HEARTBEAT.md`
- `BOOTSTRAP.md`（仅首次运行）

大文件会根据 `agents.defaults.bootstrapMaxChars`（默认为 `20000` 个字符）进行逐文件截断。`/context` 会显示 **原始 vs 注入** 的大小以及是否发生了截断。

## 技能：什么是注入的 vs 按需加载的

系统提示中包含一个简化的 **技能列表**（名称 + 描述 + 位置）。这个列表会有实际的开销。

技能指令默认 **不会被包含**。模型在需要时应 **仅读取技能的 `SKILL.md`**。

## 工具：有两种成本

工具会影响上下文的两种方式：
1) **工具列表文本** 在系统提示中（你看到的“工具”部分）。
2) **工具模式**（JSON）。这些会被发送给模型，以便它调用工具。即使你无法看到这些内容，它们仍然计入上下文。

`/context detail` 会分解最大的工具模式，以便你看到哪些内容占用了主要部分。

## 命令、指令和“内联快捷方式”

斜杠命令由网关处理。有几种不同的行为：
- **独立命令**：仅包含 `/...` 的消息会作为命令运行。
- **指令**：`/think`、`/verbose`、`/reasoning`、`/elevated`、`/model`、`/queue` 等在模型看到消息前会被移除。
  - 仅包含指令的消息会保留会话设置。
  - 正常消息中的内联指令作为每条消息的提示。
- **内联快捷方式**（仅允许白名单发送者）：某些 `/...` 令牌在正常消息中可以立即执行（例如：“hey /status”），并在模型看到剩余文本前被移除。

详情：[斜杠命令](/tools/slash-commands)。

## 会话、压缩和修剪（哪些内容会保留）

跨消息保留的内容取决于所使用的机制：
- **正常历史** 会保留在会话转录中，直到根据策略被压缩或修剪。
- **压缩** 会将摘要保留在转录中，并保留最近的消息。
- **修剪** 会从 *内存中的提示* 中移除旧的工具结果，但不会重写转录内容。

文档：[会话](/concepts/session)，[压缩](/concepts/compaction)，[会话清理](/concepts/session-pruning)。

## `/context` 实际报告的内容

当有可用的 **run-built** 系统提示报告时，`/context` 会优先报告最新的：
- `System prompt (run)` = 从最后一次嵌入（工具可用）的运行中捕获并存储在会话存储中。
- `System prompt (estimate)` = 当没有运行报告存在时（或通过不生成报告的 CLI 后端运行时）实时计算的。

无论如何，它都会报告大小和主要贡献者；它**不会**转储完整的系统提示或工具模式。