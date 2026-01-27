---
summary: "How Clawdbot memory works (workspace files + automatic memory flush)"
read_when:
  - You want the memory file layout and workflow
  - You want to tune the automatic pre-compaction memory flush
---

# 内存

Clawdbot 的内存是 **代理工作区中的普通 Markdown 文件**。文件是事实的来源；模型只会“记住”写入磁盘的内容。

内存搜索工具由活动的内存插件提供（默认：`memory-core`）。通过 `plugins.slots.memory = "none"` 禁用内存插件。

## 内存文件（Markdown）

默认的工作区布局使用了两层内存：

- `memory/YYYY-MM-DD.md`
  - 每日日志（追加式）。
  - 在会话开始时读取今天和昨天的内容。
- `MEMORY.md`（可选）
  - 精选的长期记忆。
  - **仅在主会话、私有会话中加载**（从不在群组上下文中加载）。

这些文件位于工作区中（`agents.defaults.workspace`，默认为 `~/clawd`）。有关完整布局，请参阅 [代理工作区](/concepts/agent-workspace)。

## 何时写入内存

- 决策、偏好和持久性事实应写入 `MEMORY.md`。
- 日常笔记和运行上下文应写入 `memory/YYYY-MM-DD.md`。
- 如果有人说了“记住这个”，请将其写下来（不要保存在 RAM 中）。
- 此领域仍在不断发展。提醒模型存储记忆会有所帮助；它会知道该怎么做。
- 如果你想让某些内容被记住，**请让机器人将其写入内存**。

## 自动内存刷新（预压缩提示）

当会话 **接近自动压缩** 时，Clawdbot 会触发一个 **静默、代理性的操作**，提醒模型在上下文被压缩 **之前** 写入持久性记忆。默认提示中明确说明模型可以回复，但通常正确的响应是 `NO_REPLY`，因此用户永远不会看到这个操作。

这由 `agents.defaults.compaction.memoryFlush` 控制：
json5
{
  agents: {
    defaults: {
      compaction: {
        reserveTokensFloor: 20000,
        memoryFlush: {
          enabled: true,
          softThresholdTokens: 4000,
          systemPrompt: "Session nearing compaction. Store durable memories now.",
          prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store."
        }
      }
    }
  }
}
`````````
详细信息：
- **软阈值**：当会话令牌估计值超过 `contextWindow - reserveTokensFloor - softThresholdTokens` 时触发刷新。
- **默认静默**：提示中包含 `NO_REPLY`，因此不会有任何内容被发送。
- **两个提示**：一个用户提示加上一个系统提示，用于附加提醒。
- **每个压缩周期仅刷新一次**（在 `sessions.json` 中跟踪）。
- **工作区必须可写**：如果会话以 `workspaceAccess: "ro"` 或 `"none"` 的方式沙箱运行，则会跳过刷新。

有关完整的压缩生命周期，请参阅
[会话管理 + 压缩](/reference/session-management-compaction)。

## 向量内存搜索

Clawdbot 可以在 `MEMORY.md` 和 `memory/*.md` 上构建一个小的向量索引，因此即使查询用词不同，也可以找到相关的笔记。

默认设置：
- 默认启用。
- 监控内存文件的变化（有防抖）。
- 默认使用远程嵌入。如果未设置 `memorySearch.provider`，Clawdbot 会自动选择：
  1. 如果配置了 `memorySearch.local.modelPath` 并且该文件存在，则使用 `local`。
  2. 如果可以解析 OpenAI 密钥，则使用 `openai`。
  3. 如果可以解析 Gemini 密钥，则使用 `gemini`。
  4. 否则，内存搜索将保持禁用，直到进行配置。
- 本地模式使用 `node-llama-cpp`，可能需要 `pnpm approve-builds`。
- 当可用时，使用 `sqlite-vec` 来加速 SQLite 内部的向量搜索。

远程嵌入 **需要** 嵌入提供者的 API 密钥。Clawdbot 从认证配置文件、`models.providers.*.apiKey` 或环境变量中解析密钥。Codex OAuth 仅覆盖聊天/补全功能，并 **不** 满足内存搜索的嵌入需求。对于 Gemini，请使用 `GEMINI_API_KEY` 或 `models.providers.google.apiKey`。当使用自定义的 OpenAI 兼容端点时，请设置 `memorySearch.remote.apiKey`（以及可选的 `memorySearch.remote.headers`）。

### Gemini 嵌入（原生）

将提供者设置为 `gemini` 以直接使用 Gemini 嵌入 API：```json5
agents: {
  defaults: {
    memorySearch: {
      provider: "gemini",
      model: "gemini-embedding-001",
      remote: {
        apiKey: "YOUR_GEMINI_API_KEY"
      }
    }
  }
}
```
注意事项：
- `remote.baseUrl` 是可选的（默认值为 Gemini API 的基础 URL）。
- `remote.headers` 允许你在需要时添加额外的请求头。
- 默认模型：`gemini-embedding-001`。

如果你想使用一个 **自定义的 OpenAI 兼容端点**（如 OpenRouter、vLLM 或代理），可以使用 `remote` 配置并指定 OpenAI 提供商：
json5
agents: {
  defaults: {
    memorySearch: {
      provider: "openai",
      model: "text-embedding-3-small",
      remote: {
        baseUrl: "https://api.example.com/v1/",
        apiKey: "YOUR_OPENAI_COMPAT_API_KEY",
        headers: { "X-Custom-Header": "value" }
      }
    }
  }
}``````
如果你不想设置 API 密钥，请使用 `memorySearch.provider = "local"` 或设置 `memorySearch.fallback = "none"`。

回退选项：
- `memorySearch.fallback` 可以是 `openai`、`gemini`、`local` 或 `none`。
- 当主嵌入提供者失败时，才会使用回退提供者。

批量索引（OpenAI + Gemini）：
- 默认情况下，OpenAI 和 Gemini 嵌入功能是启用的。可以通过设置 `agents.defaults.memorySearch.remote.batch.enabled = false` 来禁用。
- 默认行为是等待批量完成；如需调整，请设置 `remote.batch.wait`、`remote.batch.pollIntervalMs` 和 `remote.batch.timeoutMinutes`。
- 设置 `remote.batch.concurrency` 来控制同时提交的批量任务数量（默认值：2）。
- 当 `memorySearch.provider = "openai"` 或 `"gemini"` 时，会启用批量模式，并使用相应的 API 密钥。
- Gemini 的批量任务使用异步嵌入批量端点，并且需要 Gemini 批量 API 的可用性。

为什么 OpenAI 批量处理速度快且便宜：
- 对于大规模数据回填，OpenAI 通常是支持的最快选项，因为我们可以在一个批量任务中提交大量嵌入请求，并让 OpenAI 异步处理。
- OpenAI 为批量 API 的工作负载提供了折扣价格，因此大规模索引任务通常比同步发送相同请求更便宜。
- 详情请参阅 OpenAI 批量 API 文档和价格：
  - https://platform.openai.com/docs/api-reference/batch
  - https://platform.openai.com/pricing

配置示例：```json5
agents: {
  defaults: {
    memorySearch: {
      provider: "openai",
      model: "text-embedding-3-small",
      fallback: "openai",
      remote: {
        batch: { enabled: true, concurrency: 2 }
      },
      sync: { watch: true }
    }
  }
}
```
工具：
- `memory_search` — 从 `MEMORY.md` 和 `memory/**/*.md` 中返回带有文件+行范围的语义搜索片段。
- `memory_get` — 通过路径读取内存文件内容。

本地模式：
- 设置 `agents.defaults.memorySearch.provider = "local"`。
- 提供 `agents.defaults.memorySearch.local.modelPath`（GGUF 或 `hf:` URI）。
- 可选：设置 `agents.defaults.memorySearch.fallback = "none"` 以避免回退到远程。

### memory 工具的工作方式

- `memory_search` 从 `MEMORY.md` 和 `memory/**/*.md` 中语义搜索 Markdown 片段（目标约 400 个 token，80 个 token 重叠）。它返回片段文本（限制约 700 个字符）、文件路径、行范围、评分、提供者/模型，以及是否从本地 → 远程嵌入回退。不会返回完整文件内容。
- `memory_get` 读取特定的内存 Markdown 文件（相对于工作区路径），可选地从起始行开始读取 N 行。路径超出 `MEMORY.md` / `memory/` 的将被拒绝。
- 两个工具只有在代理的 `memorySearch.enabled` 解析为 true 时才会启用。

### 被索引的内容（以及何时）

- 文件类型：仅 Markdown（`MEMORY.md`, `memory/**/*.md`）。
- 索引存储：每个代理的 SQLite 数据库，位于 `~/.clawdbot/memory/<agentId>.sqlite`（可通过 `agents.defaults.memorySearch.store.path` 配置，支持 `{agentId}` 占位符）。
- 新鲜度：对 `MEMORY.md` + `memory/` 的监视器会标记索引为“脏”（去抖 1.5 秒）。同步在会话开始时、搜索时或定时器触发时进行，并异步运行。会话记录使用 delta 阈值来触发后台同步。
- 重新索引触发条件：索引存储了嵌入的 **提供者/模型 + 端点指纹 + 分块参数**。如果其中任何一个发生变化，Clawdbot 会自动重置并重新索引整个存储。

### 混合搜索（BM25 + 向量）

当启用时，Clawdbot 会结合以下两种方式：
- **向量相似性**（语义匹配，措辞可以不同）
- **BM25 关键词相关性**（精确的 token，如 ID、环境变量、代码符号）

如果你的平台不支持全文搜索，Clawdbot 会回退到仅向量搜索。

#### 为什么使用混合搜索？

向量搜索在“意思相同”的情况下表现很好：
- “Mac Studio 网关主机” 与 “运行网关的机器”
- “去抖文件更新” 与 “避免每次写入都进行索引”

但它在精确、高信号的 token 上可能较弱：
- ID（`a828e60`, `b3b9895a…`）
- 代码符号（`memorySearch.query.hybrid`）
- 错误字符串（“sqlite-vec 不可用”）

BM25（全文搜索）则相反：在精确 token 上表现强，但在改写或同义表达上较弱。

混合搜索是务实的折中方案：**同时使用两种检索信号**，以便在“自然语言”查询和“大海捞针”式查询中都能获得良好的结果。

#### 我们如何合并结果（当前设计）

实现概要：

1) 从两方面检索候选池：
- **向量**：根据余弦相似度获取前 `maxResults * candidateMultiplier` 个结果。
- **BM25**：根据 FTS5 BM25 排名获取前 `maxResults * candidateMultiplier` 个结果（排名越低越好）。

2) 将 BM25 排名转换为 0..1 左右的评分：
- `textScore = 1 / (1 + max(0, bm25Rank))`

3) 按 chunk id 聚合候选结果并计算加权分数：
- `finalScore = vectorWeight * vectorScore + textWeight * textScore`

说明：
- `vectorWeight` 和 `textWeight` 在配置解析时会被归一化为 1.0，因此权重表现为百分比形式。
- 如果无法获取嵌入（或提供者返回零向量），我们仍然会运行 BM25 并返回关键词匹配结果。
- 如果无法创建 FTS5，我们仍将使用向量搜索（不会导致硬性失败）。

这并不是“信息检索理论上的完美方案”，但它简单、快速，并且在实际笔记中往往能提升召回率和准确率。
如果以后想要更复杂一些，常见的下一步是使用倒数排名融合（RRF）或在混合前进行分数归一化（最小最大归一化或 Z 分数归一化）。
json5
agents: {
  defaults: {
    memorySearch: {
      query: {
        hybrid: {
          enabled: true,
          vectorWeight: 0.7,
          textWeight: 0.3,
          candidateMultiplier: 4
        }
      }
    }
  }
}
`````````
### 嵌入缓存

Clawdbot 可以在 SQLite 中缓存 **块嵌入**，因此重新索引和频繁更新（尤其是会话记录）不会对未更改的文本进行重新嵌入。```json5
agents: {
  defaults: {
    memorySearch: {
      cache: {
        enabled: true,
        maxEntries: 50000
      }
    }
  }
}
```
### 会话记忆搜索（实验性）

你可以选择性地对 **会话记录** 进行索引，并通过 `memory_search` 进行展示。
此功能由一个实验性标志控制。
json5
agents: {
  defaults: {
    memorySearch: {
      experimental: { sessionMemory: true },
      sources: ["memory", "sessions"]
    }
  }
}```注意事项：
- 会话索引是**可选的**（默认关闭）。
- 会话更新会被去抖动处理，并且**异步索引**，一旦超过delta阈值（尽力而为）。
- `memory_search` 从不会阻塞索引；在后台同步完成前，结果可能略有过时。
- 结果仍然只包含片段；`memory_get` 仍然仅限于内存文件。
- 会话索引是按代理隔离的（仅索引该代理的会话日志）。
- 会话日志存储在磁盘上（`~/.clawdbot/agents/<agentId>/sessions/*.jsonl`）。任何有文件系统访问权限的进程或用户都可以读取它们，因此请将磁盘访问视为信任边界。如需更严格的隔离，请在单独的OS用户或主机下运行代理。
json5
agents: {
  defaults: {
    memorySearch: {
      sync: {
        sessions: {
          deltaBytes: 100000,   // ~100 KB
          deltaMessages: 50     // JSONL 行数
        }
      }
    }
}
``````
### SQLite 向量加速（sqlite-vec）

当 sqlite-vec 扩展可用时，Clawdbot 会将向量嵌入存储在 SQLite 虚拟表（`vec0`）中，并在数据库中执行向量距离查询。这样可以在不将所有嵌入向量加载到 JavaScript 中的情况下保持搜索速度。

配置（可选）：
json5
agents: {
  defaults: {
    memorySearch: {
      store: {
        vector: {
          enabled: true,
          extensionPath: "/path/to/sqlite-vec"
        }
      }
    }
  }
}
``````
注意事项：
- `enabled` 默认为 true；当禁用时，搜索会回退到基于存储嵌入的进程内余弦相似度。
- 如果 sqlite-vec 扩展缺失或加载失败，Clawdbot 会记录错误并继续使用 JS 回退（不使用向量表）。
- `extensionPath` 会覆盖内置的 sqlite-vec 路径（对于自定义构建或非标准安装路径很有用）。

### 本地嵌入模型自动下载

- 默认本地嵌入模型：`hf:ggml-org/embeddinggemma-300M-GGUF/embeddinggemma-300M-Q8_0.gguf`（约 0.6 GB）。
- 当 `memorySearch.provider = "local"` 时，`node-llama-cpp` 会解析 `modelPath`；如果 GGUF 文件缺失，它会**自动下载**到缓存（或设置的 `local.modelCacheDir` 目录），然后加载它。重试时会继续下载。
- 本地构建要求：运行 `pnpm approve-builds`，选择 `node-llama-cpp`，然后运行 `pnpm rebuild node-llama-cpp`。
- 回退机制：如果本地设置失败，并且 `memorySearch.fallback = "openai"`，系统会自动切换到远程嵌入（默认使用 `openai/text-embedding-3-small`，除非被覆盖），并记录原因。

### 自定义 OpenAI 兼容端点示例
json5
agents: {
  defaults: {
    memorySearch: {
      provider: "openai",
      model: "text-embedding-3-small",
      remote: {
        baseUrl: "https://api.example.com/v1/",
        apiKey: "YOUR_REMOTE_API_KEY",
        headers: {
          "X-Organization": "org-id",
          "X-Project": "project-id"
        }
      }
    }
  }
}
``````
注意事项：
- `remote.*` 的优先级高于 `models.providers.openai.*`。
- `remote.headers` 会与 OpenAI 的 headers 合并；在键冲突时，remote 会覆盖 OpenAI 的设置。若省略 `remote.headers`，则使用 OpenAI 的默认值。