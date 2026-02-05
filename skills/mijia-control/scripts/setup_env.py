import subprocess
import sys
import json
import shutil
from pathlib import Path

def check_env():
    results = {
        "venv_exists": False,
        "package_installed": False,
        "cli_available": False,
        "auth_exists": False,
        "python_path": sys.executable
    }
    
    # 1. 检查虚拟环境
    python_executable = Path(sys.executable)
    results["venv_exists"] = ".venv" in python_executable.parts
    
    # 2. 检查 mijiaAPI 库是否安装
    try:
        import mijiaAPI
        results["package_installed"] = True
    except ImportError:
        results["package_installed"] = False
        
    # 3. 检查 CLI 命令是否可用
    # 除了 shutil.which，还要检查 python -m mijiaAPI 是否能运行
    results["cli_available"] = shutil.which("mijiaAPI") is not None
    if not results["cli_available"]:
        try:
            # 尝试静默运行 python -m mijiaAPI --help
            subprocess.run([sys.executable, "-m", "mijiaAPI", "--help"], 
                           capture_output=True, check=True)
            results["cli_available"] = True
        except:
            pass
    
    # 4. 检查登录状态
    auth_path = Path.home() / ".config" / "mijia-api" / "auth.json"
    results["auth_exists"] = auth_path.exists()
    
    return results

def install_dependencies():
    skill_dir = Path(__file__).resolve().parents[1]
    req_path = skill_dir / "requirements.txt"
    # 自愈逻辑：如果当前处于开发仓库中，则安装本地包；否则通过 requirements.txt (GitHub) 安装
    # 查找 pyproject.toml 或 setup.py
    root_dir = None
    for p in Path(__file__).resolve().parents:
        if (p / "pyproject.toml").exists() or (p / "setup.py").exists():
            root_dir = p
            break

    try:
        # 1. 安装 Skill 基础依赖
        if req_path.exists():
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(req_path)])
        
        # 2. 如果找到了本地根目录且不是正在开发 Skill 本身（即 root_dir 不是 skill_dir 的父目录以外的地方）
        # 这里为了彻底解耦，如果 root_dir 存在，我们优先安装本地的，方便开发调试。
        if root_dir and root_dir != skill_dir.parents[1]: # 简单判断逻辑
             subprocess.check_call([sys.executable, "-m", "pip", "install", "-e", str(root_dir)])
             return {"status": "success", "message": "Installed using local development source."}
        
        return {"status": "success", "message": "All dependencies (including core library) installed from requirements.txt"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    if "--install" in sys.argv:
        print(json.dumps(install_dependencies(), ensure_ascii=False))
    else:
        print(json.dumps(check_env(), indent=2, ensure_ascii=False))
