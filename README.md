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
