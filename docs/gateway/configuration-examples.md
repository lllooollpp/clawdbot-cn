---
summary: "Schema-accurate configuration examples for common Clawdbot setups"
read_when:
  - Learning how to configure Clawdbot
  - Looking for configuration examples
  - Setting up Clawdbot for the first time
---

# 配置示例

以下示例与当前配置模式一致。有关完整的参考和字段说明，请参见 [配置](/gateway/configuration)。

## 快速开始

### 绝对最小配置
json5
{
  agent: { workspace: "~/clawd" },
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}``````
保存到 `~/.clawdbot/clawdbot.json`，你可以通过该号码私信机器人。

### 推荐的起点```json5
{
  identity: {
    name: "Clawd",
    theme: "helpful assistant",
    emoji: "🦞"
  },
  agent: {
    workspace: "~/clawd",
    model: { primary: "anthropic/claude-sonnet-4-5" }
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } }
    }
  }
}
```
## 扩展示例（主要选项）

> JSON5 允许你使用注释和末尾的逗号。常规 JSON 也可以使用。
json5
{
  // 环境 + shell
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: {
      GROQ_API_KEY: "gsk-..."
    },
    shellEnv: {
      enabled: true,
      timeoutMs: 15000
    }
  },

  // 认证配置元数据（敏感信息存储在 auth-profiles.json 中）
  auth: {
    profiles: {
      "anthropic:me@example.com": { provider: "anthropic", mode: "oauth", email: "me@example.com" },
      "anthropic:work": { provider: "anthropic", mode: "api_key" },
      "openai:default": { provider: "openai", mode: "api_key" },
      "openai-codex:default": { provider: "openai-codex", mode: "oauth" }
    },
    order: {
      anthropic: ["anthropic:me@example.com", "anthropic:work"],
      openai: ["openai:default"],
      "openai-codex": ["openai-codex:default"]
    }
  },

  // 身份信息
  identity: {
    name: "Samantha",
    theme: "友善的树懒",
    emoji: "🦥"
  },

  // 日志记录
  logging: {
    level: "info",
    file: "/tmp/clawdbot/clawdbot.log",
    consoleLevel: "info",
    consoleStyle: "pretty",
    redactSensitive: "tools"
  },

  // 消息格式
  messages: {
    messagePrefix: "[clawdbot]",
    responsePrefix: ">",
    ackReaction: "👀",
    ackReactionScope: "group-mentions"
  },

  // 路由 + 队列
  routing: {
    groupChat: {
      mentionPatterns: ["@clawd", "clawdbot"],
      historyLimit: 50
    },
    queue: {
      mode: "collect",
      debounceMs: 1000,
      cap: 20,
      drop: "summarize",
      byChannel: {
        whatsapp: "collect",
        telegram: "collect",
        discord: "collect",
        slack: "collect",
        signal: "collect",
        imessage: "collect",
        webchat: "collect"
      }
    }
  },

  // 工具配置
  tools: {
    media: {
      audio: {
        enabled: true,
        maxBytes: 20971520,
        models: [
          { provider: "openai", model: "gpt-4o-mini-transcribe" },
          // 可选的 CLI 回退（Whisper 二进制文件）:
          // { type: "cli", command: "whisper", args: ["--model", "base", "{{MediaPath}}"] }
        ],
        timeoutSeconds: 120
      },
      video: {
        enabled: true,
        maxBytes: 52428800,
        models: [{ provider: "google", model: "gemini-3-flash-preview" }]
      }
    }
  },

  // 会话行为
  session: {
    scope: "per-sender",
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 60
    },
    resetByChannel: {
      discord: { mode: "idle", idleMinutes: 10080 }
    },
    resetTriggers: ["/new", "/reset"],
    store: "~/.clawdbot/agents/default/sessions/sessions.json",
    typingIntervalSeconds: 5,
    sendPolicy: {
      default: "allow",
      rules: [
        { action: "deny", match: { channel: "discord", chatType: "group" } }
      ]
    }
  },

  // 通道配置
  channels: {
    whatsapp: {
      dmPolicy: "pairing",
      allowFrom: ["+15555550123"],
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } }
    }
  }
}```

telegram: {
      enabled: true,
      botToken: "YOUR_TELEGRAM_BOT_TOKEN",
      allowFrom: ["123456789"],
      groupPolicy: "allowlist",
      groupAllowFrom: ["123456789"],
      groups: { "*": { requireMention: true } }
    },

    discord: {
      enabled: true,
      token: "YOUR_DISCORD_BOT_TOKEN",
      dm: { enabled: true, allowFrom: ["steipete"] },
      guilds: {
        "123456789012345678": {
          slug: "friends-of-clawd",
          requireMention: false,
          channels: {
            general: { allow: true },
            help: { allow: true, requireMention: true }
          }
        }
      }
    },

    slack: {
      enabled: true,
      botToken: "xoxb-REPLACE_ME",
      appToken: "xapp-REPLACE_ME",
      channels: {
        "#general": { allow: true, requireMention: true }
      },
      dm: { enabled: true, allowFrom: ["U123"] },
      slashCommand: {
        enabled: true,
        name: "clawd",
        sessionPrefix: "slack:slash",
        ephemeral: true
      }
    }
  },

  // Agent runtime
  agents: {
    defaults: {
      workspace: "~/clawd",
      userTimezone: "America/Chicago",
      model: {
        primary: "anthropic/claude-sonnet-4-5",
        fallbacks: ["anthropic/claude-opus-4-5", "openai/gpt-5.2"]
      },
      imageModel: {
        primary: "openrouter/anthropic/claude-sonnet-4-5"
      },
      models: {
        "anthropic/claude-opus-4-5": { alias: "opus" },
        "anthropic/claude-sonnet-4-5": { alias: "sonnet" },
        "openai/gpt-5.2": { alias: "gpt" }
      },
      thinkingDefault: "low",
      verboseDefault: "off",
      elevatedDefault: "on",
      blockStreamingDefault: "off",
      blockStreamingBreak: "text_end",
      blockStreamingChunk: {
        minChars: 800,
        maxChars: 1200,
        breakPreference: "paragraph"
      },
      blockStreamingCoalesce: {
        idleMs: 1000
      },
      humanDelay: {
        mode: "natural"
      },
      timeoutSeconds: 600,
      mediaMaxMb: 5,
      typingIntervalSeconds: 5,
      maxConcurrent: 3,
      heartbeat: {
        every: "30m",
        model: "anthropic/claude-sonnet-4-5",
        target: "last",
        to: "+15555550123",
        prompt: "HEARTBEAT",
        ackMaxChars: 300
      },
      memorySearch: {
        provider: "gemini",
        model: "gemini-embedding-001",
        remote: {
          apiKey: "${GEMINI_API_KEY}"
        }
      },
      sandbox: {
        mode: "non-main",
        perSession: true,
        workspaceRoot: "~/.clawdbot/sandboxes",
        docker: {
          image: "clawdbot-sandbox:bookworm-slim",
          workdir: "/workspace",
          readOnlyRoot: true,
          tmpfs: ["/tmp", "/var/tmp", "/run"],
          network: "none",
          user: "1000:1000"
        },
        browser: {
          enabled: false
        }
      }
    }
  },

tools: {
    allow: ["exec", "process", "read", "write", "edit", "apply_patch"],
    deny: ["browser", "canvas"],
    exec: {
      backgroundMs: 10000,
      timeoutSec: 1800,
      cleanupMs: 1800000
    },
    elevated: {
      enabled: true,
      allowFrom: {
        whatsapp: ["+15555550123"],
        telegram: ["123456789"],
        discord: ["steipete"],
        slack: ["U123"],
        signal: ["+15555550123"],
        imessage: ["user@example.com"],
        webchat: ["session:demo"]
      }
    }
  },

  // 自定义模型提供者
  models: {
    mode: "merge",
    providers: {
      "custom-proxy": {
        baseUrl: "http://localhost:4000/v1",
        apiKey: "LITELLM_KEY",
        api: "openai-responses",
        authHeader: true,
        headers: { "X-Proxy-Region": "us-west" },
        models: [
          {
            id: "llama-3.1-8b",
            name: "Llama 3.1 8B",
            api: "openai-responses",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128000,
            maxTokens: 32000
          }
        ]
      }
    }
  },

  // 定时任务
  cron: {
    enabled: true,
    store: "~/.clawdbot/cron/cron.json",
    maxConcurrentRuns: 2
  },

  // 网页钩子
  hooks: {
    enabled: true,
    path: "/hooks",
    token: "shared-secret",
    presets: ["gmail"],
    transformsDir: "~/.clawdbot/hooks",
    mappings: [
      {
        id: "gmail-hook",
        match: { path: "gmail" },
        action: "agent",
        wakeMode: "now",
        name: "Gmail",
        sessionKey: "hook:gmail:{{messages[0].id}}",
        messageTemplate: "From: {{messages[0].from}}\nSubject: {{messages[0].subject}}",
        textTemplate: "{{messages[0].snippet}}",
        deliver: true,
        channel: "last",
        to: "+15555550123",
        thinking: "low",
        timeoutSeconds: 300,
        transform: { module: "./transforms/gmail.js", export: "transformGmail" }
      }
    ],
    gmail: {
      account: "clawdbot@gmail.com",
      label: "INBOX",
      topic: "projects/<project-id>/topics/gog-gmail-watch",
      subscription: "gog-gmail-watch-push",
      pushToken: "shared-push-token",
      hookUrl: "http://127.0.0.1:18789/hooks/gmail",
      includeBody: true,
      maxBytes: 20000,
      renewEveryMinutes: 720,
      serve: { bind: "127.0.0.1", port: 8788, path: "/" },
      tailscale: { mode: "funnel", path: "/gmail-pubsub" }
    }
  },

  // 网关 + 网络
  gateway: {
    mode: "local",
    port: 18789,
    bind: "loopback",
    controlUi: { enabled: true, basePath: "/clawdbot" },
    auth: {
      mode: "token",
      token: "gateway-token",
      allowTailscale: true
    },
    tailscale: { mode: "serve", resetOnExit: false },
    remote: { url: "ws://gateway.tailnet:18789", token: "remote-token" },
    reload: { mode: "hybrid", debounceMs: 300 }
  }

skills: {
    allowBundled: ["gemini", "peekaboo"],
    load: {
      extraDirs: ["~/Projects/agent-scripts/skills"]
    },
    install: {
      preferBrew: true,
      nodeManager: "npm"
    },
    entries: {
      "nano-banana-pro": {
        enabled: true,
        apiKey: "GEMINI_KEY_HERE",
        env: { GEMINI_API_KEY: "GEMINI_KEY_HERE" }
      },
      peekaboo: { enabled: true }
    }
  }```
## 常见模式

### 多平台设置```json5
{
  agent: { workspace: "~/clawd" },
  channels: {
    whatsapp: { allowFrom: ["+15555550123"] },
    telegram: {
      enabled: true,
      botToken: "YOUR_TOKEN",
      allowFrom: ["123456789"]
    },
    discord: {
      enabled: true,
      token: "YOUR_TOKEN",
      dm: { allowFrom: ["yourname"] }
    }
  }
}
```
### OAuth 与 API 密钥回退机制
json5
{
  auth: {
    profiles: {
      "anthropic:subscription": {
        provider: "anthropic",
        mode: "oauth",
        email: "me@example.com"
      },
      "anthropic:api": {
        provider: "anthropic",
        mode: "api_key"
      }
    },
    order: {
      anthropic: ["anthropic:subscription", "anthropic:api"]
    }
  },
  agent: {
    workspace: "~/clawd",
    model: {
      primary: "anthropic/claude-sonnet-4-5",
      fallbacks: ["anthropic/claude-opus-4-5"]
    }
  }
}``````
### Anthropic 订阅 + API 密钥，MiniMax 回退方案```json5
{
  auth: {
    profiles: {
      "anthropic:subscription": {
        provider: "anthropic",
        mode: "oauth",
        email: "user@example.com"
      },
      "anthropic:api": {
        provider: "anthropic",
        mode: "api_key"
      }
    },
    order: {
      anthropic: ["anthropic:subscription", "anthropic:api"]
    }
  },
  models: {
    providers: {
      minimax: {
        baseUrl: "https://api.minimax.io/anthropic",
        api: "anthropic-messages",
        apiKey: "${MINIMAX_API_KEY}"
      }
    }
  },
  agent: {
    workspace: "~/clawd",
    model: {
      primary: "anthropic/claude-opus-4-5",
      fallbacks: ["minimax/MiniMax-M2.1"]
    }
  }
}
```
{
  identity: {
    name: "WorkBot",
    theme: "专业助手"
  },
  agent: {
    workspace: "~/work-clawd",
    elevated: { enabled: false }
  },
  channels: {
    slack: {
      enabled: true,
      botToken: "xoxb-...",
      channels: {
        "#engineering": { allow: true, requireMention: true },
        "#general": { allow: true, requireMention: true }
      }
    }
  }
}```
## 提示

- 如果设置 `dmPolicy: "open"`，则匹配的 `allowFrom` 列表必须包含 `"*"`。
- 提供者 ID 是不同的（电话号码、用户 ID、频道 ID）。请使用提供者文档确认格式。
- 可选部分可稍后添加：`web`、`browser`、`ui`、`discovery`、`canvasHost`、`talk`、`signal`、`imessage`。
- 有关更详细的设置说明，请参阅 [Providers](/channels/whatsapp) 和 [Troubleshooting](/gateway/troubleshooting)。