---
summary: "Gateway-owned node pairing (Option B) for iOS and other remote nodes"
read_when:
  - Implementing node pairing approvals without macOS UI
  - Adding CLI flows for approving remote nodes
  - Extending gateway protocol with node management
---

# 网关拥有配对（选项 B）

在网关拥有配对中，**网关** 是决定哪些节点可以加入的权威来源。UI（macOS 应用，未来的客户端）只是一个前端，用于批准或拒绝待处理的请求。

**重要提示：** WS 节点在 `connect` 过程中使用 **设备配对**（角色 `node`）。`node.pair.*` 是一个独立的配对存储，并不控制 WS 握手过程。只有那些显式调用 `node.pair.*` 的客户端才会使用此流程。

## 概念

- **待处理请求**：一个节点请求加入；需要批准。
- **已配对节点**：已获批准并已发放身份验证令牌的节点。
- **传输**：网关的 WS 端点会转发请求，但不会决定成员资格。（旧版 TCP 桥接支持已弃用/移除。）

## 配对工作流程

1. 一个节点连接到网关的 WS 并请求配对。
2. 网关会存储一个 **待处理请求**，并发出 `node.pair.requested` 事件。
3. 你批准或拒绝该请求（通过 CLI 或 UI）。
4. 在批准后，网关会发放一个 **新令牌**（重新配对时令牌会轮换）。
5. 节点使用该令牌重新连接，现在即为“已配对”状态。

待处理请求会在 **5 分钟后自动过期**。
bash
clawdbot nodes pending
clawdbot nodes approve <requestId>
clawdbot nodes reject <requestId>
clawdbot nodes status
clawdbot nodes rename --node <id|name|ip> --name "Living Room iPad"
``````
`nodes status` 命令显示已配对/连接的节点及其功能。

## API 接口（网关协议）

事件：
- `node.pair.requested` — 当一个新的待处理请求被创建时触发。
- `node.pair.resolved` — 当一个请求被批准/拒绝/过期时触发。

方法：
- `node.pair.request` — 创建或复用一个待处理请求。
- `node.pair.list` — 列出待处理和已配对的节点。
- `node.pair.approve` — 批准一个待处理请求（生成令牌）。
- `node.pair.reject` — 拒绝一个待处理请求。
- `node.pair.verify` — 验证 `{ nodeId, token }`。

备注：
- `node.pair.request` 对每个节点是幂等的：重复调用会返回相同的待处理请求。
- 批准操作 **始终** 会生成一个新的令牌；`node.pair.request` 不会返回任何令牌。
- 请求可以包含 `silent: true` 作为自动批准流程的提示。

## 自动批准（macOS 应用）

macOS 应用可以可选地尝试 **静默批准**，当满足以下条件时：
- 请求被标记为 `silent`，并且
- 应用可以使用相同的用户验证与网关主机的 SSH 连接。

如果静默批准失败，将回退到正常的“批准/拒绝”提示。

## 存储（本地，私有）

配对状态存储在网关状态目录下（默认为 `~/.clawdbot`）：

- `~/.clawdbot/nodes/paired.json`
- `~/.clawdbot/nodes/pending.json`

如果你覆盖了 `CLAWDBOT_STATE_DIR`，`nodes/` 文件夹也会随之移动。

安全备注：
- 令牌是敏感信息；请将 `paired.json` 视为敏感文件。
- 旋转令牌需要重新批准（或删除节点条目）。

## 传输行为

- 传输是 **无状态的**；它不存储成员信息。
- 如果网关离线或配对功能被禁用，节点无法进行配对。
- 如果网关处于远程模式，配对仍然针对远程网关的存储进行。