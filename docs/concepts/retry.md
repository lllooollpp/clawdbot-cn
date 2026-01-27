---
summary: "Retry policy for outbound provider calls"
read_when:
  - Updating provider retry behavior or defaults
  - Debugging provider send errors or rate limits
---

# 重试策略

## 目标
- 对每个 HTTP 请求进行重试，而不是整个多步骤流程。
- 通过仅重试当前步骤来保留顺序。
- 避免重复非幂等操作。

## 默认值
- 尝试次数：3
- 最大延迟上限：30000 毫秒
- 随机抖动：0.1（10%）

## 供应商默认值
- Telegram 最小延迟：400 毫秒
- Discord 最小延迟：500 毫秒

## 行为
### Discord
- 仅在遇到速率限制错误（HTTP 429）时重试。
- 当可用时使用 Discord 的 `retry_after`，否则使用指数退避。

### Telegram
- 在临时错误（429、超时、连接/重置/关闭、暂时不可用）时重试。
- 当可用时使用 `retry_after`，否则使用指数退避。
- Markdown 解析错误不会重试；会回退到纯文本。
json5
{
  channels: {
    telegram: {
      retry: {
        attempts: 3,
        minDelayMs: 400,
        maxDelayMs: 30000,
        jitter: 0.1
      }
    },
    discord: {
      retry: {
        attempts: 3,
        minDelayMs: 500,
        maxDelayMs: 30000,
        jitter: 0.1
      }
    }
  }
}
`````````
## 注意事项
- 重试适用于每个请求（消息发送、媒体上传、表情反应、投票、贴纸）。
- 复合流程不会重试已完成的步骤。