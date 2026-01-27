---
summary: "Use MiniMax M2.1 in Clawdbot"
read_when:
  - You want MiniMax models in Clawdbot
  - You need MiniMax setup guidance
---

# MiniMax

MiniMax 是一家构建 **M2/M2.1** 模型系列的 AI 公司。当前的代码专注型发布版本是 **MiniMax M2.1**（2025 年 12 月 23 日），专为现实世界中的复杂任务而设计。

来源：[MiniMax M2.1 发布说明](https://www.minimax.io/news/minimax-m21)

## 模型概览（M2.1）

MiniMax 在 M2.1 中强调了以下改进：

- 更强的 **多语言代码编写能力**（Rust、Java、Go、C++、Kotlin、Objective-C、TS/JS）。
- 更好的 **网页/应用开发** 和美观输出质量（包括原生移动应用）。
- 改进的 **复合指令处理** 能力，适用于办公风格的工作流程，基于交错的思考和集成的约束执行。
- **更简洁的回复**，减少 token 使用量并加快迭代循环。
- 更强的 **工具/代理框架兼容性** 和上下文管理（Claude Code、Droid/Factory AI、Cline、Kilo Code、Roo Code、BlackBox）。
- 更高质量的 **对话和技术写作** 输出。

## MiniMax M2.1 与 MiniMax M2.1 Lightning

- **速度**：Lightning 是 MiniMax 定价文档中的“快速”版本。
- **成本**：定价显示输入成本相同，但 Lightning 的输出成本更高。
- **代码计划路由**：Lightning 后端无法直接在 MiniMax 代码计划中使用。MiniMax 会自动将大部分请求路由到 Lightning，但在流量高峰时会回退到常规的 M2.1 后端。
json5
{
  env: { MINIMAX_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "minimax/MiniMax-M2.1" } } },
  models: {
    mode: "merge",
    providers: {
      minimax: {
        baseUrl: "https://api.minimax.io/anthropic",
        apiKey: "${MINIMAX_API_KEY}",
        api: "anthropic-messages",
        models: [
          {
            id: "MiniMax-M2.1",
            name: "MiniMax M2.1",
            reasoning: false,
            input: ["text"],
            cost: { input: 15, output: 60, cacheRead: 2, cacheWrite: 10 },
            contextWindow: 200000,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
``````
### MiniMax M2.1 作为备用（Opus 为主）

**最适合:** 将 Opus 4.5 作为主用，备用使用 MiniMax M2.1。```json5
{
  env: { MINIMAX_API_KEY: "sk-..." },
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-5": { alias: "opus" },
        "minimax/MiniMax-M2.1": { alias: "minimax" }
      },
      model: {
        primary: "anthropic/claude-opus-4-5",
        fallbacks: ["minimax/MiniMax-M2.1"]
      }
    }
  }
}
```
### 可选：通过 LM Studio 本地运行（手动）

**适用场景：** 在 LM Studio 上进行本地推理。  
在使用 LM Studio 的本地服务器时，我们在强大的硬件（例如台式机/服务器）上看到了 MiniMax M2.1 的良好效果。

通过 `clawdbot.json` 手动配置：
json5
{
  agents: {
    defaults: {
      model: { primary: "lmstudio/minimax-m2.1-gs32" },
      models: { "lmstudio/minimax-m2.1-gs32": { alias: "Minimax" } }
    }
  },
  models: {
    mode: "merge",
    providers: {
      lmstudio: {
        baseUrl: "http://127.0.0.1:1234/v1",
        apiKey: "lmstudio",
        api: "openai-responses",
        models: [
          {
            id: "minimax-m2.1-gs32",
            name: "MiniMax M2.1 GS32",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 196608,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
``````
## 通过 `clawdbot configure` 进行配置

使用交互式配置向导来设置 MiniMax，而无需编辑 JSON 文件：

1) 运行 `clawdbot configure`。
2) 选择 **Model/auth**。
3) 选择 **MiniMax M2.1**。
4) 在提示时选择你的默认模型。

## 配置选项

- `models.providers.minimax.baseUrl`: 推荐使用 `https://api.minimax.io/anthropic`（与 Anthropic 兼容）；`https://api.minimax.io/v1` 是可选的，用于 OpenAI 兼容的请求。
- `models.providers.minimax.api`: 推荐使用 `anthropic-messages`；`openai-completions` 是可选的，用于 OpenAI 兼容的请求。
- `models.providers.minimax.apiKey`: MiniMax API 密钥（`MINIMAX_API_KEY`）。
- `models.providers.minimax.models`: 定义 `id`、`name`、`reasoning`、`contextWindow`、`maxTokens`、`cost`。
- `agents.defaults.models`: 为你希望加入允许列表的模型设置别名。
- `models.mode`: 如果你想将 MiniMax 与内置模型并存，请保持 `merge`。

## 注意事项

- 模型引用格式为 `minimax/<model>`。
- 编程计划使用 API：`https://api.minimaxi.com/v1/api/openplatform/coding_plan/remains`（需要编程计划密钥）。
- 如果需要精确的费用跟踪，请更新 `models.json` 中的定价值。
- MiniMax 编程计划推荐链接（10% 折扣）：https://platform.minimax.io/subscribe/coding-plan?code=DbXJTRClnb&source=link
- 有关提供者规则，请参阅 [/concepts/model-providers](/concepts/model-providers)。
- 使用 `clawdbot models list` 和 `clawdbot models set minimax/MiniMax-M2.1` 来切换模型。

## 故障排除

### “未知模型：minimax/MiniMax-M2.1”

这通常意味着 **MiniMax 提供者未正确配置**（未找到提供者条目或 MiniMax 的认证配置/环境变量）。此问题的修复将在 **2026.1.12** 版本中推出（写作时尚未发布）。修复方法如下：
- 升级到 **2026.1.12**（或从源码 `main` 分支运行），然后重启网关。
- 运行 `clawdbot configure` 并选择 **MiniMax M2.1**，或者
- 手动添加 `models.providers.minimax` 块，或者
- 设置 `MINIMAX_API_KEY`（或 MiniMax 认证配置），以便提供者可以被注入。

确保模型 ID 是 **区分大小写** 的：
- `minimax/MiniMax-M2.1`
- `minimax/MiniMax-M2.1-lightning`

然后重新检查：```bash
clawdbot models list
```
