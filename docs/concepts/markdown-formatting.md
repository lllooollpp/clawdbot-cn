---
summary: "Markdown formatting pipeline for outbound channels"
read_when:
  - You are changing markdown formatting or chunking for outbound channels
  - You are adding a new channel formatter or style mapping
  - You are debugging formatting regressions across channels
---

# Markdown 格式化

Clawdbot 通过将 Markdown 转换为共享的中间表示 (IR)，然后再渲染为特定频道的输出，实现对出站 Markdown 的格式化。IR 会保留原始文本不变，同时携带样式/链接范围，这样分块和渲染可以在不同频道之间保持一致。

## 目标

- **一致性：** 一次解析步骤，多种渲染器。
- **安全分块：** 在渲染之前分割文本，确保内联格式不会跨块断裂。
- **频道适配：** 将相同的 IR 映射到 Slack mrkdwn、Telegram HTML 和 Signal 样式范围，而无需重新解析 Markdown。

## 流程

1. **解析 Markdown -> IR**
   - IR 包括纯文本以及样式范围（粗体/斜体/删除线/代码/剧透）和链接范围。
   - 偏移量使用 UTF-16 代码单元，以便 Signal 的样式范围与其 API 对齐。
   - 仅当频道启用表格转换时，才会解析表格。
2. **分块 IR（格式优先）**
   - 分块发生在渲染之前，基于 IR 文本。
   - 内联格式不会跨块分割；每个块会切分样式范围。
3. **按频道渲染**
   - **Slack:** mrkdwn 令牌（粗体/斜体/删除线/代码），链接以 `<url|label>` 形式呈现。
   - **Telegram:** HTML 标签（`<b>`、`<i>`、`<s>`、`<code>`、`<pre><code>`、`<a href>`）。
   - **Signal:** 纯文本 + `text-style` 范围；当标签与 URL 不同时，链接会变成 `label (url)`。

## IR 示例

输入 Markdown: 你好 **世界** — 查看 [文档](https://docs.clawd.bot)。IR（原理图）：
json
{
  "text": "Hello world — see docs.",
  "styles": [
    { "start": 6, "end": 11, "style": "bold" }
  ],
  "links": [
    { "start": 19, "end": 23, "href": "https://docs.clawd.bot" }
  ]
}
`````````
## 使用场景

- Slack、Telegram 和 Signal 的出站适配器会从 IR 渲染内容。
- 其他频道（WhatsApp、iMessage、MS Teams、Discord）仍然使用纯文本或其自身的格式规则，当启用时会在分块前应用 Markdown 表格转换。

## 表格处理

Markdown 表格在聊天客户端中的支持并不一致。可以使用 `markdown.tables` 来按频道（和按账户）控制转换。

- `code`: 将表格渲染为代码块（大多数频道的默认设置）。
- `bullets`: 将每一行转换为项目符号（Signal + WhatsApp 的默认设置）。
- `off`: 禁用表格解析和转换；原始表格文本将直接通过。```yaml
channels:
  discord:
    markdown:
      tables: code
    accounts:
      work:
        markdown:
          tables: off
```
## 分块规则

- 分块限制来自通道适配器/配置，并应用于IR文本。
- 代码块被保留为一个单独的块，并带有换行符，以便通道正确渲染。
- 列表前缀和引用块前缀是IR文本的一部分，因此分块不会在前缀中间拆分。
- 内联样式（粗体/斜体/删除线/内联代码/剧透）不会跨分块拆分；渲染器会在每个分块内重新打开样式。

如需了解跨通道的分块行为，请参阅
[流式传输 + 分块](/concepts/streaming)。

## 链接策略

- **Slack:** `[标签](网址)` -> `<网址|标签>`；裸网址保持原样。解析时禁用自动链接以避免重复链接。
- **Telegram:** `[标签](网址)` -> `<a href="网址">标签</a>`（HTML解析模式）。
- **Signal:** `[标签](网址)` -> `标签 (网址)`，除非标签与网址匹配。

## 剧透

剧透标记（`||spoiler||`）仅在Signal中被解析，它们映射到SPOILER样式范围。其他通道将它们视为普通文本。

## 如何添加或更新通道格式器

1. **解析一次：** 使用共享的 `markdownToIR(...)` 辅助函数，并根据通道设置适当的选项（自动链接、标题样式、引用块前缀）。
2. **渲染：** 实现一个渲染器，使用 `renderMarkdownWithMarkers(...)` 和一个样式标记映射表（或Signal样式范围）。
3. **分块：** 在渲染前调用 `chunkMarkdownIR(...)`；然后对每个分块进行渲染。
4. **连接适配器：** 更新通道的出站适配器以使用新的分块器和渲染器。
5. **测试：** 如果通道使用分块，则添加或更新格式测试和出站传递测试。

## 常见陷阱

- Slack的角度括号标记（`<@U123>`、`<#C123>`、`<https://...>`）必须被保留；安全地转义原始HTML。
- Telegram的HTML需要转义标签外的文本，以避免标记损坏。
- Signal的样式范围依赖于UTF-16偏移量；不要使用代码点偏移量。
- 保留代码块的换行符，以便关闭标记出现在单独的一行。