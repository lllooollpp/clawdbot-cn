---
summary: "Telegram allowlist hardening: prefix + whitespace normalization"
read_when:
  - Reviewing historical Telegram allowlist changes
---

# 强化 Telegram 白名单

**日期**: 2026-01-05  
**状态**: 完成  
**PR**: #216

## 概述

Telegram 白名单现在接受 `telegram:` 和 `tg:` 前缀，且对大小写不敏感，并能容忍意外的空格。这使入站白名单检查与出站发送的标准化保持一致。

## 变更内容

- `telegram:` 和 `tg:` 前缀被视为相同（不区分大小写）。
- 白名单条目会被修剪；空条目将被忽略。

## 示例

以下所有形式都会被接受为相同的 ID：

- `telegram:123456`
- `TG:123456`
- ` tg:123456 `

## 为什么重要

从日志或聊天 ID 中复制粘贴时，通常会包含前缀和空格。标准化处理可以避免在决定是否回复私信或群组时出现误判。