---
name: mijia-control
description: "Control and monitor Xiaomi Mijia smart home devices. Use this skill when the user wants to: 1) Switch device status (on/off, brightness, etc.) 2) List available home devices 3) Run automation scenes 4) Check environmental statistics."
---

# Mijia Control Skill (Universal AI Agent Skill)

该技能使 AI 代理能够通过本地封装的 `mijiaAPI` 驱动，接管并控制小米米家智能家居设备。

> **注意**：本技能包内的所有脚本路径均为相对于本文件所在目录。执行时请务必使用**绝对路径**。

## 快速开始

1. **环境自检**：运行 `<SKILL_ROOT>/scripts/setup_env.py`。
2. **安装/登录**：
   - 安装：`python <SKILL_ROOT>/scripts/setup_env.py --install`。
   - 登录：运行 `mijiaAPI -l`。
3. **执行控制**：所有操作均通过 `<SKILL_ROOT>/scripts/` 下的脚本完成。

## 决策逻辑 (Decision Logic)

- **设备查询**：当用户询问“有哪些设备”、“状态如何”时 -> 执行 `scripts/list_devices.py` 获取实时快照。
- **设备控制**：当用户要求开关、调节亮度/温度等 -> 解析意图 -> 查阅 `reference/device_catalogs.md` -> 执行 `scripts/control_device.py`。
- **场景触发**：用户要求运行场景 -> 调用 CLI 命令执行。

## 约束建议 (Guardrails)

- 对于**窗帘、空调、锁**等涉及安全和昂贵能耗的设备，操作前需口头确认。
- 绝不向用户泄露 `auth.json` 中的敏感 Token。

## 更多信息
- 详尽 SOP 请参阅 [instructions.md](./instructions.md)。
