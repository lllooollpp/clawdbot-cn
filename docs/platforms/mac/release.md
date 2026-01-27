---
summary: "Clawdbot macOS release checklist (Sparkle feed, packaging, signing)"
read_when:
  - Cutting or validating a Clawdbot macOS release
  - Updating the Sparkle appcast or feed assets
---

# Clawdbot macOS 发布（Sparkle）

此应用程序现已支持 Sparkle 自动更新。发布版本必须使用 Developer ID 签名、压缩，并通过签名的 appcast 条目进行发布。

## 前置条件
- 已安装 Developer ID 应用证书（例如：`Developer ID Application: <开发者姓名> (<TEAMID>)`）。
- 在环境变量中设置了 Sparkle 私钥路径，变量名为 `SPARKLE_PRIVATE_KEY_FILE`（指向你的 Sparkle ed25519 私钥；公钥已内置于 Info.plist 中）。如果该变量缺失，请检查 `~/.profile`。
- 如果你想发布 Gatekeeper 安全的 DMG/zip 文件，需要准备 notary 的凭证（keychain 配置文件或 API 密钥）。
  - 我们使用一个名为 `clawdbot-notary` 的 Keychain 配置文件，该文件通过你的 shell 配置文件中的 App Store Connect API 密钥环境变量创建：
    - `APP_STORE_CONNECT_API_KEY_P8`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`
       - `echo "$APP_STORE_CONNECT_API_KEY_P8" | sed 's/\\n/\n/g' > /tmp/clawdbot-notary.p8`
    - `xcrun notarytool store-credentials "clawdbot-notary" --key /tmp/clawdbot-notary.p8 --key-id "$APP_STORE_CONNECT_KEY_ID" --issuer "$APP_STORE_CONNECT_ISSUER_ID"`

- 安装了 `pnpm` 依赖（使用 `pnpm install --config.node-linker=hoisted`）。
- Sparkle 工具会通过 SwiftPM 自动获取，位于 `apps/macos/.build/artifacts/sparkle/Sparkle/bin/` 目录下（如 `sign_update`、`generate_appcast` 等）。

## 构建与打包
说明：
- `APP_BUILD` 映射到 `CFBundleVersion` / `sparkle:version`；请保持为纯数字且单调递增（不要带 `-beta`），否则 Sparkle 会将其视为相同版本。
- 默认使用当前架构（`$(uname -m)`）。如需发布通用版本（universal build），请设置 `BUILD_ARCHS="arm64 x86_64"`（或 `BUILD_ARCHS=all`）。
- 使用 `scripts/package-mac-dist.sh` 生成发布版本（zip + DMG + 证书验证）。使用 `scripts/package-mac-app.sh` 进行本地/开发版本的打包。
bash
# 从仓库根目录执行；设置发布 ID 以启用 Sparkle feed。
# APP_BUILD 必须为纯数字且单调递增，否则 Sparkle 会将其视为相同版本。
BUNDLE_ID=com.clawdbot.mac \
APP_VERSION=2026.1.25 \
APP_BUILD="$(git rev-list --count HEAD)" \
BUILD_CONFIG=release \
SIGN_IDENTITY="Developer ID Application: <Developer Name> (<TEAMID>)" \
scripts/package-mac-app.sh

# 生成用于分发的 zip 包（包含资源 fork 以支持 Sparkle 差分更新）
ditto -c -k --sequesterRsrc --keepParent dist/Clawdbot.app dist/Clawdbot-2026.1.25.zip

# 可选：为用户生成一个带样式的 DMG（便于拖拽至 /Applications）
scripts/create-dmg.sh dist/Clawdbot.app dist/Clawdbot-2026.1.25.dmg

# 推荐：生成并进行 notarize/staple 操作的 zip + DMG
# 首先，创建一次 keychain 配置文件：
#   xcrun notarytool store-credentials "clawdbot-notary" \
#     --apple-id "<apple-id>" --team-id "<team-id>" --password "<app-specific-password>"
NOTARIZE=1 NOTARYTOOL_PROFILE=clawdbot-notary \
BUNDLE_ID=com.clawdbot.mac \
APP_VERSION=2026.1.25 \
APP_BUILD="$(git rev-list --count HEAD)" \
BUILD_CONFIG=release \
SIGN_IDENTITY="Developer ID Application: <Developer Name> (<TEAMID>)" \
scripts/package-mac-dist.sh

# 可选：将 dSYM 与发布版本一起打包
ditto -c -k --keepParent apps/macos/.build/release/Clawdbot.app.dSYM dist/Clawdbot-2026.1.25.dSYM.zip
``````
## Appcast 条目
使用发布说明生成器，以便 Sparkle 渲染格式化的 HTML 说明：```bash
SPARKLE_PRIVATE_KEY_FILE=/path/to/ed25519-private-key scripts/make_appcast.sh dist/Clawdbot-2026.1.25.zip https://raw.githubusercontent.com/clawdbot/clawdbot/main/appcast.xml
```
从 `CHANGELOG.md` 生成 HTML 格式的发布说明（通过 [`scripts/changelog-to-html.sh`](https://github.com/clawdbot/clawdbot/blob/main/scripts/changelog-to-html.sh）），并将它们嵌入到 appcast 条目中。  
在发布时，将更新后的 `appcast.xml` 与发布资源（zip + dSYM）一起提交。

## 发布与验证
- 将 `Clawdbot-2026.1.25.zip`（以及 `Clawdbot-2026.1.25.dSYM.zip`）上传到标签 `v2026.1.25` 的 GitHub 发布页面。
- 确保原始 appcast 的 URL 与生成的 feed 匹配：`https://raw.githubusercontent.com/clawdbot/clawdbot/main/appcast.xml`。
- 健康检查：
  - `curl -I https://raw.githubusercontent.com/clawdbot/clawdbot/main/appcast.xml` 返回 200 状态码。
  - 在资源上传后，`curl -I <enclosure url>` 返回 200 状态码。
  - 在之前的公开构建版本中，从“关于”标签中运行“检查更新…”并验证 Sparkle 能够干净地安装新版本。

完成标准：已发布签名的应用程序 + appcast，从旧版本可以正常进行更新流程，并且发布资源已附加到 GitHub 发布页面。