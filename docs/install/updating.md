---
summary: "Updating Clawdbot safely (global install or source), plus rollback strategy"
read_when:
  - Updating Clawdbot
  - Something breaks after an update
---

# 更新说明

Clawdbot 正在快速开发中（预“1.0”版本）。将更新视为部署基础设施：更新 → 运行检查 → 重启（或使用 `clawdbot update` 命令，该命令会自动重启） → 验证。

## 推荐：重新运行网站安装程序（就地升级）

推荐的更新方式是重新从网站运行安装程序。它会检测已有的安装，进行就地升级，并在需要时运行 `clawdbot doctor`。
bash
curl -fsSL https://clawd.bot/install.sh | bash
``````
注意事项：
- 如果你不想再次运行引导向导，请添加 `--no-onboard`。
- 对于 **源码安装**，使用：  ```bash
  curl -fsSL https://clawd.bot/install.sh | bash -s -- --install-method git --no-onboard
  ```
安装程序仅在仓库干净时会执行 `git pull --rebase`。
- 对于 **全局安装**，脚本内部使用 `npm install -g clawdbot@latest`。

## 更新前请知悉

- 了解你是如何安装的：**全局安装**（npm/pnpm）还是**从源码安装**（git clone）。
- 了解你的 Gateway 是如何运行的：**前台终端** 还是 **受监督的服务**（launchd/systemd）。
- 对你的定制配置进行快照：
  - 配置文件：`~/.clawdbot/clawdbot.json`
  - 凭据文件：`~/.clawdbot/credentials/`
  - 工作空间：`~/clawd`

## 更新（全局安装）

选择一种全局安装方式进行更新：
bash
npm i -g clawdbot@latest
``````
```md
pnpm add -g clawdbot@latest```
我们**不**建议在 Gateway 运行时（WhatsApp/Telegram 的问题）中使用 Bun。

要切换更新渠道（通过 git + npm 安装）：```bash
clawdbot update --channel beta
clawdbot update --channel dev
clawdbot update --channel stable
```
使用 `--tag <dist-tag|version>` 进行一次性的安装标签/版本。

有关频道语义和更新日志，请参阅 [开发通道](/install/development-channels)。

注意：在 npm 安装时，网关会在启动时记录一个更新提示（检查当前频道标签）。可通过 `update.checkOnStart: false` 禁用。
bash
clawdbot doctor
clawdbot gateway restart
clawdbot health
``````
注意事项：
- 如果你的网关是以服务形式运行的，建议使用 `clawdbot gateway restart` 而不是终止进程ID。
- 如果你固定在某个特定版本上，请参见下方的“回滚 / 固定版本”部分。

## 更新 (`clawdbot update`)

对于 **源码安装**（git checkout），建议使用：```bash
clawdbot update
```
它运行一个相对安全的更新流程：
- 需要一个干净的工作树。
- 切换到所选的频道（标签或分支）。
- 获取并变基到配置的上游（开发频道）。
- 安装依赖，构建，构建 Control UI，并运行 `clawdbot doctor`。
- 默认会重启网关（使用 `--no-restart` 可跳过）。

如果你通过 **npm/pnpm** 安装（没有 git 元数据），`clawdbot update` 会尝试通过你的包管理器进行更新。如果无法检测到安装，请改用“Update (全局安装)”。

## Update (Control UI / RPC)

Control UI 提供了 **Update & Restart** 功能（RPC: `update.run`）。它会：
1) 运行与 `clawdbot update` 相同的源代码更新流程（仅进行 git checkout）。
2) 写入一个重启标志，并附带结构化的报告（stdout/stderr 尾部信息）。
3) 重启网关，并通过报告向最后一个活跃的会话发送 ping。

如果变基失败，网关将中止并重启，但不会应用更新。
bash
clawdbot update
``````
手册（大致等同）：```bash
git pull
pnpm install
pnpm build
pnpm ui:build # auto-installs UI deps on first run
clawdbot doctor
clawdbot health
```
## 注意事项：
- `pnpm build` 在你运行打包后的 `clawdbot` 可执行文件（[`dist/entry.js`](https://github.com/clawdbot/clawdbot/blob/main/dist/entry.js)）或使用 Node 运行 `dist/` 时非常重要。
- 如果你从仓库的本地检出运行而没有全局安装，请使用 `pnpm clawdbot ...` 来执行 CLI 命令。
- 如果你直接从 TypeScript 运行（`pnpm clawdbot ...`），通常不需要重新构建，但 **配置迁移仍然适用** → 请运行 `doctor`。
- 在全局安装和 Git 安装之间切换很容易：安装另一种形式，然后运行 `clawdbot doctor`，以便重写网关服务的入口点以匹配当前安装。

## 始终运行：`clawdbot doctor`

Doctor 是“安全更新”命令。它故意很无聊：修复 + 迁移 + 警告。

注意：如果你使用的是 **源码安装**（Git 检出），`clawdbot doctor` 会提示你先运行 `clawdbot update`。

它通常会做以下事情：
- 迁移已弃用的配置键 / 旧版配置文件位置。
- 审核 DM 策略并在发现“开放”等高风险设置时发出警告。
- 检查网关的健康状况，并可选择重新启动。
- 检测并迁移旧版网关服务（launchd/systemd；旧版 schtasks）到当前的 Clawdbot 服务。
- 在 Linux 上，确保 systemd 用户持久化（以便网关在退出登录后仍能运行）。

详情：[Doctor](/gateway/doctor)

## 启动 / 停止 / 重启网关

CLI（适用于所有操作系统）：
bash
clawdbot gateway status
clawdbot gateway stop
clawdbot gateway restart
clawdbot gateway --port 18789
clawdbot logs --follow
``````
如果您的系统有监督服务：
- macOS launchd (应用捆绑的 LaunchAgent): `launchctl kickstart -k gui/$UID/com.clawdbot.gateway`（如果设置了 `<profile>`，请使用 `com.clawdbot.<profile>`）
- Linux systemd 用户服务: `systemctl --user restart clawdbot-gateway[-<profile>].service`
- Windows (WSL2): `systemctl --user restart clawdbot-gateway[-<profile>].service`
  - `launchctl`/`systemctl` 仅在服务已安装时有效；否则请运行 `clawdbot gateway install`。

运行手册 + 精确的服务标签：[网关运行手册](/gateway)

## 回滚 / 固定版本（当出现问题时）

### 固定版本（全局安装）

安装一个已知良好的版本（将 `<version>` 替换为上一个正常工作的版本）：```bash
npm i -g clawdbot@<version>
```
"
bash
pnpm add -g clawdbot@<version>提示：要查看当前发布的版本，请运行 `npm view clawdbot version`。

然后重启并重新运行 doctor：
bash
clawdbot doctor
clawdbot gateway restart
``````
### 按日期固定（pin）提交

从某个日期选择一个提交（例如：“2026-01-01 时 main 分支的状态”）：```bash
git fetch origin
git checkout "$(git rev-list -n 1 --before=\"2026-01-01\" origin/main)"
```
然后重新安装依赖项并重启：
bash  
pnpm install  
pnpm build  
clawdbot gateway restart```
如果你想要返回到最新的后续内容：```bash
git checkout main
git pull
```
## 如果你遇到了问题

- 再次运行 `clawdbot doctor` 并仔细阅读输出内容（通常会告诉你如何解决）。
- 检查：[故障排除](/gateway/troubleshooting)
- 在 Discord 上提问：https://channels.discord.gg/clawd