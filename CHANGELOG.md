# 更新日志

## v1.1.4 (2026.2.5)

### Agent 相关功能

- **OpenRouter 集成**: 添加 OpenRouter app attribution headers，支持应用来源标识。感谢 @alexanderatallah。
- **系统提示安全防护**: 实现系统提示安全防护（safety guardrails），防止提示注入攻击和恶意指令。(#5445) 感谢 @joshp123。
- **Agent 会话扩展**: 扩展 CreateAgentSessionOptions 支持 systemPrompt、skills 和 contextFiles 配置。
- **工具策略快照**: 添加工具策略符合性快照（tool policy conformance snapshot），无运行时行为变更。(#6011)
- **消息时间戳**: Gateway 自动向 agent 和 chat.send 消息注入时间戳。(#3703) 感谢 @conroywhitney, @CashWilliams。
- **before_tool_call 钩子**: 将 before_tool_call 插件钩子集成到工具执行流程中。(#6570, #6660) 感谢 @ryancnelson。

### Agent 相关修复

- **Embedded Runner 对齐**: 对齐 embedded runner 和类型定义与 pi-coding-agent API 更新（pi 0.51.0）。
- **OpenRouter Headers**: 确保 OpenRouter attribution headers 在 embedded runner 中正确应用。
- **上下文窗口上限**: 为 compaction safeguard 添加上下文窗口解析上限。(#6187) 感谢 @iamEvanYT。
- **Pi 提示模板**: 修复 Pi 提示模板参数语法。(#6543)
- **子 Agent 故障转移**: 修复子 agent announce 故障转移竞争条件（始终发出 lifecycle end；timeout=0 表示无超时）。(#6621)

### Agent Dashboard UI

- **Agent 管理界面**: 新增 Agent Dashboard，支持查看和管理 agent 配置、文件和工作空间。
- **Agent 配置 API**: 添加 agents.update API，支持通过 gateway 更新 agent 配置。
- **导航集成**: 将 Agent Dashboard 集成到 Web UI 导航栏（/agents 路由）。

### 稳定性与核心修复

- **GitHub Copilot 适配**: 默认模型更新为 `gpt-4.1`，解决旧版模型失效导致的认证及 404 错误。
- **Windows 文件系统优化**: 为配置文件写入逻辑增加指数退避重试机制，彻底解决杀毒软件或系统索引导致的文件锁定 (EPERM/EACCES) 崩溃问题。
- **向导会话鲁棒性**: 修复 Onboarding Wizard 在 Gateway 重启后出现 `wizard not found` 的错误，实现会话自动重置与清理。
- **性能优化**: 清理冗余依赖引用，减小构建体积。
- **品牌重塑**: 正式更名为 **Clawdbot-CN**，由 `lllooollpp` 维护。

## v1.1.3 (2026.2.2)

### 功能
- **渠道扩展**: 新增对 **企业微信 (WeCom)** 的官方支持，支持自建应用、消息加密、身份验证及文本消息收发。
- **渠道扩展**: 新增对国内 **飞书 (Feishu/Lark)** 的官方支持，支持私信、群聊、媒体及流式输出。
- **CLI**: 实现全新的命令行自动补全功能，支持 Bash 和 Zsh。通过 `clawdbot completion` 即可生成补全脚本。

### 优化与修复
- **桌面端修复**: 解决 Desktop 版本中缺失 `tslog` 依赖导致飞书、企业微信等插件无法加载的问题。
- **UI 修正**: 修复企业微信图形化配置向导中字段数据无法正确回传 Gateway 的逻辑漏洞。
- **构建修复**: 处理 Shell 补全模板脚本与 TypeScript 模板字符串冲突导致的构建失败。
- **命令注册**: 清理 CLI 内部重复注册的 `completion` 命令，解决启动冲突错误。
- **安全性**: 增强媒体解析钩子的 LFI（本地文件包含）防护，全局过滤敏感路径请求（如 `~/.profile`）。
- **UI 优化**: 改进企业微信、飞书等渠道的配置向导面板，支持在首次启动时引导用户完成配置。
- **UI 逻辑**: 修复配置表单在遇到复杂插件架构时显示“不支持的架构节点”的崩溃问题。
- **稳定性**: 修复 LINE 插件在账户快照为空时（未登录状态）调用 `describeAccount` 导致的 `TypeError` 崩溃。
- **OAuth**: 优化健康状态报告。对于包含 `refresh` token 的 OAuth 账户，即使当前 token 已过期，健康得分仍记为“健康”，减少不必要的告警。
- **安全性**: 修补网关凭据处理逻辑，防止由于 "undefined" 字符串作为 token 导致的非预期授权通过。
- **运行时**: 同步 Node.js 最低版本要求至 v22.12.0，以匹配最新的 ESM 和内置模块特性需求。

### 文档
- **手册补充**: 新增企业微信配置手册 [docs/channels/wecom.md](docs/channels/wecom.md) 和飞书配置手册 [docs/channels/feishu.md](docs/channels/feishu.md)。

## v1.1.2 (2026.1.31)

### 功能
- **模型更新**: 将 Moonshot (Kimi) 的默认模型更新为 `kimi-k2.5-20250114`，提供更强的性能和上下文处理能力。
- **UI 优化**: 实现全新的 GUI 配置向导 (Onboarding Wizard) 面板。支持在首次启动时引导用户完成模型、密钥、网关等基础配置。

### 优化与修复
- **安全性**: 在媒体解析器 (`src/media/parse.ts`) 中引入 LFI 路径保护，限制非沙箱环境下对系统敏感路径的访问。
- **UI 逻辑**: 新增向导视图控制器，支持从网关实时获取向导步骤并进行同步渲染。
- **Electron 适配**: 修复 Windows 环境下 Electron 启动网关时的路径空格及命令行参数转义问题。
- **环境兼容**: 优化 `scripts/run-node.mjs` 逻辑，在 `tsgo` 缺失时可自动回退至 `tsc`，提高开发环境容错率。
- **日志采集**: 实现 Electron 主进程对网关控制台日志的实时捕获并转发至渲染进程显示。
- **环境迁移**: 针对 `pnpm exec` 或 `npx` 环境下的 CLI 执行逻辑进行了优化适配。

## 2026.1.27 (汉化版发布)

- **UI 汉化**: 完成所有界面元素的中文翻译。
- **模型集成**: 接入智谱 AI GLM-4.7 模型支持。
- **环境适配**: 针对 Windows 环境进行优化和适配。
- **文档更新**: README.md 完整中文化并同步最新功能描述。
