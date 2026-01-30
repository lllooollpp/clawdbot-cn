---
summary: Node + tsx "__name is not a function" crash notes and workarounds
read_when:
  - Debugging Node-only dev scripts or watch mode failures
  - Investigating tsx/esbuild loader crashes in Clawdbot
---

"# Node + tsx "name is not a function" 错误崩溃

## 摘要
使用 Node 运行 Clawdbot 时，通过 `tsx` 启动失败，报错信息为：
[clawdbot] Failed to start CLI: TypeError: __name is not a function
    at createSubsystemLogger (.../src/logging/subsystem.ts:203:25)
    at .../src/agents/auth-profiles/constants.ts:25:20
```
这在将开发脚本从 Bun 切换到 `tsx`（提交 `2871657e`，2026-01-06）之后开始出现。同样的运行路径在 Bun 上是可行的。

## 环境
- Node: v25.x（在 v25.3.0 上观察到）
- tsx: 4.21.0
- 操作系统: macOS（在其他运行 Node 25 的平台上也可能复现）
bash
# 在仓库根目录
node --version
pnpm install
node --import tsx src/entry.ts status``````
## 仓库中的最小可复现示例```bash
node --import tsx scripts/repro/tsx-name-repro.ts
```
## Node 版本检查
- Node 25.3.0：失败
- Node 22.22.0（Homebrew `node@22`）：失败
- Node 24：尚未在此处安装；需要验证

## 备注 / 假设
- `tsx` 使用 esbuild 来转换 TS/ESM。esbuild 的 `keepNames` 会生成一个 `__name` 辅助函数，并将函数定义包装在 `__name(...)` 中。
- 崩溃表明 `__name` 在运行时存在，但不是一个函数，这意味着在 Node 25 的加载器路径中，该模块的辅助函数缺失或被覆盖。
- 在其他使用 esbuild 的项目中，也出现过类似的 `__name` 辅助函数缺失或被重写的报告。

## 回退历史
- `2871657e`（2026-01-06）：脚本从 Bun 改为 tsx，以使 Bun 成为可选。
- 在此之前（Bun 路径），`clawdbot status` 和 `gateway:watch` 都可以正常运行。

## 解决方案
- 使用 Bun 运行开发脚本（目前的临时回退方案）。
- 使用 Node + tsc watch，然后运行编译后的输出：
bash
pnpm exec tsc --watch --preserveWatchOutput
node --watch dist/entry.js status
``````  ```
- 本地确认：`pnpm exec tsc -p tsconfig.json` + `node dist/entry.js status` 在 Node 25 上可以正常运行。
- 如果可能的话，在 TS 加载器中禁用 esbuild 的 keepNames（防止插入 `__name` 辅助函数）；目前 `tsx` 尚未暴露此选项。
- 使用 `tsx` 测试 Node LTS（22/24），以确认该问题是否仅限于 Node 25。

## 参考资料
- https://opennext.js.org/cloudflare/howtos/keep_names
- https://esbuild.github.io/api/#keep-names
- https://github.com/evanw/esbuild/issues/1031

## 下一步行动
- 在 Node 22/24 上复现问题，以确认是否为 Node 25 的回归问题。
- 测试 `tsx` 的 nightly 版本，或如果存在已知的回归问题，则固定到较早的版本。
- 如果在 Node LTS 上可以复现，向上游提交一个最小复现示例，并附上 `__name` 的堆栈跟踪。