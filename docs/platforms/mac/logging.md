---
summary: "Clawdbot logging: rolling diagnostics file log + unified log privacy flags"
read_when:
  - Capturing macOS logs or investigating private data logging
  - Debugging voice wake/session lifecycle issues
---

# 日志（macOS）

## 滚动诊断文件日志（调试面板）
Clawdbot 通过 swift-log（默认使用统一日志）将 macOS 应用日志进行路由，并在需要持久化记录时将本地的、滚动的日志写入磁盘。

- 详细程度：**调试面板 → 日志 → 应用日志 → 详细程度**
- 启用：**调试面板 → 日志 → 应用日志 → “写入滚动诊断日志（JSONL）”**
- 位置：`~/Library/Logs/Clawdbot/diagnostics.jsonl`（会自动轮换；旧文件会加上 `.1`, `.2`, … 的后缀）
- 清除：**调试面板 → 日志 → 应用日志 → “清除”**

注意事项：
- 此功能默认是**关闭的**。仅在调试时启用。
- 该文件包含敏感信息；在未经审查前请勿分享。

## macOS 上的统一日志隐私数据

统一日志默认会隐藏大部分日志内容，除非某个子系统选择了 `privacy -off`。根据 Peter 在 macOS 上的[日志隐私操作](https://steipete.me/posts/2025/logging-privacy-shenanigans)（2025 年）一文所述，这通过 `/Library/Preferences/Logging/Subsystems/` 目录下的一个 plist 文件控制，该文件以子系统名称为键。只有新生成的日志条目会识别该标志，因此请在重现问题之前启用它。

## 为 Clawdbot（com.clawdbot）启用隐私关闭模式
- 首先将 plist 文件写入临时文件，然后以 root 权限原子化安装：
bash
sudo defaults write /Library/Preferences/Logging/Subsystems/com.clawdbot privacy -string "off"``````bash
cat <<'EOF' >/tmp/com.clawdbot.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>DEFAULT-OPTIONS</key>
    <dict>
        <key>Enable-Private-Data</key>
        <true/>
    </dict>
</dict>
</plist>
EOF
sudo install -m 644 -o root -g wheel /tmp/com.clawdbot.plist /Library/Preferences/Logging/Subsystems/com.clawdbot.plist
```
- 不需要重启；logd 会快速注意到该文件，但只有新的日志行才会包含私有负载。
- 使用现有的辅助工具查看更丰富的输出，例如 `./scripts/clawlog.sh --category WebChat --last 5m`。

## 调试后禁用
- 移除覆盖配置：`sudo rm /Library/Preferences/Logging/Subsystems/com.clawdbot.plist`。
- 可选地运行 `sudo log config --reload` 以强制 logd 立即丢弃覆盖配置。
- 请注意此功能可能会包含电话号码和消息正文；仅在你需要额外详细信息时保留该 plist 文件。