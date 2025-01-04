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

// Files to exclude from validation
const EXCLUDED_FILES = [
  'readme.md',
  'template.md',
  'migration.md',
  'index.md',
  '.gitkeep',
  'config.json',
  'grammar-points.json',
  'deleted.md',
  'conditional_to.md',     // Migrated
  'nakereba_naranai.md',   // Migrated
  'te_hoshii.md'           // Migrated
];

// Directories that should be validated
const GRAMMAR_DIRS = [
  'particles',
  'expressions',
  'forms',
  'conjunctions',
  'honorifics'
];

/**
 * Check if a file should be excluded from validation
 * @param {string} filepath - File path to check
 * @returns {boolean} - Whether the file should be excluded
 */
function shouldExclude(filepath) {
  const basename = path.basename(filepath).toLowerCase();
  if (EXCLUDED_FILES.includes(basename)) {
    console.log(`Skipping excluded file: ${basename}`);
    return true;
  }
  return false;
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

  for (const dir of GRAMMAR_DIRS) {
    const dirPath = path.join(GRAMMAR_DIR, dir);
    if (!await fs.pathExists(dirPath)) {
      console.log(`Skipping non-existent directory: ${dir}`);
      continue;
    }

    console.log(`\nValidating files in ${dir}/`);
    const files = await glob('*.md', { cwd: dirPath });

    for (const file of files) {
      if (shouldExclude(file)) continue;

      const fullPath = path.join(dirPath, file);
      console.log(`Checking: ${path.join(dir, file)}`);

      try {
        const content = await fs.readFile(fullPath, 'utf8');
        const missingSections = validateContent(content);

        if (missingSections.length > 0) {
          console.error(`File ${path.join(dir, file)} is missing required sections:\n${missingSections.map(s => ` - ${s}`).join('\n')}`);
          hasError = true;
        } else {
          console.log(`✔ ${path.join(dir, file)} passed validation`);
        }
      } catch (error) {
        console.error(`Error reading file ${path.join(dir, file)}: ${error.message}`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    process.exit(1);
  } else {
    console.log('\n✅ All files passed validation.');
  }
}

// Run validation
main().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});