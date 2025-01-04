#!/bin/bash
# Script to remove old grammar files that have been migrated

files_to_remove=(
  "conditional_to.md"
  "nakereba_naranai.md"
)

for file in "${files_to_remove[@]}"; do
  rm -f "$file"
  echo "Removed $file"
done