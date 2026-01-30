---
summary: "Install and use the Clawdbot Desktop Application (Windows, macOS, Linux)"
---

# Clawdbot Desktop (桌面版)

Clawdbot Desktop 是一个基于 Electron 的图形化应用程序，它集成了 Clawdbot Gateway 和 UI，让你可以在没有命令行基础的情况下轻松启动和管理你的个人 AI 助手。

## 特性

- **开箱即用**：集成了 Gateway 核心，自动处理启动和状态检测。
- **跨平台支持**：支持原生 Windows (无需 WSL2)、macOS 和 Linux。
- **环境隔离**：桌面版使用独立的数据目录，不会影响你全局安装的 `clawdbot` CLI 配置。
- **自动配置**：首次运行会自动配置为本地模式 (`gateway.mode=local`)。
- **环境变量继承**：自动从系统环境继承 API 密钥 (如 `ZAI_KEY`, `ANTHROPIC_API_KEY` 等)。

## 安装

### Windows
1. 前往 [Releases](https://github.com/clawdbot/clawdbot/releases) 下载最新的 `.exe` 安装包。
2. 运行安装程序。
3. 启动 Clawdbot。

> **注意**：Windows 桌面版无需安装 WSL2 即可运行，但如果你需要使用高级 CLI 功能，WSL2 仍然是推荐的开发环境。

### macOS
1. 下载 `.dmg` 文件。
2. 将 Clawdbot 拖入 Applications 文件夹。
3. 首次启动可能需要右键点击“打开”以绕过未签名应用检查。

### Linux
1. 下载 `.AppImage` 或 `.deb` 文件。
2. 赋予执行权限并运行。

## 开发与从源码构建

如果你想自己构建桌面版：

```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot

# 安装依赖
pnpm install

# 进入桌面模块目录
cd apps/desktop

# 开发模式启动
pnpm dev

# 构建安装包 (Windows)
pnpm build:win

# 构建安装包 (Mac)
pnpm build:mac
```

## 常见问题

### 1. 启动后显示“Waiting for Gateway...”
这通常意味着后端正在初始化或清理之前的端口占用。请稍等 5-10 秒。

### 2. 如何设置 API Key？
桌面版会自动从你的系统环境变量中读取。或者，你可以在应用启动后的控制面板 (Dashboard) 中通过 Web UI 进行配置。

### 3. 数据存在哪里？
- **Windows**: `%APPDATA%/clawdbot-desktop`
- **macOS**: `~/Library/Application Support/clawdbot-desktop`
- **Linux**: `~/.config/clawdbot-desktop`

你可以在这些目录下找到 `clawdbot.json` 配置文件。
