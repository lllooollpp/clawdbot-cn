---
title: Sandbox CLI
summary: "Manage sandbox containers and inspect effective sandbox policy"
read_when: "You are managing sandbox containers or debugging sandbox/tool-policy behavior."
status: active
---

# Sandbox CLI

用于管理基于 Docker 的沙盒容器，以实现隔离的代理执行。

## 概述

Clawdbot 可以在隔离的 Docker 容器中运行代理，以提高安全性。`sandbox` 命令帮助您管理这些容器，尤其是在更新或配置更改之后。

## 命令

### `clawdbot sandbox explain`

检查 **实际生效** 的沙盒模式/作用域/工作区访问权限、沙盒工具策略以及提升权限的门（包含 fix-it 配置键路径）。
bash
clawdbot sandbox explain
clawdbot sandbox explain --session agent:main:main
clawdbot sandbox explain --agent work
clawdbot sandbox explain --json``````
### `clawdbot sandbox list`

列出所有沙箱容器及其状态和配置。```bash
clawdbot sandbox list
clawdbot sandbox list --browser  # List only browser containers
clawdbot sandbox list --json     # JSON output
```
**输出内容包括：**
- 容器名称和状态（运行中/已停止）
- Docker 镜像以及是否与配置匹配
- 年龄（自创建以来的时间）
- 空闲时间（自上次使用以来的时间）
- 关联的会话/代理

### `clawdbot sandbox recreate`

移除沙盒容器以强制使用更新后的镜像/配置重新创建。
bash
clawdbot sandbox recreate --all                # 重新创建所有容器
clawdbot sandbox recreate --session main       # 指定会话
clawdbot sandbox recreate --agent mybot        # 指定代理
clawdbot sandbox recreate --browser            # 仅重新创建浏览器容器
clawdbot sandbox recreate --all --force        # 跳过确认``````
**选项：**
- `--all`: 重新创建所有沙盒容器
- `--session <key>`: 为特定会话重新创建容器
- `--agent <id>`: 为特定代理重新创建容器
- `--browser`: 仅重新创建浏览器容器
- `--force`: 跳过确认提示

**重要提示:** 当代理下次被使用时，容器会自动重新创建。

## 使用场景

### 在更新 Docker 镜像之后```bash
# Pull new image
docker pull clawdbot-sandbox:latest
docker tag clawdbot-sandbox:latest clawdbot-sandbox:bookworm-slim

# Update config to use new image
# Edit config: agents.defaults.sandbox.docker.image (or agents.list[].sandbox.docker.image)

# Recreate containers
clawdbot sandbox recreate --all
```
### 更改沙箱配置后
# 编辑配置：agents.defaults.sandbox.*（或 agents.list[].sandbox.*）

# 重新创建以应用新配置
clawdbot sandbox recreate --all


### 更改 setupCommand 之后
```bash
clawdbot sandbox recreate --all
# 或者仅重新创建一个代理：
clawdbot sandbox recreate --agent family
``````
### 仅针对特定代理
# 仅重新创建一个代理的容器
clawdbot sandbox recreate --agent alfred```
## 为什么需要这个？

**问题：** 当你更新沙盒 Docker 镜像或配置时：
- 现有的容器会继续使用旧的设置运行
- 容器只有在不活动 24 小时后才会被清理
- 常用的代理会无限期地保持旧容器运行

**解决方案：** 使用 `clawdbot sandbox recreate` 强制删除旧容器。当下次需要时，它们将自动使用当前设置重新创建。

提示：比起手动使用 `docker rm`，优先使用 `clawdbot sandbox recreate`。它会使用网关的容器命名规则，避免在作用域/会话密钥变化时出现不匹配的问题。```jsonc
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "all",                    // off, non-main, all
        "scope": "agent",                 // session, agent, shared
        "docker": {
          "image": "clawdbot-sandbox:bookworm-slim",
          "containerPrefix": "clawdbot-sbx-"
          // ... more Docker options
        },
        "prune": {
          "idleHours": 24,               // Auto-prune after 24h idle
          "maxAgeDays": 7                // Auto-prune after 7 days
        }
      }
    }
  }
}
```
## 参见

- [沙盒文档](/gateway/sandboxing)
- [代理配置](/concepts/agent-workspace)
- [Doctor 命令](/gateway/doctor) - 检查沙盒设置