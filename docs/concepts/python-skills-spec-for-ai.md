# 技术对接文档：Python 版 Skills 系统的核心逻辑实现

这份文档旨在指导编程模型（AI）基于 Clawdbot 的架构，在 Python 项目中复现 **Skills (技能) 系统**。

## 1. 核心概念
Skills 系统是一个**声明式提示词扩展系统**。它通过读取特定的 Markdown 文件，将预定义的“专业领域指令（Prompt）”和“工具提示（Tool Hints）”动态注入到 LLM 的 System Prompt 中。

## 2. 数据模型 (Data Objects)
在 Python 中，建议使用 `pydantic` 定义如下模型：

- **Skill**:
    - `name` (str): 唯一标识。
    - `description` (str): 技能简述。
    - `tool_hints` (List[str]): 技能关联的工具/函数名列表。
    - `env_required` (List[str]): 运行该技能必需的环境变量。
    - `usage` (str): 核心使用指令（Markdown 正文）。
    - `source_path` (str): 物理文件路径。

- **SkillsSnapshot**:
    - 所有已加载 Skill 的集合，以及一个基于内容的哈希值（用于判断快照是否过时）。

## 3. 逻辑流程 (Development Workflow)

### 第一步：发现与解析 (Discovery & Parsing)
- **扫描**: 递归扫描指定目录下的所有 `.md` 文件。
- **解析**: 使用 `python-frontmatter` 解析文件。
    - 文件顶部 YAML (Frontmatter) 映射到元数据。
    - 文件正文 (Content) 映射到 `usage`。

### 第二步：多级合并策略 (Hierarchical Merging)
加载路径应具有优先级，同名技能（name）高优先级覆盖低优先级：
1. **工作区目录** (最高优先级): `./skills/`
2. **用户配置目录**: `~/.config/myapp/skills/`
3. **内置目录** (最低优先级): `app/assets/skills/`

### 第三步：环境变量管理 (Environment Prep)
在 Agent 运行前，遍历 `env_required`。如果当前环境变量中缺失，应发出警告或从项目配置文件中尝试加载。

### 第四步：Prompt 合成 (Prompt Rendering)
将所有技能编译成一段纯文本，插入到 System Prompt 的特定位置。
**推荐模板：**
```markdown
# 辅助能力 (Skills)
当你识别到以下场景时，请参考对应的用法：

## 技能: {name}
描述: {description}
用法: {usage}
关联工具: {tool_hints}
---
```

## 4. 给编程模型的调教指令 (Prompt to Model)
将以下指令发送给 AI：
> "请根据上述架构，编写一个 Python 模块。
> 1. 实现一个 `SkillLoader` 类负责多目录扫描和优先级合并。
> 2. 使用 `python-frontmatter` 解析 Markdown。
> 3. 结果必须输出一个聚合后的 `System Prompt` 字符串。
> 4. 确保代码是异步（async）友好的，且错误处理健壮。"

## 5. 项目参考文件
如果需要查阅原始实现逻辑（TypeScript），参考以下文件：
- `src/agents/skills/workspace.ts` (扫描逻辑)
- `src/agents/skills/types.ts` (模型定义)
- `src/agents/pi-embedded-runner/run/attempt.ts` (注入逻辑)
