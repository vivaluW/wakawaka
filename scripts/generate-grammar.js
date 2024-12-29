const fs = require('fs');
const path = require('path');

// 读取 grammar 文件夹中的所有 .md 文件
const grammarDir = path.join(__dirname, '../grammar');
const grammarFiles = fs.readdirSync(grammarDir)
  .filter(file => file.endsWith('.md') && !file.includes('index') && !file.includes('README'));

// 存储所有语法点数据
const grammarPoints = {};

// 处理每个文件
grammarFiles.forEach(file => {
  const content = fs.readFileSync(path.join(grammarDir, file), 'utf8');
  const grammarName = file.replace('.md', '');
  
  // 提取例句
  const examples = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // 匹配日语例句（在「」中的内容）
    const jpMatch = line.match(/「([^」]+)」/);
    if (jpMatch) {
      // 查找相应的中文翻译（在（）中的内容）
      const cnMatch = line.match(/（([^）]+)）/);
      if (cnMatch) {
        examples.push({
          japanese: jpMatch[1],
          chinese: cnMatch[1],
          points: [grammarName] // 添加语法点标记
        });
      }
    }
  });

  if (examples.length > 0) {
    grammarPoints[grammarName] = {
      patterns: examples
    };
  }
});

// 确保 public 文件夹存在
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// 写入 JSON 文件
fs.writeFileSync(
  'public/grammar-points.json',
  JSON.stringify(grammarPoints, null, 2)
);

console.log('Grammar points JSON has been generated successfully!');
