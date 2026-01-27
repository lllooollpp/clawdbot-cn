---
summary: "Location command for nodes (location.get), permission modes, and background behavior"
read_when:
  - Adding location node support or permissions UI
  - Designing background location + push flows
---

# 位置命令（节点）

## TL;DR
- `location.get` 是一个节点命令（通过 `node.invoke` 调用）。
- 默认关闭。
- 设置使用选择器：关闭 / 使用时 / 始终。
- 独立开关：精确位置。

## 为什么使用选择器（而不是开关）
操作系统权限是多层次的。我们可以在应用内暴露一个选择器，但最终的权限授予仍由操作系统决定。
- iOS/macOS：用户可以在系统提示/设置中选择 **使用时** 或 **始终**。应用可以请求升级权限，但操作系统可能要求进入设置中进行调整。
- Android：后台位置权限是一个独立的权限；在 Android 10+ 上，通常需要进入设置流程。
- 精确位置是一个独立的权限（iOS 14+ 的“精确”，Android 的“精细”与“粗略”）。

UI 中的选择器决定了我们请求的模式；实际的权限授予则由操作系统设置决定。

## 设置模型
按节点设备：
- `location.enabledMode`: `off | whileUsing | always`
- `location.preciseEnabled`: 布尔值

UI 行为：
- 选择 `whileUsing` 会请求前台权限。
- 选择 `always` 会先确保 `whileUsing`，然后请求后台权限（或在需要时引导用户进入设置）。
- 如果操作系统拒绝了请求的权限级别，将回退到已授予的最高级别并显示状态。

## 权限映射（node.permissions）
可选。macOS 节点通过权限映射报告 `location`；iOS/Android 可能会省略它。

## 命令：`location.get`
通过 `node.invoke` 调用。

参数（建议）：
json
{
  "mode": "whileUsing | always",
  "precise": true | false
}
`````````json
{
  "timeoutMs": 10000,
  "maxAgeMs": 15000,
  "desiredAccuracy": "coarse|balanced|precise"
}
```
{
  "lat": 48.20849,
  "lon": 16.37208,
  "accuracyMeters": 12.5,
  "altitudeMeters": 182.0,
  "speedMps": 0.0,
  "headingDeg": 270.0,
  "timestamp": "2026-01-03T12:34:56.000Z",
  "isPrecise": true,
  "source": "gps|wifi|cell|unknown"
}```
错误代码（稳定代码）：
- `LOCATION_DISABLED`: 位置选择器已关闭。
- `LOCATION_PERMISSION_REQUIRED`: 请求模式缺少权限。
- `LOCATION_BACKGROUND_UNAVAILABLE`: 应用在后台运行，但仅允许“使用期间”模式。
- `LOCATION_TIMEOUT`: 未在规定时间内获取到位置信息。
- `LOCATION_UNAVAILABLE`: 系统故障 / 无可用位置提供者。

## 后台行为（未来功能）
目标：模型可以在节点处于后台时请求位置信息，但仅当满足以下条件时：
- 用户选择了 **始终允许**。
- 操作系统授予了后台位置权限。
- 应用被允许在后台运行以获取位置（iOS 后台模式 / Android 前台服务或特殊权限）。

推送触发流程（未来功能）：
1) 网关向节点发送推送消息（静默推送或 FCM 数据消息）。
2) 节点短暂唤醒并从设备请求位置信息。
3) 节点将数据包转发给网关。

注意事项：
- iOS：需要 **始终允许** 权限 + 后台位置模式。静默推送可能会被限流；可能会出现间歇性失败。
- Android：后台位置可能需要前台服务；否则可能会被拒绝。

## 模型/工具集成
- 工具界面：`nodes` 工具新增 `location_get` 操作（节点必需）。
- 命令行界面：`clawdbot nodes location get --node <id>`。
- 代理指南：仅在用户已启用位置权限且了解权限范围时调用。

## 用户体验文案（建议版本）
- 关闭： “位置共享已关闭。”
- 使用期间： “仅当 Clawdbot 打开时可用。”
- 始终允许： “允许后台位置。需要系统权限。”
- 精准定位： “使用精确的 GPS 位置。关闭以共享大致位置。”