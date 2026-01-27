---
summary: "Stable, beta, and dev channels: semantics, switching, and tagging"
read_when:
  - You want to switch between stable/beta/dev
  - You are tagging or publishing prereleases
---

# 开发渠道

最后更新时间：2026-01-21

Clawdbot 提供三个更新渠道：

- **稳定版**：npm 的 dist-tag `latest`。
- **测试版**：npm 的 dist-tag `beta`（正在测试的构建版本）。
- **开发版**：指向 `main` 分支的最新提交（git）。npm dist-tag：`dev`（发布时使用）。

我们先将构建版本发布到 **beta** 渠道，对其进行测试，然后将经过验证的构建版本提升到 `latest` **而不更改版本号** —— dist-tags 是 npm 安装的唯一可信来源。

## 切换渠道

Git 检出：
bash
clawdbot update --channel stable
clawdbot update --channel beta
clawdbot update --channel dev
``````
- `stable`/`beta` 查看最新的匹配标签（通常是同一个标签）。
- `dev` 切换到 `main` 并基于上游进行变基（rebase）。```bash
clawdbot update --channel stable
clawdbot update --channel beta
clawdbot update --channel dev
```
这会通过对应的 npm dist-tag (`latest`、`beta`、`dev`) 进行更新。

当你使用 `--channel` **显式**切换频道时，Clawdbot 也会同步安装方式：

- `dev` 会确保进行 git 检出（默认路径为 `~/clawdbot`，可通过 `CLAWDBOT_GIT_DIR` 覆盖），
  然后更新检出内容，并从该检出中安装全局 CLI。
- `stable`/`beta` 则通过 npm 安装并使用对应的 dist-tag。

提示：如果你想同时使用稳定版和开发版，可以保留两个克隆仓库，并将网关指向稳定版的那个。

## 插件与频道

当你使用 `clawdbot update` 切换频道时，Clawdbot 也会同步插件源：

- `dev` 会优先使用 git 检出中的内置插件。
- `stable` 和 `beta` 会恢复通过 npm 安装的插件包。

## 标签最佳实践

- 为希望 git 检出所指向的发布版本打标签（如 `vYYYY.M.D` 或 `vYYYY.M.D-<patch>`）。
- 保持标签不可变：永远不要移动或重复使用一个标签。
- npm dist-tags 是 npm 安装的权威来源：
  - `latest` → 稳定版
  - `beta` → 测试版
  - `dev` → 主快照（可选）

## macOS 应用程序可用性

Beta 和 dev 版本可能**不包含** macOS 应用程序的发布版本。这是正常的：

- 仍然可以发布 git 标签和 npm dist-tag。
- 在发布说明或变更日志中明确指出“此 beta 版本不包含 macOS 构建”。