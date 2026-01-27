---
summary: "How Clawdbot rotates auth profiles and falls back across models"
read_when:
  - Diagnosing auth profile rotation, cooldowns, or model fallback behavior
  - Updating failover rules for auth profiles or models
---

# 模型故障转移

Clawdbot 在两个阶段处理故障：
1) **在当前提供者内部进行认证配置轮换**。
2) **模型回退** 到 `agents.defaults.model.fallbacks` 中的下一个模型。

本文档解释了运行时规则以及支持这些规则的数据。

## 认证存储（密钥 + OAuth）

Clawdbot 使用 **认证配置文件** 来存储 API 密钥和 OAuth 令牌。

- 密钥存储在 `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`（旧版：`~/.clawdbot/agent/auth-profiles.json`）。
- 配置 `auth.profiles` / `auth.order` 仅是 **元数据 + 路由信息**（不包含密钥）。
- 旧版仅导入的 OAuth 文件：`~/.clawdbot/credentials/oauth.json`（在首次使用时会被导入到 `auth-profiles.json` 中）。

更多细节：[/concepts/oauth](/concepts/oauth)

凭证类型：
- `type: "api_key"` → `{ provider, key }`
- `type: "oauth"` → `{ provider, access, refresh, expires, email? }`（某些提供者还包括 `projectId`/`enterpriseUrl`）

## 配置文件 ID

OAuth 登录会创建不同的配置文件，以便多个账户可以共存。
- 默认：当没有邮件时，使用 `provider:default`。
- 带邮件的 OAuth：使用 `provider:<email>`（例如 `google-antigravity:user@gmail.com`）。

配置文件存储在 `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json` 的 `profiles` 下。

## 轮换顺序

当提供者有多个配置文件时，Clawdbot 会按照以下顺序选择：

1) **显式配置**：`auth.order[provider]`（如果已设置）。
2) **配置的配置文件**：根据提供者过滤 `auth.profiles`。
3) **存储的配置文件**：提供者在 `auth-profiles.json` 中的条目。

如果没有显式配置顺序，Clawdbot 会使用 **轮询（round-robin）顺序**：
- **主要键**：配置文件类型（**OAuth 优先于 API 密钥**）。
- **次要键**：`usageStats.lastUsed`（按最久未使用排序，同一类型内）。
- **冷却中/禁用的配置文件** 会被移到最后，按最早到期时间排序。

### 会话粘性（缓存友好）

Clawdbot **为每个会话固定选择的认证配置文件**，以保持提供者的缓存活跃。
它 **不会在每次请求时轮换**。固定配置文件会一直被使用，直到：
- 会话重置（`/new` / `/reset`）
- 完成一次压缩（compaction 次数增加）
- 配置文件处于冷却/禁用状态

通过 `/model …@<profileId>` 手动选择会设置一个 **用户覆盖**，该覆盖仅在当前会话中生效，直到新会话开始前不会自动轮换。

自动固定的配置文件（由会话路由器选择）被视为一种 **偏好**：
它们会被优先尝试，但如果遇到速率限制/超时，Clawdbot 仍可能轮换到其他配置文件。
用户固定的配置文件会锁定在该配置文件上；如果它失败且配置了模型回退，Clawdbot 会切换到下一个模型，而不是更换配置文件。

## 冷却时间

当由于认证/速率限制错误（或看起来像速率限制的超时）导致配置文件失败时，Clawdbot 会将其标记为冷却状态，并切换到下一个配置文件。格式/无效请求错误（例如 Cloud Code Assist 工具调用 ID 验证失败）也被视为可切换的错误，并使用相同的冷却时间。

冷却时间使用指数退避算法：
- 1 分钟
- 5 分钟
- 25 分钟
- 1 小时（上限）

状态存储在 `auth-profiles.json` 文件的 `usageStats` 字段下：
json
{
  "usageStats": {
    "provider:profile": {
      "lastUsed": 1736160000000,
      "cooldownUntil": 1736160600000,
      "errorCount": 2
    }
  }
}
`````````
## 计费禁用

计费/信用失败（例如“信用不足” / “信用余额过低”）被视为可进行故障转移的情况，但它们通常不是暂时性的。Clawdbot 不会进行短暂的冷却，而是将该配置文件标记为 **禁用**（采用更长的退避时间），并切换到下一个配置文件/提供者。

状态存储在 `auth-profiles.json` 中：```json
{
  "usageStats": {
    "provider:profile": {
      "disabledUntil": 1736178000000,
      "disabledReason": "billing"
    }
  }
}
```
默认值：
- 计费退避初始时间为 **5 小时**，每次计费失败后翻倍，最大限制为 **24 小时**。
- 如果某个配置文件在 **24 小时** 内没有失败，则退避计数器会重置（可配置）。

## 模型回退

如果某个提供者的所有配置文件都失败了，Clawdbot 会切换到 `agents.defaults.model.fallbacks` 中的下一个模型。这适用于认证失败、速率限制和因配置文件轮换耗尽导致的超时（其他错误不会触发回退）。

当运行时使用了模型覆盖（通过钩子或 CLI），在尝试完所有配置的回退模型后，回退仍会终止于 `agents.defaults.model.primary`。

## 相关配置

请参阅 [网关配置](/gateway/configuration) 了解：
- `auth.profiles` / `auth.order`
- `auth.cooldowns.billingBackoffHours` / `auth.cooldowns.billingBackoffHoursByProvider`
- `auth.cooldowns.billingMaxHours` / `auth.cooldowns.failureWindowHours`
- `agents.defaults.model.primary` / `agents.defaults.model.fallbacks`
- `agents.defaults.imageModel` 路由设置

有关更广泛的模型选择和回退概述，请参阅 [模型](/concepts/models)。