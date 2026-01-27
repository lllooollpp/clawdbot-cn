---
summary: "Voice Call plugin: outbound + inbound calls via Twilio/Telnyx/Plivo (plugin install + config + CLI)"
read_when:
  - You want to place an outbound voice call from Clawdbot
  - You are configuring or developing the voice-call plugin
---

# 语音通话（插件）

通过插件实现 Clawdbot 的语音通话功能。支持外呼通知和带有入站策略的多轮对话。

当前支持的提供商：
- `twilio`（Programmable Voice + Media Streams）
- `telnyx`（Call Control v2）
- `plivo`（Voice API + XML 转移 + GetInput 语音）
- `mock`（开发/无网络）

快速理解模型：
- 安装插件
- 重启网关
- 在 `plugins.entries.voice-call.config` 下进行配置
- 使用 `clawdbot voicecall ...` 或 `voice_call` 工具

## 插件运行位置（本地 vs 远程）

语音通话插件运行在 **网关进程内部**。

如果你使用的是远程网关，请在 **运行网关的机器上** 安装和配置插件，然后重启网关以加载它。
bash
clawdbot plugins install @clawdbot/voice-call
``````
重启网关后继续操作。

### 选项 B：从本地文件夹安装（开发模式，无需复制）```bash
clawdbot plugins install ./extensions/voice-call
cd ./extensions/voice-call && pnpm install
```
重启网关。

## 配置

在 `plugins.entries.voice-call.config` 下设置配置：
json5
{
  plugins: {
    entries: {
      "voice-call": {
        enabled: true,
        config: {
          provider: "twilio", // 或 "telnyx" | "plivo" | "mock"
          fromNumber: "+15550001234",
          toNumber: "+15550005678",

          twilio: {
            accountSid: "ACxxxxxxxx",
            authToken: "..."
          },

          plivo: {
            authId: "MAxxxxxxxxxxxxxxxxxxxx",
            authToken: "..."
          },

          // Webhook 服务器
          serve: {
            port: 3334,
            path: "/voice/webhook"
          },

          // 公网暴露（选择一种）
          // publicUrl: "https://example.ngrok.app/voice/webhook",
          // tunnel: { provider: "ngrok" },
          // tailscale: { mode: "funnel", path: "/voice/webhook" }

          outbound: {
            defaultMode: "notify" // notify | conversation
          },

          streaming: {
            enabled: true,
            streamPath: "/voice/stream"
          }
        }
      }
    }
  }
}
``````
注意事项：
- Twilio/Telnyx 需要一个 **可公开访问的** Webhook URL。
- Plivo 需要一个 **可公开访问的** Webhook URL。
- `mock` 是一个本地开发用的提供者（不进行网络调用）。
- `skipSignatureVerification` 仅用于本地测试。

## 通话中的 TTS

语音通话使用核心的 `messages.tts` 配置（OpenAI 或 ElevenLabs）来实现通话中的语音流。你可以在插件配置中覆盖它，使用的是 **相同的结构** —— 它会与 `messages.tts` 进行深度合并。```json5
{
  tts: {
    provider: "elevenlabs",
    elevenlabs: {
      voiceId: "pMsXgVXv3BLzUgSXRplE",
      modelId: "eleven_multilingual_v2"
    }
  }
}
```
注意事项：
- **Edge TTS 在语音通话中被忽略**（电话音频需要 PCM 格式；Edge 的输出不可靠）。
- 当启用 Twilio 媒体流时使用 Core TTS；否则通话将回退到供应商的原生语音。
json5
{
  messages: {
    tts: {
      provider: "openai",
      openai: { voice: "alloy" }
    }
  }
}
``````
覆盖到 ElevenLabs 仅用于通话（其他地方保持核心默认）：```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          tts: {
            provider: "elevenlabs",
            elevenlabs: {
              apiKey: "elevenlabs_key",
              voiceId: "pMsXgVXv3BLzUgSXRplE",
              modelId: "eleven_multilingual_v2"
            }
          }
        }
      }
    }
  }
}
```
仅覆盖调用中的 OpenAI 模型（深度合并示例）：
json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          tts: {
            openai: {
              model: "gpt-4o-mini-tts",
              voice: "marin"
            }
          }
        }
      }
    }
  }
}
``````
## 入站呼叫

入站策略默认设置为 `已禁用`。要启用入站呼叫，请设置：```json5
{
  inboundPolicy: "allowlist",
  allowFrom: ["+15550001234"],
  inboundGreeting: "Hello! How can I help?"
}
```
"自动回复使用代理系统。通过以下参数进行调整：
- `responseModel`
- `responseSystemPrompt`
- `responseTimeoutMs`

## 命令行界面
bash
clawdbot voicecall call --to "+15555550123" --message "Hello from Clawdbot"
clawdbot voicecall continue --call-id <id> --message "Any questions?"
clawdbot voicecall speak --call-id <id> --message "One moment"
clawdbot voicecall end --call-id <id>
clawdbot voicecall status --call-id <id>
clawdbot voicecall tail
clawdbot voicecall expose --mode funnel
```"```
## Agent 工具

工具名称: `voice_call`

操作:
- `initiate_call` (message, to?, mode?)
- `continue_call` (callId, message)
- `speak_to_user` (callId, message)
- `end_call` (callId)
- `get_status` (callId)

此仓库在 `skills/voice-call/SKILL.md` 中附带了一个对应的技能文档。

## 网关 RPC

- `voicecall.initiate` (`to?`, `message`, `mode?`)
- `voicecall.continue` (`callId`, `message`)
- `voicecall.speak` (`callId`, `message`)
- `voicecall.end` (`callId`)
- `voicecall.status` (`callId`)