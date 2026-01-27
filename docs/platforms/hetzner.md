---
summary: "Run Clawdbot Gateway 24/7 on a cheap Hetzner VPS (Docker) with durable state and baked-in binaries"
read_when:
  - You want Clawdbot running 24/7 on a cloud VPS (not your laptop)
  - You want a production-grade, always-on Gateway on your own VPS
  - You want full control over persistence, binaries, and restart behavior
  - You are running Clawdbot in Docker on Hetzner or a similar provider
---

# Clawdbot 在 Hetzner 上（Docker，生产 VPS 指南）

## 目标
使用 Docker 在 Hetzner VPS 上运行一个持久化的 Clawdbot 网关，具备持久化状态、内置二进制文件以及安全的重启行为。

如果你想“以约 $5 的费用让 Clawdbot 24/7 运行”，这就是最简单可靠的方式。
Hetzner 的价格可能会变化；选择最小的 Debian/Ubuntu VPS，并在遇到内存不足时进行扩容。

## 我们在做什么（简单解释）

- 租用一台小型 Linux 服务器（Hetzner VPS）
- 安装 Docker（隔离的应用运行环境）
- 在 Docker 中启动 Clawdbot 网关
- 在主机上持久化 `~/.clawdbot` + `~/clawd`（即使重启或重建也不会丢失）
- 通过 SSH 隧道从你的笔记本电脑访问控制界面

网关可以通过以下方式访问：
- 从你的笔记本电脑通过 SSH 端口转发
- 如果你自己管理防火墙和令牌，也可以直接暴露端口

本指南假设你在 Hetzner 上使用的是 Ubuntu 或 Debian。  
如果你使用的是其他 Linux VPS，请相应地映射软件包。  
关于通用的 Docker 流程，请参阅 [Docker](/install/docker)。

---

## 快速路径（有经验的操作人员）

1) 预置 Hetzner VPS  
2) 安装 Docker  
3) 克隆 Clawdbot 仓库  
4) 创建持久化的主机目录  
5) 配置 `.env` 和 `docker-compose.yml`  
6) 将所需的二进制文件打包到镜像中  
7) `docker compose up -d`  
8) 验证持久化和网关访问

---

## 所需内容

- 带 root 权限的 Hetzner VPS  
- 从你的笔记本电脑 SSH 访问  
- 对 SSH 和复制粘贴的基本熟悉  
- 约 20 分钟  
- Docker 和 Docker Compose  
- 模型认证凭证  
- 可选的提供者凭证  
  - WhatsApp 的二维码  
  - Telegram 机器人令牌  
  - Gmail OAuth
bash
ssh root@YOUR_VPS_IP
``````
本指南假设 VPS 是有状态的。
不要将其视为可丢弃的基础设施。

---

## 2）安装 Docker（在 VPS 上）```bash
apt-get update
apt-get install -y git curl ca-certificates
curl -fsSL https://get.docker.com | sh
```
验证：
bash
docker --version
docker compose version
``````
## 3) 克隆 Clawdbot 仓库```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
```
本指南假设您将构建一个自定义镜像以确保二进制文件的持久性。

---

## 4）创建持久化的主机目录

Docker 容器是临时的。  
所有需要长期保存的状态都必须存储在主机上。
bash
mkdir -p /root/.clawdbot
mkdir -p /root/clawd

# 将所有权设置为容器用户（uid 1000）：
chown -R 1000:1000 /root/.clawdbot
chown -R 1000:1000 /root/clawd
``````
## 5）配置环境变量

在仓库根目录下创建 `.env` 文件。```bash
CLAWDBOT_IMAGE=clawdbot:latest
CLAWDBOT_GATEWAY_TOKEN=change-me-now
CLAWDBOT_GATEWAY_BIND=lan
CLAWDBOT_GATEWAY_PORT=18789

CLAWDBOT_CONFIG_DIR=/root/.clawdbot
CLAWDBOT_WORKSPACE_DIR=/root/clawd

GOG_KEYRING_PASSWORD=change-me-now
XDG_CONFIG_HOME=/home/node/.clawdbot
```
生成强密钥：
openssl rand -hex 32```
**不要提交此文件。**

---

## 6) Docker Compose 配置

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
      # Recommended: keep the Gateway loopback-only on the VPS; access via SSH tunnel.
      # To expose it publicly, remove the `127.0.0.1:` prefix and firewall accordingly.
      - "127.0.0.1:${CLAWDBOT_GATEWAY_PORT}:18789"

      # Optional: only if you run iOS/Android nodes against this VPS and need Canvas host.
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

## 7）将所需的二进制文件打包到镜像中（关键）

在运行中的容器中安装二进制文件是一个陷阱。  
任何在运行时安装的内容在重启后都会丢失。

所有技能所需的外部二进制文件必须在镜像构建时安装。

以下示例仅展示了三个常见的二进制文件：  
- `gog` 用于访问 Gmail  
- `goplaces` 用于访问 Google Places  
- `wacli` 用于访问 WhatsApp  

这些只是示例，并非完整列表。  
你可以根据相同的模式安装尽可能多的二进制文件。

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

# 在下面添加更多二进制文件，使用相同的模式

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
## 8) 构建与启动```bash
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
## 9) 验证网关```bash
docker compose logs -f clawdbot-gateway
```
"成功：

[gateway] 正在监听 ws://0.0.0.0:18789
"```
从你的笔记本电脑：```bash
ssh -N -L 18789:127.0.0.1:18789 root@YOUR_VPS_IP
```
打开：

`http://127.0.0.1:18789/`

粘贴你的网关令牌。

---

## 哪些组件需要持久化（真相来源）

Clawdbot 在 Docker 中运行，但 Docker 并不是真相来源。
所有需要长期保存的状态必须在重启、重建和重新启动后仍然存在。

| 组件 | 位置 | 持久化机制 | 说明 |
|---|---|---|---|
| 网关配置 | `/home/node/.clawdbot/` | 主机卷挂载 | 包括 `clawdbot.json`，令牌 |
| 模型认证配置文件 | `/home/node/.clawdbot/` | 主机卷挂载 | OAuth 令牌，API 密钥 |
| 技能配置 | `/home/node/.clawdbot/skills/` | 主机卷挂载 | 技能级别的状态 |
| 代理工作区 | `/home/node/clawd/` | 主机卷挂载 | 代码和代理生成的文件 |
| WhatsApp 会话 | `/home/node/.clawdbot/` | 主机卷挂载 | 保留二维码登录状态 |
| Gmail 密钥环 | `/home/node/.clawdbot/` | 主机卷挂载 + 密码 | 需要 `GOG_KEYRING_PASSWORD` |
| 外部二进制文件 | `/usr/local/bin/` | Docker 镜像 | 必须在构建时打包进去 |
| Node 运行时 | 容器文件系统 | Docker 镜像 | 每次镜像构建时都会重新构建 |
| OS 软件包 | 容器文件系统 | Docker 镜像 | 不要在运行时安装 |
| Docker 容器 | 临时 | 可重启 | 可以安全地删除 |