---
summary: "Skills config schema and examples"
read_when:
  - Adding or modifying skills config
  - Adjusting bundled allowlist or install behavior
---

# 技能配置

所有与技能相关的配置都位于 `~/.clawdbot/clawdbot.json` 中的 `skills` 部分。
json5
{
  skills: {
    allowBundled: ["gemini", "peekaboo"],
    load: {
      extraDirs: [
        "~/Projects/agent-scripts/skills",
        "~/Projects/oss/some-skill-pack/skills"
      ],
      watch: true,
      watchDebounceMs: 250
    },
    install: {
      preferBrew: true,
      nodeManager: "npm" // npm | pnpm | yarn | bun (网关运行时仍为 Node；不推荐使用 bun)
    },
    entries: {
      "nano-banana-pro": {
        enabled: true,
        apiKey: "GEMINI_KEY_HERE",
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE"
        }
      },
      peekaboo: { enabled: true },
      sag: { enabled: false }
    }
  }
}
``````
## 字段

- `allowBundled`: 可选的允许列表，仅适用于 **内置** 的技能。当设置时，只有列表中的内置技能才有效（managed/workspace 技能不受影响）。
- `load.extraDirs`: 额外的技能目录，用于扫描（优先级最低）。
- `load.watch`: 监控技能文件夹并刷新技能快照（默认：true）。
- `load.watchDebounceMs`: 技能监控器事件的防抖时间（单位：毫秒，默认：250）。
- `install.preferBrew`: 当可用时，优先使用 brew 安装器（默认：true）。
- `install.nodeManager`: Node 安装器的偏好（`npm` | `pnpm` | `yarn` | `bun`，默认：npm）。这仅影响 **技能安装**；网关运行时仍应使用 Node（Bun 不推荐用于 WhatsApp/Telegram）。
- `entries.<skillKey>`: 每个技能的覆盖设置。

每技能字段：
- `enabled`: 设置为 `false` 可以禁用一个技能，即使它已被内置/安装。
- `env`: 注入到代理运行时的环境变量（仅在未设置时生效）。
- `apiKey`: 对于声明了主环境变量的技能，可选的便捷设置。

## 注意事项

- `entries` 下的键默认映射到技能名称。如果一个技能定义了 `metadata.clawdbot.skillKey`，则使用该键代替。
- 当 watcher 启用时，对技能的更改将在下一次代理运行时被识别。

### 被沙箱隔离的技能 + 环境变量

当一个会话是 **沙箱隔离** 的，技能进程会在 Docker 中运行。沙箱 **不会** 继承主机的 `process.env`。

请使用以下方式之一：
- `agents.defaults.sandbox.docker.env`（或每个代理的 `agents.list[].sandbox.docker.env`）
- 将环境变量打包到你的自定义沙箱镜像中

全局 `env` 和 `skills.entries.<skill>.env/apiKey` 仅适用于 **主机运行** 的情况。