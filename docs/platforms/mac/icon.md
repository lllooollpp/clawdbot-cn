---
summary: "Menu bar icon states and animations for Clawdbot on macOS"
read_when:
  - Changing menu bar icon behavior
---

# 菜单栏图标状态

作者：steipete · 更新时间：2025-12-06 · 范围：macOS 应用程序 (`apps/macos`)

- **空闲状态（Idle）:** 正常的图标动画（闪烁，偶尔晃动）。
- **暂停状态（Paused）:** 状态项使用 `appearsDisabled`；没有运动。
- **语音唤醒（大耳朵）:** 当听到唤醒词时，语音唤醒检测器调用 `AppState.triggerVoiceEars(ttl: nil)`，在语音输入期间保持 `earBoostActive=true`。耳朵放大（1.9 倍），为了可读性添加圆形耳孔，之后在 1 秒静音后通过 `stopVoiceEars()` 恢复。仅由应用内的语音流程触发。
- **工作状态（Agent 运行中）:** `AppState.isWorking=true` 触发“尾巴/腿快速移动”的微小运动：在任务进行时腿晃动更快，并有轻微偏移。目前在 WebChat Agent 运行时切换；在连接其他长时间任务时，也应添加相同的切换逻辑。

连接点
- 语音唤醒：运行时/测试器在触发时调用 `AppState.triggerVoiceEars(ttl: nil)`，并在 1 秒静音后调用 `stopVoiceEars()` 以匹配捕获窗口。
- Agent 活动：在任务期间设置 `AppStateStore.shared.setWorking(true/false)`（已在 WebChat Agent 调用中实现）。保持任务周期短，并在 `defer` 块中重置以避免动画卡住。

形状与尺寸
- 基础图标由 `CritterIconRenderer.makeIcon(blink:legWiggle:earWiggle:earScale:earHoles:)` 绘制。
- 耳朵缩放默认为 `1.0`；语音增强时设置 `earScale=1.9` 并切换 `earHoles=true`，而不改变整体框架（18×18 点的模板图像渲染到 36×36 像素的 Retina 备份存储）。
- 快速移动时使用腿晃动最多约 `1.0` 并伴有轻微的水平抖动；这是对任何现有空闲晃动的叠加。

行为备注
- 不提供外部 CLI/代理切换来控制耳朵/工作状态；保持在应用内部信号中，以避免意外触发。
- 保持 TTL 短（<10 秒），以便在任务挂起时图标能快速恢复到基线状态。