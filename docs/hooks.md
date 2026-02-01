---
summary: "Hooks: event-driven automation for commands and lifecycle events"
read_when:
  - You want event-driven automation for /new, /reset, /stop, and agent lifecycle events
  - You want to build, install, or debug hooks
---

# 钩子

钩子为根据代理命令和事件自动执行操作提供了一个可扩展的事件驱动系统。钩子会自动从目录中被发现，并可以通过 CLI 命令进行管理，类似于 Clawdbot 中的技能。

## 入门指南

钩子是当某些事件发生时运行的小脚本。有两种类型：

- **钩子**（本页）：在代理事件触发时在网关内部运行，例如 `/new`、`/reset`、`/stop` 或生命周期事件。
- **Webhook**：外部 HTTP Webhook，允许其他系统触发 Clawdbot 中的工作。参见 [Webhook 钩子](/automation/webhook.md) 或使用 `clawdbot webhooks` 命令来使用 Gmail 辅助命令。

钩子也可以打包在插件中；参见 [插件](/plugin.md#plugin-hooks)。

常见用途：
- 在重置会话时保存内存快照
- 为故障排除或合规性保留命令的审计日志
- 在会话开始或结束时触发后续自动化操作
- 在事件触发时将文件写入代理工作区或调用外部 API

如果你能编写一个小型 TypeScript 函数，那你就能编写一个钩子。钩子会自动被发现，你也可以通过 CLI 启用或禁用它们。

## 概览

钩子系统允许你：
- 在发出 `/new` 命令时将会话上下文保存到内存中
- 记录所有命令事件以供审计
- 在代理生命周期事件上触发自定义自动化
- 扩展 Clawdbot 的行为，而无需修改核心代码

## 快速开始

### 内置钩子

Clawdbot 默认提供了四个可自动发现的钩子：

- **💾 session-memory**：在发出 `/new` 命令时将会话上下文保存到你的代理工作区（默认为 `~/clawd/memory/`）
- **📝 command-logger**：将所有命令事件记录到 `~/.clawdbot/logs/commands.log`
- **🚀 boot-md**：在网关启动时运行 `BOOT.md`（需要启用内部钩子）
- **😈 soul-evil**：在清理窗口期间或随机机会下，将注入的 `SOUL.md` 内容替换为 `SOUL_EVIL.md`

列出可用的钩子：
```bash
clawdbot hooks list
```
启用钩子：
```bash
clawdbot hooks enable session-memory
```
检查钩子状态：
```bash
clawdbot hooks check
```
获取详细信息：
```bash
clawdbot hooks info session-memory
```
### 上线流程

在上线流程中（`clawdbot onboard`），您将被提示启用推荐的钩子（hooks）。向导会自动发现符合条件的钩子并将其展示以供选择。

## 钩子发现

钩子会从三个目录中自动发现（按优先级顺序）：

1. **工作区钩子**：`<workspace>/hooks/`（每个代理专属，优先级最高）
2. **托管钩子**：`~/.clawdbot/hooks/`（用户安装的，可在所有工作区中共享）
3. **内置钩子**：`<clawdbot>/dist/hooks/bundled/`（随 Clawdbot 一起提供）

托管钩子目录可以是一个 **单独的钩子** 或一个 **钩子包**（包目录）。

每个钩子是一个包含以下内容的目录：
```
my-hook/
├── HOOK.md          # Metadata + documentation
└── handler.ts       # Handler implementation
```
## 钩子包 (npm/archives)

钩子包是标准的 npm 包，它们通过 `package.json` 中的 `clawdbot.hooks` 导出一个或多个钩子。安装它们的方式为：
```bash
clawdbot hooks install <path-or-spec>
```
示例 `package.json`:
```json
{
  "name": "@acme/my-hooks",
  "version": "0.1.0",
  "clawdbot": {
    "hooks": ["./hooks/my-hook", "./hooks/other-hook"]
  }
}
```
每个条目都指向一个包含 `HOOK.md` 和 `handler.ts`（或 `index.ts`）的钩子目录。
钩子包可以包含依赖项；这些依赖项将在 `~/.clawdbot/hooks/<id>` 下安装。

## 钩子结构

### HOOK.md 格式

`HOOK.md` 文件包含 YAML 前置信息以及 Markdown 格式的文档内容：---
name: my-hook
description: "此钩子的作用的简短描述"
homepage: http://101.35.228.254/hooks#my-hook
metadata: {"clawdbot":{"emoji":"🔗","events":["command:new"],"requires":{"bins":["node"]}}}
---

# 我的钩子

详细的文档内容在此...

## 它的作用

- 监听 `/new` 命令
- 执行一些操作
- 记录结果

## 要求

- 必须安装 Node.js

## 配置

无需配置。### 元数据字段

`metadata.clawdbot` 对象支持以下字段：

- **`emoji`**：用于 CLI 的显示表情符号（例如 `"💾"`）
- **`events`**：要监听的事件数组（例如 `["command:new", "command:reset"]`）
- **`export`**：要使用的命名导出（默认为 `"default"`）
- **`homepage`**：文档的 URL
- **`requires`**：可选的依赖项
  - **`bins`**：PATH 中必需的二进制文件（例如 `["git", "node"]`）
  - **`anyBins`**：至少需要存在其中一个二进制文件
  - **`env`**：必需的环境变量
  - **`config`**：必需的配置路径（例如 `["workspace.dir"]`）
  - **`os`**：必需的操作平台（例如 `["darwin", "linux"]`）
- **`always`**：绕过资格检查（布尔值）
- **`install`**：安装方法（对于捆绑钩子：`[{"id":"bundled","kind":"bundled"}]`）

### 处理器实现

`handler.ts` 文件导出一个 `HookHandler` 函数：
```typescript
import type { HookHandler } from '../../src/hooks/hooks.js';

const myHandler: HookHandler = async (event) => {
  // Only trigger on 'new' command
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  console.log(`[my-hook] New command triggered`);
  console.log(`  Session: ${event.sessionKey}`);
  console.log(`  Timestamp: ${event.timestamp.toISOString()}`);

  // Your custom logic here

  // Optionally send message to user
  event.messages.push('✨ My hook executed!');
};

export default myHandler;
```
#### 事件上下文

每个事件包括：
```typescript
{
  type: 'command' | 'session' | 'agent' | 'gateway',
  action: string,              // e.g., 'new', 'reset', 'stop'
  sessionKey: string,          // Session identifier
  timestamp: Date,             // When the event occurred
  messages: string[],          // Push messages here to send to user
  context: {
    sessionEntry?: SessionEntry,
    sessionId?: string,
    sessionFile?: string,
    commandSource?: string,    // e.g., 'whatsapp', 'telegram'
    senderId?: string,
    workspaceDir?: string,
    bootstrapFiles?: WorkspaceBootstrapFile[],
    cfg?: ClawdbotConfig
  }
}
```
## 事件类型

### 命令事件

当代理命令被触发时：

- **`command`**: 所有命令事件（通用监听器）
- **`command:new`**: 当发出 `/new` 命令时
- **`command:reset`**: 当发出 `/reset` 命令时
- **`command:stop`**: 当发出 `/stop` 命令时

### 代理事件

- **`agent:bootstrap`**: 在工作区引导文件被注入之前（钩子可能会修改 `context.bootstrapFiles`）

### 网关事件

当网关启动时触发：

- **`gateway:startup`**: 在通道启动并加载钩子之后

### 工具结果钩子（插件 API）

这些钩子不是事件流监听器；它们允许插件在 Clawdbot 持久化工具结果之前同步调整这些结果。

- **`tool_result_persist`**: 在工具结果被写入会话记录之前对其进行转换。必须是同步的；返回更新后的工具结果负载，或返回 `undefined` 以保持原样。参见 [代理循环](/concepts/agent-loop.md)。

### 未来事件

计划中的事件类型：

- **`session:start`**: 当新会话开始时
- **`session:end`**: 当会话结束时
- **`agent:error`**: 当代理遇到错误时
- **`message:sent`**: 当消息被发送时
- **`message:received`**: 当消息被接收时

## 创建自定义钩子

### 1. 选择位置

- **工作区钩子** (`<workspace>/hooks/`): 每个代理专用，优先级最高
- **托管钩子** (`~/.clawdbot/hooks/`): 跨工作区共享
### 2. 创建目录结构
```bash
mkdir -p ~/.clawdbot/hooks/my-hook
cd ~/.clawdbot/hooks/my-hook
```
### 3. 创建 HOOK.md---
name: my-hook
description: "做有用的事情"
metadata: {"clawdbot":{"emoji":"🎯","events":["command:new"]}}
---

# 我的自定义钩子

当您发出 `/new` 命令时，此钩子会做有用的事情。### 4. 创建 handler.ts
```typescript
import type { HookHandler } from '../../src/hooks/hooks.js';

const handler: HookHandler = async (event) => {
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  console.log('[my-hook] Running!');
  // Your logic here
};

export default handler;
```
## 5. 启用与测试
```bash
# Verify hook is discovered
clawdbot hooks list

# Enable it
clawdbot hooks enable my-hook

# Restart your gateway process (menu bar app restart on macOS, or restart your dev process)

# Trigger the event
# Send /new via your messaging channel
```
## 配置

### 新配置格式（推荐）
```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "session-memory": { "enabled": true },
        "command-logger": { "enabled": false }
      }
    }
  }
}
```
### 每个 Hook 的配置

Hook 可以有自定义配置：
```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "my-hook": {
          "enabled": true,
          "env": {
            "MY_CUSTOM_VAR": "value"
          }
        }
      }
    }
  }
}
```
### 额外目录

从额外目录加载钩子：
```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "load": {
        "extraDirs": ["/path/to/more/hooks"]
      }
    }
  }
}
```
### 旧版配置格式（仍受支持）

旧版配置格式仍用于向后兼容：
```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "command:new",
          "module": "./hooks/handlers/my-handler.ts",
          "export": "default"
        }
      ]
    }
  }
}
```
**迁移**: 使用基于发现的新系统来处理新钩子。遗留的处理器会在目录-based 钩子之后加载。

## CLI 命令

### 列出钩子
```bash
# List all hooks
clawdbot hooks list

# Show only eligible hooks
clawdbot hooks list --eligible

# Verbose output (show missing requirements)
clawdbot hooks list --verbose

# JSON output
clawdbot hooks list --json
```
## 钩子信息
```bash
# Show detailed info about a hook
clawdbot hooks info session-memory

# JSON output
clawdbot hooks info session-memory --json
```
## 检查资格
```bash
# Show eligibility summary
clawdbot hooks check

# JSON output
clawdbot hooks check --json
```
## 启用/禁用
```bash
# Enable a hook
clawdbot hooks enable session-memory

# Disable a hook
clawdbot hooks disable command-logger
```
## 内置钩子

### session-memory

当你发出 `/new` 命令时，将会话上下文保存到内存中。

**事件**: `command:new`

**要求**: 必须配置 `workspace.dir`

**输出**: `<workspace>/memory/YYYY-MM-DD-slug.md`（默认为 `~/clawd`）

**它做了什么**:
1. 使用预重置会话条目来定位正确的对话记录
2. 提取最后 15 行对话内容
3. 使用 LLM 生成一个描述性的文件名缩略词
4. 将会话元数据保存到带有日期的内存文件中

**示例输出**:# 会话：2026-01-16 14:30:00 UTC

- **会话密钥**: agent:main:main
- **会话ID**: abc123def456
- **来源**: telegram**文件名示例**:
- `2026-01-16-vendor-pitch.md`
- `2026-01-16-api-design.md`
- `2026-01-16-1430.md` (如果别名生成失败，则使用此回退时间戳)

**启用**:
```bash
clawdbot hooks enable session-memory
```
### command-logger

将所有命令事件记录到集中式的审计文件中。

**事件**: `command`

**要求**: 无

**输出**: `~/.clawdbot/logs/commands.log`

**它的作用**:
1. 捕获事件详情（命令操作、时间戳、会话密钥、发送者ID、来源）
2. 以 JSONL 格式追加到日志文件中
3. 在后台静默运行

**示例日志条目**:
```jsonl
{"timestamp":"2026-01-16T14:30:00.000Z","action":"new","sessionKey":"agent:main:main","senderId":"+1234567890","source":"telegram"}
{"timestamp":"2026-01-16T15:45:22.000Z","action":"stop","sessionKey":"agent:main:main","senderId":"user@example.com","source":"whatsapp"}
```
**查看日志**：
```bash
# View recent commands
tail -n 20 ~/.clawdbot/logs/commands.log

# Pretty-print with jq
cat ~/.clawdbot/logs/commands.log | jq .

# Filter by action
grep '"action":"new"' ~/.clawdbot/logs/commands.log | jq .
```
**启用**：
```bash
clawdbot hooks enable command-logger
```
## soul-evil

在清理窗口期间或随机机会下，将 `SOUL.md` 内容与 `SOUL_EVIL.md` 进行交换。

**事件**: `agent:bootstrap`

**文档**: [SOUL Evil Hook](/hooks/soul-evil.md)

**输出**: 不写入任何文件；交换仅在内存中进行。

**启用**:
```bash
clawdbot hooks enable soul-evil
```
**配置**：
```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "soul-evil": {
          "enabled": true,
          "file": "SOUL_EVIL.md",
          "chance": 0.1,
          "purge": { "at": "21:00", "duration": "15m" }
        }
      }
    }
  }
}
```
### boot-md

在网关启动时运行 `BOOT.md`（在通道启动之后）。
必须启用内部钩子才能运行此功能。

**事件**: `gateway:startup`

**要求**: 必须配置 `workspace.dir`

**它会做什么**:
1. 从你的工作区读取 `BOOT.md`
2. 通过代理运行器执行其中的指令
3. 通过消息工具发送任何请求的出站消息

**启用**:
```bash
clawdbot hooks enable boot-md
```
## 最佳实践

### 保持处理函数快速

钩子（Hooks）在命令处理期间运行。请保持它们轻量级：
```typescript
// ✓ Good - async work, returns immediately
const handler: HookHandler = async (event) => {
  void processInBackground(event); // Fire and forget
};

// ✗ Bad - blocks command processing
const handler: HookHandler = async (event) => {
  await slowDatabaseQuery(event);
  await evenSlowerAPICall(event);
};
```
### 优雅地处理错误

始终将高风险操作包裹在内：
```typescript
const handler: HookHandler = async (event) => {
  try {
    await riskyOperation(event);
  } catch (err) {
    console.error('[my-handler] Failed:', err instanceof Error ? err.message : String(err));
    // Don't throw - let other handlers run
  }
};
```
### 尽早过滤事件

如果事件不相关，尽早返回：
```typescript
const handler: HookHandler = async (event) => {
  // Only handle 'new' commands
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  // Your logic here
};
```
### 使用特定的事件键

在可能的情况下，在元数据中指定具体的事件：
```yaml
metadata: {"clawdbot":{"events":["command:new"]}}  # Specific
```
而不是：
```yaml
metadata: {"clawdbot":{"events":["command"]}}      # General - more overhead
```
## 调试

### 启用钩子日志

网关在启动时会记录钩子的加载情况：
```
Registered hook: session-memory -> command:new
Registered hook: command-logger -> command
Registered hook: boot-md -> gateway:startup
```
### 检测发现

列出所有发现的钩子：
```bash
clawdbot hooks list --verbose
```
### 检查注册

在你的处理程序中，记录其被调用时的日志：
```typescript
const handler: HookHandler = async (event) => {
  console.log('[my-handler] Triggered:', event.type, event.action);
  // Your logic
};
```
### 验证资格

检查为什么某个钩子不满足资格条件：
```bash
clawdbot hooks info my-hook
```
查找输出中缺失的需求。

## 测试

### 网关日志

监控网关日志以查看钩子执行情况：
```bash
# macOS
./scripts/clawlog.sh -f

# Other platforms
tail -f ~/.clawdbot/gateway.log
```
## 直接测试钩子

在隔离状态下测试您的处理程序：
```typescript
import { test } from 'vitest';
import { createHookEvent } from './src/hooks/hooks.js';
import myHandler from './hooks/my-hook/handler.js';

test('my handler works', async () => {
  const event = createHookEvent('command', 'new', 'test-session', {
    foo: 'bar'
  });

  await myHandler(event);

  // Assert side effects
});
```
## 架构

### 核心组件

- **`src/hooks/types.ts`**: 类型定义
- **`src/hooks/workspace.ts`**: 目录扫描与加载
- **`src/hooks/frontmatter.ts`**: HOOK.md 元数据解析
- **`src/hooks/config.ts`**: 资格检查
- **`src/hooks/hooks-status.ts`**: 状态报告
- **`src/hooks/loader.ts`**: 动态模块加载器
- **`src/cli/hooks-cli.ts`**: CLI 命令
- **`src/gateway/server-startup.ts`**: 网关启动时加载钩子
- **`src/auto-reply/reply/commands-core.ts`**: 触发命令事件
```
Gateway startup
    ↓
Scan directories (workspace → managed → bundled)
    ↓
Parse HOOK.md files
    ↓
Check eligibility (bins, env, config, os)
    ↓
Load handlers from eligible hooks
    ↓
Register handlers for events
```
### 事件流程
```
User sends /new
    ↓
Command validation
    ↓
Create hook event
    ↓
Trigger hook (all registered handlers)
    ↓
Command processing continues
    ↓
Session reset
```
## 故障排除

### 挂钩未被发现

1. 检查目录结构：   
```bash
   ls -la ~/.clawdbot/hooks/my-hook/
   # Should show: HOOK.md, handler.ts
   
```
2. 验证 HOOK.md 格式：   
```bash
   cat ~/.clawdbot/hooks/my-hook/HOOK.md
   # Should have YAML frontmatter with name and metadata
   
```
3. 列出所有已发现的钩子：   
```bash
   clawdbot hooks list
   
```
### 不符合资格的 Hook

检查要求：
```bash
clawdbot hooks info my-hook
```
查找缺失项：
- 二进制文件（检查 PATH）
- 环境变量
- 配置值
- 操作系统兼容性

### 钩子未执行

1. 确认钩子已启用：   
```bash
   clawdbot hooks list
   # Should show ✓ next to enabled hooks
   
```
2. 重启网关进程以重新加载钩子。

3. 检查网关日志中的错误：   
```bash
   ./scripts/clawlog.sh | grep hook
   
```
### 处理器错误

检查 TypeScript/导入错误：
```bash
# Test import directly
node -e "import('./path/to/handler.ts').then(console.log)"
```
## 迁移指南

### 从旧版配置到发现

**之前**：
```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "command:new",
          "module": "./hooks/handlers/my-handler.ts"
        }
      ]
    }
  }
}
```
**之后**：

1. 创建钩子目录：   
```bash
   mkdir -p ~/.clawdbot/hooks/my-hook
   mv ./hooks/handlers/my-handler.ts ~/.clawdbot/hooks/my-hook/handler.ts
   
```
2. 创建 HOOK.md：---
name: my-hook
description: "我的自定义钩子"
metadata: {"clawdbot":{"emoji":"🎯","events":["command:new"]}}
---

# 我的钩子

做些有用的事情。3. 更新配置：   
```json
   {
     "hooks": {
       "internal": {
         "enabled": true,
         "entries": {
           "my-hook": { "enabled": true }
         }
       }
     }
   }
   
```
4. 验证并重启网关进程：   
```bash
   clawdbot hooks list
   # Should show: 🎯 my-hook ✓
   
```
**迁移的优势**：
- 自动发现
- CLI 管理
- 资格检查
- 更好的文档
- 一致的结构

## 相关内容

- [CLI 参考：钩子](/cli/hooks.md)
- [内置钩子 README](https://github.com/clawdbot/clawdbot/tree/main/src/hooks/bundled)
- [Webhook 钩子](/automation/webhook.md)
- [配置](/gateway/configuration.md#hooks)
