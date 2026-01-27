---
summary: "Inbound image/audio/video understanding (optional) with provider + CLI fallbacks"
read_when:
  - Designing or refactoring media understanding
  - Tuning inbound audio/video/image preprocessing
---

# 媒体理解（入站）— 2026-01-17

Clawdbot 可以在回复流程运行前 **对入站媒体**（图片/音频/视频）进行 **摘要处理**。它会自动检测本地工具或提供者密钥是否可用，并且可以被禁用或自定义。如果理解功能关闭，模型仍然会像往常一样接收到原始文件/URL。

## 目标
- 可选：将入站媒体预先摘要为简短文本，以加快路由和更好的命令解析。
- 保留原始媒体传递给模型（始终）。
- 支持 **提供者 API** 和 **CLI 回退**。
- 允许多个模型并按顺序回退（错误/大小/超时）。

## 高级行为
1) 收集入站附件（`MediaPaths`、`MediaUrls`、`MediaTypes`）。
2) 对于每个启用的功能（图片/音频/视频），根据策略选择附件（默认：**第一个**）。
3) 选择第一个符合条件的模型条目（大小 + 功能 + 认证）。
4) 如果模型失败或媒体太大，**回退到下一个条目**。
5) 成功时：
   - `Body` 变为 `[Image]`、`[Audio]` 或 `[Video]` 块。
   - 音频设置 `{{Transcript}}`；当存在字幕时，命令解析使用字幕文本，否则使用转录文本。
   - 字幕作为 `User text:` 保留在块内。

如果理解失败或被禁用，**回复流程将继续**，使用原始正文 + 附件。

## 配置概览
`tools.media` 支持 **共享模型** 以及按功能覆盖的配置：
- `tools.media.models`: 共享模型列表（使用 `capabilities` 进行权限控制）。
- `tools.media.image` / `tools.media.audio` / `tools.media.video`:
  - 默认值（`prompt`、`maxChars`、`maxBytes`、`timeoutSeconds`、`language`）
  - 提供者覆盖（`baseUrl`、`headers`、`providerOptions`）
  - Deepgram 音频选项通过 `tools.media.audio.providerOptions.deepgram` 设置
  - 可选的 **按功能的 `models` 列表**（优先于共享模型）
  - `attachments` 策略（`mode`、`maxAttachments`、`prefer`）
  - `scope`（按 channel/chatType/session key 进行可选的权限控制）
- `tools.media.concurrency`: 最大并发功能运行数（默认 **2**）。
json5
{
  tools: {
    media: {
      models: [ /* 共享列表 */ ],
      image: { /* 可选覆盖 */ },
      audio: { /* 可选覆盖 */ },
      video: { /* 可选覆盖 */ }
    }
  }
}
``````
### Model entries
每个 `models[]` 条目可以是 **provider** 或 **CLI**：```json5
{
  type: "provider",        // default if omitted
  provider: "openai",
  model: "gpt-5.2",
  prompt: "Describe the image in <= 500 chars.",
  maxChars: 500,
  maxBytes: 10485760,
  timeoutSeconds: 60,
  capabilities: ["image"], // optional, used for multi‑modal entries
  profile: "vision-profile",
  preferredProfile: "vision-fallback"
}
```
{
  type: "cli",
  command: "gemini",
  args: [
    "-m",
    "gemini-3-flash",
    "--allowed-tools",
    "read_file",
    "读取 {{MediaPath}} 中的媒体内容，并用不超过 {{MaxChars}} 个字符进行描述。"
  ],
  maxChars: 500,
  maxBytes: 52428800,
  timeoutSeconds: 120,
  capabilities: ["video", "image"]
}```
CLI 模板也可以使用：
- `{{MediaDir}}`（包含媒体文件的目录）
- `{{OutputDir}}`（此次运行创建的临时目录）
- `{{OutputBase}}`（临时文件的基本路径，不带扩展名）

## 默认值和限制
推荐的默认值：
- `maxChars`: **500**（适用于图像/视频，较短，适合命令行）
- `maxChars`: **未设置**（适用于音频，除非设置限制，否则使用完整转录文本）
- `maxBytes`:
  - 图像：**10MB**
  - 音频：**20MB**
  - 视频：**50MB**

规则：
- 如果媒体文件超过 `maxBytes`，则跳过该模型，并**尝试下一个模型**。
- 如果模型返回的内容超过 `maxChars`，则会进行截断。
- `prompt` 默认为简单的“Describe the {media}.”，加上 `maxChars` 的指导（仅适用于图像/视频）。
- 如果 `<capability>.enabled: true` 但未配置模型，当其提供方支持该功能时，Clawdbot 会尝试使用**当前回复模型**。

### 自动检测媒体理解（默认开启）
如果 `tools.media.<capability>.enabled` **未设置为 false** 且你**未配置模型**，Clawdbot 将按以下顺序**自动检测并停止在第一个可用选项**：

1) **本地 CLI**（仅音频；如果已安装）
   - `sherpa-onnx-offline`（需要 `SHERPA_ONNX_MODEL_DIR` 包含 encoder/decoder/joiner/tokens）
   - `whisper-cli`（`whisper-cpp`；使用 `WHISPER_CPP_MODEL` 或内置的 tiny 模型）
   - `whisper`（Python CLI；自动下载模型）
2) **Gemini CLI**（`gemini`）使用 `read_many_files`
3) **提供方密钥**
   - 音频：OpenAI → Groq → Deepgram → Google
   - 图像：OpenAI → Anthropic → Google → MiniMax
   - 视频：Google

要禁用自动检测，请设置：```json5
{
  tools: {
    media: {
      audio: {
        enabled: false
      }
    }
  }
}
```
注意：二进制检测在 macOS/Linux/Windows 上是尽力而为的；请确保 CLI 在 `PATH` 中（我们会展开 `~`），或者使用完整命令路径显式设置 CLI 模型。

## 功能（可选）
如果你设置了 `capabilities`，则该条目仅针对这些媒体类型运行。对于共享列表，Clawdbot 可以推断默认值：
- `openai`、`anthropic`、`minimax`：**图像**
- `google`（Gemini API）：**图像 + 音频 + 视频**
- `groq`：**音频**
- `deepgram`：**音频**

对于 CLI 条目，**请显式设置 `capabilities`** 以避免意外匹配。
如果省略 `capabilities`，则该条目适用于它所在的列表。

## 提供商支持矩阵（Clawdbot 集成）
| 功能 | 提供商集成 | 说明 |
|------------|----------------------|-------|
| 图像 | OpenAI / Anthropic / Google / 其他通过 `pi-ai` 的提供者 | 注册表中任何具备图像能力的模型都可以使用。 |
| 音频 | OpenAI、Groq、Deepgram、Google | 提供商转录（Whisper/Deepgram/Gemini）。 |
| 视频 | Google（Gemini API） | 提供商视频理解。 |

## 推荐的提供者
**图像**
- 如果你的活跃模型支持图像，请优先使用它。
- 良好的默认值：`openai/gpt-5.2`、`anthropic/claude-opus-4-5`、`google/gemini-3-pro-preview`。

**音频**
- `openai/gpt-4o-mini-transcribe`、`groq/whisper-large-v3-turbo` 或 `deepgram/nova-3`。
- CLI 回退选项：`whisper-cli`（whisper-cpp）或 `whisper`。
- Deepgram 设置：[Deepgram（音频转录）](/providers/deepgram)。

**视频**
- `google/gemini-3-flash-preview`（快速）、`google/gemini-3-pro-preview`（更丰富）。
- CLI 回退选项：`gemini` CLI（支持视频/音频的 `read_file`）。

## 附件策略
每个功能的 `attachments` 控制哪些附件会被处理：
- `mode`: `first`（默认）或 `all`
- `maxAttachments`: 限制处理的附件数量（默认 **1**）
- `prefer`: `first`、`last`、`path`、`url`

当 `mode: "all"` 时，输出会被标记为 `[Image 1/2]`、`[Audio 2/2]` 等。

## 配置示例

### 1) 共享模型列表 + 覆盖
json5
{
  tools: {
    media: {
      models: [
        { provider: "openai", model: "gpt-5.2", capabilities: ["image"] },
        { provider: "google", model: "gemini-3-flash-preview", capabilities: ["image", "audio", "video"] },
        {
          type: "cli",
          command: "gemini",
          args: [
            "-m",
            "gemini-3-flash",
            "--allowed-tools",
            "read_file",
            "Read the media at {{MediaPath}} and describe it in <= {{MaxChars}} characters."
          ],
          capabilities: ["image", "video"]
        }
      ],
      audio: {
        attachments: { mode: "all", maxAttachments: 2 }
      },
      video: {
        maxChars: 500
      }
    }
  }
}
``````
### 2) 仅音频+视频（关闭图像）```json5
{
  tools: {
    media: {
      audio: {
        enabled: true,
        models: [
          { provider: "openai", model: "gpt-4o-mini-transcribe" },
          {
            type: "cli",
            command: "whisper",
            args: ["--model", "base", "{{MediaPath}}"]
          }
        ]
      },
      video: {
        enabled: true,
        maxChars: 500,
        models: [
          { provider: "google", model: "gemini-3-flash-preview" },
          {
            type: "cli",
            command: "gemini",
            args: [
              "-m",
              "gemini-3-flash",
              "--allowed-tools",
              "read_file",
              "Read the media at {{MediaPath}} and describe it in <= {{MaxChars}} characters."
            ]
          }
        ]
      }
    }
  }
}
```
### 3) 可选的图像理解
json5
{
  tools: {
    media: {
      image: {
        enabled: true,
        maxBytes: 10485760,
        maxChars: 500,
        models: [
          { provider: "openai", model: "gpt-5.2" },
          { provider: "anthropic", model: "claude-opus-4-5" },
          {
            type: "cli",
            command: "gemini",
            args: [
              "-m",
              "gemini-3-flash",
              "--allowed-tools",
              "read_file",
              "读取 {{MediaPath}} 中的媒体并用不超过 {{MaxChars}} 个字符进行描述。"
            ]
          }
        ]
      }
    }
  }
}
``````
### 4) 多模态单入口（显式能力）```json5
{
  tools: {
    media: {
      image: { models: [{ provider: "google", model: "gemini-3-pro-preview", capabilities: ["image", "video", "audio"] }] },
      audio: { models: [{ provider: "google", model: "gemini-3-pro-preview", capabilities: ["image", "video", "audio"] }] },
      video: { models: [{ provider: "google", model: "gemini-3-pro-preview", capabilities: ["image", "video", "audio"] }] }
    }
  }
}
```
## 状态输出
当媒体理解运行时，`/status` 包含一行简要的摘要：

"

📎 媒体：图片正常 (openai/gpt-5.2) · 音频跳过 (最大字节数)
```"这显示了每个功能模块的结果以及在适用时选择的提供者/模型。

## 注意事项
- 理解功能为 **尽力而为**。出现错误不会阻止回复。
- 即使理解功能被禁用，附件仍然会传递给模型。
- 使用 `scope` 来限制理解功能运行的范围（例如，仅限私信）。

## 相关文档
- [配置](/gateway/configuration)
- [图像与媒体支持](/nodes/images)