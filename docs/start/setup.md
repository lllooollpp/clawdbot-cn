---
summary: "Setup guide: keep your Clawdbot setup tailored while staying up-to-date"
read_when:
  - Setting up a new machine
  - You want “latest + greatest” without breaking your personal setup
---

# 设置

最后更新时间：2026-01-01

## TL;DR
- **在仓库外定制：** `~/clawd`（工作区） + `~/.clawdbot/clawdbot.json`（配置文件）。
- **稳定工作流：** 安装 macOS 应用程序；让它运行内置的 Gateway。
- **前沿工作流：** 通过 `pnpm gateway:watch` 自行运行 Gateway，然后让 macOS 应用程序以本地模式连接。

## 先决条件（从源代码安装）
- Node `>=22`
- `pnpm`
- Docker（可选；仅用于容器化设置/端到端测试 —— 请参见 [Docker](/install/docker)）

## 定制策略（避免更新带来影响）

如果你想实现“100%贴合个人需求”并且方便更新，请将你的自定义内容保存在以下位置：

- **配置文件：** `~/.clawdbot/clawdbot.json`（JSON/JSON5 格式）
- **工作区：** `~/clawd`（技能、提示词、记忆；建议将其设为私有 Git 仓库）

一次性初始化：
bash
clawdbot setup
``````
从仓库内部使用本地 CLI 入口：```bash
clawdbot setup
```
如果尚未进行全局安装，请通过 `pnpm clawdbot setup` 运行。

## 稳定工作流（先安装 macOS 应用）

1) 安装并启动 **Clawdbot.app**（菜单栏）。
2) 完成引导/权限检查清单（TCC 提示）。
3) 确保网关为 **本地** 并正在运行（该应用会自动管理）。
4) 链接设备（例如：WhatsApp）：
bash
clawdbot channels login
``````
5) 健全性检查：```bash
clawdbot health
```
如果您的版本中没有提供引导流程：
- 运行 `clawdbot setup`，然后运行 `clawdbot channels login`，最后手动启动网关 (`clawdbot gateway`)。

## 开发版工作流（在终端中运行网关）

目标：开发 TypeScript 网关，实现热重载，并保持 macOS 应用界面的连接。

### 0) （可选）从源代码运行 macOS 应用

如果您也希望使用开发版的 macOS 应用：
bash
./scripts/restart-mac.sh
``````
### 1) 启动开发网关```bash
pnpm install
pnpm gateway:watch
```
`gateway:watch` 以监视模式运行网关，并在 TypeScript 文件更改时重新加载。

### 2) 将 macOS 应用指向正在运行的网关

在 **Clawdbot.app** 中：

- 连接模式：**本地**
  应用将连接到配置端口上的运行中的网关。

### 3) 验证

- 应用内的网关状态应显示为 **“使用现有网关 …”**
- 或通过 CLI 验证：
bash
clawdbot health
``````
### 常见的陷阱（Footguns）
- **端口错误：** 网关 WS 默认使用 `ws://127.0.0.1:18789`；请确保应用和 CLI 使用相同的端口。
- **状态存储位置：**
  - 凭据：`~/.clawdbot/credentials/`
  - 会话：`~/.clawdbot/agents/<agentId>/sessions/`
  - 日志：`/tmp/clawdbot/`

## 更新（不破坏你的设置）

- 保留 `~/clawd` 和 `~/.clawdbot/` 作为“你的数据”；不要将个人提示/配置放入 `clawdbot` 仓库中。
- 更新源代码：执行 `git pull` + `pnpm install`（当 lockfile 变化时）+ 继续使用 `pnpm gateway:watch`。

## Linux（systemd 用户服务）

Linux 安装使用的是 systemd **用户服务**。默认情况下，systemd 在用户注销或空闲时会停止用户服务，这会导致网关关闭。引导过程会尝试为你启用 linger 功能（可能会提示输入 sudo 密码）。如果仍然未启用，请运行：```bash
sudo loginctl enable-linger $USER
```
对于始终运行或多人使用的服务器，考虑使用 **系统** 服务而不是用户服务（不需要持久化）。
有关 systemd 的说明，请参阅 [网关运行手册](/gateway)。

## 相关文档

- [网关运行手册](/gateway)（标志、监督、端口）
- [网关配置](/gateway/configuration)（配置模式 + 示例）
- [Discord](/channels/discord) 和 [Telegram](/channels/telegram)（回复标签 + replyToMode 设置）
- [Clawdbot 助手设置](/start/clawd)
- [macOS 应用](/platforms/macos)（网关生命周期）