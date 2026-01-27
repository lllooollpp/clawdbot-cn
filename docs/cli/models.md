---
summary: "CLI reference for `clawdbot models` (status/list/set/scan, aliases, fallbacks, auth)"
read_when:
  - You want to change default models or view provider auth status
  - You want to scan available models/providers and debug auth profiles
---

# `clawdbot models`

模型发现、扫描和配置（默认模型、回退选项、认证配置）。

相关：
- 提供商 + 模型：[Models](/providers/models)
- 提供商认证设置：[入门指南](/start/getting-started)

## 常用命令
bash
clawdbot models status
clawdbot models list
clawdbot models set <model-or-alias>
clawdbot models scan``````
`clawdbot models status` 显示已解析的默认/回退模型以及认证概览。
当提供者使用快照可用时，OAuth/令牌状态部分会包含提供者使用头信息。
添加 `--probe` 选项以对每个配置的提供者资料进行实时认证探测。
探测是真实的请求（可能会消耗令牌并触发速率限制）。

注意事项：
- `models set <model-or-alias>` 接受 `provider/model` 或别名。
- 模型引用通过分割第一个 `/` 来解析。如果模型 ID 包含 `/`（如 OpenRouter 风格），则需要包含提供者前缀（例如：`openrouter/moonshotai/kimi-k2`）。
- 如果省略提供者，Clawdbot 会将输入视为默认提供者的别名或模型（仅在模型 ID 中没有 `/` 时有效）。

### `models status`
选项：
- `--json`
- `--plain`
- `--check`（退出码 1=过期/缺失，2=即将过期）
- `--probe`（对配置的认证资料进行实时探测）
- `--probe-provider <name>`（探测一个提供者）
- `--probe-profile <id>`（重复或逗号分隔的资料 ID）
- `--probe-timeout <ms>`
- `--probe-concurrency <n>`
- `--probe-max-tokens <n>````bash
clawdbot models aliases list
clawdbot models fallbacks list
```
## 认证配置文件
clawdbot models auth add
clawdbot models auth login --provider <id>
clawdbot models auth setup-token
clawdbot models auth paste-token


"## `clawdbot models auth login` 运行提供者插件的认证流程（OAuth/API 密钥）。可以使用 `clawdbot plugins list` 查看已安装的提供者。

注意事项：
- `setup-token` 需要在当前机器上运行 `claude setup-token`（需要 Claude Code CLI）。
- `paste-token` 接受从其他地方生成的令牌字符串。"