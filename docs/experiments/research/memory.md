---
summary: "Research notes: offline memory system for Clawd workspaces (Markdown source-of-truth + derived index)"
read_when:
  - Designing workspace memory (~/clawd) beyond daily Markdown logs
  - Deciding: standalone CLI vs deep Clawdbot integration
  - Adding offline recall + reflection (retain/recall/reflect)
---

# 工作区记忆 v2（离线版）：研究笔记

目标：Clawd 风格的工作区（`agents.defaults.workspace`，默认为 `~/clawd`），其中“记忆”以每天一个 Markdown 文件的形式存储（`memory/YYYY-MM-DD.md`），再加上一组少量的稳定文件（例如 `memory.md`、`SOUL.md`）。

本文档提出了一种**以离线优先**为设计理念的记忆架构，它将 Markdown 作为**权威、可审查的真相来源**，但通过一个**派生索引**添加了**结构化回忆**（搜索、实体摘要、置信度更新）功能。

## 为什么需要改变？

当前的设置（每天一个文件）在以下方面表现出色：
- “追加-only” 日记记录
- 人工编辑
- 基于 git 的持久性 + 可审计性
- 低门槛记录（“只需写下它”）

但它在以下方面较弱：
- 高召回检索（“我们关于 X 做出了什么决定？”、“上次我们尝试 Y 是什么时候？”）
- 以实体为中心的回答（“告诉我关于 Alice / The Castle / warelay 的事”）而无需重新阅读多个文件
- 意见/偏好的稳定性（以及当它们变化时的证据）
- 时间约束（“2025 年 11 月时什么是对的？”）和冲突解决

## 设计目标

- **离线**：无需网络即可工作；可以在笔记本电脑/Castle 上运行；不依赖云服务。
- **可解释性**：检索到的内容应能追溯来源（文件 + 位置），并与推理过程分离。
- **低仪式感**：日常记录保持为 Markdown 格式，无需复杂的模式设计。
- **增量式**：v1 只需要全文搜索（FTS）即可使用；语义/向量和图结构是可选的升级。
- **适用于代理**：使“在令牌预算内回忆”变得容易（返回一小部分事实）。

## 北极星模型（Hindsight × Letta）

需要融合的两个部分：

1) **Letta/MemGPT 风格的控制循环**
- 保持一个小的“核心”始终在上下文中（角色 + 关键用户事实）
- 其他所有内容都是上下文外的，通过工具进行检索
- 记忆写入是显式的工具调用（追加/替换/插入），被持久化后，在下一轮重新注入

2) **Hindsight 风格的记忆底层**
- 区分观察到的内容、相信的内容和总结的内容
- 支持保留/回忆/反思
- 带有置信度的见解，可以根据证据演变
- 实体感知的检索 + 时间查询（即使没有完整的知识图谱）

~/clawd/
  memory.md                    # small: durable facts + preferences (core-ish)
  memory/
    YYYY-MM-DD.md              # daily log (append; narrative)
  bank/                        # “typed” memory pages (stable, reviewable)
    world.md                   # objective facts about the world
    experience.md              # what the agent did (first-person)
    opinions.md                # subjective prefs/judgments + confidence + evidence pointers
    entities/
      Peter.md
      The-Castle.md
      warelay.md
      ...``````
备注：
- **每日日志保持每日日志**。不需要将其转换为 JSON。
- `bank/` 文件是 **经过整理的**，由反射任务生成，仍然可以手动编辑。
- `memory.md` 保持为“简洁 + 核心内容”：你希望 Clawd 每次会话都能看到的内容。

### 派生存储（机器回忆）

在工作区下添加一个派生索引（不一定需要 Git 跟踪）：```
~/clawd/.memory/index.sqlite
```
以以下内容为支撑：
- SQLite 的事实模式 + 实体链接 + 意见元数据
- SQLite **FTS5** 用于词汇回忆（快速、轻量、离线）
- 可选的嵌入表用于语义回忆（仍保持离线）

索引始终可以从 Markdown 文件**重新构建**。

## 保留 / 回忆 / 反思（操作循环）

### 保留：将日常记录标准化为“事实”

Hindsight 的关键洞察在于：存储**叙述性的、自包含的事实**，而不是零散的片段。

对于 `memory/YYYY-MM-DD.md` 的实用规则：
- 在每天结束时（或期间），添加一个 `## 保留` 部分，包含 2–5 个要点，这些要点应满足：
  - 叙述性（保留跨轮次的上下文）
  - 自包含（在之后也能独立理解）
  - 标注类型 + 实体提及

最小解析：
- 类型前缀：`W`（世界），`B`（经验/传记），`O`（观点），`S`（观察/总结；通常由系统生成）
- 实体：`@Peter`，`@warelay` 等（别名映射到 `bank/entities/*.md`）
- 观点置信度：`O(c=0.0..1.0)`（可选）

如果你不想让作者去思考这些内容：`reflect` 任务可以从日志的其余部分推断出这些要点，但显式地包含 `## Retain` 部分是最容易的“质量杠杆”。

### 回忆：在派生索引上进行查询

回忆应该支持：
- **词汇检索**：查找精确的术语/名称/命令（FTS5）
- **实体检索**：告诉我关于 X 的事情（实体页面 + 实体关联的事实）
- **时间检索**：在 11 月 27 日左右发生了什么？/ “自从上周以来”
- **观点检索**：Peter 更喜欢什么？（带有置信度 + 证据）

返回格式应为代理友好的形式，并引用来源：
- `kind`（`world|experience|opinion|observation`）
- `timestamp`（来源日期，或提取的时间范围）
- `entities`（`["Peter","warelay"]`）
- `content`（叙述性事实）
- `source`（`memory/2025-11-27.md#L12` 等）

### 反思：生成稳定页面 + 更新信念

`Reflect` 是一个定时任务（每日或心跳 `ultrathink`），它：
- 从最近的事实更新 `bank/entities/*.md`（实体摘要）
- 根据强化/矛盾更新 `bank/opinions.md` 中的观点置信度
- 可选地建议对 `memory.md` 的修改（“核心”类的持久化事实）

观点演化（简单、可解释）：
- 每个观点包括：
  - 陈述
  - 置信度 `c ∈ [0,1]`
  - 最后更新时间
  - 证据链接（支持性 + 矛盾性事实 ID）
- 当新事实到达时：
  - 通过实体重叠 + 相似性查找候选观点（先使用 FTS，后使用嵌入）
  - 通过小幅度调整置信度；大的变化需要强矛盾 + 重复证据

## CLI 集成：独立模式 vs 深度集成

建议：**在 Clawdbot 中进行深度集成**，但保持一个可分离的核心库。

### 为什么集成到 Clawdbot？
- Clawdbot 已经知道：
  - 工作空间路径（`agents.defaults.workspace`）
  - 会话模型 + 心跳
  - 日志记录 + 排查模式
- 你希望代理本身调用这些工具：
  - `clawdbot memory recall "…" --k 25 --since 30d`
  - `clawdbot memory reflect --since 7d`

### 为什么还要拆分出一个库？
- 保持内存逻辑在没有网关/运行时的情况下可测试
- 可以在其他上下文中复用（本地脚本、未来的桌面应用等）

结构：
内存工具旨在作为一个小型 CLI + 库层，但这仅是初步探索。

对于 `~/clawd` 的务实方案：
- **不要**从 SuCo 开始。
- 从 SQLite FTS +（可选）简单嵌入（embeddings）开始；你会立即获得大部分用户体验上的提升。
- 仅在以下情况考虑 SuCo/HNSW/ScaNN 类解决方案：
  - 语料库很大（数万/数以万计的 chunks）
  - 暴力搜索嵌入变得太慢
  - 召回质量明显受限于词法搜索

离线友好型替代方案（按复杂度递增）：
- SQLite FTS5 + 元数据过滤器（无需机器学习）
- 嵌入 + 暴力搜索（如果 chunk 数量较少，效果出乎意料地好）
- HNSW 索引（常见且稳健；需要库绑定）
- SuCo（研究级；如果你能嵌入一个可靠的实现，会很有吸引力）

开放性问题：
- 在你的机器上（笔记本电脑 + 台式机），对于“个人助手记忆”来说，**最好的**离线嵌入模型是什么？
  - 如果你已经有 Ollama：使用本地模型进行嵌入；否则在工具链中附带一个小型嵌入模型。