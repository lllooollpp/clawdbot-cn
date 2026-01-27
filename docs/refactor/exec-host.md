---
summary: "Refactor plan: exec host routing, node approvals, and headless runner"
read_when:
  - Designing exec host routing or exec approvals
  - Implementing node runner + UI IPC
  - Adding exec host security modes and slash commands
---

# 执行主机重构计划

## 目标
- 添加 `exec.host` + `exec.security` 来实现跨 **沙箱**、**网关** 和 **节点** 的执行路由。
- 保持默认设置 **安全**：除非显式启用，否则不允许跨主机执行。
- 将执行拆分为一个 **无头运行器服务**，并通过本地 IPC 提供可选的 UI（macOS 应用）。
- 为每个 **代理** 提供策略、允许列表、询问模式和节点绑定。
- 支持 **询问模式**，这些模式可以 *与* 或 *不与* 允许列表一起工作。
- 跨平台：Unix 套接字 + 令牌认证（确保 macOS/Linux/Windows 的一致性）。

## 非目标
- 不迁移旧的允许列表或支持旧的模式。
- 不支持节点执行的 PTY/流式传输（仅支持聚合输出）。
- 除了现有的 Bridge + Gateway 之外，不引入新的网络层。

## 决策（已确定）
- **配置键**：`exec.host` + `exec.security`（允许每个代理覆盖）。
- **提升权限**：保持 `/elevated` 作为网关全访问权限的别名。
- **询问默认值**：`on-miss`。
- **批准存储**：`~/.clawdbot/exec-approvals.json`（JSON 格式，不支持旧模式迁移）。
- **运行器**：无头系统服务；UI 应用通过 Unix 套接字处理批准。
- **节点身份**：使用现有的 `nodeId`。
- **套接字认证**：Unix 套接字 + 令牌（跨平台）；如需拆分，后期再处理。
- **节点主机状态**：`~/.clawdbot/node.json`（包含节点 ID 和配对令牌）。
- **macOS 执行主机**：在 macOS 应用中运行 `system.run`；节点主机服务通过本地 IPC 转发请求。
- **不使用 XPC 辅助程序**：坚持使用 Unix 套接字 + 令牌 + 对等检查。

## 关键概念
### 主机
- `sandbox`：Docker 执行（当前行为）。
- `gateway`：在网关主机上执行。
- `node`：通过 Bridge 在节点运行器上执行（`system.run`）。

### 安全模式
- `deny`：始终阻止。
- `allowlist`：仅允许匹配项。
- `full`：允许所有内容（等同于提升权限）。

### 询问模式
- `off`：从不询问。
- `on-miss`：仅在允许列表不匹配时询问。
- `always`：每次都会询问。

询问是 **独立于** 允许列表的；允许列表可以与 `always` 或 `on-miss` 一起使用。

### 策略解析（每次执行）
1) 解析 `exec.host`（工具参数 → 代理覆盖 → 全局默认）。
2) 解析 `exec.security` 和 `exec.ask`（相同优先级）。
3) 如果主机是 `sandbox`，则在本地沙箱中继续执行。
4) 如果主机是 `gateway` 或 `node`，则在该主机上应用安全和询问策略。

## 默认安全性
- 默认 `exec.host = sandbox`。
- 默认 `exec.security = deny` 对 `gateway` 和 `node`。
- 默认 `exec.ask = on-miss`（仅在安全策略允许时相关）。
- 如果未设置节点绑定，**代理可以指向任何节点**，但前提是策略允许。

## 配置表面
### 工具参数
- `exec.host`（可选）：`sandbox | gateway | node`。
- `exec.security`（可选）：`deny | allowlist | full`。
- `exec.ask`（可选）：`off | on-miss | always`。
- `exec.node`（可选）：当 `host=node` 时使用的节点 ID/名称。

### 全局配置键
- `tools.exec.host`
- `tools.exec.security`
- `tools.exec.ask`
- `tools.exec.node`（默认节点绑定）

### 配置键（每个代理）
- `agents.list[].tools.exec.host`
- `agents.list[].tools.exec.security`
- `agents.list[].tools.exec.ask`
- `agents.list[].tools.exec.node`

### 别名
- `/elevated on` = 为代理会话设置 `tools.exec.host=gateway`, `tools.exec.security=full`。
- `/elevated off` = 恢复代理会话的先前执行设置。

## 批准存储（JSON）
路径：`~/.clawdbot/exec-approvals.json`

用途：
- **执行主机**（gateway 或 node runner）的本地策略 + 允许列表。
- 当没有 UI 可用时的询问回退。
- UI 客户端的 IPC 凭据。

建议的模式（v1）：
json
{
  "version": 1,
  "socket": {
    "path": "~/.clawdbot/exec-approvals.sock",
    "token": "base64-opaque-token"
  },
  "defaults": {
    "security": "deny",
    "ask": "on-miss",
    "askFallback": "deny"
  },
  "agents": {
    "agent-id-1": {
      "security": "allowlist",
      "ask": "on-miss",
      "allowlist": [
        {
          "pattern": "~/Projects/**/bin/rg",
          "lastUsedAt": 0,
          "lastUsedCommand": "rg -n TODO",
          "lastResolvedPath": "/Users/user/Projects/.../bin/rg"
        }
      ]
    }
  }
}
``````
备注：
- 不支持旧版的允许列表格式。
- `askFallback` 仅在 `ask` 是必需的且无法访问 UI 时生效。
- 文件权限：`0600`。

## 运行器服务（无头模式）
### 角色
- 在本地强制执行 `exec.security` + `exec.ask`。
- 执行系统命令并返回输出。
- 为 exec 生命周期发出 Bridge 事件（可选但推荐）。

### 服务生命周期
- 在 macOS 上使用 launchd/daemon；在 Linux/Windows 上使用系统服务。
- 审批 JSON 是执行主机本地的。
- UI 主机提供本地 Unix 套接字；运行器按需连接。

## UI 集成（macOS 应用）
### IPC
- Unix 套接字位于 `~/.clawdbot/exec-approvals.sock`（0600）。
- Token 存储在 `exec-approvals.json`（0600）。
- 对等检查：仅允许相同 UID 的连接。
- 挑战/响应机制：使用 nonce + HMAC(token, request-hash) 来防止重放攻击。
- 短 TTL（例如，10 秒）+ 最大负载 + 速率限制。

### Ask 流程（macOS 应用执行主机）
1) Node 服务从网关接收到 `system.run`。
2) Node 服务连接到本地套接字并发送提示/执行请求。
3) 应用验证对等端 + token + HMAC + TTL，如果需要则显示对话框。
4) 应用在 UI 上下文中执行命令并返回输出。
5) Node 服务将输出返回给网关。

如果 UI 缺失：
- 应用 `askFallback`（`deny|allowlist|full`）。```
Agent -> Gateway -> Bridge -> Node Service (TS)
                         |  IPC (UDS + token + HMAC + TTL)
                         v
                     Mac App (UI + TCC + system.run)
```
## 节点身份 + 绑定
- 使用 Bridge 配对时已有的 `nodeId`。
- 绑定模型：
  - `tools.exec.node` 将代理限制到特定节点。
  - 如果未设置，代理可以自由选择任意节点（策略仍会强制默认值）。
- 节点选择解析：
  - `nodeId` 精确匹配
  - `displayName`（标准化后）
  - `remoteIp`
  - `nodeId` 前缀（≥6 个字符）

## 事件机制
### 谁能看到事件
- 系统事件是 **按会话** 的，并在下一次提示时显示给代理。
- 存储在网关的内存队列中（`enqueueSystemEvent`）。

### 事件文本
- `Exec started (node=<id>, id=<runId>)`
- `Exec finished (node=<id>, id=<runId>, code=<code>)` + 可选的输出尾部
- `Exec denied (node=<id>, id=<runId>, <reason>)`

### 传输方式
选项 A（推荐）：
- Runner 向 Bridge 发送 `event` 帧 `exec.started` / `exec.finished`。
- 网关 `handleBridgeEvent` 将这些事件映射为 `enqueueSystemEvent`。

选项 B：
- 网关 `exec` 工具直接处理生命周期（仅支持同步方式）。

## 执行流程
### 沙箱主机
- 现有的 `exec` 行为（当未沙箱化时，使用 Docker 或主机）。
- 仅在非沙箱模式下支持 PTY。

### 网关主机
- 网关进程在其自身的机器上执行。
- 强制执行本地的 `exec-approvals.json`（安全/询问/允许列表）。

### 节点主机
- 网关通过 `node.invoke` 调用 `system.run`。
- Runner 强制执行本地的审批策略。
- Runner 返回聚合的 stdout/stderr。
- 可选的 Bridge 事件（开始/完成/拒绝）。

## 输出限制
- 将合并的 stdout+stderr 限制在 **200k**；保留 **20k** 的尾部用于事件。
- 截断时使用明确的后缀（例如 `"… (truncated)"`）。

## 斜杠命令
- `/exec host=<sandbox|gateway|node> security=<deny|allowlist|full> ask=<off|on-miss|always> node=<id>`
- 每个代理、每个会话的覆盖设置；除非通过配置保存，否则不持久化。
- `/elevated on|off|ask|full` 仍是 `host=gateway security=full` 的快捷方式（`full` 模式跳过审批）。

## 跨平台方案
- Runner 服务是可移植的执行目标。
- UI 是可选的；如果缺失，则应用 `askFallback`。
- Windows/Linux 支持相同的 approvals JSON + socket 协议。

## 实现阶段
### 阶段 1：配置 + 执行路由
- 添加 `exec.host`、`exec.security`、`exec.ask`、`exec.node` 的配置 schema。
- 更新工具链以尊重 `exec.host`。
- 添加 `/exec` 斜杠命令，并保留 `/elevated` 的别名。

### 阶段 2：审批存储 + 网关强制
- 实现 `exec-approvals.json` 的读取/写入功能。
- 对 `gateway` 主机强制执行允许列表 + 询问模式。
- 添加输出限制。

### 阶段 3：节点 Runner 强制
- 更新节点 Runner 以强制执行允许列表 + 询问模式。
- 为 macOS 应用 UI 添加 Unix 套接字提示桥接。
- 集成 `askFallback`。

### 阶段 4：事件
- 为执行生命周期添加节点 → 网关的 Bridge 事件。
- 将这些事件映射为 `enqueueSystemEvent`，用于代理提示。

### 阶段 5：UI 优化
- macOS 应用：允许列表编辑器、按代理切换器、询问策略 UI。
- 节点绑定控制（可选）。

## 测试计划
- 单元测试：允许列表匹配（通配符 + 不区分大小写）。
- 单元测试：策略解析优先级（工具参数 → 代理覆盖 → 全局策略）。
- 集成测试：节点运行器的拒绝/允许/询问流程。
- 桥接事件测试：节点事件 → 系统事件的路由。

## 开放风险
- UI 不可用：确保 `askFallback` 被尊重。
- 长时间运行的命令：依赖超时机制 + 输出限制。
- 多节点歧义：除非有节点绑定或显式节点参数，否则会报错。

## 相关文档
- [Exec 工具](/tools/exec)
- [Exec 审批](/tools/exec-approvals)
- [节点](/nodes)
- [提升模式](/tools/elevated)