---
summary: "Clawdbot on Raspberry Pi (budget self-hosted setup)"
read_when:
  - Setting up Clawdbot on a Raspberry Pi
  - Running Clawdbot on ARM devices
  - Building a cheap always-on personal AI
---

# Clawdbot 在树莓派上运行

## 目标

在树莓派上运行一个持久的、始终在线的 Clawdbot 网关，**一次性成本约 35-80 美元**（无月费）。

非常适合：
- 24/7 个人 AI 助手
- 家庭自动化中心
- 低功耗、始终可用的 Telegram/WhatsApp 机器人

## 硬件要求

| Pi 型号 | 内存 | 可用？ | 备注 |
|----------|-----|--------|-------|
| **Pi 5** | 4GB/8GB | ✅ 最佳 | 最快，推荐使用 |
| **Pi 4** | 4GB | ✅ 良好 | 大多数用户的最佳选择 |
| **Pi 4** | 2GB | ✅ 可行 | 可用，添加交换分区 |
| **Pi 4** | 1GB | ⚠️ 紧张 | 可用，但需要最小配置 |
| **Pi 3B+** | 1GB | ⚠️ 慢 | 可用但运行缓慢 |
| **Pi Zero 2 W** | 512MB | ❌ | 不推荐 |

**最低配置：** 1GB 内存，1 核，500MB 磁盘  
**推荐配置：** 2GB+ 内存，64 位系统，16GB+ SD 卡（或 USB SSD）

## 所需物品

- 树莓派 4 或 5（推荐 2GB+）
- 微型 SD 卡（16GB+）或 USB SSD（性能更好）
- 电源适配器（推荐官方 Pi 电源）
- 网络连接（以太网或 WiFi）
- 约 30 分钟

## 1) 刷写操作系统

使用 **Raspberry Pi OS Lite（64 位）** —— 无需桌面，适合无头服务器。

1. 下载 [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. 选择系统：**Raspberry Pi OS Lite（64 位）**
3. 点击齿轮图标（⚙️）进行预配置：
   - 设置主机名：`gateway-host`
   - 启用 SSH
   - 设置用户名/密码
   - 配置 WiFi（如果未使用以太网）
4. 将系统刷写到 SD 卡 / USB 驱动器
5. 插入并启动 Pi

## 2) 通过 SSH 连接
bash
ssh user@gateway-host
# 或使用 IP 地址
ssh user@192.168.x.x
``````
## 3）系统设置```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y git curl build-essential

# Set timezone (important for cron/reminders)
sudo timedatectl set-timezone America/Chicago  # Change to your timezone
```
## 4) 安装 Node.js 22 (ARM64)
bash
# 通过 NodeSource 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应显示 v22.x.x
npm --version
``````
## 5) 添加交换空间（对于 2GB 或更少内存非常重要）

交换空间可以防止内存不足导致的崩溃：```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize for low RAM (reduce swappiness)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```
## 6) 安装 Clawdbot

### 选项 A：标准安装（推荐）
bash
curl -fsSL https://clawd.bot/install.sh | bash
``````
### 选项 B：可修改安装（适用于动手实验）```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
npm install
npm run build
npm link
```
"可被破解的安装版本为您提供对日志和代码的直接访问权限——这对于调试与ARM相关的问题非常有用。

## 7）运行引导流程
bash
clawdbot onboard --install-daemon
``````
跟随向导：
1. **网关模式:** 本地
2. **认证方式:** 推荐使用API密钥（OAuth在无头Pi上可能不太稳定）
3. **频道:** Telegram是最容易上手的
4. **守护进程:** 是（systemd）

## 8) 验证安装```bash
# Check status
clawdbot status

# Check service
sudo systemctl status clawdbot

# View logs
journalctl -u clawdbot -f
```
## 9) 访问仪表盘

由于树莓派处于无头模式（headless），请使用 SSH 隧道：
bash
# 从你的笔记本电脑/桌面
ssh -L 18789:localhost:18789 user@gateway-host

# 然后在浏览器中打开
open http://localhost:18789
``````
或者使用 Tailscale 实现始终在线的访问：```bash
# On the Pi
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Update config
clawdbot config set gateway.bind tailnet
sudo systemctl restart clawdbot
```
---

## 性能优化

### 使用 USB SSD（性能有显著提升）

SD 卡速度较慢且容易磨损。使用 USB SSD 可显著提升性能：
bash
# 检查是否从 USB 启动
lsblk
``````
参见 [Pi USB 启动指南](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#usb-mass-storage-boot) 进行设置。

### 降低内存使用```bash
# Disable GPU memory allocation (headless)
echo 'gpu_mem=16' | sudo tee -a /boot/config.txt

# Disable Bluetooth if not needed
sudo systemctl disable bluetooth
```
### 监控资源
# 检查内存
free -h

# 检查CPU温度
vcgencmd measure_temp

# 实时监控
htop```
---

## ARM 特定说明

### 二进制兼容性

大多数 Clawdbot 功能在 ARM64 上可以正常运行，但某些外部二进制文件可能需要 ARM 版本的构建：

| 工具 | ARM64 状态 | 说明 |
|------|--------------|-------|
| Node.js | ✅ | 运行良好 |
| WhatsApp (Baileys) | ✅ | 纯 JavaScript，无问题 |
| Telegram | ✅ | 纯 JavaScript，无问题 |
| gog (Gmail CLI) | ⚠️ | 请检查是否有 ARM 版本的发布 |
| Chromium (浏览器) | ✅ | `sudo apt install chromium-browser` |

如果某个技能无法运行，请检查其二进制文件是否有 ARM 版本的构建。许多 Go/Rust 工具都有；但有些可能没有。```bash
uname -m
# Should show: aarch64 (64-bit) not armv7l (32-bit)
```
---

## 推荐的模型设置

由于树莓派只是网关（模型在云端运行），请使用基于 API 的模型：
json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-20250514",
        "fallbacks": ["openai/gpt-4o-mini"]
      }
    }
  }
}
``````
**不要尝试在树莓派上运行本地LLM** —— 即使是小型模型也会太慢。让Claude/GPT来处理繁重的任务。

---

## 开机自动启动

首次设置向导会自动配置，但可以进行验证：```bash
# Check service is enabled
sudo systemctl is-enabled clawdbot

# Enable if not
sudo systemctl enable clawdbot

# Start on boot
sudo systemctl start clawdbot
```
## 故障排除

### 内存不足（OOM）
bash
# 检查内存
free -h

# 添加更多交换空间（参见步骤5）
# 或减少在树莓派上运行的服务
``````
### 运行缓慢

- 使用 USB SSD 替代 SD 卡
- 禁用不使用的服务：`sudo systemctl disable cups bluetooth avahi-daemon`
- 检查 CPU 降频情况：`vcgencmd get_throttled`（应返回 `0x0`）

### 服务无法启动```bash
# Check logs
journalctl -u clawdbot --no-pager -n 100

# Common fix: rebuild
cd ~/clawdbot  # if using hackable install
npm run build
sudo systemctl restart clawdbot
```
### ARM 二进制文件问题

如果一个程序报错为 "exec format error"：
1. 检查该二进制文件是否有 ARM64 版本
2. 尝试从源代码进行编译
3. 或者使用支持 ARM 的 Docker 容器

### WiFi 断连问题

对于无头模式的树莓派（headless Pis）使用 WiFi 时：
bash
# 禁用 WiFi 电源管理
sudo iwconfig wlan0 power off

# 设置为永久生效
echo 'wireless-power off' | sudo tee -a /etc/network/interfaces
``````
---

## 成本对比

| 设置 | 一次性成本 | 每月成本 | 备注 |
|-------|---------------|--------------|-------|
| **Pi 4 (2GB)** | ~$45 | $0 | + 电源 (~$5/年) |
| **Pi 4 (4GB)** | ~$55 | $0 | 推荐使用 |
| **Pi 5 (4GB)** | ~$60 | $0 | 最佳性能 |
| **Pi 5 (8GB)** | ~$80 | $0 | 过度配置但未来可扩展 |
| DigitalOcean | $0 | $6/月 | $72/年 |
| Hetzner | $0 | €3.79/月 | ~$50/年 |

**收支平衡点:** 与云 VPS 相比，Pi 大约在 ~6-12 个月内可以回本。

---

## 相关内容

- [Linux 指南](/platforms/linux) — 通用 Linux 设置
- [DigitalOcean 指南](/platforms/digitalocean) — 云替代方案
- [Hetzner 指南](/platforms/hetzner) — Docker 设置
- [Tailscale](/gateway/tailscale) — 远程访问
- [节点](/nodes) — 将你的笔记本电脑/手机与 Pi 网关配对