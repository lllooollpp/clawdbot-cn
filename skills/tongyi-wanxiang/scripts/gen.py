#!/usr/bin/env python3
"""
通义万相 (Tongyi Wanxiang) Image Generation via DashScope API

API Docs: https://help.aliyun.com/zh/model-studio/developer-reference/tongyi-wanxiang
"""
import argparse
import base64
import datetime as dt
import json
import os
import random
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


def slugify(text: str) -> str:
    # For Chinese text, just keep alphanumeric and Chinese characters
    text = text.strip()
    text = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text[:40] or "image"


def default_out_dir() -> Path:
    now = dt.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    preferred = Path.home() / "Projects" / "tmp"
    base = preferred if preferred.is_dir() else Path("./tmp")
    base.mkdir(parents=True, exist_ok=True)
    return base / f"tongyi-wanxiang-{now}"


def pick_prompts(count: int) -> list[str]:
    """Generate random Chinese prompts for image generation."""
    subjects = [
        "一只宇航员龙虾",
        "一座极简主义灯塔",
        "一间温馨的阅读角落",
        "赛博朋克风格的面馆",
        "黄昏时分的上海外滩",
        "一幅中国山水画",
        "未来主义的水下图书馆",
        "一只戴着帽子的猫咪",
    ]
    styles = [
        "超精细工作室摄影",
        "35毫米胶片电影感",
        "等距视角插画",
        "时尚杂志摄影",
        "柔和水彩画风格",
        "建筑渲染效果图",
        "高对比度黑白照片",
        "中国水墨画风格",
    ]
    lighting = [
        "金色时刻光线",
        "阴天柔和光线",
        "霓虹灯光氛围",
        "戏剧性侧光",
        "烛光照明",
        "朦胧雾气氛围",
    ]
    prompts: list[str] = []
    for _ in range(count):
        prompts.append(
            f"{random.choice(styles)}，{random.choice(subjects)}，{random.choice(lighting)}"
        )
    return prompts


def submit_task(api_key: str, prompt: str, model: str, size: str, n: int) -> str:
    """Submit an async image generation task, return task_id."""
    url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"
    
    body = {
        "model": model,
        "input": {
            "prompt": prompt,
        },
        "parameters": {
            "size": size,
            "n": n,
        },
    }
    
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",  # Enable async mode
        },
        data=data,
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            if result.get("output", {}).get("task_id"):
                return result["output"]["task_id"]
            raise RuntimeError(f"No task_id in response: {json.dumps(result)[:400]}")
    except urllib.error.HTTPError as e:
        payload = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"DashScope API failed ({e.code}): {payload}") from e


def poll_task(api_key: str, task_id: str, timeout: int = 300) -> dict:
    """Poll task status until complete or timeout."""
    url = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"
    
    start_time = time.time()
    while True:
        if time.time() - start_time > timeout:
            raise RuntimeError(f"Task {task_id} timed out after {timeout}s")
        
        req = urllib.request.Request(
            url,
            method="GET",
            headers={
                "Authorization": f"Bearer {api_key}",
            },
        )
        
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                status = result.get("output", {}).get("task_status", "")
                
                if status == "SUCCEEDED":
                    return result
                elif status == "FAILED":
                    error_msg = result.get("output", {}).get("message", "Unknown error")
                    raise RuntimeError(f"Task failed: {error_msg}")
                elif status in ("PENDING", "RUNNING"):
                    time.sleep(2)  # Poll every 2 seconds
                    continue
                else:
                    raise RuntimeError(f"Unknown task status: {status}")
        except urllib.error.HTTPError as e:
            payload = e.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"DashScope API poll failed ({e.code}): {payload}") from e


def download_image(url: str, filepath: Path) -> None:
    """Download image from URL to file."""
    try:
        urllib.request.urlretrieve(url, filepath)
    except urllib.error.URLError as e:
        raise RuntimeError(f"Failed to download image from {url}: {e}") from e


def write_gallery(out_dir: Path, items: list[dict]) -> None:
    thumbs = "\n".join(
        [
            f"""
<figure>
  <a href="{it["file"]}"><img src="{it["file"]}" loading="lazy" /></a>
  <figcaption>{it["prompt"]}</figcaption>
</figure>
""".strip()
            for it in items
        ]
    )
    html = f"""<!doctype html>
<meta charset="utf-8" />
<title>通义万相</title>
<style>
  :root {{ color-scheme: dark; }}
  body {{ margin: 24px; font: 14px/1.4 ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei"; background: #0b0f14; color: #e8edf2; }}
  h1 {{ font-size: 18px; margin: 0 0 16px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }}
  figure {{ margin: 0; padding: 12px; border: 1px solid #1e2a36; border-radius: 14px; background: #0f1620; }}
  img {{ width: 100%; height: auto; border-radius: 10px; display: block; }}
  figcaption {{ margin-top: 10px; color: #b7c2cc; }}
  code {{ color: #9cd1ff; }}
</style>
<h1>🎨 通义万相 (Tongyi Wanxiang)</h1>
<p>输出目录: <code>{out_dir.as_posix()}</code></p>
<div class="grid">
{thumbs}
</div>
"""
    (out_dir / "index.html").write_text(html, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="通义万相图像生成 via DashScope API")
    ap.add_argument("--prompt", help="图像描述。如果省略，将自动生成随机 prompt。")
    ap.add_argument("--count", type=int, default=4, help="生成图片数量 (1-4)，默认 4。")
    ap.add_argument(
        "--model",
        default="wanx2.1-t2i-turbo",
        choices=["wanx2.1-t2i-turbo", "wanx2.1-t2i-plus"],
        help="模型: wanx2.1-t2i-turbo (快) 或 wanx2.1-t2i-plus (高质量)。",
    )
    ap.add_argument(
        "--size",
        default="1024*1024",
        choices=["1024*1024", "720*1280", "1280*720", "768*1024", "1024*768"],
        help="图片尺寸，默认 1024*1024。",
    )
    ap.add_argument("--out-dir", default="", help="输出目录。")
    args = ap.parse_args()

    api_key = (os.environ.get("DASHSCOPE_API_KEY") or "").strip()
    if not api_key:
        print("Missing DASHSCOPE_API_KEY", file=sys.stderr)
        print("Get your API key at: https://dashscope.console.aliyun.com/", file=sys.stderr)
        return 2

    count = min(max(args.count, 1), 4)  # Clamp to 1-4
    out_dir = Path(args.out_dir).expanduser() if args.out_dir else default_out_dir()
    out_dir.mkdir(parents=True, exist_ok=True)

    prompts = [args.prompt] if args.prompt else pick_prompts(1)  # One prompt, multiple images

    items: list[dict] = []
    for prompt_idx, prompt in enumerate(prompts, start=1):
        print(f"[{prompt_idx}/{len(prompts)}] 提交任务: {prompt[:60]}...")
        
        # Submit async task
        task_id = submit_task(api_key, prompt, args.model, args.size, count)
        print(f"  任务 ID: {task_id}")
        
        # Poll for completion
        print("  等待生成中...", end="", flush=True)
        result = poll_task(api_key, task_id)
        print(" 完成!")
        
        # Download images
        results = result.get("output", {}).get("results", [])
        for img_idx, img_data in enumerate(results, start=1):
            image_url = img_data.get("url")
            if not image_url:
                print(f"  警告: 图片 {img_idx} 无 URL，跳过", file=sys.stderr)
                continue
            
            filename = f"{prompt_idx:03d}-{img_idx:02d}-{slugify(prompt)}.png"
            filepath = out_dir / filename
            download_image(image_url, filepath)
            print(f"  已保存: {filename}")
            items.append({"prompt": prompt, "file": filename})

    (out_dir / "prompts.json").write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    write_gallery(out_dir, items)
    print(f"\n打开画廊: {(out_dir / 'index.html').as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
