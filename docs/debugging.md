---
summary: "Debugging tools: watch mode, raw model streams, and tracing reasoning leakage"
read_when:
  - You need to inspect raw model output for reasoning leakage
  - You want to run the Gateway in watch mode while iterating
  - You need a repeatable debugging workflow
---

# 调试

本页面介绍了用于流式输出的调试工具，特别是当提供者将推理过程混合到正常文本中时。

## 运行时调试覆盖

在聊天中使用 `/debug` 来设置**仅运行时**的配置覆盖（内存，而非磁盘）。
`/debug` 默认是禁用的；可以通过 `commands.debug: true` 来启用。
这在不需要编辑 `clawdbot.json` 文件的情况下切换某些不常见的设置时非常有用。

示例：```
/debug show
/debug set messages.responsePrefix="[clawdbot]"
/debug unset messages.responsePrefix
/debug reset
```
`/debug reset` 会清除所有覆盖设置，并返回到磁盘上的配置。

## 网关监听模式

为了快速迭代，在文件监视器下运行网关：```bash
pnpm gateway:watch --force
```
这对应于：```bash
tsx watch src/entry.ts gateway --force
```
在 `gateway:watch` 之后添加任何网关的 CLI 标志，它们将在每次重启时传递下去。

## 开发配置文件 + 开发网关 (--dev)

使用开发配置文件来隔离状态，并为调试创建一个安全、可丢弃的环境。这里有 **两个** `--dev` 标志：

- **全局 `--dev`（配置文件）：** 将状态隔离在 `~/.clawdbot-dev` 下，并将网关端口默认设置为 `19001`（衍生端口会随之变化）。
- **`gateway --dev`：** 告诉网关在缺少配置时自动创建默认配置和工作区（并跳过 BOOTSTRAP.md）。

推荐流程（开发配置文件 + 开发引导）：```bash
pnpm gateway:dev
CLAWDBOT_PROFILE=dev clawdbot tui
```
如果你还没有全局安装，可以通过 `pnpm clawdbot ...` 运行 CLI。

它所做的操作如下：

1) **配置文件隔离**（全局 `--dev`）
   - `CLAWDBOT_PROFILE=dev`
   - `CLAWDBOT_STATE_DIR=~/.clawdbot-dev`
   - `CLAWDBOT_CONFIG_PATH=~/.clawdbot-dev/clawdbot.json`
   - `CLAWDBOT_GATEWAY_PORT=19001`（浏览器/画布会相应调整）

2) **开发环境初始化**（`gateway --dev`）
   - 如果配置文件缺失，会写入一个最小配置文件（`gateway.mode=local`，绑定回环地址）。
   - 设置 `agent.workspace` 为开发工作区。
   - 设置 `agent.skipBootstrap=true`（不生成 `BOOTSTRAP.md`）。
   - 如果缺失，会初始化工作区文件：
     `AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md`、`HEARTBEAT.md`。
   - 默认身份：**C3‑PO**（协议机器人）。
   - 在开发模式下跳过频道提供者（`CLAWDBOT_SKIP_CHANNELS=1`）。

重置流程（全新开始）：```bash
pnpm gateway:dev:reset
```
注意：`--dev` 是一个 **全局** 的配置文件标志，某些运行器会将其吃掉。
如果你需要明确写出，使用环境变量的形式：```bash
CLAWDBOT_PROFILE=dev clawdbot gateway --dev --reset
```
`--reset` 会清除配置、凭证、会话以及开发工作区（使用 `trash` 而不是 `rm`），然后重新创建默认的开发环境。

提示：如果已经有非开发用的网关在运行（如 launchd/systemd），请先停止它：```bash
clawdbot gateway stop
```
## 原始流日志（Clawdbot）

Clawdbot 可以在任何过滤/格式化之前记录 **原始助手流**。
这是查看推理是否以纯文本增量形式（或以单独的思考块形式）到达的最佳方式。

通过 CLI 启用它：```bash
pnpm gateway:watch --force --raw-stream
```
可选路径覆盖：```bash
pnpm gateway:watch --force --raw-stream --raw-stream-path ~/.clawdbot/logs/raw-stream.jsonl
```
等效环境变量：```bash
CLAWDBOT_RAW_STREAM=1
CLAWDBOT_RAW_STREAM_PATH=~/.clawdbot/logs/raw-stream.jsonl
```
默认文件：

`~/.clawdbot/logs/raw-stream.jsonl`

## 原始数据块日志记录（pi-mono）

为了在解析为块之前捕获 **原始 OpenAI 兼容数据块**，pi-mono 提供了一个单独的日志记录器：```bash
PI_RAW_STREAM=1
```
可选路径：```bash
PI_RAW_STREAM_PATH=~/.pi-mono/logs/raw-openai-completions.jsonl
```
默认文件：

`~/.pi-mono/logs/raw-openai-completions.jsonl`

> 注意：此文件仅由使用 pi-mono 的 `openai-completions` 提供程序的进程生成。

## 安全注意事项

- 原始流日志可能包含完整的提示词、工具输出和用户数据。
- 请将日志保留在本地，并在调试后删除它们。
- 如果你要分享日志，请先清除其中的敏感信息和隐私数据。