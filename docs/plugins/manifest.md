---
summary: "Plugin manifest + JSON schema requirements (strict config validation)"
read_when:
  - You are building a Clawdbot plugin
  - You need to ship a plugin config schema or debug plugin validation errors
---

# 插件清单（clawdbot.plugin.json）

每个插件 **必须** 在 **插件根目录** 中提供一个 `clawdbot.plugin.json` 文件。  
Clawdbot 使用此清单在 **不执行插件代码** 的情况下验证配置。  
缺少或无效的清单将被视为插件错误，并阻止配置验证。

查看完整的插件系统指南：[插件](/plugin)。
json
{
  "id": "voice-call",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
``````
必需的键：
- `id`（字符串）：插件的规范 ID。
- `configSchema`（对象）：插件配置的 JSON Schema（内联）。

可选的键：
- `kind`（字符串）：插件类型（例如：`"memory"`）。
- `channels`（数组）：此插件注册的频道 ID（例如：`["matrix"]`）。
- `providers`（数组）：此插件注册的提供者 ID。
- `skills`（数组）：要加载的技能目录（相对于插件根目录）。
- `name`（字符串）：插件的显示名称。
- `description`（字符串）：插件的简要描述。
- `uiHints`（对象）：用于 UI 渲染的配置字段标签/占位符/敏感标志。
- `version`（字符串）：插件版本（仅用于信息）。

## JSON Schema 要求

- **每个插件必须提供一个 JSON Schema**，即使它不接受任何配置。
- 空的 Schema 是可以接受的（例如：`{ "type": "object", "additionalProperties": false }`）。
- Schema 在配置读取/写入时进行验证，而不是在运行时。

## 验证行为

- 未知的 `channels.*` 键是 **错误**，除非该频道 ID 在某个插件的 manifest 中被声明。
- `plugins.entries.<id>`、`plugins.allow`、`plugins.deny` 和 `plugins.slots.*` 必须引用 **可发现的** 插件 ID。未知的 ID 是 **错误**。
- 如果插件已安装，但其 manifest 或 schema 损坏或缺失，则验证失败，Doctor 会报告该插件的错误。
- 如果插件配置存在但插件是 **禁用** 的，配置将被保留，并在 Doctor + 日志中显示 **警告**。

## 注意事项

- 所有插件都 **必须提供 manifest**，包括本地文件系统加载的插件。
- 运行时仍会单独加载插件模块；manifest 仅用于发现和验证。
- 如果你的插件依赖原生模块，请记录构建步骤以及任何包管理器的允许列表要求（例如，pnpm 的 `allow-build-scripts` + `pnpm rebuild <package>`）。