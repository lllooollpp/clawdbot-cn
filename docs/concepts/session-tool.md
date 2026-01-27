---
summary: "Agent session tools for listing sessions, fetching history, and sending cross-session messages"
read_when:
  - Adding or modifying session tools
---

# 会话工具

目标：提供一组小型、不易误用的工具，使代理可以列出会话、获取历史记录，并将消息发送到另一个会话。

## 工具名称
- `sessions_list`
- `sessions_history`
- `sessions_send`
- `sessions_spawn`

## 关键模型
- 主要直接聊天桶始终是字面量键 `"main"`（解析为当前代理的主键）。
- 群组聊天使用 `agent:<agentId>:<channel>:group:<id>` 或 `agent:<agentId>:<channel>:channel:<id>`（传递完整键）。
- 定时任务使用 `cron:<job.id>`。
- 钩子使用 `hook:<uuid>`，除非显式设置。
- 节点会话使用 `node-<nodeId>`，除非显式设置。

`global` 和 `unknown` 是保留值，永远不会被列出。如果 `session.scope = "global"`，我们将其别名为 `main`，以便所有工具的调用者永远不会看到 `global`。

## sessions_list
以行数组的形式列出会话。

参数：
- `kinds?: string[]` 筛选器：可以是 `"main" | "group" | "cron" | "hook" | "node" | "other"`
- `limit?: number` 最大行数（默认：服务器默认值，例如限制为 200）
- `activeMinutes?: number` 仅包括最近 N 分钟内更新的会话
- `messageLimit?: number` 0 = 不包含消息（默认 0）；>0 = 包含最后 N 条消息

行为：
- `messageLimit > 0` 会为每个会话获取 `chat.history` 并包含最后 N 条消息。
- 工具结果在列表输出中会被过滤；使用 `sessions_history` 获取工具消息。
- 当在 **沙盒代理会话** 中运行时，会话工具默认只显示 **已生成的会话**（见下文）。

行结构（JSON）：
- `key`: 会话键（字符串）
- `kind`: `main | group | cron | hook | node | other`
- `channel`: `whatsapp | telegram | discord | signal | imessage | webchat | internal | unknown`
- `displayName`（如果群组有显示标签）
- `updatedAt`（毫秒）
- `sessionId`
- `model`, `contextTokens`, `totalTokens`
- `thinkingLevel`, `verboseLevel`, `systemSent`, `abortedLastRun`
- `sendPolicy`（会话的覆盖策略，如果设置）
- `lastChannel`, `lastTo`
- `deliveryContext`（当可用时，标准化的 `{ channel, to, accountId }`）
- `transcriptPath`（根据存储目录和 sessionId 得到的最佳路径）
- `messages?`（仅当 `messageLimit > 0` 时存在）

## sessions_history
获取某个会话的对话记录。

参数：
- `sessionKey`（必填；接受会话键或 `sessions_list` 中的 `sessionId`）
- `limit?: number` 最大消息数（服务器会进行限制）
- `includeTools?: boolean`（默认为 false）

行为：
- `includeTools=false` 会过滤掉 `role: "toolResult"` 的消息。
- 返回原始对话记录格式的消息数组。
- 当提供 `sessionId` 时，Clawdbot 会将其解析为对应的会话键（如果找不到会报错）。

## sessions_send
将消息发送到另一个会话。

参数：
- `sessionKey`（必填；接受会话键或 `sessions_list` 中的 `sessionId`）
- `message`（必填）
- `timeoutSeconds?: number`（默认 >0；0 = 一次性的发送，不等待响应）

行为：
- `timeoutSeconds = 0`：将请求加入队列并返回 `{ runId, status: "accepted" }`。
- `timeoutSeconds > 0`：最多等待 N 秒以完成，然后返回 `{ runId, status: "ok", reply }`。
- 如果等待超时：返回 `{ runId, status: "timeout", error }`。运行继续；稍后调用 `sessions_history`。
- 如果运行失败：返回 `{ runId, status: "error", error }`。
- 主要运行完成后，Clawdbot 会宣布交付运行，但这是最佳努力的；`status: "ok"` 并不保证宣布已成功送达。
- 通过网关 `agent.wait`（服务端）进行等待，因此重新连接不会中断等待。
- 代理间的消息上下文会被注入到主要运行中。
- 主要运行完成后，Clawdbot 会运行一个 **回复循环**：
  - 第 2 轮及以后的循环在请求者代理和目标代理之间交替进行。
  - 回复 `REPLY_SKIP` 以停止来回回复。
  - 最大轮次为 `session.agentToAgent.maxPingPongTurns`（0–5，缺省为 5）。
- 一旦循环结束，Clawdbot 会运行 **代理间宣布步骤**（仅限目标代理）：
  - 回复 `ANNOUNCE_SKIP` 以保持沉默。
  - 其他任何回复都会被发送到目标频道。
  - 宣布步骤包括原始请求 + 第一轮回复 + 最新的来回回复。

## 频道字段
- 对于群组，`channel` 是会话条目中记录的频道。
- 对于私聊，`channel` 从 `lastChannel` 映射而来。
- 对于定时任务/钩子/节点，`channel` 是 `internal`。
- 如果缺失，`channel` 为 `unknown`。

## 安全性 / 发送策略
基于频道/聊天类型的策略性阻止（不是基于会话 ID）。
json
{
  "session": {
    "sendPolicy": {
      "rules": [
        {
          "match": { "channel": "discord", "chatType": "group" },
          "action": "deny"
        }
      ],
      "default": "allow"
    }
  }
}
`````````
运行时覆盖（每个会话条目）：
- `sendPolicy: "allow" | "deny"`（未设置 = 继承配置）
- 可通过 `sessions.patch` 或所有者专用的 `/send on|off|inherit`（独立消息）设置。

执行点：
- `chat.send` / `agent`（网关）
- 自动回复分发逻辑

## sessions_spawn
在隔离的会话中启动一个子代理，并将结果通知回请求者聊天频道。

参数：
- `task`（必需）
- `label?`（可选；用于日志/UI）
- `agentId?`（可选；如果允许，可在另一个 agentId 下启动）
- `model?`（可选；覆盖子代理的模型；无效值会报错）
- `runTimeoutSeconds?`（默认 0；设置后，N 秒后中止子代理运行）
- `cleanup?` (`delete|keep`, 默认 `keep`)

允许列表：
- `agents.list[].subagents.allowAgents`: 通过 `agentId` 允许的 agent id 列表（`["*"]` 表示允许任何）。默认：仅允许请求者 agent。

发现：
- 使用 `agents_list` 来发现哪些 agent id 可以通过 `sessions_spawn` 使用。

行为：
- 启动一个新的 `agent:<agentId>:subagent:<uuid>` 会话，`deliver: false`。
- 子代理默认使用完整的工具集 **减去会话工具**（可通过 `tools.subagents.tools` 配置）。
- 子代理不允许调用 `sessions_spawn`（不允许子代理 → 子代理的生成）。
- 始终是非阻塞的：立即返回 `{ status: "accepted", runId, childSessionKey }`。
- 完成后，Clawdbot 会运行一个子代理 **通知步骤**，并将结果发布到请求者的聊天频道。
- 在通知步骤中回复 `ANNOUNCE_SKIP` 以保持静默。
- 通知回复会被归一化为 `Status`/`Result`/`Notes`；`Status` 来自运行时结果（不是模型文本）。
- 子代理会话在 `agents.defaults.subagents.archiveAfterMinutes`（默认：60 分钟）后自动归档。
- 通知回复包含统计信息行（运行时间、token 数、sessionKey/sessionId、对话路径，以及可选的费用）。```json5
{
  agents: {
    defaults: {
      sandbox: {
        // default: "spawned"
        sessionToolsVisibility: "spawned" // or "all"
      }
    }
  }
}
```
