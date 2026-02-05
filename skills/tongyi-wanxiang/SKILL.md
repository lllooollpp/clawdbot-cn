```skill
---
name: tongyi-wanxiang
description: 通义万相 (Tongyi Wanxiang) image generation via Alibaba Cloud DashScope API. Random prompt sampler + gallery.
homepage: https://help.aliyun.com/zh/model-studio/developer-reference/tongyi-wanxiang
metadata: {"openclaw":{"emoji":"🎨","requires":{"bins":["python3"],"env":["DASHSCOPE_API_KEY"]},"primaryEnv":"DASHSCOPE_API_KEY","install":[{"id":"python-brew","kind":"brew","formula":"python","bins":["python3"],"label":"Install Python (brew)"}]}}
---

# 通义万相 (Tongyi Wanxiang)

使用阿里云 DashScope API 生成图像，支持通义万相系列模型。

## 配置

设置 API Key（阿里云灵积模型服务）:

```bash
export DASHSCOPE_API_KEY="sk-xxx"
```

获取 API Key: [阿里云灵积模型服务](https://dashscope.console.aliyun.com/)

## Run

```bash
python3 {baseDir}/scripts/gen.py
open ~/Projects/tmp/tongyi-wanxiang-*/index.html
```

### 使用示例

```bash
# 基础用法 - 自动生成随机 prompt
python3 {baseDir}/scripts/gen.py --count 4

# 指定 prompt
python3 {baseDir}/scripts/gen.py --prompt "一只穿着宇航服的龙虾在月球漫步" --count 2

# 使用不同尺寸
python3 {baseDir}/scripts/gen.py --size 1024*1024 --prompt "中国水墨画风格的山水"
python3 {baseDir}/scripts/gen.py --size 720*1280 --prompt "赛博朋克风格的城市夜景"

# 使用 wanx2.1-t2i-turbo 模型 (更快)
python3 {baseDir}/scripts/gen.py --model wanx2.1-t2i-turbo --prompt "油画风格的向日葵"

# 使用 wanx2.1-t2i-plus 模型 (更高质量)
python3 {baseDir}/scripts/gen.py --model wanx2.1-t2i-plus --prompt "精细的建筑设计图"
```

## 模型

| 模型 | 说明 | 速度 |
|------|------|------|
| `wanx2.1-t2i-turbo` | 标准模型，平衡质量和速度 | 快 |
| `wanx2.1-t2i-plus` | 高质量模型，更精细的细节 | 慢 |

## 参数

### 尺寸 (`--size`)

支持的分辨率:
- `1024*1024` (1:1 方形，默认)
- `720*1280` (9:16 竖屏)
- `1280*720` (16:9 横屏)
- `768*1024` (3:4)
- `1024*768` (4:3)

### 数量 (`--count`)

每次可生成 1-4 张图片，默认 4 张。

### 风格提示词

通义万相对中文提示词有很好的支持，建议使用中文描述:

- 风格：水墨画、油画、赛博朋克、极简主义、写实摄影
- 光线：金色时刻、柔和光线、霓虹灯光、戏剧性侧光
- 场景：古典建筑、未来城市、自然风景、室内空间

## Output

- `*.png` 图片文件
- `prompts.json` (prompt → 文件映射)
- `index.html` (缩略图画廊)
```
