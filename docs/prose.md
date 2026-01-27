---
summary: "OpenProse: .prose workflows, slash commands, and state in Clawdbot"
read_when:
  - You want to run or write .prose workflows
  - You want to enable the OpenProse plugin
  - You need to understand state storage
---

# OpenProse

OpenProse 是一种便携式的、以 Markdown 为先的工作流格式，用于协调 AI 会话。在 Clawdbot 中，它作为插件提供，安装一个 OpenProse 技能包以及一个 `/prose` 斜杠命令。程序存储在 `.prose` 文件中，并可以显式控制流生成多个子代理。

官方网站：https://www.prose.md

## 它可以做什么

- 带有显式并行性的多代理研究与综合。
- 可重复的、安全批准的工作流（代码审查、事件分类、内容流程）。
- 可重用的 `.prose` 程序，您可以在支持的代理运行时中运行它们。

## 安装与启用

捆绑的插件默认是禁用的。请启用 OpenProse：```bash
clawdbot plugins enable open-prose
```
在启用插件后重启网关。

Dev/local 检出：`clawdbot plugins install ./extensions/open-prose`

相关文档：[插件](/plugin)，[插件清单](/plugins/manifest)，[技能](/tools/skills)。

## 斜杠命令

OpenProse 注册了 `/prose` 作为用户可调用的技能命令。它会将请求路由到 OpenProse 虚拟机指令，并在内部使用 Clawdbot 工具。```
/prose help
/prose run <file.prose>
/prose run <handle/slug>
/prose run <https://example.com/file.prose>
/prose compile <file.prose>
/prose examples
/prose update
```
## 示例：一个简单的 `.prose` 文件```prose
# Research + synthesis with two agents running in parallel.

input topic: "What should we research?"

agent researcher:
  model: sonnet
  prompt: "You research thoroughly and cite sources."

agent writer:
  model: opus
  prompt: "You write a concise summary."

parallel:
  findings = session: researcher
    prompt: "Research {topic}."
  draft = session: writer
    prompt: "Summarize {topic}."

session "Merge the findings + draft into a final answer."
context: { findings, draft }
```
## 文件位置

OpenProse 在您的工作区下的 `.prose/` 目录中保存状态：```
.prose/
├── .env
├── runs/
│   └── {YYYYMMDD}-{HHMMSS}-{random}/
│       ├── program.prose
│       ├── state.md
│       ├── bindings/
│       └── agents/
└── agents/
```
用户级持久化代理位于：```
~/.prose/agents/
```
## 状态模式

OpenProse 支持多种状态后端：

- **filesystem**（默认）：`.prose/runs/...`
- **in-context**：临时状态，适用于小型程序
- **sqlite**（实验性）：需要 `sqlite3` 二进制文件
- **postgres**（实验性）：需要 `psql` 和连接字符串

注意事项：
- sqlite/postgres 是可选的，且为实验性功能。
- 使用 Postgres 时，凭据会传递到子代理日志中；请使用专用的、权限最小的数据库。

## 远程程序

`/prose run <handle/slug>` 会解析为 `https://p.prose.md/<handle>/<slug>`。
直接 URL 会按原样获取。此操作使用 `web_fetch` 工具（或 `exec` 用于 POST 请求）。

## Clawdbot 运行时映射

OpenProse 程序映射到 Clawdbot 原语：

| OpenProse 概念 | Clawdbot 工具 |
| --- | --- |
| 启动会话 / Task 工具 | `sessions_spawn` |
| 文件读写 | `read` / `write` |
| 网页获取 | `web_fetch` |

如果您的工具白名单阻止了这些工具，OpenProse 程序将无法运行。请参阅 [Skills 配置](/tools/skills-config)。

## 安全性与审批

将 `.prose` 文件视为代码。在运行前进行审查。使用 Clawdbot 工具白名单和审批门禁来控制副作用。

对于确定性、审批控制的工作流，请与 [Lobster](/tools/lobster) 进行比较。