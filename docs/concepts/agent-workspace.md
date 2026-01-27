---
summary: "Agent workspace: location, layout, and backup strategy"
read_when:
  - You need to explain the agent workspace or its file layout
  - You want to back up or migrate an agent workspace
---

# Agent 工作空间

工作空间是代理的家。它是用于文件工具和工作空间上下文的唯一工作目录。请保持其私密性，并将其视为内存。

这与 `~/.clawdbot/` 是分开的，后者存储配置、凭证和会话。

**重要提示：** 工作空间是 **默认的当前工作目录 (cwd)**，而不是一个硬性沙箱。工具会根据工作空间解析相对路径，但如果启用了沙箱，绝对路径仍然可以访问主机上的其他位置。如果你需要隔离环境，请使用 [`agents.defaults.sandbox`](/gateway/sandboxing)（或每个代理的沙箱配置）。当沙箱功能启用且 `workspaceAccess` 不是 `"rw"` 时，工具会在 `~/.clawdbot/sandboxes` 下的沙箱工作空间中运行，而不是在你的主机工作空间中。

## 默认位置

- 默认值：`~/clawd`
- 如果设置了 `CLAWDBOT_PROFILE` 且不是 `"default"`，默认值会变为 `~/clawd-<profile>`。
- 可在 `~/.clawdbot/clawdbot.json` 中覆盖：
json5
{
  agent: {
    workspace: "~/clawd"
  }
}
``````
命令 `clawdbot onboard`、`clawdbot configure` 或 `clawdbot setup` 在工作区文件缺失时会创建工作区并初始化引导文件。

如果你自行管理工作区文件，可以禁用引导文件的创建：
json5
{ agent: { skipBootstrap: true } }
``````
## 额外的工作区文件夹

较旧的安装可能会创建 `~/clawdbot`。保留多个工作区目录可能导致令人困惑的认证或状态漂移，因为一次只能有一个工作区处于活动状态。

**建议：** 保持一个活动中的工作区。如果您不再使用额外的文件夹，请将其归档或移动到废纸篓（例如 `trash ~/clawdbot`）。如果您有意保留多个工作区，请确保 `agents.defaults.workspace` 指向活动的那个。

`clawdbot doctor` 在检测到额外的工作区目录时会发出警告。

## 工作区文件映射（每个文件的含义）

Clawdbot 在工作区中期望的标准文件如下：

- `AGENTS.md`
  - 代理的操作说明及其应如何使用记忆。
  - 每次会话开始时都会加载。
  - 适合放置规则、优先级和“如何表现”的详细信息。

- `SOUL.md`
  - 人格、语气和边界。
  - 每次会话都会加载。

- `USER.md`
  - 用户是谁以及如何称呼他们。
  - 每次会话都会加载。

- `IDENTITY.md`
  - 代理的名称、氛围和表情符号。
  - 在引导仪式期间创建/更新。

- `TOOLS.md`
  - 关于本地工具和惯例的说明。
  - 不控制工具的可用性；仅作为指导。

- `HEARTBEAT.md`
  - 可选的用于心跳运行的简短检查清单。
  - 保持简短以避免消耗过多的token。

- `BOOT.md`
  - 可选的启动检查清单，在启用内部钩子的情况下，网关重启时执行。
  - 保持简短；使用消息工具进行外部发送。

- `BOOTSTRAP.md`
  - 一次性首次运行仪式。
  - 仅在全新工作区中创建。
  - 在仪式完成后将其删除。

- `memory/YYYY-MM-DD.md`
  - 每日记忆日志（每天一个文件）。
  - 建议在会话开始时阅读今天和昨天的文件。

- `MEMORY.md`（可选）
  - 精选的长期记忆。
  - 仅在主会话、私有会话中加载（不在共享/群组上下文中）。

有关工作流程和自动记忆清除，请参阅 [Memory](/concepts/memory)。

- `skills/`（可选）
  - 工作区特定的技能。
  - 当名称冲突时会覆盖托管/内置的技能。

- `canvas/`（可选）
  - 节点显示的Canvas UI文件（例如 `canvas/index.html`）。

如果任何引导文件缺失，Clawdbot 会在会话中插入一个“文件缺失”标记并继续运行。当插入较大的引导文件时，会进行截断；可通过 `agents.defaults.bootstrapMaxChars` 调整限制（默认：20000）。
`clawdbot setup` 可以在不覆盖现有文件的情况下重新创建缺失的默认文件。

## 工作区中不包含的内容

这些文件位于 `~/.clawdbot/` 中，**不应该**提交到工作区仓库：

- `~/.clawdbot/clawdbot.json`（配置文件）
- `~/.clawdbot/credentials/`（OAuth令牌、API密钥）
- `~/.clawdbot/agents/<agentId>/sessions/`（会话转录 + 元数据）
- `~/.clawdbot/skills/`（托管技能）

如果您需要迁移会话或配置，请单独复制并避免纳入版本控制。

将工作区视为私有内存。将其放入一个 **私有** 的 git 仓库中，以便进行备份和恢复。

在运行网关的机器上执行以下步骤（即工作区所在的机器）。

### 1）初始化仓库

如果已安装 git，新工作区会自动初始化。如果此工作区尚未是一个仓库，请运行：
bash
cd ~/clawd
git init
git add AGENTS.md SOUL.md TOOLS.md IDENTITY.md USER.md HEARTBEAT.md memory/
git commit -m "Add agent workspace"
``````
### 2) 添加一个私有远程仓库（适合初学者的选项）

选项 A：GitHub 网页界面

1. 在 GitHub 上创建一个新的 **私有** 仓库。
2. 不要初始化为 README（避免合并冲突）。
3. 复制 HTTPS 远程 URL。
4. 添加远程仓库并推送：
bash
git branch -M main
git remote add origin <https-url>
git push -u origin main```
选项 B：GitHub 命令行界面（`gh`）```bash
gh auth login
gh repo create clawd-workspace --private --source . --remote origin --push
```
选项 C：GitLab 网页界面

1. 在 GitLab 上创建一个新的 **私有** 仓库。
2. 不要初始化为包含 README（避免合并冲突）。
3. 复制 HTTPS 远程 URL。
4. 添加远程仓库并推送：
bash
git branch -M main
git remote add origin <https-url>
git push -u origin main``````
### 3) 持续更新```bash
git status
git add .
git commit -m "Update memory"
git push
```
## 不要提交敏感信息

即使在私有仓库中，也应避免在工作区存储敏感信息：

- API密钥、OAuth令牌、密码或私人凭证。
- 任何位于 `~/.clawdbot/` 目录下的内容。
- 聊天的原始数据或敏感附件。

如果必须存储敏感信息的引用，请使用占位符，并将真实的密钥保存在其他地方（密码管理器、环境变量或 `~/.clawdbot/`）。

建议的 `.gitignore` 模板：
gitignore
.DS_Store
.env
**/*.key
**/*.pem
**/secrets*``````
## 将工作区迁移到新机器

1. 将仓库克隆到所需的路径（默认为 `~/clawd`）。
2. 在 `~/.clawdbot/clawdbot.json` 中将 `agents.defaults.workspace` 设置为该路径。
3. 运行 `clawdbot setup --workspace <路径>` 以生成任何缺失的文件。
4. 如果需要会话，请单独从旧机器复制 `~/.clawdbot/agents/<agentId>/sessions/` 目录。

## 高级说明

- 多代理路由可以为每个代理使用不同的工作区。请参阅 [频道路由](/concepts/channel-routing) 了解路由配置。
- 如果启用了 `agents.defaults.sandbox`，非主会话可以使用位于 `agents.defaults.sandbox.workspaceRoot` 下的会话级沙盒工作区。