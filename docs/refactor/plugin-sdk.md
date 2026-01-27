---
summary: "Plan: one clean plugin SDK + runtime for all messaging connectors"
read_when:
  - Defining or refactoring the plugin architecture
  - Migrating channel connectors to the plugin SDK/runtime
---

# 插件 SDK + 运行时重构计划

目标：每个消息连接器都作为插件（捆绑或外部）使用一个稳定的应用程序接口（API）。
没有插件直接从 `src/**` 导入。所有依赖都通过 SDK 或运行时处理。

## 为什么现在进行

- 当前的连接器混用了多种模式：直接导入核心代码、仅 dist 的桥梁以及自定义辅助函数。
- 这使得升级变得脆弱，并阻碍了干净的外部插件接口。

## 目标架构（两层结构）

### 1) 插件 SDK（编译时，稳定，可发布）

范围：类型、辅助函数和配置工具。没有运行时状态，没有副作用。

内容（示例）：
- 类型：`ChannelPlugin`，适配器，`ChannelMeta`，`ChannelCapabilities`，`ChannelDirectoryEntry`。
- 配置辅助函数：`buildChannelConfigSchema`，`setAccountEnabledInConfigSection`，`deleteAccountFromConfigSection`，
  `applyAccountNameToChannelSection`。
- 配对辅助函数：`PAIRING_APPROVED_MESSAGE`，`formatPairingApproveHint`。
- 上线辅助函数：`promptChannelAccessConfig`，`addWildcardAllowFrom`，上线类型。
- 工具参数辅助函数：`createActionGate`，`readStringParam`，`readNumberParam`，`readReactionParams`，`jsonResult`。
- 文档链接辅助函数：`formatDocsLink`。

交付方式：
- 作为 `@clawdbot/plugin-sdk` 发布（或从核心导出到 `clawdbot/plugin-sdk`）。
- 使用语义化版本控制，并提供明确的稳定性保证。

### 2) 插件运行时（执行表面，被注入）

范围：所有涉及核心运行时行为的内容。
通过 `ClawdbotPluginApi.runtime` 访问，因此插件永远不会直接导入 `src/**`。

提议的接口（最小但完整）：
ts
export type PluginRuntime = {
  channel: {
    text: {
      chunkMarkdownText(text: string, limit: number): string[];
      resolveTextChunkLimit(cfg: ClawdbotConfig, channel: string, accountId?: string): number;
      hasControlCommand(text: string, cfg: ClawdbotConfig): boolean;
    };
    reply: {
      dispatchReplyWithBufferedBlockDispatcher(params: {
        ctx: unknown;
        cfg: unknown;
        dispatcherOptions: {
          deliver: (payload: { text?: string; mediaUrls?: string[]; mediaUrl?: string }) =>
            void | Promise<void>;
          onError?: (err: unknown, info: { kind: string }) => void;
        };
      }): Promise<void>;
      createReplyDispatcherWithTyping?: unknown; // 用于 Teams 风格流程的适配器
    };
    routing: {
      resolveAgentRoute(params: {
        cfg: unknown;
        channel: string;
        accountId: string;
        peer: { kind: "dm" | "group" | "channel"; id: string };
      }): { sessionKey: string; accountId: string };
    };
    pairing: {
      buildPairingReply(params: { channel: string; idLine: string; code: string }): string;
      readAllowFromStore(channel: string): Promise<string[]>;
      upsertPairingRequest(params: {
        channel: string;
        id: string;
        meta?: { name?: string };
      }): Promise<{ code: string; created: boolean }>;
    };
    media: {
      fetchRemoteMedia(params: { url: string }): Promise<{ buffer: Buffer; contentType?: string }>;
      saveMediaBuffer(
        buffer: Uint8Array,
        contentType: string | undefined,
        direction: "inbound" | "outbound",
        maxBytes: number,
      ): Promise<{ path: string; contentType?: string }>;
    };
    mentions: {
      buildMentionRegexes(cfg: ClawdbotConfig, agentId?: string): RegExp[];
      matchesMentionPatterns(text: string, regexes: RegExp[]): boolean;
    };
    groups: {
      resolveGroupPolicy(cfg: ClawdbotConfig, channel: string, accountId: string, groupId: string): {
        allowlistEnabled: boolean;
        allowed: boolean;
        groupConfig?: unknown;
        defaultConfig?: unknown;
      };
      resolveRequireMention(
        cfg: ClawdbotConfig,
        channel: string,
        accountId: string,
        groupId: string,
        override?: boolean,
      ): boolean;
    };
    debounce: {
      createInboundDebouncer<T>(opts: {
        debounceMs: number;
        buildKey: (v: T) => string | null;
        shouldDebounce: (v: T) => boolean;
        onFlush: (entries: T[]) => Promise<void>;
        onError?: (err: unknown) => void;
      }): { push: (v: T) => void; flush: () => Promise<void> };
      resolveInboundDebounceMs(cfg: ClawdbotConfig, channel: string): number;
    };
    commands: {
      resolveCommandAuthorizedFromAuthorizers(params: {
        useAccessGroups: boolean;
        authorizers: Array<{ configured: boolean; allowed: boolean }>;
      }): boolean;
    };
  };
  logging: {
    shouldLogVerbose(): boolean;
    getChildLogger(name: string): PluginLogger;
  };
  state: {
    resolveStateDir(cfg: ClawdbotConfig): string;
  };
};
``````
注意事项：
- 运行时（Runtime）是唯一可以访问核心行为的方式。
- SDK 被有意设计得小巧且稳定。
- 每个运行时方法都映射到现有的核心实现（没有重复代码）。

## 迁移计划（分阶段、安全）

### 阶段 0：基础结构搭建
- 引入 `@clawdbot/plugin-sdk`。
- 在 `ClawdbotPluginApi` 中添加 `api.runtime`，并保持上述接口。
- 在过渡期内保留现有导入（发出弃用警告）。

### 阶段 1：桥梁清理（低风险）
- 用 `api.runtime` 替换每个扩展的 `core-bridge.ts`。
- 首先迁移 BlueBubbles、Zalo、Zalo Personal（已接近完成）。
- 删除重复的桥梁代码。

### 阶段 2：轻量级直接导入插件
- 将 Matrix 迁移到 SDK + 运行时。
- 验证注册流程、目录、群组提及逻辑。

### 阶段 3：重量级直接导入插件
- 将 MS Teams 迁移（目前拥有最多的运行时帮助函数）。
- 确保回复/输入状态语义与当前行为一致。

### 阶段 4：iMessage 插件化
- 将 iMessage 移动到 `extensions/imessage`。
- 用 `api.runtime` 替换直接的核心调用。
- 保留配置键、CLI 行为和文档不变。

### 阶段 5：强制执行
- 添加 lint 规则 / CI 检查：不允许从 `src/**` 中导入 `extensions/**`。
- 添加插件 SDK/版本兼容性检查（运行时 + SDK 的语义化版本）。

## 兼容性与版本控制
- SDK：遵循语义化版本控制（semver），并发布和记录变更。
- 运行时：与核心版本一一对应。添加 `api.runtime.version`。
- 插件声明所需的运行时版本范围（例如：`clawdbotRuntime: ">=2026.2.0"`）。

## 测试策略
- 适配器级别的单元测试（使用真实的核心实现来测试运行时函数）。
- 每个插件的黄金测试（确保行为无偏差，包括路由、配对、允许列表、提及限制）。
- 在 CI 中使用一个单一的端到端插件示例（安装 + 运行 + 基本测试）。

## 待解决的问题
- SDK 类型应托管在哪里：单独的包还是核心导出？
- 运行时类型应如何分发：在 SDK（仅类型）中还是在核心中？
- 如何为捆绑插件和外部插件暴露文档链接？
- 在过渡期间是否允许仓库内的插件进行有限的直接核心导入？

## 成功标准
- 所有频道连接器都使用 SDK + 运行时作为插件。
- `src/**` 中不再有 `extensions/**` 的导入。
- 新的连接器模板仅依赖 SDK + 运行时。
- 外部插件可以在不访问核心源码的情况下进行开发和更新。

相关文档：[插件](/plugin)，[频道](/channels/index)，[配置](/gateway/configuration)。