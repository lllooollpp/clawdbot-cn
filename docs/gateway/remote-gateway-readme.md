---
summary: "SSH tunnel setup for Clawdbot.app connecting to a remote gateway"
read_when: "Connecting the macOS app to a remote gateway over SSH"
---

# 使用远程网关运行 Clawdbot.app

Clawdbot.app 通过 SSH 隧道连接到远程网关。本指南将向您展示如何进行设置。

## 概述

┌─────────────────────────────────────────────────────────────┐
│                        客户端机器                          │
│                                                              │
│  Clawdbot.app ──► ws://127.0.0.1:18789 (本地端口)           │
│                     │                                        │
│                     ▼                                        │
│  SSH 隧道 ────────────────────────────────────────────────│
│                     │                                        │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                         远程机器                        │
│                                                              │
│  网关 WebSocket ──► ws://127.0.0.1:18789 ──►              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
``````
## 快速设置

### 第1步：添加SSH配置

编辑 `~/.ssh/config` 并添加以下内容：```ssh
Host remote-gateway
    HostName <REMOTE_IP>          # e.g., 172.27.187.184
    User <REMOTE_USER>            # e.g., jefferson
    LocalForward 18789 127.0.0.1:18789
    IdentityFile ~/.ssh/id_rsa
```
将 `<REMOTE_IP>` 和 `<REMOTE_USER>` 替换为你的值。

### 第2步：复制SSH密钥

将你的公钥复制到远程机器（输入一次密码）：
bash
ssh-copy-id -i ~/.ssh/id_rsa <REMOTE_USER>@<REMOTE_IP>
``````
### 第3步：设置网关令牌```bash
launchctl setenv CLAWDBOT_GATEWAY_TOKEN "<your-token>"
```
### 第4步：启动SSH隧道
bash
ssh -N remote-gateway &
``````
### 第5步：重启 Clawdbot.app```bash
# Quit Clawdbot.app (⌘Q), then reopen:
open /path/to/Clawdbot.app
```
应用程序现在将通过 SSH 隧道连接到远程网关。

---

## 登录时自动启动隧道

要在登录时自动启动 SSH 隧道，请创建一个 Launch Agent。

### 创建 PLIST 文件

将以下内容保存为 `~/Library/LaunchAgents/com.clawdbot.ssh-tunnel.plist`：
xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.clawdbot.ssh-tunnel</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/ssh</string>
        <string>-N</string>
        <string>remote-gateway</string>
    </array>
    <key>KeepAlive</key>
    <true/>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
``````
### 加载启动代理```bash
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.clawdbot.ssh-tunnel.plist
```
"隧道现在将：
- 在您登录时自动启动
- 在崩溃时自动重启
- 在后台持续运行

---

## 故障排除

**检查隧道是否正在运行：**```bash
ps aux | grep "ssh -N remote-gateway" | grep -v grep
lsof -i :18789
``````
**重启隧道：**```bash
launchctl kickstart -k gui/$UID/com.clawdbot.ssh-tunnel
```
**停止隧道：**
bash
launchctl bootout gui/$UID/com.clawdbot.ssh-tunnel
``````
---

## 工作原理

| 组件 | 它的作用 |
|-----------|--------------|
| `LocalForward 18789 127.0.0.1:18789` | 将本地端口 18789 转发到远程端口 18789 |
| `ssh -N` | 通过 SSH 进行端口转发，不执行远程命令 |
| `KeepAlive` | 如果隧道崩溃，会自动重新启动 |
| `RunAtLoad` | 在代理加载时启动隧道 |

Clawdbot.app 在您的客户端机器上连接到 `ws://127.0.0.1:18789`。SSH 隧道会将该连接转发到运行 Gateway 的远程机器的 18789 端口。