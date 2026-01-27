---
summary: "Setup guide for developers working on the Clawdbot macOS app"
read_when:
  - Setting up the macOS development environment
---

# macOS 开发者设置

本指南涵盖了从源代码构建和运行 Clawdbot macOS 应用程序的必要步骤。

## 先决条件

在构建应用程序之前，请确保已安装以下内容：

1.  **Xcode 26.2+**：用于 Swift 开发的必需工具。
2.  **Node.js 22+ 与 pnpm**：用于网关、CLI 和打包脚本的必需环境。
bash
pnpm install
``````
## 2. 构建并打包应用程序

要构建 macOS 应用程序并将其打包为 `dist/Clawdbot.app`，运行以下命令：```bash
./scripts/package-mac-app.sh
```
如果我没有 Apple Developer ID 证书，脚本将自动使用 **无签名分发** (`-`)。

有关开发运行模式、签名标志和 Team ID 排查问题，请参阅 macOS 应用的 README：
https://github.com/clawdbot/clawdbot/blob/main/apps/macos/README.md

> **注意**：无签名分发的应用可能会触发安全提示。如果应用立即崩溃并显示 "Abort trap 6"，请参阅 [故障排除](#troubleshooting) 部分。

## 3. 安装 CLI

macOS 应用需要全局安装 `clawdbot` CLI 来管理后台任务。

**推荐安装方式：**
1. 打开 Clawdbot 应用。
2. 进入 **常规** 设置选项卡。
3. 点击 **"安装 CLI"**。

或者，可以手动安装：
bash
npm install -g clawdbot@<version>
``````
## 故障排除

### 构建失败：工具链或 SDK 不匹配
macOS 应用构建需要最新的 macOS SDK 和 Swift 6.2 工具链。

**系统依赖（必需）：**
- **Software Update 中可用的最新 macOS 版本**（由 Xcode 26.2 SDK 要求）
- **Xcode 26.2**（包含 Swift 6.2 工具链）

**检查项：**```bash
xcodebuild -version
xcrun swift --version
```
如果版本不匹配，请更新 macOS/Xcode 并重新运行构建。

### 授予权限时应用崩溃  
如果在尝试授予 **语音识别** 或 **麦克风** 访问权限时应用崩溃，可能是由于 TCC 缓存损坏或签名不匹配导致的。

**解决方法：**  
1. 重置 TCC 权限：  
   ```bash
   tccutil reset All com.clawdbot.mac.debug
   ```   ```
2. 如果这不起作用，请暂时修改 [`scripts/package-mac-app.sh`](https://github.com/clawdbot/clawdbot/blob/main/scripts/package-mac-app.sh) 中的 `BUNDLE_ID`，以强制 macOS 重新开始。

### 网关一直显示“Starting...”
如果网关状态一直显示“Starting...”，请检查是否有僵尸进程占用了端口：```bash
clawdbot gateway status
clawdbot gateway stop

# If you’re not using a LaunchAgent (dev mode / manual runs), find the listener:
lsof -nP -iTCP:18789 -sTCP:LISTEN
```
"如果手动运行占用了端口，请停止该进程（Ctrl+C）。作为最后的手段，终止上面找到的PID。"