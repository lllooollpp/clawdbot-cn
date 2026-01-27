---
summary: "Zalo bot support status, capabilities, and configuration"
read_when:
  - Working on Zalo features or webhooks
---

# Zalo（Bot API）

状态：实验性。仅支持直接消息；根据 Zalo 文档，群组功能即将推出。

## 需要的插件
Zalo 作为插件提供，并不包含在核心安装中。
- 通过 CLI 安装：`clawdbot plugins install @clawdbot/zalo`
- 或在引导过程中选择 **Zalo** 并确认安装提示
- 详情：[插件](/plugin)

## 快速设置（初学者）
1) 安装 Zalo 插件：
   - 从源代码目录安装：`clawdbot plugins install ./extensions/zalo`
   - 从 npm 安装（如果已发布）：`clawdbot plugins install @clawdbot/zalo`
   - 或在引导过程中选择 **Zalo** 并确认安装提示
2) 设置令牌：
   - 环境变量：`ZALO_BOT_TOKEN=...`
   - 或配置文件：`channels.zalo.botToken: "..."`。
3) 重启网关（或完成引导流程）。
4) 默认情况下，直接消息访问是配对的；在首次联系时请批准配对码。

最小配置：
json5
{
  channels: {
    zalo: {
      enabled: true,
      botToken: "12345689:abc-xyz",
      dmPolicy: "pairing"
    }
  }
}
`````````
## 什么是 Zalo
Zalo 是一款专注于越南市场的即时通讯应用；其 Bot API 允许网关运行一个用于一对一对话的机器人。
它非常适合需要确定性路由回 Zalo 的支持或通知场景。
- 由网关拥有的 Zalo Bot API 通道。
- 确定性路由：回复会返回到 Zalo；模型永远不会选择其他通道。
- 私信共享代理的主要会话。
- 尚不支持群组（Zalo 文档说明“即将推出”）。

## 快速设置步骤

### 1) 创建机器人令牌（Zalo Bot 平台）
1) 访问 **https://bot.zaloplatforms.com** 并登录。
2) 创建一个新的机器人并配置其设置。
3) 复制机器人令牌（格式：`12345689:abc-xyz`）。

### 2) 配置令牌（环境变量或配置文件）
示例：```json5
{
  channels: {
    zalo: {
      enabled: true,
      botToken: "12345689:abc-xyz",
      dmPolicy: "pairing"
    }
  }
}
```
选项: `ZALO_BOT_TOKEN=...`（仅适用于默认账户）。

多账户支持: 使用 `channels.zalo.accounts`，每个账户可以设置独立的token，并可选设置 `name`。

3) 重启网关。当token被解析（环境变量或配置）时，Zalo会启动。
4) 私信默认为配对模式。当机器人第一次被联系时，需要批准代码。

## 工作原理（行为）
- 入站消息会被归一化为共享频道的信封，并带有媒体占位符。
- 回复消息总是会路由回同一个Zalo聊天。
- 默认使用长轮询；可通过 `channels.zalo.webhookUrl` 启用Webhook模式。

## 限制
- 出站文本消息会被拆分为2000个字符（Zalo API限制）。
- 媒体下载/上传受 `channels.zalo.mediaMaxMb` 限制（默认为5）。
- 默认阻止流式传输，因为2000字符限制使得流式传输不太有用。

## 访问控制（私信）

### 私信访问
- 默认设置: `channels.zalo.dmPolicy = "pairing"`。未知发件人会收到配对代码；在未批准前消息会被忽略（代码一小时后过期）。
- 批准方式：
  - `clawdbot pairing list zalo`
  - `clawdbot pairing approve zalo <CODE>`
- 配对是默认的token交换方式。详情请参见：[配对](/start/pairing)
- `channels.zalo.allowFrom` 仅接受数字用户ID（不支持用户名查找）。

## 长轮询 vs Webhook
- 默认: 长轮询（不需要公开URL）。
- Webhook模式：设置 `channels.zalo.webhookUrl` 和 `channels.zalo.webhookSecret`。
  - Webhook密钥必须为8-256个字符。
  - Webhook URL必须使用HTTPS。
  - Zalo通过 `X-Bot-Api-Secret-Token` 请求头发送事件以进行验证。
  - 网关HTTP会在 `channels.zalo.webhookPath` 处理Webhook请求（默认为Webhook URL路径）。

**注意:** 根据Zalo API文档，getUpdates（轮询）和Webhook是互斥的。

## 支持的消息类型
- **文本消息**: 完全支持，消息会被拆分为2000字符的块。
- **图片消息**: 下载并处理入站图片；可通过 `sendPhoto` 发送图片。
- **表情包**: 会被记录，但未完全处理（无代理响应）。
- **不支持的类型**: 会被记录（例如来自受保护用户的消息）。

## 功能支持情况
| 功能 | 状态 |
|---------|--------|
| 私信 | ✅ 支持 |
| 群组 | ❌ 即将支持（根据Zalo文档） |
| 媒体（图片） | ✅ 支持 |
| 表情反应 | ❌ 不支持 |
| 线程 | ❌ 不支持 |
| 投票 | ❌ 不支持 |
| 原生命令 | ❌ 不支持 |
| 流式传输 | ⚠️ 被阻止（受2000字符限制影响） |

## 交付目标（CLI/定时任务）
- 使用聊天ID作为目标。
- 示例: `clawdbot message send --channel zalo --target 123456789 --message "hi"`。

## 故障排除

**机器人无响应:**
- 检查token是否有效: `clawdbot channels status --probe`
- 确认发送者已被批准（配对或 allowFrom）
- 检查网关日志: `clawdbot logs --follow`

**Webhook 未接收到事件：**
- 确保 Webhook URL 使用 HTTPS
- 验证 Secret Token 的长度为 8-256 个字符
- 确认网关的 HTTP 端点在配置的路径下可访问
- 检查 getUpdates 轮询是否正在运行（它们是互斥的）

## 配置参考（Zalo）
完整配置：[Configuration](/gateway/configuration)

提供者选项：
- `channels.zalo.enabled`: 启用/禁用频道启动。
- `channels.zalo.botToken`: 从 Zalo Bot 平台获取的 Bot Token。
- `channels.zalo.tokenFile`: 从文件路径读取 Token。
- `channels.zalo.dmPolicy`: `pairing | allowlist | open | disabled`（默认：pairing）。
- `channels.zalo.allowFrom`: DM 允许列表（用户 ID）。`open` 需要 `"*"`。向导会提示输入数字 ID。
- `channels.zalo.mediaMaxMb`: 入站/出站媒体限制（MB，默认为 5）。
- `channels.zalo.webhookUrl`: 启用 Webhook 模式（需要 HTTPS）。
- `channels.zalo.webhookSecret`: Webhook 秘钥（8-256 个字符）。
- `channels.zalo.webhookPath`: 网关 HTTP 服务器上的 Webhook 路径。
- `channels.zalo.proxy`: API 请求的代理 URL。

多账号选项：
- `channels.zalo.accounts.<id>.botToken`: 每个账号的 Bot Token。
- `channels.zalo.accounts.<id>.tokenFile`: 每个账号的 Token 文件路径。
- `channels.zalo.accounts.<id>.name`: 显示名称。
- `channels.zalo.accounts.<id>.enabled`: 启用/禁用该账号。
- `channels.zalo.accounts.<id>.dmPolicy`: 每个账号的 DM 策略。
- `channels.zalo.accounts.<id>.allowFrom`: 每个账号的允许列表。
- `channels.zalo.accounts.<id>.webhookUrl`: 每个账号的 Webhook URL。
- `channels.zalo.accounts.<id>.webhookSecret`: 每个账号的 Webhook 秘钥。
- `channels.zalo.accounts.<id>.webhookPath`: 每个账号的 Webhook 路径。
- `channels.zalo.accounts.<id>.proxy`: 每个账号的代理 URL。