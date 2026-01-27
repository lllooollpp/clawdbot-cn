---
summary: "How inbound audio/voice notes are downloaded, transcribed, and injected into replies"
read_when:
  - Changing audio transcription or media handling
---

# 音频/语音笔记 — 2026-01-17

## 工作内容
- **媒体理解（音频）**：如果启用了音频理解（或自动检测），Clawdbot：
  1) 定位第一个音频附件（本地路径或URL），并在需要时下载它。
  2) 在发送到每个模型条目前，强制限制 `maxBytes`。
  3) 按顺序运行第一个符合条件的模型条目（提供者或CLI）。
  4) 如果失败或跳过（大小/超时），则尝试下一个条目。
  5) 成功时，用 `[Audio]` 块替换 `Body`，并设置 `{{Transcript}}`。

- **命令解析**：当转录成功时，`CommandBody`/`RawBody` 会被设置为转录内容，因此斜杠命令仍然有效。

- **详细日志**：在 `--verbose` 模式下，我们会记录转录运行的时间以及何时替换 `Body`。

## 自动检测（默认）
如果你 **没有配置模型** 并且 `tools.media.audio.enabled` **未设置为 `false`**，Clawdbot 会按以下顺序自动检测，并在第一个有效选项处停止：

1) **本地CLI**（如果已安装）
   - `sherpa-onnx-offline`（需要 `SHERPA_ONNX_MODEL_DIR` 包含 encoder/decoder/joiner/tokens）
     - `whisper-cli`（来自 `whisper-cpp`；使用 `WHISPER_CPP_MODEL` 或内置的 tiny 模型）
   - `whisper`（Python CLI；自动下载模型）
2) **Gemini CLI** (`gemini`) 使用 `read_many_files`
3) **提供者密钥**（OpenAI → Groq → Deepgram → Google）

要禁用自动检测，请将 `tools.media.audio.enabled: false` 设置为 `false`。
要自定义，请设置 `tools.media.audio.models`。
注意：二进制检测是尽力而为的，适用于 macOS/Linux/Windows；请确保 CLI 在 `PATH` 中（我们会扩展 `~`），或使用完整命令路径设置显式的CLI模型。
json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        maxBytes: 20971520,
        models: [
          { provider: "openai", model: "gpt-4o-mini-transcribe" },
          {
            type: "cli",
            command: "whisper",
            args: ["--model", "base", "{{MediaPath}}"],
            timeoutSeconds: 45
          }
        ]
      }
    }
  }
}
``````
### 仅限提供者且作用域受限```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        scope: {
          default: "allow",
          rules: [
            { action: "deny", match: { chatType: "group" } }
          ]
        },
        models: [
          { provider: "openai", model: "gpt-4o-mini-transcribe" }
        ]
      }
    }
  }
}
```
### 仅限提供者（Deepgram）
json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [{ provider: "deepgram", model: "nova-3" }]
      }
    }
  }
}
``````
## 注意事项与限制
- 提供商认证遵循标准的认证顺序（认证配置文件、环境变量、`models.providers.*.apiKey`）。
- 当使用 `provider: "deepgram"` 时，Deepgram 会自动读取 `DEEPGRAM_API_KEY`。
- Deepgram 的设置详情：[Deepgram（音频转录）](/providers/deepgram)。
- 音频提供商可以通过 `tools.media.audio` 覆盖 `baseUrl`、`headers` 和 `providerOptions`。
- 默认的大小限制是 20MB（`tools.media.audio.maxBytes`）。超过大小的音频将被跳过，并尝试下一个条目。
- 音频的默认 `maxChars` 是 **未设置**（完整转录文本）。可以通过设置 `tools.media.audio.maxChars` 或每个条目的 `maxChars` 来截断输出。
- OpenAI 的默认模型是 `gpt-4o-mini-transcribe`；若需要更高精度，可设置 `model: "gpt-4o-transcribe"`。
- 使用 `tools.media.audio.attachments` 来处理多个语音笔记（设置 `mode: "all"` + `maxAttachments`）。
- 转录内容可以在模板中通过 `{{Transcript}}` 访问。
- CLI 标准输出有大小限制（5MB）；请保持 CLI 输出简洁。

## 常见陷阱
- 作用域规则采用“第一个匹配优先”的策略。`chatType` 会被标准化为 `direct`、`group` 或 `room`。
- 确保你的 CLI 退出代码为 0 并且输出纯文本；如果需要 JSON 输出，可以通过 `jq -r .text` 进行处理。
- 保持合理的超时时间（`timeoutSeconds`，默认 60 秒），以避免阻塞回复队列。