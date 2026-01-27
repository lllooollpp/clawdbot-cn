#!/usr/bin/env python3
"""
Bulk translate Markdown/MDX/HTML files under this docs folder into Simplified Chinese.
Outputs the translated site under ./zh preserving directory structure and filenames.

Usage:
  - Set environment variables for API keys and provider (see README_TRANSLATE.md)
  - Run: python scripts/translate_docs.py

Behavior:
  - Preserves YAML frontmatter and code fences (```)
  - Uses DeepL (if DEEPL_API_KEY set and TRANSLATE_PROVIDER=deepl) or OpenAI (OPENAI_API_KEY)
  - Optionally runs an AI "calibration" (proofread/improve) pass via OpenAI if OPENAI_API_KEY set
"""
import os
import sys
import json
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOT = ROOT
DEST_ROOT = DOCS_ROOT / "zh"

TEXT_EXTS = {'.md', '.mdx', '.markdown', '.html', '.htm', '.txt'}

DIFY_API = os.environ.get('DIFY_API_KEY')
DIFY_MODEL = os.environ.get('DIFY_MODEL', 'dify-gpt')
DIFY_API_URL = os.environ.get('DIFY_API_URL')
DIFY_WORKFLOW_RUN_URL = os.environ.get('DIFY_WORKFLOW_RUN_URL', DIFY_API_URL or 'http://10.104.6.88/v1/workflows/run')

# Script only supports Dify Workflow Run provider
PROVIDER = 'dify'
OPENAI_API = None


def list_files(root):
    for p in root.rglob('*'):
        if p.is_file():
            if p.match('zh/**'):
                continue
            if p.suffix.lower() in TEXT_EXTS:
                yield p


def read_text(p: Path):
    try:
        return p.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        return p.read_text(encoding='latin-1')


def write_text(p: Path, text: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8')


def split_frontmatter(text: str):
    """Robustly split YAML frontmatter from document body."""
    s = text.lstrip('\ufeff').lstrip()
    # Pattern to match YAML frontmatter between --- markers
    m = re.match(r'^---+\s*\n(.*?)\n---+\s*\n(.*)', s, flags=re.DOTALL | re.MULTILINE)
    if m:
        fm_content = m.group(1).strip()
        body = m.group(2).lstrip()
        # Return standardized frontmatter and the rest
        return f'---\n{fm_content}\n---\n\n', body
    return '', text


def split_code_blocks(text: str):
    # Split into segments: tuples (kind, content) where kind is 'text' or 'code'
    segments = []
    lines = text.splitlines(keepends=True)
    in_code = False
    buf = []
    fence = None
    code_lang = None
    for ln in lines:
        if ln.lstrip().startswith('```'):
            if not in_code:
                # flush text
                if buf:
                    segments.append(('text', ''.join(buf)))
                    buf = []
                in_code = True
                fence = ln
                # detect language after backticks
                lang = ln.strip()[3:].strip()
                code_lang = lang.split()[0].lower() if lang else ''
                buf.append(ln)
            else:
                buf.append(ln)
                content = ''.join(buf)
                # If fenced block language is markdown-like, treat as md_fenced (translate inner)
                if code_lang in ('md', 'markdown', 'mdx'):
                    segments.append(('md_fenced', content))
                else:
                    segments.append(('code', content))
                buf = []
                in_code = False
                fence = None
                code_lang = None
        else:
            buf.append(ln)
    if buf:
        segments.append(('text' if not in_code else 'code', ''.join(buf)))
    return segments


def chunk_text(text, max_chars=3000):
    # naive chunk by paragraphs
    paras = text.split('\n\n')
    cur = []
    cur_len = 0
    for p in paras:
        l = len(p)
        if cur_len + l > max_chars and cur:
            yield '\n\n'.join(cur)
            cur = [p]
            cur_len = l
        else:
            cur.append(p)
            cur_len += l
    if cur:
        yield '\n\n'.join(cur)


def translate_deepl(text: str, target_lang='ZH') -> str:
    if not DEEPL_API:
        raise RuntimeError('DEEPL_API_KEY not set')
    url = 'https://api-free.deepl.com/v2/translate'
    headers = {'Authorization': f'DeepL-Auth-Key {DEEPL_API}'}
    out_chunks = []
    for chunk in chunk_text(text, max_chars=4000):
        data = {'text': chunk, 'target_lang': target_lang}
        r = requests.post(url, data=data, headers=headers)
        r.raise_for_status()
        res = r.json()
        out_chunks.append(''.join(t['text'] for t in res['translations']))
        time.sleep(0.2)
    return '\n\n'.join(out_chunks)


def translate_openai(text: str, src_lang='EN', target_lang='ZH-CN') -> str:
    if not OPENAI_API:
        raise RuntimeError('OPENAI_API_KEY not set')
    url = 'https://api.openai.com/v1/chat/completions'
    headers = {'Authorization': f'Bearer {OPENAI_API}', 'Content-Type': 'application/json'}
    out_chunks = []
    for chunk in chunk_text(text, max_chars=2000):
        prompt = (
            f"You are a translation assistant. Translate the following markdown-preserving text into Simplified Chinese. "
            f"Preserve code fences, inline code, and markdown structure. Output only the translated markdown.\n\n{chunk}"
        )
        payload = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.2,
            'max_tokens': 4000,
        }
        r = requests.post(url, headers=headers, json=payload)
        r.raise_for_status()
        j = r.json()
        txt = j['choices'][0]['message']['content']
        # normalize returned text (clean stray backticks / think tags / spacing)
        try:
            txt = _normalize_dify_text(txt)
        except Exception:
            pass
        # strip <think> wrappers and outer ```md``` fences if present
        try:
            txt = _strip_wrappers(txt)
        except Exception:
            pass
        out_chunks.append(txt)
        time.sleep(0.3)
    return '\n\n'.join(out_chunks)


def translate_dify(text: str, src_lang='EN', target_lang='ZH-CN') -> str:
    # Use Dify workflow run endpoint when available (supports Authorization)
    if not DIFY_API:
        raise RuntimeError('DIFY_API_KEY not set')
    run_url = DIFY_WORKFLOW_RUN_URL
    headers = {'Authorization': f'Bearer {DIFY_API}', 'Content-Type': 'application/json'}
    out_chunks = []
    for chunk in chunk_text(text, max_chars=3000):
        payload = {
            'inputs': {'request': chunk},
            # request non-streaming / blocking response
            'response_mode': 'blocking',
            'user': 'translate_docs_script'
        }
        r = requests.post(run_url, headers=headers, json=payload, timeout=120)
        # if HTTP error, raise to be caught by caller
        try:
            r.raise_for_status()
        except Exception:
            # include response text for debugging
            raise
        # attempt to parse JSON, but fall back to raw text if response is not JSON
        j = None
        raw = None
        try:
            j = r.json()
        except ValueError:
            raw = r.text.strip()
        # expected shape per user: { "workflow_run_id": ..., "task_id": ..., "data": { ... , "outputs": { "text": "..." }}}
        txt = None
        # prefer parsed JSON
        if isinstance(j, dict):
            data = j.get('data') or j.get('outputs') or j
            if isinstance(data, dict):
                outputs = data.get('outputs') or data.get('result') or data.get('output')
                if isinstance(outputs, dict):
                    txt = outputs.get('text') or outputs.get('content') or outputs.get('result')
                elif isinstance(outputs, str):
                    txt = outputs
                else:
                    try:
                        txt = json.dumps(outputs)
                    except Exception:
                        txt = str(outputs)
        # if JSON parse failed or didn't contain expected fields, use raw text
        if not txt:
            if raw:
                txt = raw
            elif j is not None:
                try:
                    txt = json.dumps(j)
                except Exception:
                    txt = str(j)
            else:
                txt = ''
        
        # Clean output
        txt = _normalize_dify_text(txt)
        txt = _strip_wrappers(txt)
        
        out_chunks.append(txt)
        time.sleep(0.2)
    return '\n\n'.join(out_chunks)


def _normalize_dify_text(txt: str) -> str:
    if not txt:
        return txt
    s = txt
    # remove common LLM debris (stray backticks around tags)
    s = s.replace('`<think>`', '').replace('`</think>`', '')
    s = s.replace('\n` \n', '\n')
    # normalize double-backtick markers sometimes returned by smaller models
    s = s.replace('\n``md', '\n```md')
    s = s.replace('` ```', '```')
    return s


def _strip_wrappers(txt: str) -> str:
    """Aggressively remove reasoning tags and markdown code fence wrappers."""
    if not txt:
        return txt
    
    # 1. Remove <think>...</think> blocks including their content
    s = re.sub(r'<think>.*?</think>', '', txt, flags=re.DOTALL | re.IGNORECASE)
    # Also remove stray or unclosed tags
    s = s.replace('<think>', '').replace('</think>', '')

    # 2. Recursively unwrap markdown fences (some models nest them)
    def unwrap(match):
        inner = match.group(1).strip()
        # Remove an accidental 'md' or 'markdown' string prefix left by formatting errors
        inner = re.sub(r'^(?:md|markdown|mdx)\s*\n', '', inner, flags=re.IGNORECASE)
        return "\n" + inner + "\n"

    for _ in range(3): # Max 3 levels of nesting
        new_s = re.sub(r'```(?:md|markdown|mdx)?\s*\n(.*?)\n?```', unwrap, s, flags=re.DOTALL | re.IGNORECASE)
        if new_s == s:
            break
        s = new_s

    # 3. Final cleaning: remove any trailing/leading fence residue
    s = s.strip()
    # Remove leading 'md' or 'markdown' labels if they appear right before a header
    s = re.sub(r'^\s*(?:md|markdown|mdx)\s*\n(?=#)', '', s, flags=re.IGNORECASE | re.MULTILINE)
    
    return s.strip()


def translate_custom(text: str, src_lang='EN', target_lang='ZH-CN') -> str:
    # Generic model invoke for on-prem / local inference endpoints without auth
    url_base = CUSTOM_API_URL
    model = CUSTOM_MODEL
    out_chunks = []
    endpoints_to_try = [
        f"{url_base.rstrip('/')}/chat/completions",
        f"{url_base.rstrip('/')}/v1/chat/completions",
        url_base,
    ]
    headers = {'Content-Type': 'application/json'}
    for chunk in chunk_text(text, max_chars=3000):
        prompt = (
            f"You are a translation assistant. Translate the following markdown-preserving text into Simplified Chinese. "
            f"Preserve code fences, inline code, and markdown structure. Output only the translated markdown.\n\n{chunk}"
        )
        payload = {
            'model': model,
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.2,
        }
        last_err = None
        txt = None
        for endpoint in endpoints_to_try:
            try:
                r = requests.post(endpoint, headers=headers, json=payload, timeout=60)
                r.raise_for_status()
                j = r.json()
                # Try common shapes
                if isinstance(j, dict):
                    if 'choices' in j and j['choices']:
                        choice = j['choices'][0]
                        # chat-style
                        msg = choice.get('message') or choice.get('message', None)
                        if isinstance(msg, dict):
                            txt = msg.get('content') or msg.get('text')
                        else:
                            txt = choice.get('text') or choice.get('content')
                    if not txt:
                        # attempt other common fields
                        if 'result' in j:
                            if isinstance(j['result'], dict):
                                txt = j['result'].get('content') or j['result'].get('text')
                            else:
                                txt = str(j['result'])
                        elif 'output' in j:
                            out = j['output']
                            if isinstance(out, list) and out:
                                txt = out[0].get('content') or out[0].get('text') or str(out[0])
                            elif isinstance(out, dict):
                                txt = out.get('text') or out.get('content')
                if not txt and isinstance(j, str):
                    txt = j
                if not txt:
                    # fallback stringify
                    txt = json.dumps(j)
                break
            except Exception as e:
                last_err = e
                continue
        if txt is None:
            raise RuntimeError(f'All endpoints failed for custom model. Last error: {last_err}')
        out_chunks.append(txt)
        time.sleep(0.2)
    return '\n\n'.join(out_chunks)


def ai_calibrate_openai(original: str, translated: str) -> str:
    # Ask OpenAI to proofread/improve the translated Chinese while preserving markdown
    if not OPENAI_API:
        return translated
    url = 'https://api.openai.com/v1/chat/completions'
    headers = {'Authorization': f'Bearer {OPENAI_API}', 'Content-Type': 'application/json'}
    system = (
        'You are a professional translator and technical editor. Improve the Chinese translation to be natural,'
        ' accurate, and consistent. Preserve code fences, inline code, links, filenames, and YAML frontmatter formatting.'
    )
    user = (
        'Original (source language):\n\n' + original[:4000]
        + '\n\nTranslated (current):\n\n' + translated[:8000]
        + '\n\nReturn only the improved translated text (no commentary).'
    )
    payload = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user}
        ],
        'temperature': 0.1,
        'max_tokens': 8000,
    }
    r = requests.post(url, headers=headers, json=payload)
    r.raise_for_status()
    j = r.json()
    return j['choices'][0]['message']['content']


def translate_file(path: Path, dest: Path):
    text = read_text(path)
    fm, body = split_frontmatter(text)
    segments = split_code_blocks(body)
    out = []
    for kind, seg in segments:
        if kind == 'code':
            out.append(seg)
            continue
        # translate seg
        if PROVIDER == 'deepl':
            translated = translate_deepl(seg)
        elif PROVIDER == 'dify':
            translated = translate_dify(seg)
        elif PROVIDER == 'custom':
            translated = translate_custom(seg)
        else:
            translated = translate_openai(seg)
        # optional calibration via OpenAI
        if OPENAI_API:
            try:
                translated = ai_calibrate_openai(seg, translated)
            except Exception:
                pass
        out.append(translated)
    final = fm + ''.join(out)
    write_text(dest, final)
    print(f'Wrote: {dest}')


def main():
    print('Translate provider:', PROVIDER)
    workers = int(os.environ.get('TRANSLATE_WORKERS', '5'))
    files = list(list_files(DOCS_ROOT))
    if not files:
        print('No files to translate')
        return

    # submit translation jobs to thread pool
    with ThreadPoolExecutor(max_workers=workers) as exe:
        future_to_path = {}
        for p in files:
            rel = p.relative_to(DOCS_ROOT)
            dest = DEST_ROOT / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            future = exe.submit(translate_file, p, dest)
            future_to_path[future] = p

        for fut in as_completed(future_to_path):
            p = future_to_path[fut]
            try:
                fut.result()
                print('Success:', p)
            except Exception as e:
                print('Failed:', p, e)


if __name__ == '__main__':
    main()
