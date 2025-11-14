# Simple UI for Exam Cheating Detection API

Thuần HTML/CSS/JS (không build) để test nhanh toàn bộ endpoint backend.

## Mở giao diện

Chỉ cần mở file `index.html` trong thư mục `simple-ui` bằng trình duyệt (Chrome/Edge). Không cần npm.

## Cấu hình

- Trường Base API URL mặc định: `http://localhost:8080/api`.
- Nếu backend chạy ở host/cổng khác (ví dụ qua Docker trên máy khác) hãy sửa và bấm `Set`.

## Các nhóm chức năng

1. Sessions: Start / List / Get / End.
2. Ingest: Events, Snapshot metadata, Upload snapshot base64 (chọn file ảnh bất kỳ).
3. Incidents: Tạo, liệt kê (query optional), xem chi tiết.
4. Reviews: Tạo review và lấy review theo incident.
5. Admin: Ping.

## Seed dev

Dùng các UUID seed:

- Exam: `11111111-1111-1111-1111-111111111111` (ví dụ minh họa)
- Student: `22222222-2222-2222-2222-222222222222` (ví dụ minh họa)
- Reviewer: ID thực tế do DB sinh ngẫu nhiên (xem bên dưới). Trước đây có ví dụ `aaaaaaaa-...` nhưng không tồn tại mặc định.

### Lấy `reviewerId` đúng trong DB
- Cách 1: Chạy seed `sql/seed.sql` (đã tạo user `reviewer`) rồi lấy ID:

```cmd
docker exec -i examdb psql -U postgres -d examdb -c "SELECT id, username, role FROM users WHERE username IN ('reviewer','admin');"
```

Copy `id` của hàng `reviewer` và dán vào ô Reviewer ID trong trang.

- Cách 2 (nhanh cho dev): Thêm sẵn 1 reviewer với UUID cố định `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`:

```cmd
docker exec -i examdb psql -U postgres -d examdb -c "\
INSERT INTO users (id, username, email, password_hash, role)\
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'dev-reviewer', 'dev-reviewer@example.com', 'pw-hash-reviewer', 'REVIEWER'\
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');\
"
```

Sau đó có thể dùng trực tiếp `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` trong ô Reviewer ID.

Sau khi Start Session, mã tự điền sessionId vào các form khác.

## Mẹo

- Nhấn ESC để xóa nhanh tất cả phần kết quả (console clear nhẹ).
- idempotencyKey sinh từ timestamp nên mỗi lần bấm sẽ khác.
- Ảnh upload được lưu vào `/app/uploads/<sessionId>/...` trong container backend (nếu chạy Docker).

## Bảo mật

Giao diện này không có cơ chế đăng nhập. Khi bật auth JWT cho backend bạn cần thêm Authorization header vào fetch (chỉnh sửa trong `script.js`).

## Mở rộng

- Thêm export JSON request.
- Batch ingest nhiều event/snapshot cùng lúc.
- Thêm auto polling incidents.

Chỉnh sửa tùy ý, đây chỉ là công cụ test tối giản.