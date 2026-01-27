# Clawdbot 架构设计文档

本文档详细描述了 Clawdbot 的系统架构、核心组件及其交互流程。

## 1. 核心架构图 (逻辑视图)

Clawdbot 采用分层解耦的架构，确保了消息渠道和 AI 逻辑的灵活性。

```mermaid
graph TD
    A[外部消息平台: WhatsApp/TG/Feishu] <--> B[Channels 渠道层]
    B <--> C[Gateway 网关核心]
    C <--> D[Agent 代理引擎]
    D <--> E[Providers 模型适配器]
    E <--> F[LLM API: Claude/OpenAI/Qwen/GLM]
    
    D --> G[Sandbox 运行沙箱]
    D --> H[Memory 记忆库]
    
    I[Control UI / App] <--> C
```

---

## 2. 核心组件详解

### 2.1 Gateway (网关层) - `src/gateway`
网关是整个系统的中枢（Main Hub），主要职责包括：
- **连接管理**: 维护与前端 UI 及原生 App 的 WebSocket 长连接。
- **协议转换**: 将各平台的私有消息格式统一转化为 Clawdbot 内部协议。
- **HTTP 接口**: 提供 OpenAI 兼容的 `/v1/chat/completions` 接口。

### 2.2 Agent Engine (代理引擎) - `src/agents`
负责复杂的任务编排，包括工具调用（Sandbox）和记忆检索（Memory）。它通过 `pi-agent-core` 驱动。

### 2.3 Channels (渠道插件) - `src/channels`
采用插件化设计。
- **核心渠道**: 已内置 WhatsApp、Telegram、Discord、Slack。
- **扩展性**: 支持通过 `extensions/` 目录动态增加如蓝泡 (BlueBubbles)、飞书等渠道。

### 2.4 Providers (模型提供商) - `src/providers` & `src/agents/models-config.providers.ts`
支持多厂商模型接入，已适配：
- **国际**: Anthropic, OpenAI, AWS Bedrock, GitHub Copilot.
- **国内**: 智谱 (GLM), 通义千问 (Qwen/DashScope), Moonshot (Kimi), Minimax.

---

## 3. 关键业务流程

1. **消息接收**: 渠道插件（如 WhatsApp）捕获原始事件并推送到 Gateway。
2. **鉴权路由**: Gateway 根据 Allowlist 决定是否触发 Agent。
3. **AI 推理**: Agent 结合上下文、技能（Skills）和记忆调用配置的模型。
4. **响应回传**: 模型结果通过 Gateway 发送回原渠道插件，输出给用户。
