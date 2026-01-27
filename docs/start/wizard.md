---
summary: "CLI onboarding wizard: guided setup for gateway, workspace, channels, and skills"
read_when:
  - Running or configuring the onboarding wizard
  - Setting up a new machine
---

# 上线向导（CLI）

上线向导是**推荐**的方式，用于在 macOS、Linux 或 Windows（通过 WSL2；强烈推荐）上设置 Clawdbot。
它通过一个引导流程配置本地网关或远程网关连接，以及频道、技能和工作区的默认设置。

主要入口点：
bash
clawdbot onboard
``````
后续重新配置：```bash
clawdbot configure
```
## 推荐：设置 Brave Search API 密钥

以便代理可以使用 `web_search`（`web_fetch` 无需密钥）。最简单的路径是运行 `clawdbot configure --section web`，这会存储 `tools.web.search.apiKey`。文档：[Web 工具](/tools/web)。

## QuickStart 与 Advanced

向导从 **QuickStart**（默认设置）与 **Advanced**（完全控制）开始。

**QuickStart** 保留默认设置：
- 本地网关（loopback）
- 工作空间默认（或现有工作空间）
- 网关端口 **18789**
- 网关认证 **Token**（即使在 loopback 上也会自动生成）
- Tailscale 暴露 **关闭**
- Telegram + WhatsApp 私信默认设置为 **允许列表**（你将被提示输入你的手机号码）

**Advanced** 暴露所有步骤（模式、工作空间、网关、频道、守护进程、技能）。

## 向导的作用

**本地模式（默认）** 会引导你完成以下步骤：
  - 模型/认证（OpenAI Code（Codex）订阅 OAuth，Anthropic API 密钥（推荐）或 setup-token（粘贴），以及 MiniMax/GLM/Moonshot/AI Gateway 选项）
  - 工作空间位置 + 启动文件
  - 网关设置（端口/绑定/认证/Tailscale）
  - 提供商（Telegram，WhatsApp，Discord，Google Chat，Mattermost（插件），Signal）
  - 守护进程安装（LaunchAgent / systemd 用户单元）
  - 健康检查
  - 技能（推荐）

**远程模式** 仅配置本地客户端以连接到其他地方的网关。  
它 **不会** 在远程主机上安装或更改任何内容。

如需添加更多隔离的代理（独立的工作空间 + 会话 + 认证），请使用：
bash
clawdbot agents add <name>
``````
提示：`--json` **不**表示非交互模式。对于脚本，请使用 `--non-interactive`（和 `--workspace`）。

## 流程详情（本地）

1) **现有配置检测**
   - 如果 `~/.clawdbot/clawdbot.json` 存在，选择 **保留 / 修改 / 重置**。
   - 重新运行向导 **不会** 清除任何内容，除非你明确选择 **重置**（或传递 `--reset`）。
   - 如果配置无效或包含旧版键，向导将停止并提示你运行 `clawdbot doctor` 后再继续。
   - 重置会使用 `trash`（从不使用 `rm`），并提供以下作用域：
     - 仅重置配置
     - 重置配置 + 凭据 + 会话
     - 完全重置（同时删除工作区）

2) **模型/认证**
   - **Anthropic API 密钥（推荐）**：如果存在 `ANTHROPIC_API_KEY`，则使用它，否则提示输入密钥，并保存用于守护进程使用。
   - **Anthropic OAuth（Claude Code CLI）**：在 macOS 上，向导会检查 Keychain 中的条目 "Claude Code-credentials"（选择 "Always Allow" 以避免 launchd 启动时被阻塞）；在 Linux/Windows 上，如果存在 `~/.claude/.credentials.json`，则会复用它。
   - **Anthropic 令牌（粘贴 setup-token）**：在任意机器上运行 `claude setup-token`，然后粘贴令牌（你可以为其命名；留空则使用默认值）。
   - **OpenAI Code（Codex）订阅（Codex CLI）**：如果 `~/.codex/auth.json` 存在，向导可以复用它。
   - **OpenAI Code（Codex）订阅（OAuth）**：浏览器流程；粘贴 `code#state`。
     - 当模型未设置或为 `openai/*` 时，设置 `agents.defaults.model` 为 `openai-codex/gpt-5.2`。
   - **OpenAI API 密钥**：如果存在 `OPENAI_API_KEY`，则使用它，否则提示输入密钥，并保存到 `~/.clawdbot/.env`，以便 launchd 读取。
   - **OpenCode Zen（多模型代理）**：提示输入 `OPENCODE_API_KEY`（或 `OPENCODE_ZEN_API_KEY`，可在 https://opencode.ai/auth 获取）。
   - **API 密钥**：为你存储该密钥。
   - **Vercel AI 网关（多模型代理）**：提示输入 `AI_GATEWAY_API_KEY`。
     - 更多详情：[Vercel AI 网关](/providers/vercel-ai-gateway)
   - **MiniMax M2.1**：配置会自动写入。
     - 更多详情：[MiniMax](/providers/minimax)
   - **Synthetic（Anthropic 兼容）**：提示输入 `SYNTHETIC_API_KEY`。
     - 更多详情：[Synthetic](/providers/synthetic)
   - **Moonshot（Kimi K2）**：配置会自动写入。
   - **Kimi Code**：配置会自动写入。
     - 更多详情：[Moonshot AI（Kimi + Kimi Code）](/providers/moonshot)
   - **跳过**：尚未配置认证。
   - 从检测到的选项中选择一个默认模型（或手动输入提供者/模型）。
   - 向导会运行模型检查，并在配置的模型未知或缺少认证时发出警告。
   - OAuth 凭据存储在 `~/.clawdbot/credentials/oauth.json` 中；认证配置文件存储在 `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`（API 密钥 + OAuth）。
     - 更多详情：[/concepts/oauth](/concepts/oauth)

3) **工作区**
   - 默认路径为 `~/clawd`（可配置）。
   - 生成代理启动所需的默认工作区文件。
   - 完整的工作区结构和备份指南：[代理工作区](/concepts/agent-workspace)

4) **网关**
   - 端口、绑定、认证模式、Tailscale 暴露。
   - 认证建议：即使对于本地回环地址也保留 **Token**，以便本地 WS 客户端必须进行认证。
   - 仅在您完全信任每个本地进程时才禁用认证。
   - 非回环绑定仍需要认证。

5) **通道**
  - WhatsApp：可选的二维码登录。
  - Telegram：机器人令牌。
  - Discord：机器人令牌。
  - Google Chat：服务账户 JSON + Webhook 接收者。
  - Mattermost（插件）：机器人令牌 + 基础 URL。
   - Signal：可选的 `signal-cli` 安装 + 账户配置。
   - iMessage：本地 `imsg` CLI 路径 + 数据库访问。
  - 私信安全：默认为配对模式。第一次私信会发送一个验证码；可以通过 `clawdbot pairing approve <channel> <code>` 进行批准，或使用允许列表。

6) **守护进程安装**
   - macOS：LaunchAgent
     - 需要一个已登录的用户会话；对于无头模式，请使用自定义的 LaunchDaemon（未随附）。
   - Linux（以及通过 WSL2 的 Windows）：systemd 用户单元
     - 向导会尝试通过 `loginctl enable-linger <user>` 启用持续运行，以便在注销后网关仍保持运行。
     - 可能会提示输入 sudo（写入 `/var/lib/systemd/linger`）；它会先尝试不使用 sudo。

   - **运行时选择**：Node（推荐；WhatsApp/Telegram 所需）。Bun **不推荐**。

7) **健康检查**
   - 如果需要，启动网关并运行 `clawdbot health`。
   - 提示：`clawdbot status --deep` 会在状态输出中添加网关健康检查信息（需要网关可访问）。

8) **技能（推荐）**
   - 读取可用的技能并检查依赖。
   - 让你选择一个节点管理器：**npm / pnpm**（Bun 不推荐）。
   - 安装可选依赖（一些在 macOS 上使用 Homebrew）。

9) **完成**
   - 总结 + 下一步操作，包括 iOS/Android/macOS 应用程序以获取额外功能。
  - 如果未检测到 GUI，向导会打印 SSH 端口转发指令以用于控制界面，而不是打开浏览器。
  - 如果控制界面资源缺失，向导会尝试构建它们；备用方法是 `pnpm ui:build`（会自动安装界面依赖）。

## 远程模式

远程模式配置本地客户端连接到其他地方的网关。

您将设置的内容：
- 远程网关 URL (`ws://...`)
- 如果远程网关需要认证，请设置 Token（推荐）

注意事项：
- 不会进行远程安装或守护进程更改。
- 如果网关仅限于回环地址，请使用 SSH 隧道或 tailnet。
- 发现提示：
  - macOS：Bonjour (`dns-sd`)
  - Linux：Avahi (`avahi-browse`)

## 添加另一个代理

使用 `clawdbot agents add <name>` 创建一个具有独立工作区、会话和认证配置的另一个代理。不带 `--workspace` 运行会启动向导。

它会设置的内容：
- `agents.list[].name`
- `agents.list[].workspace`
- `agents.list[].agentDir`

注意事项：
- 默认工作区遵循 `~/clawd-<agentId>`。
- 可以添加 `bindings` 来路由入站消息（向导可以完成此操作）。
- 非交互式标志：`--model`, `--agent-dir`, `--bind`, `--non-interactive`。

## 非交互模式

使用 `--non-interactive` 来自动化或脚本化接入流程：```bash
clawdbot onboard --non-interactive \
  --mode local \
  --auth-choice apiKey \
  --anthropic-api-key "$ANTHROPIC_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback \
  --install-daemon \
  --daemon-runtime node \
  --skip-skills
```
添加 `--json` 以获取可被机器读取的摘要。

Gemini 示例：
bash
clawdbot onboard --non-interactive \
  --mode local \
  --auth-choice gemini-api-key \
  --gemini-api-key "$GEMINI_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
``````
Z.AI 示例：```bash
clawdbot onboard --non-interactive \
  --mode local \
  --auth-choice zai-api-key \
  --zai-api-key "$ZAI_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```
Vercel AI 网关示例：
bash
clawdbot onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
``````
月球射击示例：

"```bash
clawdbot onboard --non-interactive \
  --mode local \
  --auth-choice moonshot-api-key \
  --moonshot-api-key "$MOONSHOT_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```
示例：合成示例
bash
clawdbot onboard --non-interactive \
  --mode local \
  --auth-choice synthetic-api-key \
  --synthetic-api-key "$SYNTHETIC_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
``````
OpenCode Zen 示例：```bash
clawdbot onboard --non-interactive \
  --mode local \
  --auth-choice opencode-zen \
  --opencode-zen-api-key "$OPENCODE_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```
添加代理（非交互式）示例：
bash
clawdbot agents add work \
  --workspace ~/clawd-work \
  --model openai/gpt-5.2 \
  --bind whatsapp:biz \
  --non-interactive \
  --json
``````
## 网关向导 RPC

网关通过 RPC 暴露向导流程（`wizard.start`、`wizard.next`、`wizard.cancel`、`wizard.status`）。
客户端（macOS 应用、控制界面）可以渲染步骤，而无需重新实现注册逻辑。

## Signal 设置（signal-cli）

向导可以从 GitHub 发布版本中安装 `signal-cli`：
- 下载适当的发布资产。
- 存储在 `~/.clawdbot/tools/signal-cli/<version>/` 下。
- 将 `channels.signal.cliPath` 写入你的配置文件。

注意事项：
- JVM 构建需要 **Java 21**。
- 当有可用的原生构建时使用原生构建。
- Windows 使用 WSL2；signal-cli 的安装流程在 WSL 中遵循 Linux 流程。

## 向导写入的内容

典型的 `~/.clawdbot/clawdbot.json` 字段包括：
- `agents.defaults.workspace`
- `agents.defaults.model` / `models.providers`（如果选择 Minimax）
- `gateway.*`（模式、绑定、认证、tailscale）
- `channels.telegram.botToken`、`channels.discord.token`、`channels.signal.*`、`channels.imessage.*`
- 当你在提示中选择启用时，会写入频道允许列表（Slack/Discord/Matrix/Microsoft Teams）（名称尽可能解析为 ID）。
- `skills.install.nodeManager`
- `wizard.lastRunAt`
- `wizard.lastRunVersion`
- `wizard.lastRunCommit`
- `wizard.lastRunCommand`
- `wizard.lastRunMode`

`clawdbot agents add` 会写入 `agents.list[]` 和可选的 `bindings`。

WhatsApp 凭据存储在 `~/.clawdbot/credentials/whatsapp/<accountId>/` 下。
会话存储在 `~/.clawdbot/agents/<agentId>/sessions/` 下。

一些频道是以插件形式提供的。当你在注册过程中选择其中一个时，向导会在配置之前提示你安装它（通过 npm 或本地路径）。