```markdown
---
summary: "企业微信 (WeCom) 渠道集成：设置、Webhook、私信、群组、加密和消息接收。"
read_when:
  - 配置企业微信自建应用渠道
---

# 企业微信 (WeCom)

状态：通过企业微信“自建应用”集成。网关通过 Webhook 接收加密的消息事件，并使用 API 发送回复。

## 快速设置
1) 登录 [企业微信管理后台](https://work.weixin.qq.com/wework_admin/loginpage_wx)。
2) 进入 **应用管理** -> **应用** -> **自建**，创建一个新应用（如 "Clawdbot"）。
3) 获取应用的 `AgentId` 和 `Secret`。
4) 在 **我的企业** 页面获取 `CorpID`。
5) 在应用详情页点击 **接收消息** -> **设置 API 接收**：
   - **URL**: `http://your-host:port/api/plugins/wecom/webhook/default` (如果是多账号，请将 `default` 替换为账号 ID)。
   - **Token**: 随机获取或手动设置。
   - **EncodingAESKey**: 随机获取。
6) 将这些信息配置到 `~/.clawdbot/clawdbot.json` 中。
7) 保存应用设置（企业微信会发送一个验证请求）。

最小配置：
```json5
{
  channels: {
    wecom: {
      corpId: "ww123...",
      agentId: "1000001",
      secret: "your-app-secret",
      token: "your-token",
      encodingAesKey: "your-aes-key",
      allowFrom: ["UserID1", "UserID2"]
    }
  }
}
```

## 配置项详解

| 配置项 | 类型 | 描述 |
| --- | --- | --- |
| `corpId` | 字符串 | 企业 ID (CorpID) |
| `agentId` | 字符串 | 应用的 AgentId |
| `secret` | 字符串 | 应用的 Secret |
| `token` | 字符串 | 用于验证 Webhook 的 Token |
| `encodingAesKey` | 字符串 | 用于加密消息的 EncodingAESKey |
| `dmPolicy` | 字符串 | 私信策略：`pairing` (配对), `allowlist` (白名单), `open` (开放), `disabled` (禁用) |
| `allowFrom` | 字符串数组 | 允许触发机器人的 UserID 白名单 |
| `groupPolicy` | 字符串 | 群组策略：`allowlist` (白名单), `open` (开放), `disabled` (禁用) |
| `historyLimit` | 数字 | 包含最后 N 条消息作为上下文（默认：50） |
| `mediaMaxMb` | 数字 | 入站媒体的大小限制（单位：MB） |

## 验证与通信
- **验证 URL**：配置 Webhook 时，企业微信会向你的 URL 发送一个带有 `echostr` 参数的 GET 请求。网关会自动解密并返回该字符串以完成验证。
- **消息加密**：所有入站消息均通过 AES-256-CBC 加密。网关会自动处理加解密。

## 机器人权限
确保应用拥有以下权限：
- 发送消息权限（默认拥有）。
- 如果需要接收消息，必须正确设置 API 接收 URL。

## 局限性
- **响应时间**：企业微信要求 Webhook 在 5 秒内响应。网关会立即确认请求并在后台异步处理。
- **群组消息**：目前主要支持自建应用的单聊。群组机器人（通过 Webhook Key 触发的）与此自建应用集成不同。

```
