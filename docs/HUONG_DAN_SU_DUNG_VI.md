# HỆ THỐNG QUẢN LÝ VĂN BẢN – HƯỚNG DẪN SỬ DỤNG GIAO DIỆN (FRONTEND)

Phiên bản: 1.0  
Cập nhật: 2025-09-19  
Phạm vi: Người dùng cuối trong tổ chức (Văn thư, Lãnh đạo, Trưởng phòng, Chuyên viên, Người xem) – tập trung vào thao tác trong giao diện web.

---
## 1. GIỚI THIỆU
Hệ thống hỗ trợ xử lý toàn bộ vòng đời văn bản: tiếp nhận, phân phối, xử lý, phê duyệt, phát hành, lưu trữ và theo dõi. Giao diện được xây dựng bằng Next.js (React) tối ưu hiệu năng và realtime notification.

---
## 2. VAI TRÒ & MÀN HÌNH CHÍNH
| Vai trò | Điểm vào chính | Chức năng nổi bật |
|---------|----------------|------------------|
| Văn thư (VAN_THU) | Dashboard, Văn bản đến | Đăng ký, vào sổ, phát hành, lưu trữ |
| Lãnh đạo (LANH_DAO) | Dashboard, Văn bản chờ duyệt | Xem – chỉ đạo – phê duyệt |
| Trưởng phòng (TRUONG_PHONG) | Văn bản phân công | Tiếp nhận phòng ban, phân công chuyên viên |
| Chuyên viên (CHUYEN_VIEN) | Công việc của tôi | Xử lý, ghi chú, soạn dự thảo phản hồi |
| Người xem (XEM) | Danh sách văn bản được cấp quyền | Chỉ đọc |

---
## 3. ĐĂNG NHẬP & PHIÊN LÀM VIỆC
### 3.1 Đăng nhập
1. Truy cập URL hệ thống (ví dụ: `https://qlvb.noi-bo.vn`)
2. Nhập Tên đăng nhập / Mật khẩu
3. Bấm “Đăng nhập” – nếu thành công bạn sẽ được chuyển tới Dashboard

> **Lưu ý nội bộ:** Sau khi đăng nhập lần đầu, vui lòng liên hệ Admin (Đ/c Hiếu – Trợ lý KHQS; Đ/c Nam – Phòng 7) để được cập nhật/chuẩn hóa chức vụ và phòng ban.

### 3.2 Lỗi đăng nhập thường gặp
| Hiện tượng | Nguyên nhân | Cách xử lý |
|------------|------------|------------|
| Sai mật khẩu | Gõ nhầm hoặc Caps Lock | Gõ lại, kiểm tra bàn phím |
| Tài khoản bị khóa | Sai quá số lần quy định | Liên hệ quản trị viên |
| Màn hình trắng sau đăng nhập | Token lỗi / mạng | Refresh trang hoặc đăng nhập lại |

### 3.3 Tự động đăng xuất
- Hệ thống có thể tự đăng xuất khi phiên JWT hết hạn → Đăng nhập lại.  
- Nếu đang nhập liệu form dài → nên lưu tạm.

### 3.4 Đổi mật khẩu & hồ sơ cá nhân
- Vào biểu tượng người dùng (góc trên bên phải) → "Hồ sơ"  
- Cập nhật: họ tên, email, số điện thoại, ảnh đại diện (nếu hỗ trợ)  
- Đổi mật khẩu: nhập mật khẩu cũ + mật khẩu mới  
- Quy tắc mật khẩu: tối thiểu 8 ký tự (đề xuất: có chữ hoa, số, ký tự đặc biệt)

---
## 4. TỔNG QUAN GIAO DIỆN
| Khu vực | Mô tả |
|---------|------|
| Sidebar trái | Điều hướng chính: Dashboard, Văn bản, Lịch, Thông báo… |
| Header | Thanh tìm kiếm nhanh, icon chuông thông báo, avatar người dùng |
| Khu vực nội dung | Hiển thị danh sách, biểu mẫu, bảng điều khiển |
| Toast / Snackbar | Hiển thị phản hồi thao tác nhanh (tạo thành công, lỗi…) |
| Modal / Dialog | Nhập thông tin chi tiết, xác nhận hành động |

Tip: Dùng Ctrl+K (nếu hỗ trợ command palette) để tìm nhanh chức năng.

---
## 5. DASHBOARD
Dashboard giúp tóm tắt tình trạng xử lý văn bản.

| Thành phần | Ý nghĩa |
|------------|--------|
| Thống kê trạng thái | Số văn bản: Mới – Đang xử lý – Chờ phê duyệt – Hoàn thành |
| Văn bản gần hạn | Danh sách văn bản sắp đến deadline theo vai trò của bạn |
| Thông báo mới | Các thông báo chưa đọc gần nhất |
| Lịch hôm nay | Sự kiện / công việc trong ngày |

---
## 6. QUẢN LÝ VĂN BẢN ĐẾN
### 6.1 Tạo mới (dành cho Văn thư)
- Vào mục “Văn bản đến” → Nút “Tạo mới”  
- Nhập: Trích yếu, Số ký hiệu, Cơ quan ban hành, Ngày nhận, Mức độ khẩn, Mức độ mật, Tóm tắt  
- Tải lên file scan chính (PDF / DOCX)  
- Lưu tạm (Draft) hoặc Hoàn tất để vào sổ (nếu quy trình gộp)  

### 6.2 Vào sổ / Đăng ký
- Nút “Đăng ký” hiển thị nếu văn bản ở trạng thái chờ  
- Thêm số đăng ký, ngày giờ, ghi chú  
- Sau khi đăng ký → trạng thái cập nhật và có thể chuyển lãnh đạo

### 6.3 Trình lãnh đạo & chỉ đạo
- Chọn “Trình lãnh đạo” → Chọn người lãnh đạo  
- Lãnh đạo mở văn bản → thêm ý kiến chỉ đạo (“Chỉ đạo”)  
- Comment xuất hiện trong lịch sử xử lý

### 6.4 Phân phối đến phòng ban
- Văn thư hoặc lãnh đạo (tùy cấu hình) chọn phòng ban chủ trì + phối hợp  
- Quy định hạn xử lý (deadline)  
- Phần “Phân phối” hiển thị danh sách đã gán

### 6.5 Trưởng phòng phân công chuyên viên
- Trưởng phòng mở văn bản → “Phân công” → chọn chuyên viên & deadline nội bộ  
- Chuyên viên sẽ nhận thông báo ASSIGNMENT

### 6.6 Chuyên viên xử lý
- Mở văn bản → Thêm ghi chú nội bộ / bình luận trao đổi  
- Soạn dự thảo văn bản phản hồi (nút “Tạo dự thảo văn bản đi”)  
- Khi hoàn tất → Bấm “Trình trưởng phòng”

### 6.7 Rà soát & phê duyệt
| Bước | Người thực hiện | Hành động |
|------|-----------------|-----------|
| Rà soát phòng ban | Trưởng phòng | Góp ý / Chuyển lãnh đạo |
| Phê duyệt | Lãnh đạo | Phê duyệt / Góp ý lại |
| Phát hành | Văn thư | Gán số văn bản phản hồi, phát hành |

### 6.8 Hoàn thành & lưu trữ
- Sau khi phản hồi (nếu có) được phát hành → Văn bản đến được đánh dấu hoàn thành  
- Văn thư có thể “Lưu trữ” → chuyển trạng thái sang kho lưu trữ (chỉ đọc)

---
## 7. VĂN BẢN ĐI / NỘI BỘ
### 7.1 Tạo dự thảo
- Nút “Tạo văn bản đi”  
- Nhập: Tiêu đề, Loại, Nơi nhận / Phòng ban, Nội dung chính  
- Đính kèm file dự thảo (nếu có)  

### 7.2 Quy trình
1. Soạn thảo (Chuyên viên / Người khởi tạo)  
2. Rà soát nội bộ phòng ban  
3. Trình lãnh đạo phê duyệt  
4. Văn thư phát hành & gán số  
5. Lưu trữ

### 7.3 Chỉnh sửa & phiên bản
- Có thể cập nhật nội dung trước khi phê duyệt  
- Sau phê duyệt: chỉ cho phép tải xuống / phát hành

---
## 8. BÌNH LUẬN, GHI CHÚ & LỊCH SỬ
### 8.1 Bình luận
- Tab “Bình luận” trong chi tiết văn bản  
- Phân loại: CHỈ ĐẠO, GHI_CHU, PHẢN_HỒI (tùy enum hiển thị)  
- Có timestamp & tên người dùng  

### 8.2 Ghi chú nội bộ
- Chỉ hiển thị cho người trong phòng ban liên quan / vai trò đủ quyền  
- Dùng để lưu tiến độ, trao đổi kỹ thuật

### 8.3 Lịch sử xử lý
- Hiển thị timeline: Ai – làm gì – thời điểm  
- Giúp truy vết trách nhiệm & kiểm tra tiến độ

---
## 9. THÔNG BÁO REALTIME
### 9.1 Biểu tượng chuông
- Số badge màu (ví dụ đỏ) = số thông báo chưa đọc  
- Click mở dropdown danh sách gần nhất

### 9.2 Các loại thông báo thường gặp
| Loại | Khi nào phát sinh | Ví dụ nội dung |
|------|------------------|----------------|
| STATUS_CHANGE | Văn bản đổi trạng thái | “Văn bản #123 chuyển sang APPROVED” |
| ASSIGNMENT | Bạn được giao xử lý | “Bạn được giao xử lý văn bản #456” |
| NEW_COMMENT | Có bình luận mới | “Lãnh đạo A: Cần bổ sung số liệu phần 2” |
| DEADLINE_REMINDER | Sắp tới hạn | “Còn 1 ngày đến hạn văn bản #789” |
| DOCUMENT_UPDATE | Nội dung được cập nhật | “Văn bản #321 vừa được sửa phần tóm tắt” |

### 9.3 Đánh dấu đã đọc
- Click vào một thông báo → chuyển sang trạng thái đã đọc  
- Có nút “Đánh dấu tất cả đã đọc” (nếu được cung cấp)  

### 9.4 Mất realtime?
| Hiện tượng | Hướng xử lý |
|-----------|--------------|
| Không thấy thông báo mới | Refresh trang / kiểm tra mạng |
| Mất kết nối WebSocket | Kiểm tra Console (F12) – lỗi CORS / 401? |
| Thông báo trễ nhiều phút | Kiểm tra thời gian hệ thống / load server |

---
## 10. QUẢN LÝ FILE ĐÍNH KÈM
### 10.1 Tải lên
| Định dạng đề xuất | Ghi chú |
|------------------|--------|
| PDF | Ưu tiên – chuẩn hóa lưu trữ |
| DOCX | Chấp nhận – nên chuyển PDF khi phát hành |
| XLSX | Phụ lục số liệu |
| PNG/JPG | Minh họa – dung lượng tối ưu |

### 10.2 Giới hạn & cảnh báo
- Dung lượng tối đa (ví dụ 50MB / file) – vượt sẽ báo lỗi  
- Nên đặt tên file rõ ràng (không dấu, ngắn gọn)  
- Tránh trùng nội dung → hệ thống dùng UUID để tránh đè

### 10.3 Xem & tải xuống
- Click tên file → nếu PDF sẽ mở preview (nếu được tích hợp)  
- Nút “Tải xuống” giữ nguyên tên hiển thị + phần mở rộng

### 10.4 Xóa file
- Chỉ hiển thị nếu bạn có quyền chỉnh sửa văn bản & trạng thái còn cho phép  
- Xóa sẽ yêu cầu xác nhận

---
## 11. CHỮ KÝ SỐ (NẾU BẬT)
### 11.1 Mục đích
- Ký xác nhận văn bản đi trước khi phát hành  
- Đảm bảo tính toàn vẹn (Integrity)

### 11.2 Quy trình cơ bản
1. Chuẩn bị chứng thư số hợp lệ  
2. Chọn văn bản / file PDF  
3. Nhấn “Ký số” → hệ thống xử lý  
4. Tải xuống bản đã ký hoặc lưu đè phiên bản

### 11.3 Lỗi thường gặp
| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| Không ký được | Chứng thư sai / hết hạn | Cập nhật chứng thư mới |
| File hỏng sau ký | PDF lỗi cấu trúc | Thử lại với bản PDF chuẩn hóa |
| Ký rất chậm | File lớn / mạng chậm | Đợi hoàn tất / tối ưu dung lượng |

---
## 12. TÌM KIẾM & LỌC NÂNG CAO
### 12.1 Thanh tìm kiếm nhanh
- Nhập từ khóa theo Tiêu đề / Số ký hiệu  
- Gợi ý tự động (nếu có debounce)  

### 12.2 Bộ lọc chi tiết
| Tiêu chí | Ví dụ |
|----------|-------|
| Trạng thái | DRAFT, PROCESSING, APPROVED |
| Mức độ khẩn | NORMAL / HIGH / URGENT |
| Phòng ban chủ trì | Phòng TCKT |
| Khoảng thời gian | 01/09 → 15/09 |

### 12.3 Mẹo
- Kết hợp nhiều tiêu chí để thu hẹp kết quả  
- Làm mới bộ lọc về mặc định bằng nút “Reset”  
- Nếu tìm “không có dữ liệu” → bỏ bớt điều kiện

---
## 13. MỨC ĐỘ KHẨN (URGENCY) & BẢO MẬT
| Mức | Màu sắc gợi ý | Ý nghĩa |
|-----|---------------|--------|
| NORMAL | Xanh nhạt | Xử lý theo lịch thông thường |
| HIGH | Cam | Cần ưu tiên sớm |
| URGENT | Đỏ | Xử lý ngay, sát deadline |

| Bảo mật | Ý nghĩa |
|---------|--------|
| NORMAL | Hiển thị đầy đủ |
| CONFIDENTIAL | Giới hạn xem theo quyền |
| SECRET | Ẩn bớt nội dung nhạy cảm |
| TOP_SECRET | Chỉ nhóm cực hạn định sẵn |

---
## 14. CÁC LỖI THƯỜNG GẶP (UI)
| Mô tả | Nguyên nhân | Cách xử lý |
|-------|-------------|-------------|
| Không load danh sách văn bản | Token hết hạn | Đăng nhập lại |
| Không xem được file PDF | Trình duyệt chặn viewer | Cho phép hoặc tải xuống |
| Thông báo không realtime | Mất kết nối WS | Refresh / kiểm tra mạng |
| Form mất dữ liệu khi back | Không lưu nháp | Bấm “Lưu tạm” trước khi rời |
| Không phân công được | Thiếu quyền | Kiểm tra vai trò đăng nhập |

---
## 15. FAQ (NGƯỜI DÙNG CUỐI)
**Hỏi:** Làm sao biết tôi còn bao nhiêu văn bản chưa xử lý?  
**Đáp:** Dashboard → Widget trạng thái hoặc lọc “Đang xử lý”.

**Hỏi:** Có thể lọc văn bản gần đến hạn?  
**Đáp:** Dùng bộ lọc “Deadline” hoặc xem mục “Văn bản gần hạn” trên Dashboard.

**Hỏi:** Tôi không thấy văn bản đồng nghiệp gửi link?  
**Đáp:** Bạn có thể không có quyền hoặc văn bản thuộc mức mật cao hơn.

**Hỏi:** Thông báo đã đọc có quay lại chưa đọc được không?  
**Đáp:** Không. Bạn vẫn xem lại trong trang lịch sử thông báo.

**Hỏi:** Tại sao tôi không chỉnh sửa được văn bản đã phê duyệt?  
**Đáp:** Trạng thái đã khóa chỉnh sửa – tạo văn bản cập nhật hoặc liên hệ văn thư.

---
## 16. MẸO TỐI ƯU NĂNG SUẤT
| Tình huống | Mẹo |
|-----------|-----|
| Cần xem nhanh nhiều văn bản | Mở mỗi văn bản tab mới (Ctrl + Click) |
| Nhiều comment phức tạp | Dùng tìm kiếm trình duyệt (Ctrl+F) lọc tên người |
| Quá tải thông báo | Đọc & xóa bớt hoặc đánh dấu tất cả đã đọc |
| Hay quên hạn xử lý | Lọc “Gần đến hạn” mỗi sáng |
| Cần phối hợp phòng khác | Tag người / phòng trong bình luận (nếu hỗ trợ) |

---
## 17. BẢO MẬT KHI SỬ DỤNG
- Không chia sẻ tài khoản / mật khẩu  
- Đăng xuất khi dùng máy công cộng  
- Không tải xuống dữ liệu mật ra thiết bị cá nhân nếu không cần  
- Báo ngay khi nghi ngờ có truy cập trái phép

---
## 18. PHỤ LỤC
### 18.1 Phím tắt (nếu được cấu hình)
| Thao tác | Phím |
|----------|------|
| Mở panel tìm kiếm | Ctrl + K |
| Làm mới danh sách hiện tại | F5 / Ctrl + R |
| Đóng dialog | Esc |
| Chuyển focus thanh tìm kiếm | / (slash) |

### 18.2 Mẫu ghi chú tốt
> "Đã liên hệ Phòng KH ngày 18/09 – chờ bổ sung phụ lục số liệu. Dự kiến cập nhật 20/09."  
Rõ ràng – Có ngày – Trạng thái – Bước tiếp theo.

---
## 19. CẬP NHẬT TÀI LIỆU
| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 2025-09-19 | 1.0 | Khởi tạo tài liệu người dùng cuối |

---
Kết thúc tài liệu.
