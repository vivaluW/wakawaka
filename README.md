# WakaWaka Japanese Learning Platform

## Project Structure

```
.
├── grammar/           # Grammar documentation
│   ├── particles/     # Particle-related grammar
│   ├── expressions/    # Expression-related grammar
│   ├── forms/         # Grammar forms
│   ├── conjunctions/   # Conjunction-related grammar
│   └── honorifics/     # Honorific-related grammar
├── scripts/          # Utility scripts
│   └── update_grammar_index.js  # Index generator
├── docs/             # Generated documentation
└── package.json      # Project configuration

## Features

- Organized grammar points by category
- Automatic index generation
- Markdown-based documentation
- JSON output for frontend integration

## Development

### Setup

```bash
npm install
```

### Update Grammar Index

```bash
npm run update-index
```

## Contributing

1. Place grammar files in appropriate category folders
2. Follow the template format
3. Run index update script
4. Commit changes
