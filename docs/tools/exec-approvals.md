---
summary: "Exec approvals, allowlists, and sandbox escape prompts"
read_when:
  - Configuring exec approvals or allowlists
  - Implementing exec approval UX in the macOS app
  - Reviewing sandbox escape prompts and implications
---

# 执行审批

执行审批是**配套应用/节点主机的防护机制**，用于允许沙盒代理在真实主机（`gateway` 或 `node`）上运行命令。可以将其视为一种安全联锁机制：只有当策略 + 允许列表 + （可选）用户审批三方都同意时，命令才会被允许执行。  
执行审批是**额外的**限制措施，除了工具策略和提升权限控制（除非提升权限设置为 `full`，此时会跳过审批）。

有效的策略是 **`tools.exec.*`** 和审批默认值中的**更严格者**；如果省略了审批字段，则使用 **`tools.exec`** 的值。

如果配套应用的 UI **不可用**，任何需要提示的操作都会通过 **ask fallback**（默认：拒绝）来处理。

## 适用范围

执行审批在执行主机上本地执行：
- **网关主机** → 网关机器上的 `clawdbot` 进程
- **节点主机** → 节点运行器（macOS 配套应用或无头节点主机）

macOS 分离：
- **节点主机服务** 通过本地 IPC 将 `system.run` 转发到 **macOS 应用**。
- **macOS 应用** 执行审批 + 在 UI 上下文中执行命令。
json
{
  "version": 1,
  "socket": {
    "path": "~/.clawdbot/exec-approvals.sock",
    "token": "base64url-token"
  },
  "defaults": {
    "security": "deny",
    "ask": "on-miss",
    "askFallback": "deny",
    "autoAllowSkills": false
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "ask": "on-miss",
      "askFallback": "deny",
      "autoAllowSkills": true,
      "allowlist": [
        {
          "id": "B0C8C0B3-2C2D-4F8A-9A3C-5A4B3C2D1E0F",
          "pattern": "~/Projects/**/bin/rg",
          "lastUsedAt": 1737150000000,
          "lastUsedCommand": "rg -n TODO",
          "lastResolvedPath": "/Users/user/Projects/.../bin/rg"
        }
      ]
    }
  }
}
``````
## 策略开关

### 安全性 (`exec.security`)
- **deny**: 阻止所有主机执行请求。
- **allowlist**: 仅允许允许列表中的命令。
- **full**: 允许所有操作（等同于提升权限）。

### 提示 (`exec.ask`)
- **off**: 从不提示。
- **on-miss**: 当允许列表不匹配时提示。
- **always**: 每个命令都提示。

### 提示回退 (`askFallback`)
如果需要提示但无法访问UI，回退决定：
- **deny**: 阻止。
- **allowlist**: 仅在允许列表匹配时允许。
- **full**: 允许。

## 允许列表（按代理）

允许列表是**按代理定义的**。如果存在多个代理，请在macOS应用中切换要编辑的代理。模式是**不区分大小写的通配符匹配**。
模式应解析为**二进制路径**（仅包含基础名的条目将被忽略）。
在加载时，旧版的 `agents.default` 条目会被迁移到 `agents.main`。

示例：
- `~/Projects/**/bin/bird`
- `~/.local/bin/*`
- `/opt/homebrew/bin/rg`

每个允许列表条目会跟踪：
- **id**：用于UI标识的稳定UUID（可选）
- **最后使用时间**：时间戳
- **最后使用的命令**
- **最后解析的路径**

## 自动允许技能CLI

当启用**自动允许技能CLI**时，已知技能引用的可执行文件会在节点（macOS节点或无头节点主机）上被视为允许列表中的条目。这会通过Gateway RPC使用 `skills.bins` 来获取技能二进制列表。如果你希望使用严格的手动允许列表，请禁用此功能。

## 安全二进制文件（仅标准输入）

`tools.exec.safeBins` 定义了一组**仅标准输入**的二进制文件（例如 `jq`），它们可以在允许列表模式下**无需显式允许列表条目**即可运行。安全二进制文件会拒绝位置文件参数和路径类标记，因此只能处理传入的流。
在允许列表模式下，不支持自动允许shell链式调用和重定向。

当每个顶层段都满足允许列表（包括安全二进制文件或技能自动允许）时，允许shell链式调用（`&&`, `||`, `;`）。但在允许列表模式下，重定向仍不受支持。

默认的安全二进制文件：`jq`, `grep`, `cut`, `sort`, `uniq`, `head`, `tail`, `tr`, `wc`。

## 控制UI编辑

使用 **控制UI → 节点 → 执行审批** 卡片来编辑默认设置、按代理的覆盖设置和允许列表。选择一个作用域（默认或代理），调整策略，添加/删除允许列表模式，然后点击 **保存**。UI会显示每个模式的**最后使用**元数据，以便你保持列表整洁。

目标选择器可以选择 **网关**（本地审批）或一个 **节点**。节点必须公开 `system.execApprovals.get/set`（macOS应用或无头节点主机）。
如果节点尚未公开执行审批功能，请直接编辑其本地文件 `~/.clawdbot/exec-approvals.json`。

CLI：`clawdbot approvals` 支持网关或节点编辑（参见 [审批CLI](/cli/approvals)）。

当需要批准时，exec 工具会立即返回一个批准 ID。使用该 ID 来关联后续系统事件（`Exec finished` / `Exec denied`）。如果在超时前没有收到决定，该请求将被视为批准超时，并作为拒绝原因显示。

确认对话框包含：
- 命令 + 参数
- 当前工作目录 (cwd)
- 代理 ID
- 解析后的可执行文件路径
- 主机 + 策略元数据

操作：
- **仅允许一次** → 立即运行
- **始终允许** → 添加到白名单 + 运行
- **拒绝** → 阻止

## exec 批准提示转发到聊天频道

您可以将 exec 批准提示转发到任何聊天频道（包括插件频道），并通过 `/approve` 命令进行批准。这将使用正常的出站传递管道。```json5
{
  approvals: {
    exec: {
      enabled: true,
      mode: "session", // "session" | "targets" | "both"
      agentFilter: ["main"],
      sessionFilter: ["discord"], // substring or regex
      targets: [
        { channel: "slack", to: "U12345678" },
        { channel: "telegram", to: "123456789" }
      ]
    }
  }
}
```
回复聊天：

/approve <id> allow-once
/approve <id> allow-always
/approve <id> deny
``````
### macOS 进程间通信流程```
Gateway -> Node Service (WS)
                 |  IPC (UDS + token + HMAC + TTL)
                 v
             Mac App (UI + approvals + system.run)
```
安全注意事项：
- Unix 套接字模式为 `0600`，令牌存储在 `exec-approvals.json` 中。
- 同 UID 对等检查。
- 挑战/响应（nonce + HMAC 令牌 + 请求哈希）+ 短 TTL。

## 系统事件

执行生命周期以系统消息的形式呈现：
- `Exec running`（仅当命令超过运行通知阈值时）
- `Exec finished`
- `Exec denied`

这些消息在节点报告事件后会发布到代理的会话中。
网关主机的执行批准在命令完成时也会发出相同的生命周期事件（并且在运行时间超过阈值时可选地发出）。
受批准限制的执行会将批准 ID 用作这些消息中的 `runId`，以便于关联。

## 影响

- **full** 权限非常强大；在可能的情况下，应优先使用允许列表。
- **ask** 会在允许快速批准的同时让您保持在流程中。
- 每个代理的允许列表可以防止一个代理的批准泄露到其他代理中。

相关：
- [执行工具](/tools/exec)
- [提升模式](/tools/elevated)
- [技能](/tools/skills)