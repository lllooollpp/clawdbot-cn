---
summary: "Repository scripts: purpose, scope, and safety notes"
read_when:
  - Running scripts from the repo
  - Adding or changing scripts under ./scripts
---

# 脚本

`scripts/` 目录包含用于本地工作流程和运维任务的辅助脚本。  
当任务明显与脚本相关时使用这些脚本；否则，请优先使用 CLI。

## 约定

- 脚本是**可选的**，除非在文档或发布检查清单中被引用。
- 当存在 CLI 接口时，请优先使用 CLI（例如：认证监控使用 `clawdbot models status --check`）。
- 假设脚本是主机特定的；在新机器上运行之前请先阅读它们。

## Git 钩子

- `scripts/setup-git-hooks.js`: 在 Git 仓库内时，尽力设置 `core.hooksPath`。
- `scripts/format-staged.js`: 在提交前格式化已暂存的 `src/` 和 `test/` 文件。

## 认证监控脚本

认证监控脚本的说明文档请参见：
[/automation/auth-monitoring](/automation/auth-monitoring)

## 添加脚本时

- 保持脚本专注并加以文档说明。
- 在相关文档中添加简短的条目（如果文档缺失，请创建一个）。