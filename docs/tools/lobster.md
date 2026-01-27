---
title: Lobster
summary: "Typed workflow runtime for Clawdbot with resumable approval gates."
description: Typed workflow runtime for Clawdbot — composable pipelines with approval gates.
read_when:
  - You want deterministic multi-step workflows with explicit approvals
  - You need to resume a workflow without re-running earlier steps
---

# 龙虾（Lobster）

龙虾是一个工作流外壳，它允许 Clawdbot 以单一、确定性操作的方式运行多步骤工具序列，并包含显式的批准检查点。

## 钩子（Hook）

你的助手可以构建自我管理的工具。请求一个工作流，30 分钟后你将获得一个 CLI 工具以及作为一次调用运行的流水线。龙虾是缺失的环节：确定性的流水线、显式的批准和可恢复的状态。

## 为什么选择龙虾？

如今，复杂的流水线需要多次来回调用工具。每次调用都会消耗 tokens，而且 LLM 必须协调每一步。龙虾将这种协调移入一个类型化的运行时中：

- **一次调用代替多次调用**：Clawdbot 运行一次龙虾工具调用并获得结构化的结果。
- **内置批准机制**：副作用（如发送邮件、发布评论）会在获得显式批准前暂停流水线。
- **可恢复性**：暂停的流水线会返回一个恢复令牌；批准后可以继续执行，而无需重新运行所有内容。

## 为什么使用 DSL 而不是普通程序？

龙虾是故意设计得小巧的。目标不是“一种新语言”，而是一个可预测、对 AI 友好的流水线规范，具备第一类的批准和恢复令牌功能。

- **内置批准/恢复机制**：普通程序可以提示人类，但无法在不自己构建运行时的情况下“暂停并恢复”并使用持久化的令牌。
- **确定性 + 可审计性**：流水线是数据，因此易于记录、比较、重放和审查。
- **对 AI 的约束表面**：一个简化的语法 + JSON 管道减少了“创造性”的代码路径，使验证成为可能。
- **内置安全策略**：超时、输出限制、沙箱检查和允许列表由运行时强制执行，而不是每个脚本。
- **仍然可编程**：每个步骤都可以调用任何 CLI 或脚本。如果你想使用 JS/TS，可以从代码生成 `.lobster` 文件。

## 它是如何工作的？

Clawdbot 在本地启动 `lobster` CLI 的 **工具模式**，并从 stdout 解析一个 JSON 包装器。
如果流水线需要批准，工具会返回一个 `resumeToken`，以便之后继续执行。

## 模式：小型 CLI + JSON 管道 + 批准机制

构建小型命令，它们以 JSON 通信，然后将它们链接成一个单一的龙虾调用。（以下为示例命令名称 —— 可替换为你自己的。）
bash
inbox list --json
inbox categorize --json
inbox apply --json
``````
"```json
{
  "action": "run",
  "pipeline": "exec --json --shell 'inbox list --json' | exec --stdin json --shell 'inbox categorize --json' | exec --stdin json --shell 'inbox apply --json' | approve --preview-from-stdin --limit 5 --prompt 'Apply changes?'",
  "timeoutMs": 30000
}
```
如果流水线请求批准，请使用令牌继续：
json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
``````
AI 触发工作流；龙虾执行步骤。审批节点保持副作用显式且可审计。

示例：将输入项映射到工具调用：```bash
gog.gmail.search --query 'newer_than:1d' \
  | clawd.invoke --tool message --action send --each --item-key message --args-json '{"provider":"telegram","to":"..."}'
```
## 仅 JSON 的 LLM 步骤（llm-task）

对于需要 **结构化 LLM 步骤** 的工作流，请启用可选的 `llm-task` 插件工具，并从 Lobster 调用它。这在保持工作流确定性的同时，仍允许你使用模型进行分类/摘要/起草。

启用工具：
json
{
  "plugins": {
    "entries": {
      "llm-task": { "enabled": true }
    }
  },
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": { "allow": ["llm-task"] }
      }
    ]
  }
}
``````
在管道中使用它：```lobster
clawd.invoke --tool llm-task --action json --args-json '{
  "prompt": "Given the input email, return intent and draft.",
  "input": { "subject": "Hello", "body": "Can you help?" },
  "schema": {
    "type": "object",
    "properties": {
      "intent": { "type": "string" },
      "draft": { "type": "string" }
    },
    "required": ["intent", "draft"],
    "additionalProperties": false
  }
}'
```
有关详细信息和配置选项，请参见 [LLM Task](/tools/llm-task)。

## 工作流文件 (.lobster)

Lobster 可以运行包含 `name`、`args`、`steps`、`env`、`condition` 和 `approval` 字段的 YAML/JSON 工作流文件。在 Clawdbot 工具调用中，将 `pipeline` 设置为文件路径。
yaml
name: inbox-triage
args:
  tag:
    default: "family"
steps:
  - id: collect
    command: inbox list --json
  - id: categorize
    command: inbox categorize --json
    stdin: $collect.stdout
  - id: approve
    command: inbox apply --approve
    stdin: $categorize.stdout
    approval: required
  - id: execute
    command: inbox apply --execute
    stdin: $categorize.stdout
    condition: $approve.approved
``````
注意事项：

- `stdin: $step.stdout` 和 `stdin: $step.json` 用于传递上一步骤的输出。
- `condition`（或 `when`）可以基于 `$step.approved` 来控制步骤的执行。

## 安装 Lobster

在运行 Clawdbot Gateway 的 **同一台主机** 上安装 Lobster CLI（参见 [Lobster 仓库](https://github.com/clawdbot/lobster)），并确保 `lobster` 在 `PATH` 环境变量中。
如果你希望使用自定义的二进制文件路径，请在工具调用中传递一个 **绝对路径** 的 `lobsterPath`。

## 启用工具

Lobster 是一个 **可选** 的插件工具（默认未启用）。请为每个代理单独启用它。```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": {
          "allow": ["lobster"]
        }
      }
    ]
  }
}
```
你也可以使用 `tools.allow` 全局启用它，这样每个代理都可以看到。

注意：允许列表是可选插件的可选功能。如果你的允许列表只列出了插件工具（比如 `lobster`），那么 Clawdbot 会保持核心工具的启用状态。如果要限制核心工具，请在允许列表中也包含你想要限制的核心工具或工具组。

## 示例：电子邮件分类

不使用 Lobster：

User: "Check my email and draft replies"
→ clawd 调用 gmail.list
→ LLM 进行总结
→ User: "draft replies to #2 and #5"
→ LLM 进行草稿撰写
→ User: "send #2"
→ clawd 调用 gmail.send
(每天重复，不会记住之前处理过的内容)
``````
使用龙虾：```json
{
  "action": "run",
  "pipeline": "email.triage --limit 20",
  "timeoutMs": 30000
}
```
{
  "ok": true,
  "status": "待审批",
  "output": [{ "summary": "5 需要回复，2 需要操作" }],
  "requiresApproval": {
    "type": "审批请求",
    "prompt": "发送 2 份草稿回复吗？",
    "items": [],
    "resumeToken": "..."
  }
}```
用户批准 → 恢复：```json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
```
一个工作流。确定性。安全。

## 工具参数

### `run`

以工具模式运行一个管道。
json
{
  "action": "run",
  "pipeline": "gog.gmail.search --query 'newer_than:1d' | email.triage",
  "cwd": "/path/to/workspace",
  "timeoutMs": 30000,
  "maxStdoutBytes": 512000
}
``````
使用参数运行工作流文件：```json
{
  "action": "run",
  "pipeline": "/path/to/inbox-triage.lobster",
  "argsJson": "{\"tag\":\"family\"}"
}
```
### `resume`

在获得批准后继续暂停的工作流。
json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
``````
### 可选输入

- `lobsterPath`: Lobster 二进制文件的绝对路径（省略以使用 `PATH`）。
- `cwd`: 流水线的工作目录（默认为当前进程的工作目录）。
- `timeoutMs`: 如果子进程超过此持续时间则终止（默认：20000）。
- `maxStdoutBytes`: 如果 stdout 超过此大小则终止子进程（默认：512000）。
- `argsJson`: 传递给 `lobster run --args-json` 的 JSON 字符串（仅限工作流文件）。

## 输出封装

Lobster 返回一个 JSON 封装，包含三种状态之一：

- `ok` → 成功完成
- `needs_approval` → 暂停；需要 `requiresApproval.resumeToken` 来恢复
- `cancelled` → 明确拒绝或取消

该工具在 `content`（格式化 JSON）和 `details`（原始对象）中展示封装内容。

## 审批

如果存在 `requiresApproval`，请检查提示并决定：

- `approve: true` → 恢复并继续执行副作用
- `approve: false` → 取消并完成工作流

使用 `approve --preview-from-stdin --limit N` 可以在审批请求中附加 JSON 预览，而无需自定义 `jq` 或 `heredoc` 逻辑。恢复令牌现在更紧凑：Lobster 在其状态目录下存储工作流恢复状态，并返回一个小的令牌键。

## OpenProse

OpenProse 与 Lobster 配合良好：使用 `/prose` 协调多代理预处理，然后运行 Lobster 流水线进行确定性审批。如果 Prose 程序需要 Lobster，请通过 `tools.subagents.tools` 允许子代理使用 `lobster` 工具。参见 [OpenProse](/prose)。

## 安全性

- **仅本地子进程** — 插件本身不进行网络调用。
- **不处理敏感信息** — Lobster 不管理 OAuth；它调用的 clawd 工具负责管理。
- **沙箱感知** — 当工具上下文处于沙箱中时禁用。
- **强化安全** — 如果指定了 `lobsterPath`，则必须为绝对路径；强制实施超时和输出限制。

## 排查问题

- **`lobster 子进程超时`** → 增加 `timeoutMs`，或拆分长流水线。
- **`lobster 输出超过 maxStdoutBytes`** → 提高 `maxStdoutBytes` 或减少输出大小。
- **`lobster 返回无效 JSON`** → 确保流水线在工具模式下运行，并且只输出 JSON。
- **`lobster 失败（代码 …）`** → 在终端中运行相同的流水线以检查 stderr。

## 了解更多

- [插件](/plugin)
- [插件工具开发](/plugins/agent-tools)

## 案例研究：社区工作流

一个公开示例：一个“第二大脑” CLI + Lobster 流水线，用于管理三个 Markdown 仓库（个人、合作伙伴、共享）。CLI 输出 JSON 格式的统计信息、收件箱列表和过时扫描；Lobster 将这些命令串联成带有审批节点的工作流，如 `weekly-review`、`inbox-triage`、`memory-consolidation` 和 `shared-task-sync`。

当 AI 可用时，它负责判断（分类）；当不可用时，则回退到确定性规则。

- 线程：https://x.com/plattenschieber/status/2014508656335770033
- 仓库：https://github.com/bloomedai/brain-cli