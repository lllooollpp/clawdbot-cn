---
summary: "macOS Skills settings UI and gateway-backed status"
read_when:
  - Updating the macOS Skills settings UI
  - Changing skills gating or install behavior
---

# 技能（macOS）

macOS 应用通过网关暴露 Clawdbot 技能；它不会在本地解析技能。

## 数据源
- `skills.status`（网关）返回所有技能以及是否可用和缺少的依赖项
  （包括捆绑技能的允许列表限制）。
- 依赖项来源于每个 `SKILL.md` 中的 `metadata.clawdbot.requires`。

## 安装操作
- `metadata.clawdbot.install` 定义了安装选项（brew/node/go/uv）。
- 应用调用 `skills.install` 在网关主机上运行安装程序。
- 网关在提供多个安装程序时仅暴露一个首选安装程序
  （当 brew 可用时优先使用，否则使用 `skills.install` 中的 node 管理器，默认为 npm）。

## 环境/API 密钥
- 应用将密钥存储在 `~/.clawdbot/clawdbot.json` 中的 `skills.entries.<skillKey>` 下。
- `skills.update` 会更新 `enabled`、`apiKey` 和 `env`。

## 远程模式
- 安装和配置更新均在网关主机上进行（而不是本地的 Mac）。