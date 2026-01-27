---
summary: "Write agent tools in a plugin (schemas, optional tools, allowlists)"
read_when:
  - You want to add a new agent tool in a plugin
  - You need to make a tool opt-in via allowlists
---

# 插件代理工具

Clawdbot 插件可以注册 **代理工具**（JSON 模式函数），这些工具在代理运行时对 LLM 是可见的。工具可以是 **必需的**（始终可用）或 **可选的**（需要主动启用）。

代理工具在主配置中的 `tools` 下进行配置，或者在每个代理中通过 `agents.list[].tools` 进行配置。允许列表/拒绝列表策略控制代理可以调用哪些工具。
ts
import { Type } from "@sinclair/typebox";

export default function (api) {
  api.registerTool({
    name: "my_tool",
    description: "做一件事",
    parameters: Type.Object({
      input: Type.String(),
    }),
    async execute(_id, params) {
      return { content: [{ type: "text", text: params.input }] };
    },
  });
}
``````
## 可选工具（需主动启用）

可选工具 **始终** 不会自动启用。用户必须将它们添加到代理的允许列表中。```ts
export default function (api) {
  api.registerTool(
    {
      name: "workflow_tool",
      description: "Run a local workflow",
      parameters: {
        type: "object",
        properties: {
          pipeline: { type: "string" },
        },
        required: ["pipeline"],
      },
      async execute(_id, params) {
        return { content: [{ type: "text", text: params.pipeline }] };
      },
    },
    { optional: true },
  );
}
```
在 `agents.list[].tools.allow`（或全局 `tools.allow`）中启用可选工具：
json5
{
  agents: {
    list: [
      {
        id: "main",
        tools: {
          allow: [
            "workflow_tool",  // 具体工具名称
            "workflow",       // 插件 ID（启用该插件的所有工具）
            "group:plugins"   // 所有插件工具
          ]
        }
      }
    ]
  }
}
``````
影响工具可用性的其他配置选项：
- 仅列出插件工具的允许列表（allowlist）被视为插件的启用选项；核心工具默认保持启用，除非你也在允许列表中包含核心工具或工具组。
- `tools.profile` / `agents.list[].tools.profile`（基础允许列表）
- `tools.byProvider` / `agents.list[].tools.byProvider`（特定提供者的允许/拒绝策略）
- `tools.sandbox.tools.*`（沙箱环境下工具的策略）

## 规则与提示

- 工具名称**不能**与核心工具名称冲突；冲突的工具将被跳过。
- 在允许列表中使用的插件 ID 也不能与核心工具名称冲突。
- 对于会触发副作用或需要额外二进制文件/凭证的工具，建议设置 `optional: true`。