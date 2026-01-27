---
summary: "Directive syntax for /think + /verbose and how they affect model reasoning"
read_when:
  - Adjusting thinking or verbose directive parsing or defaults
---

# 思考层级（/think 指令）

## 作用
- 任何传入消息中的内联指令：`/t <层级>`、`/think:<层级>` 或 `/thinking <层级>`。
- 层级（别名）：`off | minimal | low | medium | high | xhigh`（仅限 GPT-5.2 + Codex 模型）
  - minimal → “think”
  - low → “think hard”
  - medium → “think harder”
  - high → “ultrathink”（最大预算）
  - xhigh → “ultrathink+”（仅限 GPT-5.2 + Codex 模型）
  - `highest`、`max` 映射到 `high`。

## 供应商说明：
- Z.AI (`zai/*`) 仅支持二进制思考模式（`on`/`off`）。任何非 `off` 的层级都会被视为 `on`（映射到 `low`）。

## 解析顺序
1. 消息中的内联指令（仅对该消息生效）。
2. 会话覆盖（通过发送仅包含指令的消息设置）。
3. 全局默认值（`agents.defaults.thinkingDefault` 在配置中）。
4. 回退：对于具备推理能力的模型为 `low`；否则为 `off`。

## 设置会话默认值
- 发送一条**仅包含**指令的消息（允许有空格），例如 `/think:medium` 或 `/t high`。
- 该设置适用于当前会话（默认按发送者区分）；通过 `/think:off` 或会话空闲重置来清除。
- 会收到确认回复（`Thinking level set to high.` / `Thinking disabled.`）。如果层级无效（例如 `/thinking big`），命令将被拒绝并提示，会话状态不变。
- 发送 `/think`（或 `/think:`）不带参数可查看当前思考层级。

## 代理的应用
- **Embedded Pi**：解析后的层级会传递给进程内的 Pi 代理运行时。

## 详细指令（/verbose 或 /v）
- 层级：`on`（最小） | `full` | `off`（默认）。
- 仅指令的消息会切换会话的详细日志，并回复 `Verbose logging enabled.` / `Verbose logging disabled.`；无效层级会提示但不改变状态。
- `/verbose off` 会存储显式的会话覆盖；通过 Sessions UI 选择 `inherit` 来清除。
- 内联指令仅影响该消息；其他情况下使用会话/全局默认值。
- 发送 `/verbose`（或 `/verbose:`）不带参数可查看当前详细日志层级。
- 当详细日志开启时，生成结构化工具结果的代理（如 Pi、其他 JSON 代理）会将每个工具调用作为独立的元数据消息返回，若可用则以 `<emoji> <tool-name>: <arg>` 为前缀（路径/命令）。这些工具摘要会在每个工具启动时立即发送（独立气泡），而不是作为流式更新。
- 当详细日志为 `full` 时，工具执行完成后也会转发输出（独立气泡，截断为安全长度）。如果你在运行中切换 `/verbose on|full|off`，后续的工具气泡会遵循新的设置。

## 思维可见性 (/reasoning)
- 等级：`on|off|stream`。
- 仅指令消息用于切换回复中是否显示思考过程。
- 当启用时，思维过程会以一个**单独的消息**形式发送，该消息前缀为 `Reasoning:`。
- `stream`（仅限 Telegram）：在回复生成过程中，将思维过程流式传输到 Telegram 的草稿气泡中，然后发送最终答案而不包含思维过程。
- 别名：`/reason`。
- 发送 `/reasoning`（或 `/reasoning:`）且不带参数，可以查看当前的思维可见性等级。

## 相关内容
- 提升模式的文档位于 [提升模式](/tools/elevated)。

## 心跳检测
- 心跳探测内容是配置的心跳提示（默认：`如果存在 HEARTBEAT.md，请阅读（工作区上下文）。严格遵循它。不要推断或重复之前对话中的旧任务。如果没有需要关注的内容，请回复 HEARTBEAT_OK`）。在心跳消息中内联的指令仍会正常生效（但应避免从心跳中更改会话默认设置）。
- 心跳消息默认只发送最终内容。如需同时发送单独的 `Reasoning:` 消息（如果可用），请设置 `agents.defaults.heartbeat.includeReasoning: true` 或为每个代理设置 `agents.list[].heartbeat.includeReasoning: true`。

## 网页聊天界面
- 当页面加载时，网页聊天的“思考”选择器会从传入的会话存储/配置中读取并显示当前的思维可见性等级。
- 选择其他等级仅适用于下一条消息（`thinkingOnce`）；发送后，选择器会恢复到存储的会话等级。
- 如需更改会话默认设置，请发送 `/think:<level>` 指令（如之前所述）；选择器将在下次重新加载后反映该设置。