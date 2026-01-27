---
summary: "macOS permission persistence (TCC) and signing requirements"
read_when:
  - Debugging missing or stuck macOS permission prompts
  - Packaging or signing the macOS app
  - Changing bundle IDs or app install paths
---

# macOS 权限（TCC）

macOS 的权限授予机制是脆弱的。TCC（Transparency, Consent, and Control）会将权限授予与应用程序的代码签名、捆绑标识符和磁盘路径相关联。如果其中任何一个发生变化，macOS 会将应用程序视为一个新的应用，并可能撤销或隐藏提示。

## 保持权限稳定的条件
- 相同路径：从固定的位置运行应用程序（对于 Clawdbot，使用 `dist/Clawdbot.app`）。
- 相同的捆绑标识符：更改捆绑 ID 会创建一个新的权限身份。
- 签名应用程序：未签名或使用临时签名的构建无法保留权限。
- 稳定的签名：使用真实的 Apple 开发者证书或开发者 ID 证书，以确保在重新构建时签名保持一致。

临时签名（Ad-hoc signature）会在每次构建时生成一个新的身份。macOS 会忘记之前的授权，并且提示可能会完全消失，直到旧的条目被清除。

## 当提示消失时的恢复清单
1. 退出应用程序。
2. 在系统设置 -> 隐私与安全性中移除应用程序条目。
3. 从相同路径重新启动应用程序并重新授予权限。
4. 如果提示仍然没有出现，请使用 `tccutil` 重置 TCC 条目并重试。
5. 某些权限只有在完全重启 macOS 后才会重新出现。

示例重置（根据需要替换捆绑 ID）：
bash
sudo tccutil reset Accessibility com.clawdbot.mac
sudo tccutil reset ScreenCapture com.clawdbot.mac
sudo tccutil reset AppleEvents```
如果您在测试权限，请始终使用真实证书进行签名。Ad-hoc 构建仅适用于快速的本地运行，此时权限并不重要。