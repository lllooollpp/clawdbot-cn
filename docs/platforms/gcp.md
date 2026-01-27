---
summary: "Run Clawdbot Gateway 24/7 on a GCP Compute Engine VM (Docker) with durable state"
read_when:
  - You want Clawdbot running 24/7 on GCP
  - You want a production-grade, always-on Gateway on your own VM
  - You want full control over persistence, binaries, and restart behavior
---

# Clawdbot 在 GCP Compute Engine 上运行（Docker，生产 VPS 指南）

## 目标

在 GCP Compute Engine 的虚拟机上使用 Docker 运行一个持久化的 Clawdbot 网关，具备持久化状态、内置二进制文件以及安全的重启行为。

如果你想以约 $5-12/月的价格实现 Clawdbot 24/7 运行，这是一个在 Google Cloud 上可靠的设置。
价格会根据机器类型和区域有所不同；选择适合你工作负载的最小虚拟机，并在遇到内存不足（OOM）时进行扩展。

## 我们在做什么（简单解释）

- 创建一个 GCP 项目并启用账单
- 创建一个 Compute Engine 虚拟机
- 安装 Docker（隔离的应用运行环境）
- 在 Docker 中启动 Clawdbot 网关
- 在主机上持久化 `~/.clawdbot` 和 `~/clawd`（在重启/重建后仍然存在）
- 通过 SSH 隧道从你的笔记本电脑访问控制界面

网关可以通过以下方式访问：
- 从你的笔记本电脑通过 SSH 端口转发
- 如果你自己管理防火墙和令牌，也可以直接暴露端口

本指南使用 GCP Compute Engine 上的 Debian。
Ubuntu 也可以使用；请相应地映射软件包。
对于通用的 Docker 流程，请参见 [Docker](/install/docker)。

---

## 快速路径（有经验的操作员）

1) 创建 GCP 项目并启用 Compute Engine API
2) 创建 Compute Engine 虚拟机（e2-small，Debian 12，20GB）
3) 通过 SSH 登录虚拟机
4) 安装 Docker
5) 克隆 Clawdbot 仓库
6) 创建持久化的主机目录
7) 配置 `.env` 和 `docker-compose.yml`
8) 打包所需的二进制文件，构建并启动

---

## 所需条件

- GCP 账户（e2-micro 可享受免费套餐）
- 安装了 gcloud CLI（或使用 Cloud Console）
- 从你的笔记本电脑可以 SSH 访问
- 对 SSH 和复制粘贴有基本的熟悉度
- 约 20-30 分钟
- Docker 和 Docker Compose
- 模型认证凭证
- 可选的提供者凭证
  - WhatsApp 的 QR 码
  - Telegram 机器人令牌
  - Gmail OAuth 凭证
bash
gcloud init
gcloud auth login
``````
**选项 B：Cloud Console**

所有步骤都可以通过网页界面在 https://console.cloud.google.com 完成

---

## 2）创建 GCP 项目

**命令行界面（CLI）：**```bash
gcloud projects create my-clawdbot-project --name="Clawdbot Gateway"
gcloud config set project my-clawdbot-project
```
在 https://console.cloud.google.com/billing 启用账单（需要 Compute Engine）。

启用 Compute Engine API：
bash
gcloud services enable compute.googleapis.com```
**控制台：**

1. 进入 IAM & Admin > 创建项目
2. 命名并创建
3. 为项目启用账单
4. 导航到 APIs & Services > 启用 APIs > 搜索 "Compute Engine API" > 启用

---

## 3) 创建虚拟机

**机器类型：**

| 类型 | 规格 | 成本 | 备注 |
|------|-------|------|-------|
| e2-small | 2 个 vCPU，2GB 内存 | ~$12/月 | 推荐使用 |
| e2-micro | 2 个 vCPU（共享），1GB 内存 | 免费套餐可选 | 在高负载下可能会出现内存不足（OOM） |```bash
gcloud compute instances create clawdbot-gateway \
  --zone=us-central1-a \
  --machine-type=e2-small \
  --boot-disk-size=20GB \
  --image-family=debian-12 \
  --image-project=debian-cloud
```
**控制台：**

1. 进入 Compute Engine > 虚拟机实例 > 创建实例
2. 名称：`clawdbot-gateway`
3. 区域：`us-central1`，区域分区：`us-central1-a`
4. 机器类型：`e2-small`
5. 启动磁盘：Debian 12，20GB
6. 创建

---

## 4) 通过 SSH 登录到虚拟机

**命令行界面：**
bash
gcloud compute ssh clawdbot-gateway --zone=us-central1-a
``````
**控制台：**

点击 Compute Engine 仪表板中你的虚拟机 (VM) 旁边的 "SSH" 按钮。

注意：在创建虚拟机后，SSH 密钥可能需要 1-2 分钟才能传播。如果连接被拒绝，请等待后重试。
---

## 5) 在虚拟机上安装 Docker```bash
sudo apt-get update
sudo apt-get install -y git curl ca-certificates
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```
注销并重新登录以使组更改生效：
bash
exit
``````
然后通过 SSH 重新登录：```bash
gcloud compute ssh clawdbot-gateway --zone=us-central1-a
```
验证：
bash
docker --version
docker compose version
``````
## 6）克隆 Clawdbot 仓库```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
```
本指南假设您将构建一个自定义镜像以确保二进制文件的持久性。

---

## 7）创建持久化的主机目录

Docker 容器是短暂的。
所有需要长期保存的状态都必须存储在主机上。
bash
mkdir -p ~/.clawdbot
mkdir -p ~/clawd
``````
## 8) 配置环境变量

在仓库根目录创建 `.env` 文件。```bash
CLAWDBOT_IMAGE=clawdbot:latest
CLAWDBOT_GATEWAY_TOKEN=change-me-now
CLAWDBOT_GATEWAY_BIND=lan
CLAWDBOT_GATEWAY_PORT=18789

CLAWDBOT_CONFIG_DIR=/home/$USER/.clawdbot
CLAWDBOT_WORKSPACE_DIR=/home/$USER/clawd

GOG_KEYRING_PASSWORD=change-me-now
XDG_CONFIG_HOME=/home/node/.clawdbot
```
生成强密码：
openssl rand -hex 32```
**不要提交此文件。**

---

## 9) Docker Compose 配置

创建或更新 `docker-compose.yml`。```yaml
services:
  clawdbot-gateway:
    image: ${CLAWDBOT_IMAGE}
    build: .
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - HOME=/home/node
      - NODE_ENV=production
      - TERM=xterm-256color
      - CLAWDBOT_GATEWAY_BIND=${CLAWDBOT_GATEWAY_BIND}
      - CLAWDBOT_GATEWAY_PORT=${CLAWDBOT_GATEWAY_PORT}
      - CLAWDBOT_GATEWAY_TOKEN=${CLAWDBOT_GATEWAY_TOKEN}
      - GOG_KEYRING_PASSWORD=${GOG_KEYRING_PASSWORD}
      - XDG_CONFIG_HOME=${XDG_CONFIG_HOME}
      - PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    volumes:
      - ${CLAWDBOT_CONFIG_DIR}:/home/node/.clawdbot
      - ${CLAWDBOT_WORKSPACE_DIR}:/home/node/clawd
    ports:
      # Recommended: keep the Gateway loopback-only on the VM; access via SSH tunnel.
      # To expose it publicly, remove the `127.0.0.1:` prefix and firewall accordingly.
      - "127.0.0.1:${CLAWDBOT_GATEWAY_PORT}:18789"

      # Optional: only if you run iOS/Android nodes against this VM and need Canvas host.
      # If you expose this publicly, read /gateway/security and firewall accordingly.
      # - "18793:18793"
    command:
      [
        "node",
        "dist/index.js",
        "gateway",
        "--bind",
        "${CLAWDBOT_GATEWAY_BIND}",
        "--port",
        "${CLAWDBOT_GATEWAY_PORT}"
      ]
```
---

## 10）将所需的二进制文件打包到镜像中（关键）

在运行中的容器中安装二进制文件是一个陷阱。  
任何在运行时安装的内容在重启后都会丢失。

所有技能所需的外部二进制文件必须在镜像构建时安装。

以下示例仅展示了三个常见的二进制文件：  
- `gog` 用于访问 Gmail  
- `goplaces` 用于访问 Google Places  
- `wacli` 用于访问 WhatsApp  

这些只是示例，并非完整列表。  
你可以根据相同的方式安装所需数量的二进制文件。

如果你以后添加了依赖于其他二进制文件的新技能，你必须：  
1. 更新 Dockerfile  
2. 重新构建镜像  
3. 重启容器  

**示例 Dockerfile**
dockerfile
FROM node:22-bookworm

RUN apt-get update && apt-get install -y socat && rm -rf /var/lib/apt/lists/*

# 示例二进制文件 1：Gmail CLI
RUN curl -L https://github.com/steipete/gog/releases/latest/download/gog_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/gog

# 示例二进制文件 2：Google Places CLI
RUN curl -L https://github.com/steipete/goplaces/releases/latest/download/goplaces_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/goplaces

# 示例二进制文件 3：WhatsApp CLI
RUN curl -L https://github.com/steipete/wacli/releases/latest/download/wacli_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/wacli

# 在下方添加更多二进制文件，使用相同的方式

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY scripts ./scripts

RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm ui:install
RUN pnpm ui:build

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
``````
## 11）构建和启动```bash
docker compose build
docker compose up -d clawdbot-gateway
```
验证二进制文件：
bash
docker compose exec clawdbot-gateway which gog
docker compose exec clawdbot-gateway which goplaces
docker compose exec clawdbot-gateway which wacli
``````
```md
/usr/local/bin/gog
/usr/local/bin/goplaces
/usr/local/bin/wacli```
## 12）验证网关```bash
docker compose logs -f clawdbot-gateway
```
"成功：

[gateway] 在 ws://0.0.0.0:18789 上监听
"```
## 13) 从你的笔记本电脑访问

创建一个 SSH 隧道来转发网关端口：```bash
gcloud compute ssh clawdbot-gateway --zone=us-central1-a -- -L 18789:127.0.0.1:18789
```
在浏览器中打开：

`http://127.0.0.1:18789/`

粘贴你的网关令牌。

---

## 哪些组件在哪里持久化（真相来源）

Clawdbot 在 Docker 中运行，但 Docker 不是真相来源。
所有需要长期保存的状态必须在重启、重建和重启后仍然存在。

| 组件 | 位置 | 持久化机制 | 说明 |
|---|---|---|---|
| 网关配置 | `/home/node/.clawdbot/` | 主机卷挂载 | 包括 `clawdbot.json` 和令牌 |
| 模型认证配置文件 | `/home/node/.clawdbot/` | 主机卷挂载 | OAuth 令牌、API 密钥 |
| 技能配置 | `/home/node/.clawdbot/skills/` | 主机卷挂载 | 技能级别的状态 |
| 代理工作区 | `/home/node/clawd/` | 主机卷挂载 | 代码和代理生成物 |
| WhatsApp 会话 | `/home/node/.clawdbot/` | 主机卷挂载 | 保留二维码登录状态 |
| Gmail 密钥环 | `/home/node/.clawdbot/` | 主机卷挂载 + 密码 | 需要 `GOG_KEYRING_PASSWORD` |
| 外部二进制文件 | `/usr/local/bin/` | Docker 镜像 | 必须在构建时打包进去 |
| Node 运行时 | 容器文件系统 | Docker 镜像 | 每次镜像构建时都会重新构建 |
| OS 包 | 容器文件系统 | Docker 镜像 | 不应在运行时安装 |
| Docker 容器 | 临时 | 可重启 | 可以安全地销毁 |
bash
cd ~/clawdbot
git pull
docker compose build
docker compose up -d
``````
---

## 故障排除

**SSH 连接被拒绝**

在创建虚拟机后，SSH 密钥可能需要 1-2 分钟进行传播。请等待并重试。

**操作系统登录问题**

检查您的操作系统登录配置：```bash
gcloud compute os-login describe-profile
```
确保您的账户拥有所需的 IAM 权限（Compute OS Login 或 Compute OS Admin Login）。

**内存不足（OOM）**

如果使用 e2-micro 实例并遇到 OOM，请升级到 e2-small 或 e2-medium。
bash
# 首先停止虚拟机
gcloud compute instances stop clawdbot-gateway --zone=us-central1-a

# 更改机器类型
gcloud compute instances set-machine-type clawdbot-gateway \
  --zone=us-central1-a \
  --machine-type=e2-small

# 启动虚拟机
gcloud compute instances start clawdbot-gateway --zone=us-central1-a
``````
---

## 服务账户（安全最佳实践）

对于个人使用，您的默认用户账户已经足够。

对于自动化或 CI/CD 流水线，应创建一个专用的服务账户，并赋予最小权限：

1. 创建一个服务账户：   ```bash
   gcloud iam service-accounts create clawdbot-deploy \
     --display-name="Clawdbot Deployment"
   ```
2. 授予计算实例管理员角色（或更细粒度的自定义角色）：
bash
gcloud projects add-iam-policy-binding my-clawdbot-project \
  --member="serviceAccount:clawdbot-deploy@my-clawdbot-project.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"
```   ```
避免将 Owner 角色用于自动化。应使用最小权限原则。

有关 IAM 角色的详细信息，请参见 https://cloud.google.com/iam/docs/understanding-roles。

---

## 后续步骤

- 设置消息通道：[通道](/channels)
- 将本地设备配对为节点：[节点](/nodes)
- 配置网关：[网关配置](/gateway/configuration)