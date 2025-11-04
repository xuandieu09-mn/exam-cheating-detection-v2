# Exam Cheating Detection — Planning Workspace

Tài liệu và lược đồ DB cho hệ thống phát hiện gian lận thi cử online (MVP → Pilot).

## Nội dung

- `docs/requirements.md` — Yêu cầu & kế hoạch (mục tiêu, phạm vi, NFR, lộ trình).
- `docs/architecture.md` — Kiến trúc, luồng dữ liệu, bảo mật, observability.
- `docs/api/openapi.yaml` — Đặc tả REST API (OpenAPI 3.0).
- `sql/schema.sql` — Lược đồ PostgreSQL (idempotent, có trigger/indices).
- `sql/seed.sql` — Seed dữ liệu mẫu (idempotent) để test nhanh.

## Nhanh chóng chạy thử (PostgreSQL)

Tạo DB (local) rồi chạy schema + seed:

```powershell
# PowerShell / CMD (đổi đường dẫn tương ứng)
psql -U postgres -d examdb -f "sql/schema.sql"
psql -U postgres -d examdb -f "sql/seed.sql"
```

Kiểm tra nhanh (trong psql):

```sql
SELECT count(*) FROM users;
SELECT * FROM incidents_with_exam ORDER BY ts DESC LIMIT 10;
```

## Gợi ý tiếp theo

- Khởi tạo Spring Boot backend theo `docs/api/openapi.yaml` (controller + repo).
- FE React: 2 màn hình chính (Candidate client ingest; Review dashboard).
- Docker Compose cho Postgres, Redis, RabbitMQ, (MinIO tuỳ chọn).
- Prometheus/Grafana cho metrics đã nêu.

Xem thêm chi tiết trong các tài liệu ở thư mục `docs/`.

---

## Backend nhanh chóng chạy thử (Spring Boot + Docker Compose)

### Chạy bằng Maven (local)

```cmd
cd backend
mvn -q test
mvn -q spring-boot:run
```

- API docs (Swagger UI): http://localhost:8080/swagger-ui/index.html
- Mặc định bật bảo mật (JWT RS256). Khóa công khai dev đã có sẵn (`classpath:keys/dev-public.pem`).

### Chạy bằng Docker Compose

Yêu cầu Docker Desktop.

```cmd
docker compose up --build
```

Dịch vụ:
- PostgreSQL: localhost:55432 (db=examdb, user=postgres, pass=postgres)
- Backend: http://localhost:8080

Uploads (ảnh minh chứng) sẽ được lưu vào volume `uploads` gắn vào thư mục `/app/uploads` trong container backend.

### CORS cho frontend local

- Cấu hình CORS cho FE local mặc định chấp nhận `http://localhost:3000` và `http://localhost:5173` qua cấu hình Security.
- Có thể override bằng biến môi trường (vd: `CORS_ALLOWED_ORIGINS`) hoặc chỉnh trong cấu hình Security nếu cần.

### Endpoint upload snapshot (base64)

- POST `/api/ingest/snapshots/upload`
- Body mẫu:

```json
{
	"items": [
		{
			"sessionId": "1a2b3c4d-0000-0000-0000-abcdefabcdef",
			"ts": 1730726400000,
			"imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
			"faceCount": 2,
			"idempotencyKey": "snap-unique-key-123"
		}
	]
}
```

Server sẽ giải mã ảnh, lưu file vào `/app/uploads/<sessionId>/YYYY/MM/DD/<uuid>.jpg` và ghi metadata vào DB, tái sử dụng pipeline ingest snapshots hiện có.

