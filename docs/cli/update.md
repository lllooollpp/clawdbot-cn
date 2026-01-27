---
summary: "CLI reference for `clawdbot update` (safe-ish source update + gateway auto-restart)"
read_when:
  - You want to update a source checkout safely
  - You need to understand `--update` shorthand behavior
---

# `clawdbot update`

安全地更新 Clawdbot 并在稳定版/测试版/开发版渠道之间切换。

如果你通过 **npm/pnpm**（全局安装，没有 git 元数据）进行安装，更新将通过 [更新](/install/updating) 中描述的包管理器流程进行。
bash
clawdbot update
clawdbot update status
clawdbot update wizard
clawdbot update --channel beta
clawdbot update --channel dev
clawdbot update --tag beta
clawdbot update --no-restart
clawdbot update --json
clawdbot --update``````
## 选项

- `--no-restart`: 在成功更新后跳过重启网关服务。
- `--channel <stable|beta|dev>`: 设置更新通道（git + npm；会保存在配置中）。
- `--tag <dist-tag|version>`: 仅在此次更新中覆盖 npm 的 dist-tag 或版本号。
- `--json`: 输出可被机器读取的 `UpdateRunResult` JSON 格式结果。
- `--timeout <秒数>`: 每个步骤的超时时间（默认为 1200 秒）。

注意：降级需要确认，因为旧版本可能会破坏配置。```bash
clawdbot update status
clawdbot update status --json
clawdbot update status --timeout 10
```
选项：
- `--json`：输出可被机器读取的状态 JSON。
- `--timeout <秒数>`：检查的超时时间（默认为 3 秒）。

## `update wizard`

交互式流程，用于选择更新通道，并确认更新后是否重启网关（默认是重启）。如果你选择了 `dev` 但未进行 git 检出，它会提示你创建一个。

## 它的作用

当你显式切换通道（`--channel ...`）时，Clawdbot 也会同步安装方式：

- `dev` → 确保有一个 git 检出（默认路径是 `~/clawdbot`，可通过 `CLAWDBOT_GIT_DIR` 覆盖），然后更新并从该检出安装全局 CLI。
- `stable`/`beta` → 通过匹配的 dist-tag 从 npm 安装。

## Git 检出流程

通道：

- `stable`：检出最新的非 beta 标签，然后进行构建和修复。
- `beta`：检出最新的 `-beta` 标签，然后进行构建和修复。
- `dev`：检出 `main` 分支，然后获取更新并变基。

高级流程：

1. 需要一个干净的工作树（没有未提交的更改）。
2. 切换到所选通道（标签或分支）。
3. 获取上游更新（仅限 dev）。
4. 仅限 dev：在临时工作树中进行预检 lint + TypeScript 构建；如果最新提交失败，会回退到最近的 10 个提交以寻找最新的干净构建。
5. 变基到所选提交（仅限 dev）。
6. 安装依赖（优先使用 pnpm，若不可用则使用 npm）。
7. 构建 + 构建控制界面。
8. 最后运行 `clawdbot doctor` 作为“安全更新”检查。
9. 将插件同步到当前通道（dev 使用内置插件；stable/beta 使用 npm）并更新通过 npm 安装的插件。

## `--update` 简写

`clawdbot --update` 会被重写为 `clawdbot update`（对 shell 和启动脚本很有用）。

## 参考

- `clawdbot doctor`（在 git 检出时会提示先运行更新）
- [开发通道](/install/development-channels)
- [更新](/install/updating)
- [CLI 参考](/cli)