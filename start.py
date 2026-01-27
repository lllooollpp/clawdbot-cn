import os
import subprocess
import sys
import time
import re

PORT = 18789

def run_command(command, description):
    print(f"正在执行: {description}...")
    try:
        # 使用 shell=True 以便支持 Windows 上的 pnpm 路径
        process = subprocess.run(command, shell=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"执行失败: {description}. 错误码: {e.returncode}")
        return False

def cleanup_port(port):
    print(f"正在检查端口 {port}...")
    try:
        # 查找占用端口的 PID
        result = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
        pids = set()
        for line in result.strip().split('\n'):
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
        else:
            print(f"端口 {port} 未被占用。")
    except subprocess.CalledProcessError:
        print(f"端口 {port} 是干净的。")

def main():
    print("=== Clawdbot 启动脚本 ===")
    
    # 1. 清理端口
    cleanup_port(PORT)
    
    # 2. 安装依赖并编译后端 (确保 dist 目录最新)
    if not run_command("pnpm build", "全量编译后端代码"):
        sys.exit(1)
        
    # 3. 编译前端 UI (确保已汉化的界面生效)
    if not run_command("pnpm ui:build", "构建前端中文界面"):
        sys.exit(1)
        
    # 4. 启动网关服务
    dashboard_url = f"http://127.0.0.1:{PORT}"
    print(f"\n[成功] 所有准备工作已就绪。")
    print(f"👉 请访问主面板: {dashboard_url}")
    print(f"⚠️ 注意: 不要访问 18791 端口，那是后台浏览器服务。")
    
    # 自动打开浏览器
    try:
        import webbrowser
        webbrowser.open(dashboard_url)
    except:
        pass
    
    # 启动网关
    subprocess.run("pnpm dev gateway run --force", shell=True)

if __name__ == "__main__":
    main()
