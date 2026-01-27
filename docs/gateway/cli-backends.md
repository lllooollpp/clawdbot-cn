---
summary: "CLI backends: text-only fallback via local AI CLIs"
read_when:
  - You want a reliable fallback when API providers fail
  - You are running Claude Code CLI or other local AI CLIs and want to reuse them
  - You need a text-only, tool-free path that still supports sessions and images
---

# CLI 后端（备用运行时）

当 API 服务提供商出现故障、受到速率限制或暂时出现问题时，Clawdbot 可以运行 **本地 AI CLI** 作为 **纯文本备用方案**。这是有意为之的保守设计：

- **工具被禁用**（无法调用工具）。
- **输入 → 输出纯文本**（可靠）。
- **支持会话**（因此后续对话可以保持连贯性）。
- **如果 CLI 接受图像路径，图像也可以传递通过**。

这被设计为一种 **安全网**，而不是主要路径。当你希望获得“始终可用”的纯文本响应，而无需依赖外部 API 时可以使用它。

## 面向初学者的快速入门

你可以 **无需任何配置** 就使用 Claude Code CLI（Clawdbot 内置了默认配置）。
bash
clawdbot agent --message "hi" --model claude-cli/opus-4.5
`````````
Codex CLI 也可以开箱即用：```bash
clawdbot agent --message "hi" --model codex-cli/gpt-5.2-codex
```
如果您的网关在 launchd/systemd 下运行且 PATH 变量最小，请仅添加命令路径：
json5
{
  agents: {
    defaults: {
      cliBackends: {
        "claude-cli": {
          command: "/opt/homebrew/bin/claude"
        }
      }
    }
  }
}``````
就是这样。不需要密钥，也不需要在CLI之外进行额外的认证配置。

## 作为备用方案使用

将CLI后端添加到你的备用列表中，仅在主模型失败时运行：```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-opus-4-5",
        fallbacks: [
          "claude-cli/opus-4.5"
        ]
      },
      models: {
        "anthropic/claude-opus-4-5": { alias: "Opus" },
        "claude-cli/opus-4.5": {}
      }
    }
  }
}
```
注意事项：
- 如果你使用 `agents.defaults.models`（允许列表），你必须包含 `claude-cli/...`。
- 如果主提供商失败（认证失败、速率限制、超时），Clawdbot 将尝试使用 CLI 后端。

每个条目都通过 **provider id**（例如 `claude-cli`、`my-cli`）进行键控。
provider id 将成为您模型引用的左侧部分：
<provider>/<model>```
{
  agents: {
    defaults: {
      cliBackends: {
        "claude-cli": {
          command: "/opt/homebrew/bin/claude"
        },
        "my-cli": {
          command: "my-cli",
          args: ["--json"],
          output: "json",
          input: "arg",
          modelArg: "--model",
          modelAliases: {
            "claude-opus-4-5": "opus",
            "claude-sonnet-4-5": "sonnet"
          },
          sessionArg: "--session",
          sessionMode: "existing",
          sessionIdFields: ["session_id", "conversation_id"],
          systemPromptArg: "--system",
          systemPromptWhen: "first",
          imageArg: "--image",
          imageMode: "repeat",
          serialize: true
        }
      }
    }
  }
}```
## 它是如何工作的

1) **根据提供者前缀（`claude-cli/...`）选择一个后端**。
2) **使用相同的 Clawdbot 提示 + 工作区上下文 构建系统提示**。
3) **使用会话 ID（如果支持的话）执行 CLI**，以保持历史记录的一致性。
4) **解析输出**（JSON 或纯文本），并返回最终文本。
5) **按后端持久化会话 ID**，以便后续问题可以复用相同的 CLI 会话。

## 会话

- 如果 CLI 支持会话，请在设置 `sessionArg`（例如 `--session-id`）或
  `sessionArgs`（占位符 `{sessionId}`）时插入 ID，
  当需要将 ID 插入到多个标志中时使用。
- 如果 CLI 使用一个 **恢复子命令** 并带有不同的标志，请设置
  `resumeArgs`（恢复时替换 `args`）以及可选的 `resumeOutput`
 （用于非 JSON 格式的恢复）。
- `sessionMode`:
  - `always`: 总是发送一个会话 ID（如果没有存储过，则生成一个新的 UUID）。
  - `existing`: 仅在之前已存储会话 ID 时发送。
  - `none`: 永不发送会话 ID。```json5
imageArg: "--image",
imageMode: "repeat"
```
Clawdbot 会将 base64 编码的图片写入临时文件。如果设置了 `imageArg`，这些路径会作为 CLI 参数传递。如果 `imageArg` 缺失，Clawdbot 会将文件路径附加到提示中（路径注入），这对于从普通路径自动加载本地文件的 CLI 来说已经足够（如 Claude Code CLI 的行为）。

## 输入 / 输出

- `output: "json"`（默认）尝试解析 JSON 并提取文本和会话 ID。
- `output: "jsonl"` 解析 JSONL 流（Codex CLI 的 `--json`），并提取最后的代理消息以及当存在时的 `thread_id`。
- `output: "text"` 将 stdout 视为最终响应。

输入模式：
- `input: "arg"`（默认）将提示作为最后一个 CLI 参数传递。
- `input: "stdin"` 通过 stdin 发送提示。
- 如果提示非常长且设置了 `maxPromptArgChars`，则使用 stdin。

## 默认值（内置）

Clawdbot 为 `claude-cli` 提供了一个默认配置：

- `command: "claude"`
- `args: ["-p", "--output-format", "json", "--dangerously-skip-permissions"]`
- `resumeArgs: ["-p", "--output-format", "json", "--dangerously-skip-permissions", "--resume", "{sessionId}"]`
- `modelArg: "--model"`
- `systemPromptArg: "--append-system-prompt"`
- `sessionArg: "--session-id"`
- `systemPromptWhen: "first"`
- `sessionMode: "always"`

Clawdbot 也为 `codex-cli` 提供了一个默认配置：

- `command: "codex"`
- `args: ["exec","--json","--color","never","--sandbox","read-only","--skip-git-repo-check"]`
- `resumeArgs: ["exec","resume","{sessionId}","--color","never","--sandbox","read-only","--skip-git-repo-check"]`
- `output: "jsonl"`
- `resumeOutput: "text"`
- `modelArg: "--model"`
- `imageArg: "--image"`
- `sessionMode: "existing"`

仅在需要时进行覆盖（常见情况：设置 `command` 的绝对路径）。

## 限制

- **没有 Clawdbot 工具**（CLI 后端永远不会接收到工具调用）。一些 CLI 仍可能运行自己的代理工具。
- **不支持流式传输**（CLI 输出会被收集后返回）。
- **结构化输出** 依赖于 CLI 的 JSON 格式。
- **Codex CLI 会话** 通过文本输出恢复（不支持 JSONL），这比初始的 `--json` 运行结构化程度更低。Clawdbot 的会话仍能正常工作。

## 排查问题

- **CLI 未找到**：将 `command` 设置为完整路径。
- **模型名称错误**：使用 `modelAliases` 将 `provider/model` 映射到 CLI 模型。
- **会话不连续**：确保 `sessionArg` 已设置，并且 `sessionMode` 不是 `none`（Codex CLI 当前无法通过 JSON 输出恢复会话）。
- **图片被忽略**：设置 `imageArg`（并确认 CLI 支持文件路径）。