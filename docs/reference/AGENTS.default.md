---
summary: "Default Clawdbot agent instructions and skills roster for the personal assistant setup"
read_when:
  - Starting a new Clawdbot agent session
  - Enabling or auditing default skills
---

# AGENTS.md — Clawdbot 个人助手（默认）

## 首次运行（推荐）

Clawdbot 为代理使用一个专用的工作空间目录。默认值：`~/clawd`（可通过 `agents.defaults.workspace` 配置）。

1) 如果尚不存在，请创建工作空间：
bash
mkdir -p ~/clawd
``````
2) 将默认的工作区模板复制到工作区中：```bash
cp docs/reference/templates/AGENTS.md ~/clawd/AGENTS.md
cp docs/reference/templates/SOUL.md ~/clawd/SOUL.md
cp docs/reference/templates/TOOLS.md ~/clawd/TOOLS.md
```
"3) 可选：如果您想要个人助手技能清单，请用此文件替换 AGENTS.md：
bash
cp docs/reference/AGENTS.default.md ~/clawd/AGENTS.md
"```
4) 可选：通过设置 `agents.defaults.workspace` 选择不同的工作区（支持 `~`）：```json5
{
  agents: { defaults: { workspace: "~/clawd" } }
}
```
## 安全默认设置
- 不要将目录或秘密信息放入聊天中。
- 除非明确要求，否则不要运行破坏性命令。
- 不要向外部消息界面发送部分或流式回复（只发送最终回复）。

## 会话开始（必需）
- 在回复之前，请先阅读 `SOUL.md`、`USER.md`、`memory.md` 以及 `memory/` 中的今天和昨天的文件。

## 灵魂（必需）
- `SOUL.md` 定义了身份、语气和界限。请保持其最新。
- 如果你更改了 `SOUL.md`，请告知用户。
- 每个会话都是一个全新的实例；连续性由这些文件来维持。

## 共享空间（推荐）
- 你不是用户的代言人；在群组聊天或公共频道中要格外小心。
- 不要分享私人数据、联系方式或内部笔记。

## 记忆系统（推荐）
- 每日日志：`memory/YYYY-MM-DD.md`（如需请创建 `memory/` 目录）。
- 长期记忆：使用 `memory.md` 来记录持久的事实、偏好和决定。
- 在会话开始时，请先阅读今天、昨天以及如果存在的话 `memory.md`。
- 记录：决策、偏好、限制、未完成的事项。
- 避免分享秘密，除非用户明确要求。

## 工具与技能
- 工具位于技能中；当需要使用时，请遵循每个技能的 `SKILL.md`。
- 将环境相关的笔记保存在 `TOOLS.md` 中（技能说明）。

## 备份提示（推荐）
如果你将此工作区视为 Clawd 的“记忆”，请将其设为 git 仓库（最好是私有的），以便 `AGENTS.md` 和你的记忆文件能够被备份。
bash
cd ~/clawd
git init
git add AGENTS.md
git commit -m "Add Clawd workspace"
# Optional: add a private remote + push
``````
## Clawdbot 的功能
- 运行 WhatsApp 网关 + Pi 编码代理，使助手能够读取/写入聊天、获取上下文并通过主机 Mac 运行技能。
- macOS 应用程序管理权限（屏幕录制、通知、麦克风），并通过其捆绑的二进制文件暴露 `clawdbot` CLI。
- 默认情况下，直接聊天会合并到代理的 `main` 会话中；群组则保持隔离，格式为 `agent:<agentId>:<channel>:group:<id>`（房间/频道：`agent:<agentId>:<channel>:channel:<id>`）；心跳保持后台任务运行。

## 核心技能（在“设置 → 技能”中启用）
- **mcporter** — 用于管理外部技能后端的工具服务器运行时/CLI。
- **Peekaboo** — 快速截屏功能，支持可选的 AI 视觉分析。
- **camsnap** — 从 RTSP/ONVIF 安全摄像头捕获帧、视频片段或运动警报。
- **oracle** — 与 OpenAI 兼容的代理 CLI，支持会话回放和浏览器控制。
- **eightctl** — 从终端控制你的睡眠。
- **imsg** — 发送、阅读、流式传输 iMessage 和短信。
- **wacli** — WhatsApp 命令行工具：同步、搜索、发送。
- **discord** — Discord 操作：反应、表情包、投票。使用 `user:<id>` 或 `channel:<id>` 作为目标（纯数字 ID 可能存在歧义）。
- **gog** — Google 套件命令行工具：Gmail、日历、Drive、联系人。
- **spotify-player** — 终端版 Spotify 客户端，用于搜索、排队和控制播放。
- **sag** — ElevenLabs 语音，采用 macOS 风格的 say 用户体验；默认流式传输到扬声器。
- **Sonos CLI** — 从脚本控制 Sonos 扬声器（发现/状态/播放/音量/分组）。
- **blucli** — 从脚本控制、分组和自动化 BluOS 播放器。
- **OpenHue CLI** — Philips Hue 照明控制，用于场景和自动化。
- **OpenAI Whisper** — 本地语音转文字，用于快速语音输入和语音邮件转录。
- **Gemini CLI** — 从终端使用 Google Gemini 模型进行快速问答。
- **bird** — X/Twitter 命令行工具，用于发推、回复、阅读话题和搜索，无需浏览器。
- **agent-tools** — 用于自动化和辅助脚本的实用工具包。

## 使用注意事项
- 优先使用 `clawdbot` CLI 进行脚本编写；macOS 应用程序负责处理权限。
- 从“技能”标签页运行安装；如果已存在二进制文件，该按钮会隐藏。
- 保持心跳功能开启，以便助手可以安排提醒、监控收件箱并触发摄像头捕获。
- Canvas 界面全屏运行并带有原生覆盖层。避免在左上角、右上角或底部放置关键控件；在布局中添加显式边距，不要依赖安全区域插入。
- 对于浏览器驱动的验证，请使用 `clawdbot browser`（标签页/状态/截图）并配合 clawd 管理的 Chrome 配置文件。
- 对于 DOM 检查，请使用 `clawdbot browser eval|query|dom|snapshot`（当需要机器可读输出时使用 `--json`/`--out`）。
- 对于交互操作，请使用 `clawdbot browser click|type|hover|drag|select|upload|press|wait|navigate|back|evaluate|run`（`click`/`type` 需要快照引用；使用 `evaluate` 进行 CSS 选择器操作）。