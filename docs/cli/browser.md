---
summary: "CLI reference for `clawdbot browser` (profiles, tabs, actions, extension relay, remote serve)"
read_when:
  - You use `clawdbot browser` and want examples for common tasks
  - You want to control a remote browser via `browser.controlUrl`
  - You want to use the Chrome extension relay (attach/detach via toolbar button)
---

# `clawdbot browser`

管理 Clawdbot 的浏览器控制服务器并执行浏览器操作（标签页、快照、截图、导航、点击、输入）。

相关：
- 浏览器工具 + API: [Browser tool](/tools/browser)
- Chrome 扩展中继: [Chrome 扩展](/tools/chrome-extension)

## 常用标志

- `--url <controlUrl>`：覆盖此次命令调用的 `browser.controlUrl`。
- `--browser-profile <name>`：选择一个浏览器配置文件（默认来自配置）。
- `--json`：机器可读的输出（在支持的情况下）。

## 快速入门（本地）
bash
clawdbot browser --browser-profile chrome tabs
clawdbot browser --browser-profile clawd start
clawdbot browser --browser-profile clawd open https://example.com
clawdbot browser --browser-profile clawd snapshot``````
## 配置文件

配置文件是命名的浏览器路由配置。实际上：
- `clawd`：启动/附加到由 Clawdbot 管理的专用 Chrome 实例（隔离的用户数据目录）。
- `chrome`：通过 Chrome 扩展中继控制您现有的 Chrome 标签页。```bash
clawdbot browser profiles
clawdbot browser create-profile --name work --color "#FF5A36"
clawdbot browser delete-profile --name work
```
使用特定配置文件：clawdbot browser --browser-profile work tabs
## 标签页
clawdbot browser tabs
clawdbot browser open https://docs.clawd.bot
clawdbot browser focus <targetId>
clawdbot browser close <targetId>```
## 快照 / 截图 / 操作

快照：
bash
clawdbot browser snapshot
``````
截图：
bash
clawdbot 浏览器截图
``````
"导航/点击/输入（基于引用的UI自动化）：
bash
clawdbot 浏览器 导航 https://example.com
clawdbot 浏览器 点击 <ref>
clawdbot 浏览器 输入 <ref> "hello"
" 
``````
## Chrome 扩展中继（通过工具栏按钮附加）

此模式允许代理手动控制现有的 Chrome 标签页（不会自动附加）。

将未打包的扩展安装到稳定路径：
bash
clawdbot browser extension install
clawdbot browser extension path
``````
然后在 Chrome 中 → `chrome://extensions` → 启用“开发者模式” → 点击“加载解压的扩展程序” → 选择打印出来的文件夹。

完整指南：[Chrome 扩展](/tools/chrome-extension)

## 远程浏览器控制 (`clawdbot browser serve`)

如果网关运行在与浏览器不同的机器上，请在运行 Chrome 的机器上启动一个独立的浏览器控制服务器：
bash
clawdbot browser serve --bind 127.0.0.1 --port 18791 --token <token>
``````
然后使用 `browser.controlUrl` + `browser.controlToken`（或 `CLAWDBOT_BROWSER_CONTROL_TOKEN`）将网关指向它。

安全与TLS最佳实践：[浏览器工具](/tools/browser)，[Tailscale](/gateway/tailscale)，[安全](/gateway/security)