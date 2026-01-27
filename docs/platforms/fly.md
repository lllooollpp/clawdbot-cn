---
title: Fly.io
description: Deploy Clawdbot on Fly.io
---

# 在 Fly.io 上部署

**目标：** 在 [Fly.io](https://fly.io) 机器上运行 Clawdbot 网关，并具备持久化存储、自动 HTTPS 和 Discord/频道访问功能。

## 所需内容

- 安装 [flyctl CLI](https://fly.io/docs/hands-on/install-flyctl/)
- Fly.io 账户（免费层级即可）
- 模型认证：Anthropic API 密钥（或其他提供方的密钥）
- 频道凭证：Discord 机器人令牌、Telegram 令牌等

## 初学者快速路径

1. 克隆仓库 → 自定义 `fly.toml`
2. 创建应用 + 卷 → 设置密钥
3. 使用 `fly deploy` 进行部署
4. 通过 SSH 创建配置或使用控制台界面
bash
# 克隆仓库
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot

# 创建一个新的 Fly 应用（选择一个你自己的名称）
fly apps create my-clawdbot

# 创建一个持久化卷（1GB 通常足够）
fly volumes create clawdbot_data --size 1 --region iad
``````
**提示:** 选择一个靠近你的区域。常见选项：`lhr`（伦敦）、`iad`（弗吉尼亚）、`sjc`（圣何塞）。

## 2）配置 fly.toml

编辑 `fly.toml` 以匹配你的应用名称和需求：```toml
app = "my-clawdbot"  # Your app name
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  CLAWDBOT_PREFER_PNPM = "1"
  CLAWDBOT_STATE_DIR = "/data"
  NODE_OPTIONS = "--max-old-space-size=1536"

[processes]
  app = "node dist/index.js gateway --allow-unconfigured --port 3000 --bind lan"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  size = "shared-cpu-2x"
  memory = "2048mb"

[mounts]
  source = "clawdbot_data"
  destination = "/data"
```
**关键设置：**

| 设置 | 原因 |
|---------|-----|
| `--bind lan` | 绑定到 `0.0.0.0`，以便 Fly 的代理可以访问网关 |
| `--allow-unconfigured` | 不使用配置文件即可启动（稍后你会创建一个） |
| `internal_port = 3000` | 必须与 `--port 3000`（或 `CLAWDBOT_GATEWAY_PORT`）匹配，用于 Fly 健康检查 |
| `memory = "2048mb"` | 512MB 太小；建议使用 2GB |
| `CLAWDBOT_STATE_DIR = "/data"` | 将状态保存在卷中 |
bash
# 必需：网关令牌（用于非回环绑定）
fly secrets set CLAWDBOT_GATEWAY_TOKEN=$(openssl rand -hex 32)

# 模型提供者 API 密钥
fly secrets set ANTHROPIC_API_KEY=sk-ant-...

# 可选：其他提供者
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set GOOGLE_API_KEY=...

# 频道令牌
fly secrets set DISCORD_BOT_TOKEN=MTQ...
``````
**说明：**
- 非回环绑定（`--bind lan`）需要 `CLAWDBOT_GATEWAY_TOKEN` 以确保安全。
- 请将这些令牌视为密码一样对待。

## 4）部署```bash
fly deploy
```
首次部署将构建 Docker 镜像（大约 2-3 分钟）。后续部署会更快。

部署完成后，请进行验证：
bash
fly status
fly logs
``````
你应该看到：```
[gateway] listening on ws://0.0.0.0:3000 (PID xxx)
[discord] logged in to discord as xxx
```
## 5) 创建配置文件

通过 SSH 登录到该机器以创建合适的配置文件：
bash
fly ssh console
``````
创建配置目录和文件：```bash
mkdir -p /data
cat > /data/clawdbot.json << 'EOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-opus-4-5",
        "fallbacks": ["anthropic/claude-sonnet-4-5", "openai/gpt-4o"]
      },
      "maxConcurrent": 4
    },
    "list": [
      {
        "id": "main",
        "default": true
      }
    ]
  },
  "auth": {
    "profiles": {
      "anthropic:default": { "mode": "token", "provider": "anthropic" },
      "openai:default": { "mode": "token", "provider": "openai" }
    }
  },
  "bindings": [
    {
      "agentId": "main",
      "match": { "channel": "discord" }
    }
  ],
  "channels": {
    "discord": {
      "enabled": true,
      "groupPolicy": "allowlist",
      "guilds": {
        "YOUR_GUILD_ID": {
          "channels": { "general": { "allow": true } },
          "requireMention": false
        }
      }
    }
  },
  "gateway": {
    "mode": "local",
    "bind": "auto"
  },
  "meta": {
    "lastTouchedVersion": "2026.1.25"
  }
}
EOF
```
**注意：** 当 `CLAWDBOT_STATE_DIR=/data` 时，配置文件路径为 `/data/clawdbot.json`。

**注意：** Discord 机器人令牌可以通过以下两种方式之一获取：
- 环境变量：`DISCORD_BOT_TOKEN`（推荐用于敏感信息）
- 配置文件：`channels.discord.token`

如果使用环境变量，则不需要将令牌添加到配置文件中。网关会自动读取 `DISCORD_BOT_TOKEN`。

重启以应用更改：
bash
exit
fly machine restart <machine-id>
``````
## 6) 访问网关

### 控制 UI

在浏览器中打开：```bash
fly open
```
或访问 `https://my-clawdbot.fly.dev/`

将你的网关令牌（来自 `CLAWDBOT_GATEWAY_TOKEN`）粘贴进来以进行身份验证。

### 日志
bash
fly logs              # 实时日志
fly logs --no-tail    # 最近的日志
``````
### SSH 控制台```bash
fly ssh console
```
## 故障排除

### "应用未在预期地址上监听"

网关绑定到了 `127.0.0.1` 而不是 `0.0.0.0`。

**解决方法:** 在 `fly.toml` 中的进程命令里添加 `--bind lan`。

### 健康检查失败 / 连接被拒绝

Fly 无法通过配置的端口访问网关。

**解决方法:** 确保 `internal_port` 与网关端口匹配（设置 `--port 3000` 或 `CLAWDBOT_GATEWAY_PORT=3000`）。

### 内存不足 / 内存问题

容器不断重启或被终止。表现：`SIGABRT`，`v8::internal::Runtime_AllocateInYoungGeneration`，或无声重启。

**解决方法:** 在 `fly.toml` 中增加内存配置：
toml
[[vm]]
  memory = "2048mb"```
或更新现有机器：```bash
fly machine update <machine-id> --vm-memory 2048 -y
```
**注意：** 512MB 太小了。1GB 可能可以工作，但在负载较高或启用详细日志时可能会导致内存不足（OOM）。**建议使用 2GB。**

### 网关锁定问题

网关启动时出现 "already running" 错误。

当容器重启后，PID 锁定文件仍然保留在卷中时就会发生这种情况。

**解决方法：** 删除锁定文件：
bash
fly ssh console --command "rm -f /data/gateway.*.lock"
fly machine restart <machine-id>
``````
锁文件位于 `/data/gateway.*.lock`（不在子目录中）。

### 配置未被读取

如果使用 `--allow-unconfigured`，网关会创建一个最小配置。您在 `/data/clawdbot.json` 的自定义配置应在重启后被读取。

验证配置是否存在：```bash
fly ssh console --command "cat /data/clawdbot.json"
```
### 通过 SSH 编写配置文件

`fly ssh console -C` 命令不支持 shell 重定向。要编写配置文件：
bash
# 使用 echo + tee（从本地到远程的管道）
echo '{"your":"config"}' | fly ssh console -C "tee /data/clawdbot.json"

# 或者使用 sftp
fly sftp shell
> put /local/path/config.json /data/clawdbot.json
``````
注意：如果文件已存在，`fly sftp` 可能会失败。请先删除文件：```bash
fly ssh console --command "rm /data/clawdbot.json"
```
### 状态未保存

如果在重启后丢失了凭据或会话，说明状态目录正在写入容器文件系统。

**解决方法：** 确保在 `fly.toml` 中设置了 `CLAWDBOT_STATE_DIR=/data`，然后重新部署。
bash
# 获取最新更改
git pull

# 重新部署
fly deploy

# 检查健康状态
fly status
fly logs
``````
### 更新机器启动命令

如果您需要在不进行完整重新部署的情况下更改启动命令：```bash
# Get machine ID
fly machines list

# Update command
fly machine update <machine-id> --command "node dist/index.js gateway --port 3000 --bind lan" -y

# Or with memory increase
fly machine update <machine-id> --vm-memory 2048 --command "node dist/index.js gateway --port 3000 --bind lan" -y
```
**注意:** 在执行 `fly deploy` 后，机器命令可能会被重置为 `fly.toml` 中的内容。如果你进行了手动修改，请在部署后重新应用这些修改。

## 注意事项

- Fly.io 使用的是 **x86 架构**（不是 ARM）
- Dockerfile 兼容这两种架构
- 对于 WhatsApp/Telegram 的设置，请使用 `fly ssh console`
- 持久化数据存储在 `/data` 目录下的卷中
- Signal 需要 Java + signal-cli；请使用自定义镜像，并确保内存至少为 2GB。

## 成本

使用推荐配置（`shared-cpu-2x`，2GB 内存）：
- 每月约 $10-15，具体取决于使用情况
- 免费套餐包含一定的使用额度

有关详细信息，请查看 [Fly.io 定价页面](https://fly.io/docs/about/pricing/)。