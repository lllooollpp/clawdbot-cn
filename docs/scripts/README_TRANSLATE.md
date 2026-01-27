翻译脚本说明
=================

用途
----
此脚本会将当前 `docs` 目录下的可翻译文本文件（`.md`, `.mdx`, `.html`, `.txt`）批量翻译为简体中文，输出到 `./zh` 目录中，保留原始目录结构和文件名。

依赖
----
- Python 3.8+
- `requests`（建议使用 `pip install -r requirements.txt`）

API 与环境变量
----------------
- 使用 DeepL（推荐）:
  - `DEEPL_API_KEY` = 你的 DeepL API 密钥
  - `TRANSLATE_PROVIDER=deepl`
- 或使用 OpenAI:
  - `OPENAI_API_KEY` = 你的 OpenAI API 密钥
  - `TRANSLATE_PROVIDER=openai`（可省略，如果未设置 DEEPL 则默认使用 OpenAI）

- 使用 Dify（公司中间层）:
  - `DIFY_API_KEY` = 你的 Dify API 密钥
  - `DIFY_MODEL` = 可选，部署/模型名称（例如 `dify-gpt`）
  - `DIFY_API_URL` = 可选，自定义 invoke URL（覆盖默认 `https://api.dify.ai/v1/models/{DIFY_MODEL}/invoke`）
  - `TRANSLATE_PROVIDER=dify`

  - 如果使用 Dify 的 Workflow Run 接口（示例）：
    - `DIFY_WORKFLOW_RUN_URL` = 可选，默认 `http://10.104.6.88/v1/workflows/run`
    - 脚本会使用 `Authorization: Bearer {DIFY_API_KEY}` 发起 POST 请求，body 示例：
json
      {
        "inputs": {"request": "要翻译的文档"},
        "response_mode": "streaming",
        "user": "translate_docs_script"
      }
      ```      ```
- 返回示例脚本会将 `data.outputs.text`（或 `data.outputs` 中的文本字段）解析为翻译结果。

- 使用自托管/局域网模型（通用调用方式，无需 Key）:
  - `CUSTOM_API_URL` = 调用的基础 URL（示例：`http://10.104.6.197:38099/v1`）
  - `CUSTOM_MODEL` = 模型名称（示例：`Qwen2.5-72B-Instruct`）
  - `TRANSLATE_PROVIDER=custom`（可选，脚本默认会尝试 `CUSTOM_API_URL`）

当 `CUSTOM_API_URL` 可用时，脚本会优先使用 `custom` 提供者，并按以下端点顺序进行尝试：
`{CUSTOM_API_URL}/chat/completions` -> `{CUSTOM_API_URL}/v1/chat/completions` -> `{CUSTOM_API_URL}`

示例（Linux/macOS）：```bash
export TRANSLATE_PROVIDER=custom
export CUSTOM_API_URL=http://10.104.6.197:38099/v1
export CUSTOM_MODEL=Qwen2.5-72B-Instruct
python scripts/translate_docs.py
```
运行
----
在 `docs` 根目录下运行：
bash
python scripts/translate_docs.py
``````
说明
----
- 脚本会保留 YAML frontmatter 与代码块（
）不被翻译。
- 如果同时设置了 `OPENAI_API_KEY`，脚本会在翻译完成后调用 OpenAI 做一次“校准/润色”以提高中文质量。
- 翻译结果需要人工复核（尽管脚本包含 AI 校准）。

注意
----
- 翻译大型仓库会产生 API 费用，请先在少量文件上测试。
- 若文件中含有复杂 MDX/JSX 语法，脚本可能无法完美识别所有需跳过的片段，请在校对时关注这些部分。
```