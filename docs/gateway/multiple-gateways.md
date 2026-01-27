---
summary: "Run multiple Clawdbot Gateways on one host (isolation, ports, and profiles)"
read_when:
  - Running more than one Gateway on the same machine
  - You need isolated config/state/ports per Gateway
---

# 多网关（相同主机）

大多数设置应使用一个网关，因为单个网关可以处理多个消息连接和代理。如果你需要更强的隔离或冗余（例如，一个救援机器人），请使用隔离的配置文件/端口运行多个网关。

## 隔离检查清单（必需项）
- `CLAWDBOT_CONFIG_PATH` — 每个实例的配置文件
- `CLAWDBOT_STATE_DIR` — 每个实例的会话、凭证、缓存
- `agents.defaults.workspace` — 每个实例的工作区根目录
- `gateway.port`（或 `--port`）— 每个实例必须唯一
- 衍生端口（浏览器/画布）不得重叠

如果这些配置被共享，你将遇到配置冲突和端口冲突的问题。

## 推荐：配置文件（`--profile`）

配置文件会自动作用域 `CLAWDBOT_STATE_DIR` 和 `CLAWDBOT_CONFIG_PATH`，并为服务名称添加后缀。
bash
# 主要
clawdbot --profile main setup
clawdbot --profile main gateway --port 18789

# 救援
clawdbot --profile rescue setup
clawdbot --profile rescue gateway --port 19001
``````
按配置文件服务：```bash
clawdbot --profile main gateway install
clawdbot --profile rescue gateway install
```
## 救援机器人指南

在同一台主机上运行第二个网关，使用其自己的：
- 配置/资料文件
- 状态目录
- 工作空间
- 基础端口（以及派生端口）

这样可以将救援机器人与主机器人隔离，以便在主机器人不可用时进行调试或应用配置更改。

端口间隔：在基础端口之间至少留出 20 个端口，以确保派生的浏览器/画布/CDP 端口不会发生冲突。

### 如何安装（救援机器人）
bash
# 主机器人（已存在或全新安装，不带 --profile 参数）
# 运行在端口 18789 上，并使用 Chrome CDC/Canvas/... 端口
clawdbot onboard
clawdbot gateway install

# 救援机器人（隔离的配置文件 + 端口）
clawdbot --profile rescue onboard
# 说明：
# - 工作空间名称默认会加上 -rescue 后缀
# - 端口应至少为 18789 + 20 个端口，
#   更好地选择一个完全不同的基础端口，例如 19789，
# - 其余的配置流程与正常情况相同

# 如果在配置过程中未自动安装服务
clawdbot --profile rescue gateway install
``````
## 端口映射（派生）

基础端口 = `gateway.port`（或 `CLAWDBOT_GATEWAY_PORT` / `--port`）。

- `browser.controlUrl` 端口 = 基础端口 + 2
- `canvasHost.port` = 基础端口 + 4
- 浏览器配置文件 CDP 端口会自动分配，范围为 `browser.controlPort + 9` 到 `+ 108`

如果你在配置或环境变量中覆盖了这些端口，必须确保每个实例的端口是唯一的。

## 浏览器/CDP 注意事项（常见错误）

- 千万不要在多个实例中将 `browser.controlUrl` 或 `browser.cdpUrl` 固定为相同的值。
- 每个实例都需要自己的浏览器控制端口和 CDP 端口范围。
- 如果你需要显式的 CDP 端口，请为每个实例设置 `browser.profiles.<name>.cdpPort`。
- 远程 Chrome：使用 `browser.profiles.<name>.cdpUrl`（每个配置文件，每个实例）。

## 手动环境变量示例```bash
CLAWDBOT_CONFIG_PATH=~/.clawdbot/main.json \
CLAWDBOT_STATE_DIR=~/.clawdbot-main \
clawdbot gateway --port 18789

CLAWDBOT_CONFIG_PATH=~/.clawdbot/rescue.json \
CLAWDBOT_STATE_DIR=~/.clawdbot-rescue \
clawdbot gateway --port 19001
```
## 快速检查
clawdbot --profile main status
clawdbot --profile rescue status
clawdbot --profile rescue browser status```
