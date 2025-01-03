import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { marked } from 'marked';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GRAMMAR_DIR = path.join(__dirname, '..', 'grammar');
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const CATEGORIES = ['particles', 'expressions', 'forms', 'conjunctions', 'honorifics'];

/**
 * Parse markdown file to extract metadata
 * @param {string} content - Markdown file content
 * @returns {Object} Metadata object
 */
function parseMarkdown(content) {
  const metadata = {};
  
  // Parse the markdown content
  const tokens = marked.lexer(content);
  
  // Extract title
  if (tokens[0]?.type === 'heading' && tokens[0]?.depth === 1) {
    metadata.title = tokens[0].text.split('/')[0].trim();
  }
  
  // Extract basic info
  const text = content.toString();
  const categoryMatch = text.match(/\u7c7b\u522b\uff08Category\uff09: (\w+)/);
  metadata.category = categoryMatch ? categoryMatch[1] : '';
  
  const jlptMatch = text.match(/JLPT\u7ea7\u522b: (N[1-5])/);
  metadata.jlpt = jlptMatch ? jlptMatch[1] : '';
  
  const difficultyMatch = text.match(/\u96be\u5ea6: (\S+)/);
  metadata.difficulty = difficultyMatch ? difficultyMatch[1] : '';
  
  // Extract tags
  const tagsMatch = text.match(/\u6807\u7b7e: \[(.*?)\]/);
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
  
  // Add intro
  content += '本索引按照语法类型分类整理。\n\n';
  
  // Add last update time
  content += `最后更新：${new Date().toISOString().split('T')[0]}\n\n`;
  
  // Add statistics
  content += '## 统计信息\n\n';
  content += `- 总条目：${items.length}\n`;
  for (const cat of CATEGORIES) {
    const count = items.filter(item => item.category === cat).length;
    content += `- ${cat}：${count}\n`;
  }
  content += '\n';

  // Group by category
  const groupedItems = {};
  CATEGORIES.forEach(cat => {
    groupedItems[cat] = items.filter(item => item.category === cat)
      .sort((a, b) => a.title.localeCompare(b.title));
  });
  
  // Generate content for each category
  CATEGORIES.forEach(cat => {
    const categoryItems = groupedItems[cat];
    if (categoryItems.length > 0) {
      content += `\n## ${cat}\n\n`;
      categoryItems.forEach(item => {
        content += `- [${item.title}](./${cat}/${item.filename})`;
        if (item.jlpt) content += ` (${item.jlpt})`;
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
    if (!await fs.pathExists(categoryPath)) continue;
    
    const files = await glob('*.md', { cwd: categoryPath });
    
    for (const file of files) {
      const content = await fs.readFile(path.join(categoryPath, file), 'utf8');
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
  await fs.outputFile(path.join(GRAMMAR_DIR, 'index.md'), markdownContent);
  
  // Generate and write JSON
  const jsonContent = generateJson(items);
  await fs.outputFile(
    path.join(DOCS_DIR, 'grammar-points.json'),
    JSON.stringify(jsonContent, null, 2)
  );

  console.log(`Updated index with ${items.length} grammar points`);
}

// Run the script
main().catch(console.error);
