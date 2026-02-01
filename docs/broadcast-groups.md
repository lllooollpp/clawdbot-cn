---
summary: "Broadcast a WhatsApp message to multiple agents"
read_when:
  - Configuring broadcast groups
  - Debugging multi-agent replies in WhatsApp
status: experimental
---

# 广播群组

**状态:** 实验性  
**版本:** 2026.1.9 版本新增

## 概述

广播群组允许多个代理同时处理和响应同一消息。这使你可以创建专门的代理团队，在一个 WhatsApp 群组或私信中协作——全部使用一个手机号码。

当前范围: **仅限 WhatsApp**（网页渠道）。

广播群组在频道允许列表和群组激活规则之后进行评估。在 WhatsApp 群组中，这意味着广播会在 Clawdbot 通常回复的时候发生（例如：被提及，具体取决于你的群组设置）。

## 使用场景

### 1. 专业代理团队
部署多个具有原子化、专注职责的代理:
```
Group: "Development Team"
Agents:
  - CodeReviewer (reviews code snippets)
  - DocumentationBot (generates docs)
  - SecurityAuditor (checks for vulnerabilities)
  - TestGenerator (suggests test cases)
```
每个代理处理相同的消息并提供其专业视角。

### 2. 多语言支持
```
Group: "International Support"
Agents:
  - Agent_EN (responds in English)
  - Agent_DE (responds in German)
  - Agent_ES (responds in Spanish)
```
### 3. 质量保证工作流程
```
Group: "Customer Support"
Agents:
  - SupportAgent (provides answer)
  - QAAgent (reviews quality, only responds if issues found)
```
### 4. 任务自动化
```
Group: "Project Management"
Agents:
  - TaskTracker (updates task database)
  - TimeLogger (logs time spent)
  - ReportGenerator (creates summaries)
```
## 配置

### 基本设置

添加一个顶级的 `broadcast` 部分（与 `bindings` 并列）。键为 WhatsApp 对等 ID：
- 群聊：群组 JID（例如 `120363403215116621@g.us`）
- 私聊：E.164 电话号码（例如 `+15551234567`）
```json
{
  "broadcast": {
    "120363403215116621@g.us": ["alfred", "baerbel", "assistant3"]
  }
}
```
**结果:** 当Clawdbot在此聊天中回复时，它将运行所有三个代理。

### 处理策略

控制代理如何处理消息：

#### 并行（默认）
所有代理同时处理：
```json
{
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": ["alfred", "baerbel"]
  }
}
```
#### 顺序执行
代理按顺序处理（一个等待前一个完成）：
```json
{
  "broadcast": {
    "strategy": "sequential",
    "120363403215116621@g.us": ["alfred", "baerbel"]
  }
}
```
### 完整示例
```json
{
  "agents": {
    "list": [
      {
        "id": "code-reviewer",
        "name": "Code Reviewer",
        "workspace": "/path/to/code-reviewer",
        "sandbox": { "mode": "all" }
      },
      {
        "id": "security-auditor",
        "name": "Security Auditor",
        "workspace": "/path/to/security-auditor",
        "sandbox": { "mode": "all" }
      },
      {
        "id": "docs-generator",
        "name": "Documentation Generator",
        "workspace": "/path/to/docs-generator",
        "sandbox": { "mode": "all" }
      }
    ]
  },
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": ["code-reviewer", "security-auditor", "docs-generator"],
    "120363424282127706@g.us": ["support-en", "support-de"],
    "+15555550123": ["assistant", "logger"]
  }
}
```
## 它是如何工作的

### 消息流程

1. **传入消息** 到达 WhatsApp 群组
2. **广播检查**：系统检查对端 ID 是否在 `broadcast` 列表中
3. **如果在广播列表中**：
   - 所有列出的代理处理该消息
   - 每个代理都有自己的会话密钥和隔离的上下文
   - 代理可以并行（默认）或按顺序处理
4. **如果不在广播列表中**：
   - 正常路由适用（第一个匹配的绑定）

注意：广播群组不会绕过渠道允许列表或群组激活规则（提及/命令等）。它们仅改变 *哪些代理会运行*，当消息符合处理条件时。

### 会话隔离

广播组中的每个代理都保持完全独立的：

- **会话密钥**（`agent:alfred:whatsapp:group:120363...` 与 `agent:baerbel:whatsapp:group:120363...`）
- **对话历史**（代理不会看到其他代理的消息）
- **工作区**（如果配置了，每个代理有独立的沙箱）
- **工具访问权限**（不同的允许/拒绝列表）
- **记忆/上下文**（独立的 IDENTITY.md、SOUL.md 等）
- **群组上下文缓冲区**（最近的群组消息用于上下文）是按对端共享的，因此所有广播代理在被触发时都会看到相同的上下文

这使得每个代理可以拥有：
- 不同的性格
- 不同的工具访问权限（例如只读 vs. 读写）
- 不同的模型（例如 opus vs. sonnet）
- 不同的技能安装
```
Session: agent:alfred:whatsapp:group:120363403215116621@g.us
History: [user message, alfred's previous responses]
Workspace: /Users/pascal/clawd-alfred/
Tools: read, write, exec
```
**Bärbel的上下文：**
```
Session: agent:baerbel:whatsapp:group:120363403215116621@g.us  
History: [user message, baerbel's previous responses]
Workspace: /Users/pascal/clawd-baerbel/
Tools: read only
```
## 最佳实践

### 1. 保持代理专注

为每个代理设计一个单一且明确的职责：
```json
{
  "broadcast": {
    "DEV_GROUP": ["formatter", "linter", "tester"]
  }
}
```
✅ **优点：** 每个代理有一个明确的职责  
❌ **缺点：** 一个通用的 "dev-helper" 代理
### 2. 使用描述性名称

明确每个代理的作用：
```json
{
  "agents": {
    "security-scanner": { "name": "Security Scanner" },
    "code-formatter": { "name": "Code Formatter" },
    "test-generator": { "name": "Test Generator" }
  }
}
```
### 3. 配置不同的工具访问权限

仅向代理提供他们需要的工具：
```json
{
  "agents": {
    "reviewer": {
      "tools": { "allow": ["read", "exec"] }  // Read-only
    },
    "fixer": {
      "tools": { "allow": ["read", "write", "edit", "exec"] }  // Read-write
    }
  }
}
```
### 4. 监控性能

对于多个代理程序，请考虑：
- 使用 `"strategy": "parallel"`（默认）以提高速度
- 将广播组限制为 5-10 个代理程序
- 为简单的代理程序使用更快的模型

### 5. 优雅处理故障

代理程序会独立失败。一个代理程序的错误不会阻碍其他代理程序的运行：
```
Message → [Agent A ✓, Agent B ✗ error, Agent C ✓]
Result: Agent A and C respond, Agent B logs error
```
## 兼容性

### 提供商

广播组目前支持：
- ✅ WhatsApp（已实现）
- 🚧 Telegram（计划中）
- 🚧 Discord（计划中）
- 🚧 Slack（计划中）

### 路由

广播组可以与现有路由一起使用：
```json
{
  "bindings": [
    { "match": { "channel": "whatsapp", "peer": { "kind": "group", "id": "GROUP_A" } }, "agentId": "alfred" }
  ],
  "broadcast": {
    "GROUP_B": ["agent1", "agent2"]
  }
}
```
- `GROUP_A`: 只有 alfred 做出响应（正常路由）
- `GROUP_B`: agent1 和 agent2 都做出响应（广播）

**优先级:** `广播` 优先于 `绑定`。

## 故障排除

### 代理未做出响应

**检查:**
1. 代理 ID 是否存在于 `agents.list` 中
2. 对等 ID 格式是否正确（例如：`120363403215116621@g.us`）
3. 代理是否不在拒绝列表中

**调试:**
```bash
tail -f ~/.clawdbot/logs/gateway.log | grep broadcast
```
### 只有一个代理响应

**原因:** 可能是 Peer ID 在 `bindings` 中，但不在 `broadcast` 中。

**解决方法:** 将其添加到广播配置中，或从 bindings 中移除。

### 性能问题

**如果代理数量多时变慢:**
- 减少每组代理的数量
- 使用更轻量的模型（例如使用 sonnet 而不是 opus）
- 检查沙盒启动时间

## 示例

### 示例 1：代码审查团队
```json
{
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": [
      "code-formatter",
      "security-scanner",
      "test-coverage",
      "docs-checker"
    ]
  },
  "agents": {
    "list": [
      { "id": "code-formatter", "workspace": "~/agents/formatter", "tools": { "allow": ["read", "write"] } },
      { "id": "security-scanner", "workspace": "~/agents/security", "tools": { "allow": ["read", "exec"] } },
      { "id": "test-coverage", "workspace": "~/agents/testing", "tools": { "allow": ["read", "exec"] } },
      { "id": "docs-checker", "workspace": "~/agents/docs", "tools": { "allow": ["read"] } }
    ]
  }
}
```
**用户发送：** 代码片段  
**响应：**
- code-formatter: "修复了缩进并添加了类型提示"
- security-scanner: "⚠️ 第12行存在 SQL 注入漏洞"
- test-coverage: "覆盖率是 45%，缺少错误情况的测试用例"
- docs-checker: "函数 `process_data` 缺少文档字符串"

### 示例 2：多语言支持
```json
{
  "broadcast": {
    "strategy": "sequential",
    "+15555550123": ["detect-language", "translator-en", "translator-de"]
  },
  "agents": {
    "list": [
      { "id": "detect-language", "workspace": "~/agents/lang-detect" },
      { "id": "translator-en", "workspace": "~/agents/translate-en" },
      { "id": "translator-de", "workspace": "~/agents/translate-de" }
    ]
  }
}
```
## API 参考

### 配置模式
```typescript
interface ClawdbotConfig {
  broadcast?: {
    strategy?: "parallel" | "sequential";
    [peerId: string]: string[];
  };
}
```
### 字段

- `strategy` (可选): 如何处理代理
  - `"parallel"` (默认): 所有代理同时处理
  - `"sequential"`: 代理按数组顺序处理

- `[peerId]`: WhatsApp 群组 JID、E.164 号码或其他 peer ID
  - 值: 应该处理消息的代理 ID 数组

## 限制

1. **最大代理数:** 没有硬性限制，但 10 个以上的代理可能会变慢
2. **共享上下文:** 代理之间不会看到彼此的响应（设计如此）
3. **消息顺序:** 并行响应可能以任意顺序到达
4. **速率限制:** 所有代理都会计入 WhatsApp 的速率限制

## 未来增强功能

计划中的功能：
- [ ] 共享上下文模式（代理可以看到彼此的响应）
- [ ] 代理协调（代理之间可以互相通信）
- [ ] 动态代理选择（根据消息内容选择代理）
- [ ] 代理优先级（某些代理先于其他代理响应）

## 参考

- [多代理配置](/multi-agent-sandbox-tools.md)
- [路由配置](/concepts/channel-routing.md)
- [会话管理](/concepts/sessions.md)
