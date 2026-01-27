---
summary: "How Clawdbot presence entries are produced, merged, and displayed"
read_when:
  - Debugging the Instances tab
  - Investigating duplicate or stale instance rows
  - Changing gateway WS connect or system-event beacons
---

# 在线状态

Clawdbot 的 "presence" 是一个轻量级、尽力而为的视图：
- **网关** 本身，以及
- **连接到网关的客户端**（mac 应用、WebChat、CLI 等）

在线状态主要用于渲染 macOS 应用的 **实例** 选项卡，并提供快速的操作员可见性。

## 在线状态字段（显示内容）

在线状态条目是一个结构化的对象，包含以下字段：

- `instanceId`（可选但强烈建议）：稳定的客户端身份（通常是 `connect.client.instanceId`）
- `host`：人性化的主机名
- `ip`：尽力而为的 IP 地址
- `version`：客户端版本字符串
- `deviceFamily` / `modelIdentifier`：硬件提示
- `mode`：`ui`、`webchat`、`cli`、`backend`、`probe`、`test`、`node` 等
- `lastInputSeconds`：自上次用户输入以来的秒数（如果已知）
- `reason`：`self`、`connect`、`node-connected`、`periodic` 等
- `ts`：最后更新时间戳（自纪元以来的毫秒数）

## 生产者（在线状态来源）

在线状态条目由多个来源生成，并且被 **合并**。

### 1）网关自身的条目

网关在启动时总是会生成一个“self”条目，这样在任何客户端连接之前，UI 就能显示网关主机。

### 2）WebSocket 连接

每个 WebSocket 客户端都会发起一个 `connect` 请求。在成功握手后，网关会为该连接插入或更新一个在线状态条目。

#### 为什么单次 CLI 命令不会显示

CLI 通常用于短时、单次的命令。为了避免在实例列表中产生过多噪音，当 `client.mode === "cli"` 时，**不会**生成在线状态条目。

### 3）`system-event` 信标

客户端可以通过 `system-event` 方法发送更丰富的周期性信标。mac 应用使用此方法来报告主机名、IP 地址和 `lastInputSeconds`。

### 4）节点连接（角色：node）

当节点通过网关 WebSocket 连接并指定 `role: node` 时，网关会为该节点插入或更新一个在线状态条目（流程与其他 WebSocket 客户端相同）。

## 合并与去重规则（为什么 `instanceId` 很重要）

在线状态条目存储在一个单一的内存映射中：

- 条目按 **在线状态键** 进行索引。
- 最佳的键是稳定的 `instanceId`（来自 `connect.client.instanceId`），即使重启也能保持不变。
- 键是大小写不敏感的。

如果客户端在没有稳定 `instanceId` 的情况下重新连接，可能会显示为一个 **重复** 的条目。

## TTL 和最大条目数

在线状态是故意短暂的：

- **TTL（生存时间）：** 超过 5 分钟的条目会被清理
- **最大条目数：** 200 条（先删除最早的条目）

这可以保持列表的实时性，并避免内存无限制增长。

## 远程/隧道注意事项（回环 IP）

当客户端通过 SSH 隧道 / 本地端口转发连接时，网关可能会看到远程地址为 `127.0.0.1`。为了避免覆盖客户端报告的正确 IP，回环地址的远程地址会被忽略。

## 消费者

### macOS 实例选项卡

macOS 应用会渲染 `system-presence` 的输出，并根据最后更新时间的长短显示一个小型状态指示器（活动/空闲/过期）。

- 要查看原始列表，请对网关调用 `system-presence`。
- 如果看到重复项：
  - 确认客户端在握手过程中发送了稳定的 `client.instanceId`
  - 确认定期的信标使用相同的 `instanceId`
  - 检查是否连接派生的条目缺少 `instanceId`（重复项是预期的）