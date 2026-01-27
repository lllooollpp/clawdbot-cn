---
summary: "Harden cron.add input handling, align schemas, and improve cron UI/agent tooling"
owner: "clawdbot"
status: "complete"
last_updated: "2026-01-05"
---

# Cron 添加加固与模式对齐

## 背景
最近的网关日志显示多次 `cron.add` 失败，原因是参数无效（缺少 `sessionTarget`、`wakeMode`、`payload`，以及格式错误的 `schedule`）。这表明至少有一个客户端（很可能是代理工具调用路径）正在发送被包装或部分指定的任务负载。此外，TypeScript 中的 Cron 提供商枚举、网关模式、CLI 标志和 UI 表单类型之间存在不一致，同时 UI 中的 `cron.status` 显示也存在不匹配（期望 `jobCount`，但网关返回的是 `jobs`）。

## 目标
- 通过规范化常见的包装任务负载并推断缺失的 `kind` 字段，阻止 `cron.add` 的 INVALID_REQUEST 日志泛滥。
- 对齐网关模式、Cron 类型、CLI 文档和 UI 表单中的 Cron 提供商列表。
- 使代理 Cron 工具的模式显式化，确保 LLM 生成正确的任务负载。
- 修复 Control UI 中 Cron 状态的 job count 显示。
- 添加测试以覆盖规范化和工具行为。

## 非目标
- 不改变 Cron 调度语义或任务执行行为。
- 不新增 schedule 类型或 Cron 表达式解析。
- 不对 Cron 的 UI/UX 进行大规模 overhaul，仅修复必要的字段问题。

## 发现（当前存在的差距）
- 网关中的 `CronPayloadSchema` 排除了 `signal` 和 `imessage`，而 TypeScript 类型中包含它们。
- Control UI 的 CronStatus 期望 `jobCount`，但网关返回的是 `jobs`。
- 代理 Cron 工具的模式允许任意的 `job` 对象，从而允许格式错误的输入。
- 网关对 `cron.add` 进行严格验证，没有进行规范化，因此包装后的负载会失败。

## 变化内容

- `cron.add` 和 `cron.update` 现在会规范化常见的包装结构，并在安全的情况下推断缺失的 `kind` 字段。
- 代理 Cron 工具的模式与网关模式一致，从而减少无效负载。
- 提供商枚举在网关、CLI、UI 和 macOS 选择器中现在保持一致。
- Control UI 使用网关的 `jobs` 计数字段来显示状态。

更多信息请参见 [Cron 任务](/automation/cron-jobs) 中的规范化结构和示例。

## 当前行为

- **规范化:** 包装的 `data`/`job` 负载会被解包；当安全时，会推断 `schedule.kind` 和 `payload.kind`。
- **默认值:** 当缺少 `wakeMode` 和 `sessionTarget` 时，会应用安全的默认值。
- **提供者:** Discord/Slack/Signal/iMessage 现在在 CLI/UI 中一致展示。

## 验证

- 观察网关日志，确认 `cron.add` 的 INVALID_REQUEST 错误减少。
- 确认 Control UI 中 Cron 状态在刷新后显示 job count。

## 可选后续工作

- 手动测试 Control UI：为每个提供者添加一个 Cron 任务，并验证 job count 是否正确。

## 未决问题

- `cron.add` 是否应接受客户端显式的 `state`（目前模式不允许）？
- 是否应允许 `webchat` 作为显式的交付提供者（目前在交付解析中被过滤）？