---
summary: "Models CLI: list, set, aliases, fallbacks, scan, status"
read_when:
  - Adding or modifying models CLI (models list/set/scan/aliases/fallbacks)
  - Changing model fallback behavior or selection UX
  - Updating model scan probes (tools/images)
---

# 模型 CLI

有关认证配置文件轮换、冷却时间和回退机制的交互方式，请参阅 [/concepts/model-failover](/concepts/model-failover)。

快速提供者概览 + 示例：[/concepts/model-providers](/concepts/model-providers)。

## 模型选择机制

Clawdbot 按以下顺序选择模型：

1) **主模型** (`agents.defaults.model.primary` 或 `agents.defaults.model`)。
2) **回退模型**，按 `agents.defaults.model.fallbacks` 中的顺序依次尝试。
3) **提供者认证回退** 会在切换到下一个模型之前在提供者内部发生。

相关说明：
- `agents.defaults.models` 是 Clawdbot 可以使用的允许列表/模型目录（包括别名）。
- `agents.defaults.imageModel` 仅在主模型无法处理图像时使用。
- 每个代理的默认设置可以通过 `agents.list[].model` 加上绑定来覆盖（参见 [/concepts/multi-agent](/concepts/multi-agent)）。

## 快速模型选择（经验之谈）

- **GLM**：在编码/工具调用方面表现略优。
- **MiniMax**：在写作和整体风格方面表现更好。
bash
clawdbot onboard``````
它可以为常见的提供者设置模型 + 认证，包括 **OpenAI Code (Codex) 订阅**（OAuth）和 **Anthropic**（推荐使用 API 密钥；也支持 `claude setup-token`）。

## 配置键（概览）

- `agents.defaults.model.primary` 和 `agents.defaults.model.fallbacks`
- `agents.defaults.imageModel.primary` 和 `agents.defaults.imageModel.fallbacks`
- `agents.defaults.models`（允许列表 + 别名 + 提供者参数）
- `models.providers`（自定义提供者写入到 `models.json` 中）

模型引用会被标准化为小写。像 `z.ai/*` 这样的提供者别名会被标准化为 `zai/*`。

提供者配置示例（包括 OpenCode Zen）位于 [/gateway/configuration](/gateway/configuration#opencode-zen-multi-model-proxy)。```
Model "provider/model" is not allowed. Use /model to list available models.
```
这发生在正常回复生成**之前**，因此消息可能会感觉“没有回应”。解决方法是：

- 将模型添加到 `agents.defaults.models` 中，或者  
- 清除允许列表（移除 `agents.defaults.models`），或者  
- 从 `/model list` 中选择一个模型。

允许列表配置示例：
json5
{
  agent: {
    model: { primary: "anthropic/claude-sonnet-4-5" },
    models: {
      "anthropic/claude-sonnet-4-5": { alias: "Sonnet" },
      "anthropic/claude-opus-4-5": { alias: "Opus" }
    }
  }
}
`````````
## 在聊天中切换模型 (`/model`)

您可以在不重启的情况下切换当前会话的模型：```
/model
/model list
/model 3
/model openai/gpt-5.2
/model status
```
注意事项：
- `/model`（以及`/model list`）是一个紧凑的、带编号的选择器（模型系列 + 可用提供者）。
- `/model <#>` 从该选择器中进行选择。
- `/model status` 是详细视图（认证候选者，以及在配置后，提供者端点 `baseUrl` + `api` 模式）。
- 模型引用通过分割 **第一个** `/` 来解析。在输入 `/model <ref>` 时，请使用 `provider/model` 格式。
- 如果模型 ID 本身包含 `/`（如 OpenRouter 风格），则必须包含提供者前缀（例如：`/model openrouter/moonshotai/kimi-k2`）。
- 如果省略提供者，Clawdbot 会将输入视为别名或 **默认提供者** 的模型（仅在模型 ID 中没有 `/` 时有效）。

完整命令行为/配置：[斜杠命令](/tools/slash-commands)。

## CLI 命令
bash
clawdbot models list
clawdbot models status
clawdbot models set <provider/model>
clawdbot models set-image <provider/model>

clawdbot models aliases list
clawdbot models aliases add <alias> <provider/model>
clawdbot models aliases remove <alias>

clawdbot models fallbacks list
clawdbot models fallbacks add <provider/model>
clawdbot models fallbacks remove <provider/model>
clawdbot models fallbacks clear

clawdbot models image-fallbacks list
clawdbot models image-fallbacks add <provider/model>
clawdbot models image-fallbacks remove <provider/model>
clawdbot models image-fallbacks clear``````
`clawdbot models`（无子命令）是 `models status` 的快捷方式。

### `models list`

默认显示已配置的模型。有用的标志：

- `--all`：完整目录
- `--local`：仅显示本地提供者
- `--provider <name>`：按提供者过滤
- `--plain`：每行显示一个模型
- `--json`：机器可读的输出

### `models status`

显示解析后的主模型、备用模型、图像模型以及已配置提供者的认证概览。
它还会显示在认证存储中找到的配置文件的 OAuth 过期状态（默认在 24 小时内警告）。
`--plain` 仅打印解析后的主模型。
OAuth 状态始终显示（并包含在 `--json` 输出中）。如果某个已配置的提供者没有凭据，`models status` 会打印一个 **缺少认证** 的部分。
JSON 输出包括 `auth.oauth`（警告窗口 + 配置文件）和 `auth.providers`（每个提供者的有效认证）。
使用 `--check` 用于自动化（当缺少或过期时退出代码为 `1`，当即将过期时退出代码为 `2`）。

首选的 Anthropic 认证是 Claude Code CLI 的 setup-token（可在任何地方运行；如需在网关主机上粘贴）：```bash
claude setup-token
clawdbot models status
```
## 扫描（OpenRouter 免费模型）

`clawdbot models scan` 会检查 OpenRouter 的 **免费模型目录**，并可选地对模型进行探测以查看其是否支持工具和图像。

关键标志：

- `--no-probe`: 跳过实时探测（仅获取元数据）
- `--min-params <b>`: 最小参数数量（十亿）
- `--max-age-days <days>`: 跳过超过指定天数的模型
- `--provider <name>`: 提供商前缀过滤器
- `--max-candidates <n>`: 回退列表大小
- `--set-default`: 将 `agents.defaults.model.primary` 设置为第一个选择
- `--set-image`: 将 `agents.defaults.imageModel.primary` 设置为第一个图像选择

探测需要 OpenRouter API 密钥（来自认证配置文件或 `OPENROUTER_API_KEY`）。如果没有密钥，请使用 `--no-probe` 仅列出候选模型。

扫描结果按以下顺序排序：
1) 图像支持  
2) 工具延迟  
3) 上下文大小  
4) 参数数量  

输入
- OpenRouter `/models` 列表（过滤 `:free`）
- 需要来自认证配置文件或 `OPENROUTER_API_KEY` 的 OpenRouter API 密钥（参见 [/environment](/environment)）
- 可选过滤器：`--max-age-days`, `--min-params`, `--provider`, `--max-candidates`
- 探测控制：`--timeout`, `--concurrency`

在 TTY 中运行时，可以交互式地选择回退模型。在非交互模式下，可通过 `--yes` 接受默认值。