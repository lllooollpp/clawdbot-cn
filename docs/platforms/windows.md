---
summary: "Windows support (Desktop app + WSL2)"
read_when:
  - Installing Clawdbot on Windows
  - Looking for Windows desktop app or WSL2 guide
---

# Windows

在 Windows 上，Clawdbot 提供两种运行方式：

1.  **Clawdbot Desktop (推荐)**：原生 Windows 应用程序，提供图形化界面，集成了 Gateway。这是最简单的使用方式，无需配置 WSL2。
2.  **WSL2 (开发专用)**：在 Windows 上通过 WSL2（推荐 Ubuntu）运行 CLI。这可以保持运行环境一致，并使工具更加兼容（Node/Bun/pnpm、Linux 二进制文件、技能等）。

## 1) Clawdbot Desktop (桌面版)

原生 Windows 支持，无需 WSL2。

- [桌面版安装与使用指南](/install/desktop)
- 下载地址：[GitHub Releases](https://github.com/clawdbot/clawdbot/releases)

## 2) WSL2 安装 (高级/开发)

- [快速入门](/start/getting-started)（在 WSL 中使用）
- [安装与更新](/install/updating)
- 官方 WSL2 指南（微软）：https://learn.microsoft.com/windows/wsl/install

## 网关
- [网关操作手册](/gateway)
- [配置](/gateway/configuration)

## 网关服务安装（CLI）

在 WSL2 内部执行：

```bash
clawdbot onboard --install-daemon
```

或者：

```bash
clawdbot gateway install
```

或者运行 `clawdbot configure` 选择 **网关服务**。

修复/迁移：
```bash
clawdbot doctor
```

## 高级：通过 LAN 暴露 WSL 服务 (portproxy)

WSL 拥有其自己的虚拟网络。如果另一台机器需要访问运行在 **WSL 内部** 的服务（SSH、本地 TTS 服务器或网关），您必须将 Windows 的端口转发到当前的 WSL IP 地址。

示例（以 **管理员身份** 运行 PowerShell）：
```powershell
$Distro = "Ubuntu-24.04"
$ListenPort = 2222
$TargetPort = 22

$WslIp = (wsl -d $Distro -- hostname -I).Trim().Split(" ")[0]
if (-not $WslIp) { throw "WSL IP not found." }

netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$ListenPort `
  connectaddress=$WslIp connectport=$TargetPort
```

通过 Windows 防火墙（一次性）：
```powershell
New-NetFirewallRule -DisplayName "WSL SSH $ListenPort" -Direction Inbound `
  -Protocol TCP -LocalPort $ListenPort -Action Allow
```

## 逐步安装 WSL2

### 1) 安装 WSL2 + Ubuntu

打开 PowerShell（管理员权限）：
```powershell
wsl --install
# 或者显式安装：
wsl --install -d Ubuntu-24.04
```

### 2) 启用 systemd (网关安装所需)

在你的 WSL 终端中：
```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```
然后注销并运行 `wsl --shutdown`，再重新打开。

### 3) 在 WSL 中安装 Clawdbot

按照 WSL 中的 Linux 入门流程进行操作：
```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm ui:build
pnpm build
clawdbot onboard
```

完整指南：[入门指南](/start/getting-started)
