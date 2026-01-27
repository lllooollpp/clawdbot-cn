---
summary: "Per-agent sandbox + tool restrictions, precedence, and examples"
title: Multi-Agent Sandbox & Tools
read_when: "You want per-agent sandboxing or per-agent tool allow/deny policies in a multi-agent gateway."
status: active
---

## 概述

在多代理设置中，每个代理现在都可以拥有自己的：
- **沙箱配置** (`agents.list[].sandbox` 会覆盖 `agents.defaults.sandbox`)
- **工具限制** (`tools.allow` / `tools.deny`，以及 `agents.list[].tools`)

这允许你运行多个具有不同安全配置的代理：
- 个人助手，拥有全部权限
- 家庭/工作代理，工具受限
- 面向公众的代理，在沙箱中运行

`setupCommand` 应该放在 `sandbox.docker` 下（全局或每个代理单独设置），并在容器创建时运行一次。

认证是每个代理独立的：每个代理会从其自己的 `agentDir` 认证存储中读取，路径为：```
~/.clawdbot/agents/<agentId>/agent/auth-profiles.json
```
凭证在代理之间 **不会** 共享。不要在多个代理之间重复使用 `agentDir`。
如果想要共享凭证，请将 `auth-profiles.json` 复制到其他代理的 `agentDir` 中。

有关运行时沙箱行为的信息，请参阅 [Sandboxing](/gateway/sandboxing)。
有关调试“为什么被阻止了？”，请参阅 [Sandbox vs Tool Policy vs Elevated](/gateway/sandbox-vs-tool-policy-vs-elevated) 以及 `clawdbot sandbox explain`。```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "name": "Personal Assistant",
        "workspace": "~/clawd",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "family",
        "name": "Family Bot",
        "workspace": "~/clawd-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit", "apply_patch", "process", "browser"]
        }
      }
    ]
  },
  "bindings": [
    {
      "agentId": "family",
      "match": {
        "provider": "whatsapp",
        "accountId": "*",
        "peer": {
          "kind": "group",
          "id": "120363424282127706@g.us"
        }
      }
    }
  ]
}
```
**结果：**
- `main` 代理：在主机上运行，拥有完整的工具访问权限
- `family` 代理：在 Docker 中运行（每个代理一个容器），仅拥有 `read` 工具访问权限

---

### 示例 2：具有共享沙箱的工作代理```json
{
  "agents": {
    "list": [
      {
        "id": "personal",
        "workspace": "~/clawd-personal",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "work",
        "workspace": "~/clawd-work",
        "sandbox": {
          "mode": "all",
          "scope": "shared",
          "workspaceRoot": "/tmp/work-sandboxes"
        },
        "tools": {
          "allow": ["read", "write", "apply_patch", "exec"],
          "deny": ["browser", "gateway", "discord"]
        }
      }
    ]
  }
}
```
---

### 示例 2b：全局编码配置 + 仅消息代理```json
{
  "tools": { "profile": "coding" },
  "agents": {
    "list": [
      {
        "id": "support",
        "tools": { "profile": "messaging", "allow": ["slack"] }
      }
    ]
  }
}
```
**结果：**
- 默认代理获得编码工具
- `support` 代理仅支持消息传递（+ Slack 工具）

---

### 示例 3：每个代理的不同沙盒模式```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",  // Global default
        "scope": "session"
      }
    },
    "list": [
      {
        "id": "main",
        "workspace": "~/clawd",
        "sandbox": {
          "mode": "off"  // Override: main never sandboxed
        }
      },
      {
        "id": "public",
        "workspace": "~/clawd-public",
        "sandbox": {
          "mode": "all",  // Override: public always sandboxed
          "scope": "agent"
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit", "apply_patch"]
        }
      }
    ]
  }
}
```
---

## 配置优先级

当同时存在全局配置（`agents.defaults.*`）和代理特定配置（`agents.list[].*`）时：

### 沙盒配置
代理特定的设置会覆盖全局设置：```
agents.list[].sandbox.mode > agents.defaults.sandbox.mode
agents.list[].sandbox.scope > agents.defaults.sandbox.scope
agents.list[].sandbox.workspaceRoot > agents.defaults.sandbox.workspaceRoot
agents.list[].sandbox.workspaceAccess > agents.defaults.sandbox.workspaceAccess
agents.list[].sandbox.docker.* > agents.defaults.sandbox.docker.*
agents.list[].sandbox.browser.* > agents.defaults.sandbox.browser.*
agents.list[].sandbox.prune.* > agents.defaults.sandbox.prune.*
```
**说明：**
- `agents.list[].sandbox.{docker,browser,prune}.*` 会覆盖该代理的 `agents.defaults.sandbox.{docker,browser,prune}.*`（当 sandbox 作用域解析为 `"shared"` 时会被忽略）。

### 工具限制
过滤顺序如下：
1. **工具配置文件** (`tools.profile` 或 `agents.list[].tools.profile`)
2. **提供者工具配置文件** (`tools.byProvider[provider].profile` 或 `agents.list[].tools.byProvider[provider].profile`)
3. **全局工具策略** (`tools.allow` / `tools.deny`)
4. **提供者工具策略** (`tools.byProvider[provider].allow/deny`)
5. **代理特定的工具策略** (`agents.list[].tools.allow/deny`)
6. **代理提供者策略** (`agents.list[].tools.byProvider[provider].allow/deny`)
7. **沙箱工具策略** (`tools.sandbox.tools` 或 `agents.list[].tools.sandbox.tools`)
8. **子代理工具策略** (`tools.subagents.tools`, 如果适用)

每一层级可以进一步限制工具，但不能恢复之前层级中被拒绝的工具。
如果设置了 `agents.list[].tools.sandbox.tools`，它将替换该代理的 `tools.sandbox.tools`。
如果设置了 `agents.list[].tools.profile`，它将覆盖该代理的 `tools.profile`。
提供者工具键可以接受 `provider`（例如 `google-antigravity`）或 `provider/model`（例如 `openai/gpt-5.2`）。

### 工具组（快捷方式）

工具策略（全局、代理、沙箱）支持 `group:*` 条目，这些条目会扩展为多个具体工具：

- `group:runtime`: `exec`, `bash`, `process`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:clawdbot`: 所有内置的 Clawdbot 工具（不包括提供者插件）

### 提升模式
`tools.elevated` 是全局基础（基于发送者的白名单）。`agents.list[].tools.elevated` 可以进一步限制特定代理的提升权限（两者都必须允许）。

缓解模式：
- 拒绝不受信任代理的 `exec`（`agents.list[].tools.deny: ["exec"]`）
- 避免允许那些路由到受限代理的发送者
- 如果只希望沙箱执行，可以全局禁用提升（`tools.elevated.enabled: false`）
- 对于敏感配置，可以按代理禁用提升（`agents.list[].tools.elevated.enabled: false`）```json
{
  "agents": {
    "defaults": {
      "workspace": "~/clawd",
      "sandbox": {
        "mode": "non-main"
      }
    }
  },
  "tools": {
    "sandbox": {
      "tools": {
        "allow": ["read", "write", "apply_patch", "exec"],
        "deny": []
      }
    }
  }
}
```
**在（具有不同角色的多智能体）之后：**```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "workspace": "~/clawd",
        "sandbox": { "mode": "off" }
      }
    ]
  }
}
```
遗留的 `agent.*` 配置由 `clawdbot doctor` 进行迁移；建议今后使用 `agents.defaults` + `agents.list`。

---

## 工具限制示例

### 只读代理```json
{
  "tools": {
    "allow": ["read"],
    "deny": ["exec", "write", "edit", "apply_patch", "process"]
  }
}
```
### 安全执行代理（不修改文件）```json
{
  "tools": {
    "allow": ["read", "exec", "process"],
    "deny": ["write", "edit", "apply_patch", "browser", "gateway"]
  }
}
```
### 仅通信代理```json
{
  "tools": {
    "allow": ["sessions_list", "sessions_send", "sessions_history", "session_status"],
    "deny": ["exec", "write", "edit", "apply_patch", "read", "browser"]
  }
}
```
---

## 常见陷阱："non-main"

`agents.defaults.sandbox.mode: "non-main"` 是基于 `session.mainKey`（默认值为 `"main"`）的，
而不是代理 ID。群组/频道会话总是会获得它们自己的键，因此它们会被视为 "non-main" 并被沙箱化。如果你想让某个代理从不被沙箱化，可以设置 `agents.list[].sandbox.mode: "off"`。

---

## 测试

在配置多代理沙箱和工具之后：

1. **检查代理解析：**   ```exec
   clawdbot agents list --bindings
   ```
2. **验证沙盒容器：**   ```exec
   docker ps --filter "label=clawdbot.sandbox=1"
   ```
3. **测试工具限制：**
   - 发送一个需要受限工具的消息
   - 验证代理无法使用被拒绝的工具

4. **监控日志：**   ```exec
   tail -f "${CLAWDBOT_STATE_DIR:-$HOME/.clawdbot}/logs/gateway.log" | grep -E "routing|sandbox|tools"
   ```
---

## 故障排除

### 尽管设置了 `mode: "all"`，代理仍未被沙箱隔离
- 检查是否存在全局配置 `agents.defaults.sandbox.mode` 覆盖了该设置
- 代理特定的配置具有优先级，因此请设置 `agents.list[].sandbox.mode: "all"`

### 工具仍然可用，尽管在拒绝列表中
- 检查工具过滤顺序：全局 → 代理 → 沙箱 → 子代理
- 每个层级只能进一步限制，不能重新授予
- 通过日志验证：`[tools] filtering tools for agent:${agentId}`

### 每个代理的容器未被隔离
- 在代理特定的沙箱配置中设置 `scope: "agent"`
- 默认值为 `"session"`，即每个会话创建一个容器

---

## 参考资料

- [多代理路由](/concepts/multi-agent)
- [沙箱配置](/gateway/configuration#agentsdefaults-sandbox)
- [会话管理](/concepts/session)