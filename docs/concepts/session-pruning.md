---
summary: "Session pruning: tool-result trimming to reduce context bloat"
read_when:
  - You want to reduce LLM context growth from tool outputs
  - You are tuning agents.defaults.contextPruning
---

# 会话修剪

会话修剪在每次 LLM 调用之前，从内存中的上下文中移除 **旧的工具结果**。它 **不会** 重写磁盘上的会话历史记录（`*.jsonl` 文件）。

## 何时运行

- 当启用 `mode: "cache-ttl"` 并且会话的最后一次 Anthropic 调用时间超过 `ttl` 时。
- 仅影响该请求发送给模型的消息。
  - 仅对 Anthropic API 调用（以及 OpenRouter 上的 Anthropic 模型）有效。
  - 为了最佳效果，建议将 `ttl` 与模型的 `cacheControlTtl` 设置为一致。
  - 在修剪之后，TTL 窗口会重置，因此后续请求会继续使用缓存，直到 `ttl` 再次过期。

## 智能默认设置（Anthropic）

- **OAuth 或 setup-token** 配置：启用 `cache-ttl` 修剪，设置心跳为 `1h`。
- **API key** 配置：启用 `cache-ttl` 修剪，设置心跳为 `30m`，并在 Anthropic 模型上默认设置 `cacheControlTtl` 为 `1h`。
- 如果你显式设置了这些值，Clawdbot **不会** 覆盖它们。

## 这会带来哪些改进（成本 + 缓存行为）

- **为什么要修剪**：Anthropic 的提示词缓存仅在 TTL 内有效。如果会话在 TTL 之后处于空闲状态，下一次请求将重新缓存整个提示词，除非你先进行修剪。
- **什么会更便宜**：修剪会减少 TTL 过期后第一次请求的 **cacheWrite** 大小。
- **为什么 TTL 重置很重要**：一旦修剪运行，缓存窗口就会重置，后续请求可以复用刚刚缓存的提示词，而不是重新缓存整个历史记录。
- **它不会做什么**：修剪不会增加 token 数量或“加倍”成本；它只改变 TTL 过期后第一次请求时被缓存的内容。

## 可以修剪的内容

- 仅修剪 `toolResult` 类型的消息。
- 用户消息和助手消息 **永远不会** 被修改。
- 最后 `keepLastAssistants` 条助手消息会被保护；在这之后的工具结果不会被修剪。
- 如果没有足够的助手消息来确定修剪的截止点，修剪将被跳过。
- 包含 **图像块** 的工具结果将被跳过（**永远不会**被修剪或清除）。

## 上下文窗口估算

修剪使用估算的上下文窗口（字符 ≈ token × 4）。窗口大小按以下顺序确定：
1) 模型定义中的 `contextWindow`（来自模型注册表）。
2) `models.providers.*.models[].contextWindow` 的覆盖设置。
3) `agents.defaults.contextTokens`。
4) 默认值为 `200000` 个 token。

## 模式

### cache-ttl

- 修剪仅在最后一次 Anthropic 调用时间超过 `ttl`（默认为 `5m`）时运行。
- 当运行时：与之前相同的行为，即 **软修剪 + 硬清除**。

## 软修剪 vs 硬清除

- **软修剪**：仅用于过大的工具结果。
  - 保留开头和结尾，插入 `...`，并在末尾添加一条说明，标明原始大小。
  - 跳过包含图像块的结果。
- **硬清除**：将整个工具结果替换为 `hardClear.placeholder`。

## 工具选择

- `tools.allow` / `tools.deny` 支持 `*` 通配符。
- **deny 优先于 allow**。
- 匹配是大小写不敏感的。
- 空的 allow 列表意味着允许所有工具。

## 与其他限制的交互
- 内置工具会自动截断自己的输出；会话修剪是另一层机制，防止长时间运行的对话在模型上下文中积累过多的工具输出。
- 压缩是独立的：压缩会进行总结并保存，而修剪是每次请求的临时操作。详见 [/concepts/compaction](/concepts/compaction)。

## 默认值（启用时）
- `ttl`: `"5m"`
- `keepLastAssistants`: `3`
- `softTrimRatio`: `0.3`
- `hardClearRatio`: `0.5`
- `minPrunableToolChars`: `50000`
- `softTrim`: `{ maxChars: 4000, headChars: 1500, tailChars: 1500 }`
- `hardClear`: `{ enabled: true, placeholder: "[旧工具结果内容已清除]" }`

## 示例
默认（关闭）：
json5
{
  agent: {
    contextPruning: { mode: "off" }
  }
}``````
启用TTL感知的清理：```json5
{
  agent: {
    contextPruning: { mode: "cache-ttl", ttl: "5m" }
  }
}
```
{
  agent: {
    contextPruning: {
      mode: "cache-ttl",
      tools: { allow: ["exec", "read"], deny: ["*image*"] }
    }
  }
}