# Trạng thái Migration Hệ thống Độ khẩn

## 🎯 Mục tiêu

Thay thế hệ thống độ khẩn không thống nhất (normal/high/urgent, NORMAL/HIGH/URGENT) bằng hệ thống mới với 4 mức độ:

- **Khẩn** - `URGENCY_LEVELS.KHAN`
- **Thượng khẩn** - `URGENCY_LEVELS.THUONG_KHAN`
- **Hỏa tốc** - `URGENCY_LEVELS.HOA_TOC`
- **Hỏa tốc hẹn giờ** - `URGENCY_LEVELS.HOA_TOC_HEN_GIO`

## ✅ Đã hoàn thành

### Core System

- [x] `lib/types/urgency.ts` - Type definitions và utilities
- [x] `components/urgency-badge.tsx` - Badge components
- [x] `components/urgency-select.tsx` - Select components
- [x] `lib/types/urgency-examples.tsx` - Usage examples
- [x] `app/(authenticated)/demo-urgency/page.tsx` - Demo page

### Files đã migrate

- [x] `app/(authenticated)/van-ban-di/page.tsx`

  - ✅ Interface updated: `priority` → `urgencyLevel: UrgencyLevel`
  - ✅ Function updated: `getPriorityBadge` → `getUrgencyBadge`
  - ✅ Usage updated: `doc.priority` → `doc.urgencyLevel`

- [x] `app/(authenticated)/van-ban-den/page.tsx`

  - ✅ Interface updated: `priority` → `urgencyLevel: UrgencyLevel`
  - ✅ Function updated: `getPriorityBadge` → `getUrgencyBadge`
  - ✅ Usage updated: `doc.priority` → `doc.urgencyLevel`

- [x] `app/(authenticated)/van-ban-di/them-moi/noi-bo/tao-moi/page.tsx`

  - ✅ Form data: `priority: "normal"` → `urgencyLevel: URGENCY_LEVELS.KHAN`
  - ✅ SelectItems replaced with new values
  - ✅ API calls updated

- [x] `app/(authenticated)/van-ban-den/[id]/page.tsx`

  - ✅ Badge replaced: Complex conditional → `<UrgencyBadge level={...} />`
  - ✅ Imports added

- [x] `app/(authenticated)/van-ban-di/them-moi/ben-ngoai/tao-moi/page.tsx`

  - ✅ Replaced Select with `<UrgencySelect />` component
  - ✅ Form data updated
  - ✅ Imports added

- [x] `app/(authenticated)/van-ban-di/them-moi/components/approval-section.tsx`
  - ✅ SelectItems replaced with new URGENCY_LEVELS
  - ✅ Imports added

## 🔄 Đang thực hiện

### Files cần migrate tiếp

- [ ] `app/(authenticated)/van-ban-di/[id]/chinh-sua/page.tsx`
- [ ] `app/(authenticated)/van-ban-di/them-moi/ben-ngoai/tra-loi/page.tsx`
- [ ] `app/(authenticated)/van-ban-di/them-moi/noi-bo/tra-loi/page.tsx`
- [ ] `app/(authenticated)/van-ban-den/noi-bo/[id]/reply/page.tsx`
- [ ] `app/(authenticated)/van-ban-den/noi-bo/[id]/page.tsx`
- [ ] `app/(authenticated)/van-ban-di/noi-bo/[id]/page.tsx`
- [ ] `components/outgoing-document/OutgoingDocumentForm.tsx`
- [ ] `app/(authenticated)/van-ban-den/them-moi/components/document-info-form.tsx`

### Patterns cần thay thế

1. **SelectItem patterns:**

   ```tsx
   // Cũ
   <SelectItem value="normal">Bình thường</SelectItem>
   <SelectItem value="high">Cao</SelectItem>
   <SelectItem value="urgent">Khẩn</SelectItem>

   // Mới
   <SelectItem value={URGENCY_LEVELS.KHAN}>Khẩn</SelectItem>
   <SelectItem value={URGENCY_LEVELS.THUONG_KHAN}>Thượng khẩn</SelectItem>
   <SelectItem value={URGENCY_LEVELS.HOA_TOC}>Hỏa tốc</SelectItem>
   <SelectItem value={URGENCY_LEVELS.HOA_TOC_HEN_GIO}>Hỏa tốc hẹn giờ</SelectItem>
   ```

2. **Form data patterns:**

   ```tsx
   // Cũ
   priority: "normal";

   // Mới
   urgencyLevel: URGENCY_LEVELS.KHAN;
   ```

3. **Badge patterns:**

   ```tsx
   // Cũ
   const variants = {
     NORMAL: { variant: "outline", text: "Bình thường" },
     HIGH: { variant: "secondary", text: "Cao" },
     URGENT: { variant: "destructive", text: "Khẩn" },
   };

   // Mới
   <UrgencyBadge level={urgencyLevel} size="sm" />;
   ```

4. **Select component replacement:**

   ```tsx
   // Cũ
   <Select value={formData.priority} onValueChange={...}>
     <SelectTrigger>...</SelectTrigger>
     <SelectContent>
       <SelectItem value="normal">Bình thường</SelectItem>
       ...
     </SelectContent>
   </Select>

   // Mới
   <UrgencySelect
     value={formData.urgencyLevel}
     onValueChange={...}
     label="Độ khẩn"
     required
   />
   ```

## 📊 Tiến độ

- **Hoàn thành:** 6/14 files (43%)
- **Core system:** 100% ✅
- **Demo page:** 100% ✅
- **Main pages:** 50% ✅
- **Form pages:** 25% 🔄

## 🧪 Testing Status

- [x] Build successful ✅
- [x] Demo page accessible at `/demo-urgency` ✅
- [ ] Manual testing of migrated forms
- [ ] API compatibility testing
- [ ] End-to-end workflow testing

## 🚀 Next Steps

1. Complete remaining file migrations
2. Test all forms and workflows
3. Update API documentation if needed
4. Create migration guide for team
5. Deploy and monitor

## 📝 Notes

- Migration maintains backward compatibility through `migrateFromOldUrgency()` function
- New system is more extensible and type-safe
- Visual improvements with icons and better color coding
- Consistent UX across all forms and displays
