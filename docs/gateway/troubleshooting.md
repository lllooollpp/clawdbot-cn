---
summary: "Quick troubleshooting guide for common Clawdbot failures"
read_when:
  - Investigating runtime issues or failures
---

# 故障排除 🔧

当 Clawdbot 行为异常时，以下是修复它的方法。

如果你只是想快速排查问题，可以先查看 FAQ 的 [前60秒](/help/faq#first-60-seconds-if-somethings-broken)。本页面会更深入地讲解运行时故障和诊断。

特定提供者的快捷方式：[/channels/troubleshooting](/channels/troubleshooting)

## 状态与诊断

快速排查命令（按顺序使用）：

| 命令 | 它告诉你的内容 | 何时使用 |
|---|---|---|
| `clawdbot status` | 本地摘要：操作系统 + 更新，网关可达性/模式，服务，代理/会话，提供者配置状态 | 首次检查，快速概览 |
| `clawdbot status --all` | 完整的本地诊断（只读，可粘贴，相对安全）包括日志尾部 | 当你需要分享一个调试报告时 |
| `clawdbot status --deep` | 运行网关健康检查（包括提供者探测；需要网关可访问） | 当“已配置”不代表“正常工作”时 |
| `clawdbot gateway probe` | 网关发现 + 可达性（本地和远程目标） | 当你怀疑你探测的是错误的网关时 |
| `clawdbot channels status --probe` | 向正在运行的网关请求通道状态（并可选择进行探测） | 当网关可达但通道出现故障时 |
| `clawdbot gateway status` | 监督器状态（launchd/systemd/schtasks），运行时 PID/退出状态，最后一次网关错误 | 当服务“看起来已加载”但没有运行时 |
| `clawdbot logs --follow` | 实时日志（运行时问题的最佳信号） | 当你需要实际的失败原因时 |

**分享输出内容**：优先使用 `clawdbot status --all`（会屏蔽令牌）。如果你粘贴 `clawdbot status`，请先设置 `CLAWDBOT_SHOW_SECRETS=0`（显示令牌预览）。

另请参阅：[健康检查](/gateway/health) 和 [日志](/logging)。

## 常见问题

### 未找到提供者 "anthropic" 的 API 密钥

这意味着 **代理的认证存储为空** 或者缺少 Anthropic 凭据。
认证是 **按代理设置的**，因此新代理不会继承主代理的密钥。

修复选项：
- 重新运行引导流程，并为该代理选择 **Anthropic**。
- 或者在 **网关主机** 上粘贴一个 setup-token：
bash
  clawdbot models auth setup-token --provider anthropic
```  ```
- 或者从主代理目录复制 `auth-profiles.json` 文件到新的代理目录。

验证：```bash
clawdbot models status
```
### OAuth 令牌刷新失败（Anthropic Claude 订阅）

这表示存储的 Anthropic OAuth 令牌已过期，并且刷新失败。  
如果你使用的是 Claude 订阅（没有 API 密钥），最可靠的方法是  
切换到 **Claude Code 设置令牌（setup-token）**，或在 **网关主机（gateway host）** 上重新同步 Claude Code CLI 的 OAuth。

**推荐（设置令牌）：**
bash
# 在网关主机上运行（运行 Claude Code CLI）
clawdbot models auth setup-token --provider anthropic
clawdbot models status
``````
如果你在其他地方生成了令牌：```bash
clawdbot models auth paste-token --provider anthropic
clawdbot models status
```
**如果您希望保留OAuth的复用：**  
在网关主机上使用Claude Code CLI登录，然后运行 `clawdbot models status`，以将刷新后的令牌同步到Clawdbot的认证存储中。

更多细节：[Anthropic](/providers/anthropic) 和 [OAuth](/concepts/oauth)。

### 控制UI在HTTP下失败（“需要设备身份” / “连接失败”）

如果您通过普通的HTTP打开仪表盘（例如 `http://<lan-ip>:18789/` 或  
`http://<tailscale-ip>:18789/`），浏览器会在**非安全上下文中**运行，并阻止WebCrypto，因此无法生成设备身份。

**解决方法：**  
- 优先通过 [Tailscale Serve](/gateway/tailscale) 使用HTTPS。  
- 或在网关主机本地打开：`http://127.0.0.1:18789/`。  
- 如果您必须使用HTTP，请启用 `gateway.controlUi.allowInsecureAuth: true` 并使用网关令牌（仅令牌；无需设备身份/配对）。详见 [Control UI](/web/control-ui#insecure-http)。

### CI 秘钥扫描失败

这意味着 `detect-secrets` 发现了尚未纳入基线的新候选秘密。

请参考 [Secret scanning](/gateway/security#secret-scanning-detect-secrets) 进行处理。

### 服务已安装但无任何进程运行

如果网关服务已安装但进程立即退出，服务可能看起来是“已加载”，但实际上没有运行。

**检查：**
bash
clawdbot gateway status
clawdbot doctor
``````
医生/服务将在运行时显示状态（PID/上次退出）和日志提示。

**日志：**
- 推荐方式：`clawdbot logs --follow`
- 文件日志（始终可用）：`/tmp/clawdbot/clawdbot-YYYY-MM-DD.log`（或你配置的 `logging.file`）
- macOS LaunchAgent（如果已安装）：`$CLAWDBOT_STATE_DIR/logs/gateway.log` 和 `gateway.err.log`
- Linux systemd（如果已安装）：`journalctl --user -u clawdbot-gateway[-<profile>].service -n 200 --no-pager`
- Windows：`schtasks /Query /TN "Clawdbot Gateway (<profile>)" /V /FO LIST`

**启用更多日志：**
- 提高文件日志详细程度（持久化 JSONL）：  ```json
  { "logging": { "level": "debug" } }
  ```
- 提高控制台详细程度（仅限 TTY 输出）：
json
  { "logging": { "consoleLevel": "debug", "consoleStyle": "pretty" } }
```  ```
- 快速提示：`--verbose` 仅影响 **控制台** 输出。文件日志仍然由 `logging.level` 控制。

有关格式、配置和访问的完整概述，请参见 [/logging](/logging)。

### “网关启动被阻止：set gateway.mode=local”

这意味着配置已存在，但 `gateway.mode` 未设置（或不是 `local`），因此网关拒绝启动。

**修复方法（推荐）：**
- 运行向导并将网关运行模式设置为 **本地模式**：  ```bash
  clawdbot configure
  ```
- 或直接设置：
bash
  clawdbot config set gateway.mode local  ```
**如果您是想运行一个远程网关：**
- 设置远程 URL 并保持 `gateway.mode=remote`：  ```bash
  clawdbot config set gateway.mode remote
  clawdbot config set gateway.remote.url "wss://gateway.example.com"
  ```
**临时/开发专用:** 通过 `--allow-unconfigured` 参数启动网关，而无需设置 `gateway.mode=local`。

**还没有配置文件？** 运行 `clawdbot setup` 来生成一个初始配置文件，然后重新运行网关。

### 服务环境（PATH + 运行时）

网关服务以一个**最小的 PATH**运行，以避免 shell/manager 的冗余内容：
- macOS: `/opt/homebrew/bin`, `/usr/local/bin`, `/usr/bin`, `/bin`
- Linux: `/usr/local/bin`, `/usr/bin`, `/bin`

这有意排除了版本管理器（nvm/fnm/volta/asdf）和包管理器（pnpm/npm），因为服务不会加载你的 shell 初始化文件。像 `DISPLAY` 这样的运行时变量应该放在 `~/.clawdbot/.env` 中（由网关早期加载）。
在 `host=gateway` 下执行时，会将你的登录 shell 的 `PATH` 合并到执行环境中，因此缺少工具通常意味着你的 shell 初始化文件没有导出它们（或者设置 `tools.exec.pathPrepend`）。详见 [/tools/exec](/tools/exec)。

WhatsApp + Telegram 通道需要 **Node**；Bun 不被支持。如果你的服务是通过 Bun 或版本管理的 Node 路径安装的，请运行 `clawdbot doctor` 以迁移到系统 Node 安装。

### 沙盒中缺少 API 密钥的技能

**症状:** 技能在主机上运行正常，但在沙盒中失败，提示缺少 API 密钥。

**原因:** 沙盒执行是在 Docker 内运行的，**不会继承**主机的 `process.env`。

**解决方法:**
- 设置 `agents.defaults.sandbox.docker.env`（或每个代理的 `agents.list[].sandbox.docker.env`）
- 或者将密钥嵌入到你的自定义沙盒镜像中
- 然后运行 `clawdbot sandbox recreate --agent <id>`（或 `--all`）

### 服务正在运行但端口未监听

如果服务报告为 **运行中**，但没有进程在网关端口上监听，可能是网关拒绝绑定。

**“运行中”在这里是什么意思**
- `Runtime: running` 表示你的守护进程（launchd/systemd/schtasks）认为该进程正在运行。
- `RPC probe` 表示 CLI 实际上可以连接到网关的 WebSocket 并调用 `status`。
- 请始终信任 `Probe target:` 和 `Config (service):` 这两行，它们表示“我们实际尝试了什么？”。

**检查:**
- `clawdbot gateway` 和服务需要 `gateway.mode` 设置为 `local`。
- 如果你设置了 `gateway.mode=remote`，**CLI 默认会连接到远程 URL**。服务可能仍在本地运行，但你的 CLI 可能正在探测错误的位置。使用 `clawdbot gateway status` 查看服务的已解析端口和探测目标（或使用 `--url` 参数）。
- `clawdbot gateway status` 和 `clawdbot doctor` 会从日志中显示**最后一次网关错误**，当服务看起来在运行但端口未打开时。
- 非回环绑定（`lan`/`tailnet`/`custom`，或当回环不可用时的 `auto`）需要认证：
  `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）。
- `gateway.remote.token` 仅用于远程 CLI 调用；它**不会启用本地认证**。
- `gateway.token` 会被忽略；请使用 `gateway.auth.token`。

**如果 `clawdbot gateway status` 显示配置不匹配**
- `Config (cli): ...` 和 `Config (service): ...` 通常应该一致。
- 如果不一致，你很可能在编辑一个配置的同时，服务正在使用另一个配置。
- 解决方法：从你希望服务使用的相同 `--profile` / `CLAWDBOT_STATE_DIR` 重新运行 `clawdbot gateway install --force`。

**如果 `clawdbot gateway status` 报告服务配置问题**
- 监控器配置（launchd/systemd/schtasks）缺少当前默认设置。
- 解决方法：运行 `clawdbot doctor` 来更新它（或使用 `clawdbot gateway install --force` 进行完全重写）。

**如果 `Last gateway error:` 中提到 “refusing to bind … without auth”**
- 你将 `gateway.bind` 设置为非回环模式（`lan`/`tailnet`/`custom`，或在回环不可用时设置为 `auto`），但关闭了认证。
- 解决方法：设置 `gateway.auth.mode` 和 `gateway.auth.token`（或导出 `CLAWDBOT_GATEWAY_TOKEN`），然后重启服务。

**如果 `clawdbot gateway status` 显示 `bind=tailnet` 但未找到 tailnet 接口**
- 网关尝试绑定到 Tailscale 的 IP 地址（100.64.0.0/10），但在主机上未检测到任何 Tailscale 接口。
- 解决方法：在该机器上启动 Tailscale（或更改 `gateway.bind` 为 `loopback`/`lan`）。

**如果 `Probe note:` 显示探针使用了回环接口**
- 对于 `bind=lan` 来说这是正常的：网关监听在 `0.0.0.0`（所有接口），回环接口仍然可以在本地连接。
- 对于远程客户端，请使用真实的 LAN IP（不是 `0.0.0.0`）加上端口，并确保已配置认证。

### 端口 18789 已被占用

这意味着有其他程序已经在监听网关所使用的端口。

**检查：**
bash
clawdbot gateway status
``````
它会显示监听者（listener(s)）以及可能的原因（网关已经在运行，SSH 隧道）。
如果需要，停止服务或选择其他端口。

### 检测到额外的工作区文件夹

如果你是从旧版本升级上来的，磁盘上可能仍然存在 `~/clawdbot`。
多个工作区目录可能导致认证或状态漂移的问题，因为只有一个工作区是活动的。

**修复方法：** 保留一个活动的工作区，并归档/删除其余的。参见 [Agent 工作区](/concepts/agent-workspace#extra-workspace-folders)。

### 主聊天在沙盒工作区中运行

症状：即使你期望的是主机工作区，`pwd` 或文件工具显示的路径是 `~/.clawdbot/sandboxes/...`。

**原因：** `agents.defaults.sandbox.mode: "non-main"` 依赖于 `session.mainKey`（默认为 `"main"`）。
群组/频道会话使用自己的键，因此它们被视为非主会话并获得沙盒工作区。

**修复选项：**
- 如果你希望代理使用主机工作区：设置 `agents.list[].sandbox.mode: "off"`。
- 如果你希望在沙盒中访问主机工作区：为该代理设置 `workspaceAccess: "rw"`。

### “Agent 被中止”

代理在响应过程中被中断。

**原因：**
- 用户发送了 `stop`、`abort`、`esc`、`wait` 或 `exit`
- 超时
- 进程崩溃

**修复：** 只需发送另一条消息即可。会话将继续。

### “Agent 在回复前失败：未知模型：anthropic/claude-haiku-3-5”

Clawdbot 有意拒绝 **旧的/不安全的模型**（尤其是那些容易受到提示注入攻击的模型）。如果你看到这个错误，说明该模型名称已不再被支持。

**修复方法：**
- 为提供者选择一个 **最新** 的模型，并更新你的配置或模型别名。
- 如果你不确定可用的模型有哪些，运行 `clawdbot models list` 或 `clawdbot models scan`，并选择一个受支持的模型。
- 检查网关日志以获取详细的失败原因。

另请参阅：[模型 CLI](/cli/models) 和 [模型提供者](/concepts/model-providers)。```bash
clawdbot status
```
在输出中查找 `AllowFrom: ...`。

**检查 2：** 对于群组聊天，是否需要@提及？
bash
# 消息必须匹配 mentionPatterns 或显式提及；默认值位于频道组/服务器中。
# 多代理：`agents.list[].groupChat.mentionPatterns` 会覆盖全局模式。
grep -n "agents\|groupChat\|mentionPatterns\|channels\.whatsapp\.groups\|channels\.telegram\.groups\|channels\.imessage\.groups\|channels\.discord\.guilds" \
  "${CLAWDBOT_CONFIG_PATH:-$HOME/.clawdbot/clawdbot.json}"
``````
**检查 3：** 检查日志```bash
clawdbot logs --follow
# or if you want quick filters:
tail -f "$(ls -t /tmp/clawdbot/clawdbot-*.log | head -1)" | grep "blocked\\|skip\\|unauthorized"
```
### 配对代码未到达

如果 `dmPolicy` 设置为 `pairing`，则未知发件人应收到一个验证码，并且在获得批准前其消息将被忽略。

**检查 1：** 是否已有待处理的请求在等待？
bash
clawdbot pairing list <channel>
``````
默认情况下，待处理的DM配对请求每频道最多为 **3个**。如果列表已满，新的请求将不会生成代码，直到其中一个请求被批准或过期。

**检查点 2：** 请求是否已创建但未发送回复？```bash
clawdbot logs --follow | grep "pairing request"
```
**检查 3：** 确认该频道的 `dmPolicy` 不是 `open`/`allowlist`。

### 图片 + 提及无法正常工作

已知问题：当你仅发送一张图片并包含提及（没有其他文字）时，WhatsApp 有时不会包含提及的元数据。

**解决方法：** 在提及中添加一些文字：
- ❌ `@clawd` + 图片
- ✅ `@clawd check this` + 图片

### 会话无法恢复

**检查 1：** 会话文件是否存在？
bash
ls -la ~/.clawdbot/agents/<agentId>/sessions/
``````
**检查 2：** 重置窗口是否太短？```json
{
  "session": {
    "reset": {
      "mode": "daily",
      "atHour": 4,
      "idleMinutes": 10080  // 7 days
    }
  }
}
```
**检查 3：** 是否有人发送了 `/new`、`/reset` 或重置触发器？

### 代理超时

默认超时时间为 30 分钟。对于长时间任务：
json
{
  "reply": {
    "timeoutSeconds": 3600  // 1 小时
  }
}
``````
或者使用 `process` 工具在后台运行长时间命令。

### WhatsApp 已断开连接```bash
# Check local status (creds, sessions, queued events)
clawdbot status
# Probe the running gateway + channels (WA connect + Telegram + Discord APIs)
clawdbot status --deep

# View recent connection events
clawdbot logs --limit 200 | grep "connection\\|disconnect\\|logout"
```
**修复方法：** 通常在网关运行后会自动重新连接。如果仍然无法连接，请重启网关进程（无论您如何监控它），或手动运行并开启详细输出：
bash
clawdbot gateway --verbose```
如果您的账户已登出 / 未绑定：```bash
clawdbot channels logout
trash "${CLAWDBOT_STATE_DIR:-$HOME/.clawdbot}/credentials" # if logout can't cleanly remove everything
clawdbot channels login --verbose       # re-scan QR
```
### 媒体发送失败

**检查 1：** 文件路径是否有效？
bash
ls -la /path/to/your/image.jpg
``````
**检查 2：** 是否过大？
- 图片：最大 6MB
- 音频/视频：最大 16MB  
- 文档：最大 100MB

**检查 3：** 检查媒体日志```bash
grep "media\\|fetch\\|download" "$(ls -t /tmp/clawdbot/clawdbot-*.log | head -1)" | tail -20
```
### 高内存使用

Clawdbot 会将对话历史保留在内存中。

**解决方法:** 定期重启或设置会话限制:
json
{
  "session": {
    "historyLimit": 100  // 最大保留消息数
  }
}
``````
## 常见故障排除

### “网关无法启动 —— 配置无效”

Clawdbot 现在会在配置中包含未知键、格式错误的值或无效类型时拒绝启动。
这是为了安全而有意为之的改进。

使用 Doctor 工具进行修复：```bash
clawdbot doctor
clawdbot doctor --fix
```
注意事项：
- `clawdbot doctor` 会报告所有无效的条目。
- `clawdbot doctor --fix` 会应用迁移/修复并重写配置文件。
- 即使配置文件无效，像 `clawdbot logs`、`clawdbot health`、`clawdbot status`、`clawdbot gateway status` 和 `clawdbot gateway probe` 这样的诊断命令仍然可以运行。

### “所有模型都失败了” — 我应该首先检查什么？

- 确认正在尝试的提供者（provider）是否有有效的凭证（认证配置 + 环境变量）。
- 检查模型路由：确认 `agents.defaults.model.primary` 和备用模型是你能够访问的。
- 查看 `/tmp/clawdbot/…` 中的网关日志（gateway logs），以获取具体的提供者错误信息。
- 检查模型状态：使用 `/model status`（聊天界面）或 `clawdbot models status`（命令行界面）。
json5
{
  channels: {
    whatsapp: {
      selfChatMode: true,
      dmPolicy: "allowlist",
      allowFrom: ["+15555550123"]
    }
  }
}
``````
参见 [WhatsApp 设置](/channels/whatsapp)。

### WhatsApp 将我登出了。如何重新授权？

再次运行登录命令并扫描二维码：```bash
clawdbot channels login
```
### 在 `main` 分支上出现构建错误 —— 通常的修复路径是什么？

1) `git pull origin main && pnpm install`
2) `clawdbot doctor`
3) 检查 GitHub 问题或 Discord 服务器
4) 临时解决方案：检出较早的提交

### npm install 失败（允许构建脚本 / 缺少 tar 或 yargs）。现在该怎么办？

如果你是从源代码运行的，请使用仓库的包管理器：**pnpm**（推荐）。
仓库中声明了 `packageManager: "pnpm@…"`。
bash
git status   # 确保你位于仓库根目录
pnpm install
pnpm build
clawdbot doctor
clawdbot gateway restart
``````
为什么：pnpm 是此仓库的配置包管理器。

### 如何在 git 安装和 npm 安装之间切换？

使用 **网站安装程序**，并使用标志选择安装方式。它会在原地升级，并重写网关服务以指向新的安装。

切换 **到 git 安装**：```bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --install-method git --no-onboard
```
切换到 npm 全局：
bash
curl -fsSL https://clawd.bot/install.sh | bash
``````
注意事项：
- git flow 仅在仓库干净时才会执行变基操作。请先提交或暂存您的更改。
- 切换之后，请运行：  ```bash
  clawdbot doctor
  clawdbot gateway restart
  ```
### 为什么 Telegram 的块流式传输不会在工具调用之间拆分文本？

块流式传输仅发送**已完成的文本块**。你看到单条消息的常见原因包括：
- `agents.defaults.blockStreamingDefault` 仍为 `"off"`。
- `channels.telegram.blockStreaming` 被设置为 `false`。
- `channels.telegram.streamMode` 为 `partial` 或 `block` **并且草稿流式传输处于活动状态**（私聊 + 话题）。此时草稿流式传输会禁用块流式传输。
- 你的 `minChars` / coalesce 设置过高，导致块被合并。
- 模型发出一个大的文本块（没有中间回复的刷新点）。

修复清单：
1) 将块流式传输设置放在 `agents.defaults` 下，而不是根目录。
2) 如果你想获得真正的多消息块回复，请将 `channels.telegram.streamMode: "off"`。
3) 在调试时使用较小的块/合并阈值。

参见 [流式传输](/concepts/streaming)。

### 即使设置了 `requireMention: false`，Discord 仍不回复我的服务器。为什么？

`requireMention` 仅控制在频道通过允许列表之后的提及门控。默认情况下 `channels.discord.groupPolicy` 是 **允许列表**，因此必须显式启用服务器。  
如果你设置了 `channels.discord.guilds.<guildId>.channels`，则只有列出的频道被允许；省略该项则允许服务器中的所有频道。

修复清单：
1) 将 `channels.discord.groupPolicy: "open"` **或** 添加一个服务器允许列表条目（并可选地添加频道允许列表）。
2) 在 `channels.discord.guilds.<guildId>.channels` 中使用**数字频道 ID**。
3) 将 `requireMention: false` **放在** `channels.discord.guilds` 下（全局或按频道）。
   顶级的 `channels.discord.requireMention` 是不受支持的键。
4) 确保机器人拥有 **Message Content Intent** 和频道权限。
5) 运行 `clawdbot channels status --probe` 以获取审计提示。

文档：[Discord](/channels/discord)，[频道故障排除](/channels/troubleshooting)。

### Cloud Code Assist API 错误：无效的工具模式（400）。该怎么办？

这几乎总是**工具模式兼容性问题**。Cloud Code Assist 端点只接受 JSON Schema 的严格子集。Clawdbot 在当前的 `main` 分支中会清理/标准化工具模式，但此修复尚未包含在最新版本中（截至 2026 年 1 月 13 日）。

修复清单：
1) **更新 Clawdbot**：
   - 如果你可以从源码运行，请拉取 `main` 并重启网关。
   - 否则，请等待包含模式清理器的下一个版本发布。
2) 避免使用不支持的关键字，如 `anyOf/oneOf/allOf`、`patternProperties`、`additionalProperties`、`minLength`、`maxLength`、`format` 等。
3) 如果你定义了自定义工具，请确保顶层模式为 `type: "object"`，并使用 `properties` 和简单的枚举。

参见 [工具](/tools) 和 [TypeBox 模式](/concepts/typebox)。

## macOS 特定问题

### 授予权限（语音/麦克风）时应用崩溃

如果你在点击隐私提示中的“允许”后，应用消失或显示 “Abort trap 6”：

**修复 1：重置 TCC 缓存**
bash
tccutil reset All com.clawdbot.mac.debug
``````
**修复方法 2：强制使用新的 Bundle ID**
如果重置无效，请在 [`scripts/package-mac-app.sh`](https://github.com/clawdbot/clawdbot/blob/main/scripts/package-mac-app.sh) 中修改 `BUNDLE_ID`（例如，添加 `.test` 后缀），然后重新构建。这会强制 macOS 将其视为一个新应用。

### 网关卡在 "Starting..." 状态

该应用连接到本地网关的端口 `18789`。如果它一直卡在这里：

**修复方法 1：停止 supervisor（推荐）**
如果网关由 launchd 进行管理，直接终止 PID 会导致它重新启动。请先停止 supervisor：```bash
clawdbot gateway status
clawdbot gateway stop
# Or: launchctl bootout gui/$UID/com.clawdbot.gateway (replace with com.clawdbot.<profile> if needed)
```
**修复方式 2：端口被占用（查找监听者）**
bash
lsof -nP -iTCP:18789 -sTCP:LISTEN
``````
如果这是一个无监督的过程，请先尝试优雅停止，然后再升级：```bash
kill -TERM <PID>
sleep 1
kill -9 <PID> # last resort
```
**修复方法 3：检查 CLI 安装**  
确保全局安装的 `clawdbot` CLI 与应用程序版本匹配：
bash
clawdbot --version
npm install -g clawdbot@<version>```
## 调试模式

获取详细日志：```bash
# Turn on trace logging in config:
#   ${CLAWDBOT_CONFIG_PATH:-$HOME/.clawdbot/clawdbot.json} -> { logging: { level: "trace" } }
#
# Then run verbose commands to mirror debug output to stdout:
clawdbot gateway --verbose
clawdbot channels login --verbose
```
## 日志位置

| 日志 | 位置 |
|-----|----------|
| 网关文件日志（结构化） | `/tmp/clawdbot/clawdbot-YYYY-MM-DD.log`（或 `logging.file`） |
| 网关服务日志（supervisor） | macOS: `$CLAWDBOT_STATE_DIR/logs/gateway.log` + `gateway.err.log`（默认：`~/.clawdbot/logs/...`；配置文件使用 `~/.clawdbot-<profile>/logs/...`）<br />Linux: `journalctl --user -u clawdbot-gateway[-<profile>].service -n 200 --no-pager`<br />Windows: `schtasks /Query /TN "Clawdbot Gateway (<profile>)" /V /FO LIST` |
| 会话文件 | `$CLAWDBOT_STATE_DIR/agents/<agentId>/sessions/` |
| 媒体缓存 | `$CLAWDBOT_STATE_DIR/media/` |
| 凭据 | `$CLAWDBOT_STATE_DIR/credentials/` |

## 健康检查
bash
# Supervisor + probe target + config paths
clawdbot gateway status
# Include system-level scans (legacy/extra services, port listeners)
clawdbot gateway status --deep

# 网关是否可达？
clawdbot health --json
# 如果失败，使用连接信息重新运行：
clawdbot health --verbose

# 默认端口是否有服务在监听？
lsof -nP -iTCP:18789 -sTCP:LISTEN

# 最近活动（RPC 日志尾部）
clawdbot logs --follow
# 如果 RPC 不可用，可以使用以下方式作为替代
tail -20 /tmp/clawdbot/clawdbot-*.log
``````
## 重置一切

终极选项：```bash
clawdbot gateway stop
# If you installed a service and want a clean install:
# clawdbot gateway uninstall

trash "${CLAWDBOT_STATE_DIR:-$HOME/.clawdbot}"
clawdbot channels login         # re-pair WhatsApp
clawdbot gateway restart           # or: clawdbot gateway
```
⚠️ 这将丢失所有会话，并需要重新配对 WhatsApp。

## 获取帮助

1. 首先查看日志：`/tmp/clawdbot/`（默认：`clawdbot-YYYY-MM-DD.log`，或你配置的 `logging.file`）
2. 在 GitHub 上搜索已有的问题
3. 打开一个新问题时请提供：
   - Clawdbot 版本
   - 相关的日志片段
   - 复现步骤
   - 你的配置文件（请隐藏敏感信息！）

---

*"你有没有尝试把它关掉再打开？"* — 每个 IT 人员都这么说过

🦞🔧

### 浏览器无法启动（Linux）

如果你看到 `"Failed to start Chrome CDP on port 18800"`：

**最可能的原因：** Ubuntu 上通过 Snap 打包的 Chromium。

**快速解决方法：** 安装 Google Chrome 替代：
bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
``````
然后在配置中设置：```json
{
  "browser": {
    "executablePath": "/usr/bin/google-chrome-stable"
  }
}
```
**完整指南：** 参见 [browser-linux-troubleshooting](/tools/browser-linux-troubleshooting)