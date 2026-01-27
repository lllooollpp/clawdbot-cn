import os
import subprocess
import paramiko
from scp import SCPClient
from pathlib import Path

# 配置信息
HOST = '101.35.228.254'
USER = 'root'
PASS = 'his.123456'
REMOTE_DIR = '/root/clawdbot-docs'
IMAGE_NAME = 'clawdbot-docs'
IMAGE_TAR = 'clawdbot-docs.tar'
PROJECT_ROOT = Path(__file__).resolve().parents[1]

def run_local_command(cmd, cwd=None):
    print(f'正在执行本地命令: {cmd}')
    result = subprocess.run(cmd, shell=True, cwd=cwd, text=True)
    if result.returncode != 0:
        raise RuntimeError(f'本地命令执行失败: {cmd}')

def deploy():
    os.chdir(PROJECT_ROOT)
    
    try:
        # 1. 本地构建 Docker 镜像
        print('\n--- 步骤 1: 本地构建 Docker 镜像 ---')
        run_local_command(f'docker build -t {IMAGE_NAME} .')

        # 2. 将镜像保存为 tar 包
        print('\n--- 步骤 2: 将镜像保存为 tar 包 ---')
        if os.path.exists(IMAGE_TAR):
            os.remove(IMAGE_TAR)
        run_local_command(f'docker save {IMAGE_NAME} -o {IMAGE_TAR}')

        # 3. 连接 SSH 并推送到服务器
        print(f'\n--- 步骤 3: 连接服务器 {HOST} 并上传镜像 ---')
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(HOST, username=USER, password=PASS, timeout=60)

        # 确保远程目录存在并上传
        ssh.exec_command(f'mkdir -p {REMOTE_DIR}')
        with SCPClient(ssh.get_transport()) as scp:
            scp.put(IMAGE_TAR, remote_path=f'{REMOTE_DIR}/{IMAGE_TAR}')

        # 4. 远程加载镜像并运行
        print('\n--- 步骤 4: 远程加载并启动容器 ---')
        commands = [
            f'cd {REMOTE_DIR}',
            f'docker load -i {IMAGE_TAR}',
            f'docker stop {IMAGE_NAME} || true',
            f'docker rm {IMAGE_NAME} || true',
            f'docker run -d --name {IMAGE_NAME} -p 80:80 {IMAGE_NAME}',
            f'rm {IMAGE_TAR}'
        ]
        
        full_command = ' && '.join(commands)
        stdin, stdout, stderr = ssh.exec_command(full_command)
        
        for line in stdout:
            print(f'[OUT] {line.strip()}')
        for line in stderr:
            if line.strip():
                print(f'[ERR] {line.strip()}')

        print('\n🚀 部署完成! 镜像已在本地构建并成功同步至服务器。')

    except Exception as e:
        print(f'\n❌ 部署失败: {e}')
    finally:
        if 'ssh' in locals() and ssh:
            ssh.close()
        # 清理本地生成的 tar 包
        if os.path.exists(IMAGE_TAR):
            try:
                os.remove(IMAGE_TAR)
            except:
                pass

if __name__ == '__main__':
    deploy()
