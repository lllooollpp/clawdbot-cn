---
summary: "Timezone handling for agents, envelopes, and prompts"
read_when:
  - You need to understand how timestamps are normalized for the model
  - Configuring the user timezone for system prompts
---

# 时区

Clawdbot 对时间戳进行标准化，使模型看到一个 **单一的参考时间**。

## 消息封装（默认本地时间）

传入的消息会被封装成如下格式：

[Provider ... 2026-01-05 16:26 PST] 消息内容``````
信封中的时间戳默认是 **主机本地时间**，精度为分钟。

你可以通过以下方式覆盖此设置：```json5
{
  agents: {
    defaults: {
      envelopeTimezone: "local", // "utc" | "local" | "user" | IANA timezone
      envelopeTimestamp: "on", // "on" | "off"
      envelopeElapsed: "on" // "on" | "off"
    }
  }
}
```
- `envelopeTimezone: "utc"` 使用 UTC 时间。
- `envelopeTimezone: "user"` 使用 `agents.defaults.userTimezone`（如果未设置，则回退到主机时区）。
- 使用显式的 IANA 时区（例如 `"Europe/Vienna"`）以指定固定时区。
- `envelopeTimestamp: "off"` 会从 envelope 头中移除绝对时间戳。
- `envelopeElapsed: "off"` 会移除经过时间后缀（例如 `+2m` 风格）。

### 示例

**本地（默认）：**

[Signal Alice +1555 2026-01-18 00:19 PST] hello``````
**固定时区：**```
[Signal Alice +1555 2026-01-18 06:19 GMT+1] hello
```
**经过的时间：**  
[Signal Alice +1555 +2m 2026-01-18T05:19Z] 跟进  
## 工具有效负载（原始提供者数据 + 标准化字段)

工具调用（`channels.discord.readMessages`、`channels.slack.readMessages` 等）会返回 **原始提供者时间戳**。  
我们还会附加一些标准化字段以确保一致性：

- `timestampMs`（UTC 时间戳，毫秒）
- `timestampUtc`（ISO 8601 格式的 UTC 字符串）

原始提供者字段会被保留。

## 用户时区用于系统提示

设置 `agents.defaults.userTimezone` 以告知模型用户的本地时区。如果未设置，Clawdbot 会在运行时解析 **主机时区**（无需配置写入）。
json5
{
  agents: { defaults: { userTimezone: "America/Chicago" } }
}
``````
系统提示包括：
- `当前日期和时间` 部分，显示本地时间和时区
- `时间格式：12小时制` 或 `24小时制`

你可以通过 `agents.defaults.timeFormat` 控制提示格式（`auto` | `12` | `24`）。

有关完整的功能和示例，请参见 [日期和时间](/date-time)。