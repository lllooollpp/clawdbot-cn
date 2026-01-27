---
summary: "VPS hosting hub for Clawdbot (Railway/Fly/Hetzner/exe.dev)"
read_when:
  - You want to run the Gateway in the cloud
  - You need a quick map of VPS/hosting guides
---

# VPS托管

此中心链接到支持的VPS/托管指南，并从高层次解释云计算部署的工作原理。

## 选择一个提供商

- **Railway**（一键式 + 浏览器设置）: [Railway](/railway)
- **Fly.io**: [Fly.io](/platforms/fly)
- **Hetzner（Docker）**: [Hetzner](/platforms/hetzner)
- **GCP（Compute Engine）**: [GCP](/platforms/gcp)
- **exe.dev**（虚拟机 + HTTPS代理）: [exe.dev](/platforms/exe-dev)
- **AWS（EC2/Lightsail/免费套餐）**: 也可以很好地工作。视频指南：
  https://x.com/techfrenAJ/status/2014934471095812547

## 云计算设置的工作原理

- **网关在VPS上运行**，并管理状态和工作区。
- 你可以通过 **控制界面** 或 **Tailscale/SSH** 从你的笔记本电脑/手机连接。
- 将VPS视为权威来源，并 **备份** 状态和工作区。

远程访问：[网关远程访问](/gateway/remote)  
平台中心：[平台](/platforms)

## 使用节点与VPS

你可以在云中保持网关运行，并在本地设备（Mac/iOS/Android/无头设备）上配对 **节点**。节点提供本地屏幕/摄像头/画布和 `system.run` 功能，而网关则保持在云端。

文档：[节点](/nodes)，[节点CLI](/cli/nodes)