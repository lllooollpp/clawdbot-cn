---
summary: "Clawdbot CLI reference for `clawdbot` commands, subcommands, and options"
read_when:
  - Adding or modifying CLI commands or options
  - Documenting new command surfaces
---

# CLI 参考

本页面描述了当前 CLI 的行为。如果命令发生变化，请更新此文档。

## 命令列表

- [`setup`](/cli/setup)
- [`onboard`](/cli/onboard)
- [`configure`](/cli/configure)
- [`config`](/cli/config)
- [`doctor`](/cli/doctor)
- [`dashboard`](/cli/dashboard)
- [`reset`](/cli/reset)
- [`uninstall`](/cli/uninstall)
- [`update`](/cli/update)
- [`message`](/cli/message)
- [`agent`](/cli/agent)
- [`agents`](/cli/agents)
- [`acp`](/cli/acp)
- [`status`](/cli/status)
- [`health`](/cli/health)
- [`sessions`](/cli/sessions)
- [`gateway`](/cli/gateway)
- [`logs`](/cli/logs)
- [`system`](/cli/system)
- [`models`](/cli/models)
- [`memory`](/cli/memory)
- [`nodes`](/cli/nodes)
- [`devices`](/cli/devices)
- [`node`](/cli/node)
- [`approvals`](/cli/approvals)
- [`sandbox`](/cli/sandbox)
- [`tui`](/cli/tui)
- [`browser`](/cli/browser)
- [`cron`](/cli/cron)
- [`dns`](/cli/dns)
- [`docs`](/cli/docs)
- [`hooks`](/cli/hooks)
- [`webhooks`](/cli/webhooks)
- [`pairing`](/cli/pairing)
- [`plugins`](/cli/plugins)（插件命令）
- [`channels`](/cli/channels)
- [`security`](/cli/security)
- [`skills`](/cli/skills)
- [`voicecall`](/cli/voicecall)（插件；如果已安装）

## 全局标志

- `--dev`: 在 `~/.clawdbot-dev` 下隔离状态，并更改默认端口。
- `--profile <name>`: 在 `~/.clawdbot-<name>` 下隔离状态。
- `--no-color`: 禁用 ANSI 颜色。
- `--update`: `clawdbot update` 的快捷方式（仅限源码安装）。
- `-V`, `--version`, `-v`: 打印版本并退出。

## 输出样式

- ANSI 颜色和进度指示器仅在 TTY 会话中显示。
- OSC-8 超链接在支持的终端中显示为可点击链接；否则会回退为普通 URL。
- `--json`（以及在支持的环境中 `--plain`）会禁用样式，以获得干净的输出。
- `--no-color` 会禁用 ANSI 样式；`NO_COLOR=1` 也会被尊重。
- 长时间运行的命令会显示进度指示器（在支持的终端中使用 OSC 9;4）。

## 颜色调色板

Clawdbot 使用“龙虾”调色板用于 CLI 输出。

- `accent` (#FF5A2D): 标题、标签、主要高亮。
- `accentBright` (#FF7A3D): 命令名称、强调。
- `accentDim` (#D14A22): 次要高亮文本。
- `info` (#FF8A5B): 信息值。
- `success` (#2FBF71): 成功状态。
- `warn` (#FFB020): 警告、回退、需要关注的内容。
- `error` (#E23D2D): 错误、失败。
- `muted` (#8B7F77): 弱化、元数据。

调色板的原始来源：`src/terminal/palette.ts`（也称为“龙虾缝合线”）。

clawdbot [--dev] [--profile <name>] <command>
  设置
  注册
  配置
  config
    获取
    设置
    取消设置
  诊断
  安全
    审计
  重置
  卸载
  更新
  通道
    列表
    状态
    日志
    添加
    移除
    登录
    注销
  技能
    列表
    信息
    检查
  插件
    列表
    信息
    安装
    启用
    禁用
    诊断
  内存
    状态
    索引
    搜索
  消息
  代理
  代理列表
    列表
    添加
    删除
  ACP
  状态
  健康
  会话
  网关
    调用
    健康
    状态
    探测
    发现
    安装
    卸载
    启动
    停止
    重启
    运行
  日志
  系统
    事件
    心跳 上次|启用|禁用
    在线状态
  模型
    列表
    状态
    设置
    设置图片
    别名 列表|添加|移除
    备用列表 列表|添加|移除|清除
    图片备用列表 列表|添加|移除|清除
    扫描
    认证 添加|设置令牌|粘贴令牌
    认证 顺序 获取|设置|清除
  沙盒
    列表
    重新创建
    解释
  定时任务
    状态
    列表
    添加
    编辑
    删除
    启用
    禁用
    运行
    运行
  节点
  设备
  节点
    运行
    状态
    安装
    卸载
    启动
    停止
    重启
  审批
    获取
    设置
    允许列表 添加|移除
  浏览器
    状态
    启动
    停止
    重置配置文件
    标签页
    打开
    聚焦
    关闭
    配置文件
    创建配置文件
    删除配置文件
    截图
    快照
    导航
    调整大小
    点击
    输入
    按压
    悬停
    拖动
    选择
    上传
    填写
    对话框
    等待
    评估
    控制台
    PDF
  钩子
    列表
    信息
    检查
    启用
    禁用
    安装
    更新
  Webhook
    Gmail 设置|运行
  配对
    列表
    批准
  文档
  DNS
    设置
  TUI``````
注意：插件可以添加额外的顶级命令（例如 `clawdbot voicecall`）。

## 安全性

- `clawdbot security audit` — 审计配置和本地状态中的常见安全问题。
- `clawdbot security audit --deep` — 尽力而为的实时网关探测。
- `clawdbot security audit --fix` — 加强安全默认设置并调整状态/配置的权限。

## 插件

管理扩展及其配置：

- `clawdbot plugins list` — 发现插件（使用 `--json` 以获取机器可读输出）。
- `clawdbot plugins info <id>` — 显示某个插件的详细信息。
- `clawdbot plugins install <path|.tgz|npm-spec>` — 安装插件（或将插件路径添加到 `plugins.load.paths`）。
- `clawdbot plugins enable <id>` / `disable <id>` — 切换 `plugins.entries.<id>.enabled` 状态。
- `clawdbot plugins doctor` — 报告插件加载错误。

大多数插件更改需要重启网关。请参见 [/plugin](/plugin)。

## 内存

对 `MEMORY.md` + `memory/*.md` 进行向量搜索：

- `clawdbot memory status` — 显示索引统计信息。
- `clawdbot memory index` — 重新索引内存文件。
- `clawdbot memory search "<query>"` — 在内存中进行语义搜索。

## 聊天斜杠命令

聊天消息支持 `/...` 命令（文本和原生命令）。请参见 [/tools/slash-commands](/tools/slash-commands)。

亮点：
- `/status` 用于快速诊断。
- `/config` 用于持久化配置更改。
- `/debug` 用于运行时仅有的配置覆盖（仅内存，不保存到磁盘；需要 `commands.debug: true`）。

选项：
- `--workspace <dir>`
- `--reset`（在向导之前重置配置 + 凭据 + 会话 + 工作区）
- `--non-interactive`
- `--mode <local|remote>`
- `--flow <quickstart|advanced|manual>`（manual 是 advanced 的别名）
- `--auth-choice <setup-token|claude-cli|token|openai-codex|openai-api-key|openrouter-api-key|ai-gateway-api-key|moonshot-api-key|kimi-code-api-key|codex-cli|gemini-api-key|zai-api-key|apiKey|minimax-api|opencode-zen|skip>`
- `--token-provider <id>`（非交互模式；与 `--auth-choice token` 一起使用）
- `--token <token>`（非交互模式；与 `--auth-choice token` 一起使用）
- `--token-profile-id <id>`（非交互模式；默认值：`<provider>:manual`）
- `--token-expires-in <duration>`（非交互模式；例如 `365d`, `12h`）
- `--anthropic-api-key <key>`
- `--openai-api-key <key>`
- `--openrouter-api-key <key>`
- `--ai-gateway-api-key <key>`
- `--moonshot-api-key <key>`
- `--kimi-code-api-key <key>`
- `--gemini-api-key <key>`
- `--zai-api-key <key>`
- `--minimax-api-key <key>`
- `--opencode-zen-api-key <key>`
- `--gateway-port <port>`
- `--gateway-bind <loopback|lan|tailnet|auto|custom>`
- `--gateway-auth <off|token|password>`
- `--gateway-token <token>`
- `--gateway-password <password>`
- `--remote-url <url>`
- `--remote-token <token>`
- `--tailscale <off|serve|funnel>`
- `--tailscale-reset-on-exit`
- `--install-daemon`
- `--no-install-daemon`（别名：`--skip-daemon`）
- `--daemon-runtime <node|bun>`
- `--skip-channels`
- `--skip-skills`
- `--skip-health`
- `--skip-ui`
- `--node-manager <npm|pnpm|bun>`（推荐使用 pnpm；不推荐在 Gateway 运行时使用 bun）
- `--json`

### `configure`
交互式配置向导（模型、频道、技能、网关）。

### `config`
非交互式配置工具（获取/设置/取消设置）。运行 `clawdbot config` 而没有子命令时将启动向导。

子命令：
- `config get <path>`：打印配置值（点/括号路径）。
- `config set <path> <value>`：设置值（JSON5 或原始字符串）。
- `config unset <path>`：删除值。

### `doctor`
健康检查 + 快速修复（配置 + 网关 + 旧服务）。

选项：
- `--no-workspace-suggestions`：禁用工作区内存提示。
- `--yes`：无需提示直接接受默认值（无头模式）。
- `--non-interactive`：跳过提示；仅应用安全迁移。
- `--deep`：扫描系统服务以查找额外的网关安装。

## 频道辅助工具

### `channels`
管理聊天频道账户（WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost（插件）/Signal/iMessage/MS Teams）。

子命令：
- `channels list`：显示已配置的频道和认证配置文件（包括 Claude Code 和 Codex CLI 的 OAuth 同步）。
- `channels status`：检查网关的可达性和频道健康状态（`--probe` 会运行额外的检查；使用 `clawdbot health` 或 `clawdbot status --deep` 进行网关健康检查）。
- 提示：当检测到常见配置错误时，`channels status` 会打印警告信息并提供修复建议（随后会引导你使用 `clawdbot doctor`）。
- `channels logs`：显示来自网关日志文件的最近频道日志。
- `channels add`：当不传递标志时以向导形式进行设置；标志会切换到非交互模式。
- `channels remove`：默认为禁用；传递 `--delete` 以在不提示的情况下删除配置条目。
- `channels login`：交互式频道登录（仅支持 WhatsApp Web）。
- `channels logout`：退出频道会话（如果支持的话）。

通用选项：
- `--channel <name>`：`whatsapp|telegram|discord|googlechat|slack|mattermost|signal|imessage|msteams`
- `--account <id>`：频道账号 ID（默认为 `default`）
- `--name <label>`：账号的显示名称

`channels login` 选项：
- `--channel <channel>`（默认为 `whatsapp`；支持 `whatsapp`/`web`）
- `--account <id>`
- `--verbose`

`channels logout` 选项：
- `--channel <channel>`（默认为 `whatsapp`）
- `--account <id>`

`channels list` 选项：
- `--no-usage`：跳过模型提供者的使用/配额快照（仅适用于 OAuth/API 支持的配置）。
- `--json`：输出 JSON 格式（包括使用情况，除非设置了 `--no-usage`）。

`channels logs` 选项：
- `--channel <name|all>`（默认为 `all`）
- `--lines <n>`（默认为 `200`）
- `--json`

OAuth 同步源：
- Claude Code → `anthropic:claude-cli`
  - macOS：Keychain 中的 "Claude Code-credentials" 条目（选择 "Always Allow" 以避免 launchd 提示）
  - Linux/Windows：`~/.claude/.credentials.json`
- `~/.codex/auth.json` → `openai-codex:codex-cli`

更多信息：[/concepts/oauth](/concepts/oauth)

示例：```bash
clawdbot channels add --channel telegram --account alerts --name "Alerts Bot" --token $TELEGRAM_BOT_TOKEN
clawdbot channels add --channel discord --account work --name "Work Bot" --token $DISCORD_BOT_TOKEN
clawdbot channels remove --channel discord --account work --delete
clawdbot channels status --probe
clawdbot status --deep
```
```md
### `skills`
列出并检查可用技能及其准备状态信息。

子命令：
- `skills list`: 列出技能（默认子命令）。
- `skills info <name>`: 显示某个技能的详细信息。
- `skills check`: 显示已满足与缺失的依赖项摘要。

选项：
- `--eligible`: 仅显示已准备好的技能。
- `--json`: 输出 JSON 格式（无格式化）。
- `-v`, `--verbose`: 包含缺失依赖项的详细信息。

提示：使用 `npx clawdhub` 来搜索、安装和同步技能。

### `pairing`
批准跨频道的 DM 配对请求。

子命令：
- `pairing list <channel> [--json]`
- `pairing approve <channel> <code> [--notify]`

### `webhooks gmail`
Gmail Pub/Sub 钩子设置 + 运行器。参见 [/automation/gmail-pubsub](/automation/gmail-pubsub)。

子命令：
- `webhooks gmail setup`（需要 `--account <email>`；支持 `--project`, `--topic`, `--subscription`, `--label`, `--hook-url`, `--hook-token`, `--push-token`, `--bind`, `--port`, `--path`, `--include-body`, `--max-bytes`, `--renew-minutes`, `--tailscale`, `--tailscale-path`, `--tailscale-target`, `--push-endpoint`, `--json`）
- `webhooks gmail run`（运行时覆盖相同的标志）

### `dns setup`
广域发现 DNS 辅助工具（CoreDNS + Tailscale）。参见 [/gateway/discovery](/gateway/discovery)。

选项：
- `--apply`: 安装/更新 CoreDNS 配置（需要 sudo；仅限 macOS）。

## 消息 + 代理

### `message`
统一的出站消息 + 频道操作。

参见：[/cli/message](/cli/message)

子命令：
- `message send|poll|react|reactions|read|edit|delete|pin|unpin|pins|permissions|search|timeout|kick|ban`
- `message thread <create|list|reply>`
- `message emoji <list|upload>`
- `message sticker <send|upload>`
- `message role <info|add|remove>`
- `message channel <info|list>`
- `message member info`
- `message voice status`
- `message event <list|create>`

示例：
- `clawdbot message send --target +15555550123 --message "Hi"`
- `clawdbot message poll --channel discord --target channel:123 --poll-question "Snack?" --poll-option Pizza --poll-option Sushi`

### `agent`
通过网关运行一个代理回合（或使用 `--local` 嵌入式）。

必需：
- `--message <text>`

选项：
- `--to <dest>`（用于会话密钥和可选传递）
- `--session-id <id>`
- `--thinking <off|minimal|low|medium|high|xhigh>`（仅适用于 GPT-5.2 + Codex 模型）
- `--verbose <on|full|off>`
- `--channel <whatsapp|telegram|discord|slack|mattermost|signal|imessage|msteams>`
- `--local`
- `--deliver`
- `--json`
- `--timeout <seconds>`

### `agents`
管理隔离的代理（工作区 + 认证 + 路由）。

#### `agents list`
列出已配置的代理。

选项：
- `--json`
- `--bindings`

#### `agents add [name]`
添加一个新的隔离代理。除非传递标志（或 `--non-interactive`），否则会运行引导向导；在非交互模式下，`--workspace` 是必需的。

选项：
- `--workspace <dir>`
- `--model <id>`
- `--agent-dir <dir>`
- `--bind <channel[:accountId]>`（可重复）
- `--non-interactive`
- `--json`

绑定规范使用 `channel[:accountId]`。当 WhatsApp 的 `accountId` 被省略时，将使用默认的 `accountId`。

#### `agents delete <id>`
删除代理并清理其工作区 + 状态。

选项：
- `--force`
- `--json`

### `acp`
运行 ACP 桥接器，将 IDE 连接到网关。

详见 [`acp`](/cli/acp) 了解完整的选项和示例。

### `status`
显示已连接的会话健康状态和最近的接收者。

选项：
- `--json`
- `--all`（完整诊断；只读，可粘贴）
- `--deep`（探测通道）
- `--usage`（显示模型提供方的使用情况/配额）
- `--timeout <ms>`
- `--verbose`
- `--debug`（等价于 `--verbose`）

备注：
- 概览包括网关 + 节点主机服务状态（如果可用）。

### 使用情况跟踪
当有 OAuth/API 凭据时，Clawdbot 可以显示提供方的使用情况/配额。

显示的内容包括：
- `/status`（当有可用信息时，添加一条简短的提供方使用情况）
- `clawdbot status --usage`（打印完整的提供方使用情况）
- macOS 菜单栏（在“Context”下有“Usage”部分）

### 备注：
- 数据直接来自提供方的使用情况端点（无估算）。
- 提供方包括：Anthropic、GitHub Copilot、OpenAI Codex OAuth，以及在启用了相应插件时的 Gemini CLI/Antigravity。
- 如果没有匹配的凭据，将隐藏使用情况。
- 详情：参见 [使用情况跟踪](/concepts/usage-tracking)。

### `health`
从正在运行的网关获取健康状态。

选项：
- `--json`
- `--timeout <ms>`
- `--verbose`

### `sessions`
列出存储的对话会话。

选项：
- `--json`
- `--verbose`
- `--store <path>`
- `--active <minutes>`

## 重置 / 卸载

### `reset`
重置本地配置/状态（保留 CLI 安装）。

选项：
- `--scope <config|config+creds+sessions|full>`
- `--yes`
- `--non-interactive`
- `--dry-run`

备注：
- `--non-interactive` 需要 `--scope` 和 `--yes`。

### `uninstall`
卸载网关服务 + 本地数据（CLI 保留）。

选项：
- `--service`
- `--state`
- `--workspace`
- `--app`
- `--all`
- `--yes`
- `--non-interactive`
- `--dry-run`

备注：
- `--non-interactive` 需要 `--yes` 和显式指定的作用域（或 `--all`）。

## 网关

### `gateway`
运行 WebSocket 网关。

选项：
- `--port <port>`
- `--bind <loopback|tailnet|lan|auto|custom>`
- `--token <token>`
- `--auth <token|password>`
- `--password <password>`
- `--tailscale <off|serve|funnel>`
- `--tailscale-reset-on-exit`
- `--allow-unconfigured`
- `--dev`
- `--reset`（重置开发配置 + 凭据 + 会话 + 工作区）
- `--force`（终止端口上的现有监听器）
- `--verbose`
- `--claude-cli-logs`
- `--ws-log <auto|full|compact>`
- `--compact`（等价于 `--ws-log compact`）
- `--raw-stream`
- `--raw-stream-path <path>`

### `gateway service`
管理网关服务（launchd/systemd/schtasks）。

子命令：
- `gateway status`（默认通过网关 RPC 探测状态）
- `gateway install`（服务安装）
- `gateway uninstall`
- `gateway start`
- `gateway stop`
- `gateway restart`

说明：
- `gateway status` 默认通过服务的解析端口/配置来探测 Gateway RPC（可通过 `--url/--token/--password` 覆盖）。
- `gateway status` 支持 `--no-probe`、`--deep` 和 `--json` 用于脚本处理。
- `gateway status` 在能够检测到旧版或额外网关服务时，也会将其显示出来（`--deep` 会增加系统级扫描）。以 Profile 命名的 Clawdbot 服务被视为第一优先级，不会被标记为 "额外"。
- `gateway status` 会打印 CLI 使用的配置路径与服务实际可能使用的配置路径（服务环境变量），以及解析后的探测目标 URL。
- `gateway install|uninstall|start|stop|restart` 支持 `--json` 用于脚本处理（默认输出仍为人类可读格式）。
- `gateway install` 默认使用 Node 运行时；**不推荐使用 bun**（可能会导致 WhatsApp/Telegram 的问题）。
- `gateway install` 的选项包括：`--port`、`--runtime`、`--token`、`--force`、`--json`。

### `logs`
通过 RPC 尾随 Gateway 的文件日志。

说明：
- TTY 会话会显示颜色化、结构化的视图；非 TTY 会回退为纯文本。
- `--json` 会输出逐行的 JSON（每行一个日志事件）。

示例：
bash
clawdbot logs --follow
clawdbot logs --limit 200
clawdbot logs --plain
clawdbot logs --json
clawdbot logs --no-color### `gateway <子命令>`
网关 CLI 辅助工具（使用 `--url`、`--token`、`--password`、`--timeout`、`--expect-final` 用于 RPC 子命令）。

子命令：
- `gateway call <方法> [--params <json>]`
- `gateway health`
- `gateway status`
- `gateway probe`
- `gateway discover`
- `gateway install|uninstall|start|stop|restart`
- `gateway run`

常用 RPC：
- `config.apply`（验证 + 写入配置 + 重启 + 唤醒）
- `config.patch`（合并部分更新 + 重启 + 唤醒）
- `update.run`（运行更新 + 重启 + 唤醒）

提示：当直接调用 `config.set`/`config.apply`/`config.patch` 时，如果已有配置，请传递 `config.get` 中的 `baseHash`。
bash
claude setup-token
clawdbot models status
``````
### `models`（根目录）
`clawdbot models` 是 `models status` 的别名。

根目录选项：
- `--status-json`（等同于 `models status --json`）
- `--status-plain`（等同于 `models status --plain`）

### `models list`
选项：
- `--all`
- `--local`
- `--provider <name>`
- `--json`
- `--plain`

### `models status`
选项：
- `--json`
- `--plain`
- `--check`（退出代码 1=过期/缺失，2=即将过期）
- `--probe`（对配置的认证配置文件进行实时探测）
- `--probe-provider <name>`
- `--probe-profile <id>`（可重复或逗号分隔）
- `--probe-timeout <ms>`
- `--probe-concurrency <n>`
- `--probe-max-tokens <n>`

始终包含认证概览和认证存储中配置文件的 OAuth 过期状态。
`--probe` 会执行实时请求（可能会消耗令牌并触发速率限制）。

### `models set <model>`
设置 `agents.defaults.model.primary`。

### `models set-image <model>`
设置 `agents.defaults.imageModel.primary`。

### `models aliases list|add|remove`
选项：
- `list`: `--json`, `--plain`
- `add <alias> <model>`
- `remove <alias>`

### `models fallbacks list|add|remove|clear`
选项：
- `list`: `--json`, `--plain`
- `add <model>`
- `remove <model>`
- `clear`

### `models image-fallbacks list|add|remove|clear`
选项：
- `list`: `--json`, `--plain`
- `add <model>`
- `remove <model>`
- `clear`

### `models scan`
选项：
- `--min-params <b>`
- `--max-age-days <days>`
- `--provider <name>`
- `--max-candidates <n>`
- `--timeout <ms>`
- `--concurrency <n>`
- `--no-probe`
- `--yes`
- `--no-input`
- `--set-default`
- `--set-image`
- `--json`

### `models auth add|setup-token|paste-token`
选项：
- `add`: 交互式认证助手
- `setup-token`: `--provider <name>`（默认为 `anthropic`），`--yes`
- `paste-token`: `--provider <name>`，`--profile-id <id>`，`--expires-in <duration>`

### `models auth order get|set|clear`
选项：
- `get`: `--provider <name>`，`--agent <id>`，`--json`
- `set`: `--provider <name>`，`--agent <id>`，`<profileIds...>`
- `clear`: `--provider <name>`，`--agent <id>`

## 系统

### `system event`
将系统事件加入队列，并可选地触发心跳（Gateway RPC）。

必需参数：
- `--text <text>`

选项：
- `--mode <now|next-heartbeat>`
- `--json`
- `--url`，`--token`，`--timeout`，`--expect-final`

### `system heartbeat last|enable|disable`
心跳控制（Gateway RPC）。

选项：
- `--json`
- `--url`，`--token`，`--timeout`，`--expect-final`

### `system presence`
列出系统在线状态条目（Gateway RPC）。

选项：
- `--json`
- `--url`，`--token`，`--timeout`，`--expect-final`

## 定时任务
管理定时任务（Gateway RPC）。详见 [/automation/cron-jobs](/automation/cron-jobs)。

子命令：
- `cron 状态 [--json]`
- `cron 列表 [--all] [--json]`（默认为表格输出；使用 `--json` 获取原始数据）
- `cron 添加`（别名：`创建`；需要 `--name` 以及 `--at` | `--every` | `--cron` 中的恰好一个，以及 `--system-event` | `--message` 中的恰好一个有效载荷）
- `cron 编辑 <id>`（部分字段更新）
- `cron 移除 <id>`（别名：`删除`，`删除`）
- `cron 启用 <id>`
- `cron 禁用 <id>`
- `cron 运行 --id <id> [--limit <n>]`
- `cron 运行 <id> [--force]`

所有 `cron` 命令都接受 `--url`、`--token`、`--timeout`、`--expect-final`。

## 节点主机

`node` 运行一个 **无头节点主机** 或将其作为后台服务进行管理。详见 [`clawdbot node`](/cli/node)。

子命令：
- `node 运行 --host <网关主机> --port 18789`
- `node 状态`
- `node 安装 [--host <网关主机>] [--port <端口>] [--tls] [--tls-fingerprint <sha256>] [--node-id <id>] [--显示名称 <名称>] [--运行时 <node|bun>] [--force]`
- `node 卸载`
- `node 停止`
- `node 重启`

## 节点

`nodes` 与网关通信并管理配对的节点。详见 [/nodes](/nodes)。

```md
通用选项：
- `--url`、`--token`、`--timeout`、`--json`

子命令：
- `nodes 状态 [--connected] [--最后连接 <持续时间>]`
- `nodes 描述 --node <id|name|ip>`
- `nodes 列表 [--connected] [--最后连接 <持续时间>]`
- `nodes 待处理`
- `nodes 拒绝 <requestId>`
- `nodes 重命名 --node <id|name|ip> --name <显示名称>`
- `nodes 调用 --node <id|name|ip> --command <命令> [--params <json>] [--调用超时 <毫秒>] [--幂等性键 <键>]`
- `nodes 运行 --node <id|name|ip> [--cwd <路径>] [--env KEY=VAL] [--命令超时 <毫秒>] [--需要屏幕录制] [--调用超时 <毫秒>] <命令...>`（适用于 macOS 节点或无头节点主机）
- `nodes 通知 --node <id|name|ip> [--标题 <文本>] [--正文 <文本>] [--声音 <名称>] [--优先级 <passive|active|timeSensitive>] [--交付方式 <system|overlay|auto>] [--调用超时 <毫秒>]`（仅适用于 macOS）

摄像头：
- `nodes 摄像头 列表 --node <id|name|ip>`
- `nodes 摄像头 快照 --node <id|name|ip> [--方向 front|back|both] [--设备ID <id>] [--最大宽度 <像素>] [--质量 <0-1>] [--延迟 <毫秒>] [--调用超时 <毫秒>]`
- `nodes 摄像头 录像 --node <id|name|ip> [--方向 front|back] [--设备ID <id>] [--持续时间 <毫秒|10s|1m>] [--无音频] [--调用超时 <毫秒>]`

Canvas + 屏幕：
- `nodes canvas snapshot --node <id|name|ip> [--format png|jpg|jpeg] [--max-width <px>] [--quality <0-1>] [--invoke-timeout <ms>]`
- `nodes canvas present --node <id|name|ip> [--target <urlOrPath>] [--x <px>] [--y <px>] [--width <px>] [--height <px>] [--invoke-timeout <ms>]`
- `nodes canvas hide --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes canvas navigate <url> --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes canvas eval [<js>] --node <id|name|ip> [--js <code>] [--invoke-timeout <ms>]`
- `nodes canvas a2ui push --node <id|name|ip> (--jsonl <path> | --text <text>) [--invoke-timeout <ms>]`
- `nodes canvas a2ui reset --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes screen record --node <id|name|ip> [--screen <index>] [--duration <ms|10s>] [--fps <n>] [--no-audio] [--out <path>] [--invoke-timeout <ms>]`

位置：
- `nodes location get --node <id|name|ip> [--max-age <ms>] [--accuracy <coarse|balanced|precise>] [--location-timeout <ms>] [--invoke-timeout <ms>]`

## 浏览器

浏览器控制 CLI（专用于 Chrome/Brave/Edge/Chromium）。请参阅 [`clawdbot browser`](/cli/browser) 和 [浏览器工具](/tools/browser)。

通用选项：
- `--url <controlUrl>`
- `--browser-profile <name>`
- `--json`

管理：
- `browser status`
- `browser start`
- `browser stop`
- `browser reset-profile`
- `browser tabs`
- `browser open <url>`
- `browser focus <targetId>`
- `browser close [targetId]`
- `browser profiles`
- `browser create-profile --name <name> [--color <hex>] [--cdp-url <url>]`
- `browser delete-profile --name <name>`

检查：
- `browser screenshot [targetId] [--full-page] [--ref <ref>] [--element <selector>] [--type png|jpeg]`
- `browser snapshot [--format aria|ai] [--target-id <id>] [--limit <n>] [--interactive] [--compact] [--depth <n>] [--selector <sel>] [--out <path>]`

操作：
- `browser navigate <url> [--target-id <id>]`
- `browser resize <width> <height> [--target-id <id>]`
- `browser click <ref> [--double] [--button <left|right|middle>] [--modifiers <csv>] [--target-id <id>]`
- `browser type <ref> <text> [--submit] [--slowly] [--target-id <id>]`
- `browser press <key> [--target-id <id>]`
- `browser hover <ref> [--target-id <id>]`
- `browser drag <startRef> <endRef> [--target-id <id>]`
- `browser select <ref> <values...> [--target-id <id>]`
- `browser upload <paths...> [--ref <ref>] [--input-ref <ref>] [--element <selector>] [--target-id <id>] [--timeout-ms <ms>]`
- `browser fill [--fields <json>] [--fields-file <path>] [--target-id <id>]`
- `browser dialog --accept|--dismiss [--prompt <text>] [--target-id <id>] [--timeout-ms <ms>]`
- `browser wait [--time <ms>] [--text <value>] [--text-gone <value>] [--target-id <id>]`
- `browser evaluate --fn <code> [--ref <ref>] [--target-id <id>]`
- `browser console [--level <error|warn|info>] [--target-id <id>]`
- `browser pdf [--target-id <id>]`

## 文档搜索

### `docs [query...]`
搜索实时文档索引。

## TUI

### `tui`
打开连接到网关的终端用户界面。

选项：
- `--url <url>`
- `--token <token>`
- `--password <password>`
- `--session <key>`
- `--deliver`
- `--thinking <level>`
- `--message <text>`
- `--timeout-ms <ms>`（默认值为 `agents.defaults.timeoutSeconds`）
- `--history-limit <n>`