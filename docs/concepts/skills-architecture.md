# Clawdbot Skills 系统架构文档

## 1. 系统概览
Skills 是 Clawdbot 的轻量级插件系统，旨在通过 **Prompt 注入**、**元数据定义**和**工具关联**来扩展模型的能力。与传统的硬编码工具不同，Skill 通常以 Markdown 文件的形式存在，包含 Frontmatter 声明和自然语言描述。

## 2. 核心组件与模型

### 2.1 Skill 定义 (`src/agents/skills/types.ts`)
每个 Skill 由以下部分组成：
- **Metadata (Frontmatter)**: 包含技能的唯一标识、描述、依赖工具（toolHints）、环境变量需求等。
- **Content (Usage)**: 自然语言编写的指令，告诉 LLM 什么时候以及如何使用该技能。
- **Environment Overrides**: 为特定技能运行所需的配置。

### 2.2 数据模型
- `SkillEntry`: 内存中的技能对象，包含路径、元数据和经过处理的内容。
- `SkillSnapshot`: 整个工作区的技能快照，包含所有已加载技能的哈希和内容，用于会话持久化。

---

## 3. 技能生命周期流程

1.  **扫描目录**: 按照优先级合并内置、工作区、用户管理和插件目录。
2.  **文件解析**: 提取 Markdown 顶部的 YAML Frontmatter。
3.  **构建 SkillEntry**: 将物理文件映射为内存中的技能实体。
4.  **生成 SkillSnapshot**: 对所有有效技能进行快照，生成哈希版本。
5.  **Prompt 转化**: 将技能描述和用法转化为 System Prompt。
6.  **注入 LLM 会话**: 在 Agent 运行时，将格式化后的技能 Prompt 合并进全局 System Prompt。
7.  **模型引导**: 模型根据 Prompt 中的指令，决定何时调用对应的 `toolHints`。

---

## 4. 详细流程解析

### 4.1 导入与解析 (Import & Parse)
系统在启动 `agent` 命令或 `gateway` 运行时，会调用 `loadWorkspaceSkillEntries`。
- **多级扫描优先级**:
  1. `bundled`: 内置技能。
  2. `managed`: 用户通过 CLI 管理的技能 (`~/.clawdbot/skills`)。
  3. `workspace`: 当前项目目录下的 `.clawdbot/skills`。
  4. `plugins`: 扩展插件中附带的技能。

### 4.2 编译与快照 (Snapshotting)
为了提高性能并保证会话一致性：
- **哈希校验**: `buildWorkspaceSkillSnapshot` 会计算技能库的全局哈希。
- **持久化**: 如果快照发生变化，会更新会话中的快照信息，确保模型看到的是最新的技能定义。

### 4.3 执行流驱动 (Execution Runtime)
在 `src/agents/pi-embedded-runner/run/attempt.ts` 中完成最终注入：
1. **环境准备**: `applySkillEnvOverridesFromSnapshot` 将 Skill 定义中需要的环境变量注入到当前进程。
2. **Prompt 组装**: `resolveSkillsPromptForRun` 将技能格式化为规范的 Markdown 块注入上下文。
3. **系统提示词合成**: 所有的 Skills 会被拼接进 `buildEmbeddedSystemPrompt` 返回的高级 System Prompt 中。

---

## 5. 目录组织结构

| 路径类型 | 物理路径示例 | 作用 |
| :--- | :--- | :--- |
| **内置 (Bundled)** | `src/agents/skills/bundled/` | 系统的核心基础能力 |
| **工作区 (Workspace)** | `./.clawdbot/skills/*.md` | 针对特定代码仓库定制的自动化任务 |
| **管理 (Managed)** | `~/.clawdbot/skills/` | 用户跨项目通用的个人技能库 |
| **扩展 (Extensions)** | `extensions/me-plugin/skills/` | 第三方插件集成的特定领域能力 |

---

## 6. 开发示例

只需创建一个简单的 Markdown 文件即可扩展机器人能力：

```markdown
---
name: code_reviewer
description: 自动检查代码风格和安全漏洞
toolHints: ["read_file", "list_dir"]
---

## Usage
当用户要求你 Review 代码时，你应该：
1. 使用 `list_dir` 查看项目结构。
2. 使用 `read_file` 读取核心逻辑。
3. 按照 OWASP 标准给出改进意见。
```

---
*文档更新于：2026年1月29日*
