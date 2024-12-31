const fs = require('fs');
const path = require('path');

const grammarDir = path.join(__dirname, '../grammar');
const grammarFiles = fs.readdirSync(grammarDir)
  .filter(file => file.endsWith('.md') && !file.includes('index') && !file.includes('README'));

// 定义各个部分
const sections = {
  '基本语法': [],
  '转折表达': [],
  '原因和结果': [],
  '状态变化': []
};

// 语法点分类映射
const categoryMap = {
  'basic_grammar_points': '基本语法',
  'noni': '转折表达',
  'te_shimau': '状态变化',
  'node': '原因和结果',
  'conditional_to': '转折表达',
  'complex_sentence_patterns': '转折表达',
  'ga_conjunction': '转折表达'
};

// 处理每个文件
grammarFiles.forEach(file => {
  const content = fs.readFileSync(path.join(grammarDir, file), 'utf8');
  const grammarName = file.replace('.md', '');
  const category = categoryMap[grammarName] || '基本语法';
  
  // 提取标题和说明
  const lines = content.split('\n');
  const title = lines.find(line => line.startsWith('# '))?.replace('# ', '');
  const description = lines.find(line => line.includes('基本说明'))?.split('\n')[0];
  
  // 提取例句
  const examples = [];
  lines.forEach(line => {
    const jpMatch = line.match(/「([^」]+)」/);
    const cnMatch = line.match(/（([^）]+)）/);
    if (jpMatch && cnMatch) {
      examples.push({
        japanese: jpMatch[1],
        chinese: cnMatch[1]
      });
    }
  });

  if (title) {
    sections[category].push({
      title,
      file,
      description: description?.replace('基本说明', '').trim(),
      examples
    });
  }
});

// 生成索引内容
let indexContent = '# 日语语法点索引\n\n';

// 只显示有内容的分类
Object.entries(sections).forEach(([section, points]) => {
  if (points.length > 0) {
    indexContent += `## ${section}\n\n`;
    points.forEach(point => {
      indexContent += `### ${point.title}\n`;
      indexContent += `[详细说明](${point.file})\n\n`;
      if (point.description) {
        indexContent += `${point.description}\n\n`;
      }
      if (point.examples.length > 0) {
        indexContent += '例句：\n';
        point.examples.slice(0, 2).forEach(example => {
          indexContent += `- 「${example.japanese}」（${example.chinese}）\n`;
        });
        indexContent += '\n';
      }
    });
  }
});

// 写入索引文件
fs.writeFileSync(path.join(grammarDir, 'index.md'), indexContent);
console.log('Index has been updated successfully!');