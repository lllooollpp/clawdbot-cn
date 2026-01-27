---
summary: "iOS node app: connect to the Gateway, pairing, canvas, and troubleshooting"
read_when:
  - Pairing or reconnecting the iOS node
  - Running the iOS app from source
  - Debugging gateway discovery or canvas commands
---

# iOS 应用（Node）

可用性：内部预览。该 iOS 应用尚未对外公开分发。

## 它的功能

- 通过 WebSocket 连接到网关（局域网或 Tailnet）。
- 暴露节点功能：画布、屏幕快照、摄像头捕获、位置、通话模式、语音唤醒。
- 接收 `node.invoke` 命令并报告节点状态事件。

## 要求

- 网关需在另一台设备上运行（macOS、Linux 或 Windows 通过 WSL2）。
- 网络路径：
  - 通过 Bonjour 在同一局域网内，**或者**
  - 通过单播 DNS-SD（`clawdbot.internal.`）在 Tailnet 中，**或者**
  - 手动指定主机/端口（备用方案）。

## 快速开始（配对 + 连接）

1) 启动网关：
bash
clawdbot gateway --port 18789
``````
2) 在 iOS 应用中，打开“设置”并选择一个发现的网关（或启用“手动主机”并输入主机/端口）。

3) 在网关主机上批准配对请求：```bash
clawdbot nodes pending
clawdbot nodes approve <requestId>
```
4) 验证连接：
bash  
clawdbot nodes status  
clawdbot gateway call node.list --params "{}"  
``````
## 发现路径

### Bonjour（局域网）

网关在 `local.` 上发布 `_clawdbot._tcp`。iOS 应用会自动列出这些服务。

### Tailnet（跨网络）

如果 mDNS 被阻止，可以使用单播 DNS-SD 区域（推荐域名：`clawdbot.internal.`）和 Tailscale 分割 DNS。
有关 CoreDNS 示例，请参阅 [Bonjour](/gateway/bonjour)。

### 手动主机/端口

在设置中，启用 **手动主机** 并输入网关主机 + 端口（默认端口为 `18789`）。

## Canvas + A2UI

iOS 节点渲染一个 WKWebView 画布。使用 `node.invoke` 来驱动它：```bash
clawdbot nodes invoke --node "iOS Node" --command canvas.navigate --params '{"url":"http://<gateway-host>:18793/__clawdbot__/canvas/"}'
```
注意事项：
- 网关画布主机提供 `/__clawdbot__/canvas/` 和 `/__clawdbot__/a2ui/`。
- 当广告画布主机 URL 时，iOS 节点在连接时会自动导航到 A2UI。
- 使用 `canvas.navigate` 和 `{"url":""}` 返回到内置的脚手架。
bash
clawdbot nodes invoke --node "iOS Node" --command canvas.eval --params '{"javaScript":"(() => { const {ctx} = window.__clawdbot; ctx.clearRect(0,0,innerWidth,innerHeight); ctx.lineWidth=6; ctx.strokeStyle=\"#ff2d55\"; ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(innerWidth-40, innerHeight-40); ctx.stroke(); return \"ok\"; })()"}'
``````
```md
clawdbot 节点调用 --节点 "iOS 节点" --命令 canvas.snapshot --参数 '{"maxWidth":900,"format":"jpeg"}'```
## 语音唤醒 + 语音对话模式

- 语音唤醒和语音对话模式可在设置中启用。
- iOS 可能会暂停后台音频；当应用不在前台运行时，语音功能可能无法保证正常工作。

## 常见错误

- `NODE_BACKGROUND_UNAVAILABLE`: 将 iOS 应用带到前台（画布/相机/屏幕命令需要此操作）。
- `A2UI_HOST_NOT_CONFIGURED`: 网关未广播画布主机 URL；请检查 [网关配置](/gateway/configuration) 中的 `canvasHost`。
- 配对提示始终不出现：运行 `clawdbot nodes pending` 并手动批准。
- 重新安装后重连失败：钥匙串中的配对令牌已被清除；请重新配对节点。

## 相关文档

- [配对](/gateway/pairing)
- [发现](/gateway/discovery)
- [Bonjour](/gateway/bonjour)