import os

docs_dir = r'd:\workspace\clawdbot\docs'
for root, dirs, files in os.walk(docs_dir):
    dirs[:] = [d for d in dirs if d not in ('.git', '_site', 'node_modules', '.azure')]
    for file in files:
        if file.endswith('.md') or file.endswith('.mdx'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                
                changed = False
                if content.startswith('```markdown') and content.endswith('```'):
                    print(f"Stripping markdown wrapper from {path}")
                    content = content[len('```markdown'):-3].strip()
                    changed = True
                elif content.startswith('```') and content.endswith('```'):
                    print(f"Stripping generic wrapper from {path}")
                    content = content[3:-3].strip()
                    changed = True
                
                if changed:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content + '\n')
            except Exception as e:
                print(f"Error processing {path}: {e}")
