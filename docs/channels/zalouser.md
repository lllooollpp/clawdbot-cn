---
summary: "Zalo personal account support via zca-cli (QR login), capabilities, and configuration"
read_when:
  - Setting up Zalo Personal for Clawdbot
  - Debugging Zalo Personal login or message flow
---

# Zalo 个人账号（非官方）

状态：实验性。此集成通过 `zca-cli` 自动化 **个人 Zalo 账号**。

> **警告：** 这是一个非官方集成，可能会导致账号被暂停/封禁。请自行承担风险使用。

## 所需插件
Zalo 个人版作为插件提供，不包含在核心安装中。
- 通过 CLI 安装：`clawdbot plugins install @clawdbot/zalouser`
- 或从源代码仓库安装：`clawdbot plugins install ./extensions/zalouser`
- 详情：[插件](/plugin)

## 前提条件：zca-cli
网关机器必须在 `PATH` 中包含 `zca` 二进制文件。

- 验证：`zca --version`
- 如果缺失，请安装 zca-cli（参见 `extensions/zalouser/README.md` 或上游 zca-cli 文档）。

## 快速设置（初学者）
1) 安装插件（参见上述步骤）。
2) 登录（网关机器上的二维码）：
   - `clawdbot channels login --channel zalouser`
   - 使用 Zalo 手机应用扫描终端中的二维码。
3) 启用该频道：
json5
{
  channels: {
    zalouser: {
      enabled: true,
      dmPolicy: "pairing"
    }
  }
}
`````````
4) 重启网关（或完成注册流程）。
5) DM 默认为配对模式；在首次联系时批准配对代码。

## 它是什么
- 使用 `zca listen` 来接收传入消息。
- 使用 `zca msg ...` 来发送回复（文本/媒体/链接）。
- 专为“个人账户”使用场景设计，此时 Zalo Bot API 不可用。

## 命名
频道 ID 为 `zalouser`，以明确说明此功能自动化的是一个 **个人 Zalo 用户账户**（非官方）。我们保留 `zalo` 用于未来可能的官方 Zalo API 集成。```bash
clawdbot directory self --channel zalouser
clawdbot directory peers list --channel zalouser --query "name"
clawdbot directory groups list --channel zalouser --query "work"
```
## 限制
- 出站文本被拆分为约2000个字符（受Zalo客户端限制）。
- 默认情况下，流式传输被阻止。

## 访问控制（私信）
`channels.zalouser.dmPolicy` 支持：`pairing | allowlist | open | disabled`（默认值：`pairing`）。
`channels.zalouser.allowFrom` 接受用户ID或用户名。当可用时，向导会通过 `zca friend find` 将用户名解析为ID。

批准方式：
- `clawdbot pairing list zalouser`
- `clawdbot pairing approve zalouser <code>`

## 群组访问（可选）
- 默认：`channels.zalouser.groupPolicy = "open"`（允许群组）。当未设置时，可以使用 `channels.defaults.groupPolicy` 覆盖默认值。
- 限制为允许列表：
  - `channels.zalouser.groupPolicy = "allowlist"`
  - `channels.zalouser.groups`（键可以是群组ID或名称）
- 阻止所有群组：`channels.zalouser.groupPolicy = "disabled"`。
- 配置向导可以提示输入群组允许列表。
- 在启动时，Clawdbot 会将允许列表中的群组/用户名解析为ID，并记录映射关系；无法解析的条目将保留为原始输入。
json5
{
  channels: {
    zalouser: {
      groupPolicy: "allowlist",
      groups: {
        "123456789": { allow: true },
        "Work Chat": { allow: true }
      }
    }
  }
}
`````````
## 多账户
账户对应于 zca 配置文件。示例：```json5
{
  channels: {
    zalouser: {
      enabled: true,
      defaultAccount: "default",
      accounts: {
        work: { enabled: true, profile: "work" }
      }
    }
  }
}
```
## 故障排除

**`zca` 未找到：**
- 安装 `zca-cli` 并确保它在 `PATH` 环境变量中，以便网关进程可以访问。

**登录信息不保存：**
- 运行 `clawdbot channels status --probe`
- 重新登录：`clawdbot channels logout --channel zalouser && clawdbot channels login --channel zalouser`