---
summary: "How the installer scripts work (install.sh + install-cli.sh), flags, and automation"
read_when:
  - You want to understand `clawd.bot/install.sh`
  - You want to automate installs (CI / headless)
  - You want to install from a GitHub checkout
---

# 安装程序内部

Clawdbot 提供两个安装脚本（从 `clawd.bot` 提供）：

- `https://clawd.bot/install.sh` — “推荐”的安装程序（默认进行全局 npm 安装；也可以从 GitHub 代码库安装）
- `https://clawd.bot/install-cli.sh` — 非 root 友好的 CLI 安装程序（安装到带有自己 Node 的前缀路径中）
- `https://clawd.bot/install.ps1` — Windows PowerShell 安装程序（默认使用 npm；可选使用 git 安装）

要查看当前的标志/行为，请运行：
bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --help
``````
Windows（PowerShell）帮助：```powershell
& ([scriptblock]::Create((iwr -useb https://clawd.bot/install.ps1))) -?
```
如果安装程序已完成但在新终端中找不到 `clawdbot`，通常是因为 Node.js/npm 的 PATH 问题。请参见：[安装](/install#nodejs--npm-path-sanity)。

## install.sh（推荐）

它的大致功能如下：

- 检测操作系统（macOS / Linux / WSL）。
- 确保安装了 Node.js **22+**（macOS 通过 Homebrew；Linux 通过 NodeSource）。
- 选择安装方式：
  - `npm`（默认）：`npm install -g clawdbot@latest`
  - `git`：克隆/构建源代码并安装一个包装脚本
- 在 Linux 上：在需要时切换 npm 的 prefix 到 `~/.npm-global`，以避免全局 npm 权限错误。
- 如果是升级现有安装：会运行 `clawdbot doctor --non-interactive`（尽最大努力）。
- 对于 git 安装：在安装/更新后会运行 `clawdbot doctor --non-interactive`（尽最大努力）。
- 默认情况下通过设置 `SHARP_IGNORE_GLOBAL_LIBVIPS=1` 来缓解 `sharp` 原生安装的陷阱（避免使用系统 libvips 进行编译）。

如果你 **希望** `sharp` 链接全局安装的 libvips（或者你在进行调试），请设置：
bash
SHARP_IGNORE_GLOBAL_LIBVIPS=0 curl -fsSL https://clawd.bot/install.sh | bash
``````
### 可发现性 / “git install” 提示

如果你在 **已经处于 Clawdbot 源代码检出目录中**（通过 `package.json` 和 `pnpm-workspace.yaml` 进行检测），运行安装程序时会提示：

- 更新并使用此检出（`git`）
- 或迁移到全局 npm 安装（`npm`）

在非交互式环境中（没有 TTY / `--no-prompt`），你必须传递 `--install-method git|npm`（或设置 `CLAWDBOT_INSTALL_METHOD`），否则脚本将退出并返回代码 `2`。

### 为什么需要 Git

`--install-method git` 路径需要 Git（克隆 / 拉取）。

对于 `npm` 安装，Git *通常* 不需要，但在某些环境中仍可能需要用到它（例如当某个包或依赖项通过 Git URL 获取时）。目前安装程序会确保 Git 的存在，以避免在新系统上出现 `spawn git ENOENT` 的意外错误。

### 为什么在新的 Linux 系统上 npm 会报 `EACCES` 错误

在一些 Linux 系统配置中（尤其是通过系统包管理器或 NodeSource 安装 Node 之后），npm 的全局前缀指向一个由 root 拥有的目录。此时运行 `npm install -g ...` 会失败，并报出 `EACCES` / `mkdir` 权限错误。

`install.sh` 脚本通过将前缀切换为以下路径来缓解这个问题：

- `~/.npm-global`（如果存在，则将其添加到 `~/.bashrc` 或 `~/.zshrc` 的 `PATH` 中）```bash
curl -fsSL https://clawd.bot/install-cli.sh | bash -s -- --help
```
## install.ps1 (Windows PowerShell)

它所做的（高层次）：

- 确保安装 Node.js **22+**（通过 winget/Chocolatey/Scoop 或手动安装）。
- 选择安装方式：
  - `npm`（默认）：`npm install -g clawdbot@latest`
  - `git`：克隆/构建源代码并安装一个包装脚本
- 在升级和 git 安装时运行 `clawdbot doctor --non-interactive`（尽力而为）。

示例：
powershell
iwr -useb https://clawd.bot/install.ps1 | iex
``````
```md
"iwr -useb https://clawd.bot/install.ps1 | iex -InstallMethod git"```
```md
iwr -useb https://clawd.bot/install.ps1 | iex -InstallMethod git -GitDir "C:\\clawdbot"```
环境变量：

- `CLAWDBOT_INSTALL_METHOD=git|npm`
- `CLAWDBOT_GIT_DIR=...`

Git 要求：

如果选择 `-InstallMethod git` 并且系统中没有安装 Git，安装程序将打印 Git for Windows 的链接（`https://git-scm.com/download/win`）并退出。

常见 Windows 问题：

- **npm 错误 spawn git / ENOENT**：安装 Git for Windows，然后重新打开 PowerShell，再重新运行安装程序。
- **"clawdbot" 未被识别**：您的 npm 全局 bin 文件夹未被添加到 PATH 中。大多数系统使用 `%AppData%\\npm`。您也可以运行 `npm config get prefix`，并将 `\\bin` 添加到 PATH 中，然后重新打开 PowerShell。