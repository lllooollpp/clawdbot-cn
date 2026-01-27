---
summary: "Agent tool surface for Clawdbot (browser, canvas, nodes, message, cron) replacing legacy `clawdbot-*` skills"
read_when:
  - Adding or modifying agent tools
  - Retiring or changing `clawdbot-*` skills
---

# 工具（Clawdbot）

Clawdbot 为浏览器、画布、节点和定时任务提供了**一等公民的代理工具**。
这些工具取代了旧的 `clawdbot-*` 技能：工具具有类型定义，无需通过 shell，
代理应该直接使用这些工具。

## 禁用工具

您可以通过在 `clawdbot.json` 中设置 `tools.allow` 和 `tools.deny` 来全局允许或拒绝工具
（`tools.deny` 优先级更高）。这将防止被禁用的工具被发送给模型提供者。
json5
{
  tools: { deny: ["browser"] }
}
``````
注意事项：
- 匹配是大小写不敏感的。
- 支持 `*` 通配符（`"*"` 表示所有工具）。
- 如果 `tools.allow` 仅引用了未知或未加载的插件工具名称，Clawdbot 会记录一个警告，并忽略允许列表，因此核心工具仍然可用。

## 工具配置文件（基础允许列表）

`tools.profile` 在 `tools.allow`/`tools.deny` 之前设置一个 **基础工具允许列表**。
每个代理的覆盖设置：`agents.list[].tools.profile`。

配置文件：
- `minimal`：仅 `session_status`
- `coding`：`group:fs`、`group:runtime`、`group:sessions`、`group:memory`、`image`
- `messaging`：`group:messaging`、`sessions_list`、`sessions_history`、`sessions_send`、`session_status`
- `full`：无限制（与未设置相同）

示例（默认仅允许 messaging，也允许 Slack + Discord 工具）：```json5
{
  tools: {
    profile: "messaging",
    allow: ["slack", "discord"]
  }
}
```
{
  tools: {
    profile: "coding",
    deny: ["group:runtime"]
  }
}```
示例（全局编码配置，仅支持消息的客服代理）：```json5
{
  tools: { profile: "coding" },
  agents: {
    list: [
      {
        id: "support",
        tools: { profile: "messaging", allow: ["slack"] }
      }
    ]
  }
}
```
## 供应商特定工具策略

使用 `tools.byProvider` 可以 **进一步限制** 某个特定供应商（或单个 `provider/model`）的工具，而无需更改你的全局默认设置。  
按代理覆盖：`agents.list[].tools.byProvider`。

此策略在 **基础工具配置之后** 和 **允许/拒绝列表之前** 应用，因此它只能缩小工具集。  
供应商键可以是 `provider`（例如 `google-antigravity`）或 `provider/model`（例如 `openai/gpt-5.2`）。

示例（保留全局编码配置，但为 Google Antigravity 提供最少的工具）：
json5
{
  tools: {
    profile: "coding",
    byProvider: {
      "google-antigravity": { profile: "minimal" }
    }
  }
}
``````
示例（针对一个不稳定的端点的提供者/模型特定白名单）：```json5
{
  tools: {
    allow: ["group:fs", "group:runtime", "sessions_list"],
    byProvider: {
      "openai/gpt-5.2": { allow: ["group:fs", "sessions_list"] }
    }
  }
}
```
{
  agents: {
    list: [
      {
        id: "support",
        tools: {
          byProvider: {
            "google-antigravity": { allow: ["message", "sessions_list"] }
          }
        }
      }
    ]
  }
}```
## 工具组（快捷方式）

工具策略（全局、代理、沙箱）支持 `group:*` 条目，这些条目会扩展为多个工具。
在 `tools.allow` / `tools.deny` 中使用这些条目。

可用的组：
- `group:runtime`: `exec`, `bash`, `process`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:web`: `web_search`, `web_fetch`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:clawdbot`: 所有内置的 Clawdbot 工具（不包括提供者插件）

示例（仅允许文件工具 + 浏览器）：```json5
{
  tools: {
    allow: ["group:fs", "browser"]
  }
}
```
## 插件 + 工具

插件可以注册**额外的工具**（以及CLI命令）超出核心集。
有关安装 + 配置，请参阅[插件](/plugin)，有关如何将工具使用指南注入提示的信息，请参阅[技能](/tools/skills)。一些插件会随工具一起提供自己的技能（例如，语音通话插件）。

可选插件工具：
- [Lobster](/tools/lobster)：带可恢复批准的类型化工作流运行时（需要在网关主机上安装Lobster CLI）。
- [LLM任务](/tools/llm-task)：仅JSON的LLM步骤，用于结构化工作流输出（可选的模式验证）。

## 工具列表

### `apply_patch`
在一个或多个文件上应用结构化的补丁。适用于多块编辑。
实验性功能：通过 `tools.exec.applyPatch.enabled` 启用（仅限OpenAI模型）。

### `exec`
在工作区中运行shell命令。

核心参数：
- `command`（必需）
- `yieldMs`（超时后自动后台运行，默认值 10000）
- `background`（立即后台运行）
- `timeout`（秒；超过后终止进程，默认值 1800）
- `elevated`（布尔值；如果启用了提升模式，则在主机上运行；仅当代理处于沙箱模式时才会改变行为）
- `host`（`sandbox | gateway | node`）
- `security`（`deny | allowlist | full`）
- `ask`（`off | on-miss | always`）
- `node`（当 `host=node` 时，指定节点ID/名称）
- 需要真实的TTY？设置 `pty: true`。

备注：
- 后台运行时返回 `status: "running"` 和 `sessionId`。
- 使用 `process` 来轮询/日志/写入/终止/清除后台会话。
- 如果不允许 `process`，`exec` 将同步运行，并忽略 `yieldMs`/`background`。
- `elevated` 由 `tools.elevated` 加上任何 `agents.list[].tools.elevated` 的覆盖设置共同决定（两者都必须允许）并且是 `host=gateway` + `security=full` 的别名。
- `elevated` 仅在代理处于沙箱模式时才会改变行为（否则无操作）。
- `host=node` 可以针对macOS伴侣应用或无头节点主机（`clawdbot node run`）。
- 网关/节点的批准和允许列表：[Exec批准](/tools/exec-approvals)。

### `process`
管理后台的exec会话。

核心操作：
- `list`, `poll`, `log`, `write`, `kill`, `clear`, `remove`

备注：
- `poll` 在完成时返回新输出和退出状态。
- `log` 支持基于行的 `offset`/`limit`（省略 `offset` 可获取最后N行）。
- `process` 按代理作用域；其他代理的会话不可见。

### `web_search`
使用Brave Search API搜索网络。

核心参数：
- `query`（必需）
- `count`（1–10；默认值由 `tools.web.search.maxResults` 决定）

备注：
- 需要Brave API密钥（推荐：`clawdbot configure --section web`，或设置 `BRAVE_API_KEY`）。
- 通过 `tools.web.search.enabled` 启用。
- 响应会被缓存（默认15分钟）。
- 详见[网络工具](/tools/web)的设置。

### `web_fetch`
从URL获取并提取可读内容（HTML → markdown/文本）。

核心参数：
- `url`（必需）
- `extractMode`（`markdown` | `text`）
- `maxChars`（截断长页面）

说明：
- 通过 `tools.web.fetch.enabled` 启用。
- 响应会被缓存（默认为15分钟）。
- 对于JavaScript密集型网站，建议使用浏览器工具。
- 详见 [Web 工具](/tools/web) 进行设置。
- 详见 [Firecrawl](/tools/firecrawl) 了解可选的反机器人备用方案。

### `browser`
控制专用的 clawd 浏览器。

核心操作：
- `status`、`start`、`stop`、`tabs`、`open`、`focus`、`close`
- `snapshot`（aria/ai）
- `screenshot`（返回图片块 + `MEDIA:<路径>`）
- `act`（UI操作：点击/输入/按下/悬停/拖动/选择/填写/调整大小/等待/评估）
- `navigate`、`console`、`pdf`、`upload`、`dialog`

配置文件管理：
- `profiles` — 列出所有浏览器配置文件及其状态
- `create-profile` — 创建新配置文件并自动分配端口（或 `cdpUrl`）
- `delete-profile` — 停止浏览器，删除用户数据，从配置中移除（仅限本地）
- `reset-profile` — 杀死配置文件端口上的孤儿进程（仅限本地）

常用参数：
- `controlUrl`（默认从配置中获取）
- `profile`（可选；默认为 `browser.defaultProfile`）

### 说明：
- 需要 `browser.enabled=true`（默认为 `true`；设置为 `false` 可禁用）。
- 如果未显式传递 `controlUrl`，则使用 `browser.controlUrl`。
- 所有操作均可接受可选的 `profile` 参数，用于多实例支持。
- 当未指定 `profile` 时，使用 `browser.defaultProfile`（默认为 "chrome"）。
- 配置文件名称：仅允许小写字母、数字和短横线（最多64个字符）。
- 端口范围：18800-18899（最多约100个配置文件）。
- 远程配置文件仅支持连接（不支持启动/停止/重置）。
- 如果安装了 Playwright，`snapshot` 默认使用 `ai`；使用 `aria` 可获取可访问性树。
- `snapshot` 还支持角色快照选项（`interactive`、`compact`、`depth`、`selector`），返回如 `e12` 的引用。
- `act` 需要 `snapshot` 提供的 `ref`（AI 快照中的数字 `12`，或角色快照中的 `e12`）；对于罕见的 CSS 选择器需求，使用 `evaluate`。
- 默认避免使用 `act` → `wait`；仅在特殊情况下使用（无可靠的 UI 状态可等待）。
- `upload` 可选择性地传递 `ref`，在准备就绪后自动点击。
- `upload` 还支持 `inputRef`（aria 引用）或 `element`（CSS 选择器）来直接设置 `<input type="file">`。

### `canvas`
驱动节点 Canvas（显示、评估、快照、A2UI）。

核心操作：
- `present`、`hide`、`navigate`、`eval`
- `snapshot`（返回图片块 + `MEDIA:<路径>`）
- `a2ui_push`、`a2ui_reset`

说明：
- 底层使用网关 `node.invoke`。
- 如果未提供 `node`，工具会自动选择一个默认节点（单个连接的节点或本地的 mac 节点）。
- A2UI 仅支持 v0.8（不支持 `createSurface`）；CLI 会拒绝 v0.9 的 JSONL 格式，因行错误而报错。
- 快速测试：`clawdbot nodes canvas a2ui push --node <id> --text "Hello from A2UI"`。

### `nodes`
发现并定位配对的节点；发送通知；捕获摄像头/屏幕。

核心操作：
- `status`、`describe`
- `pending`、`approve`、`reject`（配对）
- `notify`（macOS 的 `system.notify`）
- `run`（macOS 的 `system.run`）
- `camera_snap`、`camera_clip`、`screen_record`
- `location_get`

说明：
- 摄像头/屏幕命令需要将节点应用置于前台。
- 图像返回图像块 + `MEDIA:<路径>`。
- 视频返回 `FILE:<路径>`（mp4 格式）。
- 位置返回一个 JSON 负载（纬度/经度/精度/时间戳）。
- `run` 参数：`command` 命令行参数数组；可选参数 `cwd`、`env`（`KEY=VAL`）、`commandTimeoutMs`、`invokeTimeoutMs`、`needsScreenRecording`。

示例（`run`）：
json
{
  "action": "run",
  "node": "office-mac",
  "command": ["echo", "Hello"],
  "env": ["FOO=bar"],
  "commandTimeoutMs": 12000,
  "invokeTimeoutMs": 45000,
  "needsScreenRecording": false
}
``````
### `image`
使用配置的图像模型分析图像。

核心参数：
- `image`（必需，路径或URL）
- `prompt`（可选；默认为 "Describe the image."）
- `model`（可选覆盖）
- `maxBytesMb`（可选大小限制）

注意事项：
- 仅在 `agents.defaults.imageModel` 已配置（主模型或备用模型）时可用，或者当可以从默认模型 + 配置的认证中推断出隐式的图像模型时可用（最佳尝试匹配）。
- 直接使用图像模型（与主聊天模型无关）。

### `message`
在 Discord/Google Chat/Slack/Telegram/WhatsApp/Signal/iMessage/MS Teams 之间发送消息和频道操作。

核心操作：
- `send`（文本 + 可选媒体；MS Teams 还支持 `card` 用于自适应卡片）
- `poll`（WhatsApp/Discord/MS Teams 投票）
- `react` / `reactions` / `read` / `edit` / `delete`
- `pin` / `unpin` / `list-pins`
- `permissions`
- `thread-create` / `thread-list` / `thread-reply`
- `search`
- `sticker`
- `member-info` / `role-info`
- `emoji-list` / `emoji-upload` / `sticker-upload`
- `role-add` / `role-remove`
- `channel-info` / `channel-list`
- `voice-status`
- `event-list` / `event-create`
- `timeout` / `kick` / `ban`

注意事项：
- `send` 通过网关发送 WhatsApp 消息；其他频道直接发送。
- `poll` 通过网关发送 WhatsApp 和 MS Teams 投票；Discord 投票直接发送。
- 当消息工具调用绑定到一个活跃的聊天会话时，发送操作将受到限制，只能发送到该会话的目标，以避免跨上下文泄露。

### `cron`
管理网关的定时任务和唤醒。

核心操作：
- `status`, `list`
- `add`, `update`, `remove`, `run`, `runs`
- `wake`（加入系统事件 + 可选立即心跳）

注意事项：
- `add` 需要一个完整的定时任务对象（与 `cron.add` RPC 的模式相同）。
- `update` 使用 `{ id, patch }`。

### `gateway`
重启或应用正在运行的网关进程（就地重启）。

核心操作：
- `restart`（授权 + 发送 `SIGUSR1` 以进行进程内重启；`clawdbot gateway` 就地重启）
- `config.get` / `config.schema`
- `config.apply`（验证 + 写入配置 + 重启 + 唤醒）
- `config.patch`（合并部分更新 + 重启 + 唤醒）
- `update.run`（运行更新 + 重启 + 唤醒）

注意事项：
- 使用 `delayMs`（默认为 2000）以避免中断正在进行的回复。
- `restart` 默认被禁用；通过 `commands.restart: true` 启用。

### `sessions_list` / `sessions_history` / `sessions_send` / `sessions_spawn` / `session_status`
列出会话、检查对话历史记录，或发送到另一个会话。

核心参数：
- `sessions_list`: `kinds?`, `limit?`, `activeMinutes?`, `messageLimit?`（0 = 无限制）
- `sessions_history`: `sessionKey`（或 `sessionId`），`limit?`, `includeTools?`
- `sessions_send`: `sessionKey`（或 `sessionId`），`message`, `timeoutSeconds?`（0 = 一次性发送）
- `sessions_spawn`: `task`, `label?`, `agentId?`, `model?`, `runTimeoutSeconds?`, `cleanup?`
- `session_status`: `sessionKey?`（默认为当前会话；接受 `sessionId`），`model?`（`default` 会清除覆盖）

注意事项：
- `main` 是标准的 direct-chat 密钥；global/unknown 是隐藏的。
- `messageLimit > 0` 会获取每个会话的最后 N 条消息（工具消息会被过滤）。
- `sessions_send` 在 `timeoutSeconds > 0` 时会等待最终完成。
- 交付/公告发生在完成之后，且是尽力而为的；`status: "ok"` 表示代理运行已完成，而不是表示公告已被送达。
- `sessions_spawn` 会启动一个子代理运行，并将公告回复发送回请求者聊天。
- `sessions_spawn` 是非阻塞的，会立即返回 `status: "accepted"`。
- `sessions_send` 会运行一个回复-回声的 ping-pong 流程（回复 `REPLY_SKIP` 可以停止；最大回合数通过 `session.agentToAgent.maxPingPongTurns` 设置，0–5）。
- 在 ping-pong 完成后，目标代理会运行一个 **公告步骤**；回复 `ANNOUNCE_SKIP` 可以抑制公告。

### `agents_list`
列出当前会话可以使用 `sessions_spawn` 目标代理的 ID。

注意事项：
- 结果受限于每个代理的允许列表 (`agents.list[].subagents.allowAgents`)。
- 当配置为 `["*"]` 时，工具将包含所有配置的代理，并标记 `allowAny: true`。

## 参数（通用）

网关支持的工具（`canvas`、`nodes`、`cron`）：
- `gatewayUrl`（默认为 `ws://127.0.0.1:18789`）
- `gatewayToken`（如果启用了认证）
- `timeoutMs`

浏览器工具：
- `controlUrl`（默认值来自配置）

## 推荐的代理流程

浏览器自动化：
1) `browser` → `status` / `start`
2) `snapshot`（ai 或 aria）
3) `act`（点击/输入/按下）
4) 如果需要视觉确认，请使用 `screenshot`

画布渲染：
1) `canvas` → `present`
2) `a2ui_push`（可选）
3) `snapshot`

节点目标：
1) `nodes` → `status`
2) 对选定的节点执行 `describe`
3) 执行 `notify` / `run` / `camera_snap` / `screen_record`

## 安全性

- 避免直接使用 `system.run`；只有在用户明确同意的情况下，才使用 `nodes` → `run`。
- 尊重用户对摄像头/屏幕捕获的同意。
- 在调用媒体命令之前，使用 `status/describe` 确保权限。

## 工具如何呈现给代理

工具通过两个并行通道呈现：

1) **系统提示文本**：可读的列表 + 指导说明。
2) **工具模式**：发送给模型 API 的结构化函数定义。

这意味着代理可以看到“有哪些工具”以及“如何调用它们”。如果一个工具没有出现在系统提示或模式中，模型将无法调用它。