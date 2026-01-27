---
summary: "Talk mode: continuous speech conversations with ElevenLabs TTS"
read_when:
  - Implementing Talk mode on macOS/iOS/Android
  - Changing voice/TTS/interrupt behavior
---

# 交谈模式

交谈模式是一种持续的语音对话循环：
1) 听取语音
2) 将转录文本发送给模型（主会话，chat.send）
3) 等待响应
4) 通过ElevenLabs进行流式播放

## 行为（macOS）
- **始终显示的图层**：当开启交谈模式时始终显示。
- **听→思考→说**的阶段转换。
- 在**短暂停顿**（静音窗口）时，发送当前转录文本。
- 回复内容会**写入WebChat**（与手动输入相同）。
- **语音中断功能**（默认开启）：如果用户在助手说话时开始说话，我们会停止播放，并记录中断时间戳以供下一次提示使用。

## 回复中的语音指令
助手可能在其回复前加上一个**单独的JSON行**来控制语音：
json
"``````json
{"voice":"<voice-id>","once":true}
```
规则：
- 仅处理第一行非空内容。
- 未知的键会被忽略。
- `once: true` 仅对当前回复生效。
- 如果没有 `once`，则语音会成为“Talk模式”的新默认设置。
- 在TTS播放前，JSON行会被去除前后空格。

支持的键：
- `voice` / `voice_id` / `voiceId`
- `model` / `model_id` / `modelId`
- `speed`, `rate`（WPM），`stability`, `similarity`, `style`, `speakerBoost`
- `seed`, `normalize`, `lang`, `output_format`, `latency_tier`
- `once`

## 配置文件 (`~/.clawdbot/clawdbot.json`)
json5
{
  "talk": {
    "voiceId": "elevenlabs_voice_id",
    "modelId": "eleven_v3",
    "outputFormat": "mp3_44100_128",
    "apiKey": "elevenlabs_api_key",
    "interruptOnSpeech": true
  }
}
``````
默认值：
- `interruptOnSpeech`: true
- `voiceId`: 回退到 `ELEVENLABS_VOICE_ID` / `SAG_VOICE_ID`（或当 API 密钥可用时使用第一个 ElevenLabs 语音）
- `modelId`: 未设置时默认为 `eleven_v3`
- `apiKey`: 回退到 `ELEVENLABS_API_KEY`（或如果可用则使用网关 shell 配置文件）
- `outputFormat`: 在 macOS/iOS 上默认为 `pcm_44100`，在 Android 上默认为 `pcm_24000`（设置为 `mp3_*` 可强制使用 MP3 流式传输）

## macOS 界面
- 菜单栏切换按钮：**Talk**
- 配置标签页：**Talk Mode** 组（语音 ID + 中断切换）
- 覆盖层：
  - **Listening**：云朵脉冲显示麦克风音量
  - **Thinking**：下沉动画
  - **Speaking**：辐射环动画
  - 点击云朵：停止说话
  - 点击 X：退出 Talk 模式

## 注意事项
- 需要 Speech 和 Microphone 权限。
- 使用 `chat.send` 对 session key `main` 进行操作。
- TTS 使用 ElevenLabs 流式 API，并在 macOS/iOS/Android 上使用增量播放以降低延迟。
- `eleven_v3` 的 `stability` 有效值为 `0.0`、`0.5` 或 `1.0`；其他模型接受 `0..1`。
- 当设置 `latency_tier` 时，其有效值为 `0..4`。
- Android 支持 `pcm_16000`、`pcm_22050`、`pcm_24000` 和 `pcm_44100` 的输出格式，用于低延迟的 AudioTrack 流式传输。