const fs = require('fs');
const path = require('path');

const grammarDir = path.join(__dirname, '../grammar');
const outputDir = '_site';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const grammarFiles = fs.readdirSync(grammarDir)
  .filter(file => file.endsWith('.md') && !file.includes('index') && !file.includes('README'));

const grammarPoints = {};

grammarFiles.forEach(file => {
  console.log(`Processing file: ${file}`);
  const content = fs.readFileSync(path.join(grammarDir, file), 'utf8');
  const grammarName = file.replace('.md', '');
  
  const examples = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const jpMatch = line.match(/「([^」]+)」/);
    if (jpMatch) {
      const cnMatch = line.match(/（([^）]+)）/);
      if (cnMatch) {
        console.log(`Found example: ${jpMatch[1]} - ${cnMatch[1]}`);
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

const outputPath = path.join(outputDir, 'grammar-points.json');
fs.writeFileSync(outputPath, JSON.stringify(grammarPoints, null, 2));

console.log(`Grammar points written to: ${outputPath}`);
console.log('Generated content:', JSON.stringify(grammarPoints, null, 2));
