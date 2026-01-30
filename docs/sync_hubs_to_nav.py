import re
import os

with open('start/hubs.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

navigation = []
current_group = None

for line in lines:
    # Match group headers ## Name
    group_match = re.match(r'^##\s+(.+)', line)
    if group_match:
        group_name = group_match.group(1).strip()
        current_group = {"group": group_name, "pages": []}
        navigation.append(current_group)
        continue
    
    # Match list items - [Title](Path)
    item_match = re.match(r'^\s*-\s*\[(.+?)\]\((.+?)\)', line)
    if item_match and current_group:
        title = item_match.group(1).strip()
        path = item_match.group(2).strip()
        
        # Skip external links for the sidebar unless they are local/special
        if path.startswith('http') and '127.0.0.1' not in path:
            continue
            
        if path == '/':
            page_url = "/"
        else:
            page_url = path if path.startswith('/') else '/' + path
        
        current_group["pages"].append({"title": title, "url": page_url})

# Ensure _data directory exists
os.makedirs('_data', exist_ok=True)

# Generate YAML
yaml_output = ""
for g in navigation:
    if not g["pages"]: continue
    yaml_output += f"- group: {g['group']}\n"
    yaml_output += "  pages:\n"
    for p in g["pages"]:
        yaml_output += f"    - title: \"{p['title']}\"\n"
        yaml_output += f"      url: \"{p['url']}\"\n"

with open('_data/navigation.yml', 'w', encoding='utf-8') as f:
    f.write(yaml_output)

print("Navigation updated based on hubs.md with Chinese titles")
