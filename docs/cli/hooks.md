---
summary: "CLI reference for `clawdbot hooks` (agent hooks)"
read_when:
  - You want to manage agent hooks
  - You want to install or update hooks
---

# `clawdbot hooks`

管理代理钩子（用于命令如 `/new`、`/reset` 和网关启动的事件驱动自动化）。

相关：
- 钩子：[Hooks](/hooks)
- 插件钩子：[Plugins](/plugin#plugin-hooks)

## 列出所有钩子
bash
clawdbot hooks list``````
列出工作区、managed 和 bundled 目录中发现的所有钩子。

**选项：**
- `--eligible`: 仅显示符合条件的钩子（满足要求）
- `--json`: 以 JSON 格式输出
- `-v, --verbose`: 显示详细信息，包括缺失的要求

**示例输出：**```
Hooks (4/4 ready)

Ready:
  🚀 boot-md ✓ - Run BOOT.md on gateway startup
  📝 command-logger ✓ - Log all command events to a centralized audit file
  💾 session-memory ✓ - Save session context to memory when /new command is issued
  😈 soul-evil ✓ - Swap injected SOUL content during a purge window or by random chance
```
**示例（详细）：**
bash
clawdbot hooks list --verbose``````
显示不合规钩子缺失的需求。

**示例（JSON）：**```bash
clawdbot hooks list --json
```
返回结构化的 JSON 以供程序化使用。

## 获取 Hook 信息
bash
clawdbot hooks info <name>``````
显示关于特定钩子的详细信息。

**参数：**
- `<name>`：钩子名称（例如：`session-memory`）

**选项：**
- `--json`：以 JSON 格式输出

**示例：**```bash
clawdbot hooks info session-memory
```
"💾 session-memory ✓ 已准备就绪

当发出 /new 命令时，将会话上下文保存到内存中

详情：
  来源：clawdbot-bundled
  路径：/path/to/clawdbot/hooks/bundled/session-memory/HOOK.md
  处理器：/path/to/clawdbot/hooks/bundled/session-memory/handler.ts
  官方网站：https://docs.clawd.bot/hooks#session-memory
  事件：command:new

要求：
  配置：✓ workspace.dir
## 检查钩子的适用性
bash
clawdbot hooks check
``````
显示钩子（hook）资格状态的摘要（已准备好与未准备好的数量）。

**选项：**
- `--json`: 以 JSON 格式输出

**示例输出：**

钩子状态

总钩子数：4
已准备：4
未准备：0
``````
## 启用钩子
bash
clawdbot hooks enable <name>
``````
通过将钩子添加到你的配置文件（`~/.clawdbot/config.json`）中来启用特定的钩子。

**注意：** 由插件管理的钩子在 `clawdbot hooks list` 中会显示为 `plugin:<id>`，并且不能在此处启用/禁用。请改用启用/禁用插件的方式。

**参数：**
- `<name>`：钩子名称（例如：`session-memory`）

**示例：**
bash
clawdbot hooks enable session-memory
``````
✓ 已启用钩子： 💾 会话内存```
**它的作用：**
- 检查钩子是否存在且有效
- 在您的配置中更新 `hooks.internal.entries.<name>.enabled = true`
- 将配置保存到磁盘

**启用后：**
- 重启网关以使钩子重新加载（在 macOS 上为菜单栏应用程序重启，或在开发环境中重启您的网关进程）。

## 禁用一个钩子
bash
clawdbot hooks disable <name>
``````
通过更新您的配置来禁用特定的钩子。

**参数：**
- `<name>`：钩子名称（例如：`command-logger`）

**示例：**
bash
clawdbot hooks disable command-logger```
⏸ 已禁用钩子： 📝 命令日志记录器```
**禁用后：**
- 重启网关以使钩子重新加载

## 安装钩子```bash
clawdbot hooks install <path-or-spec>
```
从本地文件夹/存档或 npm 安装一个钩子包。

**它的功能：**
- 将钩子包复制到 `~/.clawdbot/hooks/<id>`
- 在 `hooks.internal.entries.*` 中启用已安装的钩子
- 在 `hooks.internal.installs` 中记录安装信息

**选项：**
- `-l, --link`: 代替复制，链接本地目录（添加到 `hooks.internal.load.extraDirs`）

**支持的存档格式：** `.zip`, `.tgz`, `.tar.gz`, `.tar`

**示例：**
bash
# 本地目录
clawdbot hooks install ./my-hook-pack

# 本地存档
clawdbot hooks install ./my-hook-pack.zip

# NPM 包
clawdbot hooks install @clawdbot/my-hook-pack

# 链接本地目录而不复制
clawdbot hooks install -l ./my-hook-pack``````
## 更新钩子```bash
clawdbot hooks update <id>
clawdbot hooks update --all
```
更新已安装的钩子包（仅限 npm 安装）。

**选项：**
- `--all`：更新所有跟踪的钩子包
- `--dry-run`：显示将要进行的更改，但不实际写入

## 内置钩子

### session-memory

当你输入 `/new` 时，将会话上下文保存到内存中。
bash
clawdbot hooks enable session-memory``````
**输出:** `~/clawd/memory/YYYY-MM-DD-slug.md`

**参见:** [session-memory 文档](/hooks#session-memory)

### command-logger

将所有命令事件记录到一个集中式的审计文件中。

**启用:**```bash
clawdbot hooks enable command-logger
```
**输出:** `~/.clawdbot/logs/commands.log`

**查看日志:**
bash
# 最近的命令
tail -n 20 ~/.clawdbot/logs/commands.log

# 格式化输出
cat ~/.clawdbot/logs/commands.log | jq .

# 按操作过滤
grep '"action":"new"' ~/.clawdbot/logs/commands.log | jq .``````
**参见:** [command-logger 文档](/hooks#command-logger)

### soul-evil

在清理窗口期间或随机概率下，将注入的 `SOUL.md` 内容替换为 `SOUL_EVIL.md`。

**启用:**```bash
clawdbot hooks enable soul-evil
```
**参见:** [SOUL Evil Hook](/hooks/soul-evil)

### boot-md

在网关启动时运行 `BOOT.md`（在频道启动之后）。

**事件**: `gateway:startup`

**启用**:
bash
clawdbot hooks enable boot-md``````
**参见:** [boot-md 文档](/hooks#boot-md)