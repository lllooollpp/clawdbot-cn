---
summary: "Logging surfaces, file logs, WS log styles, and console formatting"
read_when:
  - Changing logging output or formats
  - Debugging CLI or gateway output
---

# 日志记录

有关用户界面的概述（CLI + 控制 UI + 配置），请参阅 [/logging](/logging)。

Clawdbot 有两个日志“界面”：

- **控制台输出**（你在终端 / 调试 UI 中看到的内容）。
- **文件日志**（由网关日志记录器写入的 JSON 行）。

## 基于文件的日志记录器

- 默认的滚动日志文件位于 `/tmp/clawdbot/` 目录下（每天一个文件）：`clawdbot-YYYY-MM-DD.log`
  - 日期使用网关主机的本地时区。
- 日志文件路径和级别可以通过 `~/.clawdbot/clawdbot.json` 进行配置：
  - `logging.file`
  - `logging.level`

文件格式为每行一个 JSON 对象。

控制 UI 的 Logs 选项卡通过网关尾随此文件（`logs.tail`）。
CLI 也可以实现相同的功能：
bash
clawdbot logs --follow
``````
**详细模式 vs 日志级别**

- **文件日志** 仅由 `logging.level` 控制。
- `--verbose` 仅影响 **控制台的详细程度**（以及 WebSocket 日志样式）；它 **不会** 提高文件日志的级别。
- 若要在文件日志中捕获仅详细模式下的信息，请将 `logging.level` 设置为 `debug` 或 `trace`。

## 控制台捕获

CLI 会捕获 `console.log/info/warn/error/debug/trace` 并将其写入文件日志，同时仍然输出到 stdout/stderr。

你可以通过以下方式单独调整控制台的详细程度：

- `logging.consoleLevel`（默认值为 `info`）
- `logging.consoleStyle`（`pretty` | `compact` | `json`）

## 工具摘要的脱敏处理

详细的工具摘要（例如 `🛠️ Exec: ...`）可以在它们到达控制台流之前屏蔽敏感令牌。这仅适用于 **工具**，不会影响文件日志。

- `logging.redactSensitive`: `off` | `tools`（默认：`tools`）
- `logging.redactPatterns`: 一个正则表达式字符串数组（覆盖默认值）
  - 使用原始正则表达式字符串（自动添加 `gi` 标志），或使用 `/pattern/flags` 如果你需要自定义标志。
  - 匹配项会被屏蔽，保留前6个字符和后4个字符（长度 ≥ 18），否则显示 `***`。
  - 默认规则覆盖常见的键赋值、CLI 标志、JSON 字段、Bearer 头、PEM 块和常见的令牌前缀。

## 网关 WebSocket 日志

网关在两种模式下打印 WebSocket 协议日志：

- **正常模式（不使用 `--verbose`）**：仅打印“有趣”的 RPC 结果：
  - 错误（`ok=false`）
  - 慢速调用（默认阈值：`>= 50ms`）
  - 解析错误
- **详细模式（`--verbose`）**：打印所有 WS 请求/响应流量。

### WS 日志样式

`clawdbot gateway` 支持按网关设置的日志样式切换：

- `--ws-log auto`（默认）：正常模式优化输出；详细模式使用紧凑输出
- `--ws-log compact`：详细模式下使用紧凑输出（配对的请求/响应）
- `--ws-log full`：详细模式下使用完整的帧级输出
- `--compact`：`--ws-log compact` 的别名

示例：```bash
# optimized (only errors/slow)
clawdbot gateway

# show all WS traffic (paired)
clawdbot gateway --verbose --ws-log compact

# show all WS traffic (full meta)
clawdbot gateway --verbose --ws-log full
```
```md
## 控制台格式化（子系统日志）

控制台格式化器是 **TTY感知的**，并打印一致且带有前缀的行。
子系统日志记录器将输出分组并易于扫描。

行为：

- **每个行都有子系统前缀**（例如 `[gateway]`、`[canvas]`、`[tailscale]`）
- **子系统颜色**（每个子系统颜色稳定）加上日志级别颜色
- **在输出是 TTY 或环境看起来像一个富终端时**（`TERM`/`COLORTERM`/`TERM_PROGRAM`），尊重 `NO_COLOR`
- **缩短的子系统前缀**：去掉前导的 `gateway/` 和 `channels/`，保留最后两个部分（例如 `whatsapp/outbound`）
- **按子系统划分的子日志记录器**（自动添加前缀 + 结构化字段 `{ subsystem }`）
- **`logRaw()`** 用于 QR/UX 输出（无前缀，无格式化）
- **控制台样式**（例如 `pretty | compact | json`）
- **控制台日志级别** 与 文件日志级别 是分开的（当 `logging.level` 设置为 `debug`/`trace` 时，文件日志保持完整细节）
- **WhatsApp 消息体** 会在 `debug` 级别被记录（使用 `--verbose` 可以查看它们）

这在保持现有文件日志稳定的同时，使交互式输出更易于扫描。