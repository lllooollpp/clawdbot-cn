---
summary: "Zalo Personal plugin: QR login + messaging via zca-cli (plugin install + channel config + CLI + tool)"
read_when:
  - You want Zalo Personal (unofficial) support in Clawdbot
  - You are configuring or developing the zalouser plugin
---

# Zalo 个人版（插件）

通过插件支持 Clawdbot 对 Zalo 个人账户的自动化操作，使用 `zca-cli` 来自动化一个普通 Zalo 用户账户。

> **警告：** 非官方的自动化可能导致账户被暂停/封禁。请自行承担风险。

## 命名
频道 ID 为 `zalouser`，以明确表示此插件用于自动化一个 **个人 Zalo 用户账户**（非官方）。我们保留 `zalo` 用于未来可能的官方 Zalo API 集成。

## 运行位置
此插件在 **Gateway 进程内部** 运行。

如果你使用的是远程 Gateway，请在 **运行 Gateway 的机器上** 安装/配置它，然后重启 Gateway。
bash
clawdbot plugins install @clawdbot/zalouser
``````
重启网关后继续操作。

### 选项 B：从本地文件夹安装（开发环境）```bash
clawdbot plugins install ./extensions/zalouser
cd ./extensions/zalouser && pnpm install
```
重启网关后。

## 先决条件：zca-cli
网关机器上必须在 `PATH` 中包含 `zca`：
bash
zca --version
``````
## 配置
频道配置位于 `channels.zalouser` 下（而非 `plugins.entries.*`）：```json5
{
  channels: {
    zalouser: {
      enabled: true,
      dmPolicy: "pairing"
    }
  }
}
```
## 命令行界面（CLI）
``bash
clawdbot channels login --channel zalouser
clawdbot channels logout --channel zalouser
clawdbot channels status --probe
clawdbot message send --channel zalouser --target <threadId> --message "Hello from Clawdbot"
clawdbot directory peers list --channel zalouser --query "name"```
## Agent 工具
工具名称: `zalouser`

操作: `发送`, `图片`, `链接`, `好友`, `群组`, `我`, `状态`