---
summary: "Node.js + npm install sanity: versions, PATH, and global installs"
read_when:
  - You installed Clawdbot but `clawdbot` is “command not found”
  - You’re setting up Node.js/npm on a new machine
  - `npm install -g ...` fails with permissions or PATH issues
---

# Node.js + npm（PATH 检查）

Clawdbot 的运行时基础是 **Node 22+**。

如果你可以运行 `npm install -g clawdbot@latest`，但之后看到 `clawdbot: command not found`，这几乎总是由于 **PATH** 问题：npm 安装全局二进制文件的目录不在你的 shell 的 PATH 环境变量中。

## 快速排查

运行以下命令：
bash
node -v
npm -v
npm prefix -g
echo "$PATH"
``````
如果 `$(npm prefix -g)/bin`（macOS/Linux）或 `$(npm prefix -g)`（Windows）**不在** `echo "$PATH"` 中，你的 shell 将无法找到全局的 npm 二进制文件（包括 `clawdbot`）。

## 解决方法：将 npm 的全局 bin 目录添加到 PATH 中

1) 找到你的全局 npm 前缀：```bash
npm prefix -g
```
2) 将全局 npm bin 目录添加到你的 shell 启动文件中：

- zsh: `~/.zshrc`
- bash: `~/.bashrc`

示例（将路径替换为你的 `npm prefix -g` 输出）：
bash
# macOS / Linux
export PATH="/path/from/npm/prefix/bin:$PATH"
``````
然后打开一个 **新终端**（或者在 zsh 中运行 `rehash`，在 bash 中运行 `hash -r`）。

在 Windows 上，将 `npm prefix -g` 的输出添加到你的 PATH 环境变量中。

## 修复：避免使用 `sudo npm install -g` / 权限错误（Linux）

如果 `npm install -g ...` 报错 `EACCES`，请将 npm 的全局前缀切换到用户可写的目录：```bash
mkdir -p "$HOME/.npm-global"
npm config set prefix "$HOME/.npm-global"
export PATH="$HOME/.npm-global/bin:$PATH"
```
将 `export PATH=...` 这一行保存到你的 shell 启动文件中。

## 推荐的 Node 安装方式

如果以以下方式安装 Node/npm，你将会遇到最少的意外情况：

- 保持 Node 的更新（22+）
- 使全局的 npm bin 目录稳定，并在新 shell 中出现在 PATH 环境变量中

常见的选择包括：

- macOS：Homebrew（`brew install node`）或版本管理器
- Linux：你偏好的版本管理器，或者由发行版支持的安装方式，该方式提供 Node 22+
- Windows：官方 Node 安装程序、`winget` 或 Windows 上的 Node 版本管理器

如果你使用版本管理器（如 nvm、fnm、asdf 等），请确保在你日常使用的 shell（如 zsh 或 bash）中初始化它，这样当你运行安装程序时，它设置的 PATH 才会生效。