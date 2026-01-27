---
summary: "Platform support overview (Gateway + companion apps)"
read_when:
  - Looking for OS support or install paths
  - Deciding where to run the Gateway
---

# 平台

Clawdbot 核心使用 TypeScript 编写。**Node 是推荐的运行时**。  
Bun 不推荐用于网关（WhatsApp/Telegram 存在一些问题）。

提供 macOS（菜单栏应用）和移动端节点（iOS/Android）的配套应用。  
Windows 和 Linux 的配套应用正在计划中，但目前网关已经完全支持。  
Windows 的原生配套应用也正在计划中；网关建议通过 WSL2 运行。

## 选择你的操作系统

- macOS: [macOS](/platforms/macos)
- iOS: [iOS](/platforms/ios)
- Android: [Android](/platforms/android)
- Windows: [Windows](/platforms/windows)
- Linux: [Linux](/platforms/linux)

## VPS 与托管

- VPS 中心: [VPS 托管](/vps)
- Railway（一键部署）: [Railway](/railway)
- Fly.io: [Fly.io](/platforms/fly)
- Hetzner（Docker）: [Hetzner](/platforms/hetzner)
- GCP（Compute Engine）: [GCP](/platforms/gcp)
- exe.dev（虚拟机 + HTTPS 代理）: [exe.dev](/platforms/exe-dev)

## 常用链接

- 安装指南: [开始使用](/start/getting-started)
- 网关操作手册: [网关](/gateway)
- 网关配置: [配置](/gateway/configuration)
- 服务状态: `clawdbot gateway status`

## 网关服务安装（CLI）

使用以下任意一种方式（均受支持）：

- 向导（推荐）: `clawdbot onboard --install-daemon`
- 直接安装: `clawdbot gateway install`
- 配置流程: `clawdbot configure` → 选择 **网关服务**
- 修复/迁移: `clawdbot doctor`（可选择安装或修复服务）

服务目标取决于操作系统：
- macOS: LaunchAgent (`com.clawdbot.gateway` 或 `com.clawdbot.<profile>`)
- Linux/WSL2: systemd 用户服务 (`clawdbot-gateway[-<profile>].service`)