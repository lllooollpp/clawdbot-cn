# Clawdbot 配置系统重构提案 (v1.1.4+)

## 1. 背景与目标

当前配置系统在长期运行中暴露了几个核心痛点：
- **平台差异性**：在 Windows 平台上，由于第三方软件（如杀毒软件、文件索引服务）锁定文件，写入配置文件时频繁出现 `EPERM` 或 `EACCES` 错误。
- **验证松散**：配置文件中存在大量遗留字段，缺乏严格的类型校验，导致排查问题困难。
- **响应式不足**：配置修改后通常需要重启网关或整个应用才能生效，无法做到无感更新。
- **代码重叠**：多个模块各自实现 `config.json` 的读写逻辑，代码维护成本高。

**重构目标：**
- **强鲁棒性**：标准化原子写入逻辑，内置指数退避重试机制，彻底解决 Windows 文件锁问题。
- **严格校验**：引入 `Zod` 进行全量架构校验，杜绝非法键值，配合 `clawdbot doctor` 自动迁移。
- **响应式更新**：通过事件总线实现配置热更新。
- **模块化**：统一配置管理引擎，支持插件动态注册配置模式。

---

## 2. 核心架构设计

### 2.1 统一存储引擎 (`AtomicStore`)
将 `device-pairing.ts` 中验证有效的原子写入逻辑提取为通用工具类。

```typescript
// 伪代码：src/infra/storage/atomic-store.ts
export class AtomicStore<T> {
  async save(data: T): Promise<void> {
    // 1. 生成临时文件
    // 2. 写入 JSON
    // 3. 执行 fs.rename (内置 5 次指数退避重试)
    // 4. EPERM 失败后兜底使用直接写入
  }
}
```

### 2.2 严格模式校验 (`Strict Schema`)
基于 `docs/refactor/strict-config.md` 的原则，不再静默丢弃未知键。

- **拒绝未知键**：所有非官方定义的键都会触发 `doctor` 警告。
- **插件模式隔离**：插件必须在 `clawdbot.plugin.json` 中定义自己的 `configSchema`。
- **动态验证**：在应用启动和配置编辑时进行实时校验。

### 2.3 配置服务声明化 (`ConfigService`)
封装一个单例服务，作为全局配置的唯一入口。

- **Get/Set 接口**：带类型的访问器。
- **OnChanged 钩子**：支持 `config.on('gateway.mode', (val) => ...)`。
- **缓存层**：内存缓存，减少磁盘 IO。

---

## 3. 实施步骤

### 阶段 1：基础工具升级 (已开始)
- [x] 在 `device-pairing.ts` 中验证重试逻辑。
- [ ] 提取 `writeJSONAtomic` 到 `src/infra/json-file.ts` 供全局使用。
- [ ] 规范化所有配置文件路径（使用 `resolveStateDir()`）。

### 2 阶段：架构迁移 (进行中)
- [ ] 引入 `Zod` 定义 `AppConfig` 的完整类型。
- [ ] 开发 `ConfigManager` 类，整合读写、校验和事件通知。
- [ ] 重构 `clawdbot doctor`，使其支持 `--fix` 直接修复架构冲突。

### 3 阶段：UI 与向导对接
- [ ] 更新 Web UI 的 `ConfigController`，使其支持根据 `config_schema.json` 动态生成表单。
- [ ] 优化 `configure wizard` 流程，在每一步完成后进行原子保存。

---

## 4. 稳定性增强 (Windows 特例处理)

重构文档特别强调对 Windows 的支持。我们将以下逻辑内置于底层 IO：

| 特性 | 方案 | 效果 |
| :--- | :--- | :--- |
| **原子性** | 临时文件 + 重命名 | 即使断电/崩溃也不会产生损坏的 `config.json` |
| **冲突重试** | 指数退避 (50ms, 100ms, 200ms, 400ms, 500ms) | 解决杀毒软件扫描期间的文件锁定 |
| **权限管理** | `fs.chmodSync` (0o600) | 保护配置文件不被其他低权限用户读取 |

---

## 5. 预期效果

1. **零崩溃**：解决所有已知的 Windows 配置文件保存导致的 `EPERM` 崩溃。
2. **易排查**：错误的配置项在启动时通过 `doctor` 清晰报错。
3. **开发友好**：新增功能只需修改 `zod-schema.ts`，类型定义自动同步到整个项目。
