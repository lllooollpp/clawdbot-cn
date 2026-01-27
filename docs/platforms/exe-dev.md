---
summary: "Run Clawdbot Gateway on exe.dev (VM + HTTPS proxy) for remote access"
read_when:
  - You want a cheap always-on Linux host for the Gateway
  - You want remote Control UI access without running your own VPS
---

# exe.dev

目标：在 exe.dev 的虚拟机上运行 Clawdbot 网关，可通过以下方式从您的笔记本电脑访问：
- **exe.dev HTTPS 代理**（简单，无需隧道）或
- **SSH 隧道**（最安全；仅限回环地址的网关）

本页面假设使用的是 **Ubuntu/Debian**。如果您选择了其他发行版，请相应地映射软件包。

如果您使用的是其他 Linux VPS，相同步骤也适用——只是您不会使用 exe.dev 的代理命令。

## 初学者快速路径

1) 创建虚拟机 → 安装 Node 22 → 安装 Clawdbot  
2) 运行 `clawdbot onboard --install-daemon`  
3) 从笔记本电脑建立隧道 (`ssh -N -L 18789:127.0.0.1:18789 …`)  
4) 打开 `http://127.0.0.1:18789/` 并粘贴您的令牌

## 所需条件

- exe.dev 账户 + 笔记本电脑上 `ssh exe.dev` 可用
- 已设置 SSH 密钥（您的笔记本电脑 → exe.dev）
- 您想要使用的模型认证方式（OAuth 或 API 密钥）
- 供应商凭证（可选）：WhatsApp 二维码扫描、Telegram 机器人令牌、Discord 机器人令牌等
bash
ssh exe.dev new --name=clawdbot
``````
然后连接：```bash
ssh clawdbot.exe.xyz
```
提示：请保持此虚拟机为**有状态**的。Clawdbot 会在 `~/.clawdbot/` 和 `~/clawd/` 下存储状态。

## 2) 安装先决条件（在虚拟机上）
bash
sudo apt-get update
sudo apt-get install -y git curl jq ca-certificates openssl
``````
### 节点 22

安装 Node **>= 22.12**（任何方法都可以）。快速检查：```bash
node -v
```
如果你的虚拟机上还没有安装 Node 22，请使用你偏好的 Node 管理器（如 nvm、mise 或 asdf），或者使用提供 Node 22+ 的发行版包源。

常见的 Ubuntu/Debian 选项（NodeSource）：
bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
``````
## 3) 安装 Clawdbot

推荐在服务器上安装：npm 全局安装。```bash
npm i -g clawdbot@latest
clawdbot --version
```
如果原生依赖项安装失败（很少见；通常为 `sharp`），请添加构建工具：
bash
sudo apt-get install -y build-essential python3```
## 4) 首次设置（向导）

在虚拟机上运行引导向导：```bash
clawdbot onboard --install-daemon
```
它可以设置：
- `~/clawd` 工作区引导
- `~/.clawdbot/clawdbot.json` 配置文件
- 模型认证配置文件
- 模型提供者配置/登录
- Linux systemd **user** 服务（服务）

如果你在无头虚拟机上进行 OAuth 认证：请先在普通机器上进行 OAuth，然后将认证配置文件复制到虚拟机（参见[帮助](/help)）。

## 5）远程访问选项

### 选项 A（推荐）：SSH 隧道（仅限环回地址）

保持网关在环回地址（默认），然后从你的笔记本电脑进行隧道连接：
bash
ssh -N -L 18789:127.0.0.1:18789 clawdbot.exe.xyz
``````
本地打开：
- `http://127.0.0.1:18789/` (控制界面)

运行手册：[远程访问](/gateway/remote)

### 选项 B：exe.dev HTTPS 代理（无隧道）

要让 exe.dev 将流量代理到虚拟机，请将网关绑定到局域网接口并设置一个令牌：```bash
export CLAWDBOT_GATEWAY_TOKEN="$(openssl rand -hex 32)"
clawdbot gateway --bind lan --port 8080 --token "$CLAWDBOT_GATEWAY_TOKEN"
```
对于服务运行，将其保存在 `~/.clawdbot/clawdbot.json` 中：
json5
{
  gateway: {
    mode: "local",
    port: 8080,
    bind: "lan",
    auth: { mode: "token", token: "YOUR_TOKEN" }
  }
}
``````
注意事项：
- 非回环绑定需要 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）。
- `gateway.remote.token` 仅用于远程 CLI 调用；它不会启用本地认证。

然后将 exe.dev 的代理指向 `8080`（或你选择的其他端口），并打开你的 VM 的 HTTPS URL：```bash
ssh exe.dev share port clawdbot 8080
```
打开：
- `https://clawdbot.exe.xyz/`

在控制界面中，粘贴令牌（UI → 设置 → 令牌）。UI 会将其作为 `connect.params.auth.token` 发送。

注意事项：
- 如果你的代理需要应用端口，请优先使用 **非默认** 端口（如 `8080`）。
- 将令牌视为密码对待。

控制界面详情：[Control UI](/web/control-ui)

## 6）让它持续运行（服务）

在 Linux 上，Clawdbot 使用 systemd **用户服务**。在执行 `--install-daemon` 后，请验证：
bash
systemctl --user status clawdbot-gateway[-<profile>].service
``````
如果服务在注销后终止，请启用 lingering：```bash
sudo loginctl enable-linger "$USER"
```
"更多：[Linux](/platforms/linux)

## 7) 更新
bash
npm i -g clawdbot@latest
clawdbot doctor
clawdbot gateway restart
clawdbot health
``````
指南：[更新](/install/updating)