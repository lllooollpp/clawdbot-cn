---
summary: "Nostr DM channel via NIP-04 encrypted messages"
read_when:
  - You want Clawdbot to receive DMs via Nostr
  - You're setting up decentralized messaging
---

# Nostr

**状态:** 可选插件（默认禁用）。

Nostr 是一种用于社交网络的去中心化协议。此频道使 Clawdbot 能够通过 NIP-04 接收并回应加密的私信（DM）。

## 安装（按需安装）

### 引导设置（推荐）

- 引导向导（`clawdbot onboard`）和 `clawdbot channels add` 会列出可选的频道插件。
- 选择 Nostr 会提示你按需安装该插件。

默认安装方式：

- **开发版渠道 + git 检出可用:** 使用本地插件路径。
- **稳定版/测试版:** 从 npm 下载。

你也可以在提示中随时覆盖选择。
### 手动安装
bash
clawdbot plugins install @clawdbot/nostr
`````````
使用本地检出（开发工作流）：```bash
clawdbot plugins install --link <path-to-clawdbot>/extensions/nostr
```
安装或启用插件后重启网关。

## 快速设置

1) 生成 Nostr 密钥对（如果需要）：
bash
# 使用 nak
nak key generate``````
2) 添加到配置中：```json
{
  "channels": {
    "nostr": {
      "privateKey": "${NOSTR_PRIVATE_KEY}"
    }
  }
}
```
3) 导出密钥：
bash
export NOSTR_PRIVATE_KEY="nsec1..."``````
4) 重启网关。

## 配置参考

| 键 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `privateKey` | string | 必填 | 私钥，格式为 `nsec` 或十六进制 |
| `relays` | string[] | `['wss://relay.damus.io', 'wss://nos.lol']` | 中继 URL（WebSocket） |
| `dmPolicy` | string | `pairing` | 私信访问策略 |
| `allowFrom` | string[] | `[]` | 允许的发送者公钥 |
| `enabled` | boolean | `true` | 启用/禁用频道 |
| `name` | string | - | 显示名称 |
| `profile` | object | - | NIP-01 配置文件元数据 |

## 配置文件元数据

配置文件数据以 NIP-01 `kind:0` 事件的形式发布。您可以通过控制面板（Channels -> Nostr -> Profile）进行管理，或者直接在配置中设置。

示例：```json
{
  "channels": {
    "nostr": {
      "privateKey": "${NOSTR_PRIVATE_KEY}",
      "profile": {
        "name": "clawdbot",
        "displayName": "Clawdbot",
        "about": "Personal assistant DM bot",
        "picture": "https://example.com/avatar.png",
        "banner": "https://example.com/banner.png",
        "website": "https://example.com",
        "nip05": "clawdbot@example.com",
        "lud16": "clawdbot@example.com"
      }
    }
  }
}
```
## 注意事项

- 个人资料网址必须使用 `https://`。
- 从中继导入会合并字段并保留本地覆盖。

## 访问控制

### 私信策略

- **配对**（默认）：未知发件人会收到一个配对码。
- **允许列表**：只有 `allowFrom` 中的公钥可以发送私信。
- **公开**：允许公开的私信（需要 `allowFrom: ["*"]`）。
- **禁用**：忽略所有入站私信。

### 允许列表示例
json
{
  "channels": {
    "nostr": {
      "privateKey": "${NOSTR_PRIVATE_KEY}",
      "dmPolicy": "allowlist",
      "allowFrom": ["npub1abc...", "npub1xyz..."]
    }
  }
}
`````````
## 关键字格式

接受的格式：

- **私钥:** `nsec...` 或 64 位十六进制数
- **公钥（`allowFrom`）:** `npub...` 或十六进制数

## 中继服务器

默认值：`relay.damus.io` 和 `nos.lol`。```json
{
  "channels": {
    "nostr": {
      "privateKey": "${NOSTR_PRIVATE_KEY}",
      "relays": [
        "wss://relay.damus.io",
        "wss://relay.primal.net",
        "wss://nostr.wine"
      ]
    }
  }
}
```
# 提示

- 使用 2-3 个中继器以实现冗余。
- 避免使用过多中继器（延迟、重复）。
- 付费中继器可以提高可靠性。
- 本地中继器适合测试（`ws://localhost:7777`）。

## 协议支持

| NIP | 状态 | 描述 |
| --- | --- | --- |
| NIP-01 | 支持 | 基础事件格式 + 配置文件元数据 |
| NIP-04 | 支持 | 加密的私信（`kind:4`） |
| NIP-17 | 计划中 | 赠品包装的私信 |
| NIP-44 | 计划中 | 版本加密 |

bash
# 启动 strfry
docker run -p 7777:7777 ghcr.io/hoytech/strfry``````
```md
{
  "channels": {
    "nostr": {
      "privateKey": "${NOSTR_PRIVATE_KEY}",
      "relays": ["ws://localhost:7777"]
    }
  }
}


### 手动测试

1) 从日志中记录机器人的公钥（npub）。
2) 打开一个 Nostr 客户端（如 Damus、Amethyst 等）。
3) 向机器人的公钥发送私信（DM）。
4) 验证机器人的响应。

## 故障排除

### 没有收到消息

- 确认私钥是否有效。
- 确保中继服务器（relay）的 URL 可以访问，并使用 `wss://`（或本地使用 `ws://`）。
- 确认 `enabled` 不为 `false`。
- 检查网关日志中是否有中继连接错误。

### 没有发送响应

- 检查中继服务器是否接受写入操作。
- 确认出站（outbound）连接是否正常。
- 注意中继服务器的速率限制。

### 重复响应

- 在使用多个中继服务器时是预期行为。
- 消息通过事件 ID 进行去重；只有第一次传递会触发响应。