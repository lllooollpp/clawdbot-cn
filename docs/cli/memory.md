---
summary: "CLI reference for `clawdbot memory` (status/index/search)"
read_when:
  - You want to index or search semantic memory
  - You’re debugging memory availability or indexing
---

# `clawdbot memory`

管理语义记忆索引和搜索。
由活动记忆插件提供（默认：`memory-core`；设置 `plugins.slots.memory = "none"` 以禁用）。

相关：
- 记忆概念：[Memory](/concepts/memory)
 - 插件：[Plugins](/plugins)

## 示例
bash
clawdbot memory status
clawdbot memory status --deep
clawdbot memory status --deep --index
clawdbot memory status --deep --index --verbose
clawdbot memory index
clawdbot memory index --verbose
clawdbot memory search "release checklist"
clawdbot memory status --agent main
clawdbot memory index --agent main --verbose``````
## 选项

通用选项：

- `--agent <id>`：限定到单个代理（默认：所有配置的代理）。
- `--verbose`：在探测和索引过程中输出详细日志。

备注：
- `memory status --deep` 会探测向量和嵌入的可用性。
- `memory status --deep --index` 如果存储状态不一致（dirty），则会执行重新索引。
- `memory index --verbose` 会打印每个阶段的详细信息（提供者、模型、来源、批次活动）。