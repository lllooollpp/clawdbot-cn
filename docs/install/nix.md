---
summary: "Install Clawdbot declaratively with Nix"
read_when:
  - You want reproducible, rollback-able installs
  - You're already using Nix/NixOS/Home Manager
  - You want everything pinned and managed declaratively
---

# Nix 安装

推荐通过 **[nix-clawdbot](https://github.com/clawdbot/nix-clawdbot)** — 一个自带完整功能的 Home Manager 模块 — 来使用 Nix 运行 Clawdbot。

## 快速开始

将以下内容粘贴到你的 AI 代理（Claude、Cursor 等）中：
text
I want to set up nix-clawdbot on my Mac.
Repository: github:clawdbot/nix-clawdbot

What I need you to do:
1. 检查是否已安装 Determinate Nix（如果没有，请安装）
2. 在 `~/code/clawdbot-local` 创建一个本地 flake，使用 `templates/agent-first/flake.nix`
3. 帮我创建一个 Telegram 机器人（通过 @BotFather）并获取我的聊天 ID（通过 @userinfobot）
4. 设置密钥（机器人令牌、Anthropic 密钥） - 放在 `~/.secrets/` 目录下的普通文件即可
5. 填写模板中的占位符并运行 `home-manager switch`
6. 验证：launchd 是否正在运行，机器人是否能回复消息

参考 nix-clawdbot 的 README 文件了解模块选项。
``````
> **📦 完整指南: [github.com/clawdbot/nix-clawdbot](https://github.com/clawdbot/nix-clawdbot)**
>
> nix-clawdbot 仓库是 Nix 安装的官方来源。本页面仅是一个快速概述。

## 你将获得

- 网关 + macOS 应用 + 工具（whisper、spotify、摄像头）——全部固定版本
- 可在重启后继续运行的 launchd 服务
- 声明式配置的插件系统
- 即时回滚功能：`home-manager switch --rollback`

---

## Nix 模式运行时行为

当设置 `CLAWDBOT_NIX_MODE=1` 时（由 nix-clawdbot 自动设置）：

Clawdbot 支持一种 **Nix 模式**，该模式使配置具有确定性并禁用自动安装流程。
通过导出以下内容来启用它：```bash
CLAWDBOT_NIX_MODE=1
```
在 macOS 上，GUI 应用程序不会自动继承 shell 环境变量。你也可以通过 defaults 启用 Nix 模式：
bash
defaults write com.clawdbot.mac clawdbot.nixMode -bool true```
### 配置与状态路径

Clawdbot 从 `CLAWDBOT_CONFIG_PATH` 读取 JSON5 格式的配置文件，并将可变数据存储在 `CLAWDBOT_STATE_DIR` 中。

- `CLAWDBOT_STATE_DIR`（默认值：`~/.clawdbot`）
- `CLAWDBOT_CONFIG_PATH`（默认值：`$CLAWDBOT_STATE_DIR/clawdbot.json`）

在 Nix 环境下运行时，应显式设置这些路径为 Nix 管理的目录，以确保运行时状态和配置不会进入不可变的存储目录。

### Nix 模式下的运行行为

- 自动安装和自我更新功能被禁用
- 缺失的依赖会显示 Nix 特有的修复提示
- 当处于 Nix 模式时，UI 会显示只读的 Nix 模式横幅

## 打包注意事项（macOS）

macOS 的打包流程期望在以下位置有一个稳定的 Info.plist 模板：```
apps/macos/Sources/Clawdbot/Resources/Info.plist
```
[`scripts/package-mac-app.sh`](https://github.com/clawdbot/clawdbot/blob/main/scripts/package-mac-app.sh) 会将此模板复制到应用程序包中，并修补动态字段（包ID、版本/构建号、Git SHA、Sparkle密钥）。这使得 plist 在 SwiftPM 打包和 Nix 构建中保持确定性（这些构建不依赖完整的 Xcode 工具链）。

## 相关内容

- [nix-clawdbot](https://github.com/clawdbot/nix-clawdbot) — 完整的设置指南
- [Wizard](/start/wizard) — 非 Nix 的 CLI 设置
- [Docker](/install/docker) — 容器化的设置