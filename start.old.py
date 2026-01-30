import os
import subprocess
import sys
import time
import argparse
import webbrowser

PORT = 18789

def run_command(command, description, capture=False):
    print(f"正在执行: {description}...")
    try:
        if capture:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            return result.stdout
        else:
            subprocess.run(command, shell=True, check=True)
            return True
    except subprocess.CalledProcessError as e:
        print(f"执行失败: {description}. 错误码: {e.returncode}")
        if capture:
            return None
        return False

def cleanup_port(port):
    print(f"正在检查端口 {port}...")
    try:
        # Find PIDs using the port (Windows specific)
        cmd = f"netstat -ano | findstr :{port}"
        output = subprocess.check_output(cmd, shell=True).decode()
        pids = set()
        for line in output.strip().split('\n'):
            parts = line.split()
            if len(parts) > 4:
                pid = parts[-1]
                if pid != '0':
                    pids.add(pid)
        
        if pids:
            print(f"检测到端口 {port} 被以下进程占用: {', '.join(pids)}")
            for pid in pids:
                print(f"正在清理进程 {pid}...")
                subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
            time.sleep(1)
            print(f"端口 {port} 已清理。")
        else:
            print(f"端口 {port} 未被占用。")
    except subprocess.CalledProcessError:
        print(f"端口 {port} 是干净的。")

def start_debug():
    print("\n=== 进入开发调试模式 (Dev Mode) ===")
    print("特性: 无需等待编译 (TSX 直接运行), 代码改动即时生效, 全量详细日志。")
    
    cleanup_port(PORT)
    
    # 强制全量日志输出到控制台
    os.environ["CLAWDBOT_LOG"] = "debug"
    os.environ["DEBUG"] = "clawdbot:*"
    os.environ["CLAWDBOT_RUNNER_LOG"] = "1"
    os.environ["CLAWDBOT_CONSOLE_LEVEL"] = "debug"
    os.environ["CLAWDBOT_CONSOLE_STYLE"] = "pretty"
    
    dashboard_url = f"http://127.0.0.1:{PORT}"
    print(f"\n[启动] 正在以极速模式启动网关...")
    print(f"👉 监控面板: {dashboard_url}")
    
    try:
        webbrowser.open(dashboard_url)
    except:
        pass

    # 使用 npx tsx 直接运行源码入口 src/entry.ts
    # 这就是真正的 "不需要 build" 模式，绕过所有 dist 编译步骤
    cmd = "npx tsx src/entry.ts gateway run"
    
    try:
        # shell=True 确保在 Windows 下正常运行
        subprocess.run(cmd, shell=True)
    except KeyboardInterrupt:
        print("\n[退出] 调试服务已停止。")

def start_build():
    print("\n=== 进入构建模式 (Build Mode) ===")
    print("特性: 全量编译, 优化运行速度, 适合生产环境。")
    
    cleanup_port(PORT)
    
    # 1. 后端构建
    if not run_command("pnpm build", "全量编译后端代码 (TypeScript)"):
        sys.exit(1)
        
    # 2. 前端构建
    if not run_command("pnpm ui:build", "构建前端中文界面 (Vite)"):
        sys.exit(1)
        
    dashboard_url = f"http://127.0.0.1:{PORT}"
    print(f"\n[成功] 构建完成，准备启动。")
    print(f"👉 请访问主面板: {dashboard_url}")
    
    try:
        webbrowser.open(dashboard_url)
    except:
        pass
    
    # 运行编译后的产物
    # entry.js 是 bin 入口，也可以直接运行 CLI
    subprocess.run("node dist/entry.js gateway run --force", shell=True)

def main():
    parser = argparse.ArgumentParser(description="Clawdbot 统一启动脚本")
    parser.add_argument("--mode", choices=["debug", "build"], default="build", 
                        help="运行模式: debug (开发/热重载) 或 build (编译/生产)")
    args = parser.parse_args()

    print("=== Clawdbot 助手启动器 ===")
    
    if args.mode == "debug":
        start_debug()
    else:
        start_build()

if __name__ == "__main__":
    main()
