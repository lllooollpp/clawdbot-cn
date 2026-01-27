---
summary: "When Clawdbot shows typing indicators and how to tune them"
read_when:
  - Changing typing indicator behavior or defaults
---

# 输入指示器

当运行正在进行时，输入指示器会发送到聊天频道。使用 `agents.defaults.typingMode` 来控制 **何时** 显示输入指示器，使用 `typingIntervalSeconds` 来控制 **刷新频率**。

## 默认设置
当 `agents.defaults.typingMode` 未设置时，Clawdbot 保持旧版行为：
- **直接聊天**：一旦模型循环开始，立即显示输入指示器。
- **包含@提及的群聊**：立即显示输入指示器。
- **不包含@提及的群聊**：仅在消息文本开始流式传输时显示输入指示器。
- **心跳运行**：禁用输入指示器。

## 模式
将 `agents.defaults.typingMode` 设置为以下之一：
- `never` — 从不显示输入指示器。
- `instant` — 一旦模型循环开始，就立即显示输入指示器，即使之后返回的只是静默回复标记。
- `thinking` — 在 **第一个推理增量** 时开始显示输入指示器（需要为运行设置 `reasoningLevel: "stream"`）。
- `message` — 在 **第一个非静默文本增量** 时开始显示输入指示器（忽略 `NO_REPLY` 静默标记）。

“触发时间”顺序为：
`never` → `message` → `thinking` → `instant`
json5
{
  agent: {
    typingMode: "thinking",
    typingIntervalSeconds: 6
  }
}
`````````
你可以按会话覆盖模式或节奏：```json5
{
  session: {
    typingMode: "message",
    typingIntervalSeconds: 4
  }
}
```
## 说明
- `message` 模式不会显示仅静默回复的输入状态（例如，使用 `NO_REPLY` 令牌来抑制输出）。
- `thinking` 仅在进行流式推理时触发（`reasoningLevel: "stream"`）。
  如果模型不生成推理的增量数据，输入状态将不会开始显示。
- 心跳（Heartbeats）无论处于何种模式都不会显示输入状态。
- `typingIntervalSeconds` 控制的是 **刷新频率**，而不是开始时间。
  默认值为 6 秒。