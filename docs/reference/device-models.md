---
summary: "How Clawdbot vendors Apple device model identifiers for friendly names in the macOS app."
read_when:
  - Updating device model identifier mappings or NOTICE/license files
  - Changing how Instances UI displays device names
---

# 设备型号数据库（友好名称）

macOS 配套应用通过将 Apple 设备标识符（例如 `iPad16,6`、`Mac16,6`）映射到人类可读的名称，在 **Instances** 界面中显示友好的 Apple 设备型号名称。

该映射以 JSON 文件的形式被引入：

- `apps/macos/Sources/Clawdbot/Resources/DeviceModels/`

## 数据源

我们目前从 MIT 许可的仓库中引入该映射：

- `kyle-seongwoo-jun/apple-device-identifiers`

为了保持构建的确定性，JSON 文件被固定到特定的上游提交（提交信息记录在 `apps/macos/Sources/Clawdbot/Resources/DeviceModels/NOTICE.md` 中）。

## 更新数据库

1. 选择你希望固定的上游提交（分别为 iOS 和 macOS 各选一个）。
2. 更新 `apps/macos/Sources/Clawdbot/Resources/DeviceModels/NOTICE.md` 中的提交哈希值。
3. 重新下载固定到这些提交的 JSON 文件：
bash
IOS_COMMIT="<ios-device-identifiers.json 的提交哈希>"
MAC_COMMIT="<mac-device-identifiers.json 的提交哈希>"

curl -fsSL "https://raw.githubusercontent.com/kyle-seongwoo-jun/apple-device-identifiers/${IOS_COMMIT}/ios-device-identifiers.json" \
  -o apps/macos/Sources/Clawdbot/Resources/DeviceModels/ios-device-identifiers.json

curl -fsSL "https://raw.githubusercontent.com/kyle-seongwoo-jun/apple-device-identifiers/${MAC_COMMIT}/mac-device-identifiers.json" \
  -o apps/macos/Sources/Clawdbot/Resources/DeviceModels/mac-device-identifiers.json
``````
4. 确保 `apps/macos/Sources/Clawdbot/Resources/DeviceModels/LICENSE.apple-device-identifiers.txt` 与上游版本保持一致（如果上游许可证发生变化，请替换它）。
5. 验证 macOS 应用是否能干净地构建（无警告）：```bash
swift build --package-path apps/macos
```
