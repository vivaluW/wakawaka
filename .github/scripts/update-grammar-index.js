const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

// 读取所有markdown文件
const grammarFiles = glob.sync('grammar/**/*.md');

// 统计信息
let stats = {
  total: 0,
  particles: 0,
  expressions: 0,
  forms: 0,
  conjunctions: 0,
  honorifics: 0
};

// 分类整理语法点
let categories = {
  particles: [],
  expressions: [],
  forms: [],
  conjunctions: [],
  honorifics: []
};

// 处理每个文件
grammarFiles.forEach(file => {
  if (file === 'grammar/index.md') return;
  
  const content = fs.readFileSync(file, 'utf8');
  const { data } = matter(content);
  
  const category = path.dirname(file).split('/').pop();
  if (categories[category]) {
    stats[category]++;
    stats.total++;
    
    const entry = {
      path: file,
      title: data.title || path.basename(file, '.md'),
      level: data.level || 'N/A',
      tags: data.tags || []
    };
    
    categories[category].push(entry);
  }
});

// 生成index.md内容
let indexContent = '# 日语语法索引\n\n';
indexContent += '本索引按照语法类型分类整理。\n\n';
indexContent += `最后更新：${new Date().toISOString().split('T')[0]}\n\n`;

// 添加统计信息
indexContent += '## 统计信息\n\n';
indexContent += `- 总条目：${stats.total}\n`;
Object.keys(stats).forEach(key => {
  if (key !== 'total') {
    indexContent += `- ${key}：${stats[key]}\n`;
  }
});
indexContent += '\n';

// 添加分类内容
Object.keys(categories).forEach(category => {
  if (categories[category].length > 0) {
    indexContent += `## ${category}\n\n`;
    categories[category].forEach(entry => {
      const tags = entry.tags.length > 0 ? ` [${entry.tags.join(', ')}]` : '';
      indexContent += `- [${entry.title}](${entry.path}) (${entry.level})${tags}\n`;
    });
    indexContent += '\n';
  }
});

// 更新index.md
fs.writeFileSync('grammar/index.md', indexContent);

// 更新JSON文件
const jsonContent = {
  lastUpdated: new Date().toISOString(),
  stats: stats,
  categories: categories
};

fs.writeFileSync('grammar-points.json', JSON.stringify(jsonContent, null, 2));
