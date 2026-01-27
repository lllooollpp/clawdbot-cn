---
summary: "Agent-controlled Canvas panel embedded via WKWebView + custom URL scheme"
read_when:
  - Implementing the macOS Canvas panel
  - Adding agent controls for visual workspace
  - Debugging WKWebView canvas loads
---

# Canvas（macOS 应用）

macOS 应用通过 `WKWebView` 嵌入了一个由代理控制的 **Canvas 面板**。它是一个轻量级的可视化工作区，用于 HTML/CSS/JS、A2UI 以及小型交互式 UI 表面。

## Canvas 的存储位置

Canvas 的状态存储在 Application Support 目录下：

- `~/Library/Application Support/Clawdbot/canvas/<session>/...`

Canvas 面板通过一个 **自定义 URL 方案** 提供这些文件：

- `clawdbot-canvas://<session>/<path>`

示例：
- `clawdbot-canvas://main/` → `<canvasRoot>/main/index.html`
- `clawdbot-canvas://main/assets/app.css` → `<canvasRoot>/main/assets/app.css`
- `clawdbot-canvas://main/widgets/todo/` → `<canvasRoot>/main/widgets/todo/index.html`

如果没有在根目录找到 `index.html`，应用会显示一个 **内置的模板页面**。

## 面板行为

- 无边框、可调整大小的面板，靠近菜单栏（或鼠标光标）锚定。
- 会为每个会话记住大小/位置。
- 当本地 Canvas 文件发生变化时会自动重新加载。
- 同一时间只能显示一个 Canvas 面板（必要时会切换会话）。

Canvas 可以在设置 → **允许 Canvas** 中禁用。当禁用时，Canvas 节点命令将返回 `CANVAS_DISABLED`。

## 代理 API 接口

Canvas 通过 **Gateway WebSocket** 暴露出来，因此代理可以：

- 显示/隐藏面板
- 导航到某个路径或 URL
- 执行 JavaScript
- 捕获快照图片

CLI 示例：
bash
clawdbot nodes canvas present --node <id>
clawdbot nodes canvas navigate --node <id> --url "/"
clawdbot nodes canvas eval --node <id> --js "document.title"
clawdbot nodes canvas snapshot --node <id>
``````
说明：
- `canvas.navigate` 接受 **本地画布路径**、`http(s)` URL 和 `file://` URL。
- 如果传递 `"/"`，Canvas 将显示本地的 scaffold 或 `index.html`。

## A2UI 在 Canvas 中

A2UI 由 Gateway 的画布主机托管，并在 Canvas 面板中渲染。
当 Gateway 宣布一个 Canvas 主机时，macOS 应用程序在首次打开时会自动导航到 A2UI 主机页面。

默认的 A2UI 主机 URL：```
http://<gateway-host>:18793/__clawdbot__/a2ui/
```
### A2UI 命令（v0.8）

Canvas 当前支持 **A2UI v0.8** 的服务器→客户端消息：

- `beginRendering`
- `surfaceUpdate`
- `dataModelUpdate`
- `deleteSurface`

`createSurface`（v0.9）不被支持。

CLI 示例：
bash
cat > /tmp/a2ui-v0.8.jsonl <<'EOFA2'
{"surfaceUpdate":{"surfaceId":"main","components":[{"id":"root","component":{"Column":{"children":{"explicitList":["title","content"]}}}},{"id":"title","component":{"Text":{"text":{"literalString":"Canvas (A2UI v0.8)"},"usageHint":"h1"}}},{"id":"content","component":{"Text":{"text":{"literalString":"If you can read this, A2UI push works."},"usageHint":"body"}}}]}}
{"beginRendering":{"surfaceId":"main","root":"root"}}
EOFA2

clawdbot nodes canvas a2ui push --jsonl /tmp/a2ui-v0.8.jsonl --node <id>
``````
快速吸烟：```bash
clawdbot nodes canvas a2ui push --node <id> --text "Hello from A2UI"
```
## 通过 Canvas 触发代理运行

Canvas 可以通过深度链接触发新的代理运行：

- `clawdbot://agent?...`

示例（在 JS 中）：
js
window.location.href = "clawdbot://agent?message=Review%20this%20design";
``````
应用会在未提供有效密钥时提示进行确认。

## 安全注意事项

- Canvas 方案阻止目录遍历；文件必须位于会话根目录下。
- 本地 Canvas 内容使用自定义方案（无需回环服务器）。
- 外部 `http(s)` URL 仅在明确导航时允许使用。