---
summary: "Use Qwen OAuth (free tier) in Clawdbot"
read_when:
  - You want to use Qwen with Clawdbot
  - You want free-tier OAuth access to Qwen Coder
---

# Qwen

Qwen 为 Qwen Coder 和 Qwen Vision 模型提供了一个免费层级的 OAuth 流程（每天 2,000 次请求，受 Qwen 速率限制的约束）。

## 启用插件
bash
clawdbot plugins enable qwen-portal-auth
``````
在启用后重启网关。

## 身份验证```bash
clawdbot models auth login --provider qwen-portal --set-default
```
这将运行Qwen设备代码OAuth流程，并向您的`models.json`写入一个提供者条目（以及一个`qwen`别名以便快速切换）。

## 模型ID

- `qwen-portal/coder-model`
- `qwen-portal/vision-model`

切换模型的方式为：
bash
clawdbot models set qwen-portal/coder-model
``````
## 复用 Qwen Code CLI 登录信息

如果您已经通过 Qwen Code CLI 登录过，Clawdbot 在加载认证存储时会从 `~/.qwen/oauth_creds.json` 同步凭证。您仍然需要一个 `models.providers.qwen-portal` 条目（使用上面的登录命令来创建一个）。

## 注意事项

- 令牌会自动刷新；如果刷新失败或访问被撤销，请重新运行登录命令。
- 默认基础 URL：`https://portal.qwen.ai/v1`（如果 Qwen 提供了不同的端点，可以使用 `models.providers.qwen-portal.baseUrl` 覆盖）。
- 有关提供者级别的规则，请参阅 [模型提供者](/concepts/model-providers)。