# Mijia Control SOP (Standard Operating Procedure)

该文档详细描述了 AI 代理应如何利用 `mijiaAPI` 处理复杂的智能家居控制逻辑。

## 重要：路径约束 (Pathing Rules)
- **绝对路径优先**：本技能包可能被放置在任意目录下（如 `.claude/skills/` 或 `.cursor/skills/`）。
- **执行前定位**：AI 代理在调用脚本前，**必须**先获取 `SKILL.md` 所在的绝对路径（记为 `SKILL_ROOT`）。
- **脚本调用格式**：始终使用 `python <SKILL_ROOT>/scripts/<script_name>.py` 格式执行。

## 1. 环境自检与 CLI 安装 (Self-Check & CLI Installation)
- **首先检查环境**：尝试运行 `<SKILL_ROOT>/scripts/setup_env.py`。
- **缺失安装 (Critical)**：
    - 若 `package_installed` 为 `false` 或 `cli_available` 为 `false`：
    - 引导用户运行：“环境尚未就绪。请运行：`python <SKILL_ROOT>/scripts/setup_env.py --install`。”
- **认证失效 (The Login Protocol)**：
    - 若 `auth_exists` 为 `false`：
    - 代理 **必须** 引导用户手动登录：“检测到未登录，请在终端运行：`mijiaAPI -l`。扫码完成后告知我即可。”

## 2. 核心操作规范 (Core Operations)
- **获取快照**：始终由 `scripts/list_devices.py` 开始以获取最新的 `did` 和 `online` 状态。
- **模糊匹配逻辑**：若用户指令不明确（如“开灯”但有多个灯），代理应主动列出设备名供用户选择。
- **CLI 优先策略**：为了保证操作的可追溯性和隔离性，代理应优先调用系统生成的 `mijiaAPI` 命令，或通过 `scripts/control_device.py` 包装器执行。

## 3. 设备识别与参考
- 内部参考：`reference/device_catalogs.md` 存储了常见型号的属性映射。
- 动态查询：若遇到未知型号，运行 `mijiaAPI --get_device_info <MODEL>`。

## 4. 安全约束
- 代理在执行诸如开锁、修改安防设置等高风险动作前，**必须**获得用户的明确肯首。
- 严禁在对话中输出 `auth.json` 中的任何敏感访问令牌。
    - 若用户说“开灯”，但列表里有“客厅灯”和“餐厅灯”，必须询问具体哪一个。
    - 允许根据 `online` 状态过滤。如果一个灯离线而另一个在线，可以优先操作在线的并告知用户。

## 2. 操作执行规范
- **原子化执行**：每个指令应尽量拆解为单步操作。
- **CLI 优先**：虽然可以通过 Python 代码库直接调用，但为了执行的隔离性和日志记录，建议通过 `scripts/` 下的封装脚本或直接调用 `mijiaAPI` 的命令行接口。
    - 设置属性：`python -m mijiaAPI set --dev_name "名称" --prop_name "属性" --value "值"`
    - 获取属性：`python -m mijiaAPI get --dev_name "名称" --prop_name "属性"`

## 3. 型号适配 (Spec Mapping)
- 不同的设备型号（model）使用不同的 `siid` 和 `piid`。
- 如果不确定属性名，指导 Claude 运行 `python -m mijiaAPI --get_device_info "model_name"` 来动态获取最新的定义，并保存在 `reference/` 中以便后续复用。

## 4. 常见问题处理
- **登录失效**：返回结果中包含 `LoginError` 时，引导用户执行交互式登录命令 `python -m mijiaAPI -l`。
- **超时**：米家服务器有时响应较慢，若遇到超时错误，重试一次。若依然失败，告知用户服务器繁忙。
- **不支持的操作**：如果设备不支持某项功能（如给开关调色温），应准确解释该硬件限制。
