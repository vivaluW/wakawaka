async function parseMarkdown(content) {
  const lines = content.split('\n');
  let grammar = {
    title: '',
    description: '',
    examples: []
  };

  let currentExample = null;
  let isInExamples = false;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      grammar.title = line.substring(2).trim();
    } else if (line.startsWith('## 意义')) {
      isInExamples = false;
    } else if (!line.startsWith('##') && !isInExamples && line.trim() && !grammar.description) {
      grammar.description = line.trim();
    } else if (line.startsWith('## 例句')) {
      isInExamples = true;
    } else if (isInExamples && /^\d+\./.test(line)) {
      if (currentExample) {
        grammar.examples.push(currentExample);
      }
      currentExample = {
        japanese: line.replace(/^\d+\.\s*/, '').trim(),
        chinese: '',
        points: []
      };
    } else if (isInExamples && line.startsWith('   - ') && currentExample) {
      if (!currentExample.chinese) {
        currentExample.chinese = line.replace(/^\s*-\s*/, '').trim();
      } else {
        currentExample.points.push(line.replace(/^\s*-\s*/, '').trim());
      }
    }
  }

  if (currentExample) {
    grammar.examples.push(currentExample);
  }

  return grammar;
}

export async function loadGrammarPoints() {
  const response = await fetch('https://api.github.com/repos/vivaluW/wakawaka/contents/grammar');
  const files = await response.json();
  
  const grammarPoints = {};
  
  for (const file of files) {
    if (file.name.endsWith('.md') && !file.name.includes('index') && !file.name.includes('marksheet')) {
      const contentResponse = await fetch(file.download_url);
      const content = await contentResponse.text();
      const grammar = await parseMarkdown(content);
      
      grammarPoints[grammar.title] = {
        status: 'learning',
        description: grammar.description,
        examples: grammar.examples
      };
    }
  }
  
  return grammarPoints;
}
