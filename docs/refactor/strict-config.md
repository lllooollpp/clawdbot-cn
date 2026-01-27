---
summary: "Strict config validation + doctor-only migrations"
read_when:
  - Designing or implementing config validation behavior
  - Working on config migrations or doctor workflows
  - Handling plugin config schemas or plugin load gating
---

# 严格配置验证（仅限医生迁移）

## 目标
- **拒绝所有未知的配置键**（根级 + 嵌套级）。
- **拒绝没有模式的插件配置**；不加载该插件。
- **移除加载时的遗留自动迁移**；迁移仅通过医生执行。
- **在启动时自动运行医生（dry-run）**；如果配置无效，则阻止非诊断命令。

## 非目标
- 加载时的向后兼容性（遗留键不会自动迁移）。
- 静默丢弃未识别的键。

## 严格验证规则
- 配置必须在每一层都与模式完全匹配。
- 未知的键是验证错误（根级或嵌套级都不允许透传）。
- `plugins.entries.<id>.config` 必须通过插件的模式进行验证。
  - 如果插件没有模式，**拒绝插件加载**并显示清晰的错误。
- 未知的 `channels.<id>` 键是错误，除非插件的清单声明了该频道 ID。
- 所有插件都需要插件清单文件（`clawdbot.plugin.json`）。

## 插件模式强制执行
- 每个插件提供一个严格的 JSON Schema 来定义其配置（在清单中内联）。
- 插件加载流程：
  1) 解析插件清单 + 模式（`clawdbot.plugin.json`）。
  2) 根据模式验证配置。
  3) 如果缺少模式或配置无效：阻止插件加载，记录错误。
- 错误信息包括：
  - 插件 ID
  - 原因（缺少模式 / 配置无效）
  - 验证失败的路径
- 禁用的插件保留其配置，但医生 + 日志会显示警告。

## 医生流程
- 医生会在**每次配置加载时运行**（默认为 dry-run）。
- 如果配置无效：
  - 打印摘要 + 可操作的错误信息。
  - 指导操作：`clawdbot doctor --fix`。
- `clawdbot doctor --fix`：
  - 应用迁移。
  - 删除未知键。
  - 写入更新后的配置。

## 命令限制（当配置无效时）
允许（仅诊断命令）：
- `clawdbot doctor`
- `clawdbot logs`
- `clawdbot health`
- `clawdbot help`
- `clawdbot status`
- `clawdbot gateway status`

其他所有命令必须硬性失败，并提示：“配置无效。请运行 `clawdbot doctor --fix`。”

## 错误用户体验格式
- 单一摘要标题。
- 分组部分：
  - 未知键（完整路径）
  - 遗留键 / 需要迁移
  - 插件加载失败（插件 ID + 原因 + 路径）

## 实现接触点
- `src/config/zod-schema.ts`: 移除根级透传；所有层级使用严格对象。
- `src/config/zod-schema.providers.ts`: 确保频道模式严格。
- `src/config/validation.ts`: 遇到未知键时失败；不应用遗留迁移。
- `src/config/io.ts`: 移除遗留自动迁移；始终运行医生 dry-run。
- `src/config/legacy*.ts`: 将使用场景移至医生中。
- `src/plugins/*`: 添加模式注册表 + 加载限制。
- CLI 命令限制在 `src/cli` 中实现。

## 测试
- 未知键的拒绝（根级 + 嵌套级）。
- 插件缺少模式 → 插件加载被阻止并显示清晰错误。
- 配置无效 → 除诊断命令外，网关启动被阻止。
- 医生 dry-run 自动运行；`doctor --fix` 会写入修正后的配置。