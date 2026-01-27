# 创建自定义技能 🛠

Clawdbot 设计为易于扩展。"技能" 是向你的助手添加新功能的主要方式。

## 什么是技能？
技能是一个包含 `SKILL.md` 文件的目录（该文件向 LLM 提供指令和工具定义），以及可选的一些脚本或资源。

## 分步指南：你的第一个技能

### 1. 创建目录
技能位于你的工作区中，通常为 `~/clawd/skills/`。为你的技能创建一个新的文件夹：
bash
mkdir -p ~/clawd/skills/hello-world
``````
### 2. 定义 `SKILL.md`
在该目录中创建一个 `SKILL.md` 文件。此文件使用 YAML 前置元数据进行元数据描述，并使用 Markdown 编写操作说明。---
name: hello_world
description: 一个简单的技能，用于打招呼。
---

# Hello World 技能
当用户询问问候时，使用 `echo` 工具说 "你好，来自你的自定义技能！"。### 3. 添加工具（可选）
你可以在 frontmatter 中定义自定义工具，或者指示代理使用现有的系统工具（如 `bash` 或 `browser`）。

### 4. 刷新 Clawdbot
让你的代理“刷新技能”或重启网关。Clawdbot 将会发现新的目录并索引 `SKILL.md`。

## 最佳实践
- **简洁明了**：告诉模型 *做什么*，而不是如何成为 AI。
- **安全优先**：如果你的技能使用了 `bash`，请确保提示不会允许来自不可信用户输入的任意命令注入。
- **本地测试**：使用 `clawdbot agent --message "use my new skill"` 进行测试。

## 共享技能
你也可以在 [ClawdHub](https://clawdhub.com) 上浏览和贡献技能。