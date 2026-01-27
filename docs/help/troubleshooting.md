---
summary: "Troubleshooting hub: symptoms → checks → fixes"
read_when:
  - You see an error and want the fix path
  - The installer says “success” but the CLI doesn’t work
---

# 故障排除

## 前60秒

按顺序运行以下内容：
bash
clawdbot status
clawdbot status --all
clawdbot gateway probe
clawdbot logs --follow
clawdbot doctor
``````
如果网关可到达，则进行深度探测：```bash
clawdbot status --deep
```
## 常见的“it broke”情况

### `clawdbot: 命令未找到`

几乎总是由于 Node/npm 的 PATH 问题。请从这里开始排查：

- [安装（Node/npm PATH 检查）](/install#nodejs--npm-path-sanity)

### 安装程序失败（或你需要完整的日志）

以详细模式重新运行安装程序，查看完整的日志和 npm 输出：
bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --verbose
``````
对于测试版安装：```bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --beta --verbose
```
你也可以通过设置 `CLAWDBOT_VERBOSE=1` 来代替该标志。

### 网关显示“unauthorized”，无法连接，或不断重新连接

- [网关故障排除](/gateway/troubleshooting)
- [网关认证](/gateway/authentication)

### 控制 UI 在 HTTP 上失败（需要设备身份）

- [网关故障排除](/gateway/troubleshooting)
- [控制 UI](/web/control-ui#insecure-http)

### `docs.clawd.bot` 显示 SSL 错误（Comcast/Xfinity）

一些 Comcast/Xfinity 的连接会通过 Xfinity Advanced Security 阻止 `docs.clawd.bot`。
请禁用 Advanced Security 或将 `docs.clawd.bot` 添加到允许列表中，然后重试。

- Xfinity Advanced Security 帮助：https://www.xfinity.com/support/articles/using-xfinity-xfi-advanced-security
- 快速检查：尝试使用移动热点或 VPN 来确认是否是 ISP 层级的过滤

### 服务显示正在运行，但 RPC 探针失败

- [网关故障排除](/gateway/troubleshooting)
- [后台进程 / 服务](/gateway/background-process)

### 模型/认证失败（速率限制、计费、“所有模型都失败”）

- [模型](/cli/models)
- [OAuth / 认证概念](/concepts/oauth)

### `/model` 显示 `model not allowed`

这通常意味着 `agents.defaults.models` 被配置为允许列表。当它不为空时，
只有这些提供者/模型的键才能被选择。

- 检查允许列表：`clawdbot config get agents.defaults.models`
- 添加你想要的模型（或清除允许列表），然后重试 `/model`
- 使用 `/models` 浏览允许的提供者/模型

### 提交问题时

粘贴一个安全的报告：
bash
clawdbot status --all
``````
如果你可以，请包含 `clawdbot logs --follow` 的相关日志尾部。