---
summary: "Fix Chrome/Brave/Edge/Chromium CDP startup issues for Clawdbot browser control on Linux"
read_when: "Browser control fails on Linux, especially with snap Chromium"
---

# 浏览器故障排除（Linux）

## 问题： "Failed to start Chrome CDP on port 18800"

Clawdbot 的浏览器控制服务器在启动 Chrome/Brave/Edge/Chromium 时出现错误：
"``````
{"error":"Error: Failed to start Chrome CDP on port 18800 for profile \"clawd\"."}
```
### 根本原因

在 Ubuntu（以及许多其他 Linux 发行版）上，默认安装的 Chromium 是一个 **snap 软件包**。Snap 的 AppArmor 限制机制会干扰 Clawdbot 启动和监控浏览器进程的方式。

`apt install chromium` 命令安装的是一个重定向到 snap 的存根软件包：

Note, selecting 'chromium-browser' instead of 'chromium'
chromium-browser is already the newest version (2:1snap1-0ubuntu2).
``````
这并不是一个真正的浏览器——它只是一个包装器。

### 解决方案 1：安装 Google Chrome（推荐）

安装官方的 Google Chrome `.deb` 安装包，该安装包不会被 snap 沙盒限制：```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt --fix-broken install -y  # if there are dependency errors
```
然后更新你的 Clawdbot 配置文件（`~/.clawdbot/clawdbot.json`）：  
{
  "browser": {
    "enabled": true,
    "executablePath": "/usr/bin/google-chrome-stable",
    "headless": true,
    "noSandbox": true
  }
}```
### 解决方案 2：使用 Snap Chromium 的仅附加模式

如果你必须使用 Snap 版本的 Chromium，请配置 Clawdbot 以附加到手动启动的浏览器：

1. 更新配置：```json
{
  "browser": {
    "enabled": true,
    "attachOnly": true,
    "headless": true,
    "noSandbox": true
  }
}
```
2. 手动启动 Chromium：
bash
chromium-browser --headless --no-sandbox --disable-gpu \
  --remote-debugging-port=18800 \
  --user-data-dir=$HOME/.clawdbot/browser/clawd/user-data \
  about:blank &
``````
3. 可选地创建一个 systemd 用户服务以自动启动 Chrome：```ini
# ~/.config/systemd/user/clawd-browser.service
[Unit]
Description=Clawd Browser (Chrome CDP)
After=network.target

[Service]
ExecStart=/snap/bin/chromium --headless --no-sandbox --disable-gpu --remote-debugging-port=18800 --user-data-dir=%h/.clawdbot/browser/clawd/user-data about:blank
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```
启用方式：`systemctl --user enable --now clawd-browser.service`

### 验证浏览器是否正常工作

检查状态：
bash
curl -s http://127.0.0.1:18791/ | jq '{running, pid, chosenBrowser}'
``````
浏览测试：```bash
curl -s -X POST http://127.0.0.1:18791/start
curl -s http://127.0.0.1:18791/tabs
```
### 配置参考

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `browser.enabled` | 启用浏览器控制 | `true` |
| `browser.executablePath` | Chromium 基础浏览器二进制文件的路径（Chrome/Brave/Edge/Chromium） | 自动检测（优先使用默认的 Chromium 浏览器） |
| `browser.headless` | 无 GUI 运行 | `false` |
| `browser.noSandbox` | 添加 `--no-sandbox` 标志（某些 Linux 环境需要） | `false` |
| `browser.attachOnly` | 不启动浏览器，仅连接到已有的浏览器实例 | `false` |
| `browser.cdpPort` | Chrome 开发者工具协议端口 | `18800` |

### 问题： "Chrome 扩展中继正在运行，但没有标签页连接"

你正在使用 `chrome` 配置文件（扩展中继）。它期望 Clawdbot 浏览器扩展已连接到一个正在运行的标签页。

解决方法：
1. **使用托管浏览器：** `clawdbot browser start --browser-profile clawd`  
   （或设置 `browser.defaultProfile: "clawd"`）。
2. **使用扩展中继：** 安装扩展，打开一个标签页，然后点击 Clawdbot 扩展图标以连接它。

备注：
- `chrome` 配置文件在可能的情况下会使用你的 **系统默认 Chromium 浏览器**。
- 本地的 `clawd` 配置文件会自动分配 `cdpPort`/`cdpUrl`；仅在远程 CDP 时才手动设置这些参数。