---
summary: "Date and time handling across envelopes, prompts, tools, and connectors"
read_when:
  - You are changing how timestamps are shown to the model or users
  - You are debugging time formatting in messages or system prompt output
---

# 日期与时间

Clawdbot 默认使用 **主机本地时间作为传输时间戳**，并在 **系统提示中仅使用用户时区**。
提供方的时间戳会被保留，因此工具可以保持其原生语义（当前时间可通过 `session_status` 获取）。

## 消息封装（默认本地时间）

入站消息会使用分钟精度的时间戳进行封装：```
[Provider ... 2026-01-05 16:26 PST] message text
```
此信封时间戳默认为 **主机本地时间**，与提供商时区无关。

您可以覆盖此行为：```json5
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
- `envelopeTimezone: "local"` 使用主机所在时区。
- `envelopeTimezone: "user"` 使用 `agents.defaults.userTimezone`（若未设置则回退到主机时区）。
- 使用显式的 IANA 时区（例如 `"America/Chicago"`）来指定固定时区。
- `envelopeTimestamp: "off"` 会从 envelope 头中移除绝对时间戳。
- `envelopeElapsed: "off"` 会移除经过时间后缀（例如 `+2m` 这种格式）。

### 示例

**本地（默认）：**```
[WhatsApp +1555 2026-01-18 00:19 PST] hello
```
**用户时区：**```
[WhatsApp +1555 2026-01-18 00:19 CST] hello
```
**已启用经过时间：**```
[WhatsApp +1555 +30s 2026-01-18T05:19Z] follow-up
```
## 系统提示：当前日期和时间

如果已知用户时区，系统提示中将包含一个专门的
**当前日期和时间** 部分，其中仅包含 **时区**（不包含具体时间或格式）
以保持提示缓存的稳定：```
Time zone: America/Chicago
```
当代理需要当前时间时，使用 `session_status` 工具；状态卡片中包含时间戳行。

## 系统事件行（默认为本地时间）

插入到代理上下文中的队列系统事件会使用与消息信封相同的时间区前缀（默认：主机本地时间）。```
System: [2026-01-12 12:19:17 PST] Model switched.
```
### 配置用户时区 + 格式```json5
{
  agents: {
    defaults: {
      userTimezone: "America/Chicago",
      timeFormat: "auto" // auto | 12 | 24
    }
  }
}
```
- `userTimezone` 用于设置 **用户本地时区**，以提供提示的上下文。
- `timeFormat` 控制提示中的 **12小时制/24小时制** 显示。`auto` 表示遵循操作系统偏好。

## 时间格式检测（auto）

当 `timeFormat: "auto"` 时，Clawdbot 会检查操作系统偏好（macOS/Windows），并在无法确定时使用本地格式。检测到的值会被 **按进程缓存**，以避免重复的系统调用。

## 工具负载 + 连接器（原始提供者时间 + 标准化字段）

频道工具返回 **提供者原生的时间戳**，并添加标准化字段以确保一致性：

- `timestampMs`: 以 **UTC 时间** 表示的 **Unix 时间戳（毫秒）**
- `timestampUtc`: **ISO 8601 UTC 格式** 的字符串

原始提供者字段会被保留，因此不会丢失任何信息。

- Slack：来自 API 的类似 Unix 时间戳的字符串
- Discord：UTC 的 ISO 时间戳
- Telegram/WhatsApp：提供者特定的数字/ISO 时间戳

如果需要本地时间，可以使用已知的时区在下游进行转换。

## 相关文档

- [系统提示](/concepts/system-prompt)
- [时区](/concepts/timezone)
- [消息](/concepts/messages)