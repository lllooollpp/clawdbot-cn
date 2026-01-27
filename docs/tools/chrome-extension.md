---
summary: "Chrome extension: let Clawdbot drive your existing Chrome tab"
read_when:
  - You want the agent to drive an existing Chrome tab (toolbar button)
  - You need remote Gateway + local browser automation via Tailscale
  - You want to understand the security implications of browser takeover
---

# Chrome 扩展（浏览器中继）

Clawdbot Chrome 扩展允许代理控制你的 **现有 Chrome 标签页**（你的正常 Chrome 窗口），而不是启动一个单独的 clawd 管理的 Chrome 配置文件。

通过 **单个 Chrome 工具栏按钮** 实现连接/断开。

## 它是什么（概念）

它包含三个部分：
- **浏览器控制服务器**（HTTP）：代理/工具调用的 API（`browser.controlUrl`）
- **本地中继服务器**（loopback CDP）：在控制服务器和扩展之间进行桥梁连接（默认为 `http://127.0.0.1:18792`）
- **Chrome MV3 扩展**：使用 `chrome.debugger` 附加到当前标签页，并将 CDP 消息转发到中继服务器

Clawdbot 随后通过正常的 `browser` 工具界面控制已连接的标签页（选择正确的配置文件）。
bash
clawdbot browser extension install
``````
2) 打印已安装的扩展目录路径：```bash
clawdbot browser extension path
```
3) Chrome → `chrome://extensions`
- 启用“开发者模式”
- “加载解压的扩展程序” → 选择上方打印的目录

4) 将扩展程序固定到 Chrome。

## 更新（无需构建步骤）

该扩展程序作为静态文件包含在 Clawdbot 的发布版本（npm 包）中。无需单独的“构建”步骤。

升级 Clawdbot 后：
- 重新运行 `clawdbot browser extension install` 以刷新 Clawdbot 状态目录下的已安装文件。
- Chrome → `chrome://extensions` → 点击扩展程序的“重新加载”。

## 使用它（无需额外配置）

Clawdbot 内置了一个名为 `chrome` 的浏览器配置文件，该配置文件默认使用扩展程序中继的端口。

使用方法：
- 命令行：`clawdbot browser --browser-profile chrome tabs`
- 代理工具：`browser` 并设置 `profile="chrome"`

如果你想使用不同的名称或不同的中继端口，请创建自己的配置文件：
bash
clawdbot browser create-profile \
  --name my-chrome \
  --driver extension \
  --cdp-url http://127.0.0.1:18792 \
  --color "#00AA00"
``````
## 挂载 / 取消挂载（工具栏按钮）

- 打开你希望 Clawdbot 控制的标签页。
- 点击扩展程序图标。
  - 当标签页被挂载时，徽章会显示 `ON`。
- 再次点击以取消挂载。

## 它控制的是哪个标签页？

- 它**不会自动**控制“你当前正在查看的标签页”。
- 它仅控制**你通过点击工具栏按钮显式挂载的标签页**。
- 要切换标签页：打开另一个标签页，然后在该标签页中点击扩展程序图标。

## 徽章 + 常见错误

- `ON`：已挂载；Clawdbot 可以控制该标签页。
- `…`：正在连接到本地中继服务器。
- `!`：中继服务器不可达（最常见的原因是：本机未运行浏览器中继服务器）。

如果你看到 `!`：
- 确保网关在本地运行（默认设置），或者在本机运行 `clawdbot browser serve`（远程网关设置）。
- 打开扩展程序的“选项”页面；它会显示中继服务器是否可达。

## 我需要运行 `clawdbot browser serve` 吗？

### 本地网关（与 Chrome 在同一台机器上）—— 通常 **不需要**

如果网关与 Chrome 在同一台机器上，并且你的 `browser.controlUrl` 是回环地址（默认设置），
你通常**不需要**运行 `clawdbot browser serve`。

网关内置的浏览器控制服务器会默认在 `http://127.0.0.1:18791/` 启动，Clawdbot 会自动在 `http://127.0.0.1:18792/` 启动本地中继服务器。

### 远程网关（网关运行在其他机器上）—— **需要**

如果你的网关运行在其他机器上，请在运行 Chrome 的机器上运行 `clawdbot browser serve`
（并通过 Tailscale Serve / TLS 公开它）。请参见下面的章节。```json5
{
  agents: {
    defaults: {
      sandbox: {
        browser: {
          allowHostControl: true
        }
      }
    }
  }
}
```
然后确保工具不会被工具策略阻止，并（如需要）使用 `target="host"` 调用 `browser`。

调试：`clawdbot sandbox explain`

## 远程网关（推荐：Tailscale Serve）

目标：网关运行在一台机器上，但 Chrome 运行在其他地方。

在 **浏览器机器** 上：
bash
clawdbot browser serve --bind 127.0.0.1 --port 18791 --token <token>
tailscale serve https / http://127.0.0.1:18791
``````
在 **网关机器** 上：
- 将 `browser.controlUrl` 设置为 HTTPS 服务地址（MagicDNS/ts.net）。
- 提供令牌（优先使用环境变量）：```bash
export CLAWDBOT_BROWSER_CONTROL_TOKEN="<token>"
```
然后代理可以通过调用远程 `browser.controlUrl` API 来控制浏览器，而扩展程序 + 中继服务则保留在浏览器所在机器的本地。

## “扩展路径”的工作原理

`clawdbot browser extension path` 会输出包含扩展程序文件的 **已安装** 磁盘目录。

CLI 不会 **输出** `node_modules` 路径。请始终先运行 `clawdbot browser extension install`，将扩展程序复制到 Clawdbot 状态目录下的稳定位置。

如果你移动或删除该安装目录，Chrome 会将该扩展程序标记为损坏，直到你从有效路径重新加载它。

## 安全影响（请阅读）

这是一个非常强大但也非常危险的功能。请将其视为赋予模型“操控你的浏览器”的权限。

- 扩展程序使用 Chrome 的调试器 API（`chrome.debugger`）。当连接时，模型可以：
  - 在该标签页中点击/输入/导航
  - 读取页面内容
  - 访问该标签页已登录会话能够访问的任何内容
- **这不是隔离的**，不像由 Clawd 管理的专用配置文件。
  - 如果你连接到你的日常使用配置文件/标签页，你将授予模型对该账号状态的访问权限。

建议：
- 为扩展程序中继使用一个专用的 Chrome 配置文件（与你的个人浏览分开）。
- 保持浏览器控制服务器仅限于 tailnet（Tailscale）并要求使用令牌。
- 避免通过局域网（`0.0.0.0`）暴露浏览器控制，并避免使用 Funnel（公网）。

相关：
- 浏览器工具概述：[Browser](/tools/browser)
- 安全审计：[Security](/gateway/security)
- Tailscale 设置：[Tailscale](/gateway/tailscale)