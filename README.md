# 🐾 Clawdbot-CN — 个人 AI 助手控制平台

> **全新升级！** 深度适配 GitHub Copilot 最新模型，针对 Windows 环境稳定性进行专项优化。

![功能演示](image/README/1769958220182.png)

<p align="center">
  <a href="https://github.com/lllooollpp/clawdbot-cn/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/lllooollpp/clawdbot-cn/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/lllooollpp/clawdbot-cn/releases"><img src="https://img.shields.io/github/v/release/lllooollpp/clawdbot-cn?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="http://101.35.228.254/"><img src="https://img.shields.io/badge/文档-中文指南-blue?style=for-the-badge" alt="Docs"></a>
</p>

**Clawdbot-CN** 是一个构建在本地设备上的 *个人 AI 助手控制中心*。它能让你通过常用的聊天工具（企业微信、飞书、WhatsApp、Telegram、Slack、Discord、Signal、iMessage 等）与你的私人 AI 代理（Pi）进行实时对话，并赋予 AI 操作 Shell、浏览器、文件系统以及执行自动化任务的能力。

---

### 🚀 最新功能与稳定性增强 (v1.1.4+)

- **Agent Dashboard UI**：新增智能体管理界面，支持查看和管理 Agent 配置、文件和工作空间
- **GitHub Copilot 深度适配**：支持最新的 `gpt-4.1` 等模型，修复了旧版模型版本失效导致的 404 错误
- **Windows 文件系统加固**：针对 Windows 平台常见的文件锁定 (EPERM) 冲突，引入了指数退避重试机制，大幅提升配置与配置保存成功率
- **向导会话状态自动恢复**：修复了配置向导在 WebSocket 重连或 Gateway 重启后会话丢失的异常，现在支持自动清理陈旧状态并允许无缝重试
- **国内生态深度集成**：原生支持 **企业微信** (AES 解密/双向传输) 与 **飞书**
- **系统提示安全防护**：实现系统提示安全防护（safety guardrails），防止提示注入攻击和恶意指令

---

如果你想要一个感觉本地、快速、始终在线的个人单用户助手，这就是它。现在提供 **Desktop App (Win/macOS/Linux)**，让你无需命令行即可快速开启。针对中国用户进行了深度优化，内置 **智谱 AI (Zhipu)** 等国产模型支持。

[网站](https://clawdbot.cn) · [文档](http://101.35.228.254/) · [入门](./docs/start/getting-started.md) · [桌面端](./docs/install/desktop.md) · [更新](./docs/install/updating.md) · [展示](./docs/start/showcase.md) · [FAQ](./docs/start/faq.md) · [向导](./docs/start/wizard.md) · [Docker](./docs/install/docker.md) · [Discord](https://discord.gg/clawdbot)

首选设置：

1. **Desktop App (推荐)**：下载并运行 [Clawdbot-CN Desktop](./docs/install/desktop.md)，这是最简单跨平台 GUI 体验，支持 **Windows、macOS 和 Linux**。新版本支持**图形化配置向导**，在设置菜单中即可一键开启，且默认优先适配国产大模型。
2. **CLI 向导**：运行入门向导（`clawdbot onboard`）。它会引导你完成 Gateway、Workspace、Channels 和 Skills。CLI 向导推荐在 **macOS、Linux 和 Windows (通过 WSL2)** 上工作。

支持 npm、pnpm 或 bun。

新安装？从这里开始：[入门](./docs/start/getting-started.md)

**订阅（OAuth）：**

- **[Anthropic](https://www.anthropic.com/)** (Claude Pro/Max)
- **[OpenAI](https://openai.com/)** (ChatGPT/Codex)
- **[智谱 (Zhipu)](https://open.bigmodel.cn/)** (ChatGLM 4.7 / GLM-4)
- **[火山引擎 (Volcengine)](https://www.volcengine.com/)** (DeepSeek V3/R1, 豆包)
- **[Moonshot (Kimi)](https://platform.moonshot.cn/)** (Kimi V1 / K2.5)

模型说明：虽然支持任何模型，但我强烈推荐 **Anthropic Pro/Max (100/200) + Opus 4.5** 用于长上下文强度和更好的提示注入抵抗。对于中文用户，**DeepSeek V3/R1 (通过火山引擎)**、**Kimi K2.5** 和 **ChatGLM 4.7** 是极佳的选择。见 [入门](./docs/start/onboarding.md)。

## 模型（选择 + 认证）

- 模型配置 + CLI：[模型](./docs/concepts/models.md)
- 认证配置文件转换（OAuth vs API 密钥）+ 回退：[模型故障转移](./docs/concepts/model-failover.md)

## 安装（推荐）

运行时：**Node ≥ 22.12.0**。

```bash
npm install -g clawdbot@latest
# 或 pnpm add -g clawdbot@latest

clawdbot onboard --install-daemon
```

这将启动向导，引导你配置 Gateway、创建代理工作区并可选安装 systemd/launchd 服务（Linux/macOS）或 Windows 服务包装器。

## 桌面端下载

**Windows 用户**：直接下载最新的桌面安装包

📦 [下载 Clawdbot-Setup-1.1.4.exe](https://github.com/lllooollpp/clawdbot-cn/releases/download/v1.1.4/Clawdbot-Setup-1.1.4.exe) (167 MB)

其他平台请查看 [桌面端安装文档](./docs/install/desktop.md)。

## 快速预览

下面是一些你可以做的事情：

**📱 通过你的聊天应用使用你的代理**

```bash
# 通过 Telegram 发送消息给你的代理
clawdbot message send --to telegram --thread "personal" \
  "今天天气怎么样？"

# 通过企业微信接收代理回复
# (配置后自动双向同步)
```

**🤖 Agent Dashboard**

访问 Web UI (默认 http://localhost:18789/agents) 查看：
- 所有 Agent 的配置和状态
- 文件和工作空间管理
- 实时配置更新

**🔧 本地命令执行**

```bash
# 让代理在本地执行 shell 命令
clawdbot agent run --workspace default \
  "帮我创建一个 Python 项目脚手架"
```

**🌐 浏览器自动化**

```bash
# 让代理使用浏览器搜索信息
clawdbot agent run --workspace browser-enabled \
  "搜索最新的 AI 新闻并总结"
```

**📄 文件操作**

```bash
# 让代理分析和编辑文件
clawdbot agent run --workspace coding \
  "重构这个 Python 文件以提高性能" \
  --context ./main.py
```

## 渠道支持

Clawdbot-CN 支持以下消息渠道：

- ✅ **企业微信 (WeCom)** - 支持自建应用、消息加密、身份验证
- ✅ **飞书 (Feishu/Lark)** - 支持私信、群聊、媒体及流式输出
- ✅ **WhatsApp** (通过 WhatsApp Web)
- ✅ **Telegram**
- ✅ **Discord**
- ✅ **Slack**
- ✅ **Signal**
- ✅ **iMessage** (仅 macOS)
- ✅ **Matrix**
- ✅ **Microsoft Teams**
- ✅ **LINE**

查看 [渠道文档](./docs/channels/) 了解如何配置。

## 核心特性

- **🔒 隐私优先**：完全本地运行，你的数据永不离开你的设备
- **🌍 多渠道集成**：通过你喜欢的聊天应用与 AI 对话
- **🛠️ 强大的工具**：Shell、浏览器、文件系统、API 调用等
- **🔄 自动化任务**：定时任务、工作流、批处理
- **📊 Web 控制面板**：现代化的 Web UI 管理所有配置
- **🇨🇳 国内优化**：深度集成智谱、火山引擎、Kimi 等国产模型
- **🎯 Agent Dashboard**：直观的智能体管理界面

## 文档

- 📚 [完整文档](http://101.35.228.254/)
- 🚀 [快速开始](./docs/start/getting-started.md)
- 💻 [桌面端安装](./docs/install/desktop.md)
- 🔧 [配置指南](./docs/start/wizard.md)
- 📱 [渠道配置](./docs/channels/)
- 🤖 [Agent 配置](./docs/concepts/models.md)

## 贡献者

感谢所有为 Clawdbot 做出贡献的开发者！

<a href="https://github.com/lllooollpp/clawdbot-cn/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=lllooollpp/clawdbot-cn" />
</a>

## 许可证

本项目基于 MIT 许可证开源。

---

**由 [lllooollpp](https://github.com/lllooollpp) 维护** | 基于 [Clawdbot](https://github.com/clawdbot/clawdbot) 构建
