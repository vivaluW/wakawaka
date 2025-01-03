import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GRAMMAR_DIR = path.join(__dirname, '..', 'grammar');
const REQUIRED_SECTIONS = [
  '## 基本意义',  // Basic Meaning
  '## 接续方式',  // Grammar Pattern
  '## 例句',      // Example Sentences
];

// Files and directories to exclude from validation
const EXCLUDED_PATTERNS = [
  /^readme\.md$/i,
  /^template\.md$/i,
  /^migration\.md$/i,
  /^index\.md$/i,
  /^config\.json$/,
  /^\.gitkeep$/,
  /^\./,  // Hidden files
  /^particles\//,
  /^expressions\//,
  /^forms\//,
  /^conjunctions\//,
  /^honorifics\//
];

/**
 * Check if a file should be excluded from validation
 * @param {string} relativePath - Relative path from grammar directory
 * @returns {boolean} - Whether the file should be excluded
 */
function shouldExclude(relativePath) {
  const basename = path.basename(relativePath).toLowerCase();
  return EXCLUDED_PATTERNS.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(basename) || pattern.test(relativePath);
    }
    return false;
  });
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
  const files = await glob('*.md', { cwd: GRAMMAR_DIR });

  for (const file of files) {
    // Skip excluded files
    if (shouldExclude(file)) {
      console.log(`Skipping excluded file: ${file}`);
      continue;
    }

    console.log(`Validating: ${file}`);
    const content = await fs.readFile(path.join(GRAMMAR_DIR, file), 'utf8');
    const missingSections = validateContent(content);
    if (missingSections.length > 0) {
      console.error(`File ${file} is missing required sections:\n${missingSections.map(s => ` - ${s}`).join('\n')}`);
      hasError = true;
    }
  }

  if (hasError) {
    process.exit(1);
  } else {
    console.log('All files passed validation.');
  }
}

// Run validation
main().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});