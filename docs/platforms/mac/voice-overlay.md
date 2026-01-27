---
summary: "Voice overlay lifecycle when wake-word and push-to-talk overlap"
read_when:
  - Adjusting voice overlay behavior
---

# 语音覆盖生命周期（macOS）

受众：macOS 应用贡献者。目标：在唤醒词和按压说话（push-to-talk）重叠时，保持语音覆盖的可预测性。

### 当前意图
- 如果语音覆盖已经因唤醒词而显示，用户按下快捷键时，快捷键会话会 *采用* 已有的文本，而不是重置它。在快捷键被按住时，覆盖保持显示。当用户释放快捷键时：如果有修剪后的文本则发送，否则关闭覆盖。
- 仅唤醒词仍会在静音时自动发送；按压说话在释放时立即发送。

### 已实现（2025年12月9日）
- 语音覆盖会话现在为每次捕获（唤醒词或按压说话）携带一个令牌（token）。当令牌不匹配时，部分/最终/发送/关闭/音量更新会被丢弃，避免出现过时的回调。
- 按压说话会采用任何可见的语音覆盖文本作为前缀（因此在唤醒词覆盖显示时按下快捷键，会保留原有文本并追加新语音）。它会在 1.5 秒内等待最终的转录文本，之后回退到当前文本。

### 语音提示/覆盖日志
- 语音提示/覆盖日志会在 `info` 级别，分类为 `voicewake.overlay`、`voicewake.ptt` 和 `voicewake.chime`（包括会话开始、部分结果、最终结果、发送、关闭、语音提示原因）。

### 下一步计划
1. **VoiceSessionCoordinator（actor）**
   - 一次只拥有一个 `VoiceSession`。
   - API（基于令牌）：`beginWakeCapture`、`beginPushToTalk`、`updatePartial`、`endCapture`、`cancel`、`applyCooldown`。
   - 丢弃携带过时令牌的回调（防止旧的识别器重新打开覆盖）。
2. **VoiceSession（模型）**
   - 字段：`token`、`source`（wakeWord | pushToTalk）、已提交/临时文本、语音提示标志、计时器（自动发送、空闲）、`overlayMode`（显示 | 编辑 | 发送）、冷却时间截止时间。
3. **覆盖绑定**
   - `VoiceSessionPublisher`（`ObservableObject`）将当前会话镜像到 SwiftUI。
   - `VoiceWakeOverlayView` 仅通过 publisher 渲染；它永远不会直接修改全局单例。
   - 覆盖用户操作（`sendNow`、`dismiss`、`edit`）会通过会话令牌回调到协调器。
4. **统一发送路径**
   - 在 `endCapture` 时：如果修剪后的文本为空 → 关闭覆盖；否则调用 `performSend(session:)`（播放一次发送语音提示，转发，关闭覆盖）。
   - 按压说话：无延迟；唤醒词：可选延迟用于自动发送。
   - 在按压说话结束后，对唤醒运行时应用短暂的冷却时间，防止唤醒词立即再次触发。
5. **日志记录**
   - 协调器在子系统 `com.clawdbot` 中发出 `.info` 级别的日志，分类为 `voicewake.overlay` 和 `voicewake.chime`。
   - 关键事件：`session_started`、`adopted_by_push_to_talk`、`partial`、`finalized`、`send`、`dismiss`、`cancel`、`cooldown`。

### 调试检查清单
- 在重现粘滞覆盖时，流式输出日志：
bash
  sudo log stream --predicate 'subsystem == "com.clawdbot" AND category CONTAINS "voicewake"' --level info --style compact
  ```  ```
- 验证仅有一个活动的会话令牌；过期的回调应由协调器丢弃。
- 确保按住说话（Push-to-talk）释放时始终调用 `endCapture` 并传入活动令牌；如果文本为空，应预期调用 `dismiss` 而不触发提示音或发送。

### 迁移步骤（建议）
1. 添加 `VoiceSessionCoordinator`、`VoiceSession` 和 `VoiceSessionPublisher`。
2. 重构 `VoiceWakeRuntime`，使其负责创建/更新/结束会话，而不是直接操作 `VoiceWakeOverlayController`。
3. 重构 `VoicePushToTalk`，使其采用现有的会话并在释放时调用 `endCapture`；应用运行时冷却时间。
4. 将 `VoiceWakeOverlayController` 连接到发布者；从运行时/PTT 中移除直接调用。
5. 添加用于会话采用、冷却时间和空文本消失的集成测试。