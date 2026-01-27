---
summary: "Bun workflow (experimental): installs and gotchas vs pnpm"
read_when:
  - You want the fastest local dev loop (bun + watch)
  - You hit Bun install/patch/lifecycle script issues
---

# Bun（实验性）

目标：使用 **Bun** 运行此仓库（可选，不推荐用于 WhatsApp/Telegram）
而不会偏离 pnpm 的工作流程。

⚠️ **不推荐用于网关运行时**（WhatsApp/Telegram 存在问题）。请在生产环境中使用 Node。

## 状态

- Bun 是一个可选的本地运行时，可用于直接运行 TypeScript（`bun run …`，`bun --watch …`）。
- `pnpm` 是默认的构建工具，仍然完全受支持（并且某些文档工具也使用它）。
- Bun 无法使用 `pnpm-lock.yaml`，并将忽略它。
sh
bun install
``````
注意：`bun.lock`/`bun.lockb` 被 git 忽略，因此无论是否进行锁文件写入，都不会引起仓库的变动。如果你想要 *不写入锁文件*：```sh
bun install --no-save
```
## 构建 / 测试（Bun）
sh
bun run build
bun run vitest run
``````
## Bun 生命周期脚本（默认被阻止）

Bun 可能会阻止依赖项的生命周期脚本，除非明确信任（`bun pm untrusted` / `bun pm trust`）。
对于此仓库，通常被阻止的脚本不需要：

- `@whiskeysockets/baileys` 的 `preinstall`：检查 Node 版本是否 >= 20（我们使用的是 Node 22+）。
- `protobufjs` 的 `postinstall`：会发出关于不兼容版本方案的警告（没有构建产物）。

如果你遇到需要这些脚本的实际运行时问题，请显式地信任它们：```sh
bun pm trust @whiskeysockets/baileys protobufjs
```
## 注意事项

- 一些脚本仍然硬编码使用了 pnpm（例如 `docs:build`、`ui:*`、`protocol:check`）。目前请通过 pnpm 运行这些脚本。