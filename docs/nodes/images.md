---
summary: "Image and media handling rules for send, gateway, and agent replies"
read_when:
  - Modifying media pipeline or attachments
---

# 图片与媒体支持 — 2025-12-05

WhatsApp 通道通过 **Baileys Web** 运行。本文档记录了当前通过发送、网关和代理回复处理媒体的规则。

## 目标
- 通过 `clawdbot message send --media` 发送带可选标题的媒体。
- 允许从网页收件箱自动回复时包含媒体和文本。
- 保持每种类型的限制合理且可预测。

## CLI 界面
- `clawdbot message send --media <路径或URL> [--message <标题>]`
  - `--media` 是可选的；可以为空标题进行纯媒体发送。
  - `--dry-run` 打印解析后的有效负载；`--json` 输出 `{ channel, to, messageId, mediaUrl, caption }`。

## WhatsApp Web 通道行为
- 输入：本地文件路径 **或** HTTP(S) URL。
- 流程：加载到 Buffer，检测媒体类型，并构建正确的有效负载：
  - **图片**：调整大小并重新压缩为 JPEG（最大边长 2048 像素），目标大小为 `agents.defaults.mediaMaxMb`（默认 5 MB），上限为 6 MB。
  - **音频/语音/视频**：直接传输，最大 16 MB；音频作为语音备忘录发送（`ptt: true`）。
  - **文档**：其他任何内容，最大 100 MB，如果有可用文件名则保留。
- WhatsApp GIF 风格播放：发送一个带有 `gifPlayback: true` 的 MP4（CLI：`--gif-playback`），以便移动客户端内联循环播放。
- MIME 类型检测优先使用魔数字节，然后是 headers，最后是文件扩展名。
- 标题来自 `--message` 或 `reply.text`；允许空标题。
- 日志：非 verbose 模式显示 `↩️`/`✅`；verbose 模式显示大小和源路径/URL。

## 自动回复流程
- `getReplyFromConfig` 返回 `{ text?, mediaUrl?, mediaUrls? }`。
- 当存在媒体时，网页发送器使用与 `clawdbot message send` 相同的流程来解析本地路径或 URL。
- 如果提供多个媒体条目，则按顺序发送。

## 入站媒体到命令（Pi）
- 当入站网页消息包含媒体时，Clawdbot 会将其下载到临时文件，并暴露模板变量：
  - `{{MediaUrl}}`：入站媒体的伪 URL。
  - `{{MediaPath}}`：在运行命令之前写入的本地临时路径。
- 当启用 per-session Docker 沙箱时，入站媒体会被复制到沙箱工作区，并将 `MediaPath`/`MediaUrl` 重写为相对路径，如 `media/inbound/<文件名>`。
- 媒体理解（如果通过 `tools.media.*` 或共享的 `tools.media.models` 配置）会在模板处理之前运行，并在 `Body` 中插入 `[Image]`、`[Audio]` 和 `[Video]` 块。
  - 音频设置 `{{Transcript}}`，并使用该音频转录用于命令解析，因此斜杠命令仍然有效。
  - 视频和图片描述保留任何标题文本以用于命令解析。
- 默认情况下仅处理第一个匹配的图片/音频/视频附件；设置 `tools.media.<cap>.attachments` 可处理多个附件。

## 限制与错误
**出站发送限制（WhatsApp Web 发送）**
- 图片：重新压缩后约 6 MB 的上限。
- 音频/语音/视频：16 MB 的上限；文档：100 MB 的上限。
- 超大或无法读取的媒体 → 在日志中显示明确错误，并跳过回复。

**媒体理解限制（转录/描述）**
- 图片默认限制：10 MB (`tools.media.image.maxBytes`)。
- 音频默认限制：20 MB (`tools.media.audio.maxBytes`)。
- 视频默认限制：50 MB (`tools.media.video.maxBytes`)。
- 超大媒体将跳过理解处理，但回复仍会以原始内容发送。

## 测试注意事项
- 覆盖图片/音频/文档的发送与回复流程。
- 验证图片的重新压缩（大小限制）和音频的语音备忘录标志。
- 确保多媒体回复按顺序发送。