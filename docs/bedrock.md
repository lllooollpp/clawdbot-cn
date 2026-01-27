---
summary: "Use Amazon Bedrock (Converse API) models with Clawdbot"
read_when:
  - You want to use Amazon Bedrock models with Clawdbot
  - You need AWS credential/region setup for model calls
---

# Amazon Bedrock

Clawdbot 可以通过 pi‑ai 的 **Bedrock Converse** 流式传输服务提供商使用 **Amazon Bedrock** 模型。Bedrock 的身份验证使用 **AWS SDK 默认凭证链**，而不是 API 密钥。

## pi‑ai 支持的功能

- 服务提供商：`amazon-bedrock`
- API：`bedrock-converse-stream`
- 身份验证：AWS 凭据（环境变量、共享配置或实例角色）
- 区域：`AWS_REGION` 或 `AWS_DEFAULT_REGION`（默认：`us-east-1`）

## 自动模型发现

如果检测到 AWS 凭据，Clawdbot 可以自动发现支持 **流式传输** 和 **文本输出** 的 Bedrock 模型。发现过程使用 `bedrock:ListFoundationModels` 接口，并且结果会被缓存（默认：1 小时）。

配置选项位于 `models.bedrockDiscovery` 下：```json5
{
  models: {
    bedrockDiscovery: {
      enabled: true,
      region: "us-east-1",
      providerFilter: ["anthropic", "amazon"],
      refreshInterval: 3600,
      defaultContextWindow: 32000,
      defaultMaxTokens: 4096
    }
  }
}
```
说明：
- 当存在 AWS 凭据时，`enabled` 默认为 `true`。
- `region` 默认为 `AWS_REGION` 或 `AWS_DEFAULT_REGION`，然后是 `us-east-1`。
- `providerFilter` 匹配 Bedrock 提供商名称（例如 `anthropic`）。
- `refreshInterval` 是秒数；设置为 `0` 以禁用缓存。
- `defaultContextWindow`（默认：`32000`）和 `defaultMaxTokens`（默认：`4096`）用于发现的模型（如果你知道模型的限制，可以进行覆盖）。

## 设置（手动）

1）确保 AWS 凭据在 **网关主机** 上可用：```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
# Optional:
export AWS_SESSION_TOKEN="..."
export AWS_PROFILE="your-profile"
# Optional (Bedrock API key/bearer token):
export AWS_BEARER_TOKEN_BEDROCK="..."
```
2) 在您的配置中添加一个 Bedrock 提供商和模型（无需 `apiKey`）：```json5
{
  models: {
    providers: {
      "amazon-bedrock": {
        baseUrl: "https://bedrock-runtime.us-east-1.amazonaws.com",
        api: "bedrock-converse-stream",
        auth: "aws-sdk",
        models: [
          {
            id: "anthropic.claude-opus-4-5-20251101-v1:0",
            name: "Claude Opus 4.5 (Bedrock)",
            reasoning: true,
            input: ["text", "image"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 200000,
            maxTokens: 8192
          }
        ]
      }
    }
  },
  agents: {
    defaults: {
      model: { primary: "amazon-bedrock/anthropic.claude-opus-4-5-20251101-v1:0" }
    }
  }
}
```
## EC2 实例角色

当在附加了 IAM 角色的 EC2 实例上运行 Clawdbot 时，AWS SDK 会自动使用实例元数据服务（IMDS）进行身份验证。
然而，目前 Clawdbot 的凭证检测功能仅检查环境变量，而不检查 IMDS 凭证。

**解决方法：** 设置 `AWS_PROFILE=default` 以表明 AWS 凭证可用。
实际的身份验证仍然通过 IMDS 使用实例角色进行。```bash
# Add to ~/.bashrc or your shell profile
export AWS_PROFILE=default
export AWS_REGION=us-east-1
```
**EC2 实例角色所需的 IAM 权限**:
- `bedrock:InvokeModel`
- `bedrock:InvokeModelWithResponseStream`
- `bedrock:ListFoundationModels`（用于自动发现）

或者附加托管策略 `AmazonBedrockFullAccess`。

**快速设置:**```bash
# 1. Create IAM role and instance profile
aws iam create-role --role-name EC2-Bedrock-Access \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy --role-name EC2-Bedrock-Access \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

aws iam create-instance-profile --instance-profile-name EC2-Bedrock-Access
aws iam add-role-to-instance-profile \
  --instance-profile-name EC2-Bedrock-Access \
  --role-name EC2-Bedrock-Access

# 2. Attach to your EC2 instance
aws ec2 associate-iam-instance-profile \
  --instance-id i-xxxxx \
  --iam-instance-profile Name=EC2-Bedrock-Access

# 3. On the EC2 instance, enable discovery
clawdbot config set models.bedrockDiscovery.enabled true
clawdbot config set models.bedrockDiscovery.region us-east-1

# 4. Set the workaround env vars
echo 'export AWS_PROFILE=default' >> ~/.bashrc
echo 'export AWS_REGION=us-east-1' >> ~/.bashrc
source ~/.bashrc

# 5. Verify models are discovered
clawdbot models list
```
## 注意事项

- Bedrock 需要在您的 AWS 账户/区域中**启用模型访问权限**。
- 自动发现需要 `bedrock:ListFoundationModels` 权限。
- 如果您使用了配置文件，请在网关主机上设置 `AWS_PROFILE`。
- Clawdbot 按以下顺序暴露凭证来源：`AWS_BEARER_TOKEN_BEDROCK`，然后是 `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`，接着是 `AWS_PROFILE`，最后是默认的 AWS SDK 链。
- 推理支持取决于所使用的模型；请查看 Bedrock 的模型卡片以了解当前的功能支持。
- 如果您更倾向于使用托管密钥流程，也可以在 Bedrock 前面放置一个兼容 OpenAI 的代理，并将其配置为 OpenAI 提供商。