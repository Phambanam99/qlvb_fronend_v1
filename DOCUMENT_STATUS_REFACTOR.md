# Document Status Classification Refactor

## Tổng quan

Dự án đã có API `/api/documents/classification/{documentId}` để trả về trạng thái văn bản phù hợp với từng người dùng đăng nhập. Điều này cho phép đơn giản hóa logic phân loại trạng thái phức tạp ở frontend.

## API Classification Response

```json
{
  "statusDescription": "Chưa xử lý",
  "documentId": 1,
  "userName": "troly_phòng_1_1",
  "userId": 20,
  "status": "PENDING"
}
```

## Thay đổi đã thực hiện

### 1. Thêm API Service

- ✅ **File**: `lib/api/incomingDocuments.ts`
- ✅ **Thêm**: `DocumentClassificationResponse` interface
- ✅ **Thêm**: `getDocumentClassification()` API function

### 2. Tạo Custom Hook

- ✅ **File**: `hooks/use-document-classification.ts`
- ✅ **Hook**: `useDocumentClassification()` - Lấy classification cho 1 document
- ✅ **Hook**: `useMultipleDocumentClassifications()` - Lấy classification cho nhiều documents

### 3. Tạo Reusable Component

- ✅ **File**: `components/document-status-badge.tsx`
- ✅ **Features**:
  - Tự động gọi API classification
  - Fallback to static status nếu API fail
  - Loading state với spinner
  - Smart styling based on status content
  - Support cho cả tiếng Việt và tiếng Anh

### 4. Cập nhật Trang Văn bản đến

- ✅ **File**: `app/(authenticated)/van-ban-den/page.tsx`
- ✅ **Thay thế**: Status badge trong table sử dụng `DocumentStatusBadge`
- ✅ **Đánh dấu**: Logic cũ với comment DEPRECATED

## Logic cũ vs Logic mới

### Trước đây (Logic phức tạp ở Frontend)

```typescript
// Logic phức tạp phân loại theo vai trò
const getProcessingStatusByRole = (user: any) => {
  const roles = user?.roles || [];

  if (roles.includes("ROLE_CUC_TRUONG")) {
    return {
      not_processed: { displayName: "Chưa phân phối", statuses: [...] },
      processing: { displayName: "Đang xử lý", statuses: [...] },
      completed: { displayName: "Đã xử lý", statuses: [...] }
    };
  }
  // ... logic phức tạp cho từng role
};
```

### Bây giờ (API-based)

```typescript
// Đơn giản, chỉ cần gọi API
const { classification } = useDocumentClassification(documentId);
// classification.statusDescription = "Chưa xử lý" (theo user context)
```

## Lợi ích của approach mới

### 1. **Backend Centralized Logic**

- Logic phân loại trạng thái được tập trung ở backend
- Dễ maintain và update business rules
- Consistent across all clients

### 2. **Simplified Frontend**

- Loại bỏ ~150 dòng code phức tạp
- Component-based approach
- Reusable across project

### 3. **Better User Experience**

- Real-time status phù hợp với context user
- Loading states cho feedback tốt hơn
- Fallback mechanism cho reliability

### 4. **Performance**

- Hook với caching mechanism
- Batch requests cho multiple documents
- Smart re-fetching

## Kế hoạch tiếp theo

### Phase 1: Gradual Migration ✅ COMPLETED

- ✅ Implement API service và components
- ✅ Replace status display trong main table
- ✅ Testing và bug fixes

### Phase 2: Complete Replacement ✅ COMPLETED

- ✅ Replace tabs filtering logic với simplified approach
- ✅ Remove deprecated `getProcessingStatusByRole()`
- ✅ Remove deprecated `getStatusBadge()`
- ✅ Simplify status tabs to use basic categorization
- ⏳ Update other pages to use DocumentStatusBadge component

### Phase 3: Optimization

- [ ] Implement batch API cho multiple documents
- [ ] Add caching layer cho better performance
- [ ] Real-time updates với WebSocket/SSE

## Files cần update tiếp

### High Priority

- ✅ `app/(authenticated)/van-ban-den/page.tsx` - Replaced tabs logic and removed deprecated functions
- [ ] `app/(authenticated)/van-ban-den/[id]/page.tsx` - Update document detail page
- [ ] Dashboard status widgets

### Medium Priority

- [ ] Notification components
- [ ] Report/Statistics pages
- [ ] Search results pages

### Low Priority

- [ ] Admin panels
- [ ] Archive sections

## Testing Strategy

### Unit Tests

- [ ] API service functions
- [ ] Custom hooks
- [ ] Component rendering

### Integration Tests

- [ ] API endpoint behavior
- [ ] User role scenarios
- [ ] Error handling

### E2E Tests

- [ ] Full user workflows
- [ ] Status transitions
- [ ] Real-time updates

## Deployment Strategy

### 1. Feature Flag

- Deploy với feature flag để enable/disable
- Gradual rollout by user groups
- Quick rollback if issues

### 2. A/B Testing

- Compare old vs new approach
- Monitor performance metrics
- User feedback collection

### 3. Monitoring

- API response times
- Error rates
- User engagement metrics

## Risks & Mitigation

### Risk 1: API Performance

**Mitigation**: Caching, batch requests, loading states

### Risk 2: Backend Changes

**Mitigation**: Fallback mechanism, version compatibility

### Risk 3: User Confusion

**Mitigation**: Gradual rollout, user training, documentation
