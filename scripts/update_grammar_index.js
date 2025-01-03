// Grammar Index Generator

const fs = require('fs');
const path = require('path');

// Configuration
const GRAMMAR_DIR = 'grammar';
const CATEGORIES = ['particles', 'expressions', 'forms', 'conjunctions', 'honorifics'];

/**
 * Parse markdown file to extract metadata
 * @param {string} content - Markdown file content
 * @returns {Object} Metadata object
 */
function parseMarkdown(content) {
  const metadata = {};
  
  // Extract title
  const titleMatch = content.match(/^# (.+)/);
  metadata.title = titleMatch ? titleMatch[1] : '';
  
  // Extract basic info
  const categoryMatch = content.match(/\u7c7b\u522b\uff08Category\uff09: (\w+)/);
  metadata.category = categoryMatch ? categoryMatch[1] : '';
  
  const jlptMatch = content.match(/JLPT\u7ea7\u522b: (N[1-5])/);
  metadata.jlpt = jlptMatch ? jlptMatch[1] : '';
  
  const difficultyMatch = content.match(/\u96be\u5ea6: (\S+)/);
  metadata.difficulty = difficultyMatch ? difficultyMatch[1] : '';
  
  // Extract tags
  const tagsMatch = content.match(/\u6807\u7b7e: \[(.*?)\]/);
  metadata.tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : [];
  
  return metadata;
}

/**
 * Generate markdown index
 * @param {Object[]} items - Array of grammar items with metadata
 * @returns {string} Generated markdown content
 */
function generateMarkdownIndex(items) {
  let content = '# 日语语法索引\n\n';
  
  // Group by category
  const groupedItems = {};
  CATEGORIES.forEach(cat => {
    groupedItems[cat] = items.filter(item => item.category === cat);
  });
  
  // Generate content for each category
  CATEGORIES.forEach(cat => {
    const categoryItems = groupedItems[cat];
    if (categoryItems.length > 0) {
      content += `\n## ${cat}\n\n`;
      categoryItems.forEach(item => {
        content += `- [${item.title}](./${cat}/${item.filename}) (${item.jlpt})`;
        if (item.tags.length > 0) {
          content += ` [${item.tags.join(', ')}]`;
        }
        content += '\n';
      });
    }
  });
  
  return content;
}

/**
 * Generate JSON for frontend
 * @param {Object[]} items - Array of grammar items with metadata
 * @returns {Object} Structured JSON data
 */
function generateJson(items) {
  return {
    grammar_points: items.map(item => ({
      title: item.title,
      path: `${item.category}/${item.filename}`,
      category: item.category,
      jlpt: item.jlpt,
      difficulty: item.difficulty,
      tags: item.tags
    })),
    categories: CATEGORIES.map(cat => ({
      name: cat,
      count: items.filter(item => item.category === cat).length
    })),
    metadata: {
      total_count: items.length,
      last_updated: new Date().toISOString(),
      jlpt_distribution: {
        N1: items.filter(i => i.jlpt === 'N1').length,
        N2: items.filter(i => i.jlpt === 'N2').length,
        N3: items.filter(i => i.jlpt === 'N3').length,
        N4: items.filter(i => i.jlpt === 'N4').length,
        N5: items.filter(i => i.jlpt === 'N5').length
      }
    }
  };
}

/**
 * Main function to update indexes
 */
async function main() {
  const items = [];
  
  // Scan all grammar files
  for (const category of CATEGORIES) {
    const categoryPath = path.join(GRAMMAR_DIR, category);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(categoryPath, file), 'utf8');
      const metadata = parseMarkdown(content);
      items.push({
        ...metadata,
        filename: file,
        category
      });
    }
  }
  
  // Generate and write index.md
  const markdownContent = generateMarkdownIndex(items);
  fs.writeFileSync(path.join(GRAMMAR_DIR, 'index.md'), markdownContent);
  
  // Generate and write JSON
  const jsonContent = generateJson(items);
  fs.writeFileSync(
    path.join('docs', 'grammar-points.json'),
    JSON.stringify(jsonContent, null, 2)
  );
}

// Run the script
main().catch(console.error);
