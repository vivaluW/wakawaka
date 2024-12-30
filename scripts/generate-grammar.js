const fs = require('fs');
const path = require('path');

const grammarDir = path.join(__dirname, '../grammar');
const outputDir = '_site';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const indexContent = fs.readFileSync(path.join(grammarDir, 'index.md'), 'utf8');
const sections = indexContent.split('##').slice(1);
const grammarStructure = {};

sections.forEach(section => {
  const [title, ...content] = section.trim().split('\n');
  const sectionName = title.trim();
  grammarStructure[sectionName] = content.filter(line => line.trim());
});

const grammarFiles = fs.readdirSync(grammarDir)
  .filter(file => file.endsWith('.md') && !file.includes('index') && !file.includes('README'));

const grammarPoints = {};

grammarFiles.forEach(file => {
  const content = fs.readFileSync(path.join(grammarDir, file), 'utf8');
  const grammarName = file.replace('.md', '');
  
  const examples = [];
  const lines = content.split('\n');
  let category = '';
  
  Object.keys(grammarStructure).forEach(section => {
    if (grammarStructure[section].some(line => line.includes(grammarName))) {
      category = section;
    }
  });
  
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
      category: category
    };
  }
});

const outputPath = path.join(outputDir, 'grammar-points.json');
fs.writeFileSync(outputPath, JSON.stringify({
  structure: grammarStructure,
  points: grammarPoints
}, null, 2));
