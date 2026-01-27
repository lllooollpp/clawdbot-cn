---
summary: "How Clawdbot sandboxing works: modes, scopes, workspace access, and images"
title: Sandboxing
read_when: "You want a dedicated explanation of sandboxing or need to tune agents.defaults.sandbox."
status: active
---

# 沙箱隔离

Clawdbot 可以在 **Docker 容器中运行工具**，以减少影响范围。  
这属于 **可选配置**，由 `agents.defaults.sandbox` 或 `agents.list[].sandbox` 控制。如果禁用沙箱隔离，工具将在主机上运行。  
网关始终在主机上运行；当启用沙箱时，工具执行将在隔离的沙箱中进行。

这并不是一个完美的安全边界，但它在模型做出错误操作时，能显著限制对文件系统和进程的访问。

## 哪些内容会被沙箱隔离
- 工具执行（`exec`, `read`, `write`, `edit`, `apply_patch`, `process` 等）。
- 可选的沙箱浏览器（`agents.defaults.sandbox.browser`）。
  - 默认情况下，当浏览器工具需要时，沙箱浏览器会自动启动（确保 CDP 可访问）。
    可通过 `agents.defaults.sandbox.browser.autoStart` 和 `agents.defaults.sandbox.browser.autoStartTimeoutMs` 进行配置。
  - `agents.defaults.sandbox.browser.allowHostControl` 允许沙箱会话明确地控制主机浏览器。
  - 可选的白名单限制 `target: "custom"`：`allowedControlUrls`, `allowedControlHosts`, `allowedControlPorts`。

未被沙箱隔离的内容：
- 网关进程本身。
- 任何明确允许在主机上运行的工具（例如 `tools.elevated`）。
  - **提升权限的执行在主机上运行，并绕过沙箱隔离。**
  - 如果沙箱隔离关闭，`tools.elevated` 不会影响执行（因为已经在主机上运行）。详见 [提升模式](/tools/elevated)。

## 模式
`agents.defaults.sandbox.mode` 控制 **何时** 使用沙箱隔离：
- `"off"`：不使用沙箱隔离。
- `"non-main"`：仅对 **非主会话** 进行沙箱隔离（如果你希望正常聊天在主机上运行，默认值）。
- `"all"`：每个会话都在沙箱中运行。

注意：`"non-main"` 是基于 `session.mainKey`（默认为 `"main"`）的，而不是代理 ID。  
群组/频道会话使用自己的主键，因此它们被视为非主会话，并会被沙箱隔离。

## 作用域
`agents.defaults.sandbox.scope` 控制 **创建多少个容器**：
- `"session"`（默认）：每个会话一个容器。
- `"agent"`：每个代理一个容器。
- `"shared"`：所有沙箱会话共享一个容器。

## 工作区访问
`agents.defaults.sandbox.workspaceAccess` 控制 **沙箱能看到什么**：
- `"none"`（默认）：工具能看到位于 `~/.clawdbot/sandboxes` 下的沙箱工作区。
- `"ro"`：将代理工作区以只读方式挂载到 `/agent`（禁用 `write`/`edit`/`apply_patch`）。
- `"rw"`：将代理工作区以读写方式挂载到 `/workspace`。

传入的媒体文件会被复制到当前沙箱工作区（`media/inbound/*`）。  
技能说明：`read` 工具是沙箱根目录的。当 `workspaceAccess: "none"` 时，Clawdbot 会将符合条件的技能镜像到沙箱工作区（`.../skills`），以便它们可以被读取。当使用 `"rw"` 时，工作区中的技能可以从 `/workspace/skills` 读取。

全局绑定和每个代理的绑定是 **合并** 的（而非替换）。在 `scope: "shared"` 下，每个代理的绑定会被忽略。

示例（只读源 + Docker 套接字）：
json5
{
  agents: {
    defaults: {
      sandbox: {
        docker: {
          binds: [
            "/home/user/source:/source:ro",
            "/var/run/docker.sock:/var/run/docker.sock"
          ]
        }
      }
    },
    list: [
      {
        id: "build",
        sandbox: {
          docker: {
            binds: ["/mnt/cache:/cache:rw"]
          }
        }
      }
    ]
  }
}
``````
安全注意事项：
- 绑定（binds）会绕过沙盒文件系统：它们会暴露主机路径，无论你设置什么模式（`:ro` 或 `:rw`）。
- 敏感挂载（例如 `docker.sock`、秘密文件、SSH 密钥）应设置为 `:ro`，除非绝对必要。
- 如果你只需要对工作区的只读访问，请结合 `workspaceAccess: "ro"` 使用；绑定模式是独立的。
- 了解 [沙盒 vs 工具策略 vs 提升权限](/gateway/sandbox-vs-tool-policy-vs-elevated)，以查看绑定如何与工具策略和提升权限交互。```bash
scripts/sandbox-setup.sh
```
注意：默认镜像不包含 Node。如果某个技能需要 Node（或其他运行时），请通过以下方式处理：
- 构建自定义镜像
- 或通过 `sandbox.docker.setupCommand` 安装（需要网络出站访问 + 可写根文件系统 + root 用户权限）

沙箱浏览器镜像：
bash
scripts/sandbox-browser-setup.sh
``````
默认情况下，沙盒容器以 **无网络** 的方式运行。
可以通过 `agents.defaults.sandbox.docker.network` 进行覆盖。

Docker 安装和容器化网关位于此处：
[Docker](/install/docker)

## setupCommand（一次性容器设置）
`setupCommand` 在沙盒容器创建后 **仅运行一次**（不是每次运行时都执行）。
它通过 `sh -lc` 在容器内部执行。

路径：
- 全局配置：`agents.defaults.sandbox.docker.setupCommand`
- 每个代理配置：`agents.list[].sandbox.docker.setupCommand`

常见陷阱：
- 默认的 `docker.network` 是 `"none"`（无出站网络），因此包安装会失败。
- `readOnlyRoot: true` 会阻止写入；请将 `readOnlyRoot: false` 或构建自定义镜像。
- `user` 必须是 root 才能进行包安装（省略 `user` 或设置 `user: "0:0"`）。
- 沙盒执行 **不会** 继承主机的 `process.env`。请使用 `agents.defaults.sandbox.docker.env`（或自定义镜像）来设置技能 API 密钥。

## 工具策略 + 逃生舱口
在沙盒规则之前，工具的允许/拒绝策略仍然适用。如果一个工具被全局或每个代理拒绝，沙盒不会让它重新生效。

`tools.elevated` 是一个显式的逃生舱口，它在主机上运行 `exec`。

调试：
- 使用 `clawdbot sandbox explain` 来检查生效的沙盒模式、工具策略和修复配置项。
- 有关“为什么被阻止？”的思维模型，请参阅 [沙盒 vs 工具策略 vs 提升权限](/gateway/sandbox-vs-tool-policy-vs-elevated)。
保持安全限制。

## 多代理覆盖
每个代理都可以覆盖沙盒和工具设置：
`agents.list[].sandbox` 和 `agents.list[].tools`（以及 `agents.list[].tools.sandbox.tools` 用于沙盒工具策略）。
有关优先级，请参阅 [多代理沙盒与工具](/multi-agent-sandbox-tools)。

## 最小启用示例```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        scope: "session",
        workspaceAccess: "none"
      }
    }
  }
}
```
## 相关文档
- [沙箱配置](/gateway/configuration#agentsdefaults-sandbox)
- [多智能体沙箱与工具](/multi-agent-sandbox-tools)
- [安全](/gateway/security)