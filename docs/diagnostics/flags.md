---
summary: "Diagnostics flags for targeted debug logs"
read_when:
  - You need targeted debug logs without raising global logging levels
  - You need to capture subsystem-specific logs for support
---

# 诊断标志

诊断标志允许您在不开启全局详细日志记录的情况下，启用有针对性的调试日志。标志是可选的，除非某个子系统检查它们，否则不会产生任何影响。

## 工作原理

- 标志是字符串（不区分大小写）。
- 您可以在配置中启用标志，也可以通过环境变量覆盖来启用。
- 支持通配符：
  - `telegram.*` 匹配 `telegram.http`
  - `*` 启用所有标志

## 通过配置启用
json
{
  "diagnostics": {
    "flags": ["telegram.http"]
  }
}``````
多个标志：```json
{
  "diagnostics": {
    "flags": ["telegram.http", "gateway.*"]
  }
}
```
重新启动网关以应用更改的标志。

## 环境覆盖（一次性）```bash
CLAWDBOT_DIAGNOSTICS=telegram.http,telegram.payload
``````
禁用所有标志：
bash
CLAWDBOT_DIAGNOSTICS=0
``````
## 日志的去向

标志会将日志输出到标准诊断日志文件中。默认情况下：

/tmp/clawdbot/clawdbot-YYYY-MM-DD.log
``````
如果设置了 `logging.file`，则使用该路径。日志为 JSONL 格式（每行一个 JSON 对象）。根据 `logging.redactSensitive` 的设置，仍会进行敏感信息过滤。

## 提取日志

选择最新的日志文件：
bash
ls -t /tmp/clawdbot/clawdbot-*.log | head -n 1
``````
Telegram HTTP 诊断过滤器：
bash
rg "telegram http error" /tmp/clawdbot/clawdbot-*.log
``````
或者在复制时尾随：
bash
tail -f /tmp/clawdbot/clawdbot-$(date +%F).log | rg "telegram http error"```
对于远程网关，你也可以使用 `clawdbot logs --follow`（参见 [/cli/logs](/cli/logs)）。

## 注意事项

- 如果 `logging.level` 设置的级别高于 `warn`，这些日志可能会被抑制。默认的 `info` 级别是合适的。
- 标志位可以保持启用状态；它们仅影响特定子系统的日志量。
- 使用 [/logging](/logging) 来更改日志目标、级别和脱敏设置。