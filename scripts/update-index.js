const fs = require('fs');
const path = require('path');

// 读取所有grammar文件
const grammarDir = path.join(__dirname, '../grammar');
const grammarFiles = fs.readdirSync(grammarDir)
  .filter(file => file.endsWith('.md') && !file.includes('index') && !file.includes('README'));

// 生成索引内容
let indexContent = '# 日语语法点索引\n\n';

// 处理每个文件
grammarFiles.forEach(file => {
  const content = fs.readFileSync(path.join(grammarDir, file), 'utf8');
  const grammarName = file.replace('.md', '');
  
  // 提取第一个标题和基本说明
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

  // 将信息添加到索引中
  if (title) {
    indexContent += `## ${title}\n`;
    indexContent += `[详细说明](${file})\n\n`;
    
    if (description) {
      indexContent += `${description}\n\n`;
    }
    
    if (examples.length > 0) {
      indexContent += '例句：\n';
      examples.slice(0, 2).forEach(example => {
        indexContent += `- 「${example.japanese}」（${example.chinese}）\n`;
      });
      indexContent += '\n';
    }
  }
});

// 写入索引文件
fs.writeFileSync(
  path.join(grammarDir, 'index.md'),
  indexContent
);

console.log('Index has been updated successfully!');
