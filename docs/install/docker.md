---
summary: "Optional Docker-based setup and onboarding for Clawdbot"
read_when:
  - You want a containerized gateway instead of local installs
  - You are validating the Docker flow
---

# Docker（可选）

Docker 是 **可选的**。只有当你需要容器化的网关或验证 Docker 流程时才使用它。

## Docker 适合我吗？

- **是的**：你想要一个隔离的、可丢弃的网关环境，或者在没有本地安装的主机上运行 Clawdbot。
- **不是**：你是在自己的机器上运行，并且只是想要最快的开发循环。请改用正常的安装流程。
- **沙箱说明**：代理沙箱也使用 Docker，但 **不需要** 网关完全运行在 Docker 中。请参阅 [沙箱](/gateway/sandboxing)。

本指南涵盖：
- 容器化的网关（完整的 Clawdbot 在 Docker 中）
- 每个会话的代理沙箱（主机网关 + Docker 隔离的代理工具）

沙箱详细信息：[沙箱](/gateway/sandboxing)

## 要求

- Docker Desktop（或 Docker Engine）+ Docker Compose v2
- 足够的磁盘空间用于镜像 + 日志

## 容器化网关（Docker Compose）

### 快速入门（推荐）

从仓库根目录开始：
bash
./docker-setup.sh
``````
这个脚本：
- 构建网关镜像
- 运行设置向导
- 打印可选的供应商设置提示
- 通过 Docker Compose 启动网关
- 生成网关令牌并将其写入 `.env` 文件

可选的环境变量：
- `CLAWDBOT_DOCKER_APT_PACKAGES` —— 在构建过程中安装额外的 apt 包
- `CLAWDBOT_EXTRA_MOUNTS` —— 添加额外的主机绑定挂载
- `CLAWDBOT_HOME_VOLUME` —— 在命名卷中持久化 `/home/node`

完成后：
- 在浏览器中打开 `http://127.0.0.1:18789/`。
- 将令牌粘贴到控制界面（设置 → 令牌）。

它会在主机上写入配置文件：
- `~/.clawdbot/`
- `~/clawd`

在 VPS 上运行？请参阅 [Hetzner（Docker VPS）](/platforms/hetzner)。```bash
docker build -t clawdbot:local -f Dockerfile .
docker compose run --rm clawdbot-cli onboard
docker compose up -d clawdbot-gateway
```
### 额外挂载（可选）

如果您希望将额外的主机目录挂载到容器中，请在运行 `docker-setup.sh` 之前设置 `CLAWDBOT_EXTRA_MOUNTS`。此变量接受一个以逗号分隔的 Docker 绑定挂载列表，并通过生成 `docker-compose.extra.yml` 文件将它们应用到 `clawdbot-gateway` 和 `clawdbot-cli` 上。

示例：
bash
export CLAWDBOT_EXTRA_MOUNTS="$HOME/.codex:/home/node/.codex:ro,$HOME/github:/home/node/github:rw"
./docker-setup.sh
``````
注意事项：
- 路径必须在 macOS/Windows 上与 Docker Desktop 共享。
- 如果你修改了 `CLAWDBOT_EXTRA_MOUNTS`，请重新运行 `docker-setup.sh` 以重新生成额外的 compose 文件。
- `docker-compose.extra.yml` 是自动生成的文件。不要手动编辑它。

### 持久化整个容器主目录（可选）

如果你希望 `/home/node` 在容器重建后仍然保留，请通过 `CLAWDBOT_HOME_VOLUME` 设置一个命名卷。这将创建一个 Docker 卷，并将其挂载到 `/home/node`，同时保留标准的配置/工作区绑定挂载。此处使用命名卷（而非绑定路径）；如需绑定挂载，请使用 `CLAWDBOT_EXTRA_MOUNTS`。

示例：```bash
export CLAWDBOT_HOME_VOLUME="clawdbot_home"
./docker-setup.sh
```
你可以将其与额外的挂载结合使用：
bash  
export CLAWDBOT_HOME_VOLUME="clawdbot_home"  
export CLAWDBOT_EXTRA_MOUNTS="$HOME/.codex:/home/node/.codex:ro,$HOME/github:/home/node/github:rw"  
./docker-setup.sh```
注意事项：
- 如果你更改了 `CLAWDBOT_HOME_VOLUME`，请重新运行 `docker-setup.sh` 以重新生成额外的 compose 文件。
- 命名的卷会一直存在，直到使用 `docker volume rm <name>` 命令将其删除。

### 安装额外的 apt 包（可选）

如果你需要在镜像中安装系统包（例如构建工具或媒体库），请在运行 `docker-setup.sh` 之前设置 `CLAWDBOT_DOCKER_APT_PACKAGES`。
这会在镜像构建过程中安装这些包，因此即使删除容器，它们也会保留。

示例：```bash
export CLAWDBOT_DOCKER_APT_PACKAGES="ffmpeg build-essential"
./docker-setup.sh
```
### 注意事项：
- 这接受一个由空格分隔的 apt 包名称列表。
- 如果你修改了 `CLAWDBOT_DOCKER_APT_PACKAGES`，请重新运行 `docker-setup.sh` 以重新构建镜像。

### 更快的重新构建（推荐）

为了加快重新构建的速度，请将你的 Dockerfile 按依赖层进行排序，以便利用缓存。
这样可以避免在 lockfiles 没有变化的情况下重新运行 `pnpm install`。
dockerfile
FROM node:22-bookworm

# 安装 Bun（构建脚本所需）
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN corepack enable

WORKDIR /app

# 缓存依赖项，除非 package 元数据发生变化
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm ui:install
RUN pnpm ui:build

ENV NODE_ENV=production

CMD ["node","dist/index.js"]
``````
### 通道设置（可选）

使用 CLI 容器来配置通道，如需的话，然后重启网关。

WhatsApp（二维码）：```bash
docker compose run --rm clawdbot-cli channels login
```
Telegram（机器人令牌）：
bash
docker compose run --rm clawdbot-cli channels add --channel telegram --token "<token>"
``````
Discord（机器人令牌）：```bash
docker compose run --rm clawdbot-cli channels add --channel discord --token "<token>"
```
"文档：[WhatsApp](/channels/whatsapp), [Telegram](/channels/telegram), [Discord](/channels/discord)

### 健康检查
```bash
docker compose exec clawdbot-gateway node dist/index.js health --token "$CLAWDBOT_GATEWAY_TOKEN"
``````
### 端到端烟雾测试（Docker）```bash
scripts/e2e/onboard-docker.sh
```
### QR 导入烟雾测试（Docker）
bash
pnpm test:docker:qr
``````
### 注意事项

- 网关默认为容器使用设置为 `lan`。
- 网关容器是会话的权威来源（`~/.clawdbot/agents/<agentId>/sessions/`）。

## 代理沙盒（主机网关 + Docker 工具）

深入解析：[沙盒化](/gateway/sandboxing)

### 它的作用

当启用 `agents.defaults.sandbox` 时，**非主会话** 会在 Docker 容器中运行工具。网关仍然在你的主机上，但工具执行是隔离的：
- 作用域：默认为 `"agent"`（每个代理一个容器 + 工作区）
- 作用域：`"session"` 用于每个会话的隔离
- 每个作用域的工作区文件夹挂载在 `/workspace`
- 可选的代理工作区访问权限（`agents.defaults.sandbox.workspaceAccess`）
- 允许/拒绝工具策略（拒绝优先）
- 入站媒体会被复制到当前沙盒工作区（`media/inbound/*`），这样工具可以读取它（如果设置 `workspaceAccess: "rw"`，则会存储在代理工作区）

警告：`scope: "shared"` 会禁用跨会话隔离。所有会话共享一个容器和一个工作区。

### 每个代理的沙盒配置（多代理）

如果你使用多代理路由，每个代理可以覆盖沙盒和工具设置：
`agents.list[].sandbox` 和 `agents.list[].tools`（以及 `agents.list[].tools.sandbox.tools`）。这允许你在同一个网关中运行不同访问级别的配置：
- 完全访问（个人代理）
- 只读工具 + 只读工作区（家庭/工作代理）
- 无文件系统/Shell 工具（公共代理）

有关示例、优先级和故障排除，请参阅 [多代理沙盒与工具](/multi-agent-sandbox-tools)。

### 默认行为

- 镜像：`clawdbot-sandbox:bookworm-slim`
- 每个代理一个容器
- 代理工作区访问：`workspaceAccess: "none"`（默认）使用 `~/.clawdbot/sandboxes`
  - `"ro"` 将沙盒工作区保留在 `/workspace`，并将代理工作区以只读方式挂载在 `/agent`（禁用 `write`/`edit`/`apply_patch`）
  - `"rw"` 将代理工作区以读写方式挂载在 `/workspace`
- 自动清理：空闲时间超过 24 小时或容器年龄超过 7 天
- 网络：默认为 `none`（如需出站网络，请明确选择）
- 默认允许：`exec`, `process`, `read`, `write`, `edit`, `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- 默认拒绝：`browser`, `canvas`, `nodes`, `cron`, `discord`, `gateway`

### 启用沙盒化

如果你计划在 `setupCommand` 中安装包，请注意：
- 默认 `docker.network` 是 `"none"`（无出站网络）。
- `readOnlyRoot: true` 会阻止包的安装。
- `user` 必须为 root 才能使用 `apt-get`（可以省略 `user` 或设置 `user: "0:0"`）。
Clawdbot 在 `setupCommand`（或 Docker 配置）更改时会自动重新创建容器，除非该容器 **最近被使用过**（约 5 分钟内）。热容器会记录一条警告信息，显示具体的 `clawdbot sandbox recreate ...` 命令。```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // off | non-main | all
        scope: "agent", // session | agent | shared (agent is default)
        workspaceAccess: "none", // none | ro | rw
        workspaceRoot: "~/.clawdbot/sandboxes",
        docker: {
          image: "clawdbot-sandbox:bookworm-slim",
          workdir: "/workspace",
          readOnlyRoot: true,
          tmpfs: ["/tmp", "/var/tmp", "/run"],
          network: "none",
          user: "1000:1000",
          capDrop: ["ALL"],
          env: { LANG: "C.UTF-8" },
          setupCommand: "apt-get update && apt-get install -y git curl jq",
          pidsLimit: 256,
          memory: "1g",
          memorySwap: "2g",
          cpus: 1,
          ulimits: {
            nofile: { soft: 1024, hard: 2048 },
            nproc: 256
          },
          seccompProfile: "/path/to/seccomp.json",
          apparmorProfile: "clawdbot-sandbox",
          dns: ["1.1.1.1", "8.8.8.8"],
          extraHosts: ["internal.service:10.0.0.5"]
        },
        prune: {
          idleHours: 24, // 0 disables idle pruning
          maxAgeDays: 7  // 0 disables max-age pruning
        }
      }
    }
  },
  tools: {
    sandbox: {
      tools: {
        allow: ["exec", "process", "read", "write", "edit", "sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
        deny: ["browser", "canvas", "nodes", "cron", "discord", "gateway"]
      }
    }
  }
}
```
"Hardening knobs 位于 `agents.defaults.sandbox.docker` 下：
`network`、`user`、`pidsLimit`、`memory`、`memorySwap`、`cpus`、`ulimits`、
`seccompProfile`、`apparmorProfile`、`dns`、`extraHosts`。

多代理配置：可以通过 `agents.list[].sandbox.{docker,browser,prune}.*` 覆盖每个代理的 `agents.defaults.sandbox.{docker,browser,prune}.*` 设置
（当 `agents.defaults.sandbox.scope` / `agents.list[].sandbox.scope` 为 `"shared"` 时将被忽略）。

### 构建默认沙箱镜像
bash
scripts/sandbox-setup.sh
```"```
这将使用 `Dockerfile.sandbox` 构建 `clawdbot-sandbox:bookworm-slim` 镜像。

### 可选的沙箱通用镜像
如果您需要一个包含常见构建工具（如 Node、Go、Rust 等）的沙箱镜像，请构建通用镜像：```bash
scripts/sandbox-common-setup.sh
```
这将构建 `clawdbot-sandbox-common:bookworm-slim`。要使用它，请执行以下操作：
json5
{
  agents: { defaults: { sandbox: { docker: { image: "clawdbot-sandbox-common:bookworm-slim" } } } }
}
``````
### 沙盒浏览器镜像

要在沙盒中运行浏览器工具，请构建浏览器镜像：```bash
scripts/sandbox-browser-setup.sh
```
这将使用 `Dockerfile.sandbox-browser` 构建 `clawdbot-sandbox-browser:bookworm-slim` 镜像。该容器运行带有 CDP 功能的 Chromium，并可选地包含一个 noVNC 观察器（通过 Xvfb 实现有头模式）。

注意事项：
- 有头模式（Xvfb）比无头模式减少机器人阻塞。
- 仍可通过设置 `agents.defaults.sandbox.browser.headless=true` 使用无头模式。
- 不需要完整的桌面环境（如 GNOME）；Xvfb 提供了显示功能。

使用配置：
json5
{
  agents: {
    defaults: {
      sandbox: {
        browser: { enabled: true }
      }
    }
  }
}
``````
自定义浏览器图像：```json5
{
  agents: {
    defaults: {
      sandbox: { browser: { image: "my-clawdbot-browser" } }
    }
  }
}
```
当启用时，代理将收到：
- 一个沙盒浏览器控制URL（用于 `browser` 工具）
- 一个 noVNC URL（如果启用且 headless=false）

注意：如果你使用工具的允许列表，请添加 `browser`（并从拒绝列表中移除），否则该工具将被阻止。
修剪规则（`agents.defaults.sandbox.prune`）同样适用于浏览器容器。
bash
docker build -t my-clawdbot-sbx -f Dockerfile.sandbox .
``````
```md
{
  agents: {
    defaults: {
      sandbox: { docker: { image: "my-clawdbot-sbx" } }
    }
  }
}```
### 工具策略（允许/拒绝）

- `deny` 优先于 `allow`。
- 如果 `allow` 为空：则所有工具（除了被拒绝的）都是可用的。
- 如果 `allow` 非空：只有在 `allow` 中列出的工具可用（排除 `deny` 中的）。

### 剪枝策略

两个控制参数：
- `prune.idleHours`：移除在 X 小时内未使用的容器（0 = 禁用）
- `prune.maxAgeDays`：移除超过 X 天的容器（0 = 禁用）

示例：
- 保留活跃会话但限制生命周期：
  `idleHours: 24`, `maxAgeDays: 7`
- 不进行剪枝：
  `idleHours: 0`, `maxAgeDays: 0`

### 安全注意事项

- 硬性隔离仅适用于 **工具**（exec/read/write/edit/apply_patch）。
- 仅限主机的工具如 browser/camera/canvas 默认被阻止。
- 在沙箱中允许 `browser` 会 **破坏隔离性**（浏览器在主机上运行）。

## 故障排除

- 镜像缺失：使用 [`scripts/sandbox-setup.sh`](https://github.com/clawdbot/clawdbot/blob/main/scripts/sandbox-setup.sh) 构建，或设置 `agents.defaults.sandbox.docker.image`。
- 容器未运行：它将在每次会话需要时自动创建。
- 沙箱中的权限错误：设置 `docker.user` 为与你挂载的工作区所有权匹配的 UID:GID（或使用 `chown` 修改工作区文件夹）。
- 自定义工具未找到：Clawdbot 使用 `sh -lc`（登录 shell）运行命令，这会加载 `/etc/profile` 并可能重置 PATH。可以设置 `docker.env.PATH` 来在路径前添加你的自定义工具路径（例如 `/custom/bin:/usr/local/share/npm-global/bin`），或在 Dockerfile 中添加脚本到 `/etc/profile.d/` 目录下。