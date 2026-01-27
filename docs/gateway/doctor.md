---
summary: "Doctor command: health checks, config migrations, and repair steps"
read_when:
  - Adding or modifying doctor migrations
  - Introducing breaking config changes
---

# 医生

`clawdbot doctor` 是 Clawdbot 的修复 + 迁移工具。它可以修复过时的配置/状态，检查健康状况，并提供可操作的修复步骤。

## 快速开始
bash
clawdbot doctor
``````
### 无头/自动化```bash
clawdbot doctor --yes
```
接受默认设置，不进行提示（在适用时包括重启/服务/沙盒修复步骤）。
bash
clawdbot doctor --repair
``````
无需提示即可应用推荐的修复措施（在安全的情况下进行修复和重启）。```bash
clawdbot doctor --repair --force
```
应用激进修复（会覆盖自定义的 supervisor 配置）。
bash
clawdbot doctor --non-interactive
``````
无需提示，仅应用安全迁移（配置规范化 + 磁盘状态移动）。跳过需要人工确认的重启/服务/沙箱操作。
当检测到旧版状态迁移时，会自动运行。```bash
clawdbot doctor --deep
```
扫描系统服务中的额外网关安装（launchd/systemd/schtasks）。

如果想在写入之前查看更改，请先打开配置文件：
bash
cat ~/.clawdbot/clawdbot.json
``````
```md
## 它的功能（摘要）
- 可选的预飞行更新（仅适用于 git 安装，交互模式下）。
- UI 协议新鲜度检查（当协议模式较新时重新构建 Control UI）。
- 健康检查 + 重启提示。
- 技能状态摘要（符合条件/缺失/被阻止）。
- 配置标准化处理（处理旧版配置值）。
- OpenCode Zen 提供商覆盖警告（`models.providers.opencode`）。
- 旧版磁盘状态迁移（会话/代理目录/WhatsApp 身份验证）。
- 状态完整性与权限检查（会话、对话记录、状态目录）。
- 本地运行时配置文件权限检查（chmod 600）。
- 模型认证健康检查：检查 OAuth 过期情况，可刷新即将过期的令牌，并报告认证配置文件的冷却/禁用状态。
- 额外工作目录检测（`~/clawdbot`）。
- 当启用沙盒时修复沙盒镜像。
- 旧版服务迁移与额外网关检测。
- 网关运行时检查（服务已安装但未运行；缓存的 launchd 标签）。
- 渠道状态警告（从正在运行的网关探测）。
- Supervisor 配置审计（launchd/systemd/schtasks）并可选修复。
- 网关运行时最佳实践检查（Node 与 Bun，版本管理器路径）。
- 网关端口冲突诊断（默认端口 `18789`）。
- 开放直接消息策略的安全警告。
- 当未设置 `gateway.auth.token` 时的网关认证警告（本地模式；提供令牌生成选项）。
- 在 Linux 上检查 systemd linger。
- 源码安装检查（pnpm 工作区不匹配，缺少 UI 资源，缺少 tsx 二进制文件）。
- 写入更新后的配置 + 向导元数据。

## 详细行为与原理

### 0）可选更新（git 安装）
如果这是 git 的检出版本，并且 doctor 是在交互模式下运行的，它会在运行 doctor 之前提供更新选项（fetch/rebase/build）。

### 1）配置标准化
如果配置中包含旧版值结构（例如 `messages.ackReaction` 而没有渠道特定的覆盖），doctor 会将其标准化为当前模式。

### 2）旧版配置键迁移
当配置中包含已弃用的键时，其他命令将拒绝运行，并提示你运行 `clawdbot doctor`。

doctor 会：
- 说明发现了哪些旧版键。
- 显示它应用的迁移内容。
- 用更新后的模式重写 `~/.clawdbot/clawdbot.json`。

当网关检测到旧版配置格式时，也会在启动时自动运行 doctor 的迁移，从而无需人工干预即可修复过时的配置。

当前迁移：
- `routing.allowFrom` → `channels.whatsapp.allowFrom`
- `routing.groupChat.requireMention` → `channels.whatsapp/telegram/imessage.groups."*".requireMention`
- `routing.groupChat.historyLimit` → `messages.groupChat.historyLimit`
- `routing.groupChat.mentionPatterns` → `messages.groupChat.mentionPatterns`
- `routing.queue` → `messages.queue`
- `routing.bindings` → 顶级 `bindings`
- `routing.agents`/`routing.defaultAgentId` → `agents.list` + `agents.list[].default`
- `routing.agentToAgent` → `tools.agentToAgent`
- `routing.transcribeAudio` → `tools.media.audio.models`
- `bindings[].match.accountID` → `bindings[].match.accountId`
- `identity` → `agents.list[].identity`
- `agent.*` → `agents.defaults` + `tools.*`（tools/elevated/exec/sandbox/subagents）
- `agent.model`/`allowedModels`/`modelAliases`/`modelFallbacks`/`imageModelFallbacks`
  → `agents.defaults.models` + `agents.defaults.model.primary/fallbacks` + `agents.defaults.imageModel.primary/fallbacks`

### 2b）OpenCode Zen 提供商覆盖
如果你手动添加了 `models.providers.opencode`（或 `opencode-zen`），它会覆盖 `@mariozechner/pi-ai` 中的内置 OpenCode Zen 目录。这可能会将所有模型强制绑定到单一 API 或将成本归零。Doctor 会发出警告，以便你可以移除覆盖并恢复按模型的 API 路由 + 成本。

### 3）旧版状态迁移（磁盘结构）
Doctor 可以将旧的磁盘结构迁移到当前结构：
- 会话存储 + 通话记录：
  - 从 `~/.clawdbot/sessions/` 迁移到 `~/.clawdbot/agents/<agentId>/sessions/`
- 代理目录：
  - 从 `~/.clawdbot/agent/` 迁移到 `~/.clawdbot/agents/<agentId>/agent/`
- WhatsApp 身份验证状态（Baileys）：
  - 从旧版 `~/.clawdbot/credentials/*.json`（除了 `oauth.json`）
  - 迁移到 `~/.clawdbot/credentials/whatsapp/<accountId>/...`（默认账户 ID：`default`）

这些迁移是尽力而为且幂等的；如果 Doctor 留下了任何旧文件夹作为备份，它会发出警告。网关/CLI 也会在启动时自动迁移旧版会话 + 代理目录，以便历史记录/身份验证/模型数据自动进入每个代理的路径，而无需手动运行 Doctor。WhatsApp 身份验证仅通过 `clawdbot doctor` 进行迁移。
### 4）状态完整性检查（会话持久化、路由和安全）
状态目录是操作的核心。如果它消失，你将丢失会话、凭证、日志和配置（除非你有其他地方的备份）。

**医生检查项：**
- **状态目录缺失**：发出关于灾难性状态丢失的警告，提示重新创建目录，并提醒你无法恢复丢失的数据。
- **状态目录权限**：验证可写性；提供权限修复选项（当检测到所有者/组不匹配时会发出 `chown` 提示）。
- **会话目录缺失**：`sessions/` 和会话存储目录是必需的，用于持久化历史记录并避免 `ENOENT` 崩溃。
- **转录文件不匹配**：当最近的会话条目缺少转录文件时会发出警告。
- **主会话“单行 JSONL”**：当主转录文件只有一行时会标记（历史记录未累积）。
- **多个状态目录**：当在多个主目录中存在 `~/.clawdbot` 文件夹，或 `CLAWDBOT_STATE_DIR` 指向其他位置时会发出警告（可能导致历史记录分散在不同安装中）。
- **远程模式提醒**：如果 `gateway.mode=remote`，医生会提醒你在远程主机上运行（状态文件存储在那里）。
- **配置文件权限**：如果 `~/.clawdbot/clawdbot.json` 对组或世界可读，会发出警告并建议将其权限收紧为 `600`。

### 5）模型认证健康（OAuth 过期）
医生检查认证存储中的 OAuth 配置，当令牌即将过期或已过期时发出警告，并在安全的情况下尝试刷新。如果 Anthropic Claude Code 配置文件已过时，会建议运行 `claude setup-token`（或粘贴设置令牌）。刷新提示仅在交互模式（TTY）下出现；`--non-interactive` 会跳过刷新尝试。

医生还会报告因以下原因暂时不可用的认证配置文件：
- 短暂的冷却期（速率限制/超时/认证失败）
- 更长时间的禁用（账单/信用问题）

### 6）钩子模型验证
如果设置了 `hooks.gmail.model`，医生会验证模型引用是否与目录和允许列表匹配，并在无法解析或被禁止时发出警告。

### 7）沙箱镜像修复
当启用沙箱时，医生会检查 Docker 镜像，并在当前镜像缺失时提示构建或切换到旧版名称。

### 8）网关服务迁移和清理提示
医生检测旧版网关服务（launchd/systemd/schtasks），并提示移除它们，使用当前网关端口安装 Clawdbot 服务。它还可以扫描其他类似网关的服务并输出清理提示。以配置文件命名的 Clawdbot 网关服务被视为优先级最高的服务，不会被标记为“额外”服务。

### 9）安全警告
当提供者对 DM（私信）开放但未设置允许列表，或策略配置存在危险方式时，医生会发出警告。

### 10）systemd linger（Linux）
如果作为 systemd 用户服务运行，医生会确保启用了 linger 功能，以便在退出登录后网关仍保持运行。

### 11）技能状态
医生会打印当前工作区中可用/缺失/被阻止的技能的快速摘要。

### 12）网关身份验证检查（本地令牌）
当本地网关缺少 `gateway.auth` 时，Doctor 会发出警告，并提供生成令牌的选项。在自动化环境中，可以使用 `clawdbot doctor --generate-gateway-token` 强制生成令牌。

### 13）网关健康检查 + 重启
Doctor 运行健康检查，并在检测到网关不健康时提供重启选项。

### 14）通道状态警告
如果网关是健康的，Doctor 会运行通道状态探测，并报告警告以及建议的修复方法。

### 15）Supervisor 配置审计 + 修复
Doctor 检查已安装的 Supervisor 配置（launchd/systemd/schtasks），查找缺失或过时的默认设置（例如 systemd 的 network-online 依赖项和重启延迟）。当发现不匹配时，会建议更新，并可将服务文件/任务重写为当前默认设置。

**注意事项：**
- `clawdbot doctor` 在重写 Supervisor 配置前会进行提示。
- `clawdbot doctor --yes` 会接受默认的修复提示。
- `clawdbot doctor --repair` 会应用建议的修复，但不会提示。
- `clawdbot doctor --repair --force` 会强制覆盖自定义的 Supervisor 配置。
- 你也可以通过 `clawdbot gateway install --force` 强制进行完整的重写。

### 16）网关运行时 + 端口诊断
Doctor 检查服务运行时（PID、最后一次退出状态），并在服务已安装但未实际运行时发出警告。它还会检查网关端口（默认为 `18789`）是否有端口冲突，并报告可能的原因（如网关已运行、SSH 隧道等）。

### 17）网关运行时最佳实践
当网关服务运行在 Bun 或版本管理的 Node 路径上（如 `nvm`、`fnm`、`volta`、`asdf` 等）时，Doctor 会发出警告。WhatsApp 和 Telegram 通道需要 Node，而版本管理路径在升级后可能会出现问题，因为服务不会加载你的 shell 初始化脚本。当系统中存在可用的 Node 安装（如 Homebrew/apt/choco）时，Doctor 会提供迁移到系统 Node 安装的选项。

### 18）配置写入 + 向导元数据
Doctor 会保存任何配置更改，并添加向导元数据以记录 Doctor 的运行情况。

### 19）工作区提示（备份 + 内存系统）
当缺少工作区内存系统时，Doctor 会提出建议，并在工作区尚未在 Git 管理下时打印备份提示。

有关工作区结构和 Git 备份的完整指南，请参阅 [/concepts/agent-workspace](/concepts/agent-workspace)（推荐使用私有的 GitHub 或 GitLab 仓库）。