# Hệ thống chia sẻ file public

Hệ thống cho phép chia sẻ file và thư mục với người dùng bên ngoài thông qua link public, không cần đăng nhập.

## Tính năng chính

- ✅ Tạo link chia sẻ cho thư mục
- ✅ Bảo mật với token ngẫu nhiên
- ✅ Thiết lập thời hạn truy cập
- ✅ Giao diện web thân thiện
- ✅ Hỗ trợ tải xuống file
- ✅ Duyệt thư mục con
- ✅ Quản lý tất cả link chia sẻ

## Cách sử dụng

### 1. Tạo link chia sẻ mới

1. Truy cập trang **Quản lý chia sẻ**: `/quan-ly-chia-se`
2. Nhấn nút **"Tạo link chia sẻ"**
3. Điền thông tin:
   - **Đường dẫn thư mục**: Đường dẫn tương đối từ `public/` (ví dụ: `shared-documents`)
   - **Mô tả**: Mô tả nội dung (tùy chọn)  
   - **Thời hạn**: Chọn thời gian hết hạn (tùy chọn)
4. Nhấn **"Tạo link"**
5. Link sẽ được tự động sao chép vào clipboard

### 2. Chia sẻ với người dùng

- Gửi link có dạng: `https://domain.com/share/[token]`
- Người dùng có thể truy cập mà không cần đăng nhập
- Họ có thể xem danh sách file, duyệt thư mục con và tải xuống

### 3. Quản lý link chia sẻ

- **Xem tất cả**: Danh sách link đã tạo với trạng thái
- **Sao chép link**: Nút copy để chia sẻ lại
- **Mở link**: Xem trước nội dung
- **Xóa link**: Vô hiệu hóa link không cần thiết

## Cấu trúc thư mục

```
public/
├── shared-documents/          # Thư mục demo
│   ├── README.txt            # File mẫu
│   └── tai-lieu/
│       └── huong-dan.txt     # Hướng dẫn chi tiết
└── [your-folders]/           # Thư mục của bạn
```

## API Endpoints

### Tạo link chia sẻ
```
POST /api/public-share
{
  "folderPath": "shared-documents",
  "description": "Tài liệu chia sẻ",
  "expiresIn": 30
}
```

### Lấy danh sách link
```
GET /api/public-share
```

### Truy cập nội dung chia sẻ
```
GET /api/public-share/[token]?path=subfolder
```

### Tải xuống file
```
GET /api/public-share/[token]/download?path=file.pdf
```

### Xóa link chia sẻ
```
DELETE /api/public-share?id=[link-id]
```

## Bảo mật

- **Token ngẫu nhiên**: Sử dụng UUID v4 không thể đoán được
- **Validation đường dẫn**: Không cho phép truy cập ra ngoài thư mục được chia sẻ
- **Thời hạn truy cập**: Tự động vô hiệu hóa khi hết hạn
- **Quản lý trạng thái**: Có thể tắt/bật link bất kỳ lúc nào

## Demo

1. Truy cập `/quan-ly-chia-se` để tạo link cho thư mục `shared-documents`
2. Chia sẻ link được tạo
3. Người dùng truy cập và có thể tải file demo

## Lưu ý

- Chỉ chia sẻ với người tin cậy
- Đặt thời hạn phù hợp cho từng mục đích
- Kiểm tra và xóa link không còn cần thiết
- Backup dữ liệu quan trọng trước khi chia sẻ