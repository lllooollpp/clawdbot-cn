---
summary: "Menu bar status logic and what is surfaced to users"
read_when:
  - Tweaking mac menu UI or status logic
---

# 菜单栏状态逻辑

## 显示内容
- 我们在菜单栏图标和菜单中的第一行状态中显示当前代理的工作状态。
- 当工作处于活动状态时，健康状态会被隐藏；当所有会话都处于空闲状态时，健康状态会重新出现。
- 菜单中的“Nodes”部分仅列出**设备**（通过 `node.list` 配对的节点），不包含客户端/存在性条目。
- 当提供者使用快照可用时，在“Context”下方会出现一个“Usage”部分。

## 状态模型
- 会话：事件会带有 `runId`（每次运行一次）以及 `sessionKey` 在负载中。"主"会话的键是 `main`；如果不存在，则回退到最后一个更新的非主会话。
- 优先级：主会话始终优先。如果主会话处于活动状态，则立即显示其状态。如果主会话处于空闲状态，则显示最近活跃的非主会话。我们不会在活动过程中切换状态；只有当当前会话变为空闲或主会话变为活动时才会切换。

### 活动类型
- `job`：高层次命令执行（`state: started|streaming|done|error`）。
- `tool`：带有 `phase: start|result`、`toolName` 和 `meta/args` 的活动。

## IconState 枚举（Swift）
- `idle`
- `workingMain(ActivityKind)`
- `workingOther(ActivityKind)`
- `overridden(ActivityKind)`（调试覆盖）

### ActivityKind → 图标
- `exec` → 💻
- `read` → 📄
- `write` → ✍️
- `edit` → 📝
- `attach` → 📎
- 默认 → 🛠️

### 视觉映射
- `idle`：正常状态的图标。
- `workingMain`：带有图标的徽章，全色显示，带有“working”动画。
- `workingOther`：带有图标的徽章，淡色显示，无滑动动画。
- `overridden`：无论活动类型如何，都使用选择的图标/颜色。

## 状态行文本（菜单）
- 当工作处于活动状态时：`<会话角色> · <活动标签>`
  - 示例：`Main · exec: pnpm test`，`Other · read: apps/macos/Sources/Clawdbot/AppState.swift`。
- 当空闲时：回退到健康摘要。

## 事件处理
- 源：控制通道的 `agent` 事件（`ControlChannel.handleAgentEvent`）。
- 解析字段：
  - `stream: "job"`，使用 `data.state` 表示开始/结束。
  - `stream: "tool"`，使用 `data.phase`、`name`，可选 `meta`/`args`。
- 标签：
  - `exec`：`args.command` 的第一行。
  - `read`/`write`：缩短的路径。
  - `edit`：路径加上从 `meta`/diff 计数推断出的更改类型。
  - 默认：工具名称。

## 调试覆盖
- 设置 ▸ 调试 ▸ “图标覆盖”选择器：
  - `系统（自动）`（默认）
  - `工作：主`（按工具类型）
  - `工作：其他`（按工具类型）
  - `空闲`
- 通过 `@AppStorage("iconOverride")` 存储；映射到 `IconState.overridden`。

## 测试清单
- 触发主会话任务：验证图标立即切换，状态行显示主标签。
- 在主会话空闲时触发非主会话任务：图标/状态显示非主会话；保持稳定直到完成。
- 在其他会话活动时启动主会话：图标立即切换到主会话。
- 快速工具调用：确保徽章不会闪烁（工具结果有TTL缓冲）。
- 一旦所有会话空闲，健康行就会重新出现。