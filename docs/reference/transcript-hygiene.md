---
summary: "Reference: provider-specific transcript sanitization and repair rules"
read_when:
  - You are debugging provider request rejections tied to transcript shape
  - You are changing transcript sanitization or tool-call repair logic
  - You are investigating tool-call id mismatches across providers
---

# 转录本卫生处理（提供者修复）

本文档描述了在运行前（构建模型上下文）对转录本进行的**提供者特定修复**。这些是**内存中**的调整，用于满足严格的提供者要求。它们**不会**修改磁盘上存储的JSONL转录本。

范围包括：
- 工具调用ID的清理
- 工具结果配对修复
- 轮次验证/排序
- 思考签名清理
- 图像有效负载清理

如需了解转录本存储的详细信息，请参阅：
- [/reference/session-management-compaction](/reference/session-management-compaction)

---

## 此处理在哪里执行

所有转录本卫生处理都集中在嵌入式运行器中：
- 策略选择：`src/agents/transcript-policy.ts`
- 清理/修复应用：`sanitizeSessionHistory` 在 `src/agents/pi-embedded-runner/google.ts` 中

该策略使用 `provider`、`modelApi` 和 `modelId` 来决定应用哪些修复。

---

## 全局规则：图像清理

图像有效负载始终会被清理，以防止因大小限制被提供者拒绝（对过大的base64图像进行缩小/重新压缩）。

实现：
- `sanitizeSessionMessagesImages` 在 `src/agents/pi-embedded-helpers/images.ts` 中
- `sanitizeContentBlocksImages` 在 `src/agents/tool-images.ts` 中

---

## 提供者矩阵（当前行为）

**OpenAI / OpenAI Codex**
- 仅进行图像清理。
- 在切换到OpenAI Responses/Codex模型时，丢弃孤立的推理签名（没有后续内容块的独立推理项）。
- 不进行工具调用ID清理。
- 不进行工具结果配对修复。
- 不进行轮次验证或重新排序。
- 不生成合成工具结果。
- 不剥离思考签名。

**Google（Generative AI / Gemini CLI / Antigravity）**
- 工具调用ID清理：严格使用字母数字。
- 工具结果配对修复和合成工具结果。
- 轮次验证（Gemini风格的轮次交替）。
- Google轮次排序修复（如果历史记录以助手开始，则在前面添加一个微小的用户引导）。
- Antigravity Claude：规范化思考签名；丢弃未签名的思考块。

**Anthropic / Minimax（Anthropic兼容）**
- 工具结果配对修复和合成工具结果。
- 轮次验证（合并连续的用户轮次以满足严格的交替要求）。

**Mistral（包括基于model-id的检测）**
- 工具调用ID清理：严格使用9位字母数字。

**OpenRouter Gemini**
- 思考签名清理：剥离非base64的`thought_signature`值（保留base64的）。

**其他所有提供者**
- 仅进行图像清理。

---

## 历史行为（2026.1.22之前）

在2026.1.22版本发布之前，Clawdbot应用了多层转录本卫生处理：```md
- 一个 **transcript-sanitize 扩展** 在每次上下文构建时都会运行，它可以：
  - 修复工具使用/结果的配对。
  - 对工具调用 ID 进行清理（包括一种非严格模式，保留 `_`/`-`）。
- 运行器还执行了特定于提供者的清理操作，这导致了重复工作。
- 其他一些修改发生在提供者策略之外，包括：
  - 在持久化之前从助理文本中删除 `<final>` 标签。
  - 忽略空的助理错误回合。
  - 在工具调用后修剪助理内容。
  
这种复杂性导致了跨提供者的回归问题（尤其是 `openai-responses` 中的 `call_id|fc_id` 配对）。2026.1.22 清理操作移除了该扩展，将逻辑集中到运行器中，并且除了图像清理外，对 OpenAI 实施了 **无触碰** 策略。