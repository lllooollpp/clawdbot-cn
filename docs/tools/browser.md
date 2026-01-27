---
summary: "Integrated browser control server + action commands"
read_when:
  - Adding agent-controlled browser automation
  - Debugging why clawd is interfering with your own Chrome
  - Implementing browser settings + lifecycle in the macOS app
---

# 浏览器（由 clawd 管理）

Clawdbot 可以运行一个 **专用的 Chrome/Brave/Edge/Chromium 配置文件**，该配置文件由代理控制。
它与你的个人浏览器隔离，并通过一个小型本地控制服务器进行管理。

初学者视角：
- 可以将其视为一个 **仅代理使用的独立浏览器**。
- `clawd` 配置文件 **不会** 影响你的个人浏览器配置文件。
- 代理可以在一个安全的环境中 **打开标签页、阅读页面、点击、输入**。
- 默认的 `chrome` 配置文件通过 **扩展中继** 使用 **系统默认的 Chromium 浏览器**；切换到 `clawd` 以使用隔离的受管理浏览器。

## 你将获得

- 一个名为 **clawd** 的独立浏览器配置文件（默认为橙色强调色）。
- 确定性的标签页控制（列表/打开/聚焦/关闭）。
- 代理操作（点击/输入/拖动/选择）、快照、截图、PDF 文件。
- 可选的多配置文件支持（`clawd`、`work`、`remote` 等）。

此浏览器 **不是** 你的日常使用浏览器。它是用于代理自动化和验证的安全、隔离环境。
bash
clawdbot browser --browser-profile clawd status
clawdbot browser --browser-profile clawd start
clawdbot browser --browser-profile clawd open https://example.com
clawdbot browser --browser-profile clawd snapshot
``````
如果出现“Browser disabled”，请启用它（见下文配置），然后重启网关。

## 配置文件：`clawd` 与 `chrome`

- `clawd`：受管理的、隔离的浏览器（无需扩展）。
- `chrome`：将请求中继到你的 **系统浏览器**（需要将 Clawdbot 扩展附加到一个标签页上）。

如果你希望默认使用受管理模式，请设置 `browser.defaultProfile: "clawd"`。

## 配置

浏览器设置位于 `~/.clawdbot/clawdbot.json` 中。```json5
{
  browser: {
    enabled: true,                    // default: true
    controlUrl: "http://127.0.0.1:18791",
    cdpUrl: "http://127.0.0.1:18792", // defaults to controlUrl + 1
    remoteCdpTimeoutMs: 1500,         // remote CDP HTTP timeout (ms)
    remoteCdpHandshakeTimeoutMs: 3000, // remote CDP WebSocket handshake timeout (ms)
    defaultProfile: "chrome",
    color: "#FF4500",
    headless: false,
    noSandbox: false,
    attachOnly: false,
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    profiles: {
      clawd: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" },
      remote: { cdpUrl: "http://10.0.0.42:9222", color: "#00AA00" }
    }
  }
}
```
说明：
- `controlUrl` 默认值为 `http://127.0.0.1:18791`。
- 如果你覆盖了网关端口（`gateway.port` 或 `CLAWDBOT_GATEWAY_PORT`），
  默认的浏览器端口会相应调整，以保持在同一“家族”中（control = gateway + 2）。
- `cdpUrl` 在未设置时默认为 `controlUrl + 1`。
- `remoteCdpTimeoutMs` 用于远程（非本地回环）CDP 可达性检查。
- `remoteCdpHandshakeTimeoutMs` 用于远程 CDP WebSocket 可达性检查。
- `attachOnly: true` 表示“从不启动本地浏览器；仅在浏览器已经运行时进行附加”。
- `color` 以及每个配置文件的 `color` 会为浏览器界面着色，以便你看到哪个配置文件是当前活动的。
- 默认配置文件是 `chrome`（扩展中继）。使用 `defaultProfile: "clawd"` 来使用托管浏览器。
- 自动检测顺序：如果系统默认浏览器是基于 Chromium 的，则使用它；否则依次检测 Chrome → Brave → Edge → Chromium → Chrome Canary。
- 本地 `clawd` 配置文件会自动分配 `cdpPort`/`cdpUrl` —— 仅在使用远程 CDP 时设置这些参数。
bash
clawdbot config set browser.executablePath "/usr/bin/google-chrome"
`````````
```md
// macOS
{
  browser: {
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  }
}

// Windows
{
  browser: {
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
  }
}

// Linux
{
  browser: {
    executablePath: "/usr/bin/brave-browser"
  }
}```
## 本地控制与远程控制

- **本地控制（默认）:** `controlUrl` 是本地回环地址（`127.0.0.1` / `localhost`）。
  网关会启动控制服务器并可以启动本地浏览器。
- **远程控制:** `controlUrl` 是非本地回环地址。网关 **不会** 启动本地服务器；它假设你正在指向其他地方的现有服务器。
- **远程 CDP:** 设置 `browser.profiles.<name>.cdpUrl`（或 `browser.cdpUrl`）以连接到远程基于 Chromium 的浏览器。在这种情况下，Clawdbot 不会启动本地浏览器。

## 远程浏览器（控制服务器）

你可以在另一台机器上运行 **浏览器控制服务器**，并通过远程 `controlUrl` 指向它。这使得代理可以在主机之外驱动浏览器（例如实验室电脑、虚拟机、远程桌面等）。

关键点：
- **控制服务器** 通过 **CDP** 与基于 Chromium 的浏览器（Chrome/Brave/Edge/Chromium）进行通信。
- **网关** 只需要 HTTP 控制 URL。
- 配置文件在 **控制服务器** 端进行解析。

示例：```json5
{
  browser: {
    enabled: true,
    controlUrl: "http://10.0.0.42:18791",
    defaultProfile: "work"
  }
}
```
使用 `profiles.<name>.cdpUrl` 来设置 **远程 CDP**，如果你想让网关直接与基于 Chromium 的浏览器实例通信，而无需远程控制服务器。

远程 CDP 的 URL 可以包含认证信息：
- 查询参数令牌（例如：`https://provider.example?token=<token>`）
- HTTP 基本认证（例如：`https://user:pass@provider.example`）

Clawdbot 在调用 `/json/*` 端点以及连接到 CDP WebSocket 时会保留认证信息。建议使用环境变量或密钥管理工具来存储令牌，而不是直接将其提交到配置文件中。

### Node 浏览器代理（零配置默认）

如果你在本地机器上运行一个 **node 主机**，并且该机器上安装了浏览器，Clawdbot 可以自动将浏览器工具调用路由到该 node，而无需任何自定义的 `controlUrl` 设置。这是远程网关的默认方式。

注意：
- Node 主机会通过一个 **代理命令** 暴露其本地的浏览器控制服务器。
- 浏器配置文件来自于 node 自己的 `browser.profiles` 配置（与本地相同）。
- 如果你不想使用此功能，可以禁用它：
  - 在 node 上：`nodeHost.browserProxy.enabled=false`
  - 在网关上：`gateway.nodes.browser.mode="off"`

### Browserless（托管远程 CDP）

[Browserless](https://browserless.io) 是一个托管的 Chromium 服务，它通过 HTTPS 暴露 CDP 端点。你可以将 Clawdbot 的浏览器配置文件指向 Browserless 的区域端点，并使用你的 API 密钥进行认证。

示例：
json5
{
  browser: {
    enabled: true,
    defaultProfile: "browserless",
    remoteCdpTimeoutMs: 2000,
    remoteCdpHandshakeTimeoutMs: 4000,
    profiles: {
      browserless: {
        cdpUrl: "https://production-sfo.browserless.io?token=<BROWSERLESS_API_KEY>",
        color: "#00AA00"
      }
    }
  }
}
``````
注意事项：
- 将 `<BROWSERLESS_API_KEY>` 替换为你的实际 Browserless 令牌。
- 选择与你的 Browserless 账户匹配的区域端点（请参阅他们的文档）。

### 在浏览器机器上运行控制服务器

在网关为远程的情况下，运行一个独立的浏览器控制服务器（推荐方式）：```bash
# on the machine that runs Chrome/Brave/Edge
clawdbot browser serve --bind <browser-host> --port 18791 --token <token>
```
然后将您的网关指向它：
json5
{
  browser: {
    enabled: true,
    controlUrl: "http://<browser-host>:18791",

    // 选项 A（推荐）：在网关上保持令牌在环境变量中
    //（避免将密钥写入配置文件）
    // controlToken: "<token>"
  }
}
``````
在网关环境中设置认证令牌：```bash
export CLAWDBOT_BROWSER_CONTROL_TOKEN="<token>"
```
选项 B：将令牌存储在网关配置中（使用相同的共享令牌）：
json5
{
  browser: {
    enabled: true,
    controlUrl: "http://<browser-host>:18791",
    controlToken: "<token>"
  }
}
``````
## 安全性

本节介绍用于代理浏览器自动化的 **浏览器控制服务器** (`browser.controlUrl`)。

核心思想：
- 将浏览器控制服务器视为一个管理 API：**仅限私有网络**。
- 当服务器需要在机器外访问时，**始终使用令牌认证**。
- 优先选择 **Tailnet 独占连接**，而不是暴露在局域网（LAN）中。

### 令牌（与哪些内容共享？）

- `browser.controlToken` / `CLAWDBOT_BROWSER_CONTROL_TOKEN` 仅用于对 `browser.controlUrl` 的浏览器控制 HTTP 请求进行认证。
- 它 **不是** 网关令牌 (`gateway.auth.token`)，**也不是** 节点配对令牌。
- 你可以重复使用相同的字符串值，但为了减少影响范围，最好保持它们的独立性。

### 绑定（不要意外地暴露到你的局域网）

推荐做法：
- 将 `clawdbot browser serve` 绑定到回环地址（`127.0.0.1`），并通过 Tailscale 发布。
- 或者仅绑定到 Tailnet IP（**永远不要绑定到 `0.0.0.0`**），并要求使用令牌认证。

避免做法：
- `--bind 0.0.0.0`（局域网可见）。即使使用了令牌认证，除非你同时添加 TLS，否则流量仍是明文 HTTP。```bash
# on the browser machine
clawdbot browser serve --bind 127.0.0.1 --port 18791 --token <token>
tailscale serve https / http://127.0.0.1:18791
```
然后将你的网关配置 `browser.controlUrl` 设置为 HTTPS URL（MagicDNS/ts.net），并继续使用相同的 token。

注意事项：
- 除非你明确希望将端点公开，否则 **不要** 使用 Tailscale Funnel。
- 关于 Tailnet 设置/背景知识，请参阅 [网关网页界面](/web/index) 和 [网关 CLI](/cli/gateway)。

## 配置文件（多浏览器）

Clawdbot 支持多个命名的配置文件（路由配置）。配置文件可以是：
- **clawd-managed**：一个专用的基于 Chromium 的浏览器实例，拥有自己的用户数据目录 + CDP 端口
- **remote**：一个显式的 CDP URL（基于 Chromium 的浏览器在其他地方运行）
- **扩展中继**：通过本地中继 + Chrome 扩展使用你已有的 Chrome 标签页

默认值：
- 如果缺少配置文件，会自动创建 `clawd` 配置文件。
- `chrome` 配置文件是内置的，用于 Chrome 扩展中继（默认指向 `http://127.0.0.1:18792`）。
- 本地 CDP 端口默认从 **18800–18899** 分配。
- 删除一个配置文件会将其本地数据目录移到“废纸篓”。

所有控制端点都接受 `?profile=<name>` 参数；CLI 使用 `--browser-profile` 参数。

## Chrome 扩展中继（使用你已有的 Chrome）

Clawdbot 还可以通过本地 CDP 中继 + Chrome 扩展来控制 **你已有的 Chrome 标签页**（不需要单独的“clawd” Chrome 实例）。

完整指南：[Chrome 扩展](/tools/chrome-extension)

流程：
- 你运行一个 **浏览器控制服务器**（与同一台机器上的 Gateway，或运行 `clawdbot browser serve`）。
- 一个本地 **中继服务器** 在回环地址 `cdpUrl` 上监听（默认：`http://127.0.0.1:18792`）。
- 你点击某个标签页上的 **Clawdbot Browser Relay** 扩展图标以进行连接（它不会自动连接）。
- 代理通过正常的 `browser` 工具控制该标签页，通过选择正确的配置文件来实现。

如果 Gateway 与 Chrome 在同一台机器上运行（默认设置），你通常 **不需要** 运行 `clawdbot browser serve`。
只有当 Gateway 在其他地方运行时（远程模式），才需要使用 `browser serve`。

### 沙盒会话

如果代理会话是沙盒模式的，`browser` 工具可能会默认使用 `target="sandbox"`（沙盒浏览器）。
Chrome 扩展中继接管需要主机浏览器的控制权限，因此需要：
- 以非沙盒模式运行会话，或者
- 设置 `agents.defaults.sandbox.browser.allowHostControl: true`，并在调用工具时使用 `target="host"`。
bash
clawdbot browser extension install
``````
- Chrome → `chrome://extensions` → 启用“开发者模式”
- “加载解压的扩展程序” → 选择由 `clawdbot browser extension path` 输出的目录
- 固定该扩展程序，然后点击你想要控制的标签页（徽章显示 `ON`）。

2) 使用方式：
- 命令行：`clawdbot browser --browser-profile chrome tabs`
- 代理工具：`browser` 并设置 `profile="chrome"`

可选：如果你想要不同的名称或中继端口，可以创建自己的配置文件：```bash
clawdbot browser create-profile \
  --name my-chrome \
  --driver extension \
  --cdp-url http://127.0.0.1:18792 \
  --color "#00AA00"
```
## 注意事项：
- 此模式主要依赖 Playwright-on-CDP 完成大多数操作（截图/快照/操作）。
- 点击扩展程序图标以再次断开连接。

## 隔离性保证

- **专用用户数据目录**：从不接触您的个人浏览器配置文件。
- **专用端口**：避免使用 `9222`，以防止与开发工作流发生冲突。
- **确定性标签控制**：通过 `targetId` 指定目标标签页，而不是“最后一个标签页”。

## 浏览器选择

在本地启动时，Clawdbot 会选择第一个可用的浏览器：
1. Chrome
2. Brave
3. Edge
4. Chromium
5. Chrome Canary

您可以使用 `browser.executablePath` 覆盖默认选择。

平台支持：
- macOS：检查 `/Applications` 和 `~/Applications`。
- Linux：查找 `google-chrome`、`brave`、`microsoft-edge`、`chromium` 等。
- Windows：检查常见的安装路径。

## 控制 API（可选）

如果您希望直接集成，浏览器控制服务器会暴露一个小型 HTTP API：

- 状态/启动/停止：`GET /`、`POST /start`、`POST /stop`
- 标签页：`GET /tabs`、`POST /tabs/open`、`POST /tabs/focus`、`DELETE /tabs/:targetId`
- 快照/截图：`GET /snapshot`、`POST /screenshot`
- 操作：`POST /navigate`、`POST /act`
- 钩子：`POST /hooks/file-chooser`、`POST /hooks/dialog`
- 下载：`POST /download`、`POST /wait/download`
- 调试：`GET /console`、`POST /pdf`
- 调试：`GET /errors`、`GET /requests`、`POST /trace/start`、`POST /trace/stop`、`POST /highlight`
- 网络：`POST /response/body`
- 状态：`GET /cookies`、`POST /cookies/set`、`POST /cookies/clear`
- 状态：`GET /storage/:kind`、`POST /storage/:kind/set`、`POST /storage/:kind/clear`
- 设置：`POST /set/offline`、`POST /set/headers`、`POST /set/credentials`、`POST /set/geolocation`、`POST /set/media`、`POST /set/timezone`、`POST /set/locale`、`POST /set/device`

所有端点都接受 `?profile=<name>` 参数。

### Playwright 依赖

一些功能（导航/操作/AI 快照/角色快照、元素截图、PDF）需要 Playwright。如果未安装 Playwright，这些端点将返回明确的 501 错误。ARIA 快照和基本截图仍可在 clawd 管理的 Chrome 中使用。对于 Chrome 扩展程序中继驱动程序，ARIA 快照和截图也需要 Playwright。

如果您看到 `Playwright 在此网关构建中不可用`，请安装完整的 Playwright 包（不是 `playwright-core`），并重新启动网关，或重新安装带有浏览器支持的 Clawdbot。

基础命令：
- `clawdbot browser status`
- `clawdbot browser start`
- `clawdbot browser stop`
- `clawdbot browser tabs`
- `clawdbot browser tab`
- `clawdbot browser tab new`
- `clawdbot browser tab select 2`
- `clawdbot browser tab close 2`
- `clawdbot browser open https://example.com`
- `clawdbot browser focus abcd1234`
- `clawdbot browser close abcd1234`

检查命令：
- `clawdbot browser screenshot`
- `clawdbot browser screenshot --full-page`
- `clawdbot browser screenshot --ref 12`
- `clawdbot browser screenshot --ref e12`
- `clawdbot browser snapshot`
- `clawdbot browser snapshot --format aria --limit 200`
- `clawdbot browser snapshot --interactive --compact --depth 6`
- `clawdbot browser snapshot --efficient`
- `clawdbot browser snapshot --labels`
- `clawdbot browser snapshot --selector "#main" --interactive`
- `clawdbot browser snapshot --frame "iframe#main" --interactive`
- `clawdbot browser console --level error`
- `clawdbot browser errors --clear`
- `clawdbot browser requests --filter api --clear`
- `clawdbot browser pdf`
- `clawdbot browser responsebody "**/api" --max-chars 5000`

操作命令：
- `clawdbot browser navigate https://example.com`
- `clawdbot browser resize 1280 720`
- `clawdbot browser click 12 --double`
- `clawdbot browser click e12 --double`
- `clawdbot browser type 23 "hello" --submit`
- `clawdbot browser press Enter`
- `clawdbot browser hover 44`
- `clawdbot browser scrollintoview e12`
- `clawdbot browser drag 10 11`
- `clawdbot browser select 9 OptionA OptionB`
- `clawdbot browser download e12 /tmp/report.pdf`
- `clawdbot browser waitfordownload /tmp/report.pdf`
- `clawdbot browser upload /tmp/file.pdf`
- `clawdbot browser fill --fields '[{"ref":"1","type":"text","value":"Ada"}]'`
- `clawdbot browser dialog --accept`
- `clawdbot browser wait --text "Done"`
- `clawdbot browser wait "#main" --url "**/dash" --load networkidle --fn "window.ready===true"`
- `clawdbot browser evaluate --fn '(el) => el.textContent' --ref 7`
- `clawdbot browser highlight e12`
- `clawdbot browser trace start`
- `clawdbot browser trace stop`

状态命令：
- `clawdbot browser cookies`
- `clawdbot browser cookies set session abc123 --url "https://example.com"`
- `clawdbot browser cookies clear`
- `clawdbot browser storage local get`
- `clawdbot browser storage local set theme dark`
- `clawdbot browser storage session clear`
- `clawdbot browser set offline on`
- `clawdbot browser set headers --json '{"X-Debug":"1"}'`
- `clawdbot browser set credentials user pass`
- `clawdbot browser set credentials --clear`
- `clawdbot browser set geo 37.7749 -122.4194 --origin "https://example.com"`
- `clawdbot browser set geo --clear`
- `clawdbot browser set media dark`
- `clawdbot browser set timezone America/New_York`
- `clawdbot browser set locale en-US`
- `clawdbot browser set device "iPhone 14"`

说明：
- `upload` 和 `dialog` 是 **准备** 调用；在触发选择器/对话框的点击/按压操作之前运行它们。
- `upload` 还可以通过 `--input-ref` 或 `--element` 直接设置文件输入。

snapshot：
  - `--format ai`（当安装 Playwright 时的默认格式）：返回带有数字引用的 AI 快照（`aria-ref="<n>"`）。
  - `--format aria`：返回可访问性树（无引用；仅用于检查）。
  - `--efficient`（或 `--mode efficient`）：紧凑的角色快照预设（交互式 + 紧凑 + 深度 + 更低的 maxChars）。
  - 配置默认值（仅限工具/CLI）：设置 `browser.snapshotDefaults.mode: "efficient"`，当调用者未传递 mode 时使用紧凑快照（参见 [Gateway 配置](/gateway/configuration#browser-clawd-managed-browser)）。
  - 角色快照选项（`--interactive`, `--compact`, `--depth`, `--selector`）强制生成基于角色的快照，并带有引用如 `ref=e12`。
  - `--frame "<iframe 选择器>"` 会将角色快照限定在某个 iframe 中（与角色引用如 `e12` 配对）。
  - `--interactive` 输出一个扁平、易于选择的交互元素列表（最适合驱动操作）。
  - `--labels` 会添加一个带有覆盖引用标签的视口截图（输出 `MEDIA:<path>`）。

- `click`/`type`/等操作需要从 `snapshot` 中获取一个 `ref`（可以是数字 `12` 或角色引用 `e12`）。
  - CSS 选择器不被支持用于操作。

- **角色快照（如 `e12` 的角色引用）**：`clawdbot browser snapshot --interactive`（或 `--compact`, `--depth`, `--selector`, `--frame`）
  - 输出：基于角色的列表/树，包含 `[ref=e12]`（以及可选的 `[nth=1]`）。
  - 操作：`clawdbot browser click e12`，`clawdbot browser highlight e12`。
  - 内部实现：引用通过 `getByRole(...)`（以及 `nth()` 用于重复项）解析。
  - 添加 `--labels` 可以在视口截图上叠加 `e12` 标签。

引用行为：
- 引用 **在页面导航后不保持稳定**；如果操作失败，请重新运行 `snapshot` 并使用新的引用。
- 如果角色快照是通过 `--frame` 拍摄的，角色引用将限定在该 iframe 中，直到下一次角色快照。

## 等待增强功能

你可以等待的不仅仅是时间或文本：

- 等待 URL（Playwright 支持通配符）：
  - `clawdbot browser wait --url "**/dash"`

- 等待加载状态：
  - `clawdbot browser wait --load networkidle`

- 等待 JS 表达式：
  - `clawdbot browser wait --fn "window.ready===true"`

- 等待某个选择器变为可见：
  - `clawdbot browser wait "#main"`

这些可以组合使用：
bash
clawdbot browser wait "#main" \
  --url "**/dash" \
  --load networkidle \
  --fn "window.ready===true" \
  --timeout-ms 15000
``````
## 调试工作流

当一个操作失败时（例如：“不可见”、“严格模式违规”、“被覆盖”）：

1. `clawdbot browser snapshot --interactive`
2. 使用 `click <ref>` / `type <ref>`（在交互模式下优先使用角色引用）
3. 如果仍然失败：`clawdbot browser highlight <ref>` 以查看 Playwright 正在定位的内容
4. 如果页面行为异常：
   - `clawdbot browser errors --clear`
   - `clawdbot browser requests --filter api --clear`
5. 对于深度调试：录制一个追踪：
   - `clawdbot browser trace start`
   - 重现问题
   - `clawdbot browser trace stop`（输出 `TRACE:<路径>`）

## JSON 输出

`--json` 用于脚本和结构化工具。

示例：```bash
clawdbot browser status --json
clawdbot browser snapshot --interactive --json
clawdbot browser requests --filter api --json
clawdbot browser cookies --json
```
"Role 快照（snapshot）在 JSON 中包含 `refs` 以及一个小型的 `stats` 块（包含行数/字符数/引用数/交互数），以便工具可以推断有效负载大小和密度。

## 状态与环境控制选项

这些选项对于“让站点表现得像 X”这类工作流非常有用：

- Cookies：`cookies`、`cookies set`、`cookies clear`
- 存储：`storage local|session get|set|clear`
- 离线模式：`set offline on|off`
- 请求头：`set headers --json '{"X-Debug":"1"}'`（或 `--clear`）
- HTTP 基本认证：`set credentials user pass`（或 `--clear`）
- 地理位置：`set geo <lat> <lon> --origin "https://example.com"`（或 `--clear`）
- 媒体：`set media dark|light|no-preference|none`
- 时区 / 语言环境：`set timezone ...`、`set locale ...`
- 设备 / 视口：
  - `set device "iPhone 14"`（Playwright 设备预设）
  - `set viewport 1280 720`

## 安全与隐私

- clawd 浏览器配置文件可能包含已登录的会话；请将其视为敏感信息。
- 对于登录和反机器人备注（如 X/Twitter 等），请参阅 [浏览器登录 + X/Twitter 发布](/tools/browser-login)。
- 除非你有意暴露服务器，否则控制 URL 应限制为本地回环（loopback-only）。
- 远程 CDP 端点功能强大；请通过隧道传输并加以保护。

## 排错

对于 Linux 特定的问题（尤其是 snap 版的 Chromium），请参阅 [浏览器排错](/tools/browser-linux-troubleshooting)。

## Agent 工具与控制机制

Agent 会获得一个用于浏览器自动化的工具：
- `browser` — 状态/启动/停止/标签页/打开/聚焦/关闭/快照/截图/导航/操作

其映射方式如下：
- `browser snapshot` 返回一个稳定的 UI 树（AI 或 ARIA）。
- `browser act` 使用快照中的 `ref` ID 来进行点击/输入/拖拽/选择等操作。
- `browser screenshot` 捕获像素（整页或元素）。
- `browser` 接受以下参数：
  - `profile`：选择一个命名的浏览器配置文件（本地或远程控制服务器）。
  - `target`（`sandbox` | `host` | `custom`）：选择浏览器所在的位置。
  - `controlUrl`：隐式设置 `target: "custom"`（远程控制服务器）。
  - 在沙箱会话中，若 `target: "host"`，则需要设置 `agents.defaults.sandbox.browser.allowHostControl=true`。
  - 如果未指定 `target`：沙箱会话默认使用 `sandbox`，非沙箱会话默认使用 `host`。
  - 沙箱允许列表可以限制 `target: "custom"` 仅允许特定的 URL/主机/端口。
  - 默认设置：允许列表未设置（无限制），沙箱主机控制默认被禁用。

这种方式确保了 Agent 的确定性，并避免了脆弱的选择器问题。"