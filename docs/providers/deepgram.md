---
summary: "Deepgram transcription for inbound voice notes"
read_when:
  - You want Deepgram speech-to-text for audio attachments
  - You need a quick Deepgram config example
---

# Deepgram（音频转录）

Deepgram 是一个语音转文字 API。在 Clawdbot 中，它通过 `tools.media.audio` 用于 **入站音频/语音备忘录的转录**。

启用后，Clawdbot 会将音频文件上传至 Deepgram，并将转录文本注入回复流程中（`{{Transcript}}` + `[Audio]` 块）。这属于 **非流式** 转录；它使用的是预录制的转录接口。

网站：https://deepgram.com  
文档：https://developers.deepgram.com

## 快速入门

1) 设置你的 API 密钥：

DEEPGRAM_API_KEY=dg_...
``````
2) 启用提供者：```json5
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
```
## 选项

- `model`: Deepgram 模型 ID（默认：`nova-3`）
- `language`: 语言提示（可选）
- `tools.media.audio.providerOptions.deepgram.detect_language`: 启用语言检测（可选）
- `tools.media.audio.providerOptions.deepgram.punctuate`: 启用标点符号（可选）
- `tools.media.audio.providerOptions.deepgram.smart_format`: 启用智能格式（可选）

示例（包含语言）：
json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [
          { provider: "deepgram", model: "nova-3", language: "en" }
        ]
      }
    }
  }
}
```带有 Deepgram 选项的示例：
json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        providerOptions: {
          deepgram: {
            detect_language: true,
            punctuate: true,
            smart_format: true
          }
        },
        models: [{ provider: "deepgram", model: "nova-3" }]
      }
    }
  }
}
``````
```md
## 说明

- 认证遵循标准的提供者认证顺序；`DEEPGRAM_API_KEY` 是最简单的路径。
- 当使用代理时，可以通过 `tools.media.audio.baseUrl` 和 `tools.media.audio.headers` 覆盖端点或头部信息。
- 输出遵循与其他提供者相同的音频规则（大小限制、超时、字幕注入）。