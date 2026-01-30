# Skills 架构 (Python 版) 开发规范

## 实现目标
构建一个基于文件的动态 Prompt 注入系统，允许 AI 代理通过读取特定的 Markdown 文件来获取专业技能和工具使用指导。

## 1. 核心流程 (Core Pipeline)
1. **Discovery**: 扫描 `PATH_A`, `PATH_B` 寻找 `.md` 文件。
2. **Parsing**: 使用 `python-frontmatter` 分离元数据和正文。
3. **Merging**: 根据技能名称去重，优先级：Workdir > UserConfig > Builtin。
4. **Environment**: 检查元数据中 `envRequired` 字段，确保系统变量就绪。
5. **Compilation**: 将所有技能合并为一段长文本，注入 LLM 的 System Prompt。

## 2. 推荐依赖
- `python-frontmatter`: 用于解析文件。
- `pydantic`: 用于类型校验。
- `pathlib`: 用于跨平台路径处理。

## 3. 代码结构示例 (推荐给 AI)

```python
from pathlib import Path
import frontmatter
from pydantic import BaseModel

class Skill(BaseModel):
    name: str
    description: str
    usage: str
    tools: list[str]

class SkillManager:
    def __init__(self, search_paths: list[Path]):
        self.paths = search_paths
        self.skills: dict[str, Skill] = {}

    def load_all(self):
        # 逻辑：按顺序扫描路径，同名覆盖
        pass

    def get_prompt(self) -> str:
        # 逻辑：格式化所有技能为 Markdown 字符串
        pass
```

## 4. 关键 Prompt 提示词 (对 AI 调教)
在使用另一个 AI 开发时，务必强调：“该系统必须是 **Read-only** 的，其输出应该严格作为 **System Context** 传递给 LLM，且技能中的 `toolHints` 必须与项目中定义的函数名严格对应。”
