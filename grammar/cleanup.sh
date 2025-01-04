#!/bin/bash

# Files to keep
KEEP_FILES=(
  "README.md"
  "particles/"
  "expressions/"
  "forms/"
  "conjunctions/"
  "honorifics/"
)

# Make file list
FILE_LIST=$(ls grammar | grep -v -E "^($(echo "${KEEP_FILES[@]}" | tr ' ' '|'))")

# Delete files
echo "Files to be deleted:"
echo "$FILE_LIST"

for file in $FILE_LIST; do
  git rm "grammar/$file"
done

# Commit changes
git commit -m "chore: clean up grammar directory, keeping only subdirectories"