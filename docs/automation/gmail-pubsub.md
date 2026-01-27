---
summary: "Gmail Pub/Sub push wired into Clawdbot webhooks via gogcli"
read_when:
  - Wiring Gmail inbox triggers to Clawdbot
  - Setting up Pub/Sub push for agent wake
---

# Gmail Pub/Sub -> Clawdbot

目标：Gmail watch -> Pub/Sub 推送 -> `gog gmail watch serve` -> Clawdbot Webhook。

## 先决条件

- 安装并登录了 `gcloud`（[安装指南](https://docs.cloud.google.com/sdk/docs/install-sdk)）。
- 安装并授权了 `gog`（gogcli）用于 Gmail 账户（[gogcli.sh](https://gogcli.sh/)）。
- Clawdbot 的 Webhook 功能已启用（参见 [Webhooks](/automation/webhook)）。
- 已登录 `tailscale`（[tailscale.com](https://tailscale.com/)）。我们支持的设置使用 Tailscale Funnel 提供公共 HTTPS 端点。
  其他隧道服务也可以使用，但需要自行配置/不提供支持，并且需要手动设置。
  目前，我们仅支持 Tailscale。

示例 hook 配置（启用 Gmail 预设映射）：
json5
{
  hooks: {
    enabled: true,
    token: "CLAWDBOT_HOOK_TOKEN",
    path: "/hooks",
    presets: ["gmail"]
  }
}
`````````
要将Gmail摘要发送到聊天界面，请覆盖预设，使用一个映射来设置 `deliver` + 可选的 `channel`/`to`：```json5
{
  hooks: {
    enabled: true,
    token: "CLAWDBOT_HOOK_TOKEN",
    presets: ["gmail"],
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        wakeMode: "now",
        name: "Gmail",
        sessionKey: "hook:gmail:{{messages[0].id}}",
        messageTemplate:
          "New email from {{messages[0].from}}\nSubject: {{messages[0].subject}}\n{{messages[0].snippet}}\n{{messages[0].body}}",
        model: "openai/gpt-5.2-mini",
        deliver: true,
        channel: "last"
        // to: "+15551234567"
      }
    ]
  }
}
```
如果您想要使用固定的渠道，请设置 `channel` + `to`。否则，使用 `channel: "last"` 会采用最后的配送渠道（若不可用则回退到 WhatsApp）。

为了在 Gmail 运行时强制使用更便宜的模型，请在映射中设置 `model`（`provider/model` 或别名）。如果您在 `agents.defaults.models` 中进行了强制设置，请将其包含在内。

若要为 Gmail 钩子单独设置默认模型和思考层级，请在您的配置中添加 `hooks.gmail.model` / `hooks.gmail.thinking`：
json5
{
  hooks: {
    gmail: {
      model: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
      thinking: "off"
    }
  }
}
`````````
注意事项：
- 在映射中的每个钩子 `model`/`thinking` 仍然会覆盖这些默认值。
- 回退顺序：`hooks.gmail.model` → `agents.defaults.model.fallbacks` → 主要（认证/速率限制/超时）。
- 如果设置了 `agents.defaults.models`，则 Gmail 模型必须在允许列表中。

如需进一步自定义负载处理，请在 `hooks.transformsDir` 下添加 `hooks.mappings` 或一个 JS/TS 转换模块（参见 [Webhooks](/automation/webhook)）。

## 智者（推荐）

使用 Clawdbot 辅助工具将所有内容连接起来（在 macOS 上通过 brew 安装依赖）：```bash
clawdbot webhooks gmail setup \
  --account clawdbot@gmail.com
```
默认配置：
- 使用 Tailscale Funnel 作为公共推送端点。
- 为 `clawdbot webhooks gmail run` 写入 `hooks.gmail` 配置。
- 启用 Gmail 钩子预设（`hooks.presets: ["gmail"]`）。

路径说明：当 `tailscale.mode` 被启用时，Clawdbot 会自动将 `hooks.gmail.serve.path` 设置为 `/`，并将公共路径保持在 `hooks.gmail.tailscale.path`（默认为 `/gmail-pubsub`），因为 Tailscale 在代理之前会移除设置的路径前缀。
如果你需要后端接收带有前缀的路径，请将 `hooks.gmail.tailscale.target`（或 `--tailscale-target`）设置为完整 URL，例如 `http://127.0.0.1:8788/gmail-pubsub`，并确保与 `hooks.gmail.serve.path` 匹配。

想要自定义端点？使用 `--push-endpoint <url>` 或 `--tailscale off`。

平台说明：在 macOS 上，向导会通过 Homebrew 安装 `gcloud`、`gogcli` 和 `tailscale`；在 Linux 上请先手动安装它们。

网关自动启动（推荐）：
- 当 `hooks.enabled=true` 且 `hooks.gmail.account` 被设置时，网关会在启动时运行 `gog gmail watch serve` 并自动续订监视。
- 如果你自行运行守护进程，可以设置 `CLAWDBOT_SKIP_GMAIL_WATCHER=1` 来选择退出。
- 不要同时运行手动守护进程，否则会出现 `listen tcp 127.0.0.1:8788: bind: address already in use` 错误。

手动守护进程（启动 `gog gmail watch serve` + 自动续订）：
bash
clawdbot webhooks gmail run
`````````
## 一次性设置

1) 选择 **使用 `gog` 的 OAuth 客户端所属的 GCP 项目**。```bash
gcloud auth login
gcloud config set project <project-id>
```
注意：Gmail 的 watch 功能需要 Pub/Sub 话题与 OAuth 客户端位于同一项目中。

2) 启用 API：
bash
gcloud services enable gmail.googleapis.com pubsub.googleapis.com``````
3) 创建一个主题：```bash
gcloud pubsub topics create gog-gmail-watch
```
4) 允许 Gmail 推送以进行发布：
bash
gcloud pubsub topics add-iam-policy-binding gog-gmail-watch \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
  --role=roles/pubsub.publisher``````
## 开始计时```bash
gog gmail watch start \
  --account clawdbot@gmail.com \
  --label INBOX \
  --topic projects/<project-id>/topics/gog-gmail-watch
```
保存 `history_id`（用于调试）。

## 运行推送处理程序

本地示例（共享令牌认证）：
bash
gog gmail watch serve \
  --account clawdbot@gmail.com \
  --bind 127.0.0.1 \
  --port 8788 \
  --path /gmail-pubsub \
  --token <shared> \
  --hook-url http://127.0.0.1:18789/hooks/gmail \
  --hook-token CLAWDBOT_HOOK_TOKEN \
  --include-body \
  --max-bytes 20000``````
说明：
- `--token` 保护推送端点（`x-gog-token` 或 `?token=`）。
- `--hook-url` 指向 Clawdbot 的 `/hooks/gmail`（已映射；独立运行 + 摘要到主分支）。
- `--include-body` 和 `--max-bytes` 控制发送到 Clawdbot 的正文片段。

推荐：`clawdbot webhooks gmail run` 包装了相同的流程，并会自动更新监听。

## 暴露处理程序（高级，不支持）

如果你不需要 Tailscale 隧道，可以手动连接，并在推送订阅中使用公共 URL（不支持，没有保护机制）：```bash
cloudflared tunnel --url http://127.0.0.1:8788 --no-autoupdate
```
使用生成的 URL 作为推送端点：
bash  
gcloud pubsub subscriptions create gog-gmail-watch-push \  
  --topic gog-gmail-watch \  
  --push-endpoint "https://<public-url>/gmail-pubsub?token=<shared>"  

生产环境：使用稳定的 HTTPS 端点并配置 Pub/Sub OIDC JWT，然后运行：  
bash  
gog gmail watch serve --verify-oidc --oidc-email <svc@...>```
## 测试

向监视的收件箱发送一条消息：
bash
gog gmail send \
  --account clawdbot@gmail.com \
  --to clawdbot@gmail.com \
  --subject "watch test" \
  --body "ping"
``````
检查手表状态和历史记录：
gog gmail watch status --account clawdbot@gmail.com
gog gmail history --account clawdbot@gmail.com --since <historyId>```
## 故障排除

- `无效的topicName`：项目不匹配（主题不在OAuth客户端项目中）。
- `用户未授权`：主题缺少 `roles/pubsub.publisher` 权限。
- 空消息：Gmail推送仅提供 `historyId`；请通过 `gog gmail history` 进行获取。

## 清理
bash
gog gmail watch stop --account clawdbot@gmail.com
gcloud pubsub subscriptions delete gog-gmail-watch-push
gcloud pubsub topics delete gog-gmail-watch
``````
