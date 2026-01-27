---
summary: "Run Clawdbot in a sandboxed macOS VM (local or hosted) when you need isolation or iMessage"
read_when:
  - You want Clawdbot isolated from your main macOS environment
  - You want iMessage integration (BlueBubbles) in a sandbox
  - You want a resettable macOS environment you can clone
  - You want to compare local vs hosted macOS VM options
---

# Clawdbot 在 macOS 虚拟机上的使用（沙箱环境）

## 推荐默认方案（大多数用户）

- **小型 Linux VPS** 作为始终运行的网关，成本低。参见 [VPS 主机](/vps)。
- **专用硬件**（Mac mini 或 Linux 服务器）如果你想要完全的控制权和一个 **住宅 IP** 用于浏览器自动化。许多网站会屏蔽数据中心 IP，因此本地浏览通常效果更好。
- **混合方案**：将网关放在便宜的 VPS 上，当你需要浏览器/UI 自动化时，将你的 Mac 作为 **节点** 连接。参见 [节点](/nodes) 和 [网关远程](/gateway/remote)。

在你需要 macOS 独有的功能（如 iMessage/BlueBubbles）或希望与日常使用的 Mac 严格隔离时，可以使用 macOS 虚拟机。

## macOS 虚拟机选项

### 在你的 Apple Silicon Mac 上运行本地虚拟机（Lume）

在你已有的 Apple Silicon Mac 上使用 [Lume](https://cua.ai/docs/lume) 运行一个沙箱化的 macOS 虚拟机来运行 Clawdbot。

这将为你提供：
- 完整的 macOS 环境，实现隔离（你的主机保持干净）
- 通过 BlueBubbles 支持 iMessage（在 Linux/Windows 上无法实现）
- 通过克隆虚拟机实现快速重置
- 无需额外硬件或云服务费用

### 云上的 macOS 主机服务提供商（云服务）

如果你希望在云端使用 macOS，也可以选择一些提供 macOS 云主机的服务商：
- [MacStadium](https://www.macstadium.com/)（云主机 Mac）
- 其他提供 macOS 的云服务供应商也可以使用；请参考他们的虚拟机 + SSH 文档。

一旦你获得了对 macOS 虚拟机的 SSH 访问权限，请继续按照下面的第 6 步进行。

---

## 快速路径（Lume，高级用户）

1. 安装 Lume
2. `lume create clawdbot --os macos --ipsw latest`
3. 完成设置助手，启用远程登录（SSH）
4. `lume run clawdbot --no-display`
5. 通过 SSH 登录，安装 Clawdbot，配置频道
6. 完成

---

## 使用 Lume 所需条件

- Apple Silicon Mac（M1/M2/M3/M4）
- 主机上安装 macOS Sequoia 或更高版本
- 每个虚拟机约需 60 GB 可用磁盘空间
- 约 20 分钟
bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/trycua/cua/main/libs/lume/scripts/install.sh)"
" 
``````
如果 `~/.local/bin` 不在你的 PATH 中：```bash
echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.zshrc && source ~/.zshrc
```
验证：
bash
lume --version
``````
Docs: [Lume 安装](https://cua.ai/docs/lume/guide/getting-started/installation)

---

## 2) 创建 macOS 虚拟机```bash
lume create clawdbot --os macos --ipsw latest
```
This will download macOS and create a virtual machine. The VNC window will open automatically.

Note: Depending on your network connection, the download may take some time.

---

## 3) Complete the Setup Assistant

In the VNC window:
1. Select your language and region
2. Skip Apple ID (or log in if you want to use iMessage later)
3. Create a user account (remember the username and password)
4. Skip all optional features

After the setup is complete, enable SSH:
1. Open "System Settings" → "General" → "Sharing"
2. Enable "Remote Login"

---

## 4) Get the IP address of the virtual machine
bash
lume get clawdbot
``````
查找IP地址（通常为 `192.168.64.x`）。

---

## 5）通过SSH登录到虚拟机```bash
ssh youruser@192.168.64.X
```
将 `youruser` 替换为你的账户，将 IP 替换为你的虚拟机的 IP。

---

## 6）安装 Clawdbot

在虚拟机内部：
bash
npm install -g clawdbot@latest
clawdbot onboard --install-daemon
``````
按照入门提示设置您的模型提供商（Anthropic、OpenAI 等）。

---

## 7）配置频道
编辑配置文件：```bash
nano ~/.clawdbot/clawdbot.json
```
"添加你的频道：
json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "allowlist",
      "allowFrom": ["+15551234567"]
    },
    "telegram": {
      "botToken": "YOUR_BOT_TOKEN"
    }
  }
}
```"```
然后登录 WhatsApp（扫描二维码）：```bash
clawdbot channels login
```
## 8) 以无头模式运行虚拟机

停止虚拟机并重新启动，不带显示界面：
bash
lume stop clawdbot
lume run clawdbot --no-display
``````
虚拟机在后台运行。Clawdbot 的守护进程保持网关运行。

检查状态：```bash
ssh youruser@192.168.64.X "clawdbot status"
```
## 奖励功能：iMessage 集成

这是在 macOS 上运行的最大亮点功能。使用 [BlueBubbles](https://bluebubbles.app) 将 iMessage 添加到 Clawdbot 中。

在虚拟机中：

1. 从 bluebubbles.app 下载 BlueBubbles
2. 使用您的 Apple ID 登录
3. 启用 Web API 并设置密码
4. 将 BlueBubbles 的 Webhook 指向您的网关（例如：`https://your-gateway-host:3000/bluebubbles-webhook?password=<password>`）

将以下内容添加到您的 Clawdbot 配置中：
json
{
  "channels": {
    "bluebubbles": {
      "serverUrl": "http://localhost:1234",
      "password": "your-api-password",
      "webhookPath": "/bluebubbles-webhook"
    }
  }
}
``````
重启网关。现在你的代理可以发送和接收iMessages了。

完整设置详情：[BlueBubbles频道](/channels/bluebubbles)

---

## 保存一个干净的镜像

在进一步自定义之前，对你的干净状态进行快照：```bash
lume stop clawdbot
lume clone clawdbot clawdbot-golden
```
随时重置：
bash  
lume stop clawdbot && lume delete clawdbot  
lume clone clawdbot-golden clawdbot  
lume run clawdbot --no-display```
---

## 24/7 运行

通过以下方式保持虚拟机运行：
- 保持你的 Mac 连接电源
- 在系统设置 → 电源管理中禁用睡眠
- 如有需要，可以使用 `caffeinate`

如果需要真正的持续运行，建议使用专用的 Mac mini 或小型 VPS。参见 [VPS 托管](/vps)。

---

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| 无法通过 SSH 登录到 VM | 检查 VM 的系统设置中是否启用了“远程登录” |
| VM 的 IP 地址未显示 | 等待 VM 完全启动，再次运行 `lume get clawdbot` |
| 未找到 `lume` 命令 | 将 `~/.local/bin` 添加到你的 PATH 环境变量中 |
| WhatsApp 的 QR 码无法扫描 | 在运行 `clawdbot channels login` 时确保你已登录到 VM（不是主机） |

---

## 相关文档

- [VPS 托管](/vps)
- [节点](/nodes)
- [网关远程](/gateway/remote)
- [BlueBubbles 频道](/channels/bluebubbles)
- [Lume 快速入门](https://cua.ai/docs/lume/guide/getting-started/quickstart)
- [Lume CLI 参考](https://cua.ai/docs/lume/reference/cli-reference)
- [无监督 VM 设置](https://cua.ai/docs/lume/guide/fundamentals/unattended-setup)（高级）
- [Docker 隔离](/install/docker)（替代隔离方式）