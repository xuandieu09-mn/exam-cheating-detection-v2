# Kiến trúc hệ thống — Online Exam Cheating Detection

Tài liệu mô tả kiến trúc logic, luồng dữ liệu, phân rã thành phần và vận hành (observability, bảo mật, mở rộng).

## Tổng quan thành phần

```mermaid
flowchart LR
  C[Candidate Browser]
  FE[Frontend (React)]
  GW[API (Spring Boot)]
  MQ[(RabbitMQ)]
  R[Redis]
  DB[(PostgreSQL)]
  ST[(Storage: MinIO/S3 or Volume)]
  RE[Rule/Face Worker]
  PR[Proctor/Reviewer UI]

  C -->|Web App| FE
  FE -->|JWT RS256| GW
  FE -->|Snapshots/Telemetry| GW
  GW --> DB
  GW --> R
  GW --> MQ
  GW --> ST
  RE --> MQ
  RE --> ST
  RE --> DB
  PR -->|JWT| GW
```

Vai trò:
- Frontend: ứng dụng thí sinh (ingest) + dashboard reviewer.
- API: nhận dữ liệu, xác thực, tạo session, tính rule (sync/light) + đẩy job xử lý ảnh sang hàng đợi.
- Worker: xử lý ảnh/face detection async; cập nhật `face_count`, sinh incident multi-face/no-face.
- Redis: đếm sự kiện theo cửa sổ thời gian (ví dụ tab_switch/5 phút) để phát hiện gần thời gian thực.
- RabbitMQ: phương tiện truyền sự kiện ảnh và job xử lý.
- Storage: lưu bằng chứng ảnh/video; DB chỉ lưu metadata + URL.

## Luồng dữ liệu chính

### 1) Ingest snapshot (đồng bộ metadata + bất đồng bộ xử lý)

```mermaid
sequenceDiagram
  participant FE as Frontend (Browser)
  participant API as API (Spring Boot)
  participant MQ as RabbitMQ
  participant ST as Storage
  participant W as Rule/Face Worker
  participant DB as PostgreSQL

  FE->>API: POST /ingest/snapshots {session_id, ts, ...}
  API->>ST: (tùy) Put object (presigned/base64)
  API->>DB: INSERT media_snapshots (idempotent)
  API->>MQ: publish snapshot.process {snapshot_id}
  API-->>FE: 200 OK

  W->>MQ: consume snapshot.process
  W->>ST: get image
  W->>W: face detection → face_count
  W->>DB: UPDATE media_snapshots.face_count
  alt multi-face >=2
    W->>DB: INSERT incidents(type=MULTI_FACE,...)
  end
```

### 2) Ingest telemetry + Rule Tab-abuse

```mermaid
sequenceDiagram
  participant FE as Frontend
  participant API as API
  participant R as Redis
  participant DB as PostgreSQL

  FE->>API: POST /ingest/events {TAB_SWITCH, ts}
  API->>DB: INSERT events (idempotent)
  API->>R: INCR key=session:{id}:tabswitch (expire K phút)
  API->>API: Eval threshold → incident nếu vượt ngưỡng
  API->>DB: INSERT incidents(type=TAB_ABUSE,...)
```

### 3) Review incident

```mermaid
sequenceDiagram
  participant RV as Reviewer UI
  participant API as API
  participant DB as PostgreSQL

  RV->>API: GET /incidents?examId&status
  API->>DB: SELECT incidents JOIN sessions
  API-->>RV: list

  RV->>API: POST /incidents/{id}/review {CONFIRM/REJECT, note}
  API->>DB: INSERT reviews (unique per incident)
  API->>DB: trigger cập nhật incidents.status
  API-->>RV: 200 OK
```

## Bảo mật

- JWT RS256: xác thực bằng public key (JWKS). Claim đề xuất: `sub`, `role`, `exp`, `iat`, `aud`.
- RBAC: kiểm soát truy cập endpoint và tài nguyên (ví dụ evidence chỉ cho PROCTOR/REVIEWER/ADMIN, không cho CANDIDATE).
- Evidence: cấp presigned URL (TTL ngắn) khi UI cần xem. Storage không công khai trực tiếp.
- API: chuẩn hóa idempotency để tránh replay; rate limit cơ bản cho ingest.

## Khả năng mở rộng & độ trễ

- Scale-out API (stateless) phía sau load balancer.
- Worker tách process, auto-scale theo hàng đợi (queue length, lag). Sử dụng batching nhẹ nếu cần.
- Redis window counters giúp rule gần thời gian thực với chi phí thấp.
- Mục tiêu: P95 từ ingest snapshot đến incident < 3–5s.

## Observability

- Prometheus metrics gợi ý:
  - `ingest_snapshots_total`, `ingest_events_total`
  - `rule_incidents_total{type}`
  - `rule_latency_seconds{type}` (histogram)
  - `queue_lag_seconds`, `worker_jobs_inflight`
  - `api_request_duration_seconds` (histogram)
  - `errors_total{component}`
- Logs có trace_id/correlation_id theo session_id.

## Ràng buộc dữ liệu & retention

- Composite unique cho idempotency: `events(session_id, ts, event_type)`, `media_snapshots(session_id, ts)`; vẫn giữ `idempotency_key` để linh hoạt client.
- `exams.retention_days`: job dọn evidence theo kỳ thi; xóa file + metadata an toàn (soft-delete optional).

## Phát triển & triển khai

- Docker Compose cho Postgres, Redis, RabbitMQ, (MinIO tuỳ chọn). Backend/Frontend containerized.
- Migrate DB: Flyway/Liquibase khi triển khai thực tế (hiện có `sql/schema.sql`).
- Config: `.env` + Spring profiles (`dev`, `prod`).

---
Tham chiếu: `docs/requirements.md`, `docs/api/openapi.yaml`, `sql/schema.sql`.
