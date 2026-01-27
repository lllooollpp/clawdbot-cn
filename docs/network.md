---
summary: "Network hub: gateway surfaces, pairing, discovery, and security"
read_when:
  - You need the network architecture + security overview
  - You are debugging local vs tailnet access or pairing
  - You want the canonical list of networking docs
---

# 网络中继站

此中继站链接了 Clawdbot 在本地主机、局域网（LAN）和 tailnet 上连接、配对和安全设备的核心文档。

## 核心模型

- [网关架构](/concepts/architecture)
- [网关协议](/gateway/protocol)
- [网关操作手册](/gateway)
- [网络界面 + 绑定模式](/web)

## 配对 + 身份验证

- [配对概述（DM + 节点）](/start/pairing)
- [网关拥有的节点配对](/gateway/pairing)
- [设备 CLI（配对 + 令牌轮换）](/cli/devices)
- [配对 CLI（DM 审批）](/cli/pairing)

本地信任：
- 本地连接（环回地址或网关主机自身的 tailnet 地址）可以自动批准配对，以保持同主机的用户体验流畅。
- 非本地 tailnet/LAN 客户端仍需要显式的配对审批。

## 发现 + 传输方式

- [发现与传输方式](/gateway/discovery)
- [Bonjour / mDNS](/gateway/bonjour)
- [远程访问（SSH）](/gateway/remote)
- [Tailscale](/gateway/tailscale)

## 节点 + 传输方式

- [节点概述](/nodes)
- [桥接协议（旧版节点）](/gateway/bridge-protocol)
- [节点操作手册：iOS](/platforms/ios)
- [节点操作手册：Android](/platforms/android)

## 安全性

- [安全性概述](/gateway/security)
- [网关配置参考](/gateway/configuration)
- [故障排除](/gateway/troubleshooting)
- [诊断工具](/gateway/doctor)