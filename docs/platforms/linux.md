---
summary: "Linux support + companion app status"
read_when:
  - Looking for Linux companion app status
  - Planning platform coverage or contributions
---

# Linux 应用

网关在 Linux 上得到了完全支持。**推荐使用 Node 作为运行时**。  
Bun 不推荐用于网关（存在 WhatsApp/Telegram 的问题）。

计划开发原生的 Linux 搭配应用。如果你愿意帮忙开发，欢迎贡献。

## 初学者快速入门（VPS）

1) 安装 Node 22+  
2) `npm i -g clawdbot@latest`  
3) `clawdbot onboard --install-daemon`  
4) 从你的笔记本电脑：`ssh -N -L 18789:127.0.0.1:18789 <user>@<host>`  
5) 打开 `http://127.0.0.1:18789/` 并粘贴你的 token

逐步 VPS 教程：[exe.dev](/platforms/exe-dev)

## 安装
- [快速入门](/start/getting-started)
- [安装与更新](/install/updating)
- 可选流程：[Bun（实验性）](/install/bun)、[Nix](/install/nix)、[Docker](/install/docker)

## 网关
- [网关操作手册](/gateway)
- [配置](/gateway/configuration)

## 网关服务安装（CLI）

使用以下任意一种方式：

clawdbot onboard --install-daemon
``````
或者：```
clawdbot gateway install
```
或者：
clawdbot configure```
当被提示时选择 **网关服务**。

修复/迁移：```
clawdbot doctor
```
## 系统控制（systemd 用户服务）
Clawdbot 默认安装了一个 systemd **用户** 服务。对于共享或始终运行的服务器，请使用 **系统** 服务。完整的服务示例和指南请参见 [网关运行手册](/gateway)。

最小配置：

创建 `~/.config/systemd/user/clawdbot-gateway[-<profile>].service`：

[Unit]
Description=Clawdbot 网关（配置文件： <profile>，版本 v<version>）
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/clawdbot gateway --port 18789
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
``````
启用它：```
systemctl --user enable --now clawdbot-gateway[-<profile>].service
```
