---
summary: "Testing kit: unit/e2e/live suites, Docker runners, and what each test covers"
read_when:
  - Running tests locally or in CI
  - Adding regressions for model/provider bugs
  - Debugging gateway + agent behavior
---

# 测试

Clawdbot 有三个 Vitest 测试套件（单元/集成测试、端到端测试、实时测试）和一小套 Docker 运行器。

本文档是“我们如何测试”的指南：
- 每个套件涵盖的内容（以及它故意不涵盖的内容）
- 常见工作流的运行命令（本地、预推送、调试）
- 实时测试如何发现凭证并选择模型/提供者
- 如何为现实世界中的模型/提供者问题添加回归测试

## 快速入门

大多数情况下：
- 完整的 gate（推送前预期）：`pnpm lint && pnpm build && pnpm test`

当你修改测试或需要额外的信心时：
- 覆盖率 gate：`pnpm test:coverage`
- 端到端测试套件：`pnpm test:e2e`

当你调试真实的提供者/模型（需要真实凭证）时：
- 实时测试套件（模型 + 网关工具/镜像探测）：`pnpm test:live`

提示：当你只需要运行一个失败的测试用例时，建议通过下面描述的 allowlist 环境变量来缩小实时测试的范围。

## 测试套件（在哪里运行）

将这些套件视为“现实程度逐步提升”（同时也会增加不稳定性和成本）：

### 单元 / 集成测试（默认）

- 命令：`pnpm test`
- 配置：`vitest.config.ts`
- 文件：`src/**/*.test.ts`
- 范围：
  - 纯单元测试
  - 进程内集成测试（网关认证、路由、工具、解析、配置）
  - 已知错误的确定性回归测试
- 预期：
  - 在 CI 中运行
  - 不需要真实密钥
  - 应该快速且稳定

### 端到端测试（网关烟雾测试）

- 命令：`pnpm test:e2e`
- 配置：`vitest.e2e.config.ts`
- 文件：`src/**/*.e2e.test.ts`
- 范围：
  - 多实例网关的端到端行为
  - WebSocket/HTTP 接口、节点配对以及更复杂的网络操作
- 预期：
  - 在 CI 中运行（当流水线中启用时）
  - 不需要真实密钥
  - 比单元测试有更多的组件（可能更慢）

### 实时测试（真实提供者 + 真实模型）

- 命令：`pnpm test:live`
- 配置：`vitest.live.config.ts`
- 文件：`src/**/*.live.test.ts`
- 默认：通过 `pnpm test:live` 启用（设置 `CLAWDBOT_LIVE_TEST=1`）
- 范围：
  - “这个提供者/模型今天是否真的能用真实凭证运行？”
  - 捕获提供者格式变化、工具调用的异常、认证问题和速率限制行为
- 预期：
  - 由于真实网络、真实提供者策略、配额和故障，设计上并不稳定
  - 会花费金钱 / 使用速率限制
  - 建议运行缩小的子集而不是“全部”
  - 实时测试会加载 `~/.profile` 来获取缺失的 API 密钥
  - Anthropic 密钥轮换：设置 `CLAWDBOT_LIVE_ANTHROPIC_KEYS="sk-...,sk-..."`（或 `CLAWDBOT_LIVE_ANTHROPIC_KEY=sk-...`）或多个 `ANTHROPIC_API_KEY*` 变量；测试会在速率限制时重试

## 我应该运行哪个套件？

使用此决策表：
- 编辑逻辑/测试：运行 `pnpm test`（如果你做了很多修改，也可以运行 `pnpm test:coverage`）
- 修改网关网络/WS 协议/配对：添加 `pnpm test:e2e`
- 调试“我的机器人无法运行”/提供者特定的故障/工具调用：运行缩小范围的 `pnpm test:live`

"实时测试分为两个层次，以便我们能够隔离故障：
- “直接模型”告诉我们提供的模型是否可以使用给定的密钥进行回答。
- “网关烟雾测试”告诉我们该模型的完整网关+代理流程是否正常工作（包括会话、历史记录、工具、沙盒策略等）。

### 第一层：直接模型完成（无网关）

- 测试文件：`src/agents/models.profiles.live.test.ts`
- 目标：
  - 枚举已发现的模型
  - 使用 `getApiKeyForModel` 来选择你有凭证的模型
  - 为每个模型运行一个小的完成测试（必要时进行针对性回归测试）
- 如何启用：
  - `pnpm test:live`（或直接调用 Vitest 时使用 `CLAWDBOT_LIVE_TEST=1`）
- 设置 `CLAWDBOT_LIVE_MODELS=modern`（或 `all`，modern 的别名）以实际运行此套件；否则会跳过，以保持 `pnpm test:live` 的重点在网关烟雾测试上
- 如何选择模型：
  - `CLAWDBOT_LIVE_MODELS=modern` 用于运行现代允许列表（Opus/Sonnet/Haiku 4.5, GPT-5.x + Codex, Gemini 3, GLM 4.7, MiniMax M2.1, Grok 4）
  - `CLAWDBOT_LIVE_MODELS=all` 是现代允许列表的别名
  - 或者 `CLAWDBOT_LIVE_MODELS="openai/gpt-5.2,anthropic/claude-opus-4-5,..."`（以逗号分隔的允许列表）
- 如何选择提供者：
  - `CLAWDBOT_LIVE_PROVIDERS="google,google-antigravity,google-gemini-cli"`（以逗号分隔的允许列表）
- 密钥来源：
  - 默认情况下：来自配置文件存储和环境变量回退
  - 设置 `CLAWDBOT_LIVE_REQUIRE_PROFILE_KEYS=1` 以强制仅使用 **配置文件存储**
- 为什么需要这个：
  - 将“提供者 API 故障 / 密钥无效”与“网关代理流程故障”分开
  - 包含小规模、隔离的回归测试（例如：OpenAI 响应/Codex 响应的推理重放 + 工具调用流程）"

### 第二层：网关 + 开发代理烟雾测试（“@clawdbot” 实际执行的内容）

- 测试文件: `src/gateway/gateway-models.profiles.live.test.ts`
- 目标:
  - 启动一个进程内的网关
  - 创建/更新一个 `agent:dev:*` 会话（根据每次运行进行模型覆盖）
  - 遍历模型并进行断言:
    - 返回“有意义”的响应（不使用工具）
    - 真实工具调用有效（读取探针）
    - 可选的额外工具探针（执行+读取探针）
    - OpenAI 回归路径（仅工具调用 → 后续回复）仍然有效
- 探针详情（便于快速解释失败原因）:
  - `read` 探针：测试在工作区中写入一个随机数文件，并让代理 `read` 该文件并回显随机数。
  - `exec+read` 探针：测试让代理 `exec` 写入一个随机数到临时文件，然后 `read` 该文件。
  - 图像探针：测试附加一个生成的 PNG 图像（包含“CAT”和随机代码），并期望模型返回 `cat <CODE>`。
  - 实现参考：`src/gateway/gateway-models.profiles.live.test.ts` 和 `src/gateway/live-image-probe.ts`。
- 如何启用:
  - `pnpm test:live`（或直接调用 Vitest 时使用 `CLAWDBOT_LIVE_TEST=1`）
- 如何选择模型:
  - 默认：现代允许列表（Opus/Sonnet/Haiku 4.5，GPT-5.x + Codex，Gemini 3，GLM 4.7，MiniMax M2.1，Grok 4）
  - `CLAWDBOT_LIVE_GATEWAY_MODELS=all` 是现代允许列表的别名
  - 或设置 `CLAWDBOT_LIVE_GATEWAY_MODELS="provider/model"`（或逗号分隔列表）以缩小范围
- 如何选择提供者（避免“OpenRouter 全部”）:
  - `CLAWDBOT_LIVE_GATEWAY_PROVIDERS="google,google-antigravity,google-gemini-cli,openai,anthropic,zai,minimax"`（逗号允许列表）
- 工具 + 图像探针在该实时测试中始终启用:
  - `read` 探针 + `exec+read` 探针（工具压力测试）
  - 当模型声明支持图像输入时，图像探针会运行
- 流程（高层次）:
  - 测试生成一个带有“CAT”和随机代码的小 PNG 图像（`src/gateway/live-image-probe.ts`）
  - 通过 `agent` 发送该图像，格式为 `attachments: [{ mimeType: "image/png", content: "<base64>" }]`
  - 网关将附件解析为 `images[]`（`src/gateway/server-methods/agent.ts` + `src/gateway/chat-attachments.ts`）
  - 嵌入式代理将多模态用户消息转发给模型
  - 断言：回复中包含 `cat` 和随机代码（OCR 容错：允许轻微错误）
  
提示：要查看你机器上可以测试的内容（以及确切的 `provider/model` ID），运行以下命令：```bash
clawdbot models list
clawdbot models list --json
```
## Live：Anthropic setup-token 测试

- 测试文件：`src/agents/anthropic.setup-token.live.test.ts`
- 目标：验证 Claude Code CLI 的 setup-token（或粘贴的 setup-token 配置文件）可以完成 Anthropic 的提示。
- 启用方式：
  - `pnpm test:live`（或直接调用 Vitest 时使用 `CLAWDBOT_LIVE_TEST=1`）
  - `CLAWDBOT_LIVE_SETUP_TOKEN=1`
- Token 来源（任选其一）：
  - 配置文件：`CLAWDBOT_LIVE_SETUP_TOKEN_PROFILE=anthropic:setup-token-test`
  - 原始 Token：`CLAWDBOT_LIVE_SETUP_TOKEN_VALUE=sk-ant-oat01-...`
- 模型覆盖（可选）：
  - `CLAWDBOT_LIVE_SETUP_TOKEN_MODEL=anthropic/claude-opus-4-5`

设置示例：```bash
clawdbot models auth paste-token --provider anthropic --profile-id anthropic:setup-token-test
CLAWDBOT_LIVE_SETUP_TOKEN=1 CLAWDBOT_LIVE_SETUP_TOKEN_PROFILE=anthropic:setup-token-test pnpm test:live src/agents/anthropic.setup-token.live.test.ts
```
## Live：CLI 后端烟雾测试（Claude Code CLI 或其他本地 CLIs）

- 测试文件：`src/gateway/gateway-cli-backend.live.test.ts`
- 目标：使用本地 CLI 后端验证 Gateway + agent 流程，而无需修改你的默认配置。
- 启用方式：
  - `pnpm test:live`（或直接调用 Vitest 时使用 `CLAWDBOT_LIVE_TEST=1`）
  - `CLAWDBOT_LIVE_CLI_BACKEND=1`
- 默认值：
  - 模型：`claude-cli/claude-sonnet-4-5`
  - 命令：`claude`
  - 参数：`["-p","--output-format","json","--dangerously-skip-permissions"]`
- 覆盖选项（可选）：
  - `CLAWDBOT_LIVE_CLI_BACKEND_MODEL="claude-cli/claude-opus-4-5"`
  - `CLAWDBOT_LIVE_CLI_BACKEND_MODEL="codex-cli/gpt-5.2-codex"`
  - `CLAWDBOT_LIVE_CLI_BACKEND_COMMAND="/full/path/to/claude"`
  - `CLAWDBOT_LIVE_CLI_BACKEND_ARGS='["-p","--output-format","json","--permission-mode","bypassPermissions"]'`
  - `CLAWDBOT_LIVE_CLI_BACKEND_CLEAR_ENV='["ANTHROPIC_API_KEY","ANTHROPIC_API_KEY_OLD"]'`
  - `CLAWDBOT_LIVE_CLI_BACKEND_IMAGE_PROBE=1` 用于发送真实图片附件（路径会注入到提示中）。
  - `CLAWDBOT_LIVE_CLI_BACKEND_IMAGE_ARG="--image"` 用于将图片文件路径作为 CLI 参数传递，而不是提示注入。
  - `CLAWDBOT_LIVE_CLI_BACKEND_IMAGE_MODE="repeat"`（或 `"list"`）用于控制当设置 `IMAGE_ARG` 时如何传递图片参数。
  - `CLAWDBOT_LIVE_CLI_BACKEND_RESUME_PROBE=1` 用于发送第二轮对话并验证恢复流程。
- `CLAWDBOT_LIVE_CLI_BACKEND_DISABLE_MCP_CONFIG=0` 用于保留 Claude Code CLI 的 MCP 配置（默认会通过临时空文件禁用 MCP 配置）。

示例：```bash
CLAWDBOT_LIVE_CLI_BACKEND=1 \
  CLAWDBOT_LIVE_CLI_BACKEND_MODEL="claude-cli/claude-sonnet-4-5" \
  pnpm test:live src/gateway/gateway-cli-backend.live.test.ts
```
```md
### 推荐的实时测试用例

使用窄范围、明确的允许列表是最快速且最稳定的：

- 单个模型，直接测试（无网关）：
  - `CLAWDBOT_LIVE_MODELS="openai/gpt-5.2" pnpm test:live src/agents/models.profiles.live.test.ts`

- 单个模型，网关烟雾测试：
  - `CLAWDBOT_LIVE_GATEWAY_MODELS="openai/gpt-5.2" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

- 跨多个提供商的工具调用：
  - `CLAWDBOT_LIVE_GATEWAY_MODELS="openai/gpt-5.2,anthropic/claude-opus-4-5,google/gemini-3-flash-preview,zai/glm-4.7,minimax/minimax-m2.1" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

- 谷歌重点（Gemini API 密钥 + Antigravity）：
  - Gemini（API 密钥）：`CLAWDBOT_LIVE_GATEWAY_MODELS="google/gemini-3-flash-preview" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`
  - Antigravity（OAuth）：`CLAWDBOT_LIVE_GATEWAY_MODELS="google-antigravity/claude-opus-4-5-thinking,google-antigravity/gemini-3-pro-high" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

注意事项：
- `google/...` 使用的是 Gemini API（API 密钥）。
- `google-antigravity/...` 使用的是 Antigravity OAuth 桥接（类似 Cloud Code Assist 风格的代理端点）。
- `google-gemini-cli/...` 使用的是你机器上的本地 Gemini CLI（单独的认证方式 + 工具使用差异）。
- Gemini API 与 Gemini CLI 的区别：
  - API：Clawdbot 通过 HTTP 调用 Google 的托管 Gemini API（使用 API 密钥/配置文件认证）；这通常是大多数用户所说的“Gemini”。
  - CLI：Clawdbot 调用本地的 `gemini` 可执行文件；它有自己的认证方式，行为可能不同（如流式传输/工具支持/版本差异）。

## 实时测试：模型矩阵（我们覆盖的内容）

没有固定的“CI 模型列表”（实时测试是可选的），但以下是一些**推荐**的模型，建议在有密钥的开发机器上定期覆盖。

### 现代烟雾测试集（工具调用 + 图像支持）

这是我们期望保持正常运行的“常用模型”测试集：
- OpenAI（非 Codex）：`openai/gpt-5.2`（可选：`openai/gpt-5.1`）
- OpenAI Codex：`openai-codex/gpt-5.2`（可选：`openai-codex/gpt-5.2-codex`）
- Anthropic：`anthropic/claude-opus-4-5`（或 `anthropic/claude-sonnet-4-5`）
- Google（Gemini API）：`google/gemini-3-pro-preview` 和 `google/gemini-3-flash-preview`（避免较旧的 Gemini 2.x 模型）
- Google（Antigravity）：`google-antigravity/claude-opus-4-5-thinking` 和 `google-antigravity/gemini-3-flash`
- Z.AI（GLM）：`zai/glm-4.7`
- MiniMax：`minimax/minimax-m2.1`

运行带有工具和图像支持的网关烟雾测试：
`CLAWDBOT_LIVE_GATEWAY_MODELS="openai/gpt-5.2,openai-codex/gpt-5.2,anthropic/claude-opus-4-5,google/gemini-3-pro-preview,google/gemini-3-flash-preview,google-antigravity/claude-opus-4-5-thinking,google-antigravity/gemini-3-flash,zai/glm-4.7,minimax/minimax-m2.1" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

### 基线：工具调用（读取 + 可选执行）"

至少为每个提供者家族选择一个模型：
- OpenAI: `openai/gpt-5.2`（或 `openai/gpt-5-mini`）
- Anthropic: `anthropic/claude-opus-4-5`（或 `anthropic/claude-sonnet-4-5`）
- Google: `google/gemini-3-flash-preview`（或 `google/gemini-3-pro-preview`）
- Z.AI（GLM）: `zai/glm-4.7`
- MiniMax: `minimax/minimax-m2.1`

可选的额外覆盖（加分项）：
- xAI: `xai/grok-4`（或最新可用版本）
- Mistral: `mistral/`…（选择一个你已启用的“工具”能力模型）
- Cerebras: `cerebras/`…（如果你有访问权限）
- LM Studio: `lmstudio/`…（本地；工具调用取决于 API 模式）

### 视觉：图像发送（附件 → 多模态消息）

在 `CLAWDBOT_LIVE_GATEWAY_MODELS` 中至少包含一个具备图像能力的模型（Claude/Gemini/OpenAI 的视觉能力变体等），以测试图像探测功能。

### 聚合器 / 其他网关

如果你有相关密钥，我们还支持通过以下方式测试：
- OpenRouter: `openrouter/...`（数百个模型；使用 `clawdbot models scan` 查找具备工具+图像能力的候选模型）
- OpenCode Zen: `opencode/...`（通过 `OPENCODE_API_KEY` / `OPENCODE_ZEN_API_KEY` 进行身份验证）

如果你有凭证/配置，可以将更多提供者包含在实时矩阵中：
- 内置提供者：`openai`、`openai-codex`、`anthropic`、`google`、`google-vertex`、`google-antigravity`、`google-gemini-cli`、`zai`、`openrouter`、`opencode`、`xai`、`groq`、`cerebras`、`mistral`、`github-copilot`
- 通过 `models.providers`（自定义端点）：`minimax`（云端/API），以及任何与 OpenAI/Anthropic 兼容的代理（如 LM Studio、vLLM、LiteLLM 等）

提示：不要在文档中硬编码“所有模型”。权威的模型列表是你的机器上 `discoverModels(...)` 返回的内容，加上你可用的密钥。

## 凭证（不要提交到代码库）

实时测试发现凭证的方式与 CLI 相同。实际影响包括：
- 如果 CLI 可以正常工作，实时测试也应该能找到相同的密钥。
- 如果实时测试提示“没有凭证”，请以调试 `clawdbot models list` / 模型选择的方式进行排查。

- 配置存储：`~/.clawdbot/credentials/`（推荐；测试中“profile keys”所指的内容）
- 配置文件：`~/.clawdbot/clawdbot.json`（或 `CLAWDBOT_CONFIG_PATH`）

如果你想依赖环境变量中的密钥（例如在你的 `~/.profile` 中导出），请在 `source ~/.profile` 之后运行本地测试，或者使用下面的 Docker 运行器（它们可以将 `~/.profile` 挂载到容器中）。

## Deepgram 实时测试（音频转录）

- 测试文件：`src/media-understanding/providers/deepgram/audio.live.test.ts`
- 启用方式：`DEEPGRAM_API_KEY=... DEEPGRAM_LIVE_TEST=1 pnpm test:live src/media-understanding/providers/deepgram/audio.live.test.ts`

## Docker 运行器（可选的“在 Linux 中运行”检查）

这些运行器会在仓库的 Docker 镜像内部运行 `pnpm test:live`，并挂载你的本地配置目录和工作区（如果挂载了 `~/.profile`，也会进行源加载）。

- 直接模型: `pnpm test:docker:live-models` (脚本: `scripts/test-live-models-docker.sh`)
- 网关 + 开发代理: `pnpm test:docker:live-gateway` (脚本: `scripts/test-live-gateway-models-docker.sh`)
- 注册向导 (TTY, 完整的脚手架): `pnpm test:docker:onboard` (脚本: `scripts/e2e/onboard-docker.sh`)
- 网关网络 (两个容器, WS 认证 + 健康检查): `pnpm test:docker:gateway-network` (脚本: `scripts/e2e/gateway-network-docker.sh`)
- 插件 (自定义扩展加载 + 注册表测试): `pnpm test:docker:plugins` (脚本: `scripts/e2e/plugins-docker.sh`)

有用的环境变量:

- `CLAWDBOT_CONFIG_DIR=...` (默认: `~/.clawdbot`) 挂载到 `/home/node/.clawdbot`
- `CLAWDBOT_WORKSPACE_DIR=...` (默认: `~/clawd`) 挂载到 `/home/node/clawd`
- `CLAWDBOT_PROFILE_FILE=...` (默认: `~/.profile`) 挂载到 `/home/node/.profile` 并在运行测试前加载
- `CLAWDBOT_LIVE_GATEWAY_MODELS=...` / `CLAWDBOT_LIVE_MODELS=...` 用于缩小测试范围
- `CLAWDBOT_LIVE_REQUIRE_PROFILE_KEYS=1` 用于确保凭据来自配置文件存储器（而不是环境变量）

## 文档 sanity 检查

在编辑文档后运行文档检查: `pnpm docs:list`.

## 离线回归测试（适合 CI）

这些是“真实流程”的回归测试，但不涉及真实提供者：
- 网关工具调用（模拟 OpenAI，真实网关 + 代理循环）: `src/gateway/gateway.tool-calling.mock-openai.test.ts`
- 网关注册向导（WS `wizard.start`/`wizard.next`，强制写入配置 + 认证）: `src/gateway/gateway.wizard.e2e.test.ts`

## 代理可靠性评估（技能）

我们已经有一些适合 CI 的测试，它们的行为类似于“代理可靠性评估”：
- 通过真实网关 + 代理循环进行模拟工具调用 (`src/gateway/gateway.tool-calling.mock-openai.test.ts`)。
- 端到端的注册向导流程，用于验证会话连接和配置影响 (`src/gateway/gateway.wizard.e2e.test.ts`)。

技能方面仍缺失的内容（参见 [Skills](/tools/skills)）：
- **决策机制:** 当技能在提示中列出时，代理是否选择正确的技能（或避免无关的技能）？
- **合规性:** 代理在使用前是否读取 `SKILL.md` 并遵循所需的步骤/参数？
- **工作流契约:** 多轮场景，用于断言工具调用顺序、会话历史传递和沙箱边界。

未来的评估应优先保持确定性：
- 使用模拟提供者的情景运行器，用于断言工具调用 + 顺序、技能文件读取和会话连接。
- 一组专注于技能的小型情景套件（使用 vs 避免，门控，提示注入）。
- 在 CI 安全套件就位后，才考虑可选的实时评估（需手动启用，由环境变量控制）。

当修复在生产环境中发现的 provider/model 问题时：
- 如果可能，添加一个 CI 安全的回归测试（使用 mock/stub provider，或捕获确切的请求结构转换）
- 如果问题是固有的生产环境专属（如速率限制、认证策略），则保持生产测试范围狭窄，并通过环境变量进行选择性启用
- 优先定位能够捕获该问题的最小层级：
  - 如果是 provider 请求转换/重放问题 → 直接进行模型测试
  - 如果是 gateway 会话/历史/工具流水线问题 → 进行 gateway 生产环境的烟雾测试或 CI 安全的 gateway mock 测试