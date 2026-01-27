---
summary: "Global voice wake words (Gateway-owned) and how they sync across nodes"
read_when:
  - Changing voice wake words behavior or defaults
  - Adding new node platforms that need wake word sync
---

# 语音唤醒（全局唤醒词）

Clawdbot 将 **唤醒词视为一个全局列表**，该列表由 **网关（Gateway）** 拥有。

- **没有节点级别的自定义唤醒词**。
- **任何节点/应用的 UI 都可以编辑** 该列表；更改由网关保存并广播给所有用户。
- 每个设备仍然保留自己的 **语音唤醒开启/关闭** 切换按钮（本地用户体验和权限可能有所不同）。

## 存储（网关主机）

唤醒词存储在网关机器上，路径为：

- `~/.clawdbot/settings/voicewake.json`

结构如下：
json
{ "triggers": ["clawd", "claude", "computer"], "updatedAtMs": 1730000000000 }
``````
## 协议

### 方法

- `voicewake.get` → `{ triggers: string[] }`
- `voicewake.set`，参数为 `{ triggers: string[] }` → `{ triggers: string[] }`

注意事项：
- 触发词会被规范化（去除空格、删除空值）。空列表会回退到默认值。
- 会实施限制以确保安全（数量/长度上限）。

### 事件

- `voicewake.changed`，负载为 `{ triggers: string[] }`

谁会收到它：
- 所有 WebSocket 客户端（macOS 应用、WebChat 等）
- 所有连接的节点（iOS/Android），并且在节点连接时也会作为初始的“当前状态”推送。

## 客户端行为

### macOS 应用

- 使用全局列表来控制 `VoiceWakeRuntime` 的触发词。
- 在 Voice Wake 设置中编辑“触发词”会调用 `voicewake.set`，然后依赖广播来同步其他客户端。

### iOS 节点

- 使用全局列表进行 `VoiceWakeManager` 的触发词检测。
- 在设置中编辑“唤醒词”会调用 `voicewake.set`（通过网关 WebSocket），并且也保持本地唤醒词检测的响应性。

### Android 节点

- 在设置中提供一个“唤醒词”编辑器。
- 通过网关 WebSocket 调用 `voicewake.set`，以便编辑内容在所有地方同步。