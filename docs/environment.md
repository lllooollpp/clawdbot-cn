---
summary: "Where Clawdbot loads environment variables and the precedence order"
read_when:
  - You need to know which env vars are loaded, and in what order
  - You are debugging missing API keys in the Gateway
  - You are documenting provider auth or deployment environments
---

# 环境变量

Clawdbot 会从多个来源获取环境变量。规则是 **不要覆盖已有的值**。

## 优先级（最高 → 最低）

1) **进程环境**（Gateway 进程从父 shell/daemon 中已有的环境变量）。
2) **当前工作目录中的 `.env` 文件**（dotenv 默认方式；不会覆盖）。
3) **全局的 `.env` 文件**，位于 `~/.clawdbot/.env`（即 `$CLAWDBOT_STATE_DIR/.env`；不会覆盖）。
4) **配置文件中的 `env` 块**，位于 `~/.clawdbot/clawdbot.json`（仅在变量缺失时应用）。
5) **可选的登录 shell 导入**（通过 `env.shellEnv.enabled` 或 `CLAWDBOT_LOAD_SHELL_ENV=1` 启用），仅在预期的键缺失时应用。

如果配置文件完全缺失，步骤 4 将被跳过；但如果启用了 shell 导入，仍会执行。```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: {
      GROQ_API_KEY: "gsk-..."
    }
  }
}
```
## Shell 环境导入

`env.shellEnv` 会运行您的登录 shell，并仅导入 **缺失** 的预期键：```json5
{
  env: {
    shellEnv: {
      enabled: true,
      timeoutMs: 15000
    }
  }
}
```
环境变量对应项：
- `CLAWDBOT_LOAD_SHELL_ENV=1`
- `CLAWDBOT_SHELL_ENV_TIMEOUT_MS=15000`

## 在配置中使用环境变量替换

你可以在配置字符串值中直接通过 `${VAR_NAME}` 语法引用环境变量：```json5
{
  models: {
    providers: {
      "vercel-gateway": {
        apiKey: "${VERCEL_GATEWAY_API_KEY}"
      }
    }
  }
}
```
有关详细信息，请参阅[配置：环境变量替换](/gateway/configuration#env-var-substitution-in-config)。

## 相关内容

- [网关配置](/gateway/configuration)
- [常见问题：环境变量与.env加载](/help/faq#env-vars-and-env-loading)
- [模型概述](/concepts/models)