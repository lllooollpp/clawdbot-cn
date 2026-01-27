---
summary: "Use Claude Max/Pro subscription as an OpenAI-compatible API endpoint"
read_when:
  - You want to use Claude Max subscription with OpenAI-compatible tools
  - You want a local API server that wraps Claude Code CLI
  - You want to save money by using subscription instead of API keys
---

# Claude Max API 代理

**claude-max-api-proxy** 是一个社区工具，它将你的 Claude Max/Pro 订阅暴露为一个 OpenAI 兼容的 API 端点。这使得你可以使用任何支持 OpenAI API 格式的工具来调用你的订阅。

## 为什么使用这个工具？

| 方法 | 成本 | 适合 |
|----------|------|----------|
| Anthropic API | 按照 token 计费（约 $15/M 输入，$75/M 输出，针对 Opus） | 生产应用，高流量 |
| Claude Max 订阅 | 每月固定费用 $200 | 个人使用，开发，无限使用 |

如果你拥有 Claude Max 订阅，并希望将其与 OpenAI 兼容的工具一起使用，这个代理可以为你节省大量费用。

Your App → claude-max-api-proxy → Claude Code CLI → Anthropic (via subscription)
     (OpenAI format)              (converts format)      (uses your login)
``````
代理：
1. 在 `http://localhost:3456/v1/chat/completions` 接受 OpenAI 格式的请求
2. 将其转换为 Claude Code CLI 命令
3. 以 OpenAI 格式返回响应（支持流式传输）

## 安装```bash
# Requires Node.js 20+ and Claude Code CLI
npm install -g claude-max-api-proxy

# Verify Claude CLI is authenticated
claude --version
```
## 使用说明

### 启动服务器
bash
claude-max-api
# 服务器运行在 http://localhost:3456
``````
### 测试它```bash
# Health check
curl http://localhost:3456/health

# List models
curl http://localhost:3456/v1/models

# Chat completion
curl http://localhost:3456/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```
### 使用 Clawdbot

您可以将 Clawdbot 指向代理作为自定义的 OpenAI 兼容端点：
json5
{
  env: {
    OPENAI_API_KEY: "不需要",
    OPENAI_BASE_URL: "http://localhost:3456/v1"
  },
  agents: {
    defaults: {
      model: { primary: "openai/claude-opus-4" }
    }
  }
}
``````
## 可用模型

| 模型ID | 映射到 |
|----------|---------|
| `claude-opus-4` | Claude Opus 4 |
| `claude-sonnet-4` | Claude Sonnet 4 |
| `claude-haiku-4` | Claude Haiku 4 |

## 在 macOS 上自动启动

创建一个 LaunchAgent 以自动运行代理：```bash
cat > ~/Library/LaunchAgents/com.claude-max-api.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.claude-max-api</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/usr/local/lib/node_modules/claude-max-api-proxy/dist/server/standalone.js</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/opt/homebrew/bin:~/.local/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claude-max-api.plist
```
## 链接

- **npm:** https://www.npmjs.com/package/claude-max-api-proxy
- **GitHub:** https://github.com/atalovesyou/claude-max-api-proxy
- **问题反馈:** https://github.com/atalovesyou/claude-max-api-proxy/issues

## 注意事项

- 这是一个 **社区工具**，并非由 Anthropic 或 Clawdbot 官方支持
- 需要有效的 Claude Max/Pro 订阅，并且已通过 Claude Code CLI 进行认证
- 代理在本地运行，不会将数据发送到任何第三方服务器
- 完全支持流式响应

## 相关内容

- [Anthropic 提供商](/providers/anthropic) - 与 Claude Code CLI OAuth 的原生 Clawdbot 集成
- [OpenAI 提供商](/providers/openai) - 适用于 OpenAI/Codex 订阅