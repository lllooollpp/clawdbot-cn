---
title: Sandbox vs Tool Policy vs Elevated
summary: "Why a tool is blocked: sandbox runtime, tool allow/deny policy, and elevated exec gates"
read_when: "You hit 'sandbox jail' or see a tool/elevated refusal and want the exact config key to change."
status: active
---

# Sandbox、Tool Policy 与 Elevated

Clawdbot 有三个相关（但不同）的控制选项：

1. **Sandbox** (`agents.defaults.sandbox.*` / `agents.list[].sandbox.*`) 决定 **工具在何处运行**（Docker 还是主机）。
2. **Tool policy** (`tools.*`, `tools.sandbox.tools.*`, `agents.list[].tools.*`) 决定 **哪些工具是可用/被允许的**。
3. **Elevated** (`tools.elevated.*`, `agents.list[].tools.elevated.*`) 是一个 **仅执行的逃生机制**，用于在你处于沙箱环境中时在主机上运行工具。

## 快速调试

使用 inspector 查看 Clawdbot 实际在做什么：
bash
clawdbot sandbox explain
clawdbot sandbox explain --session agent:main:main
clawdbot sandbox explain --agent work
clawdbot sandbox explain --json
``````
它会输出：
- 有效的沙箱模式/作用域/工作区访问权限
- 当前会话是否处于沙箱中（主会话 vs 非主会话）
- 有效的沙箱工具允许/拒绝（以及是否来自代理/全局/默认设置）
- 提升权限的门禁和修复密钥路径

## 沙箱：工具运行的环境

沙箱由 `agents.defaults.sandbox.mode` 控制：
- `"off"`：所有内容都在主机上运行。
- `"non-main"`：只有非主会话会被沙箱化（常见于群组/频道中的“意外”情况）。
- `"all"`：所有内容都被沙箱化。

有关完整的矩阵（作用域、工作区挂载、镜像）请参见 [沙箱化](/gateway/sandboxing)。

### 绑定挂载（安全快速检查）

- `docker.binds` 会穿透沙箱文件系统：你挂载的内容会以你设置的模式（`:ro` 或 `:rw`）在容器内可见。
- 如果省略模式，默认为读写；源代码/密钥建议使用 `:ro`。
- `scope: "shared"` 会忽略每个代理的绑定（只有全局绑定生效）。
- 绑定 `/var/run/docker.sock` 实际上是将主机控制权交给沙箱；请仅在有意的情况下执行此操作。
- 工作区访问权限（`workspaceAccess: "ro"`/`"rw"`）与绑定模式是独立的。

## 工具策略：哪些工具存在/可调用

有两个层次需要注意：
- **工具配置文件**：`tools.profile` 和 `agents.list[].tools.profile`（基础允许列表）
- **提供者工具配置文件**：`tools.byProvider[provider].profile` 和 `agents.list[].tools.byProvider[provider].profile`
- **全局/代理工具策略**：`tools.allow`/`tools.deny` 和 `agents.list[].tools.allow`/`agents.list[].tools.deny`
- **提供者工具策略**：`tools.byProvider[provider].allow/deny` 和 `agents.list[].tools.byProvider[provider].allow/deny`
- **沙箱工具策略**（仅在沙箱模式下生效）：`tools.sandbox.tools.allow`/`tools.sandbox.tools.deny` 和 `agents.list[].tools.sandbox.tools.*`

经验法则：
- `deny` 总是优先于 `allow`。
- 如果 `allow` 非空，则其他所有内容都会被视为被阻止。

提供者工具键可以接受 `provider`（例如 `google-antigravity`）或 `provider/model`（例如 `openai/gpt-5.2`）。

### 工具组（快捷方式）

工具策略（全局、代理、沙箱）支持 `group:*` 条目，这些条目会展开为多个工具：```json5
{
  tools: {
    sandbox: {
      tools: {
        allow: ["group:runtime", "group:fs", "group:sessions", "group:memory"]
      }
    }
  }
}
```
可用的组：
- `group:runtime`: `exec`, `bash`, `process`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:clawdbot`: 所有内置的 Clawdbot 工具（不包括提供者插件）

## 提权：仅限“在主机上运行”

提权 **不会** 赋予额外的工具；它只影响 `exec`。
- 如果你在沙箱中，`/elevated on`（或使用 `elevated: true` 的 `exec`）会在主机上运行（可能仍需要审批）。
- 使用 `/elevated full` 可以跳过该会话的 `exec` 审批。
- 如果你已经在直接模式下运行，提权实际上是没有操作的（仍然需要审批）。
- 提权 **不是** 与技能作用域相关的，并且 **不会** 覆盖工具的允许/拒绝设置。

门控：
- 启用：`tools.elevated.enabled`（以及可选的 `agents.list[].tools.elevated.enabled`）
- 发送者白名单：`tools.elevated.allowFrom.<provider>`（以及可选的 `agents.list[].tools.elevated.allowFrom.<provider>`）

参见 [提权模式](/tools/elevated)。

## 常见的“沙箱限制”修复方法

### “工具 X 被沙箱工具策略阻止”

修复方法（任选其一）：
- 禁用沙箱：`agents.defaults.sandbox.mode=off`（或每个代理设置 `agents.list[].sandbox.mode=off`）
- 在沙箱中允许该工具：
  - 从 `tools.sandbox.tools.deny` 中移除它（或每个代理设置 `agents.list[].tools.sandbox.tools.deny`）
  - 或将其添加到 `tools.sandbox.tools.allow`（或每个代理设置 `agents.list[].tools.sandbox.tools.allow`）

### “我以为这是主会话，为什么它被沙箱限制了？”

在 `"non-main"` 模式下，组/频道密钥 *不是* 主密钥。请使用主会话密钥（由 `sandbox explain` 显示）或切换模式到 `"off"`。