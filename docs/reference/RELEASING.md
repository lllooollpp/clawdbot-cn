---
summary: "Step-by-step release checklist for npm + macOS app"
read_when:
  - Cutting a new npm release
  - Cutting a new macOS app release
  - Verifying metadata before publishing
---

# 发布检查清单 (npm + macOS)

使用仓库根目录中的 `pnpm`（需要 Node 22+）。在打标签/发布之前，请确保工作树是干净的。

## 操作员触发
当操作员输入“release”时，立即执行预检（除非被阻塞，否则不需要额外提问）：
- 阅读此文档和 `docs/platforms/mac/release.md`。
- 从 `~/.profile` 加载环境变量，并确认 `SPARKLE_PRIVATE_KEY_FILE` 和 App Store Connect 变量已设置（`SPARKLE_PRIVATE_KEY_FILE` 应该存在于 `~/.profile` 中）。
- 如有需要，使用 `~/Library/CloudStorage/Dropbox/Backup/Sparkle` 中的 Sparkle 密钥。

1) **版本与元数据**
- [ ] 升级 `package.json` 中的版本号（例如：`2026.1.25`）。
- [ ] 运行 `pnpm plugins:sync` 以对齐扩展包版本和变更日志。
- [ ] 更新 CLI 的版本字符串： [`src/cli/program.ts`](https://github.com/clawdbot/clawdbot/blob/main/src/cli/program.ts) 和 Baileys 用户代理在 [`src/provider-web.ts`](https://github.com/clawdbot/clawdbot/blob/main/src/provider-web.ts) 中。
- [ ] 确认包的元数据（名称、描述、仓库、关键词、许可证）以及 `bin` 映射指向 [`dist/entry.js`](https://github.com/clawdbot/clawdbot/blob/main/dist/entry.js) 用于 `clawdbot`。
- [ ] 如果依赖项有变化，运行 `pnpm install` 以确保 `pnpm-lock.yaml` 是最新的。

2) **构建与制品**
- [ ] 如果 A2UI 输入有变化，运行 `pnpm canvas:a2ui:bundle` 并提交任何更新的 [`src/canvas-host/a2ui/a2ui.bundle.js`](https://github.com/clawdbot/clawdbot/blob/main/src/canvas-host/a2ui/a2ui.bundle.js)。
- [ ] 运行 `pnpm run build`（重新生成 `dist/`）。
- [ ] 验证 npm 包的 `files` 是否包含所有必需的 `dist/*` 文件夹（特别是 `dist/node-host/**` 和 `dist/acp/**` 用于无头 node 和 ACP CLI）。
- [ ] 确认 `dist/build-info.json` 存在，并包含预期的 `commit` 哈希值（CLI 的启动信息使用此值用于 npm 安装）。
- [ ] 可选：在构建后运行 `npm pack --pack-destination /tmp`；检查归档包内容，并保留用于 GitHub 发布（**不要提交**它）。

3) **变更日志与文档**
- [ ] 更新 `CHANGELOG.md`，加入用户可见的亮点（如果文件缺失则创建）；确保条目按版本号严格降序排列。
- [ ] 确保 README 中的示例/标志与当前 CLI 行为一致（特别是新命令或选项）。

4) **验证**
- [ ] `pnpm lint`
- [ ] `pnpm test`（如果需要覆盖率输出，可使用 `pnpm test:coverage`）
- [ ] `pnpm run build`（在测试之后的最后一次 sanity 检查）
- [ ] `pnpm release:check`（验证 npm 包内容）
- [ ] `CLAWDBOT_INSTALL_SMOKE_SKIP_NONROOT=1 pnpm test:install:smoke`（Docker 安装 smoke 测试，快速路径；发布前必需）
  - 如果上一个 npm 发布已知有问题，可设置 `CLAWDBOT_INSTALL_SMOKE_PREVIOUS=<上一个良好版本>` 或 `CLAWDBOT_INSTALL_SMOKE_SKIP_PREVIOUS=1` 来跳过 preinstall 步骤。
- [ ] （可选）完整安装器 smoke 测试（包含非 root 用户 + CLI 覆盖率）：`pnpm test:install:smoke`
- [ ] （可选）安装器 E2E 测试（Docker，运行 `curl -fsSL https://clawd.bot/install.sh | bash`，进行注册，然后执行真实工具调用）：
  - `pnpm test:install:e2e:openai`（需要 `OPENAI_API_KEY`）
  - `pnpm test:install:e2e:anthropic`（需要 `ANTHROPIC_API_KEY`）
  - `pnpm test:install:e2e`（需要两个密钥；运行两个提供方）
- [ ] （可选）如果你的更改影响了发送/接收路径，请对 web 网关进行抽样检查。

5) **macOS 应用（Sparkle）**
- [ ] 构建并签名 macOS 应用，然后将其压缩用于分发。
- [ ] 生成 Sparkle appcast（通过 [`scripts/make_appcast.sh`](https://github.com/clawdbot/clawdbot/blob/main/scripts/make_appcast.sh) 生成 HTML 说明），并更新 `appcast.xml`。
- [ ] 保留应用 zip 文件（以及可选的 dSYM zip 文件）以便附加到 GitHub 发布中。
- [ ] 按照 [macOS 发布指南](/platforms/mac/release) 执行具体命令和所需环境变量。
  - `APP_BUILD` 必须是数字且单调递增（不能带 `-beta`），以便 Sparkle 正确比较版本。
  - 如果需要公证，使用通过 App Store Connect API 环境变量创建的 `clawdbot-notary` 密钥链配置文件（参见 [macOS 发布指南](/platforms/mac/release)）。

6) **发布（npm）**
- [ ] 确认 git 状态为干净；如有需要，提交并推送更改。
- [ ] 如果需要，执行 `npm login`（验证 2FA）。
- [ ] 执行 `npm publish --access public`（预发布版本使用 `--tag beta`）。
- [ ] 验证注册表：`npm view clawdbot version`、`npm view clawdbot dist-tags`，以及 `npx -y clawdbot@X.Y.Z --version`（或 `--help`）。

### 故障排除（来自 2.0.0-beta2 发布的笔记）
- **npm pack/publish 停滞或生成巨大的 tarball**：`dist/Clawdbot.app`（以及发布 zip）会被包含在包中。通过 `package.json` 的 `files` 字段进行发布内容白名单（包含 dist 子目录、docs、skills；排除 app 套件）。使用 `npm pack --dry-run` 确认 `dist/Clawdbot.app` 不在列表中。
- **npm auth 网页循环添加 dist-tags**：使用传统认证方式以获得 OTP 提示：
  - `NPM_CONFIG_AUTH_TYPE=legacy npm dist-tag add clawdbot@X.Y.Z latest`
- **`npx` 验证失败并提示 `ECOMPROMISED: Lock compromised`**：使用干净的缓存重试：
  - `NPM_CONFIG_CACHE=/tmp/npm-cache-$(date +%s) npx -y clawdbot@X.Y.Z --version`
- **在后期修复后需要重新指向标签**：强制更新并推送标签，然后确保 GitHub 发布的资源仍然匹配：
  - `git tag -f vX.Y.Z && git push -f origin vX.Y.Z`

7) **GitHub 发布 + appcast**
- [ ] 打标签并推送：`git tag vX.Y.Z && git push origin vX.Y.Y` (或 `git push --tags`)。
- [ ] 为 `vX.Y.Z` 创建/更新 GitHub 发布，标题应为 **`clawdbot X.Y.Z`**（不只是标签）；正文应包含该版本的 **完整** 变更日志（亮点 + 变更 + 修复），以内联方式呈现（不使用裸链接），并且 **正文内不能重复标题内容**。
- [ ] 附加构建产物：`npm pack` 生成的 tarball（可选），`Clawdbot-X.Y.Z.zip`，以及 `Clawdbot-X.Y.Z.dSYM.zip`（如果生成了的话）。
- [ ] 提交更新后的 `appcast.xml` 并推送（Sparkle 馈送来自 main 分支）。
- [ ] 在一个干净的临时目录中（没有 `package.json`），运行 `npx -y clawdbot@X.Y.Z send --help` 以确认安装/CLI 入口点正常工作。
- [ ] 宣布/分享发布说明。

## 插件发布范围（npm）

我们仅在 `@clawdbot/*` 范围下发布 **已有的 npm 插件**。那些未在 npm 上的内置插件将保持 **仅磁盘树形式**（仍会包含在 `extensions/**` 中）。

获取插件列表的流程：
1) 运行 `npm search @clawdbot --json` 并记录包名。
2) 与 `extensions/*/package.json` 中的名称进行比较。
3) 仅发布 **交集部分**（即已存在于 npm 上的插件）。

当前已发布的 npm 插件列表（按需更新）：
- @clawdbot/bluebubbles
- @clawdbot/diagnostics-otel
- @clawdbot/discord
- @clawdbot/lobster
- @clawdbot/matrix
- @clawdbot/msteams
- @clawdbot/nextcloud-talk
- @clawdbot/nostr
- @clawdbot/voice-call
- @clawdbot/zalo
- @clawdbot/zalouser

发布说明中还必须指出 **新增的可选内置插件**，这些插件 **默认未启用**（例如：`tlon`）。