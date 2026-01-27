---
summary: "CLI reference for `clawdbot configure` (interactive configuration prompts)"
read_when:
  - You want to tweak credentials, devices, or agent defaults interactively
---

# `clawdbot configure`

用于设置凭据、设备和代理默认值的交互式提示。

注意：**模型** 部分现在包含一个用于 `agents.defaults.models` 白名单的多选选项（即在 `/model` 和模型选择器中显示的内容）。

提示：使用 `clawdbot config` 而不带子命令将打开相同的向导。如需非交互式编辑，请使用 `clawdbot config get|set|unset`。

相关：
- 网关配置参考：[配置](/gateway/configuration)
- 配置 CLI：[配置](/cli/config)

备注：
- 选择网关运行的位置会始终更新 `gateway.mode`。如果你只需要这个部分，可以选择“继续”而跳过其他章节。
- 面向频道的服务（如 Slack/ Discord/ Matrix/ Microsoft Teams）在设置过程中会提示输入频道/房间白名单。你可以输入名称或 ID；向导在可能的情况下会将名称解析为 ID。
bash
clawdbot configure
clawdbot configure --section models --section channels``````
