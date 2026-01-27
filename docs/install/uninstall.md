---
summary: "Uninstall Clawdbot completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Clawdbot from a machine
  - The gateway service is still running after uninstall
---

# 卸载

两种路径：
- **简易路径**：如果 `clawdbot` 仍然已安装。
- **手动服务移除**：如果 CLI 已丢失但服务仍在运行。

## 简易路径（CLI 仍然安装）
推荐使用内置的卸载程序：
bash
clawdbot uninstall
``````
非交互式（自动化 / npx）：```bash
clawdbot uninstall --all --yes --non-interactive
npx -y clawdbot uninstall --all --yes --non-interactive
```
手动步骤（结果相同）：

1) 停止网关服务：
bash
clawdbot gateway stop
``````
2) 卸载网关服务（launchd/systemd/schtasks）：```bash
clawdbot gateway uninstall
```
3) 删除状态 + 配置：
bash
rm -rf "${CLAWDBOT_STATE_DIR:-$HOME/.clawdbot}"
``````
如果您将 `CLAWDBOT_CONFIG_PATH` 设置为超出状态目录的自定义路径，请一并删除该文件。

4) 删除您的工作区（可选，将移除代理文件）：```bash
rm -rf ~/clawd
```
5) 卸载 CLI 安装（选择你使用的那个）：
bash
npm rm -g clawdbot
pnpm remove -g clawdbot
bun remove -g clawdbot
``````
6) 如果你安装了 macOS 应用程序：```bash
rm -rf /Applications/Clawdbot.app
```
## 注意事项：
- 如果你使用了配置文件（`--profile` / `CLAWDBOT_PROFILE`），请为每个状态目录重复步骤3（默认状态目录为 `~/.clawdbot-<profile>`）。
- 在远程模式下，状态目录位于 **网关主机** 上，因此也需要在该主机上运行步骤1-4。

## 手动服务移除（未安装CLI）

如果你的网关服务仍在运行，但 `clawdbot` 不存在，请使用此方法。

### macOS（launchd）

默认标签为 `com.clawdbot.gateway`（或 `com.clawdbot.<profile>`）：
bash
launchctl bootout gui/$UID/com.clawdbot.gateway
rm -f ~/Library/LaunchAgents/com.clawdbot.gateway.plist
``````
如果您使用了配置文件，请将标签和 plist 名称替换为 `com.clawdbot.<profile>`。

### Linux（systemd 用户单元）

默认的单元名称为 `clawdbot-gateway.service`（或 `clawdbot-gateway-<profile>.service`）：```bash
systemctl --user disable --now clawdbot-gateway.service
rm -f ~/.config/systemd/user/clawdbot-gateway.service
systemctl --user daemon-reload
```
### Windows（任务计划）

默认的任务名称为 `Clawdbot Gateway`（或 `Clawdbot Gateway (<profile>)`）。
该任务脚本位于你的用户目录下。
powershell
schtasks /Delete /F /TN "Clawdbot Gateway"
Remove-Item -Force "$env:USERPROFILE\.clawdbot\gateway.cmd"
``````
如果你使用了某个配置文件，请删除对应的任务名称和 `~\.clawdbot-<profile>\gateway.cmd` 文件。

## 正常安装 vs 源码克隆

### 正常安装（install.sh / npm / pnpm / bun）

如果你使用了 `https://clawd.bot/install.sh` 或 `install.ps1`，CLI 是通过 `npm install -g clawdbot@latest` 安装的。
请通过 `npm rm -g clawdbot` 卸载（如果你是通过这种方式安装的，也可以使用 `pnpm remove -g` 或 `bun remove -g`）。

### 源码克隆（git clone）

如果你是从仓库克隆运行的（`git clone` + `clawdbot ...` / `bun run clawdbot ...`）：

1) **在删除仓库之前**，请先卸载网关服务（可以使用上面的简单方法，或者手动移除服务）。
2) 删除仓库目录。
3) 如上所述，移除状态和工作空间。