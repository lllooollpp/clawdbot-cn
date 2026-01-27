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
    item_match = re.match(r'^\s*-\s*\[.+\]\((.+)\)', line)
    if item_match and current_group:
        path = item_match.group(1).strip()
        
        # Skip external or non-markdown links for the sidebar
        if path.startswith('http') or not path.startswith('/'):
            if path == '/':
                page_name = "index"
            else:
                continue
        else:
            # Convert /start/getting-started to start/getting-started
            page_name = path.strip('/')
        
        if page_name and page_name not in current_group["pages"]:
            current_group["pages"].append(page_name)

# Ensure _data directory exists
os.makedirs('_data', exist_ok=True)

# Generate YAML
yaml_output = ""
for g in navigation:
    if not g["pages"]: continue
    yaml_output += f"- group: {g['group']}\n"
    yaml_output += "  pages:\n"
    for p in g["pages"]:
        yaml_output += f"    - {p}\n"

with open('_data/navigation.yml', 'w', encoding='utf-8') as f:
    f.write(yaml_output)

print("Navigation updated based on hubs.md")
