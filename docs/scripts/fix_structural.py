import os
import re

def fix_markdown_structural(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    # 1. Add YAML if missing (BOM aware)
    if not content.lstrip('\ufeff').startswith('---'):
        name = os.path.basename(file_path).replace('.md', '').replace('.mdx', '').replace('-', ' ').replace('_', ' ').title()
        yaml_header = f"---\nsummary: \"{name} documentation\"\n---\n\n"
        content = yaml_header + content

    # 2. Fix Heading Level Jumps
    lines = content.splitlines()
    new_lines = []
    prev_level = 0
    
    for line in lines:
        match = re.match(r'^(#+)\s', line)
        if match:
            current_level = len(match.group(1))
            if current_level > prev_level + 1 and prev_level != 0:
                # Big jump! 
                new_level = prev_level + 1
                line = '#' * new_level + ' ' + line.lstrip('#').strip()
                prev_level = new_level
            else:
                prev_level = current_level
        new_lines.append(line)
        
    new_content = '\n'.join(new_lines)
    
    # 3. Specific fixes
    if 'providers/index.md' in file_path.replace('\\', '/'):
        new_content = new_content.replace('/providers/zhipu', '/providers/glm.md')
    
    if new_content != content:
        print(f"Updating structural issues in {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content + '\n')

docs_dir = r'd:\workspace\clawdbot\docs'
for root, dirs, files in os.walk(docs_dir):
    dirs[:] = [d for d in dirs if d not in ('.git', '_site', 'node_modules', '.azure')]
    for file in files:
        if file.endswith('.md') or file.endswith('.mdx'):
            fix_markdown_structural(os.path.join(root, file))
