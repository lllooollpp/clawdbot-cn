---
summary: "Windows (WSL2) support + companion app status"
read_when:
  - Installing Clawdbot on Windows
  - Looking for Windows companion app status
---

# Windows (WSL2)

在 Windows 上推荐使用 **WSL2**（推荐 Ubuntu）运行 Clawdbot。CLI + Gateway 在 Linux 中运行，这可以保持运行环境一致，并使工具更加兼容（Node/Bun/pnpm、Linux 二进制文件、技能等）。原生 Windows 安装尚未经过测试，可能会遇到更多问题。

计划开发原生 Windows 的配套应用。

## 安装（WSL2）
- [快速入门](/start/getting-started)（在 WSL 中使用）
- [安装与更新](/install/updating)
- 官方 WSL2 指南（微软）：https://learn.microsoft.com/windows/wsl/install

## 网关
- [网关操作手册](/gateway)
- [配置](/gateway/configuration)

## 网关服务安装（CLI）

在 WSL2 内部执行：

clawdbot onboard --install-daemon
``````
或者：```
clawdbot gateway install
```
或者：
clawdbot 配置```
选择 **网关服务** 时，请按照提示操作。

修复/迁移：```
clawdbot doctor
```
## 高级：通过 LAN 暴露 WSL 服务（portproxy）

WSL 拥有其自己的虚拟网络。如果另一台机器需要访问运行在 **WSL 内部** 的服务（SSH、本地 TTS 服务器或网关），您必须将 Windows 的端口转发到当前的 WSL IP 地址。WSL 的 IP 地址在重启后会发生变化，因此您可能需要刷新转发规则。

示例（以 **管理员身份** 运行 PowerShell）：
powershell
$Distro = "Ubuntu-24.04"
$ListenPort = 2222
$TargetPort = 22

$WslIp = (wsl -d $Distro -- hostname -I).Trim().Split(" ")[0]
if (-not $WslIp) { throw "WSL IP not found." }

netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$ListenPort `
  connectaddress=$WslIp connectport=$TargetPort
``````
通过 Windows 防火墙（一次性）：```powershell
New-NetFirewallRule -DisplayName "WSL SSH $ListenPort" -Direction Inbound `
  -Protocol TCP -LocalPort $ListenPort -Action Allow
```
在 WSL 重启后刷新 portproxy：
powershell
netsh interface portproxy delete v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 | Out-Null
netsh interface portproxy add v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 `
  connectaddress=$WslIp connectport=$TargetPort | Out-Null
``````
注意事项：
- 从其他机器通过 SSH 连接到 **Windows 主机 IP**（例如：`ssh user@windows-host -p 2222`）。
- 远程节点必须指向一个 **可访问的** 网关 URL（不是 `127.0.0.1`）；使用 `clawdbot status --all` 来确认。
- 为了局域网访问，请使用 `listenaddress=0.0.0.0`；使用 `127.0.0.1` 仅限本地访问。
- 如果希望自动执行此操作，请注册一个计划任务，在登录时运行刷新步骤。

## 逐步安装 WSL2

### 1) 安装 WSL2 + Ubuntu

打开 PowerShell（管理员权限）：```powershell
wsl --install
# Or pick a distro explicitly:
wsl --list --online
wsl --install -d Ubuntu-24.04
```
如果 Windows 要求重启，请重启。

### 2) 启用 systemd（网关安装所需）

在你的 WSL 终端中：
bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
``````
然后从 PowerShell 中：```powershell
wsl --shutdown
```
重新打开 Ubuntu，然后进行验证：
bash
systemctl --user status
``````
### 3) 在 WSL 中安装 Clawdbot

按照 WSL 中的 Linux 入门流程进行操作：```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm ui:build # auto-installs UI deps on first run
pnpm build
clawdbot onboard
```
"完整指南：[入门指南](/start/getting-started)

## Windows 伴侣应用

我们目前还没有 Windows 伴侣应用。如果你有兴趣，欢迎贡献代码来实现它。"