---
summary: "Exploration: model config, auth profiles, and fallback behavior"
read_when:
  - Exploring future model selection + auth profile ideas
---

# 模型配置（探索）

本文档记录了**未来模型配置**的**想法**。这不是一个最终规格。如需了解当前行为，请参阅：
- [模型](/concepts/models)
- [模型故障转移](/concepts/model-failover)
- [OAuth + 资料](/concepts/oauth)

## 动机

运营人员希望：
- 每个提供者有多个认证资料（个人 vs 工作）。
- 简单的 `/model` 选择，并具有可预测的故障转移机制。
- 明确区分文本模型和具备图像能力的模型。

## 可能的方向（高层次）

- 保持模型选择的简洁性：使用 `provider/model` 格式，可选别名。
- 让提供者拥有多个认证资料，并明确其顺序。
- 使用全局故障转移列表，以确保所有会话一致地进行故障转移。
- 仅在显式配置时才覆盖图像路由。

## 待解决的问题

- 资料轮换应该按提供者还是按模型进行？
- 用户界面应如何展示会话中的资料选择？
- 从旧版配置键迁移的最安全路径是什么？