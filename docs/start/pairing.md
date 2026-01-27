---
summary: "Pairing overview: approve who can DM you + which nodes can join"
read_when:
  - Setting up DM access control
  - Pairing a new iOS/Android node
  - Reviewing Clawdbot security posture
---

# 配对

“配对”是Clawdbot的显式 **所有者批准** 步骤。
它在两个地方使用：

1) **DM配对**（谁被允许与机器人交谈）
2) **节点配对**（哪些设备/节点被允许加入网关网络）

安全上下文：[安全](/gateway/security)

## 1) DM配对（入站聊天访问）

当一个频道配置了DM策略为 `pairing` 时，未知发送者会收到一个短代码，且他们的消息在你批准之前 **不会被处理**。

默认的DM策略在以下位置有文档说明：[安全](/gateway/security)

配对代码：
- 8个字符，全大写，没有易混淆的字符（`0O1I`）。
- **1小时后过期**。机器人仅在创建新请求时发送配对消息（大致每小时每个发送者一次）。
- 默认情况下，每个频道的待处理DM配对请求限制为 **3个**；在其中一个过期或被批准之前，其他请求将被忽略。

### 批准一个发送者
bash
clawdbot pairing list telegram
clawdbot pairing approve telegram <CODE>
``````
支持的渠道：`telegram`、`whatsapp`、`signal`、`imessage`、`discord`、`slack`。

### 何处存储状态

存储在 `~/.clawdbot/credentials/` 目录下：
- 待处理的请求：`<channel>-pairing.json`
- 已批准的白名单存储：`<channel>-allowFrom.json`

请将这些文件视为敏感信息（它们控制对你的助手的访问权限）。

## 2) 节点设备配对（iOS/Android/macOS/无头节点）

节点以 **设备** 的身份连接到网关，角色为 `role: node`。网关会创建一个设备配对请求，该请求必须被批准。

### 批准节点设备```bash
clawdbot devices list
clawdbot devices approve <requestId>
clawdbot devices reject <requestId>
```
### 状态存储位置

存储在 `~/.clawdbot/devices/` 目录下：
- `pending.json`（短期存储；待处理请求会过期）
- `paired.json`（已配对的设备 + 令牌）

### 注意事项

- 旧版的 `node.pair.*` API（CLI：`clawdbot nodes pending/approve`）是由网关所有并管理的配对存储。WS 节点仍然需要设备配对。

## 相关文档

- 安全模型 + 提示注入：[安全](/gateway/security)
- 安全更新（运行 doctor）：[更新](/install/updating)
- 渠道配置：
  - 电报：[电报](/channels/telegram)
  - WhatsApp：[WhatsApp](/channels/whatsapp)
  - Signal：[Signal](/channels/signal)
  - iMessage：[iMessage](/channels/imessage)
  - Discord：[Discord](/channels/discord)
  - Slack：[Slack](/channels/slack)