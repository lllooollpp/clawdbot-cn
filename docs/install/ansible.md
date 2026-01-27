---
summary: "Automated, hardened Clawdbot installation with Ansible, Tailscale VPN, and firewall isolation"
read_when:
  - You want automated server deployment with security hardening
  - You need firewall-isolated setup with VPN access
  - You're deploying to remote Debian/Ubuntu servers
---

# Ansible 安装

将 Clawdbot 部署到生产服务器的推荐方式是通过 **[clawdbot-ansible](https://github.com/clawdbot/clawdbot-ansible)** —— 一种以安全为优先的自动化安装工具。

## 快速开始

一键安装命令：
bash
curl -fsSL https://raw.githubusercontent.com/clawdbot/clawdbot-ansible/main/install.sh | bash
``````
> **📦 完整指南：[github.com/clawdbot/clawdbot-ansible](https://github.com/clawdbot/clawdbot-ansible)**  
>
> clawdbot-ansible 仓库是 Ansible 部署的权威来源。本页面为快速概览。

## 你将获得

- 🔒 **以防火墙为先的安全策略**：UFW + Docker 隔离（仅开放 SSH + Tailscale）
- 🔐 **Tailscale VPN**：无需公开暴露服务即可实现安全远程访问
- 🐳 **Docker**：隔离的沙盒容器，仅绑定到 localhost
- 🛡️ **纵深防御**：四层安全架构
- 🚀 **一键部署**：几分钟内完成全部部署
- 🔧 **Systemd 集成**：开机自动启动并进行安全加固

## 要求

- **操作系统**：Debian 11+ 或 Ubuntu 20.04+
- **访问权限**：Root 或 sudo 权限
- **网络**：互联网连接用于安装软件包
- **Ansible**：2.14+（由快速启动脚本自动安装）

## 安装内容

Ansible playbook 将安装并配置以下内容：

1. **Tailscale**（用于安全远程访问的网格 VPN）
2. **UFW 防火墙**（仅开放 SSH 和 Tailscale 端口）
3. **Docker CE + Compose V2**（用于代理沙盒）
4. **Node.js 22.x + pnpm**（运行时依赖）
5. **Clawdbot**（基于主机的部署，非容器化）
6. **Systemd 服务**（开机自动启动并进行安全加固）

注意：网关**直接运行在主机上**（非 Docker 容器中），但代理沙盒使用 Docker 实现隔离。详情请参见 [沙盒化](/gateway/sandboxing)。```bash
sudo -i -u clawdbot
```
安装后的脚本将引导你完成以下步骤：

1. **引导流程**：配置 Clawdbot 设置  
2. **服务商登录**：连接 WhatsApp/Telegram/Discord/Signal  
3. **网关测试**：验证安装是否成功  
4. **Tailscale 设置**：连接到你的 VPN 网状网络  

### 快速命令
bash
# 检查服务状态
sudo systemctl status clawdbot

# 查看实时日志
sudo journalctl -u clawdbot -f

# 重启网关
sudo systemctl restart clawdbot

# 服务商登录（以 clawdbot 用户身份运行）
sudo -i -u clawdbot
clawdbot channels login
``````
## 安全架构

### 四层防御

1. **防火墙（UFW）**：仅公开暴露 SSH（22）和 Tailscale（41641/udp）
2. **VPN（Tailscale）**：网关仅可通过 VPN 网状网络访问
3. **Docker 隔离**：DOCKER-USER 的 iptables 链防止外部端口暴露
4. **Systemd 加固**：NoNewPrivileges、PrivateTmp、非特权用户

### 验证

测试外部攻击面：```bash
nmap -p- YOUR_SERVER_IP
```
应仅开放 **端口 22**（SSH）。所有其他服务（网关、Docker）均被限制。

### Docker 可用性

Docker 用于 **代理沙盒**（隔离的工具执行），而不是用于运行网关本身。网关仅绑定到本地主机，并可通过 Tailscale VPN 访问。

有关沙盒配置，请参见 [多代理沙盒与工具](/multi-agent-sandbox-tools)。
bash
# 1. 安装前置条件
sudo apt update && sudo apt install -y ansible git

# 2. 克隆仓库
git clone https://github.com/clawdbot/clawdbot-ansible.git
cd clawdbot-ansible

# 3. 安装 Ansible 集合
ansible-galaxy collection install -r requirements.yml

# 4. 运行 playbook
./run-playbook.sh

# 或直接运行（然后手动执行 /tmp/clawdbot-setup.sh）
# ansible-playbook playbook.yml --ask-become-pass
``````
## 更新 Clawdbot

Ansible 安装程序为手动更新设置好了 Clawdbot。有关标准更新流程，请参阅 [更新](/install/updating)。

要重新运行 Ansible playbook（例如，进行配置更改）：```bash
cd clawdbot-ansible
./run-playbook.sh
```
注意：此操作是幂等的，可以多次安全运行。

## 故障排除

### 防火墙阻止了我的连接

如果您被锁定在外：
- 确保您首先可以通过 Tailscale VPN 访问
- SSH 访问（端口 22）始终被允许
- 网关是**仅**通过 Tailscale 可访问的，这是设计使然
bash
# 检查日志
sudo journalctl -u clawdbot -n 100

# 验证权限
sudo ls -la /opt/clawdbot

# 手动启动测试
sudo -i -u clawdbot
cd ~/clawdbot
pnpm start
``````
### Docker沙盒问题```bash
# Verify Docker is running
sudo systemctl status docker

# Check sandbox image
sudo docker images | grep clawdbot-sandbox

# Build sandbox image if missing
cd /opt/clawdbot/clawdbot
sudo -u clawdbot ./scripts/sandbox-setup.sh
```
### 提供者登录失败

确保你以 `clawdbot` 用户身份运行：
bash
sudo -i -u clawdbot
clawdbot channels login```
## 高级配置

有关详细的安全架构和故障排除信息：
- [安全架构](https://github.com/clawdbot/clawdbot-ansible/blob/main/docs/security.md)
- [技术细节](https://github.com/clawdbot/clawdbot-ansible/blob/main/docs/architecture.md)
- [故障排除指南](https://github.com/clawdbot/clawdbot-ansible/blob/main/docs/troubleshooting.md)

## 相关内容

- [clawdbot-ansible](https://github.com/clawdbot/clawdbot-ansible) — 完整的部署指南
- [Docker](/install/docker) — 基于容器的网关设置
- [沙箱隔离](/gateway/sandboxing) — 代理沙箱配置
- [多代理沙箱与工具](/multi-agent-sandbox-tools) — 每个代理的隔离配置