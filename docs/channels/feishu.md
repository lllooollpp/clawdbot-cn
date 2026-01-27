---
title: "飞书 (Feishu/Lark)"
description: "配置指引：如何通过飞书开放平台 Webhook 将飞书连接到 Clawdbot。"
---

# 飞书 (Feishu/Lark) Lobster 🦞

飞书渠道允许你通过飞书开放平台的「机器人」能力，将 Clawdbot 加入到你的飞书私聊或群聊中。支持文字消息、图片消息以及回复引用的处理。

## 准备工作

1.  访问 [飞书开放平台](https://open.feishu.cn/)。
2.  创建一个新的企业自建应用。
3.  在应用管理页面的「添加能力」中，点击添加「机器人」能力。
4.  在应用管理页面的「凭证与基础信息」中，记录下 `App ID` 和 `App Secret`。

## 配置 Clawdbot

你可以通过仪表盘（Web UI）或直接修改配置文件来启用飞书渠道。

### 方式 A：配置文件 (`clawdbot.json`)

在 `channels.feishu` 部分添加配置：

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_xxxxxxxxxxxx",
      "appSecret": "xxxxxxxxxxxxxxxxxxxxxxxx",
      "verificationToken": "xxxxxxxxxxxxxxxxxxxxxxxx" // 可选
    }
  }
}
```

### 方式 B：环境变量

如果你不想将密钥写入配置文件，也可以使用环境变量：

- `FEISHU_APP_ID`: 你的 App ID。
- `FEISHU_APP_SECRET`: 你的 App Secret。
- `FEISHU_VERIFICATION_TOKEN`: 用于 Webhook 校验（可选）。

## 配置 Webhook

1.  在飞书开放平台管理后台，找到你的应用。
2.  进入「事件订阅」页面。
3.  设置 **请求地址 (Webhook URL)**。
    -   如果你的 Clawdbot 运行在本地且已暴露到公网（或使用隧道），地址格式为：
        `http://<你的域名>/api/plugins/feishu/webhook/default`
    -   如果是多账号配置，请将 `default` 替换为对应的账号名。
4.  点击「验证」按钮。飞书会发送一条 `url_verification` 消息，Clawdbot 会自动处理并返回校验结果。
5.  在下方「添加事件」中，搜索并添加以下事件权限：
    -   `im.message.receive_v1` (接收消息 v1.0)
6.  确保你的应用已发布并由管理员审核通过（如果是企业自建应用，管理员通常就是你自己）。

## 权限设置

为了让机器人正常运行，你需要开启以下 API 权限：

-   `im:message` (接收消息)
-   `im:message.p2p_msg` (读取用户发给机器人的单聊消息)
-   `im:message:send_as_bot` (以机器人身份发送消息)
-   `im:chat:readonly` (获取群组信息)

## 特性说明

-   **私聊**：直接向机器人发送消息。
-   **群聊**：将机器人拉入群组。默认情况下，机器人仅在被 `@提及` 时回复。你可以在 `channels.feishu.groups` 中配置 `requireMention: false` 来让它监听所有消息。
-   **线程与回复**：Clawdbot 会正确解析飞书的回复引用，并将其作为上下文关联到对话中。
-   **多账号支持**：通过 `channels.feishu.accounts` 配置多个机器人，每个机器人有独立的 Webhook 路径。

## 故障排除

-   **Webhook 验证失败**：检查 Clawdbot 网关是否正在运行，并且 Webhook URL 是否可以从公网访问。
-   **消息不回复**：检查机器人是否有 `im:message:send_as_bot` 权限，并确保应用已发布。
-   **群组消息无反应**：确保机器人已加入群组，且你已在消息中 `@提及` 了它（除非已关闭 `requireMention`）。
