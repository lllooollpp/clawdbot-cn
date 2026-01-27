#!/usr/bin/env python3
import os
import re
from pathlib import Path

ZH_ROOT = Path("D:/workspace/clawdbot/docs/zh")

def clean_content(text):
    if not text:
        return text
    s = text
    
    # 0. Initial cleanup of common LLM artifacts
    s = s.replace('`<think>`', '').replace('`</think>`', '')

    # 1. Remove all <think>...</think> blocks including content
    s = re.sub(r'<think>.*?</think>', '', s, flags=re.DOTALL | re.IGNORECASE)
    # Also remove stray tags
    s = s.replace('<think>', '').replace('</think>', '')
    
    # 2. Fix frontmatter
    # Look for opening ---
    s_stripped = s.lstrip('\ufeff').lstrip()
    if s_stripped.startswith('---'):
        # Split by --- lines
        # We use a pattern that matches --- on its own line
        parts = re.split(r'^---+\s*$', s, maxsplit=2, flags=re.MULTILINE)
        if len(parts) >= 3:
            # Already closed. Just normalize it.
            s = f"---\n{parts[1].strip()}\n---\n\n{parts[2].lstrip()}"
        elif len(parts) == 2:
            # Missing closing. parts[1] is the content.
            # Find where the body starts (typically the first #)
            m_header = re.search(r'^#\s+', parts[1], re.MULTILINE)
            if m_header:
                fm_inner = parts[1][:m_header.start()].strip()
                body = parts[1][m_header.start():].lstrip()
                s = f"---\n{fm_inner}\n---\n\n{body}"
            else:
                # No header found, maybe the whole thing is frontmatter? Unlikely.
                # Just add a --- at the end of the first logical block if it's summary: etc.
                pass

    # 3. Unwrap all markdown code blocks that were added as wrappers
    def unwrap_block(m):
        inner = m.group(1).strip()
        # Remove LLM error where it puts 'md' or 'markdown' on its own line at the start
        inner = re.sub(r'^(?:md|markdown|mdx)\s*\n', '', inner, flags=re.IGNORECASE)
        return "\n" + inner + "\n"

    # Run multiple times for nested
    for _ in range(3):
        new_s = re.sub(r'```(?:md|markdown|mdx)?\s*\n(.*?)\n?```', unwrap_block, s, flags=re.DOTALL | re.IGNORECASE)
        if new_s == s:
            break
        s = new_s

    # 4. Final polish: remove stray 'md' lines before headers
    s = re.sub(r'^\s*(?:md|markdown|mdx)\s*\n(?=#)', '', s, flags=re.IGNORECASE | re.MULTILINE)
    
    # Ensure only ONE newline at the end
    return s.strip() + "\n"

def main():
    files = list(ZH_ROOT.rglob("*.md"))
    print(f"Found {len(files)} files to cleanup.")
    for p in files:
        try:
            content = p.read_text(encoding='utf-8')
            cleaned = clean_content(content)
            if cleaned != content:
                p.write_text(cleaned, encoding='utf-8')
                print(f"Cleaned: {p}")
        except Exception as e:
            print(f"Error cleaning {p}: {e}")

if __name__ == "__main__":
    main()
