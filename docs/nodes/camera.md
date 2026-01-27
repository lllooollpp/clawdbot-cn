---
summary: "Camera capture (iOS node + macOS app) for agent use: photos (jpg) and short video clips (mp4)"
read_when:
  - Adding or modifying camera capture on iOS nodes or macOS
  - Extending agent-accessible MEDIA temp-file workflows
---

# 摄像头捕捉（代理）

Clawdbot 支持 **摄像头捕捉** 功能用于代理工作流：

- **iOS 节点**（通过网关配对）：通过 `node.invoke` 捕捉 **照片**（`jpg`）或 **短视频片段**（`mp4`，可选带音频）。
- **Android 节点**（通过网关配对）：通过 `node.invoke` 捕捉 **照片**（`jpg`）或 **短视频片段**（`mp4`，可选带音频）。
- **macOS 应用**（通过网关的节点）：通过 `node.invoke` 捕捉 **照片**（`jpg`）或 **短视频片段**（`mp4`，可选带音频）。

所有摄像头访问都受 **用户控制的设置** 限制。

## iOS 节点

### 用户设置（默认开启）

- iOS 设置页面 → **摄像头** → **允许摄像头** (`camera.enabled`)
  - 默认：**开启**（缺失的键会被视为已开启）。
  - 当关闭时：`camera.*` 命令返回 `CAMERA_DISABLED`。

### 命令（通过网关 `node.invoke`）

- `camera.list`
  - 响应负载：
    - `devices`: 数组，包含 `{ id, name, position, deviceType }`

- `camera.snap`
  - 参数：
    - `facing`: `front|back`（默认：`front`）
    - `maxWidth`: 数字（可选；iOS 节点默认为 `1600`）
    - `quality`: `0..1`（可选；默认 `0.9`）
    - `format`: 当前为 `jpg`
    - `delayMs`: 数字（可选；默认 `0`）
    - `deviceId`: 字符串（可选；来自 `camera.list`）
  - 响应负载：
    - `format: "jpg"`
    - `base64: "<...>"`
    - `width`, `height`
  - 负载限制：照片会被重新压缩以确保 base64 负载不超过 5 MB。

- `camera.clip`
  - 参数：
    - `facing`: `front|back`（默认：`front`）
    - `durationMs`: 数字（默认 `3000`，最大限制为 `60000`）
    - `includeAudio`: 布尔值（默认 `true`）
    - `format`: 当前为 `mp4`
    - `deviceId`: 字符串（可选；来自 `camera.list`）
  - 响应负载：
    - `format: "mp4"`
    - `base64: "<...>"`
    - `durationMs`
    - `hasAudio`

### 前台要求

与 `canvas.*` 类似，iOS 节点仅允许在 **前台** 执行 `camera.*` 命令。在后台调用会返回 `NODE_BACKGROUND_UNAVAILABLE`。

### CLI 辅助工具（临时文件 + MEDIA）

获取附件最简单的方式是使用 CLI 辅助工具，它会将解码后的媒体写入临时文件，并输出 `MEDIA:<路径>`。

示例：
bash``````bash
clawdbot nodes camera snap --node <id>               # default: both front + back (2 MEDIA lines)
clawdbot nodes camera snap --node <id> --facing front
clawdbot nodes camera clip --node <id> --duration 3000
clawdbot nodes camera clip --node <id> --no-audio
```
## 注意事项：
- `nodes camera snap` 默认设置为 **both** 以提供代理两个视角。
- 输出文件是临时文件（位于操作系统临时目录中），除非你自己构建封装程序。

## Android 节点

### 用户设置（默认开启）

- Android 设置 → **相机** → **允许相机** (`camera.enabled`)
  - 默认：**开启**（缺少该键时视为已开启）。
  - 当关闭时：`camera.*` 命令将返回 `CAMERA_DISABLED`。

### 权限

- Android 需要运行时权限：
  - `CAMERA` 权限用于 `camera.snap` 和 `camera.clip`。
  - `RECORD_AUDIO` 权限用于 `camera.clip`，当 `includeAudio=true` 时。

如果权限缺失，应用会在适当的时候提示用户；如果被拒绝，`camera.*` 请求将返回 `*_PERMISSION_REQUIRED` 错误。

### 前台要求

与 `canvas.*` 类似，Android 节点仅允许在 **前台** 执行 `camera.*` 命令。在后台调用将返回 `NODE_BACKGROUND_UNAVAILABLE`。

### 有效载荷限制

照片会被重新压缩，以确保 base64 有效载荷不超过 5 MB。
bash
clawdbot nodes camera list --node <id>            # 列出相机 ID
clawdbot nodes camera snap --node <id>            # 输出 MEDIA:<路径>
clawdbot nodes camera snap --node <id> --max-width 1280
clawdbot nodes camera snap --node <id> --delay-ms 2000
clawdbot nodes camera snap --node <id> --device-id <id>
clawdbot nodes camera clip --node <id> --duration 10s          # 输出 MEDIA:<路径>
clawdbot nodes camera clip --node <id> --duration-ms 3000      # 输出 MEDIA:<路径>（旧版标志）
clawdbot nodes camera clip --node <id> --device-id <id>
clawdbot nodes camera clip --node <id> --no-audio
``````
注意事项：
- `clawdbot nodes camera snap` 默认使用 `maxWidth=1600`，除非被覆盖。
- 在 macOS 上，`camera.snap` 会在预热/曝光稳定后等待 `delayMs`（默认 2000 毫秒）再进行捕获。
- 照片数据会被重新压缩，以确保 base64 编码后的大小不超过 5 MB。

## 安全性与实际限制

- 相机和麦克风访问会触发操作系统通常的权限提示（并且需要在 Info.plist 中添加使用说明字符串）。
- 视频片段有时间限制（目前为 `<= 60s`），以避免节点数据过大（base64 编码开销 + 消息大小限制）。

## macOS 屏幕视频（系统级）

对于 *屏幕* 视频（非摄像头），请使用 macOS 的配套工具：```bash
clawdbot nodes screen record --node <id> --duration 10s --fps 15   # prints MEDIA:<path>
```
注意事项：
- 需要 macOS 的 **屏幕录制** 权限（TCC）。