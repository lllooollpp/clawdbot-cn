---
summary: "Run Clawdbot with Ollama (local LLM runtime)"
read_when:
  - You want to run Clawdbot with local models via Ollama
  - You need Ollama setup and configuration guidance
---

# Ollama

Ollama 是一个本地 LLM 运行时，它使得在你的机器上运行开源模型变得非常容易。Clawdbot 集成了 Ollama 的 OpenAI 兼容 API，并且当你使用 `OLLAMA_API_KEY`（或身份验证配置文件）进行授权时，**可以自动发现具备工具能力的模型**，而无需显式定义 `models.providers.ollama` 条目。

## 快速开始

1) 安装 Ollama：https://ollama.ai

2) 拉取一个模型：
bash
ollama pull llama3.3
# 或者
ollama pull qwen2.5-coder:32b
# 或者
ollama pull deepseek-r1:32b
``````
3) 为 Clawdbot 启用 Ollama（任何值均可；Ollama 不需要真实的密钥）：```bash
# Set environment variable
export OLLAMA_API_KEY="ollama-local"

# Or configure in your config file
clawdbot config set models.providers.ollama.apiKey "ollama-local"
```
{
  agents: {
    defaults: {
      model: { primary: "ollama/llama3.3" }
    }
  }
}```
## 模型发现（隐式提供者）

当你设置 `OLLAMA_API_KEY`（或认证配置文件）并且**不**定义 `models.providers.ollama` 时，Clawdbot 会从本地的 Ollama 实例 `http://127.0.0.1:11434` 中自动发现模型：

- 查询 `/api/tags` 和 `/api/show`
- 仅保留报告具有 `tools` 能力的模型
- 当模型报告 `thinking` 时，标记为 `reasoning`
- 当可用时，从 `model_info["<arch>.context_length"]` 中读取 `contextWindow`
- 将 `maxTokens` 设置为上下文窗口的 10 倍
- 将所有成本设置为 `0`

这样可以在不手动添加模型的情况下，保持目录与 Ollama 的功能一致。

要查看可用的模型：```bash
ollama list
clawdbot models list
```
### UI 发现

在 Clawdbot 的 UI 中，您可以通过点击 **“获取模型列表” (Fetch Models)** 按钮，在 **Models -> Providers -> ollama** 部分自动获取当前本地的 Ollama 模型列表。

要添加一个新模型，只需使用 Ollama 拉取它：
bash
ollama pull mistral
``````
新模型将被自动发现并可供使用。

如果您显式设置了 `models.providers.ollama`，则会跳过自动发现功能，您必须手动定义模型（见下文）。

## 配置

### 基本设置（隐式发现）

启用 Ollama 最简单的方式是通过环境变量：```bash
export OLLAMA_API_KEY="ollama-local"
```
### 显式设置（手动模型）

在以下情况下使用显式配置：
- Ollama 运行在其他主机/端口上。
- 您希望强制指定特定的上下文窗口或模型列表。
- 您希望包含不报告工具支持的模型。
json5
{
  models: {
    providers: {
      ollama: {
        // 使用包含 /v1 的主机以支持 OpenAI 兼容 API
        baseUrl: "http://ollama-host:11434/v1",
        apiKey: "ollama-local",
        api: "openai-completions",
        models: [
          {
            id: "llama3.3",
            name: "Llama 3.3",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 8192,
            maxTokens: 8192 * 10
          }
        ]
      }
    }
  }
}
``````
如果设置了 `OLLAMA_API_KEY`，可以在 provider 条目中省略 `apiKey`，Clawdbot 会自动填充以进行可用性检查。

### 自定义基础 URL（显式配置）

如果 Ollama 运行在不同的主机或端口上（显式配置会禁用自动发现，因此需要手动定义模型）：```json5
{
  models: {
    providers: {
      ollama: {
        apiKey: "ollama-local",
        baseUrl: "http://ollama-host:11434/v1"
      }
    }
  }
}
```
### 模型选择

配置完成后，您所有的 Ollama 模型都可以使用：
json5
{
  agents: {
    defaults: {
      model: {
        primary: "ollama/llama3.3",
        fallback: ["ollama/qwen2.5-coder:32b"]
      }
    }
  }
}
``````
## 高级

### 推理模型

当 Ollama 在 `/api/show` 中报告 `thinking` 时，Clawdbot 会将这些模型标记为具有推理能力：```bash
ollama pull deepseek-r1:32b
```
### 模型成本

Ollama 是免费的，并且在本地运行，因此所有模型成本均设置为 $0。

### 上下文窗口

对于自动发现的模型，Clawdbot 会使用 Ollama 报告的上下文窗口大小，如果不可用，则默认为 `8192`。您可以在显式提供者配置中覆盖 `contextWindow` 和 `maxTokens`。
bash
ollama serve
``````
并且API是可访问的：```bash
curl http://localhost:11434/api/tags
```
### 没有可用的模型

Clawdbot 仅会自动发现报告支持工具的模型。如果您的模型未列在其中，请执行以下操作之一：
- 拉取一个支持工具的模型，或者
- 在 `models.providers.ollama` 中显式定义该模型。

添加模型的方法如下：
bash
ollama list  # 查看已安装的模型
ollama pull llama3.3  # 拉取一个模型
``````
### 连接被拒绝

请确认 Ollama 是否在正确的端口上运行：```bash
# Check if Ollama is running
ps aux | grep ollama

# Or restart Ollama
ollama serve
```
## 参见

- [模型提供者](/concepts/model-providers) - 所有提供者的概览
- [模型选择](/concepts/models) - 如何选择模型
- [配置](/gateway/configuration) - 完整的配置参考