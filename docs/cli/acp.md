---
summary: "Run the ACP bridge for IDE integrations"
read_when:
  - Setting up ACP-based IDE integrations
  - Debugging ACP session routing to the Gateway
---

# acp

运行 ACP（Agent Client Protocol）桥接器，该桥接器与 Clawdbot 网关进行通信。

该命令通过 stdio 与 IDE 进行 ACP 通信，并通过 WebSocket 将提示信息转发到网关。
它会将 ACP 会话与网关的会话密钥进行映射。

## 用法
bash
clawdbot acp

# 远程网关
clawdbot acp --url wss://gateway-host:18789 --token <token>

# 绑定到现有的会话密钥
clawdbot acp --session agent:main:main

# 通过标签绑定（必须已存在）
clawdbot acp --session-label "support inbox"

# 在第一个提示前重置会话密钥
clawdbot acp --session agent:main:main --reset-session``````
## ACP 客户端（调试）

使用内置的 ACP 客户端在没有 IDE 的情况下对桥接器进行健康检查。
它会启动 ACP 桥接器，并允许你交互式地输入提示。```bash
clawdbot acp client

# Point the spawned bridge at a remote Gateway
clawdbot acp client --server-args --url wss://gateway-host:18789 --token <token>

# Override the server command (default: clawdbot)
clawdbot acp client --server "node" --server-args dist/entry.js acp --url ws://127.0.0.1:19001
```
## 如何使用此工具

当 IDE（或其他客户端）使用 Agent Client Protocol 时，使用 ACP 来驱动 Clawdbot Gateway 的会话。

1. 确保网关正在运行（本地或远程）。
2. 配置网关的目标（配置文件或标志）。
3. 将你的 IDE 指向通过标准输入输出运行 `clawdbot acp`。

示例配置（持久化）：
bash
clawdbot config set gateway.remote.url wss://gateway-host:18789
clawdbot config set gateway.remote.token <token>``````
直接运行示例（不写入配置）：```bash
clawdbot acp --url wss://gateway-host:18789 --token <token>
```
## 选择代理

ACP 不直接选择代理。它通过网关会话密钥进行路由。

使用代理作用域的会话密钥来指定特定的代理：
bash
clawdbot acp --session agent:main:main
clawdbot acp --session agent:design:main
clawdbot acp --session agent:qa:bug-123``````
每个 ACP 会话对应一个网关会话密钥。一个代理可以有多个会话；ACP 默认使用隔离的 `acp:<uuid>` 会话，除非你覆盖密钥或标签。```json
{
  "agent_servers": {
    "Clawdbot ACP": {
      "type": "custom",
      "command": "clawdbot",
      "args": ["acp"],
      "env": {}
    }
  }
}
```
要针对特定的网关或代理：
json
{
  "agent_servers": {
    "Clawdbot ACP": {
      "type": "custom",
      "command": "clawdbot",
      "args": [
        "acp",
        "--url", "wss://gateway-host:18789",
        "--token", "<token>",
        "--session", "agent:design:main"
      ],
      "env": {}
    }
  }
}```"```
在 Zed 中，打开 Agent 面板并选择 “Clawdbot ACP” 以启动一个线程。

## 会话映射

默认情况下，ACP 会话会获得一个带有 `acp:` 前缀的隔离网关会话密钥。
若要复用一个已知的会话，可以传递一个会话密钥或标签：

- `--session <key>`：使用特定的网关会话密钥。
- `--session-label <label>`：通过标签解析现有会话。
- `--reset-session`：为该密钥生成一个新的会话 ID（使用相同的密钥，但生成新的对话记录）。

如果您的 ACP 客户端支持元数据，您可以为每个会话进行覆盖设置：```json
{
  "_meta": {
    "sessionKey": "agent:main:main",
    "sessionLabel": "support inbox",
    "resetSession": true
  }
}
```
有关会话密钥的更多信息，请访问 [/concepts/session](/concepts/session)。

## 选项

- `--url <url>`：网关 WebSocket 地址（当配置时默认使用 gateway.remote.url）。
- `--token <token>`：网关认证令牌。
- `--password <password>`：网关认证密码。
- `--session <key>`：默认会话密钥。
- `--session-label <label>`：用于解析的默认会话标签。
- `--require-existing`：如果会话密钥/标签不存在则失败。
- `--reset-session`：在首次使用前重置会话密钥。
- `--no-prefix-cwd`：不在提示前加上当前工作目录。
- `--verbose, -v`：将详细日志输出到标准错误。

### `acp client` 选项

- `--cwd <dir>`：ACP 会话的工作目录。
- `--server <command>`：ACP 服务器命令（默认：`clawdbot`）。
- `--server-args <args...>`：传递给 ACP 服务器的额外参数。
- `--server-verbose`：在 ACP 服务器上启用详细日志。
- `--verbose, -v`：启用详细客户端日志。