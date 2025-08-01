#!/bin/bash
# Fix Next.js 15 params type for all page.tsx files

echo "Fixing Next.js 15 params type across all page files..."

# Find all page.tsx files with params
find app -name "page.tsx" -exec grep -l "params: { id: string" {} \; | while read file; do
echo "Fixing $file..."

# Replace the params type
sed -i 's/params: { id: string }/params: Promise<{ id: string }>/g' "$file"
    sed -i 's/params: { id: string; responseId: string }/params: Promise<{ id: string; responseId: string }>/g' "$file"

        # Add use import if not present
        if ! grep -q "import.*use.*from.*react" "$file"; then
        # Find the first react import and add use to it
        sed -i 's/import { \([^}]*\) } from "react"/import { \1, use } from "react"/g' "$file"
        fi

        # Add unwrapping if direct params usage is found
        if grep -q "const { id } = params" "$file"; then
        sed -i 's/const { id } = params/const unwrappedParams = use(params); const { id } = unwrappedParams/g' "$file"
        fi

        if grep -q "const { id, responseId } = params" "$file"; then
        sed -i 's/const { id, responseId } = params/const unwrappedParams = use(params); const { id, responseId } = unwrappedParams/g' "$file"
        fi
        done

        echo "✅ Fixed Next.js 15 params type for all page files"