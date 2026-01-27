---
summary: "What the Clawdbot system prompt contains and how it is assembled"
read_when:
  - Editing system prompt text, tools list, or time/heartbeat sections
  - Changing workspace bootstrap or skills injection behavior
---

# 系统提示

Clawdbot 为每次代理运行构建自定义的系统提示。该提示是 **Clawdbot 拥有** 的，并不使用 p-coding-agent 的默认提示。

该提示由 Clawdbot 汇编并注入到每次代理运行中。

## 结构

该提示有意保持简洁，并使用固定部分：

- **工具**：当前工具列表 + 简短描述。
- **技能**（可用时）：告诉模型如何按需加载技能指令。
- **Clawdbot 自我更新**：如何运行 `config.apply` 和 `update.run`。
- **工作区**：工作目录（`agents.defaults.workspace`）。
- **文档**：本地路径到 Clawdbot 文档（仓库或 npm 包）以及何时阅读它们。
- **工作区文件（注入）**：表示下面包含启动文件。
- **沙盒**（启用时）：表示沙盒运行时，沙盒路径，以及是否可用提升权限执行。
- **当前日期与时间**：用户本地时间、时区和时间格式。
- **回复标签**：支持的提供者可选的回复标签语法。
- **心跳**：心跳提示和确认行为。
- **运行时**：主机、操作系统、Node、模型、仓库根目录（当检测到时）、思考层级（一行）。
- **推理**：当前可见性层级 + /reasoning 切换提示。

## 提示模式

Clawdbot 可以为子代理渲染更小的系统提示。运行时为每个运行设置一个 `promptMode`（不是用户可见的配置）：

- `full`（默认）：包含上述所有部分。
- `minimal`：用于子代理；省略 **技能**、**记忆回忆**、**Clawdbot 自我更新**、**模型别名**、**用户身份**、**回复标签**、**消息传递**、**静默回复** 和 **心跳**。工具、工作区、沙盒、当前日期与时间（当已知时）、运行时和注入的上下文仍然可用。
- `none`：仅返回基础身份行。

当 `promptMode=minimal` 时，额外注入的提示被标记为 **子代理上下文** 而不是 **群聊上下文**。

## 工作区启动注入

启动文件在 **项目上下文** 下被修剪并追加，这样模型可以看到身份和配置上下文，而无需显式读取：

- `AGENTS.md`
- `SOUL.md`
- `TOOLS.md`
- `IDENTITY.md`
- `USER.md`
- `HEARTBEAT.md`
- `BOOTSTRAP.md`（仅在全新工作区中）

大文件会被截断并带有标记。每文件的最大大小由 `agents.defaults.bootstrapMaxChars` 控制（默认：20000）。缺失的文件会注入一个简短的缺失文件标记。

内部钩子可以通过 `agent:bootstrap` 拦截此步骤，以修改或替换注入的启动文件（例如，用替代人格的 `SOUL.md` 替换原始文件）。

要检查每个注入文件的贡献（原始 vs 注入、截断、加上工具模式的开销），请使用 `/context list` 或 `/context detail`。详见 [上下文](/concepts/context)。

## 时间处理

当用户时区已知时，系统提示中会包含一个专门的 **当前日期与时间** 部分。为了保持提示缓存稳定，现在仅包含 **时区**（不包含动态时钟或时间格式）。

当代理需要当前时间时，请使用 `session_status`；状态卡中包含时间戳行。

配置方式如下：

- `agents.defaults.userTimezone`
- `agents.defaults.timeFormat`（`auto` | `12` | `24`）

有关完整的行为细节，请参阅 [日期与时间](/date-time)。

## 技能

当存在符合条件的技能时，Clawdbot 会注入一个简短的 **可用技能列表**（`formatSkillsForPrompt`），其中包含每个技能的 **文件路径**。提示会指示模型使用 `read` 来加载列出位置（工作区、托管或捆绑）中的 SKILL.md 文件。如果没有可用的技能，则省略技能部分。
md
<available_skills>
  <skill>
    <name>...</name>
    <description>...</description>
    <location>...</location>
  </skill>
</available_skills>``````
这在保持基础提示简短的同时，仍然能够实现针对特定技能的使用。

## 文档

当可用时，系统提示包含一个 **文档** 部分，该部分指向本地的 Clawdbot 文档目录（仓库工作区中的 `docs/` 或捆绑的 npm 包文档），同时还注明了公共镜像、源代码仓库、社区 Discord 和 ClawdHub（https://clawdhub.com）用于技能发现。提示会指示模型优先查阅本地文档以了解 Clawdbot 的行为、命令、配置或架构，并在可能的情况下自行运行 `clawdbot status`（当没有访问权限时才会询问用户）。