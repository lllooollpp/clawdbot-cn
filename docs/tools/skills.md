---
summary: "Skills: managed vs workspace, gating rules, and config/env wiring"
read_when:
  - Adding or modifying skills
  - Changing skill gating or load rules
---

# 技能（Clawdbot）

Clawdbot 使用 **[AgentSkills](https://agentskills.io)** 兼容的技能文件夹来教代理如何使用工具。每个技能是一个包含 `SKILL.md` 文件（带有 YAML 前置元数据和指令）的目录。Clawdbot 在加载时会加载 **内置技能** 以及可选的本地覆盖，并根据环境、配置和二进制文件的存在情况对它们进行过滤。

## 位置与优先级

技能从 **三个** 地方加载：

1) **内置技能**：随安装包一起提供（npm 包或 Clawdbot.app）
2) **管理的/本地技能**：`~/.clawdbot/skills`
3) **工作区技能**：`<workspace>/skills`

如果技能名称冲突，优先级如下：

`<workspace>/skills`（最高） → `~/.clawdbot/skills` → 内置技能（最低）

此外，你还可以通过在 `~/.clawdbot/clawdbot.json` 中配置 `skills.load.extraDirs` 来添加额外的技能文件夹（最低优先级）。

## 每个代理 vs 共享技能

在 **多代理** 设置中，每个代理都有自己的工作区。这意味着：

- **每个代理的技能** 仅存在于该代理的 `<workspace>/skills` 目录中。
- **共享技能** 存在于 `~/.clawdbot/skills`（管理的/本地）中，并对 **同一台机器上的所有代理** 可见。
- 如果你希望多个代理共享一组技能，也可以通过 `skills.load.extraDirs` 添加共享文件夹。

如果同一个技能名称存在于多个位置，通常的优先级规则仍然适用：工作区优先，然后是管理的/本地技能，最后是内置技能。

## 插件 + 技能

插件可以通过在 `clawdbot.plugin.json` 中列出 `skills` 目录（路径相对于插件根目录）来自带自己的技能。插件技能在插件启用时加载，并遵循正常的技能优先级规则。你可以通过插件的配置项 `metadata.clawdbot.requires.config` 来控制它们的启用条件。有关插件的发现和配置，请参见 [插件](/plugin)，有关这些技能所教授的工具界面，请参见 [工具](/tools)。

## ClawdHub（安装 + 同步）

ClawdHub 是 Clawdbot 的公共技能注册表。可在 https://clawdhub.com 浏览。你可以用它来发现、安装、更新和备份技能。完整指南：[ClawdHub](/tools/clawdhub)。

常见操作：

- 安装一个技能到你的工作区：
  - `clawdhub install <skill-slug>`
- 更新所有已安装的技能：
  - `clawdhub update --all`
- 同步（扫描 + 发布更新）：
  - `clawdhub sync --all`

默认情况下，`clawdhub` 会将技能安装到当前工作目录下的 `./skills` 文件夹（或回退到配置的 Clawdbot 工作区）。Clawdbot 会在下一次会话中将其识别为 `<workspace>/skills`。---
name: nano-banana-pro
description: 通过 Gemini 3 Pro Image 生成或编辑图片
---说明：
- 我们遵循 AgentSkills 规范来定义布局/意图。
- 嵌入式代理使用的解析器仅支持**单行**的 frontmatter 键。
- `metadata` 应该是一个**单行的 JSON 对象**。
- 在指令中使用 `{baseDir}` 来引用技能文件夹路径。
- 可选的 frontmatter 键：
  - `homepage` — 在 macOS Skills UI 中显示为“Website”的 URL（也支持通过 `metadata.clawdbot.homepage` 设置）。
  - `user-invocable` — `true|false`（默认值：`true`）。当为 `true` 时，该技能会作为用户可调用的斜杠命令暴露出来。
  - `disable-model-invocation` — `true|false`（默认值：`false`）。当为 `true` 时，该技能将不包含在模型提示中（但仍可通过用户调用使用）。
  - `command-dispatch` — `tool`（可选）。当设置为 `tool` 时，斜杠命令将绕过模型，直接分发到一个工具。
  - `command-tool` — 当设置 `command-dispatch: tool` 时要调用的工具名称。
  - `command-arg-mode` — `raw`（默认）。对于工具分发，将原始参数字符串传递给工具（不进行核心解析）。

    工具被调用时的参数为：
    `{ command: "<原始参数>", commandName: "<斜杠命令>", skillName: "<技能名称>" }`。

## 权限控制（加载时过滤）

Clawdbot **在加载时使用 `metadata`（单行 JSON）对技能进行过滤**。---
name: nano-banana-pro
description: 通过 Gemini 3 Pro Image 生成或编辑图像
metadata: {"clawdbot":{"requires":{"bins":["uv"],"env":["GEMINI_API_KEY"],"config":["browser.enabled"]},"primaryEnv":"GEMINI_API_KEY"}}
---`metadata.clawdbot` 下的字段：
- `always: true` — 总是包含该技能（跳过其他条件）。
- `emoji` — 可选的表情符号，用于 macOS Skills UI。
- `homepage` — 可选的 URL，在 macOS Skills UI 中显示为“网站”。
- `os` — 可选的平台列表（`darwin`、`linux`、`win32`）。如果设置，该技能仅在这些操作系统上可用。
- `requires.bins` — 列表；每个必须存在于 `PATH` 中。
- `requires.anyBins` — 列表；至少一个必须存在于 `PATH` 中。
- `requires.env` — 列表；环境变量必须存在 **或** 在配置中提供。
- `requires.config` — 必须为真值的 `clawdbot.json` 路径列表。
- `primaryEnv` — 与 `skills.entries.<name>.apiKey` 关联的环境变量名。
- `install` — 可选的安装器规范数组，用于 macOS Skills UI（`brew`/`node`/`go`/`uv`/`download`）。

关于沙箱的注意事项：
- `requires.bins` 在技能加载时会在 **主机** 上进行检查。
- 如果代理被沙箱化，则二进制文件也必须存在于 **容器内**。
  通过 `agents.defaults.sandbox.docker.setupCommand` 安装（或使用自定义镜像）。
  `setupCommand` 在容器创建后运行一次。
  包安装还需要网络出站权限、可写根文件系统以及沙箱中的根用户。
  示例：`summarize` 技能（`skills/summarize/SKILL.md`）需要在沙箱容器中安装 `summarize` CLI 才能运行。

安装器示例：---
name: gemini
description: 使用 Gemini CLI 进行编码帮助和 Google 搜索查询。
metadata: {"clawdbot":{"emoji":"♊️","requires":{"bins":["gemini"]},"install":[{"id":"brew","kind":"brew","formula":"gemini-cli","bins":["gemini"],"label":"安装 Gemini CLI（brew）"}]}}
---注意事项：
- 如果列出了多个安装器，网关会选择一个**首选**选项（当可用时使用 brew，否则使用 node）。
- 如果所有安装器都是 `download`，Clawdbot 会列出每个条目，以便你可以查看可用的构建产物。
- 安装器规格可以包含 `os: ["darwin"|"linux"|"win32"]` 来按平台过滤选项。
- Node 安装会遵循 `clawdbot.json` 中的 `skills.install.nodeManager`（默认：npm；选项：npm/pnpm/yarn/bun）。
  这仅影响**技能安装**；网关运行时仍应使用 Node（不推荐使用 Bun 安装 WhatsApp/Telegram）。
- Go 安装：如果 `go` 不存在且 `brew` 可用，网关会通过 Homebrew 安装 Go，并在可能的情况下将 `GOBIN` 设置为 Homebrew 的 `bin`。
- 下载安装：`url`（必需），`archive`（`tar.gz` | `tar.bz2` | `zip`），`extract`（当检测到归档文件时默认为自动），`stripComponents`，`targetDir`（默认：`~/.clawdbot/tools/<skillKey>`）。

如果没有 `metadata.clawdbot`，该技能始终是可安装的（除非在配置中被禁用，或因捆绑技能被 `skills.allowBundled` 阻止）。

## 配置覆盖（`~/.clawdbot/clawdbot.json`）

捆绑/管理的技能可以切换并提供环境变量值：
json5
{
  skills: {
    entries: {
      "nano-banana-pro": {
        enabled: true,
        apiKey: "GEMINI_KEY_HERE",
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE"
        },
        config: {
          endpoint: "https://example.invalid",
          model: "nano-pro"
        }
      },
      peekaboo: { enabled: true },
      sag: { enabled: false }
    }
  }
}
``````
注意：如果技能名称包含连字符，请对键进行引号（JSON5 允许使用引号的键）。

默认情况下，配置键与 **技能名称** 匹配。如果一个技能定义了 `metadata.clawdbot.skillKey`，则使用该键在 `skills.entries` 下。

规则：
- `enabled: false` 会禁用该技能，即使它已打包/安装。
- `env`：**仅在**进程中的变量未设置时才会注入。
- `apiKey`：为那些声明了 `metadata.clawdbot.primaryEnv` 的技能提供便利。
- `config`：用于自定义技能字段的可选容器；自定义键必须放在此处。
- `allowBundled`：仅对 **已打包** 的技能进行可选的白名单控制。如果设置，则只有列表中的已打包技能才有效（对 managed/workspace 技能无影响）。

## 环境注入（每个代理运行）

当代理运行启动时，Clawdbot 会执行以下步骤：
1) 读取技能元数据。
2) 将 `skills.entries.<key>.env` 或 `skills.entries.<key>.apiKey` 应用到 `process.env`。
3) 使用 **符合条件的** 技能构建系统提示。
4) 在运行结束后恢复原始环境。

这是**针对代理运行的作用域**，而不是全局的 shell 环境。

## 会话快照（性能）

Clawdbot 在**会话开始时**对符合条件的技能进行快照，并在该会话的后续轮次中重复使用该列表。对技能或配置的更改将在下一个新会话中生效。

当启用技能观察器或出现新的符合条件的远程节点时（见下文），技能也可以在会话中进行刷新。可以将其视为一种 **热重载**：下一次代理轮次会使用刷新后的列表。

## 远程 macOS 节点（Linux 网关）

如果网关在 Linux 上运行，但一个 **允许 `system.run` 的 macOS 节点** 连接进来（执行审批安全设置不为 `deny`），Clawdbot 可以在该节点上存在所需二进制文件时，将 macOS 专用技能视为符合条件。代理应通过 `nodes` 工具（通常是 `nodes.run`）执行这些技能。

这依赖于节点报告其支持的命令，并通过 `system.run` 进行二进制探测。如果 macOS 节点之后离线，技能仍然可见；调用可能会失败，直到节点重新连接。

## 技能观察器（自动刷新）

默认情况下，Clawdbot 会监视技能文件夹，并在 `SKILL.md` 文件更改时更新技能快照。可以在 `skills.load` 下进行配置：```json5
{
  skills: {
    load: {
      watch: true,
      watchDebounceMs: 250
    }
  }
}
```
## Token 影响（技能列表）

当技能符合条件时，Clawdbot 会将一个紧凑的 XML 格式的可用技能列表注入到系统提示中（通过 `pi-coding-agent` 中的 `formatSkillsForPrompt` 方法）。成本是确定性的：

- **基础开销（当技能数量 ≥ 1 时）：** 195 个字符。
- **每个技能：** 97 个字符 + `<name>`、`<description>` 和 `<location>` 值在 XML 转义后的长度。

公式（字符数）：

total = 195 + Σ (97 + len(name_escaped) + len(description_escaped) + len(location_escaped))
``````
注意事项：
- XML 转义会将 `& < > " '` 转换为实体（`&amp;`, `&lt;` 等），从而增加长度。
- 令牌数量因模型的分词器而异。一个粗略的 OpenAI 风格估算约为每令牌 4 个字符，因此每个技能大约 **97 个字符 ≈ 24 个令牌**，加上你实际字段的长度。

## 管理技能生命周期

Clawdbot 作为安装的一部分（npm 包或 Clawdbot.app）提供了一组基础技能作为 **内置技能**。`~/.clawdbot/skills` 用于本地覆盖（例如，在不修改内置副本的情况下固定/修补某个技能）。工作区技能由用户拥有，并在名称冲突时覆盖内置技能。