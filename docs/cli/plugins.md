---
summary: "CLI reference for `clawdbot plugins` (list, install, enable/disable, doctor)"
read_when:
  - You want to install or manage in-process Gateway plugins
  - You want to debug plugin load failures
---

# `clawdbot 插件`

管理网关插件/扩展（在进程中加载）。

相关：
- 插件系统：[插件](/plugin)
- 插件清单 + 模式：[插件清单](/plugins/manifest)
- 安全加固：[安全](/gateway/security)

## 命令
bash
clawdbot plugins list
clawdbot plugins info <id>
clawdbot plugins enable <id>
clawdbot plugins disable <id>
clawdbot plugins doctor
clawdbot plugins update <id>
clawdbot plugins update --all``````
Bundled plugins ship with Clawdbot but start disabled. Use `plugins enable` to
activate them.

所有插件必须随 Clawdbot 一起提供一个 `clawdbot.plugin.json` 文件，并包含内联 JSON Schema（`configSchema`，即使为空）。缺少或无效的清单文件或模式会导致插件无法加载，并导致配置验证失败。

### 安装```bash
clawdbot plugins install <path-or-spec>
```
安全提示：将插件安装视为运行代码。建议使用固定版本。

支持的存档格式：`.zip`、`.tgz`、`.tar.gz`、`.tar`。

使用 `--link` 可避免复制本地目录（会添加到 `plugins.load.paths` 中）：
bash
clawdbot plugins install -l ./my-plugin


### 更新
```bash
clawdbot plugins update <id>
clawdbot plugins update --all
clawdbot plugins update <id> --dry-run
``````
"Updates are applicable only to plugins installed via npm (recorded in `plugins.installs`)."