---
summary: "Manual logins for browser automation + X/Twitter posting"
read_when:
  - You need to log into sites for browser automation
  - You want to post updates to X/Twitter
---

# 浏览器登录 + X/推特发帖

## 手动登录（推荐）

当某个网站需要登录时，请在 **主机浏览器配置文件**（clawd 浏览器）中 **手动登录**。

请 **不要** 将您的凭据提供给模型。自动登录往往会触发反机器人防御机制，可能导致账户被锁定。

返回主浏览器文档：[浏览器](/tools/browser)。

## 使用的是哪个 Chrome 配置文件？

Clawdbot 控制一个 **专用的 Chrome 配置文件**（名为 `clawd`，带有橙色调界面）。这与您日常使用的浏览器配置文件是分开的。

两种简单的方法可以访问它：

1) **让代理打开浏览器**，然后由您自己登录。
2) **通过 CLI 打开它**：
bash
clawdbot browser start
clawdbot browser open https://x.com
``````
如果您有多个配置文件，请使用 `--browser-profile <name>`（默认为 `clawd`）。

## X/Twitter：推荐的操作流程

- **阅读/搜索/查看话题线程**：使用 **bird** 命令行工具（无需浏览器，稳定性高）。
  - 仓库地址：https://github.com/steipete/bird
- **发布更新**：使用 **host** 浏览器（需要手动登录）。

## 沙箱环境 + host 浏览器访问

沙箱中的浏览器会话**更有可能**触发机器人检测。对于 X/Twitter（以及其他严格网站），建议使用 **host** 浏览器。

如果代理处于沙箱环境中，浏览器工具将默认使用沙箱。若要允许使用 host 浏览器控制：```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        browser: {
          allowHostControl: true
        }
      }
    }
  }
}
```
然后针对主机浏览器：
bash
clawdbot browser open https://x.com --browser-profile clawd --target host
``````
或者为发布更新的代理禁用沙箱机制。