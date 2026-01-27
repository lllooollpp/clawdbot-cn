---
summary: "SOUL Evil hook (swap SOUL.md with SOUL_EVIL.md)"
read_when:
  - You want to enable or tune the SOUL Evil hook
  - You want a purge window or random-chance persona swap
---

# SOUL Evil Hook

SOUL Evil Hook 在清理窗口期间或随机概率下，将 **注入的** `SOUL.md` 内容替换为 `SOUL_EVIL.md`。它 **不会** 修改磁盘上的文件。

## 工作原理

当 `agent:bootstrap` 运行时，该 Hook 可以在系统提示组装之前，将内存中的 `SOUL.md` 内容替换掉。如果 `SOUL_EVIL.md` 不存在或为空，Clawdbot 会记录一条警告信息，并保留正常的 `SOUL.md`。

子代理运行时 **不会** 包含 `SOUL.md` 在其启动文件中，因此此 Hook 对子代理没有影响。

## 启用
bash
clawdbot hooks enable soul-evil
``````
然后设置配置：```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "soul-evil": {
          "enabled": true,
          "file": "SOUL_EVIL.md",
          "chance": 0.1,
          "purge": { "at": "21:00", "duration": "15m" }
        }
      }
    }
  }
}
```
在代理工作区根目录创建 `SOUL_EVIL.md`（位于 `SOUL.md` 旁边）。

## 选项

- `file` (字符串): 替代的 SOUL 文件名（默认值：`SOUL_EVIL.md`）
- `chance` (数字 0–1): 每次运行时使用 `SOUL_EVIL.md` 的随机概率
- `purge.at` (HH:mm): 每日清理开始时间（24小时制）
- `purge.duration` (持续时间): 清理窗口长度（例如 `30s`、`10m`、`1h`）

**优先级:** 清理窗口的设置优先于概率设置。

**时区:** 如果设置了 `agents.defaults.userTimezone`，则使用该时区；否则使用主机时区。

## 注意事项

- 不会将任何文件写入或修改到磁盘。
- 如果 `SOUL.md` 不在启动列表中，该钩子将不执行任何操作。

## 参见

- [钩子](/hooks)