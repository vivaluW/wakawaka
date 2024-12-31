const fs = require('fs');
const path = require('path');

const grammarDir = path.join(__dirname, '../grammar');
const outputDir = '_site';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 定义语法点分类
const categoryMap = {
  'basic_grammar_points': '基本语法',
  'noni': '转折表达',
  'te_shimau': '状态变化',
  'node': '原因和结果',
  'conditional_to': '转折表达',
  'complex_sentence_patterns': '转折表达',
  'ga_conjunction': '转折表达'
};

// 读取所有语法文件
const grammarFiles = fs.readdirSync(grammarDir)
  .filter(file => file.endsWith('.md') && !file.includes('index') && !file.includes('README'));

const grammarPoints = {};
const structure = {
  '基本语法': [],
  '转折表达': [],
  '原因和结果': [],
  '状态变化': []
};

// 处理每个文件
grammarFiles.forEach(file => {
  const content = fs.readFileSync(path.join(grammarDir, file), 'utf8');
  const grammarName = file.replace('.md', '');
  const category = categoryMap[grammarName] || '基本语法';
  
  // 提取标题和说明
  const lines = content.split('\n');
  const title = lines.find(line => line.startsWith('# '))?.replace('# ', '');
  
  // 提取例句
  const examples = [];
  lines.forEach(line => {
    const jpMatch = line.match(/「([^」]+)」/);
    if (jpMatch) {
      const cnMatch = line.match(/（([^）]+)）/);
      if (cnMatch) {
        examples.push({
          japanese: jpMatch[1],
          chinese: cnMatch[1],
          points: [grammarName],
          category: category
        });
      }
    }
  });

  if (examples.length > 0) {
    grammarPoints[grammarName] = {
      patterns: examples,
      category: category,
      title: title
    };
    structure[category].push({
      name: grammarName,
      title: title,
      examples: examples.slice(0, 2)
    });
  }
});

// 写入JSON文件
const outputPath = path.join(outputDir, 'grammar-points.json');
fs.writeFileSync(outputPath, JSON.stringify({
  structure: structure,
  points: grammarPoints
}, null, 2));

console.log('Grammar points JSON has been generated successfully!');
console.log('Generated points:', Object.keys(grammarPoints).join(', '));