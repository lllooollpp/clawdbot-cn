import { CHANNEL_IDS } from "../channels/registry.js";
import { VERSION } from "../version.js";
import { ClawdbotSchema } from "./zod-schema.js";

export type ConfigUiHint = {
  label?: string;
  help?: string;
  group?: string;
  order?: number;
  advanced?: boolean;
  sensitive?: boolean;
  placeholder?: string;
  itemTemplate?: unknown;
};

export type ConfigUiHints = Record<string, ConfigUiHint>;

export type ConfigSchema = ReturnType<typeof ClawdbotSchema.toJSONSchema>;

type JsonSchemaNode = Record<string, unknown>;

export type ConfigSchemaResponse = {
  schema: ConfigSchema;
  uiHints: ConfigUiHints;
  version: string;
  generatedAt: string;
};

export type PluginUiMetadata = {
  id: string;
  name?: string;
  description?: string;
  configUiHints?: Record<
    string,
    Pick<ConfigUiHint, "label" | "help" | "advanced" | "sensitive" | "placeholder">
  >;
  configSchema?: JsonSchemaNode;
};

export type ChannelUiMetadata = {
  id: string;
  label?: string;
  description?: string;
  configSchema?: JsonSchemaNode;
  configUiHints?: Record<string, ConfigUiHint>;
};

const GROUP_LABELS: Record<string, string> = {
  wizard: "设置向导",
  update: "更新",
  diagnostics: "诊断",
  logging: "日志",
  gateway: "网关",
  nodeHost: "节点宿主",
  agents: "智能体",
  tools: "工具",
  bindings: "绑定",
  audio: "音频",
  models: "模型",
  messages: "消息",
  commands: "命令",
  session: "会话",
  cron: "定时任务",
  hooks: "钩子",
  ui: "界面",
  browser: "浏览器",
  talk: "语音",
  channels: "渠道",
  skills: "技能",
  plugins: "插件",
  discovery: "发现",
  presence: "状态",
  voicewake: "语音唤醒",
};

const GROUP_ORDER: Record<string, number> = {
  wizard: 20,
  update: 25,
  auth: 26,
  models: 27,
  diagnostics: 28,
  gateway: 30,
  nodeHost: 35,
  agents: 40,
  tools: 50,
  bindings: 55,
  audio: 60,
  messages: 80,
  commands: 85,
  session: 90,
  cron: 100,
  hooks: 110,
  ui: 120,
  browser: 130,
  talk: 140,
  channels: 150,
  skills: 200,
  plugins: 205,
  discovery: 210,
  presence: 220,
  voicewake: 230,
  logging: 900,
};

const FIELD_LABELS: Record<string, string> = {
  "meta.lastTouchedVersion": "配置文件最后修改版本",
  "meta.lastTouchedAt": "配置文件最后修改时间",
  "update.channel": "更新渠道",
  "update.checkOnStart": "启动时检查更新",
  "diagnostics.enabled": "启用诊断",
  "diagnostics.flags": "诊断标志",
  "diagnostics.otel.enabled": "启用 OpenTelemetry",
  "diagnostics.otel.endpoint": "OpenTelemetry 端点",
  "diagnostics.otel.protocol": "OpenTelemetry 协议",
  "diagnostics.otel.headers": "OpenTelemetry 请求头",
  "diagnostics.otel.serviceName": "OpenTelemetry 服务名称",
  "diagnostics.otel.traces": "启用 OpenTelemetry 追踪",
  "diagnostics.otel.metrics": "启用 OpenTelemetry 指标",
  "diagnostics.otel.logs": "启用 OpenTelemetry 日志",
  "diagnostics.otel.sampleRate": "OpenTelemetry 采样率",
  "diagnostics.otel.flushIntervalMs": "OpenTelemetry 刷新间隔 (ms)",
  "diagnostics.cacheTrace.enabled": "启用缓存追踪",
  "diagnostics.cacheTrace.filePath": "缓存追踪文件路径",
  "diagnostics.cacheTrace.includeMessages": "追踪包含消息原文",
  "diagnostics.cacheTrace.includePrompt": "追踪包含提示词",
  "diagnostics.cacheTrace.includeSystem": "追踪包含系统提示词",
  "agents.list.*.identity.avatar": "身份头像",
  "gateway.remote.url": "远程网关 URL",
  "gateway.remote.sshTarget": "远程网关 SSH 目标",
  "gateway.remote.sshIdentity": "远程网关 SSH 身份文件",
  "gateway.remote.token": "远程网关令牌",
  "gateway.remote.password": "远程网关密码",
  "gateway.remote.tlsFingerprint": "远程网关 TLS 指纹",
  "gateway.auth.token": "网关访问令牌",
  "gateway.auth.password": "网关访问密码",
  "tools.media.image.enabled": "启用图像理解",
  "tools.media.image.maxBytes": "图像理解最大字节数",
  "tools.media.image.maxChars": "图像理解最大字符数",
  "tools.media.image.prompt": "图像理解提示词",
  "tools.media.image.timeoutSeconds": "图像理解超时时间 (秒)",
  "tools.media.image.attachments": "图像理解附件策略",
  "tools.media.image.models": "图像理解模型",
  "tools.media.image.scope": "图像理解范围",
  "tools.media.models": "多模态共享模型",
  "tools.media.concurrency": "多模态理解并发数",
  "tools.media.audio.enabled": "启用音频理解",
  "tools.media.audio.maxBytes": "音频理解最大字节数",
  "tools.media.audio.maxChars": "音频理解最大字符数",
  "tools.media.audio.prompt": "音频理解提示词",
  "tools.media.audio.timeoutSeconds": "音频理解超时时间 (秒)",
  "tools.media.audio.language": "音频理解语言",
  "tools.media.audio.attachments": "音频理解附件策略",
  "tools.media.audio.models": "音频理解模型",
  "tools.media.audio.scope": "音频理解范围",
  "tools.media.video.enabled": "启用视频理解",
  "tools.media.video.maxBytes": "视频理解最大字节数",
  "tools.media.video.maxChars": "视频理解最大字符数",
  "tools.media.video.prompt": "视频理解提示词",
  "tools.media.video.timeoutSeconds": "视频理解超时时间 (秒)",
  "tools.media.video.attachments": "视频理解附件策略",
  "tools.media.video.models": "视频理解模型",
  "tools.media.video.scope": "视频理解范围",
  "tools.links.enabled": "启用链接理解",
  "tools.links.maxLinks": "链接理解最大链接数",
  "tools.links.timeoutSeconds": "链接理解超时时间 (秒)",
  "tools.links.models": "链接理解模型",
  "tools.links.scope": "链接理解范围",
  "tools.profile": "工具配置文件",
  "agents.list.*.tools.profile": "智能体工具配置文件",
  "tools.byProvider": "供应商工具策略",
  "agents.list.*.tools.byProvider": "智能体供应商工具策略",
  "tools.exec.applyPatch.enabled": "启用 apply_patch",
  "tools.exec.applyPatch.allowModels": "apply_patch 模型白名单",
  "tools.exec.notifyOnExit": "执行退出通知",
  "tools.exec.approvalRunningNoticeMs": "执行审批运行通知 (ms)",
  "tools.exec.host": "执行宿主",
  "tools.exec.security": "执行安全性",
  "tools.exec.ask": "执行确认",
  "tools.exec.node": "节点执行绑定",
  "tools.exec.pathPrepend": "PATH 环境变量前缀",
  "tools.exec.safeBins": "安全二进制文件名单",
  "tools.message.allowCrossContextSend": "允许跨上下文发送",
  "tools.message.crossContext.allowWithinProvider": "允许跨上下文 (同一供应商)",
  "tools.message.crossContext.allowAcrossProviders": "允许跨上下文 (跨供应商)",
  "tools.message.crossContext.marker.enabled": "跨上下文来源标识",
  "tools.message.crossContext.marker.prefix": "跨上下文标识前缀",
  "tools.message.crossContext.marker.suffix": "跨上下文标识后缀",
  "tools.message.broadcast.enabled": "启用消息广播",
  "tools.web.search.enabled": "启用网页搜索工具",
  "tools.web.search.provider": "网页搜索供应商",
  "tools.web.search.apiKey": "搜索 API 密钥",
  "tools.web.search.maxResults": "网页搜索最大结果数",
  "tools.web.search.timeoutSeconds": "网页搜索超时时间 (秒)",
  "tools.web.search.cacheTtlMinutes": "网页搜索缓存时间 (分钟)",
  "tools.web.fetch.enabled": "启用网页抓取工具",
  "tools.web.fetch.maxChars": "网页抓取最大字符数",
  "tools.web.fetch.timeoutSeconds": "网页抓取超时时间 (秒)",
  "tools.web.fetch.cacheTtlMinutes": "网页抓取缓存时间 (分钟)",
  "tools.web.fetch.maxRedirects": "网页抓取最大重定向数",
  "tools.web.fetch.userAgent": "网页抓取 User-Agent",
  "gateway.controlUi.basePath": "控制台基础路径",
  "gateway.controlUi.allowInsecureAuth": "允许不安全控制台身份验证",
  "gateway.http.endpoints.chatCompletions.enabled": "OpenAI 聊天补全端点",
  "gateway.reload.debounceMs": "配置重载抖动消除 (ms)",
  "gateway.nodes.browser.mode": "网关节点浏览器模式",
  "gateway.nodes.browser.node": "锁定网关节点浏览器",
  "gateway.nodes.allowCommands": "网关节点允许命令列表",
  "gateway.nodes.denyCommands": "网关节点拒绝命令列表",
  "nodeHost.browserProxy.enabled": "启用节点浏览器代理",
  "nodeHost.browserProxy.allowProfiles": "节点浏览器代理允许配置",
  "skills.load.watch": "监听技能变更",
  "skills.load.watchDebounceMs": "技能监听抖动消除 (ms)",
  "agents.defaults.workspace": "工作空间",
  "agents.defaults.repoRoot": "项目根目录",
  "agents.defaults.bootstrapMaxChars": "引导程序最大字符数",
  "agents.defaults.envelopeTimezone": "信封时区",
  "agents.defaults.envelopeTimestamp": "信封时间戳",
  "agents.defaults.envelopeElapsed": "信封耗时显示",
  "agents.defaults.memorySearch": "记忆搜索",
  "agents.defaults.memorySearch.enabled": "启用记忆搜索",
  "agents.defaults.memorySearch.sources": "记忆搜索源",
  "agents.defaults.memorySearch.experimental.sessionMemory": "记忆搜索会话索引 (实验性)",
  "agents.defaults.memorySearch.provider": "记忆搜索供应商",
  "agents.defaults.memorySearch.remote.baseUrl": "远程嵌入模型 URL",
  "agents.defaults.memorySearch.remote.apiKey": "远程嵌入模型 API 密钥",
  "agents.defaults.memorySearch.remote.headers": "远程嵌入模型请求头",
  "agents.defaults.memorySearch.remote.batch.concurrency": "远程批量并发数",
  "agents.defaults.memorySearch.model": "记忆搜索模型",
  "agents.defaults.memorySearch.fallback": "记忆搜索备用方案",
  "agents.defaults.memorySearch.local.modelPath": "本地嵌入模型路径",
  "agents.defaults.memorySearch.store.path": "记忆搜索索引路径",
  "agents.defaults.memorySearch.store.vector.enabled": "记忆搜索向量索引",
  "agents.defaults.memorySearch.store.vector.extensionPath": "记忆搜索向量扩展路径",
  "agents.defaults.memorySearch.chunking.tokens": "记忆分块 Token 数",
  "agents.defaults.memorySearch.chunking.overlap": "记忆分块重叠 Token 数",
  "agents.defaults.memorySearch.sync.onSessionStart": "会话开始时索引",
  "agents.defaults.memorySearch.sync.onSearch": "搜索时索引 (延迟加载)",
  "agents.defaults.memorySearch.sync.watch": "监听记忆文件变更",
  "agents.defaults.memorySearch.sync.watchDebounceMs": "记忆监听抖动消除 (ms)",
  "agents.defaults.memorySearch.sync.sessions.deltaBytes": "会话增量字节阈值",
  "agents.defaults.memorySearch.sync.sessions.deltaMessages": "会话增量消息阈值",
  "agents.defaults.memorySearch.query.maxResults": "记忆搜索最大结果数",
  "agents.defaults.memorySearch.query.minScore": "记忆搜索最小评分",
  "agents.defaults.memorySearch.query.hybrid.enabled": "记忆搜索混合模式",
  "agents.defaults.memorySearch.query.hybrid.vectorWeight": "记忆搜索向量权重",
  "agents.defaults.memorySearch.query.hybrid.textWeight": "记忆搜索文本权重",
  "agents.defaults.memorySearch.query.hybrid.candidateMultiplier": "记忆搜索候选乘数",
  "agents.defaults.memorySearch.cache.enabled": "记忆搜索嵌入缓存",
  "agents.defaults.memorySearch.cache.maxEntries": "记忆搜索嵌入最大数目",
  "auth.profiles": "身份验证配置文件",
  "auth.order": "身份验证优先级排序",
  "auth.cooldowns.billingBackoffHours": "欠费冷却时间 (小时)",
  "auth.cooldowns.billingBackoffHoursByProvider": "供应商特定的欠费冷却时间",
  "auth.cooldowns.billingMaxHours": "欠费冷却上限 (小时)",
  "auth.cooldowns.failureWindowHours": "故障转移观察窗口 (小时)",
  "agents.defaults.models": "模型配置",
  "agents.defaults.model.primary": "主模型",
  "agents.defaults.model.fallbacks": "备用模型列表",
  "agents.defaults.imageModel.primary": "主图像模型",
  "agents.defaults.imageModel.fallbacks": "备用图像模型列表",
  "agents.defaults.humanDelay.mode": "模拟人工延迟模式",
  "agents.defaults.humanDelay.minMs": "模拟人工延迟最小值 (ms)",
  "agents.defaults.humanDelay.maxMs": "模拟人工延迟最大值 (ms)",
  "agents.defaults.cliBackends": "CLI 后端方案",
  "commands.native": "原生命令",
  "commands.nativeSkills": "原生技能命令",
  "commands.text": "文本命令",
  "commands.bash": "允许 Bash Chat 命令",
  "commands.bashForegroundMs": "Bash 前台显示时间 (ms)",
  "commands.config": "允许 /config 命令",
  "commands.debug": "允许 /debug 命令",
  "commands.restart": "允许重启命令",
  "commands.useAccessGroups": "强制访问组策略",
  "ui.seamColor": "主题强调色",
  "ui.assistant.name": "助手名称",
  "ui.assistant.avatar": "助手头像",
  "browser.controlUrl": "浏览器控制 URL",
  "browser.snapshotDefaults": "浏览器快照默认设置",
  "browser.snapshotDefaults.mode": "浏览器快照模式",
  "browser.remoteCdpTimeoutMs": "远程 CDP 超时 (ms)",
  "browser.remoteCdpHandshakeTimeoutMs": "远程 CDP 握手超时 (ms)",
  "session.dmScope": "私聊会话隔离范围",
  "session.agentToAgent.maxPingPongTurns": "智能体间最大交互轮数",
  "messages.ackReaction": "确认收到的表情符号",
  "messages.ackReactionScope": "表情确认范围",
  "messages.inbound.debounceMs": "入站消息抖动消除 (ms)",
  "talk.apiKey": "语音 API 密钥",
  "channels.whatsapp": "WhatsApp",
  "channels.telegram": "Telegram",
  "channels.telegram.customCommands": "Telegram 自定义命令",
  "channels.discord": "Discord",
  "channels.slack": "Slack",
  "channels.mattermost": "Mattermost",
  "channels.signal": "Signal",
  "channels.imessage": "iMessage",
  "channels.bluebubbles": "BlueBubbles",
  "channels.msteams": "MS Teams",
  "channels.telegram.botToken": "Telegram Bot 令牌",
  "channels.telegram.dmPolicy": "Telegram 私聊策略",
  "channels.telegram.streamMode": "Telegram 草稿流模式",
  "channels.telegram.draftChunk.minChars": "Telegram 草稿分块最小字符",
  "channels.telegram.draftChunk.maxChars": "Telegram 草稿分块最大字符",
  "channels.telegram.draftChunk.breakPreference": "Telegram 草稿分块断句偏好",
  "channels.telegram.retry.attempts": "Telegram 重试次数",
  "channels.telegram.retry.minDelayMs": "Telegram 重试最小延迟 (ms)",
  "channels.telegram.retry.maxDelayMs": "Telegram 重试最大延迟 (ms)",
  "channels.telegram.retry.jitter": "Telegram 重试抖动系数",
  "channels.telegram.timeoutSeconds": "Telegram API 超时时间 (秒)",
  "channels.telegram.capabilities.inlineButtons": "Telegram 内联按钮",
  "channels.whatsapp.dmPolicy": "WhatsApp 私聊策略",
  "channels.whatsapp.selfChatMode": "WhatsApp 自聊模式",
  "channels.whatsapp.debounceMs": "WhatsApp 消息抖动消除 (ms)",
  "channels.signal.dmPolicy": "Signal 私聊策略",
  "channels.imessage.dmPolicy": "iMessage 私聊策略",
  "channels.bluebubbles.dmPolicy": "BlueBubbles 私聊策略",
  "channels.discord.dm.policy": "Discord 私聊策略",
  "channels.discord.retry.attempts": "Discord 重试次数",
  "channels.discord.retry.minDelayMs": "Discord 重试最小延迟 (ms)",
  "channels.discord.retry.maxDelayMs": "Discord 重试最大延迟 (ms)",
  "channels.discord.retry.jitter": "Discord 重试抖动系数",
  "channels.discord.maxLinesPerMessage": "Discord 单条消息最大行数",
  "channels.slack.dm.policy": "Slack 私聊策略",
  "channels.slack.allowBots": "允许来自 Bot 的消息",
  "channels.discord.token": "Discord Bot 令牌",
  "channels.slack.botToken": "Slack Bot 令牌",
  "channels.slack.appToken": "Slack App 令牌",
  "channels.slack.userToken": "Slack 用户令牌",
  "channels.slack.userTokenReadOnly": "Slack 只读用户令牌",
  "channels.slack.thread.historyScope": "Slack 线程历史范围",
  "channels.slack.thread.inheritParent": "Slack 线程继承父上下文",
  "channels.mattermost.botToken": "Mattermost Bot 令牌",
  "channels.mattermost.baseUrl": "Mattermost 基础 URL",
  "channels.mattermost.chatmode": "Mattermost 聊天模式",
  "channels.mattermost.oncharPrefixes": "Mattermost 字符前缀触发",
  "channels.mattermost.requireMention": "Mattermost 需要 @提及",
  "channels.signal.account": "Signal 账号",
  "channels.feishu": "飞书",
  "channels.feishu.appId": "App ID",
  "channels.feishu.appSecret": "App Secret",
  "channels.feishu.encryptKey": "Encrypt Key",
  "channels.feishu.verificationToken": "Verification Token",
  "channels.feishu.webhookPath": "Webhook 路径",
  "channels.feishu.dmPolicy": "私聊策略",
  "channels.feishu.groupPolicy": "群聊策略",
  "channels.imessage.cliPath": "iMessage CLI 路径",
  "plugins.enabled": "启用插件",
  "plugins.allow": "插件允许名单",
  "plugins.deny": "插件拒绝名单",
  "plugins.load.paths": "插件加载路径",
  "plugins.slots": "插件槽位",
  "plugins.slots.memory": "记忆插件",
  "plugins.entries": "已安装插件项",
  "plugins.entries.*.enabled": "启用该插件",
  "plugins.entries.*.config": "插件配置",
  "plugins.installs": "插件安装记录",
  "plugins.installs.*.source": "安装来源",
  "plugins.installs.*.spec": "安装规范",
  "plugins.installs.*.sourcePath": "安装源路径",
  "plugins.installs.*.installPath": "安装目标路径",
  "plugins.installs.*.version": "插件版本",
  "plugins.installs.*.installedAt": "安装时间",
  "models.mode": "模型列表合并模式",
  "models.providers": "模型供应商列表",
  "models.bedrockDiscovery": "Amazon Bedrock 发现设置",
  "models.bedrockDiscovery.enabled": "启用 Bedrock 自动发现",
  "models.bedrockDiscovery.region": "Bedrock 区域",
  "models.bedrockDiscovery.providerFilter": "Bedrock 供应商筛选",
  "models.bedrockDiscovery.refreshInterval": "发现刷新间隔",
  "models.providers.*.baseUrl": "API 基础 URL (Base URL)",
  "models.providers.*.apiKey": "API 密钥 (API Key)",
  "models.providers.*.models": "模型定义列表",
  "models.providers.*.models.*.id": "模型唯一 ID",
  "models.providers.*.models.*.name": "模型名称 (显示名)",
  "models.providers.*.models.*.api": "API 兼容类型",
  "agents.list": "智能体列表",
  "agents.list.*": "智能体",
  "models.providers.*": "模型供应商",
};

const FIELD_HELP: Record<string, string> = {
  "meta.lastTouchedVersion": "配置文件上次被本程序修改时的版本。",
  "meta.lastTouchedAt": "配置文件上次被本程序修改的时间戳。",
  "update.channel": '检查更新的目标渠道 ("stable", "beta" 或 "dev")。',
  "update.checkOnStart": "启动时自动检查更新 (默认: true)。",
  "gateway.remote.url": "远程网关连接地址 (支持 ws:// 或 wss://)。",
  "gateway.remote.tlsFingerprint":
    "远程网关的 SHA256 指纹，用于增强连接安全性。",
  "gateway.remote.sshTarget":
    "通过 SSH 建立网关隧道（格式: 用户@主机 或 用户@主机:端口）。",
  "gateway.remote.sshIdentity": "可选的 SSH 私钥文件路径 (用于 ssh -i)。",
  "agents.list.*.identity.avatar":
    "智能体头像。支持本地路径、远程链接或 Base64 字符串。",
  "gateway.auth.token": "网关通信令牌。非本地回环地址访问时必须设置。",
  "gateway.auth.password": "网关登录密码 (Tailscale Funnel 模式下必需)。",
  "gateway.controlUi.basePath":
    "控制台网页的访问前缀 (例如 /clawdbot)。",
  "gateway.controlUi.allowInsecureAuth":
    "允许通过非 HTTPS 环境进行登录 (仅支持 Token，不推荐)。",
  "gateway.http.endpoints.chatCompletions.enabled":
    "启用兼容 OpenAI 的 `/v1/chat/completions` 接口 (默认: false)。",
  "gateway.reload.mode": '配置重载策略 (推荐使用 "hybrid")。',
  "gateway.reload.debounceMs": "配置修改生效前的防抖缓冲时间 (毫秒)。",
  "gateway.nodes.browser.mode":
    '网页节点路由模式 ("auto" 自动选择, "manual" 手动指定, "off" 禁用)。',
  "gateway.nodes.browser.node": "固定某个特定的网页节点 ID。",
  "gateway.nodes.allowCommands":
    "允许跨节点调用的自定义命令列表。",
  "gateway.nodes.denyCommands":
    "明文禁止的节点操作命令。",
  "nodeHost.browserProxy.enabled": "启用本地浏览器控制代理服务。",
  "nodeHost.browserProxy.allowProfiles":
    "允许通过代理公开的浏览器配置文件列表。",
  "diagnostics.flags":
    '诊断日志开关 (例如 ["telegram.http"])。支持通配符 *。',
  "diagnostics.cacheTrace.enabled":
    "记录智能体运行时的缓存追踪快照 (用于故障分析)。",
  "diagnostics.cacheTrace.filePath":
    "快照存储路径 (默认 $CLAWDBOT_STATE_DIR/logs/cache-trace.jsonl)。",
  "diagnostics.cacheTrace.includeMessages":
    "快照中是否包含消息原文 (默认: true)。",
  "diagnostics.cacheTrace.includePrompt": "快照中是否包含生成提示词 (默认: true)。",
  "diagnostics.cacheTrace.includeSystem": "快照中是否包含系统指令 (默认: true)。",
  "tools.exec.applyPatch.enabled":
    "启用代码补丁自动应用功能 (实验性)。",
  "tools.exec.applyPatch.allowModels":
    '允许应用补丁的模型 ID (例如 "gpt-4o")。',
  "tools.exec.notifyOnExit":
    "后台会话退出时在主渠道发送通知回复 (默认: true)。",
  "tools.exec.pathPrepend": "运行命令时临时追加到环境变量 PATH 的目录。",
  "tools.exec.safeBins":
    "允许跨平台运行仅 stdin 的二进制文件，无需显式加入允许列表。",
  "tools.message.allowCrossContextSend":
    "旧版覆盖：允许所有服务商之间的跨上下文发送。",
  "tools.message.crossContext.allowWithinProvider":
    "允许在同一个服务商内部向其他频道发送（默认：true）。",
  "tools.message.crossContext.allowAcrossProviders":
    "允许向不同服务商的频道发送（默认：false）。",
  "tools.message.crossContext.marker.enabled":
    "跨上下文发送时添加可见的来源标记（默认：true）。",
  "tools.message.crossContext.marker.prefix":
    '跨上下文标记的前缀文本（支持 "{channel}"）。',
  "tools.message.crossContext.marker.suffix":
    '跨上下文标记的后缀文本（支持 "{channel}"）。',
  "tools.message.broadcast.enabled": "启用广播操作（默认：true）。",
  "tools.web.search.enabled": "启用 web_search 工具（需要特定的 API 密钥）。",
  "tools.web.search.provider": '搜索预测服务商 ("brave" 或 "perplexity")。',
  "tools.web.search.apiKey": "Brave 搜索 API 密钥（备选：BRAVE_API_KEY 环境变量）。",
  "tools.web.search.maxResults": "默认返回的结果数量 (1-10)。",
  "tools.web.search.timeoutSeconds": "web_search 请求的超时时间（秒）。",
  "tools.web.search.cacheTtlMinutes": "web_search 结果的缓存有效期（分钟）。",
  "tools.web.search.perplexity.apiKey":
    "Perplexity 或 OpenRouter API 密钥（备选：PERPLEXITY_API_KEY 或 OPENROUTER_API_KEY 环境变量）。",
  "tools.web.search.perplexity.baseUrl":
    "Perplexity 基础 URL（默认：https://openrouter.ai/api/v1 或 https://api.perplexity.ai）。",
  "tools.web.search.perplexity.model":
    'Perplexity 模型（默认："perplexity/sonar-pro"）。',
  "tools.web.fetch.enabled": "启用 web_fetch 工具（轻量级 HTTP 抓取）。",
  "tools.web.fetch.maxChars": "web_fetch 返回的最大字符数（将被截断）。",
  "tools.web.fetch.timeoutSeconds": "web_fetch 请求的超时时间（秒）。",
  "tools.web.fetch.cacheTtlMinutes": "web_fetch 结果的缓存有效期（分钟）。",
  "tools.web.fetch.maxRedirects": "web_fetch 允许的最大重定向次数（默认：3）。",
  "tools.web.fetch.userAgent": "覆盖 web_fetch 请求的 User-Agent 标头。",
  "tools.web.fetch.readability":
    "使用 Readability 从 HTML 中提取主体内容（备选为基本 HTML 清理）。",
  "tools.web.fetch.firecrawl.enabled": "为 web_fetch 启用 Firecrawl（如果已配置）。",
  "tools.web.fetch.firecrawl.apiKey": "Firecrawl API key (fallback: FIRECRAWL_API_KEY env var).",
  "tools.web.fetch.firecrawl.baseUrl":
    "Firecrawl 基础 URL（例如 https://api.firecrawl.dev 或自定义节点）。",
  "tools.web.fetch.firecrawl.onlyMainContent":
    "如果为 true，Firecrawl 仅返回主要内容（默认：true）。",
  "tools.web.fetch.firecrawl.maxAgeMs":
    "Firecrawl 缓存结果的最大有效期 (毫秒)。",
  "tools.web.fetch.firecrawl.timeoutSeconds": "Firecrawl 请求的超时时间（秒）。",
  "channels.slack.allowBots":
    "允许机器人消息触发 Slack 回复（默认：false）。",
  "channels.slack.thread.historyScope":
    'Slack 线程历史的作用域 ("thread" 独立于线程；"channel" 重用频道历史)。',
  "channels.slack.thread.inheritParent":
    "如果为 true，Slack 线程会話将继承父频道的转录内容（默认：false）。",
  "channels.mattermost.botToken":
    "来自 Mattermost 系统控制台 -> 集成 -> 机器人账号的 Token。",
  "channels.feishu.appId": "飞书自建应用的 App ID。",
  "channels.feishu.appSecret": "飞书自建应用的 App Secret。",
  "channels.feishu.encryptKey": "可选：飞书事件订阅的 Encrypt Key (如果启用了加密)。",
  "channels.feishu.verificationToken": "可选：飞书事件订阅的 Verification Token (用于验证请求来源)。",
  "channels.feishu.webhookPath": "可选：飞书 Webhook 接收路径 (默认: /feishu/events)。",
  "channels.mattermost.baseUrl":
    "Mattermost 服务器的基础 URL（例如：https://chat.example.com）。",
  "channels.mattermost.chatmode":
    '回复模式：被提及时回复 ("oncall")，触发字符 (">" 或 "!") 时回复 ("onchar")，或者回复每条消息 ("onmessage")。',
  "channels.mattermost.oncharPrefixes": 'onchar 模式下的触发前缀（默认：[">", "!"]）。',
  "channels.mattermost.requireMention":
    "在频道中响应前是否需要 @提及（默认：true）。",
  "auth.profiles": "命名的身份验证配置文件（服务商 + 模式 + 可选邮箱）。",
  "auth.order": "每个服务商排序后的身份验证配置文件 ID（用于自动故障转移）。",
  "auth.cooldowns.billingBackoffHours":
    "当配置文件因计费或余额不足失败时的基础退避时间（小时）（默认：5）。",
  "auth.cooldowns.billingBackoffHoursByProvider":
    "不同服务商的可选计费退避时间覆盖（小时）。",
  "auth.cooldowns.billingMaxHours": "计费退避时间上限（小时）（默认：24）。",
  "auth.cooldowns.failureWindowHours": "退避计数器的失败窗口时间（小时）（默认：24）。",
  "agents.defaults.bootstrapMaxChars":
    "在截断前注入到系统提示词中的每个工作区引导文件的最大字符数（默认：20000）。",
  "agents.defaults.repoRoot":
    "系统提示词运行时行中显示的可选仓库根路径（覆盖自动检测）。",
  "agents.defaults.envelopeTimezone":
    '消息信封的时区 ("utc", "local", "user" 或 IANA 时区字符串)。',
  "agents.defaults.envelopeTimestamp":
    '消息信封中是否包含绝对时间戳 ("on" 或 "off")。',
  "agents.defaults.envelopeElapsed": '消息信封中是否包含经过的时间 ("on" 或 "off")。',
  "agents.defaults.models": "配置的模型目录（键为完整的 服务商/模型 ID）。",
  "agents.defaults.memorySearch":
    "对 MEMORY.md 和 memory/*.md 进行向量搜索（支持每个 Agent 的自定义设置）。",
  "agents.defaults.memorySearch.sources":
    '用于记忆搜索的索引来源（默认：["memory"]；添加 "sessions" 以包含会话记录）。',
  "agents.defaults.memorySearch.experimental.sessionMemory":
    "启用实验性的会话记录索引进行记忆搜索（默认：false）。",
  "agents.defaults.memorySearch.provider": 'Embedding 服务商 ("openai", "gemini" 或 "local")。',
  "agents.defaults.memorySearch.remote.baseUrl":
    "远程 Embedding 的自定义基础 URL（支持 OpenAI 兼容代理或 Gemini 覆盖）。",
  "agents.defaults.memorySearch.remote.apiKey": "远程 Embedding 服务商的自定义 API 密钥。",
  "agents.defaults.memorySearch.remote.headers":
    "远程 Embedding 的额外标头（将进行合并；远程覆盖 OpenAI 标头）。",
  "agents.defaults.memorySearch.remote.batch.enabled":
    "启用记忆 Embedding 的批量 API（OpenAI/Gemini；默认：true）。",
  "agents.defaults.memorySearch.remote.batch.wait":
    "索引时等待批量完成（默认：true）。",
  "agents.defaults.memorySearch.remote.batch.concurrency":
    "记忆索引的最大并发嵌入批量作业数（默认：2）。",
  "agents.defaults.memorySearch.remote.batch.pollIntervalMs":
    "批量状态的轮询间隔（毫秒）（默认：2000）。",
  "agents.defaults.memorySearch.remote.batch.timeoutMinutes":
    "批量索引的超时时间（分钟）（默认：60）。",
  "agents.defaults.memorySearch.local.modelPath":
    "本地 GGUF 模型路径 or hf: URI (node-llama-cpp)。",
  "agents.defaults.memorySearch.fallback":
    '当 Embedding 失败时的回退服务商 ("openai", "gemini", "local" 或 "none")。',
  "agents.defaults.memorySearch.store.path":
    "SQLite 索引路径 (默认: ~/.clawdbot/memory/{agentId}.sqlite)。",
  "agents.defaults.memorySearch.store.vector.enabled":
    "为向量搜索启用 sqlite-vec 扩展 (默认: true)。",
  "agents.defaults.memorySearch.store.vector.extensionPath":
    "Optional override path to sqlite-vec extension library (.dylib/.so/.dll).",
  "agents.defaults.memorySearch.query.hybrid.enabled":
    "为记忆启用混合 BM25 + 向量搜索 (默认: true)。",
  "agents.defaults.memorySearch.query.hybrid.vectorWeight":
    "合并结果时向量相似度的权重 (0-1)。",
  "agents.defaults.memorySearch.query.hybrid.textWeight":
    "Merged weight for BM25 text relevance (0-1).",
  "agents.defaults.memorySearch.query.hybrid.candidateMultiplier":
    "Multiplier for candidate pool size (default: 4).",
  "agents.defaults.memorySearch.cache.enabled":
    "在 SQLite 中缓存块 Embedding 以加速重新索引和频繁更新 (默认: true)。",
  "agents.defaults.memorySearch.cache.maxEntries":
    "Optional cap on cached embeddings (best-effort).",
  "agents.defaults.memorySearch.sync.onSearch":
    "懒加载同步：在搜索后根据变更调度重新索引。",
  "agents.defaults.memorySearch.sync.watch": "监听记忆文件更改 (chokidar)。",
  "agents.defaults.memorySearch.sync.sessions.deltaBytes":
    "在会话记录触发重新索引前所需的最小追加字节数（默认：100000）。",
  "agents.defaults.memorySearch.sync.sessions.deltaMessages":
    "在会话记录触发重新索引前所需的最小追加 JSONL 行数（默认：50）。",
  "plugins.enabled": "允许加载插件/扩展（默认：true）。",
  "plugins.allow": "可选的插件 ID 允许列表；设置后仅加载列表中的插件。",
  "plugins.deny": "可选的插件 ID 拒绝列表；拒绝优先于允许列表。",
  "plugins.load.paths": "要加载的其他插件文件或目录。",
  "plugins.slots": "选择哪些插件拥有独占插槽（例如：记忆插件）。",
  "plugins.slots.memory":
    '通过 ID 选择活动的记忆插件，或设为 "none" 以禁用记忆插件。',
  "plugins.entries": "按插件 ID 指定的设置（启用/禁用 + 配置负载）。",
  "plugins.entries.*.enabled": "为此条目覆盖插件的启用/禁用设置（需要重启）。",
  "plugins.entries.*.config": "插件定义的配置负载（由插件提供架构）。",
  "plugins.installs":
    "CLI 管理的安装元数据（由 `clawdbot plugins update` 用于定位安装源）。",
  "plugins.installs.*.source": '安装源 ("npm", "archive" 或 "path")。',
  "plugins.installs.*.spec": "安装时使用的原始 npm 规范（如果来源是 npm）。",
  "plugins.installs.*.sourcePath": "用于安装的原始存档或路径（如果有）。",
  "plugins.installs.*.installPath":
    "解析后的安装目录（通常为 ~/.clawdbot/extensions/<id>）。",
  "plugins.installs.*.version": "安装时记录的版本号（如果有）。",
  "plugins.installs.*.installedAt": "最后一次安装/更新的 ISO 时间戳。",
  "agents.defaults.model.primary": "主模型 (provider/model).",
  "agents.defaults.model.fallbacks":
    "有序的回退模型 (服务商/模型)。用于主模型失败时。",
  "agents.defaults.imageModel.primary":
    "可选的图像模型 (服务商/模型)，当主模型不支持图像输入时使用。",
  "agents.defaults.imageModel.fallbacks": "有序的回退图像模型 (服务商/模型)。",
  "agents.defaults.cliBackends": "文本回退的可选 CLI 后端 (claude-cli 等)。",
  "agents.defaults.humanDelay.mode": '回复延迟风格 ("off", "natural", "custom")。',
  "agents.defaults.humanDelay.minMs": "自定义延迟的最小毫秒数 (默认: 800)。",
  "agents.defaults.humanDelay.maxMs": "自定义延迟的最大毫秒数 (默认: 2500)。",
  "commands.native":
    "在支持的频道 (Discord/Slack/Telegram) 中注册原生命令。",
  "commands.nativeSkills":
    "在支持的频道中注册原生技能命令 (用户可调用的技能)。",
  "commands.text": "允许解析文本命令 (仅限斜杠命令)。",
  "commands.bash":
    "允许 bash 聊天命令 (`!`; `/bash` 别名) 运行宿主机外壳命令 (默认: false; 需要 tools.elevated)。",
  "commands.bashForegroundMs":
    "bash 在后台运行前的等待时长 (默认: 2000; 0 表示立即转入后台)。",
  "commands.config": "允许 /config 聊天命令读写磁盘上的配置 (默认: false)。",
  "commands.debug": "允许 /debug 聊天命令进行仅限运行时的覆盖 (默认: false)。",
  "commands.restart": "允许 /restart 和 gateway 重启工具操作 (默认: false)。",
  "commands.useAccessGroups": "对命令强制执行访问组允许列表/策略。",
  "session.dmScope":
    '私聊会话作用域: "main" 保持连续性; "per-peer" 或 "per-channel-peer" 隔离私聊历史 (建议用于共享收件箱)。',
  "session.identityLinks":
    "将规范身份映射到带有服务商前缀的 Peer ID 以进行私聊会话链接 (例如: telegram:123456)。",
  "channels.telegram.configWrites":
    "允许 Telegram 响应频道事件/命令读写配置 (默认: true)。",
  "channels.slack.configWrites":
    "允许 Slack 响应频道事件/命令读写配置 (默认: true)。",
  "channels.mattermost.configWrites":
    "允许 Mattermost 响应频道事件/命令读写配置 (默认: true)。",
  "channels.discord.configWrites":
    "允许 Discord 响应频道事件/命令读写配置 (默认: true)。",
  "channels.whatsapp.configWrites":
    "允许 WhatsApp 响应频道事件/命令读写配置 (默认: true)。",
  "channels.signal.configWrites":
    "允许 Signal 响应频道事件/命令读写配置 (默认: true)。",
  "channels.imessage.configWrites":
    "允许 iMessage 响应频道事件/命令读写配置 (默认: true)。",
  "channels.msteams.configWrites":
    "允许 Microsoft Teams 响应频道事件/命令读写配置 (默认: true)。",
  "channels.discord.commands.native": '覆盖 Discord 的原生命令 (布尔值或 "auto")。',
  "channels.discord.commands.nativeSkills":
    '覆盖 Discord 的原生技能命令 (布尔值或 "auto")。',
  "channels.telegram.commands.native": '覆盖 Telegram 的原生命令 (布尔值或 "auto")。',
  "channels.telegram.commands.nativeSkills":
    '覆盖 Telegram 的原生技能命令 (布尔值或 "auto")。',
  "channels.slack.commands.native": '覆盖 Slack 的原生命令 (布尔值或 "auto")。',
  "channels.slack.commands.nativeSkills":
    '覆盖 Slack 的原生技能命令 (布尔值或 "auto")。',
  "session.agentToAgent.maxPingPongTurns":
    "请求者与目标之间的最大往返回复次数 (0–5)。",
  "channels.telegram.customCommands":
    "额外的 Telegram 机器人菜单命令 (与原生命令合并; 冲突将被忽略)。",
  "messages.ackReaction": "用于确认收到消息的表情符号回应 (为空则禁用)。",
  "messages.ackReactionScope":
    '何时发送确认回应 ("group-mentions", "group-all", "direct", "all")。',
  "messages.inbound.debounceMs":
    "对来自同一发送者的快速入站消息进行批处理的防抖窗口 (0 表示禁用)。",
  "channels.telegram.dmPolicy":
    '私聊访问控制 (建议使用 "pairing")。"open" 需要 channels.telegram.allowFrom=["*"]。',
  "channels.telegram.streamMode":
    "Telegram 回复的草稿流模式 (off | partial | block)。独立于分块流模式; 需要私有主题 + sendMessageDraft。",
  "channels.telegram.draftChunk.minChars":
    '在 channels.telegram.streamMode="block" 时触发 Telegram 草稿更新所需的最小字符数 (默认: 200)。',
  "channels.telegram.draftChunk.maxChars":
    '在 channels.telegram.streamMode="block" 时 Telegram 草稿更新块的目标最大大小 (默认: 800; 受限于 channels.telegram.textChunkLimit)。',
  "channels.telegram.draftChunk.breakPreference":
    "Telegram 草稿块的首选分断点 (paragraph | newline | sentence)。默认: paragraph。",
  "channels.telegram.retry.attempts":
    "Telegram API 调用失败时的最大重试次数 (默认: 3)。",
  "channels.telegram.retry.minDelayMs": "Telegram API 调用重试的最小延迟 (毫秒)。",
  "channels.telegram.retry.maxDelayMs":
    "Telegram API 调用重试的最大延迟上限 (毫秒)。",
  "channels.telegram.retry.jitter": "应用于 Telegram 重试延迟的抖动因子 (0-1)。",
  "channels.telegram.timeoutSeconds":
    "Telegram API 请求超时秒数 (默认: 500)。",
  "channels.whatsapp.dmPolicy":
    '私聊访问控制 (建议使用 "pairing")。"open" 需要 channels.whatsapp.allowFrom=["*"]。',
  "channels.whatsapp.selfChatMode": "同机模式 (机器人使用你个人的 WhatsApp 号码)。",
  "channels.whatsapp.debounceMs":
    "对来自同一发送者的连续快速消息进行批处理的防抖窗口 (0 表示禁用)。",
  "channels.signal.dmPolicy":
    '私聊访问控制 (建议使用 "pairing")。"open" 需要 channels.signal.allowFrom=["*"]。',
  "channels.imessage.dmPolicy":
    '私聊访问控制 (建议使用 "pairing")。"open" 需要 channels.imessage.allowFrom=["*"]。',
  "channels.bluebubbles.dmPolicy":
    '私聊访问控制 (建议使用 "pairing")。"open" 需要 channels.bluebubbles.allowFrom=["*"]。',
  "channels.discord.dm.policy":
    '私聊访问控制 (建议使用 "pairing")。"open" 需要 channels.discord.dm.allowFrom=["*"]。',
  "channels.discord.retry.attempts":
    "Discord API 调用失败时的最大重试次数 (默认: 3)。",
  "channels.discord.retry.minDelayMs": "Discord API 调用重试的最小延迟 (毫秒)。",
  "channels.discord.retry.maxDelayMs":
    "Discord API 调用重试的最大延迟上限 (毫秒)。",
  "channels.discord.retry.jitter": "应用于 Discord 重试延迟的抖动因子 (0-1)。",
  "channels.discord.maxLinesPerMessage": "单条 Discord 消息的最大行数 (默认: 17)。",
  "channels.slack.dm.policy":
    '私聊访问控制 (建议使用 "pairing")。"open" 需要 channels.slack.dm.allowFrom=["*"]。',
  "models.mode": "模型配置的合并策略（'merge' 将新模型添加到默认列表中；'replace' 则完全替换默认列表）。",
  "models.providers": "配置自定义 LLM 供应商。键名为供应商标识符（如 'openai', 'anthropic', 'zhipu' 等）。",
  "models.providers.*.baseUrl": "API 服务的基础 URL。对于 OpenAI 兼容服务，应包含到 v1 或类似的末尾。",
  "models.providers.*.apiKey": "访问该供应商 API 时使用的密钥（不填则尝试从环境变量读取）。",
  "models.providers.*.models": "在此供应商下定义的一组模型及其能力。",
  "models.providers.*.models.*.id": "模型在 API 中的真实 ID（例如 'gpt-4o' 或 'glm-4-flash'）。",
  "models.providers.*.models.*.name": "在界面上显示的友好名称。",
  "models.bedrockDiscovery.enabled": "是否自动探测并添加 AWS Bedrock 中已授权的模型（需要 AWS SDK 凭证）。",
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  "gateway.remote.url": "ws://host:18789",
  "gateway.remote.tlsFingerprint": "sha256:ab12cd34…",
  "gateway.remote.sshTarget": "user@host",
  "gateway.controlUi.basePath": "/clawdbot",
  "channels.mattermost.baseUrl": "https://chat.example.com",
  "agents.list.*.identity.avatar": "avatars/clawd.png",
};

const SENSITIVE_PATTERNS = [/token/i, /password/i, /secret/i, /api.?key/i];

function isSensitivePath(path: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(path));
}

type JsonSchemaObject = JsonSchemaNode & {
  type?: string | string[];
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
  additionalProperties?: JsonSchemaObject | boolean;
};

function cloneSchema<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function asSchemaObject(value: unknown): JsonSchemaObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonSchemaObject;
}

function isObjectSchema(schema: JsonSchemaObject): boolean {
  const type = schema.type;
  if (type === "object") return true;
  if (Array.isArray(type) && type.includes("object")) return true;
  return Boolean(schema.properties || schema.additionalProperties);
}

function mergeObjectSchema(base: JsonSchemaObject, extension: JsonSchemaObject): JsonSchemaObject {
  const mergedRequired = new Set<string>([...(base.required ?? []), ...(extension.required ?? [])]);
  const merged: JsonSchemaObject = {
    ...base,
    ...extension,
    properties: {
      ...base.properties,
      ...extension.properties,
    },
  };
  if (mergedRequired.size > 0) {
    merged.required = Array.from(mergedRequired);
  }
  const additional = extension.additionalProperties ?? base.additionalProperties;
  if (additional !== undefined) merged.additionalProperties = additional;
  return merged;
}

function buildBaseHints(): ConfigUiHints {
  const hints: ConfigUiHints = {};
  for (const [group, label] of Object.entries(GROUP_LABELS)) {
    hints[group] = {
      label,
      group: label,
      order: GROUP_ORDER[group],
    };
  }
  for (const [path, label] of Object.entries(FIELD_LABELS)) {
    const current = hints[path];
    hints[path] = current ? { ...current, label } : { label };
  }
  for (const [path, help] of Object.entries(FIELD_HELP)) {
    const current = hints[path];
    hints[path] = current ? { ...current, help } : { help };
  }
  for (const [path, placeholder] of Object.entries(FIELD_PLACEHOLDERS)) {
    const current = hints[path];
    hints[path] = current ? { ...current, placeholder } : { placeholder };
  }
  return hints;
}

function applySensitiveHints(hints: ConfigUiHints): ConfigUiHints {
  const next = { ...hints };
  for (const key of Object.keys(next)) {
    if (isSensitivePath(key)) {
      next[key] = { ...next[key], sensitive: true };
    }
  }
  return next;
}

function applyPluginHints(hints: ConfigUiHints, plugins: PluginUiMetadata[]): ConfigUiHints {
  const next: ConfigUiHints = { ...hints };
  for (const plugin of plugins) {
    const id = plugin.id.trim();
    if (!id) continue;
    const name = (plugin.name ?? id).trim() || id;
    const basePath = `plugins.entries.${id}`;

    next[basePath] = {
      ...next[basePath],
      label: name,
      help: plugin.description
        ? `${plugin.description} (plugin: ${id})`
        : `Plugin entry for ${id}.`,
    };
    next[`${basePath}.enabled`] = {
      ...next[`${basePath}.enabled`],
      label: `Enable ${name}`,
    };
    next[`${basePath}.config`] = {
      ...next[`${basePath}.config`],
      label: `${name} Config`,
      help: `Plugin-defined config payload for ${id}.`,
    };

    const uiHints = plugin.configUiHints ?? {};
    for (const [relPathRaw, hint] of Object.entries(uiHints)) {
      const relPath = relPathRaw.trim().replace(/^\./, "");
      if (!relPath) continue;
      const key = `${basePath}.config.${relPath}`;
      next[key] = {
        ...next[key],
        ...hint,
      };
    }
  }
  return next;
}

function applyChannelHints(hints: ConfigUiHints, channels: ChannelUiMetadata[]): ConfigUiHints {
  const next: ConfigUiHints = { ...hints };
  for (const channel of channels) {
    const id = channel.id.trim();
    if (!id) continue;
    const basePath = `channels.${id}`;
    const current = next[basePath] ?? {};
    const label = channel.label?.trim();
    const help = channel.description?.trim();
    next[basePath] = {
      ...current,
      ...(label ? { label } : {}),
      ...(help ? { help } : {}),
    };

    const uiHints = channel.configUiHints ?? {};
    for (const [relPathRaw, hint] of Object.entries(uiHints)) {
      const relPath = relPathRaw.trim().replace(/^\./, "");
      if (!relPath) continue;
      const key = `${basePath}.${relPath}`;
      next[key] = {
        ...next[key],
        ...hint,
      };
    }
  }
  return next;
}

function listHeartbeatTargetChannels(channels: ChannelUiMetadata[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const id of CHANNEL_IDS) {
    const normalized = id.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    ordered.push(normalized);
  }
  for (const channel of channels) {
    const normalized = channel.id.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    ordered.push(normalized);
  }
  return ordered;
}

function applyHeartbeatTargetHints(
  hints: ConfigUiHints,
  channels: ChannelUiMetadata[],
): ConfigUiHints {
  const next: ConfigUiHints = { ...hints };
  const channelList = listHeartbeatTargetChannels(channels);
  const channelHelp = channelList.length ? ` Known channels: ${channelList.join(", ")}.` : "";
  const help = `Delivery target ("last", "none", or a channel id).${channelHelp}`;
  const paths = ["agents.defaults.heartbeat.target", "agents.list.*.heartbeat.target"];
  for (const path of paths) {
    const current = next[path] ?? {};
    next[path] = {
      ...current,
      help: current.help ?? help,
      placeholder: current.placeholder ?? "last",
    };
  }
  return next;
}

function applyPluginSchemas(schema: ConfigSchema, plugins: PluginUiMetadata[]): ConfigSchema {
  const next = cloneSchema(schema);
  const root = asSchemaObject(next);
  const pluginsNode = asSchemaObject(root?.properties?.plugins);
  const entriesNode = asSchemaObject(pluginsNode?.properties?.entries);
  if (!entriesNode) return next;

  const entryBase = asSchemaObject(entriesNode.additionalProperties);
  const entryProperties = entriesNode.properties ?? {};
  entriesNode.properties = entryProperties;

  for (const plugin of plugins) {
    if (!plugin.configSchema) continue;
    const entrySchema = entryBase
      ? cloneSchema(entryBase)
      : ({ type: "object" } as JsonSchemaObject);
    const entryObject = asSchemaObject(entrySchema) ?? ({ type: "object" } as JsonSchemaObject);
    const baseConfigSchema = asSchemaObject(entryObject.properties?.config);
    const pluginSchema = asSchemaObject(plugin.configSchema);
    const nextConfigSchema =
      baseConfigSchema &&
      pluginSchema &&
      isObjectSchema(baseConfigSchema) &&
      isObjectSchema(pluginSchema)
        ? mergeObjectSchema(baseConfigSchema, pluginSchema)
        : cloneSchema(plugin.configSchema);

    entryObject.properties = {
      ...entryObject.properties,
      config: nextConfigSchema,
    };
    entryProperties[plugin.id] = entryObject;
  }

  return next;
}

function applyChannelSchemas(schema: ConfigSchema, channels: ChannelUiMetadata[]): ConfigSchema {
  const next = cloneSchema(schema);
  const root = asSchemaObject(next);
  const channelsNode = asSchemaObject(root?.properties?.channels);
  if (!channelsNode) return next;
  const channelProps = channelsNode.properties ?? {};
  channelsNode.properties = channelProps;

  for (const channel of channels) {
    if (!channel.configSchema) continue;
    const existing = asSchemaObject(channelProps[channel.id]);
    const incoming = asSchemaObject(channel.configSchema);
    if (existing && incoming && isObjectSchema(existing) && isObjectSchema(incoming)) {
      channelProps[channel.id] = mergeObjectSchema(existing, incoming);
    } else {
      channelProps[channel.id] = cloneSchema(channel.configSchema);
    }
  }

  return next;
}

let cachedBase: ConfigSchemaResponse | null = null;

function stripChannelSchema(schema: ConfigSchema): ConfigSchema {
  const next = cloneSchema(schema);
  const root = asSchemaObject(next);
  if (!root || !root.properties) return next;
  const channelsNode = asSchemaObject(root.properties.channels);
  if (channelsNode) {
    channelsNode.properties = {};
    channelsNode.required = [];
    channelsNode.additionalProperties = true;
  }
  return next;
}

function buildBaseConfigSchema(): ConfigSchemaResponse {
  if (cachedBase) return cachedBase;
  const schema = ClawdbotSchema.toJSONSchema({
    target: "draft-07",
    unrepresentable: "any",
  });
  schema.title = "ClawdbotConfig";
  const hints = applySensitiveHints(buildBaseHints());
  const next = {
    schema: stripChannelSchema(schema),
    uiHints: hints,
    version: VERSION,
    generatedAt: new Date().toISOString(),
  };
  cachedBase = next;
  return next;
}

export function buildConfigSchema(params?: {
  plugins?: PluginUiMetadata[];
  channels?: ChannelUiMetadata[];
}): ConfigSchemaResponse {
  const base = buildBaseConfigSchema();
  const plugins = params?.plugins ?? [];
  const channels = params?.channels ?? [];
  if (plugins.length === 0 && channels.length === 0) return base;
  const mergedHints = applySensitiveHints(
    applyHeartbeatTargetHints(
      applyChannelHints(applyPluginHints(base.uiHints, plugins), channels),
      channels,
    ),
  );
  const mergedSchema = applyChannelSchemas(applyPluginSchemas(base.schema, plugins), channels);
  return {
    ...base,
    schema: mergedSchema,
    uiHints: mergedHints,
  };
}
