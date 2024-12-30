import os
import re

def get_grammar_files():
    grammar_dir = 'grammar'
    files = [f for f in os.listdir(grammar_dir) 
            if f.endswith('.md') and f != 'index.md' and f != 'marksheet.md']
    return files

def parse_grammar_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        title_match = re.search(r'# (.+)', content)
        desc_match = re.search(r'## 意[味|义]\n(.+)', content)
        return {
            'title': title_match.group(1) if title_match else os.path.splitext(os.path.basename(filepath))[0],
            'description': desc_match.group(1).strip() if desc_match else '',
            'path': filepath
        }

def generate_index(grammar_points):
    index_content = '# 日语语法索引\n\n'
    
    # 按语法类型分组
    categories = {
        'て形': [],
        '助词': [],
        '其他': []
    }
    
    for point in grammar_points:
        if 'て' in point['title']:
            categories['て形'].append(point)
        elif any(particle in point['title'] for particle in ['は', 'が', 'に', 'で', 'を', 'の']):
            categories['助词'].append(point)
        else:
            categories['其他'].append(point)
    
    # 生成分类索引
    for category, points in categories.items():
        if points:
            index_content += f'## {category}\n'
            for point in sorted(points, key=lambda x: x['title']):
                file_path = os.path.relpath(point['path'], 'grammar')
                index_content += f"- [{point['title']}]({file_path}) - {point['description']}\n"
            index_content += '\n'
    
    return index_content

def main():
    grammar_files = get_grammar_files()
    grammar_points = []
    
    for file in grammar_files:
        filepath = os.path.join('grammar', file)
        try:
            grammar_point = parse_grammar_file(filepath)
            grammar_points.append(grammar_point)
        except Exception as e:
            print(f"Error processing {file}: {str(e)}")
    
    index_content = generate_index(grammar_points)
    
    with open('index.md', 'w', encoding='utf-8') as f:
        f.write(index_content)

if __name__ == '__main__':
    main()