---
summary: "ClawdHub guide: public skills registry + CLI workflows"
read_when:
  - Introducing ClawdHub to new users
  - Installing, searching, or publishing skills
  - Explaining ClawdHub CLI flags and sync behavior
---

# ClawdHub

ClawdHub 是 **Clawdbot 的公共技能注册表**。这是一项免费服务：所有技能都是公开的、开源的，并对所有人可见，以便共享和重用。一个技能只是一个带有 `SKILL.md` 文件（以及支持的文本文件）的文件夹。你可以通过网页应用浏览技能，也可以使用 CLI 来搜索、安装、更新和发布技能。

网站：[clawdhub.com](https://clawdhub.com)

## 适用对象（适合初学者）

如果你想为你的 Clawdbot 代理添加新功能，ClawdHub 是最简单的方式来查找和安装技能。你不需要了解后端工作原理。你可以：

- 通过自然语言搜索技能。
- 将技能安装到你的工作空间中。
- 通过一条命令 later 更新技能。
- 通过发布自己的技能来备份。

## 快速入门（非技术性）

1) 安装 CLI（请参见下一节）。
2) 搜索你需要的技能：
   - `clawdhub search "日历"`
3) 安装一个技能：
   - `clawdhub install <技能标识符>`
4) 启动一个新的 Clawdbot 会话，以便它能够识别新安装的技能。
bash
npm i -g clawdhub
``````
```md
pnpm add -g clawdhub```
## 它如何融入 Clawdbot

默认情况下，CLI 会将技能安装到当前工作目录下的 `./skills` 文件夹中。如果配置了 Clawdbot 工作区，`clawdhub` 会回退到该工作区，除非你通过 `--workdir`（或 `CLAWDHUB_WORKDIR`）覆盖设置。Clawdbot 会从 `<workspace>/skills` 加载工作区中的技能，并会在 **下一次** 会话中使用它们。如果你已经使用 `~/.clawdbot/skills` 或打包的技能，工作区中的技能将具有优先级。

有关技能如何加载、共享和受控的更多细节，请参见
[Skills](/tools/skills)。

## 该服务提供的功能（特性）

- **公开浏览** 技能及其 `SKILL.md` 内容。
- **搜索** 功能由嵌入（向量搜索）驱动，而不仅仅是关键字。
- **版本控制** 支持语义化版本（semver）、变更日志和标签（包括 `latest`）。
- **下载** 每个版本作为一个 zip 文件。
- **点赞和评论** 用于社区反馈。
- **审核钩子** 用于审批和审计。
- **CLI 友好的 API** 用于自动化和脚本。

## CLI 命令和参数

全局选项（适用于所有命令）：

- `--workdir <dir>`：工作目录（默认：当前目录；回退到 Clawdbot 工作区）。
- `--dir <dir>`：技能目录，相对于工作目录（默认：`skills`）。
- `--site <url>`：网站基础 URL（用于浏览器登录）。
- `--registry <url>`：注册表 API 基础 URL。
- `--no-input`：禁用提示（非交互模式）。
- `-V, --cli-version`：打印 CLI 版本。

认证：

- `clawdhub login`（浏览器流程）或 `clawdhub login --token <token>`
- `clawdhub logout`
- `clawdhub whoami`

选项：

- `--token <token>`：粘贴一个 API 令牌。
- `--label <label>`：为浏览器登录令牌存储的标签（默认：`CLI token`）。
- `--no-browser`：不打开浏览器（需要配合 `--token` 使用）。

搜索：

- `clawdhub search "query"`
- `--limit <n>`：最大结果数。

安装：

- `clawdhub install <slug>`
- `--version <version>`：安装特定版本。
- `--force`：如果文件夹已存在则覆盖。

更新：

- `clawdhub update <slug>`
- `clawdhub update --all`
- `--version <version>`：更新到特定版本（仅适用于单个 slug）。
- `--force`：当本地文件与任何已发布版本不匹配时覆盖。

列表：

- `clawdhub list`（读取 `.clawdhub/lock.json`）

发布：

- `clawdhub publish <path>`
- `--slug <slug>`：技能的 slug。
- `--name <name>`：显示名称。
- `--version <version>`：语义化版本。
- `--changelog <text>`：变更日志文本（可以为空）。
- `--tags <tags>`：逗号分隔的标签（默认：`latest`）。

删除/恢复（仅限所有者/管理员）：

- `clawdhub delete <slug> --yes`
- `clawdhub undelete <slug> --yes`

同步（扫描本地技能并发布新/更新的技能）：

- `clawdhub sync`
- `--root <dir...>`：额外的扫描根目录。
- `--all`：无提示地上传所有内容。
- `--dry-run`：显示将要上传的内容。
- `--bump <type>`：更新时的版本升级类型（`patch|minor|major`，默认：`patch`）。
- `--changelog <text>`：非交互式更新的变更日志。
- `--tags <tags>`：逗号分隔的标签（默认：`latest`）。
- `--concurrency <n>`：注册表检查的并发数（默认：4）。

## 代理的常见工作流程

### 搜索技能```bash
clawdhub search "postgres backups"
```
### 下载新技能
bash
clawdhub install my-skill-pack
``````
更新已安装的技能```bash
clawdhub update --all
```
### 备份您的技能（发布或同步）

对于单个技能文件夹：
bash
clawdhub publish ./my-skill --slug my-skill --name "My Skill" --version 1.0.0 --tags latest
``````
一次性扫描并备份多项技能：```bash
clawdhub sync --all
```
## 高级细节（技术相关）

### 版本控制与标签

- 每次发布都会创建一个新的 **semver** `SkillVersion`。
- 标签（如 `latest`）指向一个版本；移动标签可以实现回滚。
- 每个版本都会附带变更日志，同步或发布更新时变更日志可以为空。

### 本地更改与注册表版本

更新时，CLI 会通过内容哈希将本地技能内容与注册表中的版本进行比较。如果本地文件不匹配任何已发布的版本，CLI 会在覆盖前进行询问（在非交互式运行中则需要使用 `--force` 参数）。

### 同步扫描与回退路径

`clawdhub sync` 会首先扫描当前工作目录。如果没有找到任何技能，它会回退到已知的旧版路径（例如 `~/clawdbot/skills` 和 `~/.clawdbot/skills`）。此设计旨在无需额外参数即可找到旧版技能安装。

### 存储与锁文件

- 已安装的技能会被记录在工作目录下的 `.clawdhub/lock.json` 文件中。
- 认证令牌存储在 ClawdHub CLI 的配置文件中（可通过 `CLAWDHUB_CONFIG_PATH` 覆盖）。

### 遥测（安装统计）

当你在登录状态下运行 `clawdhub sync` 时，CLI 会发送一个最小的快照以计算安装数量。你可以完全禁用此功能：
bash
export CLAWDHUB_DISABLE_TELEMETRY=1
``````
## 环境变量

- `CLAWDHUB_SITE`: 覆盖站点 URL。
- `CLAWDHUB_REGISTRY`: 覆盖注册表 API URL。
- `CLAWDHUB_CONFIG_PATH`: 覆盖 CLI 存储令牌/配置的路径。
- `CLAWDHUB_WORKDIR`: 覆盖默认的工作目录。
- `CLAWDHUB_DISABLE_TELEMETRY=1`: 在 `sync` 操作中禁用遥测功能。