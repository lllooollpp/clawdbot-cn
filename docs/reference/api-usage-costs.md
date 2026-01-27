---
summary: "Audit what can spend money, which keys are used, and how to view usage"
read_when:
  - You want to understand which features may call paid APIs
  - You need to audit keys, costs, and usage visibility
  - You’re explaining /status or /usage cost reporting
---

# API 使用与费用

本文档列出了**可以调用 API 密钥的功能**，以及它们的费用显示位置。本文档重点介绍 Clawdbot 中可能产生服务使用量或付费 API 调用的功能。

## 费用显示位置（聊天 + CLI）

**会话费用快照**
- `/status` 显示当前会话使用的模型、上下文使用量和最后回复的 token 数量。
- 如果模型使用 **API 密钥认证**，`/status` 还会显示 **上次回复的预估费用**。

**每条消息的费用页脚**
- `/usage full` 会在每条回复后添加一个使用页脚，包括 **预估费用**（仅限 API 密钥）。
- `/usage tokens` 仅显示 token 数量；OAuth 流程会隐藏美元费用。

**CLI 使用窗口（服务配额）**
- `clawdbot status --usage` 和 `clawdbot channels list` 显示服务提供者的 **使用窗口**（配额快照，不是每条消息的费用）。

有关详细信息和示例，请参阅 [Token 使用与费用](/token-use)。

## 如何发现密钥

Clawdbot 可以从以下位置获取凭证：
- **认证配置文件**（每个代理单独配置，存储在 `auth-profiles.json` 中）。
- **环境变量**（例如 `OPENAI_API_KEY`、`BRAVE_API_KEY`、`FIRECRAWL_API_KEY`）。
- **配置项**（`models.providers.*.apiKey`、`tools.web.search.*`、`tools.web.fetch.firecrawl.*`、`memorySearch.*`、`talk.apiKey`）。
- **技能**（`skills.entries.<name>.apiKey`），这些技能可能会将密钥导出到技能进程的环境变量中。

## 可能消耗密钥的功能

### 1) 核心模型回复（聊天 + 工具）
每次回复或工具调用都会使用 **当前模型提供者**（如 OpenAI、Anthropic 等）。这是主要的使用和费用来源。

有关定价配置，请参阅 [模型](/providers/models)，有关显示信息请参阅 [Token 使用与费用](/token-use)。

### 2) 媒体理解（音频/图像/视频）
传入的媒体可以在回复前被总结/转录。这会使用模型/服务提供者的 API。

- 音频：OpenAI / Groq / Deepgram（当存在密钥时会**自动启用**）。
- 图像：OpenAI / Anthropic / Google。
- 视频：Google。

有关更多信息，请参阅 [媒体理解](/nodes/media-understanding)。

### 3) 内存嵌入 + 语义搜索
当配置为远程服务提供者时，语义内存搜索会使用 **嵌入 API**：
- `memorySearch.provider = "openai"` → OpenAI 嵌入
- `memorySearch.provider = "gemini"` → Gemini 嵌入
- 如果本地嵌入失败，可选择性地回退到 OpenAI

你可以通过设置 `memorySearch.provider = "local"` 来保持本地使用（不使用 API）。

有关更多信息，请参阅 [内存](/concepts/memory)。

### 4) 网络搜索工具（Brave / Perplexity 通过 OpenRouter）
`web_search` 会使用 API 密钥，可能会产生使用费用：

- **Brave 搜索 API**：`BRAVE_API_KEY` 或 `tools.web.search.apiKey`
- **Perplexity**（通过 OpenRouter）：`PERPLEXITY_API_KEY` 或 `OPENROUTER_API_KEY`

**Brave 免费套餐（较为慷慨）：**
- **每月 2000 次请求**
- **每秒 1 次请求**
- 需要提供信用卡用于验证（除非你升级，否则不会收费）

有关更多信息，请参阅 [网络工具](/tools/web)。

### 5) 网络抓取工具（Firecrawl）
当存在 API 密钥时，`web_fetch` 可以调用 **Firecrawl**：
- `FIRECRAWL_API_KEY` 或 `tools.web.fetch.firecrawl.apiKey`

如果未配置 Firecrawl，该工具将回退到直接获取 + readability（不使用付费 API）。

参见 [Web 工具](/tools/web)。

### 6) 提供者使用快照（状态/健康状况）
某些状态命令会调用 **提供者使用端点** 以显示配额窗口或认证健康状态。
这些通常是低频调用，但仍会调用提供者 API：
- `clawdbot status --usage`
- `clawdbot models status --json`

参见 [模型 CLI](/cli/models)。

### 7) 压缩保护摘要
压缩保护可以使用 **当前模型** 对会话历史进行摘要，当运行时会调用提供者 API。

参见 [会话管理 + 压缩](/reference/session-management-compaction)。

### 8) 模型扫描 / 探测
`clawdbot models scan` 可以探测 OpenRouter 模型，并在探测启用时使用 `OPENROUTER_API_KEY`。

参见 [模型 CLI](/cli/models)。

### 9) 语音对话（Talk 模式）
Talk 模式在配置后可以调用 **ElevenLabs**：
- `ELEVENLABS_API_KEY` 或 `talk.apiKey`

参见 [Talk 模式](/nodes/talk)。

### 10) 技能（第三方 API）
技能可以将 `apiKey` 存储在 `skills.entries.<name>.apiKey` 中。如果某个技能使用该密钥调用外部 API，可能会产生根据该技能提供者计费的费用。

参见 [技能](/tools/skills)。