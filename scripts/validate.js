import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GRAMMAR_DIR = path.join(__dirname, '..', 'grammar');
const REQUIRED_SECTIONS = [
  '## 基本信息',  // Basic Information
  '## 基本意义',  // Basic Meaning
  '## 接续方式',  // Grammar Pattern
  '## 例句',      // Example Sentences
];

// Files to exclude from validation
const EXCLUDED_FILES = [
  'readme.md',
  'template.md',
  'migration.md',
  'index.md',
];

/**
 * Validate file naming
 * @param {string} filename - File name to validate
 * @returns {boolean} - Whether the file name is valid
 */
function validateFileName(filename) {
  if (EXCLUDED_FILES.includes(filename.toLowerCase())) return true;
  return /^[a-z0-9_-]+\.md$/.test(filename);
}

/**
 * Validate file content
 * @param {string} content - File content to validate
 * @returns {string[]} - Missing required sections
 */
function validateContent(content) {
  const missing = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!content.includes(section)) {
      missing.push(section);
    }
  }
  return missing;
}

/**
 * Main validation function
 */
async function main() {
  let hasError = false;
  const files = await glob('**/*.md', { cwd: GRAMMAR_DIR });

  for (const file of files) {
    // Check file name
    if (!validateFileName(path.basename(file))) {
      console.error(`File ${file} has invalid naming format. Use only lowercase letters, numbers, underscores and hyphens.`);
      hasError = true;
    }

    // Check content
    const content = await fs.readFile(path.join(GRAMMAR_DIR, file), 'utf8');
    const missingSections = validateContent(content);
    if (missingSections.length > 0) {
      console.error(`File ${file} is missing required sections:\n${missingSections.map(s => ` - ${s}`).join('\n')}`);
      hasError = true;
    }
  }

  if (hasError) {
    process.exit(1);
  }
  console.log('All files passed validation.');
}

// Run validation
main().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});