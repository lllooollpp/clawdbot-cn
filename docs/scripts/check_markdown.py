import os
import re
import yaml

def check_markdown_files(root_dir):
    md_files = []
    for root, dirs, files in os.walk(root_dir):
        # 排除 node_modules, _site, .git 等目录
        dirs[:] = [d for d in dirs if d not in ('.git', '_site', 'node_modules', '.azure')]
        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                md_files.append(os.path.join(root, file))

    report = {}

    for file_path in md_files:
        errors = []
        rel_path = os.path.relpath(file_path, root_dir)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            errors.append("编码错误: 不是有效的 UTF-8 文件")
            report[rel_path] = errors
            continue
        except Exception as e:
            errors.append(f"由于逻辑错误无法读取: {str(e)}")
            report[rel_path] = errors
            continue

        # 1. 检查 YAML Front Matter (Jekyll 必需)
        if not content.lstrip('\ufeff').startswith('---'):
            errors.append("缺失 YAML Front Matter (文件未以 --- 开头)")
        else:
            parts = content.lstrip('\ufeff').split('---', 2)
            if len(parts) < 3:
                errors.append("YAML Front Matter 未闭合")
            else:
                try:
                    yaml_content = yaml.safe_load(parts[1])
                    if not yaml_content:
                        errors.append("YAML Front Matter 为空")
                except Exception as e:
                    errors.append(f"YAML 语法错误: {str(e)}")

        # 2. 检查标题级别跳跃 (例如 # 后面直接跟 ###)
        headings = re.findall(r'^(#+)\s', content, re.MULTILINE)
        if headings:
            prev_level = 0
            for h in headings:
                current_level = len(h)
                if current_level > prev_level + 1 and prev_level != 0:
                    errors.append(f"标题级别跳跃: 从 H{prev_level} 直接跳到 H{current_level}")
                prev_level = current_level

        # 3. 检查未闭合的代码块
        code_blocks = re.findall(r'^\s*```', content, re.MULTILINE)
        if len(code_blocks) % 2 != 0:
            errors.append("代码块 (```) 未闭合")

        # 4. 检查内部链接有效性 (排除代码块和行内代码)
        # 先去除代码块
        clean_content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
        # 再去除行内代码
        clean_content = re.sub(r'`.*?`', '', clean_content)
        
        links = re.findall(r'\[.+?\]\((?!http|#|mailto)(.+?)\)', clean_content)
        for link in links:
            # 去除锚点
            clean_link = link.split('#')[0]
            if not clean_link: continue
            
            # 去除可能的引用
            clean_link = clean_link.strip()
            
            # 修复：处理以 / 开头的链接，将其视为根目录开始
            if clean_link.startswith('/'):
                link_path = os.path.normpath(os.path.join(root_dir, clean_link.lstrip('/')))
            else:
                link_path = os.path.normpath(os.path.join(os.path.dirname(file_path), clean_link))
            
            # 处理 Jekyll 的 permalink: pretty 情况下可能是没有 .md 后缀的链接
            if not os.path.exists(link_path):
                # 尝试补齐扩展名
                if not (link_path.endswith('.md') or link_path.endswith('.mdx') or link_path.endswith('.html')):
                    potential_file = link_path + '.md'
                    if not os.path.exists(potential_file):
                        potential_file = link_path + '.mdx'
                        if not os.path.exists(potential_file):
                            errors.append(f"死链: 指向不存在的文件 [{link}]")
                else:
                    errors.append(f"死链: 指向不存在的文件 [{link}]")

        if errors:
            report[rel_path] = errors

    return report

if __name__ == "__main__":
    workspace_root = os.getcwd()
    print(f"正在检查目录: {workspace_root} 中的 Markdown 文件...\n")
    
    results = check_markdown_files(workspace_root)
    
    if not results:
        print("✅ 所有 Markdown 文件格式正常，未发现显著问题！")
    else:
        print(f"❌ 发现 {len(results)} 个文件存在格式问题:\n")
        for file, errs in results.items():
            print(f"📄 {file}")
            for err in errs:
                print(f"   - {err}")
            print()
