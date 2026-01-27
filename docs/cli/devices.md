---
summary: "CLI reference for `clawdbot devices` (device pairing + token rotation/revocation)"
read_when:
  - You are approving device pairing requests
  - You need to rotate or revoke device tokens
---

# `clawdbot devices`

管理设备配对请求和设备作用域的令牌。

## 命令

### `clawdbot devices list`

列出待处理的配对请求和已配对的设备。

clawdbot devices list
clawdbot devices list --json
`````````
### `clawdbot devices approve <requestId>`

批准一个待处理的设备配对请求。```
clawdbot devices approve <requestId>
```
### `clawdbot devices reject <requestId>`

拒绝一个待处理的设备配对请求。


### `clawdbot devices rotate --device <id> --role <role> [--scope <scope...>]`

为特定角色旋转设备令牌（可选地更新作用域）。
clawdbot devices rotate --device <deviceId> --role operator --scope operator.read --scope operator.write```
### `clawdbot devices revoke --device <id> --role <role>`

撤销特定角色的设备令牌。

clawdbot devices revoke --device <deviceId> --role node
``````
## 常用选项

- `--url <url>`: 网关 WebSocket 地址（当配置了 `gateway.remote.url` 时默认使用该值）。
- `--token <token>`: 网关令牌（如需要）。
- `--password <password>`: 网关密码（密码认证）。
- `--timeout <ms>`: RPC 超时时间（毫秒）。
- `--json`: JSON 格式输出（推荐用于脚本）。

## 注意事项

- 令牌轮换会返回一个新的令牌（敏感信息）。请将其视为秘密处理。
- 这些命令需要 `operator.pairing`（或 `operator.admin`）权限。