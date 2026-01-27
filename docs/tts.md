---
summary: "Text-to-speech (TTS) for outbound replies"
read_when:
  - Enabling text-to-speech for replies
  - Configuring TTS providers or limits
  - Using /tts commands
---

# 文本转语音（TTS）

Clawdbot 可以使用 ElevenLabs、OpenAI 或 Edge TTS 将出站回复转换为音频。
它可以在 Clawdbot 可以发送音频的任何地方工作；Telegram 会显示一个圆形的语音消息气泡。

## 支持的服务

- **ElevenLabs**（主要或备用提供者）
- **OpenAI**（主要或备用提供者；也用于摘要）
- **Edge TTS**（主要或备用提供者；使用 `node-edge-tts`，无 API 密钥时默认使用）

### Edge TTS 说明

Edge TTS 通过 `node-edge-tts` 库使用 Microsoft Edge 的在线神经文本转语音服务。
它是一个托管服务（非本地），使用 Microsoft 的端点，并且**不需要 API 密钥**。
`node-edge-tts` 暴露了语音配置选项和输出格式，但并非所有选项都由 Edge 服务支持。citeturn2search0

由于 Edge TTS 是一个没有公开 SLA 或配额的公共服务，因此应视为尽力而为的服务。如果您需要保证的限制和支援，请使用 OpenAI 或 ElevenLabs。
Microsoft 的 Speech REST API 文档中提到每请求的音频限制为 10 分钟；Edge TTS 没有公布限制，因此应假设其限制相似或更低。citeturn0search3

## 可选的 API 密钥

如果您想使用 OpenAI 或 ElevenLabs：
- `ELEVENLABS_API_KEY`（或 `XI_API_KEY`）
- `OPENAI_API_KEY`

Edge TTS **不需要** API 密钥。如果没有找到 API 密钥，Clawdbot 默认会使用 Edge TTS（除非通过 `messages.tts.edge.enabled=false` 禁用）。

如果配置了多个提供者，首先使用选定的提供者，其他提供者作为备用选项。
自动摘要使用配置的 `summaryModel`（或 `agents.defaults.model.primary`），因此如果您启用了摘要功能，该提供者也必须经过认证。

## 服务链接

- [OpenAI 文本转语音指南](https://platform.openai.com/docs/guides/text-to-speech)
- [OpenAI 音频 API 参考](https://platform.openai.com/docs/api-reference/audio)
- [ElevenLabs 文本转语音](https://elevenlabs.io/docs/api-reference/text-to-speech)
- [ElevenLabs 身份验证](https://elevenlabs.io/docs/api-reference/authentication)
- [node-edge-tts](https://github.com/SchneeHertz/node-edge-tts)
- [Microsoft 语音输出格式](https://learn.microsoft.com/azure/ai-services/speech-service/rest-text-to-speech#audio-outputs)

## 默认是否启用？

不。自动文本转语音（Auto-TTS）默认是**关闭**的。您可以通过配置 `messages.tts.auto` 或通过 `/tts always`（别名：`/tts on`）在会话中启用它。

Edge TTS 在 TTS 启用后**默认是开启的**，并且在没有 OpenAI 或 ElevenLabs API 密钥时会自动使用。

## 配置

TTS 配置位于 `clawdbot.json` 中的 `messages.tts` 下。
完整架构请参见 [网关配置](/gateway/configuration)。
### 最小配置（启用 + 提供者）```json5
{
  messages: {
    tts: {
      auto: "always",
      provider: "elevenlabs"
    }
  }
}
```
### OpenAI 主要接口，ElevenLabs 作为备用接口```json5
{
  messages: {
    tts: {
      auto: "always",
      provider: "openai",
      summaryModel: "openai/gpt-4.1-mini",
      modelOverrides: {
        enabled: true
      },
      openai: {
        apiKey: "openai_api_key",
        model: "gpt-4o-mini-tts",
        voice: "alloy"
      },
      elevenlabs: {
        apiKey: "elevenlabs_api_key",
        baseUrl: "https://api.elevenlabs.io",
        voiceId: "voice_id",
        modelId: "eleven_multilingual_v2",
        seed: 42,
        applyTextNormalization: "auto",
        languageCode: "en",
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true,
          speed: 1.0
        }
      }
    }
  }
}
```
### Edge TTS 主要功能（无需 API 密钥）```json5
{
  messages: {
    tts: {
      auto: "always",
      provider: "edge",
      edge: {
        enabled: true,
        voice: "en-US-MichelleNeural",
        lang: "en-US",
        outputFormat: "audio-24khz-48kbitrate-mono-mp3",
        rate: "+10%",
        pitch: "-5%"
      }
    }
  }
}
```
### 禁用 Edge TTS```json5
{
  messages: {
    tts: {
      edge: {
        enabled: false
      }
    }
  }
}
```
### 自定义限制 + 首选项路径```json5
{
  messages: {
    tts: {
      auto: "always",
      maxTextLength: 4000,
      timeoutMs: 30000,
      prefsPath: "~/.clawdbot/settings/tts.json"
    }
  }
}
```
### 仅在接收到语音消息后回复音频```json5
{
  messages: {
    tts: {
      auto: "inbound"
    }
  }
}
```
### 禁用长回复的自动摘要```json5
{
  messages: {
    tts: {
      auto: "always"
    }
  }
}
```
然后运行：```
/tts summary off
```
### 关于字段的说明

- `auto`: 自动-TTS 模式 (`off`, `always`, `inbound`, `tagged`)。
  - `inbound` 仅在收到 inbound 语音消息后发送音频。
  - `tagged` 仅在回复中包含 `[[tts]]` 标签时发送音频。
- `enabled`: 旧版开关（医生会将其迁移到 `auto`）。
- `mode`: `"final"`（默认）或 `"all"`（包括工具/块回复）。
- `provider`: `"elevenlabs"`、`"openai"` 或 `"edge"`（如果未设置，会自动选择）。
- 如果 `provider` **未设置**，Clawdbot 会优先使用 `openai`（如果存在 API 密钥），然后是 `elevenlabs`（如果存在 API 密钥），否则使用 `edge`。
- `summaryModel`: 用于自动摘要的可选廉价模型；默认为 `agents.defaults.model.primary`。
  - 接受 `provider/model` 或已配置的模型别名。
- `modelOverrides`: 允许模型生成 TTS 指令（默认开启）。
- `maxTextLength`: TTS 输入的硬性字符限制。如果超出此限制，`/tts audio` 将失败。
- `timeoutMs`: 请求超时时间（毫秒）。
- `prefsPath`: 覆盖本地 prefs JSON 路径（provider/limit/summary）。
- `apiKey` 的值会回退到环境变量（`ELEVENLABS_API_KEY`/`XI_API_KEY`，`OPENAI_API_KEY`）。
- `elevenlabs.baseUrl`: 覆盖 ElevenLabs API 的基础 URL。
- `elevenlabs.voiceSettings`:
  - `stability`, `similarityBoost`, `style`: `0..1`
  - `useSpeakerBoost`: `true|false`
  - `speed`: `0.5..2.0`（1.0 = 正常速度）
- `elevenlabs.applyTextNormalization`: `auto|on|off`
- `elevenlabs.languageCode`: 2 字母 ISO 639-1（例如 `en`, `de`）
- `elevenlabs.seed`: 整数 `0..4294967295`（最佳努力的确定性）
- `edge.enabled`: 允许使用 Edge TTS（默认为 `true`；无需 API 密钥）。
- `edge.voice`: Edge 神经语音名称（例如 `en-US-MichelleNeural`）。
- `edge.lang`: 语言代码（例如 `en-US`）。
- `edge.outputFormat`: Edge 输出格式（例如 `audio-24khz-48kbitrate-mono-mp3`）。
  - 请参阅 Microsoft Speech 输出格式以获取有效值；并非所有格式都支持 Edge。
- `edge.rate` / `edge.pitch` / `edge.volume`: 百分比字符串（例如 `+10%`, `-5%`）。
- `edge.saveSubtitles`: 与音频文件一起保存 JSON 字幕。
- `edge.proxy`: Edge TTS 请求的代理 URL。
- `edge.timeoutMs`: 请求超时时间的覆盖设置（毫秒）。

## 基于模型的覆盖（默认开启）

默认情况下，模型 **可以** 为单个回复生成 TTS 指令。
当 `messages.tts.auto` 为 `tagged` 时，这些指令是触发音频的必要条件。

当启用时，模型可以生成 `[[tts:...]]` 指令来覆盖单个回复的语音，还可以选择性地提供 `[[tts:text]]...[[/tts:text]]` 块来添加表达性标签（如笑声、唱歌提示等），这些标签只应在音频中出现。

示例回复内容：
json
"  ,根据输入  帮我翻译成中文，输出要md格式的； 

注意： ```md      ```  包裹起来；
no_think
``````
Here you go.

[[tts:provider=elevenlabs voiceId=pMsXgVXv3BLzUgSXRplE model=eleven_v3 speed=1.1]]
[[tts:text]](laughs) Read the song once more.[[/tts:text]]
```
可用的指令键（启用后）：
- `provider`（`openai` | `elevenlabs` | `edge`）
- `voice`（OpenAI 语音）或 `voiceId`（ElevenLabs）
- `model`（OpenAI TTS 模型或 ElevenLabs 模型 ID）
- `stability`、`similarityBoost`、`style`、`speed`、`useSpeakerBoost`
- `applyTextNormalization`（`auto|on|off`）
- `languageCode`（ISO 639-1）
- `seed`

禁用所有模型覆盖：```json5
{
  messages: {
    tts: {
      modelOverrides: {
        enabled: false
      }
    }
  }
}
```
可选的允许列表（在保持标签启用的同时禁用特定覆盖）：```json5
{
  messages: {
    tts: {
      modelOverrides: {
        enabled: true,
        allowProvider: false,
        allowSeed: false
      }
    }
  }
}
```
## 用户偏好设置

斜杠命令会将本地覆盖写入 `prefsPath`（默认值：`~/.clawdbot/settings/tts.json`，可通过 `CLAWDBOT_TTS_PREFS` 或 `messages.tts.prefsPath` 覆盖）。

存储的字段包括：
- `enabled`
- `provider`
- `maxLength`（摘要阈值；默认 1500 个字符）
- `summarize`（默认为 `true`）

这些设置会覆盖该主机的 `messages.tts.*`。

## 输出格式（固定）

- **Telegram**：Opus 语音消息（来自 ElevenLabs 的 `opus_48000_64`，来自 OpenAI 的 `opus`）。
  - 48kHz / 64kbps 是一个良好的语音消息折中方案，并且是圆 bubble 所需的。
- **其他频道**：MP3（来自 ElevenLabs 的 `mp3_44100_128`，来自 OpenAI 的 `mp3`）。
  - 44.1kHz / 128kbps 是语音清晰度的默认平衡。
- **Edge TTS**：使用 `edge.outputFormat`（默认为 `audio-24khz-48kbitrate-mono-mp3`）。
  - `node-edge-tts` 接受一个 `outputFormat`，但并非所有格式都能从 Edge 服务中获得。citeturn2search0
  - 输出格式的值遵循 Microsoft Speech 的输出格式（包括 Ogg/WebM Opus）。citeturn1search0
  - Telegram 的 `sendVoice` 支持 OGG/MP3/M4A；如果需要保证 Opus 语音消息，请使用 OpenAI/ElevenLabs。citeturn1search1
  - 如果配置的 Edge 输出格式失败，Clawdbot 会尝试使用 MP3。

OpenAI/ElevenLabs 的格式是固定的；Telegram 期望 Opus 以获得语音消息的用户体验。

## 自动 TTS 行为

当启用时，Clawdbot：
- 如果回复中已包含媒体或有 `MEDIA:` 指令，则跳过 TTS。
- 跳过非常短的回复（少于 10 个字符）。
- 当启用摘要功能时，使用 `agents.defaults.model.primary`（或 `summaryModel`）对长回复进行摘要。
- 将生成的音频附加到回复中。

如果回复超过 `maxLength` 且摘要功能关闭（或没有摘要模型的 API 密钥），则跳过音频并发送正常的文本回复。```
Reply -> TTS enabled?
  no  -> send text
  yes -> has media / MEDIA: / short?
          yes -> send text
          no  -> length > limit?
                   no  -> TTS -> attach audio
                   yes -> summary enabled?
                            no  -> send text
                            yes -> summarize (summaryModel or agents.defaults.model.primary)
                                      -> TTS -> attach audio
```
## 斜杠命令用法

只有一个命令：`/tts`。
有关启用详情，请参见 [斜杠命令](/tools/slash-commands)。

Discord 注意：`/tts` 是 Discord 内置的斜杠命令，因此 Clawdbot 在那里注册了 `/voice` 作为原生命令。`/tts ...` 的文本命令仍然有效。```
/tts off
/tts always
/tts inbound
/tts tagged
/tts status
/tts provider openai
/tts limit 2000
/tts summary off
/tts audio Hello from Clawdbot
```
注意事项：
- 命令需要经过授权的发送者（仍然适用允许列表/所有者规则）。
- 需要启用 `commands.text` 或原生命令注册。
- `off|always|inbound|tagged` 是会话级别的开关（`/tts on` 是 `/tts always` 的别名）。
- `limit` 和 `summary` 存储在本地偏好设置中，而不是主配置文件中。
- `/tts audio` 会生成一个一次性音频回复（不会切换 TTS 状态）。

## Agent 工具

`tts` 工具将文本转换为语音，并返回 `MEDIA:` 路径。当结果与 Telegram 兼容时，该工具会包含 `[[audio_as_voice]]`，以便 Telegram 发送语音气泡。

## 网关 RPC

网关方法：
- `tts.status`
- `tts.enable`
- `tts.disable`
- `tts.convert`
- `tts.setProvider`
- `tts.providers`