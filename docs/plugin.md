---
summary: "Clawdbot plugins/extensions: discovery, config, and safety"
read_when:
  - Adding or modifying plugins/extensions
  - Documenting plugin install or load rules
---

# 插件（扩展）

## 快速入门（刚接触插件？）

插件只是一个 **小型代码模块**，用于扩展 Clawdbot 的功能（命令、工具和 Gateway RPC）。

大多数情况下，当你需要一些 Clawdbot 核心尚未内置的功能（或者你希望将可选功能从主安装中分离出来）时，会使用插件。

快速路径：

1) 查看哪些插件已加载：```bash
clawdbot plugins list
```
2) 安装官方插件（例如：语音通话）：```bash
clawdbot plugins install @clawdbot/voice-call
```
3) 重启网关后，在 `plugins.entries.<id>.config` 下进行配置。

有关具体插件的示例，请参阅 [语音通话](/plugins/voice-call)。

## 可用插件（官方）

- Microsoft Teams 从 2026.1.15 版本起仅支持插件形式；如果使用 Teams，请安装 `@clawdbot/msteams`。
- Memory（核心）— 内置的内存搜索插件（通过 `plugins.slots.memory` 默认启用）
- Memory（LanceDB）— 内置的长期记忆插件（自动回忆/捕获；设置 `plugins.slots.memory = "memory-lancedb"`）
- [语音通话](/plugins/voice-call) — `@clawdbot/voice-call`
- [Zalo 个人](/plugins/zalouser) — `@clawdbot/zalouser`
- [Matrix](/channels/matrix) — `@clawdbot/matrix`
- [Nostr](/channels/nostr) — `@clawdbot/nostr`
- [Zalo](/channels/zalo) — `@clawdbot/zalo`
- [Microsoft Teams](/channels/msteams) — `@clawdbot/msteams`
- Google Antigravity OAuth（提供方认证）— 内置为 `google-antigravity-auth`（默认禁用）
- Gemini CLI OAuth（提供方认证）— 内置为 `google-gemini-cli-auth`（默认禁用）
- Qwen OAuth（提供方认证）— 内置为 `qwen-portal-auth`（默认禁用）
- Copilot 代理（提供方认证）— 本地 VS Code Copilot 代理桥接；与内置的 `github-copilot` 设备登录不同（内置，默认禁用）

Clawdbot 插件是 **TypeScript 模块**，通过 jiti 在运行时加载。**配置验证不会执行插件代码**；它使用插件的清单和 JSON Schema。详见 [插件清单](/plugins/manifest)。

插件可以注册以下内容：

- 网关 RPC 方法
- 网关 HTTP 处理器
- 代理工具
- CLI 命令
- 后台服务
- 可选的配置验证
- **技能**（通过在插件清单中列出 `skills` 目录）
- **自动回复命令**（无需调用 AI 代理即可执行）

插件与网关 **在同一进程中运行**，因此请将它们视为可信代码。
工具编写指南：[插件代理工具](/plugins/agent-tools)。

## 运行时辅助函数

插件可以通过 `api.runtime` 访问选定的核心辅助函数。对于电话语音合成（TTS）：```ts
const result = await api.runtime.tts.textToSpeechTelephony({
  text: "Hello from Clawdbot",
  cfg: api.config,
});
```
注意事项：
- 使用核心 `messages.tts` 配置（OpenAI 或 ElevenLabs）。
- 返回 PCM 音频缓冲区 + 采样率。插件必须对音频进行重采样/编码以适应各提供方。
- Edge TTS 不支持用于电话通信。

## 发现与优先级

Clawdbot 按以下顺序进行扫描：

1) 配置路径
- `plugins.load.paths`（文件或目录）

2) 工作区扩展
- `<workspace>/.clawdbot/extensions/*.ts`
- `<workspace>/.clawdbot/extensions/*/index.ts`

3) 全局扩展
- `~/.clawdbot/extensions/*.ts`
- `~/.clawdbot/extensions/*/index.ts`

4) 内置扩展（随 Clawdbot 一起提供，**默认禁用**）
- `<clawdbot>/extensions/*`

内置插件必须通过 `plugins.entries.<id>.enabled` 或 `clawdbot plugins enable <id>` 显式启用。已安装的插件默认是启用的，但也可以通过相同的方式禁用。

每个插件必须在其根目录中包含一个 `clawdbot.plugin.json` 文件。如果路径指向一个文件，则插件根目录是该文件所在的目录，并且必须包含此清单文件。

如果多个插件解析为相同的 id，按照上述顺序第一个匹配的插件将被使用，后续优先级较低的副本将被忽略。

### 包装包

一个插件目录可能包含一个 `package.json` 文件，其中包含 `clawdbot.extensions` 字段：```json
{
  "name": "my-pack",
  "clawdbot": {
    "extensions": ["./src/safety.ts", "./src/tools.ts"]
  }
}
```
每个条目都会成为一个插件。如果包中列出了多个扩展，插件的 id 将会是 `name/<fileBase>`。

如果你的插件引入了 npm 依赖，请在该目录中安装它们，以便 `node_modules` 可用（使用 `npm install` 或 `pnpm install`）。

### 渠道目录元数据

渠道插件可以通过 `clawdbot.channel` 广告引导信息，并通过 `clawdbot.install` 提供安装提示。这使得核心目录数据保持简洁。

示例：```json
{
  "name": "@clawdbot/nextcloud-talk",
  "clawdbot": {
    "extensions": ["./index.ts"],
    "channel": {
      "id": "nextcloud-talk",
      "label": "Nextcloud Talk",
      "selectionLabel": "Nextcloud Talk (self-hosted)",
      "docsPath": "/channels/nextcloud-talk",
      "docsLabel": "nextcloud-talk",
      "blurb": "Self-hosted chat via Nextcloud Talk webhook bots.",
      "order": 65,
      "aliases": ["nc-talk", "nc"]
    },
    "install": {
      "npmSpec": "@clawdbot/nextcloud-talk",
      "localPath": "extensions/nextcloud-talk",
      "defaultChoice": "npm"
    }
  }
}
```
Clawdbot 还可以合并 **外部频道目录**（例如，MPM 注册表导出文件）。将 JSON 文件放入以下任意一个路径中：
- `~/.clawdbot/mpm/plugins.json`
- `~/.clawdbot/mpm/catalog.json`
- `~/.clawdbot/plugins/catalog.json`

或者将 `CLAWDBOT_PLUGIN_CATALOG_PATHS`（或 `CLAWDBOT_MPM_CATALOG_PATHS`）指向一个或多个 JSON 文件（用逗号、分号或 `PATH` 分隔）。每个文件应包含 `{ "entries": [ { "name": "@scope/pkg", "clawdbot": { "channel": {...}, "install": {...} } } ] }`。

## 插件 ID

默认插件 ID：

- 包含包：`package.json` 中的 `name`
- 独立文件：文件基础名称（`~/.../voice-call.ts` → `voice-call`）

如果插件导出了 `id`，Clawdbot 会使用它，但当它与配置的 ID 不匹配时会发出警告。```json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    deny: ["untrusted-plugin"],
    load: { paths: ["~/Projects/oss/voice-call-extension"] },
    entries: {
      "voice-call": { enabled: true, config: { provider: "twilio" } }
    }
  }
}
```
字段：
- `enabled`: 主开关（默认：true）
- `allow`: 允许列表（可选）
- `deny`: 拒绝列表（可选；拒绝优先）
- `load.paths`: 额外的插件文件/目录
- `entries.<id>`: 每个插件的开关 + 配置

配置更改 **需要重启网关**。

验证规则（严格）：
- 在 `entries`、`allow`、`deny` 或 `slots` 中出现的未知插件 ID 是 **错误**。
- 未知的 `channels.<id>` 键是 **错误**，除非某个插件的清单声明了该通道 ID。
- 插件配置使用嵌入在 `clawdbot.plugin.json` 中的 JSON Schema 进行验证（`configSchema`）。
- 如果一个插件被禁用，其配置将被保留，并会发出 **警告**。

## 插件槽位（互斥类别）

某些插件类别是 **互斥的**（同一时间只能有一个激活）。使用 `plugins.slots` 来选择哪个插件拥有该槽位：```json5
{
  plugins: {
    slots: {
      memory: "memory-core" // or "none" to disable memory plugins
    }
  }
}
```
如果多个插件声明了 `kind: "memory"`，只有被选中的那个会加载。其他插件会被禁用，并显示诊断信息。

## 控制界面（schema + 标签）

Control UI 使用 `config.schema`（JSON Schema + `uiHints`）来渲染更友好的表单。

Clawdbot 在运行时根据发现的插件来增强 `uiHints`：

- 为 `plugins.entries.<id>` / `.enabled` / `.config` 添加每个插件的标签
- 将可选的插件提供的配置字段提示合并到以下位置：
  `plugins.entries.<id>.config.<field>`

如果你想让插件的配置字段显示良好的标签/占位符（并标记敏感信息），请在插件的清单中提供 `uiHints` 与 JSON Schema 一起使用。

示例：```json
{
  "id": "my-plugin",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "apiKey": { "type": "string" },
      "region": { "type": "string" }
    }
  },
  "uiHints": {
    "apiKey": { "label": "API Key", "sensitive": true },
    "region": { "label": "Region", "placeholder": "us-east-1" }
  }
}
```
## 命令行界面（CLI）```bash
clawdbot plugins list
clawdbot plugins info <id>
clawdbot plugins install <path>                 # copy a local file/dir into ~/.clawdbot/extensions/<id>
clawdbot plugins install ./extensions/voice-call # relative path ok
clawdbot plugins install ./plugin.tgz           # install from a local tarball
clawdbot plugins install ./plugin.zip           # install from a local zip
clawdbot plugins install -l ./extensions/voice-call # link (no copy) for dev
clawdbot plugins install @clawdbot/voice-call # install from npm
clawdbot plugins update <id>
clawdbot plugins update --all
clawdbot plugins enable <id>
clawdbot plugins disable <id>
clawdbot plugins doctor
```
`plugins update` 仅适用于在 `plugins.installs` 下跟踪的 npm 安装。

插件也可以注册自己的顶级命令（例如：`clawdbot voicecall`）。

## 插件 API（概述）

插件导出以下两种形式之一：

- 一个函数：`(api) => { ... }`
- 一个对象：`{ id, name, configSchema, register(api) { ... } }`

## 插件钩子

插件可以自带钩子，并在运行时注册它们。这使得插件能够在不安装单独钩子包的情况下，打包事件驱动的自动化功能。

### 示例```
import { registerPluginHooksFromDir } from "clawdbot/plugin-sdk";

export default function register(api) {
  registerPluginHooksFromDir(api, "./hooks");
}
```
注意事项：
- 挂载目录遵循正常的挂载结构（`HOOK.md` + `handler.ts`）。
- 仍然适用挂载的资格规则（操作系统/二进制文件/环境/配置要求）。
- 插件管理的挂载会在 `clawdbot hooks list` 中以 `plugin:<id>` 的形式显示。
- 你不能通过 `clawdbot hooks` 来启用或禁用由插件管理的挂载；而是应该启用或禁用相应的插件。

## 提供商插件（模型认证）

插件可以注册 **模型提供商认证** 流程，使用户可以在 Clawdbot 内运行 OAuth 或 API 密钥设置（无需外部脚本）。

通过 `api.registerProvider(...)` 注册一个提供商。每个提供商会暴露一个或多个认证方式（OAuth、API 密钥、设备代码等）。这些方式支持以下命令：

- `clawdbot models auth login --provider <id> [--method <id>]`

示例：```ts
api.registerProvider({
  id: "acme",
  label: "AcmeAI",
  auth: [
    {
      id: "oauth",
      label: "OAuth",
      kind: "oauth",
      run: async (ctx) => {
        // Run OAuth flow and return auth profiles.
        return {
          profiles: [
            {
              profileId: "acme:default",
              credential: {
                type: "oauth",
                provider: "acme",
                access: "...",
                refresh: "...",
                expires: Date.now() + 3600 * 1000,
              },
            },
          ],
          defaultModel: "acme/opus-1",
        };
      },
    },
  ],
});
```
注意事项：
- `run` 接收一个 `ProviderAuthContext`，其中包含 `prompter`、`runtime`、`openUrl` 和 `oauth.createVpsAwareHandlers` 等辅助函数。
- 当你需要添加默认模型或提供者配置时，返回 `configPatch`。
- 返回 `defaultModel` 以便 `--set-default` 可以更新代理的默认设置。

### 注册一个消息通道

插件可以注册 **通道插件**，这些插件的行为类似于内置通道（如 WhatsApp、Telegram 等）。通道配置位于 `channels.<id>` 下，并由你的通道插件代码进行验证。```ts
const myChannel = {
  id: "acmechat",
  meta: {
    id: "acmechat",
    label: "AcmeChat",
    selectionLabel: "AcmeChat (API)",
    docsPath: "/channels/acmechat",
    blurb: "demo channel plugin.",
    aliases: ["acme"],
  },
  capabilities: { chatTypes: ["direct"] },
  config: {
    listAccountIds: (cfg) => Object.keys(cfg.channels?.acmechat?.accounts ?? {}),
    resolveAccount: (cfg, accountId) =>
      (cfg.channels?.acmechat?.accounts?.[accountId ?? "default"] ?? { accountId }),
  },
  outbound: {
    deliveryMode: "direct",
    sendText: async () => ({ ok: true }),
  },
};

export default function (api) {
  api.registerChannel({ plugin: myChannel });
}
```
注意事项：
- 将配置放在 `channels.<id>` 下（而不是 `plugins.entries`）。
- `meta.label` 用于 CLI/UI 列表中的标签。
- `meta.aliases` 用于规范化和 CLI 输入的备用 ID。
- `meta.preferOver` 列出在同时配置时应跳过自动启用的频道 ID。
- `meta.detailLabel` 和 `meta.systemImage` 用于 UI 显示更丰富的频道标签/图标。

### 编写一个新的消息频道（逐步指南）

当你想要一个**新的聊天界面**（一个“消息频道”）时使用此方法，而不是模型提供者。
模型提供者的文档位于 `/providers/*` 下。

1) 选择一个 ID 和配置结构
- 所有频道配置都位于 `channels.<id>` 下。
- 对于多账号设置，建议使用 `channels.<id>.accounts.<accountId>`。

2) 定义频道元数据
- `meta.label`、`meta.selectionLabel`、`meta.docsPath`、`meta.blurb` 控制 CLI/UI 列表。
- `meta.docsPath` 应指向一个文档页面，例如 `/channels/<id>`。
- `meta.preferOver` 允许一个插件替换另一个频道（自动启用时会优先选择它）。
- `meta.detailLabel` 和 `meta.systemImage` 用于 UI 显示详细文本/图标。

3) 实现必需的适配器
- `config.listAccountIds` 和 `config.resolveAccount`
- `capabilities`（聊天类型、媒体、线程等）
- `outbound.deliveryMode` 和 `outbound.sendText`（用于基本发送）

4) 按需添加可选适配器
- `setup`（向导）、`security`（私信策略）、`status`（健康/诊断）
- `gateway`（启动/停止/登录）、`mentions`（提及功能）、`threading`（线程支持）、`streaming`（流式传输）
- `actions`（消息操作）、`commands`（原生命令行为）

5) 在你的插件中注册该频道
- `api.registerChannel({ plugin })`

最小配置示例：```json5
{
  channels: {
    acmechat: {
      accounts: {
        default: { token: "ACME_TOKEN", enabled: true }
      }
    }
  }
}
```
最小化通道插件（仅出站）：```ts
const plugin = {
  id: "acmechat",
  meta: {
    id: "acmechat",
    label: "AcmeChat",
    selectionLabel: "AcmeChat (API)",
    docsPath: "/channels/acmechat",
    blurb: "AcmeChat messaging channel.",
    aliases: ["acme"],
  },
  capabilities: { chatTypes: ["direct"] },
  config: {
    listAccountIds: (cfg) => Object.keys(cfg.channels?.acmechat?.accounts ?? {}),
    resolveAccount: (cfg, accountId) =>
      (cfg.channels?.acmechat?.accounts?.[accountId ?? "default"] ?? { accountId }),
  },
  outbound: {
    deliveryMode: "direct",
    sendText: async ({ text }) => {
      // deliver `text` to your channel here
      return { ok: true };
    },
  },
};

export default function (api) {
  api.registerChannel({ plugin });
}
```
加载插件（扩展目录或 `plugins.load.paths`），然后重启网关，
接着在你的配置中配置 `channels.<id>`。

### 代理工具

参见专用指南：[插件代理工具](/plugins/agent-tools)。

### 注册网关 RPC 方法```ts
export default function (api) {
  api.registerGatewayMethod("myplugin.status", ({ respond }) => {
    respond(true, { ok: true });
  });
}
```
### 注册 CLI 命令```ts
export default function (api) {
  api.registerCli(({ program }) => {
    program.command("mycmd").action(() => {
      console.log("Hello");
    });
  }, { commands: ["mycmd"] });
}
```
### 注册自动回复命令

插件可以注册自定义的斜杠命令，这些命令**无需调用AI代理**即可执行。这对于开关命令、状态检查或不需要LLM处理的快速操作非常有用。```ts
export default function (api) {
  api.registerCommand({
    name: "mystatus",
    description: "Show plugin status",
    handler: (ctx) => ({
      text: `Plugin is running! Channel: ${ctx.channel}`,
    }),
  });
}
```
命令处理程序上下文：

- `senderId`：发送者ID（如果可用）
- `channel`：命令发送的频道
- `isAuthorizedSender`：发送者是否为授权用户
- `args`：命令后传递的参数（如果 `acceptsArgs: true`）
- `commandBody`：完整的命令文本
- `config`：当前的 Clawdbot 配置

命令选项：

- `name`：命令名称（不带前缀 `/`）
- `description`：在命令列表中显示的帮助文本
- `acceptsArgs`：命令是否接受参数（默认：false）。如果为 false 且提供了参数，命令将不会匹配，消息会传递给其他处理程序
- `requireAuth`：是否需要授权的发送者（默认：true）
- `handler`：返回 `{ text: string }` 的函数（可以是异步的）

带授权和参数的示例：```ts
api.registerCommand({
  name: "setmode",
  description: "Set plugin mode",
  acceptsArgs: true,
  requireAuth: true,
  handler: async (ctx) => {
    const mode = ctx.args?.trim() || "default";
    await saveMode(mode);
    return { text: `Mode set to: ${mode}` };
  },
});
```
注意事项：
- 插件命令在内置命令和 AI 代理之前处理
- 命令是全局注册的，在所有频道中都有效
- 命令名称不区分大小写（`/MyStatus` 与 `/mystatus` 匹配）
- 命令名称必须以字母开头，并且只能包含字母、数字、连字符和下划线
- 保留命令名称（如 `help`、`status`、`reset` 等）不能被插件覆盖
- 多个插件重复注册相同命令会导致诊断错误并失败

### 注册后台服务```ts
export default function (api) {
  api.registerService({
    id: "my-service",
    start: () => api.logger.info("ready"),
    stop: () => api.logger.info("bye"),
  });
}
```
## 命名规范

- 网关方法：`pluginId.action`（例如：`voicecall.status`）
- 工具：`snake_case`（例如：`voice_call`）
- CLI 命令：使用 kebab 或 camel 命名，但要避免与核心命令冲突

## 技能

插件可以在仓库中附带一个技能文件（`skills/<name>/SKILL.md`）。
通过 `plugins.entries.<id>.enabled`（或其他配置开关）启用它，并确保它存在于你的工作区/管理的技能位置中。

## 发布（npm）

推荐的打包方式：

- 主包：`clawdbot`（此仓库）
- 插件：在 `@clawdbot/*` 下的独立 npm 包（例如：`@clawdbot/voice-call`）

发布规范：

- 插件的 `package.json` 必须包含 `clawdbot.extensions` 字段，指定一个或多个入口文件。
- 入口文件可以是 `.js` 或 `.ts`（jiti 会在运行时加载 TS 文件）。
- `clawdbot plugins install <npm-spec>` 使用 `npm pack` 打包，解压到 `~/.clawdbot/extensions/<id>/`，并自动在配置中启用。
- 配置键的稳定性：作用域包会以 **非作用域** 的 ID 进行标准化处理，用于 `plugins.entries.*`。

## 示例插件：语音通话

此仓库包含一个语音通话插件（支持 Twilio 或日志回退）：

- 源码：`extensions/voice-call`
- 技能：`skills/voice-call`
- CLI：`clawdbot voicecall start|status`
- 工具：`voice_call`
- RPC：`voicecall.start`, `voicecall.status`
- 配置（Twilio）：`provider: "twilio"` + `twilio.accountSid/authToken/from`（可选 `statusCallbackUrl`, `twimlUrl`）
- 配置（开发）：`provider: "log"`（无网络）

有关设置和使用，请参见 [语音通话](/plugins/voice-call) 和 `extensions/voice-call/README.md`。

## 安全注意事项

插件在网关进程中运行。请将它们视为受信任的代码：

- 仅安装你信任的插件。
- 优先使用 `plugins.allow` 允许列表。
- 在更改后重启网关。