#!/bin/bash

# Script to migrate old urgency system to new unified system

echo "Starting urgency system migration..."

# Files to update
FILES=(
  "app/(authenticated)/van-ban-di/[id]/chinh-sua/page.tsx"
  "app/(authenticated)/van-ban-di/them-moi/ben-ngoai/tra-loi/page.tsx"
  "app/(authenticated)/van-ban-di/them-moi/ben-ngoai/tao-moi/page.tsx"
  "app/(authenticated)/van-ban-di/them-moi/noi-bo/tra-loi/page.tsx"
  "app/(authenticated)/van-ban-den/noi-bo/[id]/reply/page.tsx"
  "app/(authenticated)/van-ban-den/noi-bo/[id]/page.tsx"
  "app/(authenticated)/van-ban-di/noi-bo/[id]/page.tsx"
  "app/(authenticated)/van-ban-den/[id]/page.tsx"
  "components/outgoing-document/OutgoingDocumentForm.tsx"
  "app/(authenticated)/van-ban-den/them-moi/components/document-info-form.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Add imports if not already present
    if ! grep -q "import.*UrgencyLevel.*from.*@/lib/types/urgency" "$file"; then
      # Find the last import line and add after it
      sed -i '/^import.*from.*$/a import { UrgencyLevel, URGENCY_LEVELS, migrateFromOldUrgency } from "@/lib/types/urgency";\nimport { UrgencyBadge } from "@/components/urgency-badge";' "$file"
    fi
    
    # Replace SelectItem values
    sed -i 's/<SelectItem value="normal">Bình thường<\/SelectItem>/<SelectItem value={URGENCY_LEVELS.KHAN}>Khẩn<\/SelectItem>/g' "$file"
    sed -i 's/<SelectItem value="high">Cao<\/SelectItem>/<SelectItem value={URGENCY_LEVELS.THUONG_KHAN}>Thượng khẩn<\/SelectItem>/g' "$file"
    sed -i 's/<SelectItem value="urgent">Khẩn<\/SelectItem>/<SelectItem value={URGENCY_LEVELS.HOA_TOC}>Hỏa tốc<\/SelectItem>/g' "$file"
    
    # Add the fourth option after the third
    sed -i 's/<SelectItem value={URGENCY_LEVELS.HOA_TOC}>Hỏa tốc<\/SelectItem>/<SelectItem value={URGENCY_LEVELS.HOA_TOC}>Hỏa tốc<\/SelectItem>\n                      <SelectItem value={URGENCY_LEVELS.HOA_TOC_HEN_GIO}>Hỏa tốc hẹn giờ<\/SelectItem>/g' "$file"
    
    # Replace priority with urgencyLevel in form data
    sed -i 's/priority: "normal"/urgencyLevel: URGENCY_LEVELS.KHAN/g' "$file"
    sed -i 's/priority: "high"/urgencyLevel: URGENCY_LEVELS.THUONG_KHAN/g' "$file"
    sed -i 's/priority: "urgent"/urgencyLevel: URGENCY_LEVELS.HOA_TOC/g' "$file"
    
    echo "Completed $file"
  else
    echo "File not found: $file"
  fi
done

echo "Migration script completed!"
echo "Please review the changes and test the application." 