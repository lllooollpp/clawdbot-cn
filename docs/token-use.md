---
summary: "How Clawdbot builds prompt context and reports token usage + costs"
read_when:
  - Explaining token usage, costs, or context windows
  - Debugging context growth or compaction behavior
---

# Token 使用与成本

Clawdbot 跟踪的是 **tokens**（标记），而不是字符。Tokens 是特定于模型的，但大多数 OpenAI 风格的模型平均每 token 约对应 4 个英文字符。

## 系统提示是如何构建的

Clawdbot 在每次运行时都会自行构建系统提示。它包括：

- 工具列表 + 简短描述
- 技能列表（仅元数据；指令在需要时通过 `read` 加载）
- 自我更新指令
- 工作区 + 引导文件（当新建时：`AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md`、`HEARTBEAT.md`、`BOOTSTRAP.md`）。大文件会根据 `agents.defaults.bootstrapMaxChars` 进行截断（默认值：20000）。
- 时间（UTC + 用户时区）
- 回复标签 + 心跳行为
- 运行时元数据（主机/操作系统/模型/思考）

有关完整的说明，请参阅 [System Prompt](/concepts/system-prompt)。

## 什么会计入上下文窗口

模型接收到的所有内容都会计入上下文限制：

- 系统提示（以上列出的所有部分）
- 对话历史（用户 + 助手消息）
- 工具调用和工具结果
- 附件/转录内容（图片、音频、文件）
- 压缩摘要和修剪记录
- 提供商包装或安全头部（不可见，但仍计入）

如需实际的分解（按注入的文件、工具、技能和系统提示大小），请使用 `/context list` 或 `/context detail`。参见 [Context](/concepts/context)。

## 如何查看当前的 Token 使用情况

在聊天中使用以下命令：

- `/status` → **带表情符号的状态卡**，显示当前会话的模型、上下文使用情况、最后一次回复的输入/输出 Token 数，以及 **预估成本**（仅在有 API 密钥时显示）。
- `/usage off|tokens|full` → 为每个回复附加一个 **每回复的使用情况尾部**。
  - 持久化于每个会话中（存储为 `responseUsage`）。
  - OAuth 认证 **会隐藏成本**（仅显示 Token 数）。
- `/usage cost` → 显示来自 Clawdbot 会话日志的本地成本汇总。

其他界面：

- **TUI/Web TUI:** 支持 `/status` 和 `/usage`。
- **CLI:** `clawdbot status --usage` 和 `clawdbot channels list` 显示提供商标配的配额窗口（不是每回复的成本）。```
models.providers.<provider>.models[].cost
```
这是 `input`、`output`、`cacheRead` 和 `cacheWrite` 的 **每 1M 个 token 的美元价格**。如果价格信息缺失，Clawdbot 将仅显示 token 数量。OAuth token 永远不会显示美元成本。

## 缓存 TTL 和清理的影响

提供方的提示缓存仅在缓存 TTL 窗口内有效。Clawdbot 可以选择运行 **cache-ttl 清理**：在缓存 TTL 过期后清理该会话，然后重置缓存窗口，以便后续请求可以重新使用新缓存的上下文，而不是重新缓存整个历史记录。这在会话超过 TTL 后处于空闲状态时，可以降低缓存写入成本。

你可以在 [网关配置](/gateway/configuration) 中进行配置，并在 [会话清理](/concepts/session-pruning) 中查看行为细节。

心跳机制可以在空闲间隔期间保持缓存 **常温**。如果你的模型缓存 TTL 是 `1h`，将心跳间隔设置为略低于这个时间（例如 `55m`），可以避免重新缓存整个提示，从而减少缓存写入成本。

关于 Anthropic API 的定价，缓存读取的成本远低于输入 token，而缓存写入则按更高的倍数计费。请参阅 Anthropic 的提示缓存定价以获取最新费率和 TTL 倍数：
https://docs.anthropic.com/docs/build-with-claude/prompt-caching

### 示例：使用心跳保持 1 小时缓存常温```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-opus-4-5"
    models:
      "anthropic/claude-opus-4-5":
        params:
          cacheControlTtl: "1h"
    heartbeat:
      every: "55m"
```
## 减少令牌压力的技巧

- 使用 `/compact` 来总结长时间的会话。
- 在工作流中裁剪大型工具输出。
- 保持技能描述简短（技能列表会被注入到提示中）。
- 优先使用较小的模型进行冗长、探索性的任务。

有关精确的技能列表开销公式，请参阅 [技能](/tools/skills)。