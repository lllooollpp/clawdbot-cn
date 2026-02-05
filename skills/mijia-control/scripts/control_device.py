import sys
import argparse
import json
from pathlib import Path

# 不再依赖本地相对路径，而是依赖 pip 安装的全局包或虚拟环境包
def main():
    parser = argparse.ArgumentParser(description="Mijia Control Script for Claude Skill")
    parser.add_argument("--action", choices=["get", "set"], required=True)
    parser.add_argument("--did", help="Device DID")
    parser.add_argument("--name", help="Device Name")
    parser.add_argument("--prop", required=True, help="Property Name")
    parser.add_argument("--value", help="Value to set (for action=set)")

    args = parser.parse_args()

    try:
        from mijiaAPI import mijiaAPI, mijiaDevice
        api = mijiaAPI()
        
        # 优先使用 DID
        device = mijiaDevice(api, did=args.did, dev_name=args.name)
        
        if args.action == "get":
            val = device.get(args.prop)
            unit = device.prop_list[args.prop].unit if args.prop in device.prop_list else ""
            print(json.dumps({"status": "success", "result": val, "unit": unit}, ensure_ascii=False))
        
        elif args.action == "set":
            # 自动处理 Boolean 转换
            target_val = args.value
            if args.value.lower() == "true": target_val = True
            elif args.value.lower() == "false": target_val = False
            elif args.value.replace('.', '', 1).isdigit(): target_val = float(args.value) if '.' in args.value else int(args.value)
            
            device.set(args.prop, target_val)
            print(json.dumps({"status": "success", "message": f"Set {args.prop} to {target_val}"}, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False))

if __name__ == "__main__":
    main()
