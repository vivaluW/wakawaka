const fs = require('fs');
const path = require('path');

const grammarDir = path.join(__dirname, '../grammar');
const grammarFiles = fs.readdirSync(grammarDir)
  .filter(file => file.endsWith('.md') && !file.includes('index') && !file.includes('README'));

const grammarPoints = {};

grammarFiles.forEach(file => {
  const content = fs.readFileSync(path.join(grammarDir, file), 'utf8');
  const grammarName = file.replace('.md', '');
  
  const examples = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const jpMatch = line.match(/「([^」]+)」/);
    if (jpMatch) {
      const cnMatch = line.match(/（([^）]+)）/);
      if (cnMatch) {
        examples.push({
          japanese: jpMatch[1],
          chinese: cnMatch[1],
          points: [grammarName]
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

const outputDir = '_site';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'grammar-points.json'),
  JSON.stringify(grammarPoints, null, 2)
);

console.log('Grammar points JSON has been generated successfully!');