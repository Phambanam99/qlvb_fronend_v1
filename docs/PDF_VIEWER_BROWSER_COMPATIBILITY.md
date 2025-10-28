# Hướng dẫn khắc phục PDF Viewer trên trình duyệt cũ

## Tổng quan vấn đề

File `lib/utils/pdf-viewer.ts` gặp vấn đề tương thích với các trình duyệt cũ (IE11, Edge Legacy, Safari cũ, v.v.) do sử dụng các tính năng JavaScript hiện đại và API không được hỗ trợ rộng rãi.

## Nguyên nhân chi tiết

### 1. **ES6+ Syntax**
- **Arrow functions** (`=>`) - Không hỗ trợ trên IE11
- **const/let** - Không hỗ trợ trên IE11
- **Template literals** (`` `${var}` ``) - Không hỗ trợ trên IE11
- **Default parameters** - Hỗ trợ hạn chế

**Giải pháp**: Cần transpile code xuống ES5 qua Babel/TypeScript

### 2. **URLSearchParams API**
```typescript
// Không hoạt động trên IE11
const params = new URLSearchParams();
```

**Giải pháp**: Đã thay thế bằng `buildQueryString()` tự viết

### 3. **Blob URL API**
- Một số trình duyệt cũ không hỗ trợ `window.URL.createObjectURL()`
- Cần sử dụng vendor prefixes (`webkitURL`, `mozURL`)

**Giải pháp**: Đã thêm fallback với vendor prefixes

### 4. **Popup Blockers**
- `window.open()` với Blob URLs thường bị block trên trình duyệt cũ

**Giải pháp**: Đã thêm fallback download file

### 5. **Blob Constructor**
- IE10 và thấp hơn không hỗ trợ `new Blob()`

**Giải pháp**: Cần polyfill hoặc kiểm tra feature

## Các cải tiến đã thực hiện

### 1. Feature Detection thực sự
```typescript
export const supportsPDFViewing = (): boolean => {
  try {
    // Kiểm tra Blob URLs
    if (!window.URL || !window.URL.createObjectURL) return false;

    // Kiểm tra Blob constructor
    if (typeof Blob === 'undefined') return false;

    // Test thực tế
    const testBlob = new Blob(['test'], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(testBlob);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    return false;
  }
};
```

### 2. Vendor Prefix Support
```typescript
// Hỗ trợ webkit và moz prefixes
const URL = window.URL || (window as any).webkitURL || (window as any).mozURL;
```

### 3. URLSearchParams Polyfill
```typescript
const buildQueryString = (params: Record<string, string>): string => {
  const parts: string[] = [];
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
  }
  return parts.join('&');
};
```

### 4. Graceful Degradation
```typescript
// Fallback tự động khi window.open() thất bại
if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
  downloadFile(blob, title || 'document.pdf');
  return null;
}
```

## Các bước cấu hình bổ sung

### 1. Đảm bảo Babel/TypeScript transpile đúng

Kiểm tra `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES5",  // Hoặc ES2015 tùy yêu cầu
    "lib": ["ES2015", "DOM"],
    "downlevelIteration": true
  }
}
```

Kiểm tra `next.config.mjs`:
```javascript
export default {
  // Transpile để hỗ trợ IE11
  transpilePackages: [],

  compiler: {
    // Đảm bảo tương thích
  }
}
```

### 2. Thêm Polyfills cần thiết

Tạo file `lib/polyfills.ts`:
```typescript
// Polyfill cho IE11
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill cho Array.from
if (!Array.from) {
  Array.from = function(arrayLike: any) {
    return Array.prototype.slice.call(arrayLike);
  };
}

// Polyfill cho Object.assign
if (typeof Object.assign !== 'function') {
  Object.assign = function(target: any, ...sources: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    const to = Object(target);

    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];

      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }

    return to;
  };
}
```

Import trong `app/layout.tsx`:
```typescript
import '@/lib/polyfills';
```

### 3. Thêm Core-js cho polyfills đầy đủ

```bash
npm install core-js
```

Trong `app/layout.tsx`:
```typescript
import 'core-js/stable';
import 'core-js/features/url-search-params';
import 'core-js/features/promise';
```

### 4. Cấu hình Browserslist

Tạo/cập nhật `.browserslistrc`:
```
> 0.5%
last 2 versions
Firefox ESR
not dead
IE 11
```

Hoặc trong `package.json`:
```json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "Firefox ESR",
    "not dead",
    "IE 11"
  ]
}
```

## Cách sử dụng an toàn

### 1. Luôn kiểm tra feature trước khi dùng
```typescript
import { supportsPDFViewing } from '@/lib/utils/pdf-viewer';

if (supportsPDFViewing()) {
  // Sử dụng PDF viewer
  openPDFInNewWindow(blob, title);
} else {
  // Fallback: download file
  downloadFile(blob, filename);
}
```

### 2. Wrap trong try-catch
```typescript
try {
  const url = createPDFBlobUrl(blob);
  // Sử dụng URL...
} catch (error) {
  // Xử lý lỗi hoặc fallback
  console.error('Browser không hỗ trợ:', error);
  downloadFile(blob, filename);
}
```

### 3. Hiển thị thông báo cho người dùng
```typescript
if (!supportsPDFViewing()) {
  alert('Trình duyệt của bạn không hỗ trợ xem PDF trực tuyến. Vui lòng tải file về máy.');
}
```

## Testing trên các trình duyệt cũ

### 1. **Internet Explorer 11**
- Cài đặt IE11 Developer Mode trong Windows
- Hoặc sử dụng Virtual Machine với Windows 7/8/10 + IE11

### 2. **Edge Legacy (EdgeHTML)**
- Sử dụng BrowserStack hoặc Sauce Labs
- Hoặc VM với Windows 10 pre-Chromium Edge

### 3. **Safari cũ**
- Testing trên macOS cũ hoặc iOS devices
- Sử dụng Safari Technology Preview

### 4. **Mobile browsers cũ**
- Android 4.x với Chrome/Browser cũ
- iOS 9-11 với Safari cũ

## Checklist tương thích

- ✅ Feature detection thực sự cho PDF viewing
- ✅ Vendor prefixes cho URL API
- ✅ Polyfill cho URLSearchParams
- ✅ Graceful degradation với fallback download
- ✅ Error handling đầy đủ
- ⚠️ ES6+ syntax cần transpile
- ⚠️ Cần thêm core-js polyfills
- ⚠️ Cần cấu hình Babel/TypeScript đúng

## Giới hạn còn lại

### 1. **PDF.js rendering**
Nếu sử dụng PDF.js để render, cần phiên bản legacy hoặc build riêng cho IE11

### 2. **WebAssembly**
Không được hỗ trợ trên IE11, cần fallback JavaScript

### 3. **Service Workers**
Không được hỗ trợ trên IE11, cần skip hoặc polyfill

### 4. **Fetch API**
Cần polyfill hoặc sử dụng XMLHttpRequest

## Khuyến nghị

### Cho production:
1. **Không hỗ trợ IE11** nếu có thể - Thêm warning/banner
2. **Sử dụng Progressive Enhancement** - Basic features cho trình duyệt cũ
3. **Monitoring** - Track lỗi từ trình duyệt cũ qua Sentry/etc
4. **Analytics** - Theo dõi % người dùng trên trình duyệt cũ

### Cho development:
1. Luôn test trên ít nhất 2-3 trình duyệt khác nhau
2. Sử dụng BrowserStack/Sauce Labs cho automated testing
3. Setup CI/CD với browser compatibility tests
4. Document các browsers được hỗ trợ

## Tài liệu tham khảo

- [MDN Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
- [Can I Use - Blob URLs](https://caniuse.com/bloburls)
- [Core-js Documentation](https://github.com/zloirock/core-js)
- [Babel Polyfills](https://babeljs.io/docs/en/babel-polyfill)
