---
summary: "Sub-agents: spawning isolated agent runs that announce results back to the requester chat"
read_when:
  - You want background/parallel work via the agent
  - You are changing sessions_spawn or sub-agent tool policy
---

# 子代理

子代理是在现有代理运行过程中在后台生成的代理运行。它们在自己的会话中运行（`agent:<agentId>:subagent:<uuid>`），并在完成后 **通知** 其结果回请求者聊天频道。

## 斜杠命令

使用 `/subagents` 来检查或控制当前会话的 **子代理运行**：
- `/subagents list`
- `/subagents stop <id|#|all>`
- `/subagents log <id|#> [limit] [tools]`
- `/subagents info <id|#>`
- `/subagents send <id|#> <message>`

`/subagents info` 显示运行的元数据（状态、时间戳、会话 ID、转录文件路径、清理设置）。

主要目标：
- 在不阻塞主运行的情况下并行处理“研究/长任务/慢工具”工作。
- 默认情况下保持子代理的隔离（会话隔离 + 可选沙箱）。
- 使工具表面难以被误用：子代理 **默认不会** 获取会话工具。
- 避免嵌套的分支：子代理不能生成子代理。

成本说明：每个子代理都有其 **自己的** 上下文和 token 使用量。对于重型或重复性任务，可以为子代理设置一个更便宜的模型，而主代理保持高质量模型。
你可以通过 `agents.defaults.subagents.model` 或每个代理的覆盖设置进行配置。

## 工具

使用 `sessions_spawn`：
- 启动一个子代理运行（`deliver: false`，全局通道：`subagent`）
- 然后执行一个通知步骤，并将通知回复发送到请求者的聊天频道
- 默认模型：继承调用者，除非你设置了 `agents.defaults.subagents.model`（或每个代理的 `agents.list[].subagents.model`）；显式的 `sessions_spawn.model` 仍会覆盖。

工具参数：
- `task`（必需）
- `label?`（可选）
- `agentId?`（可选；如果允许，可以在另一个 agentId 下启动）
- `model?`（可选；覆盖子代理模型；无效值会被忽略，子代理将使用默认模型并发出警告）
- `thinking?`（可选；覆盖子代理运行的思考级别）
- `runTimeoutSeconds?`（默认 `0`；设置后，子代理运行将在 N 秒后中止）
- `cleanup?`（`delete|keep`，默认 `keep`）

允许列表：
- `agents.list[].subagents.allowAgents`：可以通过 `agentId` 目标代理的 ID 列表（`["*"]` 表示允许任何）。默认：仅允许请求者代理。

发现：
- 使用 `agents_list` 来查看哪些 agent IDs 当前允许用于 `sessions_spawn`。

自动归档：
- 子代理会话在 `agents.defaults.subagents.archiveAfterMinutes`（默认：60）分钟后自动归档。
- 归档使用 `sessions.delete` 并将转录文件重命名为 `*.deleted.<timestamp>`（同一文件夹）。
- `cleanup: "delete"` 在通知后立即归档（仍通过重命名保留转录文件）。
- 自动归档是尽力而为的；如果网关重启，待处理的定时器将丢失。
- `runTimeoutSeconds` **不会** 自动归档；它只中止运行。会话将继续存在直到自动归档。

**子代理认证是通过** agent id **进行的，而不是通过会话类型：**  
- 子代理的会话密钥是 `agent:<agentId>:subagent:<uuid>`。  
- 认证存储是从该代理的 `agentDir` 中加载的。  
- 主代理的认证配置会被合并作为**备用选项**；在冲突时，代理配置会覆盖主代理配置。

注意：合并是累加的，因此主代理的配置始终可以作为备用选项。目前还不支持每个代理的完全隔离认证。

## 宣布（Announce）

子代理通过一个“宣布”步骤向主代理反馈信息：  
- “宣布”步骤在子代理会话中运行（不是请求者会话）。  
- 如果子代理回复的内容正好是 `ANNOUNCE_SKIP`，则不会发布任何内容。  
- 否则，宣布的回复会通过后续的 `agent` 调用（`deliver=true`）发布到请求者的聊天频道中。  
- 宣布回复会保留可用的线程/主题路由（如 Slack 线程、Telegram 主题、Matrix 线程）。  
- 宣布消息会被标准化为一个稳定模板：  
  - `Status:` 由运行结果得出（`success`、`error`、`timeout` 或 `unknown`）。  
  - `Result:` 来自宣布步骤的摘要内容（如果缺失则为 `(not available)`）。  
  - `Notes:` 错误详情和其他有用的信息。  
- `Status` 不是从模型输出推断出来的；它来自运行时结果信号。

宣布数据包的末尾会包含一条统计信息（即使被封装）：  
- 运行时间（例如 `runtime 5m12s`）  
- token 使用量（输入/输出/总计）  
- 当配置了模型定价时的预估成本（`models.providers.*.models[].cost`）  
- `sessionKey`、`sessionId` 和对话记录路径（以便主代理可以通过 `sessions_history` 获取历史记录，或直接检查磁盘上的文件）
json5
{
  agents: {
    defaults: {
      subagents: {
        maxConcurrent: 1
      }
    }
  },
  tools: {
    subagents: {
      tools: {
        // deny wins
        deny: ["gateway", "cron"],
        // if allow is set, it becomes allow-only (deny still wins)
        // allow: ["read", "exec", "process"]
      }
    }
  }
}
``````
## 并发

子代理使用专用的进程内队列通道：
- 通道名称：`subagent`
- 并发数：`agents.defaults.subagents.maxConcurrent`（默认值为 `8`）

## 停止

- 在请求者聊天中发送 `/stop` 会中止请求者会话，并停止从该会话启动的所有活动子代理运行。

## 限制

- 子代理的公告是 **尽力而为** 的。如果网关重启，待处理的“公告返回”工作将会丢失。
- 子代理仍然共享相同的网关进程资源；将 `maxConcurrent` 视为一个安全阀。
- `sessions_spawn` 始终是非阻塞的：会立即返回 `{ status: "accepted", runId, childSessionKey }`。
- 子代理上下文仅注入 `AGENTS.md` 和 `TOOLS.md`（不包括 `SOUL.md`、`IDENTITY.md`、`USER.md`、`HEARTBEAT.md` 或 `BOOTSTRAP.md`）。