# Postman hướng dẫn kiểm thử API

Tệp bạn cần import:
- Collection: `docs/postman/ExamCheatingDetection.postman_collection.json`
- Environment: `docs/postman/Local.postman_environment.json`

Environment `Local` đã chứa sẵn biến:
- `baseUrl`: `http://localhost:8080/api`
- `examId`: `11111111-1111-1111-1111-111111111111` (đã seed ở dev)
- `userId`: `22222222-2222-2222-2222-222222222222` (đã seed ở dev)
- `sessionId`, `incidentId`: sẽ được set tự động sau khi gọi API tương ứng lần đầu.

Lưu ý quan trọng để tránh lỗi 400 (vi phạm khóa ngoại):
- Bảng `sessions` có FK tới `users` và `exams`. Vì vậy khi gọi `POST /sessions/start` cần `examId` và `userId` tồn tại.
- Ở profile `dev`, Flyway đã seed sẵn 2 bản ghi trên (file `backend/src/main/resources/db/dev/V2__dev_seed.sql`).
- Nếu bạn chạy bằng Docker Compose có `SPRING_PROFILES_ACTIVE=dev` thì seed sẽ chạy tự động khi backend khởi động.

## Quy trình test nhanh
1) Start session
   - Mở request "Start session" và gửi (body đã dùng `{{examId}}`, `{{userId}}` từ Environment).
   - Nếu 200 OK, tab Tests sẽ tự lưu `sessionId` từ response.

2) List/Get sessions
   - Gửi "List sessions" để xem danh sách.
   - Gửi "Get session by id" (dùng `{{sessionId}}`).

3) Ingest
   - "Ingest events": gửi 1 event mẫu (idempotencyKey dùng `{{$timestamp}}` để luôn unique).
   - "Ingest snapshots (metadata)": gửi metadata ảnh mẫu.
   - "Upload snapshots (base64)": gửi ảnh base64 (PNG 1x1) — hệ thống sẽ lưu file vào ổ đĩa và ghi metadata.

4) Incidents & Reviews
   - "Create incident": tạo incident gắn với `{{sessionId}}` và tự lưu `incidentId` trả về.
   - "List incidents (by session)": kiểm tra incident vừa tạo.
   - "Get incident by id": xem chi tiết.
   - "Create review (ADMIN)": tạo review cho incident (dùng user admin seed `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`).
   - "Get review by incident": xác nhận.

5) End session
   - Gọi "End session" (POST `/sessions/{{sessionId}}/end`).

## Ảnh upload lưu ở đâu?
- Ảnh được lưu vào thư mục container backend: `/app/uploads/<sessionId>/YYYY-MM-DD/` (hoặc `YYYY-MM-DDTHH:MM:SSZ` tùy thực thi tại thời điểm gửi) cùng tên file sinh từ timestamp.
- Docker Compose đã mount volume `uploads` vào `/app/uploads`, nên dữ liệu sẽ được giữ lại khi restart container.
- Bạn có thể mở Docker Desktop -> Container backend -> Files để duyệt, hoặc dùng lệnh `docker exec` để xem nội dung thư mục (tùy chọn).

## Sự cố thường gặp
- 401 Unauthorized: Dev đã cấu hình bỏ qua auth qua biến môi trường `SECURITY_REQUIRE_AUTH="false"` trong `docker-compose.yml`. Nếu vẫn thấy 401, hãy đảm bảo bạn đang chạy đúng compose này (và không override bằng profile khác).
- 400 Bad Request (FK violated) khi Start session: Kiểm tra xem `V2__dev_seed.sql` đã chạy (profile `dev`), hoặc tự seed tạm user/exam với UUID đúng như trong environment. Sau khi có user/exam, gọi lại sẽ OK.
- 409 Conflict khi tạo review: Mỗi incident chỉ được có 1 review. Nếu đã có review, request tạo mới sẽ trả 409.

## Tham khảo
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs
