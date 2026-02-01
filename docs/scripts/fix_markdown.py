import os
import re

def fix_markdown_file(file_path, all_md_files):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix unclosed code blocks and excessive backticks
    content = re.sub(r'(`{4,})', '```', content)

    lines = content.split('\n')
    in_code_block = False
    new_lines = []
    
    for line in lines:
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
        new_lines.append(line)
    
    if in_code_block:
        new_lines.append('```')
    
    content = '\n'.join(new_lines)

    # 2. Fix links: [/path] -> [/path.md] if it exists in all_md_files
    def link_fixer(match):
        text = match.group(1)
        url = match.group(2)
        
        # Skip external links
        if url.startswith(('http://', 'https://', 'mailto:', 'tel:', '#')):
            return f"[{text}]({url})"
        
        # Internal link
        anchor = ""
        if '#' in url:
            url, anchor = url.split('#', 1)
            anchor = "#" + anchor
        
        # Case 1: Absolute looking link starts with /
        if url.startswith('/'):
            target = url[1:]
            if not target.endswith(('.md', '.html', '.png', '.jpg', '.jpeg', '.gif')):
                # Check if target.md exists
                if f"{target}.md" in all_md_files:
                    return f"[{text}]({url}.md{anchor})"
                # or if it's a directory like /gateway/ -> /gateway/index.md
                if f"{target}/index.md" in all_md_files:
                    return f"[{text}]({url}/index.md{anchor})"
        
        # Case 2: Relative link
        else:
            if not url.endswith(('.md', '.html', '.png', '.jpg', '.jpeg', '.gif')) and url != "":
                # Resolve relative to current file
                rel_dir = os.path.dirname(os.path.relpath(file_path, os.getcwd()))
                target_full = os.path.normpath(os.path.join(rel_dir, url)).replace('\\', '/')
                if f"{target_full}.md" in all_md_files:
                    return f"[{text}]({url}.md{anchor})"
                if f"{target_full}/index.md" in all_md_files:
                    return f"[{text}]({url}/index.md{anchor})"

        return f"[{text}]({url}{anchor})"

    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link_fixer, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    docs_dir = os.getcwd()
    all_md_files = set()
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.md'):
                rel_path = os.path.relpath(os.path.join(root, file), docs_dir).replace('\\', '/')
                all_md_files.add(rel_path)

    for root, dirs, files in os.walk(docs_dir):
        if 'node_modules' in root or '.git' in root or '_site' in root or 'scripts' in root:
            continue
        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                fix_markdown_file(os.path.join(root, file), all_md_files)
                print(f"Processed {file}")

if __name__ == "__main__":
    main()
