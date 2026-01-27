---
summary: "Elevated exec mode and /elevated directives"
read_when:
  - Adjusting elevated mode defaults, allowlists, or slash command behavior
---

# 提升模式（/elevated 指令）

## 它的作用
- `/elevated on` 在网关主机上运行，并保留执行批准（与 `/elevated ask` 相同）。
- `/elevated full` 在网关主机上运行 **并且** 自动批准执行（跳过执行批准）。
- `/elevated ask` 在网关主机上运行，但保留执行批准（与 `/elevated on` 相同）。
- `on`/`ask` **不会** 强制 `exec.security=full`；配置的安全/询问策略仍然适用。
- 仅在代理处于 **沙盒环境** 时改变行为（否则执行已经在主机上运行）。
- 指令形式：`/elevated on|off|ask|full`，`/elev on|off|ask|full`。
- 仅接受 `on|off|ask|full`；其他内容会返回提示，并不会改变状态。

## 它控制的内容（以及不控制的内容）
- **可用性门控**：`tools.elevated` 是全局基准。`agents.list[].tools.elevated` 可以进一步限制每个代理的提升权限（两者都必须允许）。
- **会话级状态**：`/elevated on|off|ask|full` 为当前会话密钥设置提升级别。
- **内联指令**：消息内的 `/elevated on|ask|full` 仅对该消息生效。
- **群组**：在群聊中，只有当代理被提及的时候，提升指令才会被接受。仅包含命令的消息如果绕过了提及要求，则被视为已被提及。
- **主机执行**：提升模式会将 `exec` 强制到网关主机；`full` 还会设置 `security=full`。
- **批准**：`full` 会跳过执行批准；`on`/`ask` 在允许列表/询问规则需要时仍会遵守批准。
- **非沙盒代理**：对位置没有影响；仅影响门控、日志和状态。
- **工具策略仍然适用**：如果 `exec` 被工具策略拒绝，提升模式也无法使用。

## 解析顺序
1. 消息中的内联指令（仅对该消息生效）。
2. 会话覆盖（通过发送仅包含指令的消息设置）。
3. 全局默认值（在配置中为 `agents.defaults.elevatedDefault`）。

## 设置会话默认值
- 发送一条 **仅包含指令** 的消息（允许空格），例如 `/elevated full`。
- 会收到一条确认回复（`Elevated mode set to full...` / `Elevated mode disabled.`）。
- 如果提升权限被禁用，或发送者不在允许列表中，指令会返回一个可操作的错误，并不会改变会话状态。
- 发送 `/elevated`（或 `/elevated:`）且不带参数，可以查看当前的提升级别。

## 可用性 + 允许列表
- 功能开关：`tools.elevated.enabled`（即使代码支持该功能，也可以通过配置将其默认关闭）。
- 发送者允许列表：`tools.elevated.allowFrom`，包含按服务商的允许列表（例如 `discord`、`whatsapp`）。
- 按代理的功能开关：`agents.list[].tools.elevated.enabled`（可选；只能进一步限制）。
- 按代理的允许列表：`agents.list[].tools.elevated.allowFrom`（可选；当设置时，发送者必须同时匹配全局允许列表和代理允许列表）。
- Discord 回退机制：如果 `tools.elevated.allowFrom.discord` 未设置，则使用 `channels.discord.dm.allowFrom` 列表作为回退。设置 `tools.elevated.allowFrom.discord`（甚至设置为空列表 `[]`）可以覆盖回退机制。按代理的允许列表 **不** 使用回退机制。
- 所有开关必须通过；否则，提升模式将被视为不可用。

## 日志 + 状态
- 提升执行调用会以信息级别记录日志。
- 会话状态包括提升模式（例如 `elevated=ask`、`elevated=full`）。