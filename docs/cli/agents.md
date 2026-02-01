---
summary: "CLI reference for `clawdbot agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
---

# `clawdbot agents`

管理独立的代理（工作区 + 认证 + 路由）。

相关：
- 多代理路由：[多代理路由](/concepts/multi-agent.md)
- 代理工作区：[代理工作区](/concepts/agent-workspace.md)

## 示例
bash
clawdbot agents list
clawdbot agents add work --workspace ~/clawd-work
clawdbot agents set-identity --workspace ~/clawd --from-identity
clawdbot agents set-identity --agent main --avatar avatars/clawd.png
clawdbot agents delete work
```
## 身份文件

每个代理工作区可以在工作区根目录包含一个 `IDENTITY.md` 文件：
- 示例路径：`~/clawd/IDENTITY.md`
- `set-identity --from-identity` 会从工作区根目录读取（或使用显式的 `--identity-file` 参数）

头像路径相对于工作区根目录进行解析。

## 设置身份

`set-identity` 会将字段写入 `agents.list[].identity` 中：
- `name`
- `theme`
- `emoji`
- `avatar`（工作区相对路径、http(s) URL 或数据 URI）

从 `IDENTITY.md` 加载：
```bash
clawdbot agents set-identity --workspace ~/clawd --from-identity
```
```md
"显式覆盖字段：
bash
clawdbot agents set-identity --agent main --name "Clawd" --emoji "🦞" --avatar avatars/clawd.png
"
```
配置示例：
```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "Clawd",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/clawd.png"
        }
      }
    ]
  }
}
```

```