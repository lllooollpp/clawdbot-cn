---
summary: "Clawdbot on DigitalOcean (cheapest paid VPS option)"
read_when:
  - Setting up Clawdbot on DigitalOcean
  - Looking for cheap VPS hosting for Clawdbot
---

# Clawdbot 在 DigitalOcean 上的部署

## 目标

在 DigitalOcean 上运行一个持久的 Clawdbot 网关，**每月仅需 $6**（或使用预留定价每月 $4）。

如果你想找到更便宜的方案，可以看看底部的 [Oracle Cloud（免费套餐）](#oracle-cloud-free-alternative) —— 它是 **永久免费的**。

## 成本比较（2026年）

| 供应商 | 计划 | 规格 | 价格/月 | 备注 |
|--------|------|------|----------|------|
| **Oracle Cloud** | Always Free ARM | 4 OCPU，24GB 内存 | **$0** | 最佳性价比，需要 ARM 兼容的设置 |
| **Hetzner** | CX22 | 2 vCPU，4GB 内存 | €3.79（约 $4） | 最便宜的付费方案，欧洲数据中心 |
| **DigitalOcean** | Basic | 1 vCPU，1GB 内存 | $6 | 界面友好，文档完善 |
| **Vultr** | Cloud Compute | 1 vCPU，1GB 内存 | $6 | 众多地理位置选择 |
| **Linode** | Nanode | 1 vCPU，1GB 内存 | $5 | 现在属于 Akamai |

**推荐：**
- **免费：** Oracle Cloud ARM（如果你能处理注册流程）
- **付费：** Hetzner CX22（性价比最高）—— 请参阅 [Hetzner 教程](/platforms/hetzner)
- **简便：** DigitalOcean（本指南）—— 对初学者友好的界面

---

## 先决条件

- DigitalOcean 账户 ([注册并获得 $200 免费信用](https://m.do.co/c/signup))
- SSH 密钥对（或愿意使用密码认证）
- 约 20 分钟

## 1) 创建 Droplet

1. 登录 [DigitalOcean](https://cloud.digitalocean.com/)
2. 点击 **创建 → Droplets**
3. 选择：
   - **区域：** 最接近你（或你的用户）的区域
   - **镜像：** Ubuntu 24.04 LTS
   - **规格：** Basic → Regular → **$6/月**（1 vCPU，1GB 内存，25GB SSD）
   - **认证方式：** SSH 密钥（推荐）或密码
4. 点击 **创建 Droplet**
5. 记录 IP 地址

## 2) 通过 SSH 连接
bash
ssh root@YOUR_DROPLET_IP
``````
## 3）安装 Clawdbot```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Install Clawdbot
curl -fsSL https://clawd.bot/install.sh | bash

# Verify
clawdbot --version
```
## 4）运行入门指南
bash
clawdbot onboard --install-daemon
``````
向导将引导您完成以下步骤：
- 模型认证（API 密钥或 OAuth）
- 渠道设置（Telegram、WhatsApp、Discord 等）
- 网关令牌（自动生成）
- 守护进程安装（systemd）

## 5）验证网关```bash
# Check status
clawdbot status

# Check service
systemctl status clawdbot

# View logs
journalctl -u clawdbot -f
```
## 6) 访问仪表盘

网关默认绑定到环回地址。要访问控制界面：

**选项 A：SSH 隧道（推荐）**
bash
# 从你的本地机器
ssh -L 18789:localhost:18789 root@YOUR_DROPLET_IP

# 然后打开：http://localhost:18789
``````
**选项 B：Tailscale（长期更简单）**```bash
# On the droplet
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# Configure gateway to bind to Tailscale
clawdbot config set gateway.bind tailnet
clawdbot gateway restart
```
然后通过你的 Tailscale IP 访问：`http://100.x.x.x:18789`

## 7) 连接你的频道

### Telegram
clawdbot pairing list telegram
clawdbot pairing approve telegram <CODE>```
### WhatsApp```bash
clawdbot channels login whatsapp
# Scan QR code
```
有关其他提供商的信息，请参阅[Channels](/channels)。

---

## 1GB RAM 的优化

$6 的 droplet 仅有 1GB 的 RAM。为了保持系统运行流畅：

### 添加交换空间（推荐）
bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
``````
### 使用更轻量的模型
如果你遇到内存不足（OOM）的问题，可以考虑：
- 使用基于API的模型（如Claude、GPT）而不是本地模型
- 将 `agents.defaults.model.primary` 设置为更小的模型

### 监控内存```bash
free -h
htop
```
---

## 持久化

所有状态都存储在以下位置：
- `~/.clawdbot/` — 配置文件、凭证、会话数据
- `~/clawd/` — 工作空间（SOUL.md、记忆等）

这些数据在重启后仍然保留。请定期备份：
bash
tar -czvf clawdbot-backup.tar.gz ~/.clawdbot ~/clawd
``````
---

## Oracle Cloud 的免费替代方案

Oracle Cloud 提供了**Always Free**的 ARM 实例，性能显著更强：

| 你可以获得 | 规格 |
|--------------|-------|
| **4 个 OCPU** | ARM Ampere A1 |
| **24GB 内存** | 足够使用 |
| **200GB 存储** | 块存储卷 |
| **永久免费** | 不会收取信用卡费用 |

### 快速设置：
1. 在 [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) 注册
2. 创建一个 VM.Standard.A1.Flex 实例（ARM 架构）
3. 选择 Oracle Linux 或 Ubuntu
4. 在免费套餐中分配最多 4 OCPU / 24GB 内存
5. 按照上面的 Clawdbot 安装步骤进行操作

**注意事项：**
- 注册过程可能有点麻烦（如果失败请重试）
- ARM 架构 —— 大多数软件都能运行，但某些二进制文件需要 ARM 版本
- Oracle 可能会回收空闲实例（请保持实例活跃）

如需完整的 Oracle 指南，请参阅 [社区文档](https://gist.github.com/rssnyder/51e3cfedd730e7dd5f4a816143b25dbd)。

---

## 故障排除

### 网关无法启动```bash
clawdbot gateway status
clawdbot doctor --non-interactive
journalctl -u clawdbot --no-pager -n 50
```
### 端口已被占用
bash
lsof -i :18789
kill <PID>
``````
### 内存不足```bash
# Check memory
free -h

# Add more swap
# Or upgrade to $12/mo droplet (2GB RAM)
```
## 参见

- [Hetzner 指南](/platforms/hetzner) — 更便宜，更强大
- [Docker 安装](/install/docker) — 容器化设置
- [Tailscale](/gateway/tailscale) — 安全的远程访问
- [配置](/gateway/configuration) — 完整的配置参考