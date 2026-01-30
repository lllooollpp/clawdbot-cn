# Agent Skill Hub v2.1 深度设计文档

## 1. 核心理念：解耦、自治与动态增强
将 Agent 的能力（Skills）从主程序逻辑中彻底解耦。通过**声明式定义 (Markdown)** 与 **指令式逻辑 (Python)** 的结合，使 Agent 具备动态扩展、环境隔离和即插即用的能力。

## 2. 架构模式：双层发现机制

- **物理层 (Source of Truth)**: 位于 `storage/skills/` 的目录结构。它是开发者编写和更新技能的地方。
- **逻辑层 (Runtime Registry)**: 数据库与内存映射。管理技能的启用状态 (`is_active`)、权限策略及权限标签订阅。

## 3. 技能包标准结构 (`storage/skills/{id}/`)

每个技能是一个自包含的自治单元：

```text
storage/skills/{id}/
├── SKILL.md          # [核心] 元数据 (YAML) + 正文提示词 (Markdown)
├── logic.py          # [可选] 实现 SkillLogic 类，提供复杂运算、API 调用
├── requirements.txt  # [可选] 该技能特有的 pip 依赖
└── assets/           # [可选] 该技能引用到的图片、配置文件等
```

### 3.1 SKILL.md 规范
```markdown
---
id: "file-analyser"
name: "深度文件分析专家"
tags: ["worker", "file-op", "expert"]
order: 10
env_required: ["OPENAI_API_KEY"]
# 新增: 声明调用的工具名，用于 Schema 注入
tool_definitions: true  
---

## Usage Instructions
当用户要求分析复杂文件时，请优先使用本技能。
请调用配套的 `logic.py` 中的函数进行分块读取。
```

## 4. 核心功能：模型调用 Skill 的三种路径

为了达到最佳效果，系统根据技能类型自动切换调用策略：

### A. 提示词注入 (Directive Path)
- **触发**: 标签订阅 (Labels) 匹配。
- **逻辑**: 选择 Top-K 个相关技能的正文，动态合成入 `System Prompt`。
- **优化**: 语义检索 (Embedding) 机制，仅注入与当前问题相关的技能块。

### B. 自动工具映射 (Logic Path / Auto-Schema)
- **触发**: `SKILL.md` 中 `tool_definitions: true` 且存在 `logic.py`。
- **逻辑**: 系统启动时利用 `inspect` 库扫描 `LogicSkill.execute` 的签名。
- **对模型表现**: 将 `logic.py` 转化为标准的 **JSON Schema 工具集**。模型直接通过 `tool_call` 触发。

### C. 资源隔离环境 (Sandbox)
- **准备阶段**: 为每个技能创建独立的 `venv` 虚拟环境。
- **执行阶段**: 使用子进程执行 `logic.py`，并注入 `AgentContext` 对象（含历史记录、只读配置、文件句柄）。

## 5. 执行生命周期 (Execution Pipeline)

1.  **Sync**: 监控文件变动，自动更新数据库字段。
2.  **Discovery**: 根据 Agent 身份标签检索符合条件的技能。
3.  **Preprocessing**: AI 预检。计算当前会话与技能集的语义相关度，生成候选集。
4.  **Inference**:
    - 将 `DirectiveSkill` 拼入 Prompt。
    - 将 `LogicSkill` 转化为 `Function Definitions` 传给 API。
5.  **Feedback Loop**: 如果 `logic.py` 执行失败，将回溯栈信息发还给模型进行自我修复。

## 6. 开发者协议 (Code Contract)

为了让编程模型（AI）能帮你正确实现 Logic 部分，请遵循此基类定义：

```python
from abc import ABC, abstractmethod
from pydantic import BaseModel

class AgentContext(BaseModel):
    history: list        # 对话历史
    workspace_root: str  # 当前项目根目录
    session_id: str      # 会话 ID

class SkillLogic(ABC):
    @abstractmethod
    async def execute(self, params: dict, context: AgentContext) -> str:
        """
        :param params: 模型根据工具定义传递的动态参数
        :param context: 运行时上下文
        :return: 处理后的结果（字符串或结构化数据）
        """
        pass
```

## 7. 关键优势

- **Token 效率**: 动态检索机制避免了上百个技能全量加载导致的性能下降。
- **逻辑与定义合一**: 开发者只需在一个文件夹里工作，无需接触框架核心代码。
- **平台化能力**: 通过数据库持久化状态，结合 UI 轻松实现“一键开关技能”。

---
*版本：v2.1 | 更新日期：2026-01-30*
*设计目标：让 Agent 的能力像容器一样隔离，像函数一样调用。*
