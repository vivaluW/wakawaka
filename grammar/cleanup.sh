#!/bin/bash

# Files that have been migrated
MIGRATED_FILES=(
  "conditional_to.md"
  "nakereba_naranai.md"
)

# Create a commit message
COMMIT_MSG="chore: remove migrated files

Removed files that have been migrated to expressions/:
"

for file in "${MIGRATED_FILES[@]}"; do
  if [ -f "$file" ]; then
    COMMIT_MSG="$COMMIT_MSG\n- $file"
    git rm "$file"
  else
    echo "File $file does not exist"
  fi
done

# Commit the changes
if git status --porcelain | grep -q '^D'; then
  git commit -m "${COMMIT_MSG}"
fi