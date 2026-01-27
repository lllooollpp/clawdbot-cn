---
summary: "Exec tool usage, stdin modes, and TTY support"
read_when:
  - Using or modifying the exec tool
  - Debugging stdin or TTY behavior
---

# 执行工具

在工作区中运行 shell 命令。通过 `process` 支持前台和后台执行。
如果 `process` 被禁止，`exec` 会同步运行，并忽略 `yieldMs`/`background`。
后台会话是按代理作用域的；`process` 仅能看到同一代理的会话。

## 参数

- `command` (必填项)
- `workdir` (默认为当前工作目录)
- `env` (键/值覆盖)
- `yieldMs` (默认 10000): 延迟后自动后台运行
- `background` (布尔值): 立即后台运行
- `timeout` (秒，默认 1800): 超时后终止
- `pty` (布尔值): 在可用时在伪终端中运行（仅限 TTY 的 CLI、编码代理、终端 UI）
- `host` (`sandbox | gateway | node`): 在何处执行
- `security` (`deny | allowlist | full`): `gateway`/`node` 的执行策略
- `ask` (`off | on-miss | always`): `gateway`/`node` 的批准提示
- `node` (字符串): 用于 `host=node` 的节点 ID/名称
- `elevated` (布尔值): 请求提升权限（仅适用于 `gateway` 主机）；当 `elevated` 设置为 `full` 时，`security=full` 才会被强制执行

说明：
- `host` 默认为 `sandbox`。
- 当沙箱关闭时，`elevated` 会被忽略（`exec` 已经在主机上运行）。
- `gateway`/`node` 的批准由 `~/.clawdbot/exec-approvals.json` 控制。
- `node` 需要配对的节点（配套应用或无头节点主机）。
- 如果有多个节点可用，可以设置 `exec.node` 或 `tools.exec.node` 来选择一个。
- 在非 Windows 主机上，如果设置了 `SHELL`，则使用 `SHELL`；如果 `SHELL` 是 `fish`，则优先使用 `bash`（或 `sh`）从 `PATH` 中运行，以避免 `fish` 不兼容的脚本，否则回退到 `SHELL`。

## 配置

- `tools.exec.notifyOnExit` (默认: true): 为后台执行的会话在退出时加入系统事件并请求心跳。
- `tools.exec.approvalRunningNoticeMs` (默认: 10000): 当批准限制的执行运行时间超过此值时，发出一条“正在运行”的提示（0 表示禁用）。
- `tools.exec.host` (默认: `sandbox`)
- `tools.exec.security` (默认: `deny` 对于 sandbox，`allowlist` 对于 gateway + node 当未设置时)
- `tools.exec.ask` (默认: `on-miss`)
- `tools.exec.node` (默认: 未设置)
- `tools.exec.pathPrepend`: 要添加到 `PATH` 的目录列表，用于执行。
- `tools.exec.safeBins`: 仅接受标准输入的安全二进制文件，可以在不显式允许列表的情况下运行。
json5
{
  tools: {
    exec: {
      pathPrepend: ["~/bin", "/opt/oss/bin"]
    }
  }
}
``````
### PATH 处理

- `host=gateway`：将你的登录 shell 的 `PATH` 合并到执行环境中（除非执行调用已经设置了 `env.PATH`）。守护进程本身仍然使用最小的 `PATH` 运行：
  - macOS: `/opt/homebrew/bin`, `/usr/local/bin`, `/usr/bin`, `/bin`
  - Linux: `/usr/local/bin`, `/usr/bin`, `/bin`
- `host=sandbox`：在容器内运行 `sh -lc`（登录 shell），因此 `/etc/profile` 可能会重置 `PATH`。Clawdbot 在加载 profile 后会将 `env.PATH` 添加到前面；`tools.exec.pathPrepend` 在此处也适用。
- `host=node`：仅将你传递的环境变量覆盖发送到节点。只有在执行调用已经设置了 `env.PATH` 时，`tools.exec.pathPrepend` 才会生效。无头节点主机仅在 `PATH` 前缀包含节点主机的 `PATH` 时才接受 `PATH`（不进行替换）。macOS 节点会完全忽略 `PATH` 的覆盖。
  
按代理绑定节点（在配置中使用代理列表的索引）：```bash
clawdbot config get agents.list
clawdbot config set agents.list[0].tools.exec.node "node-id-or-name"
```
"控制UI：Nodes选项卡包含一个小型的“执行节点绑定”面板，用于相同设置。

## 会话覆盖 (`/exec`)

使用 `/exec` 为 `host`、`security`、`ask` 和 `node` 设置**会话级别的**默认值。
发送 `/exec` 且不带参数以显示当前值。

示例：

/exec host=gateway security=allowlist ask=on-miss node=mac-1
```"```
## 执行审批（配套应用 / 节点主机）

沙盒代理可以在网关或节点主机上运行 `exec` 命令之前，要求每次请求的审批。
有关策略、允许列表和用户界面流程，请参见 [执行审批](/tools/exec-approvals)。

当需要审批时，exec 工具会立即返回
`status: "approval-pending"` 和一个审批 ID。一旦获得批准（或被拒绝/超时），
网关会发出系统事件（`Exec finished` / `Exec denied`）。如果命令在 `tools.exec.approvalRunningNoticeMs` 之后仍在运行，
将发出一次 `Exec running` 的通知。```json
{"tool":"exec","command":"ls -la"}
```
背景 + 投票：
json
{"tool":"exec","command":"npm run build","yieldMs":1000}
{"tool":"process","action":"poll","sessionId":"<id>"}
``````
发送键（tmux 风格）：```json
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["Enter"]}
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["C-c"]}
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["Up","Up","Enter"]}
```
提交（仅发送 CR）：
json
{"tool":"process","action":"submit","sessionId":"<id>"}
``````
Paste (bracketed by default):```json
{"tool":"process","action":"paste","sessionId":"<id>","text":"line1\nline2\n"}
```
## apply_patch（实验性）

`apply_patch` 是 `exec` 的一个子工具，用于结构化的多文件编辑。  
需显式启用：
json5
{
  tools: {
    exec: {
      applyPatch: { enabled: true, allowModels: ["gpt-5.2"] }
    }
  }
}
``````
注意事项：
- 仅适用于 OpenAI/OpenAI Codex 模型。
- 工具策略仍然适用；`allow: ["exec"]` 隐含允许 `apply_patch`。
- 配置位于 `tools.exec.applyPatch` 下。