import os
import re

def fix_code_blocks(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    # Count occurrences of ``` at the start of lines (with optional spaces)
    code_blocks = re.findall(r'^\s*```', content, re.MULTILINE)
    
    if len(code_blocks) % 2 != 0:
        lines = content.splitlines()
        if not lines: return
        
        # If the last line is JUST backticks (with optional spaces), remove it
        if lines[-1].strip() == '```':
            print(f"Removing extra closing block from {file_path}")
            new_content = '\n'.join(lines[:-1])
            # Check if after removing it's still odd (it shouldn't be)
            # but write it back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content + '\n')
        else:
            # If the last line is something else, add a closing block
            print(f"Adding missing closing block to {file_path}")
            with open(file_path, 'a', encoding='utf-8') as f:
                f.write('\n```\n')

docs_dir = r'd:\workspace\clawdbot\docs'
for root, dirs, files in os.walk(docs_dir):
    # Exclude non-markdown areas
    dirs[:] = [d for d in dirs if d not in ('.git', '_site', 'node_modules', '.azure')]
    for file in files:
        if file.endswith('.md') or file.endswith('.mdx'):
            fix_code_blocks(os.path.join(root, file))
