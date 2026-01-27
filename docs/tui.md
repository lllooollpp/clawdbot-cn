---
summary: "Terminal UI (TUI): connect to the Gateway from any machine"
read_when:
  - You want a beginner-friendly walkthrough of the TUI
  - You need the complete list of TUI features, commands, and shortcuts
---

# TUI（终端用户界面）

## 快速入门
1) 启动网关。```bash
clawdbot gateway
```
"2) 打开 TUI。"```bash
clawdbot tui
```
3) 输入一条消息并按 Enter 键。

远程网关：```bash
clawdbot tui --url ws://<host>:<port> --token <gateway-token>
```
使用 `--password` 如果你的网关使用密码认证。

## 你看到的内容
- 顶部栏：连接地址、当前代理、当前会话。
- 聊天记录：用户消息、助手回复、系统通知、工具卡片。
- 状态行：连接/运行状态（连接中、运行中、流式传输中、空闲、错误）。
- 底部栏：连接状态 + 代理 + 会话 + 模型 + 思考/详细模式 + token 数量 + 发送。
- 输入框：带有自动补全功能的文本编辑器。

## 心智模型：代理 + 会话
- 代理是唯一的别名（例如 `main`、`research`）。网关会暴露这些代理列表。
- 会话属于当前代理。
- 会话键存储为 `agent:<agentId>:<sessionKey>`。
  - 如果你输入 `/session main`，TUI 会将其扩展为 `agent:<currentAgent>:main`。
  - 如果你输入 `/session agent:other:main`，你将显式切换到该代理的会话。
- 会话作用域：
  - `per-sender`（默认）：每个代理可以有多个会话。
  - `global`：TUI 一直使用 `global` 会话（选择器可能是空的）。
- 当前代理 + 会话始终在底部栏中显示。

## 发送 + 交付
- 消息发送到网关；默认情况下，交付到提供者是关闭的。
- 打开交付：
  - `/deliver on`
  - 或者设置面板
  - 或者以 `clawdbot tui --deliver` 启动

## 选择器 + 覆盖层
- 模型选择器：列出可用的模型并设置会话覆盖。
- 代理选择器：选择不同的代理。
- 会话选择器：仅显示当前代理的会话。
- 设置：切换交付、工具输出展开和思考内容的可见性。

## 键盘快捷键
- Enter：发送消息
- Esc：中止当前运行
- Ctrl+C：清空输入（按两次退出）
- Ctrl+D：退出
- Ctrl+L：模型选择器
- Ctrl+G：代理选择器
- Ctrl+P：会话选择器
- Ctrl+O：切换工具输出展开
- Ctrl+T：切换思考内容可见性（会重新加载历史记录）

## 斜杠命令
核心命令：
- `/help`
- `/status`
- `/agent <id>`（或 `/agents`）
- `/session <key>`（或 `/sessions`）
- `/model <provider/model>`（或 `/models`）

会话控制：
- `/think <off|minimal|low|medium|high>`
- `/verbose <on|full|off>`
- `/reasoning <on|off|stream>`
- `/usage <off|tokens|full>`
- `/elevated <on|off|ask|full>`（别名：`/elev`）
- `/activation <mention|always>`
- `/deliver <on|off>`

会话生命周期：
- `/new` 或 `/reset`（重置会话）
- `/abort`（中止当前运行）
- `/settings`
- `/exit`

其他网关斜杠命令（例如 `/context`）会被转发到网关，并作为系统输出显示。详见 [斜杠命令](/tools/slash-commands)。

## 工具输出
- 工具调用以卡片形式显示参数和结果。
- 按 Ctrl+O 可在折叠/展开视图之间切换。
- 当工具运行时，部分更新会流式传输到同一张卡片中。

## 历史记录 + 流式传输
- 连接时，TUI 会加载最新的历史记录（默认为 200 条消息）。
- 流式响应会在原地更新，直到最终完成。
- TUI 还会监听代理工具事件，以生成更丰富的工具卡片。

## 连接详情
- TUI 会以 `mode: "tui"` 的身份注册到网关。
- 重新连接时会显示系统消息；事件缺失会在日志中显示。

## 选项
- `--url <url>`：网关 WebSocket 地址（默认为配置中的地址或 `ws://127.0.0.1:<port>`）
- `--token <token>`：网关令牌（如需要）
- `--password <password>`：网关密码（如需要）
- `--session <key>`：会话键（默认为 `main`，当作用域为全局时为 `global`）
- `--deliver`：将助手回复发送给提供者（默认关闭）
- `--thinking <level>`：覆盖发送时的思考级别
- `--timeout-ms <ms>`：代理超时时间（毫秒），默认为 `agents.defaults.timeoutSeconds`

## 故障排除

发送消息后没有输出：
- 在 TUI 中运行 `/status` 以确认网关是否已连接且处于空闲/忙碌状态。
- 检查网关日志：`clawdbot logs --follow`。
- 确认代理可以运行：`clawdbot status` 和 `clawdbot models status`。
- 如果你期望在聊天频道中收到消息，请启用交付功能（`/deliver on` 或使用 `--deliver`）。
- `--history-limit <n>`：加载的历史记录条数（默认为 200）

## 故障排除
- `disconnected`：请确保网关正在运行，并且你的 `--url/--token/--password` 参数正确。
- 代理选择器中没有代理：请检查 `clawdbot agents list` 和你的路由配置。
- 空的会话选择器：你可能处于全局作用域，或者尚未创建任何会话。