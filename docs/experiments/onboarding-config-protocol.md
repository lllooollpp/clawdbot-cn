---
summary: "RPC protocol notes for onboarding wizard and config schema"
read_when: "Changing onboarding wizard steps or config schema endpoints"
---

# 上线流程 + 配置协议

目的：在 CLI、macOS 应用和 Web UI 之间共享上线流程 + 配置界面。

## 组件
- 向导引擎（共享会话 + 提示 + 上线状态）。
- CLI 上线流程使用与 UI 客户端相同的向导流程。
- 网关 RPC 暴露向导 + 配置模式端点。
- macOS 上线流程使用向导步骤模型。
- Web UI 从 JSON 模式 + UI 提示中渲染配置表单。

## 网关 RPC
- `wizard.start` 参数：`{ mode?: "local"|"remote", workspace?: string }`
- `wizard.next` 参数：`{ sessionId, answer?: { stepId, value? } }`
- `wizard.cancel` 参数：`{ sessionId }`
- `wizard.status` 参数：`{ sessionId }`
- `config.schema` 参数：`{}`

响应（结构）
- 向导：`{ sessionId, done, step?, status?, error? }`
- 配置模式：`{ schema, uiHints, version, generatedAt }`

## UI 提示
- `uiHints` 按路径键控；可选元数据（label/help/group/order/advanced/sensitive/placeholder）。
- 敏感字段以密码输入框形式渲染；不进行脱敏处理。
- 不支持的模式节点将回退到原始 JSON 编辑器。

## 备注
- 本文档是跟踪上线/配置协议重构的唯一文档。