---
summary: "How to run tests locally (vitest) and when to use force/coverage modes"
read_when:
  - Running or fixing tests
---

# 测试

- 完整的测试套件（测试用例、实时测试、Docker）：[测试](/testing)

- `pnpm test:force`：终止任何占用默认控制端口的残留网关进程，然后运行完整的 Vitest 测试套件，并使用隔离的网关端口，以避免服务器测试与正在运行的实例发生冲突。当之前的网关运行占用了端口 18789 时使用此命令。
- `pnpm test:coverage`：使用 V8 覆盖率运行 Vitest。全局阈值为 70% 的行/分支/函数/语句覆盖率。覆盖范围排除了集成密集型入口点（CLI 配置、网关/Telegram 桥接、webchat 静态服务器），以将目标集中在可进行单元测试的逻辑上。
- `pnpm test:e2e`：运行网关的端到端烟雾测试（多实例 WS/HTTP/node 配对）。
- `pnpm test:live`：运行提供者实时测试（minimax/zai）。需要 API 密钥和 `LIVE=1`（或提供者特定的 `*_LIVE_TEST=1`）以取消跳过测试。

## 模型延迟基准测试（本地密钥）

脚本：[`scripts/bench-model.ts`](https://github.com/clawdbot/clawdbot/blob/main/scripts/bench-model.ts)

用法：
- `source ~/.profile && pnpm tsx scripts/bench-model.ts --runs 10`
- 可选环境变量：`MINIMAX_API_KEY`, `MINIMAX_BASE_URL`, `MINIMAX_MODEL`, `ANTHROPIC_API_KEY`
- 默认提示词： “用一个单词回复：ok。不要标点或额外文本。”

最近一次运行（2025-12-31，20 次运行）：
- minimax 中位数 1279ms（最小 1114，最大 2431）
- opus 中位数 2454ms（最小 1224，最大 3170）```
此脚本通过伪终端驱动交互式向导，验证配置/工作区/会话文件，然后启动网关并运行 `clawdbot health`。

## QR码导入烟雾测试（Docker）

确保在 Docker 中 `qrcode-terminal` 能在 Node 22+ 环境下正常加载：```bash
pnpm test:docker:qr
```
