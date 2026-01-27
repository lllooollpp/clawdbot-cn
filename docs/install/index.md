---
summary: "Install Clawdbot (recommended installer, global install, or from source)"
read_when:
  - Installing Clawdbot
  - You want to install from GitHub
---

# 安装

除非你有特殊的原因，否则请使用安装程序。它会设置 CLI 并运行入门流程。

## 快速安装（推荐）
bash
curl -fsSL https://clawd.bot/install.sh | bash
``````
Windows（PowerShell）：```powershell
iwr -useb https://clawd.bot/install.ps1 | iex
```
下一步（如果跳过了引导流程）：
bash
clawdbot onboard --install-daemon
``````
## 系统要求

- **Node >=22**
- macOS、Linux 或通过 WSL2 的 Windows
- 如果您从源代码构建，请使用 `pnpm`

## 选择您的安装路径

### 1) 安装脚本（推荐）

通过 npm 全局安装 `clawdbot` 并运行初始设置。```bash
curl -fsSL https://clawd.bot/install.sh | bash
```
安装程序标志：
bash  
curl -fsSL https://clawd.bot/install.sh | bash -s -- --help```
详情：[安装程序内部](/install/installer)。

非交互式（跳过引导）：```bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --no-onboard
```
### 2) 全局安装（手动）

如果你已经安装了 Node：
bash
npm install -g clawdbot@latest
``````
如果你已全局安装了 libvips（在 macOS 上通常通过 Homebrew 安装），而 `sharp` 安装失败，请强制使用预编译二进制文件：```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g clawdbot@latest
```
如果看到 `sharp: 请将 node-gyp 添加到你的依赖中`，可以安装构建工具（macOS：Xcode CLT + `npm install -g node-gyp`），或者使用上面的 `SHARP_IGNORE_GLOBAL_LIBVIPS=1` 解决方法来跳过原生构建。

或者：
bash
pnpm add -g clawdbot@latest
``````
然后：```bash
clawdbot onboard --install-daemon
```
### 3) 从源代码（贡献者/开发者）
bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm ui:build # 首次运行时会自动安装 UI 依赖
pnpm build
clawdbot onboard --install-daemon
``````
提示：如果你还没有全局安装，可以通过 `pnpm clawdbot ...` 运行仓库命令。

### 4）其他安装方式

- Docker: [Docker](/install/docker)
- Nix: [Nix](/install/nix)
- Ansible: [Ansible](/install/ansible)
- Bun（仅 CLI）: [Bun](/install/bun)

## 安装后操作

- 运行引导流程：`clawdbot onboard --install-daemon`
- 快速检查：`clawdbot doctor`
- 检查网关状态：`clawdbot status` + `clawdbot health`
- 打开仪表盘：`clawdbot dashboard`

## 安装方式：npm 与 git（安装器）

安装器支持两种方式：

- `npm`（默认）：`npm install -g clawdbot@latest`
- `git`：从 GitHub 克隆/构建并从源代码目录运行
### CLI 标志```bash
# Explicit npm
curl -fsSL https://clawd.bot/install.sh | bash -s -- --install-method npm

# Install from GitHub (source checkout)
curl -fsSL https://clawd.bot/install.sh | bash -s -- --install-method git
```
通用选项：

- `--install-method npm|git`
- `--git-dir <路径>`（默认：`~/clawdbot`）
- `--no-git-update`（在使用现有代码库时跳过 `git pull`）
- `--no-prompt`（禁用提示；在 CI/自动化中必需）
- `--dry-run`（仅输出将执行的操作；不进行任何更改）
- `--no-onboard`（跳过初始化设置）

### 环境变量

等效的环境变量（适用于自动化）：

- `CLAWDBOT_INSTALL_METHOD=git|npm`
- `CLAWDBOT_GIT_DIR=...`
- `CLAWDBOT_GIT_UPDATE=0|1`
- `CLAWDBOT_NO_PROMPT=1`
- `CLAWDBOT_DRY_RUN=1`
- `CLAWDBOT_NO_ONBOARD=1`
- `SHARP_IGNORE_GLOBAL_LIBVIPS=0|1`（默认：`1`；避免 `sharp` 使用系统中的 libvips）
bash
node -v
npm -v
npm prefix -g
echo "$PATH"
``````
如果 `$(npm prefix -g)/bin`（macOS/Linux）或 `$(npm prefix -g)`（Windows）**不在** `echo "$PATH"` 中，你的 shell 就无法找到全局的 npm 二进制文件（包括 `clawdbot`）。

修复方法：将其添加到你的 shell 启动文件中（zsh：`~/.zshrc`，bash：`~/.bashrc`）：```bash
# macOS / Linux
export PATH="$(npm prefix -g)/bin:$PATH"
```
在 Windows 上，将 `npm prefix -g` 的输出添加到你的 PATH 环境变量中。

然后打开一个新的终端（或在 zsh 中使用 `rehash`，在 bash 中使用 `hash -r`）。

## 更新 / 卸载

- 更新：[更新](/install/updating)
- 卸载：[卸载](/install/uninstall)