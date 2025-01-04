// Script to clean up grammar directory
const fs = require('fs');
const path = require('path');

// Files to keep
const KEEP_FILES = [
  'README.md',
  'particles',
  'expressions',
  'forms',
  'conjunctions',
  'honorifics'
];

// Create empty directories
KEEP_FILES.forEach(file => {
  if (file.endsWith('/')) {
    fs.mkdirSync(path.join('grammar', file), { recursive: true });
  }
});

// Delete all other files
fs.readdirSync('grammar').forEach(file => {
  if (!KEEP_FILES.includes(file)) {
    fs.unlinkSync(path.join('grammar', file));
  }
});
