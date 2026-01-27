---
summary: "Beginner guide: from zero to first message (wizard, auth, channels, pairing)"
read_when:
  - First time setup from zero
  - You want the fastest path from install → onboarding → first message
---

# 快速入门

目标：尽可能快速地从 **零** → **第一个可工作的聊天**（使用合理的默认设置）。

推荐路径：使用 **CLI 入门向导** (`clawdbot onboard`)。它将设置：
- 模型/认证（推荐使用 OAuth）
- 网关设置
- 通道（WhatsApp/Telegram/Discord/Mattermost（插件）/...）
- 默认配对设置（安全的私聊）
- 工作区初始化 + 技能
- 可选的后台服务

如果你想查看更深入的参考页面，请跳转到：[向导](/start/wizard)，[设置](/start/setup)，[配对](/start/pairing)，[安全](/gateway/security)。

沙箱说明：`agents.defaults.sandbox.mode: "non-main"` 使用 `session.mainKey`（默认值为 `"main"`），
因此群组/频道会话会被沙箱隔离。如果你想让主代理始终在主机上运行，请为每个代理设置显式覆盖：
json
{
  "routing": {
    "agents": {
      "main": {
        "workspace": "~/clawd",
        "sandbox": { "mode": "off" }
      }
    }
  }
}
``````
## 0) 前提条件

- Node `>=22`
- `pnpm`（可选；如果你从源代码构建，建议使用）
- **推荐:** Brave Search API 密钥用于网络搜索。最简单的方法是：
  `clawdbot configure --section web`（存储 `tools.web.search.apiKey`）。
  详见 [网络工具](/tools/web)。

macOS：如果你打算构建应用程序，请安装 Xcode / CLT。仅使用 CLI + 网关的话，安装 Node 即可。
Windows：使用 **WSL2**（推荐 Ubuntu）。强烈建议使用 WSL2；原生 Windows 尚未经过测试，问题更多，工具兼容性也较差。请先安装 WSL2，然后在 WSL 中运行 Linux 步骤。详见 [Windows (WSL2)](/platforms/windows)。```bash
curl -fsSL https://clawd.bot/install.sh | bash
```
安装选项（安装方式、非交互式、从 GitHub）：[安装](/install)。
powershell
iwr -useb https://clawd.bot/install.ps1 | iex
``````
替代方案（全局安装）：```bash
npm install -g clawdbot@latest
```
"
bash
pnpm add -g clawdbot@latest## 2) 运行入门向导（并安装服务）
bash
clawdbot onboard --install-daemon
``````
你将选择的内容：
- **本地 vs 远程** 网关
- **认证方式**：OpenAI Code（Codex）订阅（OAuth）或 API 密钥。对于 Anthropic，我们推荐使用 API 密钥；也支持 `claude setup-token`。
- **提供者**：WhatsApp 的二维码登录、Telegram/Discord 机器人令牌、Mattermost 插件令牌等。
- **守护进程**：后台安装（launchd/systemd；WSL2 使用 systemd）
  - **运行时**：Node（推荐；用于 WhatsApp/Telegram 必须使用）。Bun 不推荐使用。
- **网关令牌**：向导默认会生成一个（即使在 loopback 模式下），并将其存储在 `gateway.auth.token` 中。

向导文档：[向导](/start/wizard)

### 认证方式：存储位置（重要）

- **推荐的 Anthropic 路径**：设置一个 API 密钥（向导可以为服务存储该密钥）。如果你希望重复使用 Claude Code 的凭证，也支持 `claude setup-token`。

- OAuth 凭证（旧版导入）：`~/.clawdbot/credentials/oauth.json`
- 认证配置文件（OAuth + API 密钥）：`~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`

无头/服务器提示：先在普通机器上进行 OAuth，然后将 `oauth.json` 复制到网关主机。
 

## 3) 启动网关

如果你在引导过程中安装了服务，网关应该已经正在运行：```bash
clawdbot gateway status
```
手动运行（前台）：
bash
clawdbot gateway --port 18789 --verbose
``````
仪表盘（本地回环）：`http://127.0.0.1:18789/`
如果配置了令牌，请将其粘贴到控制UI设置中（存储为 `connect.params.auth.token`）。

⚠️ **Bun警告（WhatsApp + Telegram）：** Bun与这些渠道存在已知问题。如果您使用WhatsApp或Telegram，请使用 **Node** 运行网关。

## 3.5）快速验证（2分钟）```bash
clawdbot status
clawdbot health
```
## 4) 配对并连接您的第一个聊天界面

### WhatsApp（二维码登录）
bash
clawdbot channels login
``````
通过 WhatsApp 扫描 → 设置 → 已连接的设备。

WhatsApp 文档：[WhatsApp](/channels/whatsapp)

### Telegram / Discord / 其他

向导可以为您生成令牌/配置。如果您更倾向于手动配置，请从以下开始：
- Telegram：[Telegram](/channels/telegram)
- Discord：[Discord](/channels/discord)
- Mattermost（插件）：[Mattermost](/channels/mattermost)

**Telegram 私信提示：** 您的第一个私信会返回一个配对代码。请批准它（见下一步），否则机器人将不会回复。

## 5）私信安全（配对确认）

默认设置：未知的私信会收到一个简短的代码，消息在未获得批准前不会被处理。
如果您的第一个私信没有收到回复，请批准配对：```bash
clawdbot pairing list whatsapp
clawdbot pairing approve whatsapp <code>
```
配对文档：[配对](/start/pairing)

## 从源代码运行（开发）

如果你正在对 Clawdbot 进行开发，请从源代码运行：
bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm ui:build # 首次运行时会自动安装 UI 依赖
pnpm build
clawdbot onboard --install-daemon
``````
如果你还没有全局安装，请通过 `pnpm clawdbot ...` 运行入门步骤（从仓库中执行）。

网关（从此仓库中）：```bash
node dist/entry.js gateway --port 18789 --verbose
```
## 7) 验证端到端

在新的终端中，发送一条测试消息：
bash
clawdbot message send --target +15555550123 --message "Hello from Clawdbot"
``````
如果 `clawdbot health` 显示“no auth configured”，请返回向导并设置 OAuth/密钥认证 —— 没有认证的话，代理将无法响应。

提示：`clawdbot status --all` 是最方便粘贴的只读调试报告。
健康检查：`clawdbot health`（或 `clawdbot status --deep`）会向正在运行的网关请求一份健康快照。

## 下一步（可选，但非常有用）

- macOS 菜单栏应用程序 + 语音唤醒：[macOS 应用](/platforms/macos)
- iOS/Android 节点（画布/摄像头/语音）：[节点](/nodes)
- 远程访问（SSH 隧道 / Tailscale Serve）：[远程访问](/gateway/remote) 和 [Tailscale](/gateway/tailscale)
- 永久在线 / VPN 设置：[远程访问](/gateway/remote)、[exe.dev](/platforms/exe-dev)、[Hetzner](/platforms/hetzner)、[macOS 远程](/platforms/mac/remote)