import os
import re

def fix_file(path):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix: text``` -> text\n``` (Ensure newline before code block)
    # But skip if it's already at start of line or part of inline code
    content = re.sub(r'([^\n])```', r'\1\n```', content)
    
    # Fix: ```text -> ```\ntext (Ensure newline after code block closing)
    # Actually most common is text```\n
    
    # Fix: }``` (specific case)
    content = re.sub(r'\}```', r'}\n```', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

docs_dir = r'd:\workspace\clawdbot\docs'
for root, dirs, files in os.walk(docs_dir):
    for file in files:
        if file.endswith('.md') or file.endswith('.mdx'):
            path = os.path.join(root, file)
            # Skip script files
            if 'scripts' in path: continue
            fix_file(path)
