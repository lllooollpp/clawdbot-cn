---
summary: "Logging overview: file logs, console output, CLI tailing, and the Control UI"
read_when:
  - You need a beginner-friendly overview of logging
  - You want to configure log levels or formats
  - You are troubleshooting and need to find logs quickly
---

# 日志

Clawdbot 在两个地方记录日志：

- **文件日志**（JSON 行）由网关（Gateway）写入。
- **控制台输出**显示在终端和控制界面（Control UI）中。

本页面解释日志的存储位置、如何阅读日志，以及如何配置日志级别和格式。

## 日志存储位置

默认情况下，网关会在以下路径下写入一个滚动日志文件：

`/tmp/clawdbot/clawdbot-YYYY-MM-DD.log`

日期使用网关主机的本地时区。

您可以在 `~/.clawdbot/clawdbot.json` 中覆盖此设置：

"```json
{
  "logging": {
    "file": "/path/to/clawdbot.log"
  }
}
```
## 如何查看日志

### CLI：实时尾随（推荐）

通过 RPC 使用 CLI 尾随网关日志文件：```bash
clawdbot logs --follow
```
输出模式：

- **TTY 会话**：美化、带颜色、结构化的日志行。
- **非 TTY 会话**：纯文本。
- `--json`：行尾的 JSON（每行一个日志事件）。
- `--plain`：在 TTY 会话中强制使用纯文本。
- `--no-color`：禁用 ANSI 颜色。

在 JSON 模式下，CLI 会输出带有 `type` 标签的对象：

- `meta`：流的元数据（文件、光标、大小）
- `log`：解析后的日志条目
- `notice`：截断/轮转提示
- `raw`：未解析的日志行

如果网关不可达，CLI 会打印一个简短提示，提示运行：```bash
clawdbot doctor
```
### 控制界面（Web）

控制界面的 **日志** 选项卡使用 `logs.tail` 尾随同一个文件。  
有关如何打开它，请参阅 [/web/control-ui](/web/control-ui)。

### 仅频道日志

要过滤频道活动（WhatsApp/Telegram/等），请使用：```bash
clawdbot channels logs --channel whatsapp
```
## 日志格式

### 文件日志（JSONL）

日志文件中的每一行都是一个 JSON 对象。CLI 和 Control UI 会解析这些条目以生成结构化的输出（时间、级别、子系统、消息）。

### 控制台输出

控制台日志是 **TTY 感知的**，并进行了格式化以提高可读性：

- 子系统前缀（例如 `gateway/channels/whatsapp`）
- 级别颜色标记（info/warn/error）
- 可选的紧凑模式或 JSON 模式

控制台格式由 `logging.consoleStyle` 控制。```json
{
  "logging": {
    "level": "info",
    "file": "/tmp/clawdbot/clawdbot-YYYY-MM-DD.log",
    "consoleLevel": "info",
    "consoleStyle": "pretty",
    "redactSensitive": "tools",
    "redactPatterns": [
      "sk-.*"
    ]
  }
}
```
### 日志级别

- `logging.level`: **文件日志**（JSONL）的级别。
- `logging.consoleLevel`: **控制台**的详细程度。

`--verbose` 仅影响控制台输出；它不会更改文件日志的级别。

### 控制台样式

`logging.consoleStyle`:

- `pretty`: 可读性高、带颜色、带时间戳的人类友好格式。
- `compact`: 更紧凑的输出（适合长时间会话）。
- `json`: 每行输出为 JSON（用于日志处理器）。

### 敏感信息屏蔽

工具摘要可以在信息输出到控制台前屏蔽敏感令牌：

- `logging.redactSensitive`: `off` | `tools`（默认：`tools`）
- `logging.redactPatterns`: 覆盖默认设置的正则表达式列表

屏蔽仅影响**控制台输出**，不会修改文件日志。

## 诊断信息 + OpenTelemetry

诊断信息是结构化的、机器可读的事件，用于模型运行 **以及** 消息流的遥测信息（webhooks、队列、会话状态）。它们 **不会替代日志**，而是用于向指标、追踪和其他导出器提供数据。

诊断事件在进程中发出，但导出器只有在启用诊断信息 + 导出器插件时才会生效。

### OpenTelemetry 与 OTLP

- **OpenTelemetry (OTel)**: 用于追踪、指标和日志的数据模型 + SDK。
- **OTLP**: 用于将 OTel 数据导出到收集器/后端的传输协议。
- Clawdbot 目前通过 **OTLP/HTTP（protobuf）** 进行导出。

### 导出的信号

- **指标（Metrics）**: 计数器 + 直方图（令牌使用量、消息流、队列状态）。
- **追踪（Traces）**: 模型使用和 webhook/消息处理的跨度（spans）。
- **日志（Logs）**: 当 `diagnostics.otel.logs` 被启用时，通过 OTLP 导出。日志量可能较大；请考虑 `logging.level` 和导出器过滤器。

### 诊断事件目录

模型使用：
- `model.usage`: 令牌数、成本、持续时间、上下文、提供者/模型/通道、会话 ID。

消息流：
- `webhook.received`: 每个通道的 webhook 入站。
- `webhook.processed`: webhook 处理完成 + 持续时间。
- `webhook.error`: webhook 处理器错误。
- `message.queued`: 消息被加入队列以供处理。
- `message.processed`: 处理结果 + 持续时间 + 可选错误。

队列 + 会话：
- `queue.lane.enqueue`: 命令队列车道入队 + 队列深度。
- `queue.lane.dequeue`: 命令队列车道出队 + 等待时间。
- `session.state`: 会话状态转换 + 原因。
- `session.stuck`: 会话卡住警告 + 年龄。
- `run.attempt`: 运行重试/尝试的元数据。
- `diagnostic.heartbeat`: 汇总计数器（webhooks/queue/session）。

### 启用诊断信息（无导出器）

如果您希望诊断事件可供插件或自定义接收器使用，请使用此设置：```json
{
  "diagnostics": {
    "enabled": true
  }
}
```
### 诊断标志（定向日志）

使用标志来开启额外的、定向的调试日志，而无需提升 `logging.level`。
标志不区分大小写，并支持通配符（例如 `telegram.*` 或 `*`）。```json
{
  "diagnostics": {
    "flags": ["telegram.http"]
  }
}
```
Env override (one-off):```
CLAWDBOT_DIAGNOSTICS=telegram.http,telegram.payload
```
注意事项：
- 标志日志会输出到标准日志文件（与 `logging.file` 相同）。
- 输出内容仍然根据 `logging.redactSensitive` 进行脱敏处理。
- 完整指南：[/diagnostics/flags](/diagnostics/flags)。

### 导出到 OpenTelemetry

诊断信息可以通过 `diagnostics-otel` 插件（OTLP/HTTP）进行导出。这适用于任何接受 OTLP/HTTP 的 OpenTelemetry 收集器/后端。```json
{
  "plugins": {
    "allow": ["diagnostics-otel"],
    "entries": {
      "diagnostics-otel": {
        "enabled": true
      }
    }
  },
  "diagnostics": {
    "enabled": true,
    "otel": {
      "enabled": true,
      "endpoint": "http://otel-collector:4318",
      "protocol": "http/protobuf",
      "serviceName": "clawdbot-gateway",
      "traces": true,
      "metrics": true,
      "logs": true,
      "sampleRate": 0.2,
      "flushIntervalMs": 60000
    }
  }
}
```
注意事项：
- 也可以通过 `clawdbot plugins enable diagnostics-otel` 启用插件。
- `protocol` 当前仅支持 `http/protobuf`，`grpc` 会被忽略。
- 指标包括 token 使用情况、成本、上下文大小、运行时长，以及消息流的计数器/直方图（webhooks、队列、会话状态、队列深度/等待时间）。
- 可以通过 `traces` / `metrics` 开关 traces/metrics（默认：开启）。当启用 traces 时，包含模型使用跨度以及 webhook/消息处理跨度。
- 当您的收集器需要认证时，请设置 `headers`。
- 支持的环境变量有：`OTEL_EXPORTER_OTLP_ENDPOINT`、`OTEL_SERVICE_NAME`、`OTEL_EXPORTER_OTLP_PROTOCOL`。

### 导出的指标（名称 + 类型）

模型使用情况：
- `clawdbot.tokens`（计数器，属性：`clawdbot.token`、`clawdbot.channel`、`clawdbot.provider`、`clawdbot.model`）
- `clawdbot.cost.usd`（计数器，属性：`clawdbot.channel`、`clawdbot.provider`、`clawdbot.model`）
- `clawdbot.run.duration_ms`（直方图，属性：`clawdbot.channel`、`clawdbot.provider`、`clawdbot.model`）
- `clawdbot.context.tokens`（直方图，属性：`clawdbot.context`、`clawdbot.channel`、`clawdbot.provider`、`clawdbot.model`）

消息流：
- `clawdbot.webhook.received`（计数器，属性：`clawdbot.channel`、`clawdbot.webhook`）
- `clawdbot.webhook.error`（计数器，属性：`clawdbot.channel`、`clawdbot.webhook`）
- `clawdbot.webhook.duration_ms`（直方图，属性：`clawdbot.channel`、`clawdbot.webhook`）
- `clawdbot.message.queued`（计数器，属性：`clawdbot.channel`、`clawdbot.source`）
- `clawdbot.message.processed`（计数器，属性：`clawdbot.channel`、`clawdbot.outcome`）
- `clawdbot.message.duration_ms`（直方图，属性：`clawdbot.channel`、`clawdbot.outcome`）

队列 + 会话：
- `clawdbot.queue.lane.enqueue`（计数器，属性：`clawdbot.lane`）
- `clawdbot.queue.lane.dequeue`（计数器，属性：`clawdbot.lane`）
- `clawdbot.queue.depth`（直方图，属性：`clawdbot.lane` 或 `clawdbot.channel=heartbeat`）
- `clawdbot.queue.wait_ms`（直方图，属性：`clawdbot.lane`）
- `clawdbot.session.state`（计数器，属性：`clawdbot.state`、`clawdbot.reason`）
- `clawdbot.session.stuck`（计数器，属性：`clawdbot.state`）
- `clawdbot.session.stuck_age_ms`（直方图，属性：`clawdbot.state`）
- `clawdbot.run.attempt`（计数器，属性：`clawdbot.attempt`）

### 导出的跨度（名称 + 关键属性）"

- `clawdbot.model.usage`
  - `clawdbot.channel`、`clawdbot.provider`、`clawdbot.model`
  - `clawdbot.sessionKey`、`clawdbot.sessionId`
  - `clawdbot.tokens.*`（input/output/cache_read/cache_write/total）

- `clawdbot.webhook.processed`
  - `clawdbot.channel`、`clawdbot.webhook`、`clawdbot.chatId`

- `clawdbot.webhook.error`
  - `clawdbot.channel`、`clawdbot.webhook`、`clawdbot.chatId`、
    `clawdbot.error`

- `clawdbot.message.processed`
  - `clawdbot.channel`、`clawdbot.outcome`、`clawdbot.chatId`、
    `clawdbot.messageId`、`clawdbot.sessionKey`、`clawdbot.sessionId`、
    `clawdbot.reason`

- `clawdbot.session.stuck`
  - `clawdbot.state`、`clawdbot.ageMs`、`clawdbot.queueDepth`、
    `clawdbot.sessionKey`、`clawdbot.sessionId`

### 采样 + 刷出

- 跟踪采样：`diagnostics.otel.sampleRate`（0.0–1.0，仅用于根跨度）。
- 指标导出间隔：`diagnostics.otel.flushIntervalMs`（最小 1000ms）。

### 协议说明

- OTLP/HTTP 端点可以通过 `diagnostics.otel.endpoint` 或
  `OTEL_EXPORTER_OTLP_ENDPOINT` 设置。
- 如果端点中已经包含 `/v1/traces` 或 `/v1/metrics`，则直接使用。
- 如果端点中已经包含 `/v1/logs`，则直接用于日志。
- `diagnostics.otel.logs` 用于启用主日志器的 OTLP 日志导出。

### 日志导出行为

- OTLP 日志使用与写入 `logging.file` 相同的结构化记录。
- 遵循 `logging.level`（文件日志级别）。控制台脱敏 **不** 适用于 OTLP 日志。
- 高流量安装应优先使用 OTLP 收集器的采样/过滤功能。

## 排错提示

- **网关不可达？** 首先运行 `clawdbot doctor`。
- **日志为空？** 检查网关是否正在运行，并且是否写入了 `logging.file` 中指定的文件路径。
- **需要更多细节？** 将 `logging.level` 设置为 `debug` 或 `trace`，然后重试。