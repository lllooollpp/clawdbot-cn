---
summary: "Inbound channel location parsing (Telegram + WhatsApp) and context fields"
read_when:
  - Adding or modifying channel location parsing
  - Using location context fields in agent prompts or tools
---

# 通道位置解析

Clawdbot 将聊天通道中的共享位置标准化为：
- 附加到传入消息正文的人类可读文本，以及
- 自动回复上下文有效载荷中的结构化字段。

目前支持的通道：
- **Telegram**（位置标记 + 场地 + 实时位置）
- **WhatsApp**（locationMessage + liveLocationMessage）
- **Matrix**（`m.location` 与 `geo_uri`）

## 文本格式化
位置以友好的格式显示，不带括号：

- 位置标记：
  - `📍 48.858844, 2.294351 ±12m`
- 命名地点：
  - `📍 埃菲尔铁塔 —— 战场广场，巴黎 (48.858844, 2.294351 ±12m)`
- 实时共享：
  - `🛰 实时位置：48.858844, 2.294351 ±12m`

如果通道包含标题/注释，它会显示在下一行：

📍 48.858844, 2.294351 ±12m
Meet here``````
## 上下文字段
当存在位置信息时，以下字段会被添加到 `ctx` 中：
- `LocationLat`（数字）
- `LocationLon`（数字）
- `LocationAccuracy`（数字，单位为米；可选）
- `LocationName`（字符串；可选）
- `LocationAddress`（字符串；可选）
- `LocationSource`（`pin | place | live`）
- `LocationIsLive`（布尔值）

## 渠道说明
- **Telegram**：场地信息会映射到 `LocationName/LocationAddress`；实时位置会使用 `live_period`。
- **WhatsApp**：`locationMessage.comment` 和 `liveLocationMessage.caption` 会被追加为标题行。
- **Matrix**：`geo_uri` 会被解析为一个标记位置；高度信息会被忽略，且 `LocationIsLive` 始终为 false。