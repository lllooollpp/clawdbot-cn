import sys
import json
from pathlib import Path

# 不再依赖本地相对路径，而是依赖 pip 安装的全局包或虚拟环境包
try:
    from mijiaAPI import mijiaAPI

    api = mijiaAPI()
    if not api.available:
        print(json.dumps({"error": "AUTH_REQUIRED", "message": "Login token expired or missing."}, ensure_ascii=False))
        sys.exit(0)

    devices = api.get_devices_list() + api.get_shared_devices_list()
    
    # 转换为 AI 更容易理解的精简结构
    snapshot = []
    for d in devices:
        snapshot.append({
            "name": d.get("name"),
            "did": d.get("did"),
            "model": d.get("model"),
            "online": d.get("isOnline"),
            "room": d.get("roomName", "未指定房间")
        })
    
    print(json.dumps(snapshot, indent=2, ensure_ascii=False))

except Exception as e:
    print(json.dumps({"error": "EXECUTION_ERROR", "message": str(e)}, ensure_ascii=False))
