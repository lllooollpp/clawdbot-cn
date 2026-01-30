import os
import subprocess
import sys
import time
import argparse
import webbrowser
import shutil

PORT = 18789

def run_command(command, description, capture=False):
    print(f"[{description}] 执行中...")
    try:
        if capture:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            return result.stdout
        else:
            subprocess.run(command, shell=True, check=True)
            return True
    except subprocess.CalledProcessError as e:
        if not capture:
            print(f"❌ [{description}] 失败. 错误码: {e.returncode}")
        return None

def install_dependencies():
    """安装项目依赖"""
    print("\n=== 1. 环境与依赖检查 ===")
    
    # Check for Node.js
    if not run_command("node -v", "检查 Node.js 环境", capture=True):
        print("❌ 未检测到 Node.js，请先安装 Node.js (建议 v18+)")
        sys.exit(1)

    # Check for pnpm
    if not run_command("pnpm -v", "检查 pnpm 工具", capture=True):
        print("⚠️ 未检测到 pnpm，尝试通过 npm 安装...")
        if not run_command("npm install -g pnpm", "安装 pnpm 全局工具"):
            print("❌ pnpm 安装失败，请手动安装: npm install -g pnpm")
            sys.exit(1)
            
    # Install dependencies
    print("📦 正在安装/更新项目依赖 (pnpm install)...")
    if not run_command("pnpm install", "安装项目依赖"):
        print("❌ 依赖安装失败，请检查网络连接或 pnpm 配置。")
        sys.exit(1)
    print("✅ 依赖就绪。")

def cleanup_port(port):
    print(f"\n=== 端口清理 ({port}) ===")
    try:
        # Windows Find PIDs
        cmd = f"netstat -ano | findstr :{port}"
        try:
            output = subprocess.check_output(cmd, shell=True).decode()
        except subprocess.CalledProcessError:
            print(f"✅ 端口 {port} 空闲。")
            return

        pids = set()
        for line in output.strip().split('\n'):
            parts = line.split()
            # TCP 0.0.0.0:18789 0.0.0.0:0 LISTENING 1234
            if len(parts) > 4:
                pid = parts[-1]
                if pid != '0':
                    pids.add(pid)
        
        if pids:
            print(f"⚠️ 端口 {port} 被占用，PID: {', '.join(pids)}")
            for pid in pids:
                print(f"🧹 正在终止进程 {pid}...")
                subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
            time.sleep(1)
            print(f"✅ 端口已释放。")
        else:
            print(f"✅ 端口 {port} 空闲。")
    except Exception as e:
        print(f"端口检查跳过: {e}")

def start_debug():
    print("\n=== 2. 启动开发模式 (Debug Mode) ===")
    print("🚀 特性: 无需等待编译 (TSX), 实时日志, 热重载")
    
    cleanup_port(PORT)
    
    # 设置详细日志环境变量
    env = os.environ.copy()
    env["CLAWDBOT_LOG"] = "debug"
    env["DEBUG"] = "clawdbot:*"
    env["CLAWDBOT_RUNNER_LOG"] = "1"
    env["CLAWDBOT_CONSOLE_LEVEL"] = "debug"
    env["CLAWDBOT_CONSOLE_STYLE"] = "pretty"
    
    dashboard_url = f"http://127.0.0.1:{PORT}"
    print(f"\n🌐 控制台地址: {dashboard_url}")
    print(f"▶️  正在启动网关 (Gateway)...")
    
    # 尝试自动打开浏览器
    try:
        webbrowser.open(dashboard_url)
    except:
        pass

    # 使用 npx tsx 直接运行源码
    cmd = "npx tsx src/entry.ts gateway run"
    
    try:
        subprocess.run(cmd, shell=True, env=env)
    except KeyboardInterrupt:
        print("\n🛑 服务已停止。")

def start_build():
    print("\n=== 2. 启动构建模式 (Build Mode) ===")
    print("🏗️  特性: 全量编译 (TSC/Vite), 生产运行环境")
    
    cleanup_port(PORT)
    
    # 1. 后端构建
    if not run_command("pnpm build", "编译后端代码 (TypeScript)"):
        sys.exit(1)
        
    # 2. 前端构建
    if not run_command("pnpm ui:build", "编译前端界面 (UI)"):
        sys.exit(1)
    
    dashboard_url = f"http://127.0.0.1:{PORT}"
    print(f"\n🎉 构建成功!")
    print(f"🌐 控制台地址: {dashboard_url}")
    
    try:
        webbrowser.open(dashboard_url)
    except:
        pass
    
    # 运行编译后的产物
    print(f"▶️  正在启动...")
    cmd = "node dist/entry.js gateway run --force"
    subprocess.run(cmd, shell=True)

def main():
    parser = argparse.ArgumentParser(description="Clawdbot 一键启动脚本")
    # 默认为 debug 模式，更符合“快速启动”的需求
    parser.add_argument("--mode", choices=["debug", "build"], default="debug", 
                        help="运行模式: debug(开发,默认) / build(生产)")
    parser.add_argument("--skip-install", action="store_true", help="跳过依赖安装")
    args = parser.parse_args()

    print("=========================================")
    print("   Clawdbot 智能助手 - 快速启动脚本")
    print("=========================================")

    # 1. 自动安装依赖
    if not args.skip_install:
        install_dependencies()
    else:
        print("⏩ 跳过依赖安装。")

    # 2. 根据模式启动
    if args.mode == "debug":
        start_debug()
    else:
        start_build()

if __name__ == "__main__":
    main()
