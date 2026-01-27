---
summary: "Hubs that link to every Clawdbot doc"
read_when:
  - You want a complete map of the documentation
---

# 文档中心

使用这些中心来发现每一页内容，包括不显示在左侧导航栏中的深入分析和参考文档。

## 从这里开始

- [索引](/)
- [入门指南](/start/getting-started)
- [入门](/start/onboarding)
- [向导](/start/wizard)
- [设置](/start/setup)
- [仪表板（本地网关）](http://127.0.0.1:18789/)
- [帮助](/help)
- [配置](/gateway/configuration)
- [配置示例](/gateway/configuration-examples)
- [Clawdbot 助手（Clawd）](/start/clawd)
- [展示](/start/showcase)
- [背景故事](/start/lore)

## 安装与更新

- [Docker](/install/docker)
- [Nix](/install/nix)
- [更新 / 回滚](/install/updating)
- [Bun 工作流（实验性）](/install/bun)

## 核心概念

- [架构](/concepts/architecture)
- [网络中心](/network)
- [代理运行时](/concepts/agent)
- [代理工作区](/concepts/agent-workspace)
- [内存](/concepts/memory)
- [代理循环](/concepts/agent-loop)
- [流式传输 + 分块](/concepts/streaming)
- [多代理路由](/concepts/multi-agent)
- [压缩](/concepts/compaction)
- [会话](/concepts/session)
- [会话（别名）](/concepts/sessions)
- [会话清理](/concepts/session-pruning)
- [会话工具](/concepts/session-tool)
- [队列](/concepts/queue)
- [斜杠命令](/tools/slash-commands)
- [RPC 适配器](/reference/rpc)
- [TypeBox 模式](/concepts/typebox)
- [时区处理](/concepts/timezone)
- [存在状态](/concepts/presence)
- [发现 + 传输](/gateway/discovery)
- [Bonjour](/gateway/bonjour)
- [频道路由](/concepts/channel-routing)
- [组](/concepts/groups)
- [组消息](/concepts/group-messages)
- [模型故障转移](/concepts/model-failover)
- [OAuth](/concepts/oauth)

## 提供商 + 入站通道

- [聊天频道中心](/channels)
- [模型提供商中心](/providers/models)
- [WhatsApp](/channels/whatsapp)
- [Telegram](/channels/telegram)
- [Telegram（grammY 说明）](/channels/grammy)
- [Slack](/channels/slack)
- [Discord](/channels/discord)
- [Mattermost](/channels/mattermost)（插件）
- [Signal](/channels/signal)
- [iMessage](/channels/imessage)
- [位置解析](/channels/location)
- [WebChat](/web/webchat)
- [Webhook](/automation/webhook)
- [Gmail Pub/Sub](/automation/gmail-pubsub)

## 网关 + 运维

- [网关操作手册](/gateway)
- [网关配对](/gateway/pairing)
- [网关锁定](/gateway/gateway-lock)
- [后台进程](/gateway/background-process)
- [健康状态](/gateway/health)
- [心跳](/gateway/heartbeat)
- [诊断](/gateway/doctor)
- [日志](/gateway/logging)
- [沙箱](/gateway/sandboxing)
- [仪表板](/web/dashboard)
- [控制界面](/web/control-ui)
- [远程访问](/gateway/remote)
- [远程网关 README](/gateway/remote-gateway-readme)
- [Tailscale](/gateway/tailscale)
- [安全性](/gateway/security)
- [故障排除](/gateway/troubleshooting)

## 工具 + 自动化

- [工具概览](/tools)
- [OpenProse](/prose)
- [CLI参考](/cli)
- [执行工具](/tools/exec)
- [提升模式](/tools/elevated)
- [定时任务](/automation/cron-jobs)
- [定时任务 vs 心跳](/automation/cron-vs-heartbeat)
- [思考 + 详细模式](/tools/thinking)
- [模型](/concepts/models)
- [子代理](/tools/subagents)
- [代理发送CLI](/tools/agent-send)
- [终端UI](/tui)
- [浏览器控制](/tools/browser)
- [浏览器（Linux故障排除）](/tools/browser-linux-troubleshooting)
- [轮询](/automation/poll)

## 节点、媒体、语音

- [节点概览](/nodes)
- [摄像头](/nodes/camera)
- [图像](/nodes/images)
- [音频](/nodes/audio)
- [位置命令](/nodes/location-command)
- [语音唤醒](/nodes/voicewake)
- [说话模式](/nodes/talk)

- [平台概览](/platforms)
- [macOS](/platforms/macos)
- [iOS](/platforms/ios)
- [Android](/platforms/android)
- [Windows (WSL2)](/platforms/windows)
- [Linux](/platforms/linux)
- [网页界面](/web)

## macOS配套应用（高级）

- [macOS开发环境设置](/platforms/mac/dev-setup)
- [macOS菜单栏](/platforms/mac/menu-bar)
- [macOS语音唤醒](/platforms/mac/voicewake)
- [macOS语音覆盖](/platforms/mac/voice-overlay)
- [macOS WebChat](/platforms/mac/webchat)
- [macOS Canvas](/platforms/mac/canvas)
- [macOS子进程](/platforms/mac/child-process)
- [macOS健康](/platforms/mac/health)
- [macOS图标](/platforms/mac/icon)
- [macOS日志](/platforms/mac/logging)
- [macOS权限](/platforms/mac/permissions)
- [macOS远程](/platforms/mac/remote)
- [macOS签名](/platforms/mac/signing)
- [macOS发布](/platforms/mac/release)
- [macOS网关（launchd）](/platforms/mac/bundled-gateway)
- [macOS XPC](/platforms/mac/xpc)
- [macOS技能](/platforms/mac/skills)
- [macOS Peekaboo](/platforms/mac/peekaboo)

## 工作区 + 模板

- [技能](/tools/skills)
- [ClawdHub](/tools/clawdhub)
- [技能配置](/tools/skills-config)
- [默认AGENTS](/reference/AGENTS.default)
- [模板: AGENTS](/reference/templates/AGENTS)
- [模板: BOOTSTRAP](/reference/templates/BOOTSTRAP)
- [模板: HEARTBEAT](/reference/templates/HEARTBEAT)
- [模板: IDENTITY](/reference/templates/IDENTITY)
- [模板: SOUL](/reference/templates/SOUL)
- [模板: TOOLS](/reference/templates/TOOLS)
- [模板: USER](/reference/templates/USER)

## 实验（探索性）

- [入门配置协议](/experiments/onboarding-config-protocol)
- [定时任务加固笔记](/experiments/plans/cron-add-hardening)
- [组策略加固笔记](/experiments/plans/group-policy-hardening)
- [研究：内存](/experiments/research/memory)
- [模型配置探索](/experiments/proposals/model-config)

## 测试 + 发布

- [测试](/reference/test)
- [发布检查清单](/reference/RELEASING)
- [设备型号](/reference/device-models)