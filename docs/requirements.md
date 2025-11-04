# Hệ thống phát hiện gian lận thi cử online — Yêu cầu & Kế hoạch

Tài liệu tóm tắt mục tiêu, phạm vi, tác nhân, ca sử dụng, yêu cầu chức năng và phi chức năng, tiêu chí chấp nhận, và lộ trình triển khai MVP → Pilot → Mở rộng.

## 1. Mục tiêu & phạm vi

- Mục tiêu: Thu thập dữ liệu trong phiên thi, áp dụng rule đơn giản để phát hiện hành vi rõ ràng, tạo incident kèm bằng chứng cho Proctor/Reviewer xem và gắn nhãn.
- Phạm vi MVP:
  - Đăng nhập bằng JWT RS256; RBAC: ADMIN, PROCTOR, REVIEWER, CANDIDATE.
  - Start/End Exam Session.
  - Thu thập webcam snapshot định kỳ (2–5s, 640×480) và telemetry: focus/blur, tab switch, paste.
  - Rule: no-face > N giây, multi-face (≥2), tab switch liên tục vượt ngưỡng trong K phút, paste trong ô trả lời.
  - Tạo incident (type, score, reason, evidence_url), lưu trữ ảnh minh chứng.
  - Trang danh sách incident; Confirm/Reject + ghi chú.
  - Báo cáo nhẹ theo kỳ thi: tổng số incident, tỉ lệ confirm.

Assumption (MVP):
- Lưu object evidence (ảnh) vào storage (local volume hoặc MinIO/S3). Backend giữ metadata và URL.
- Phát hiện khuôn mặt dùng thư viện CV ở service phụ trợ (có thể chạy async), trước mắt dùng face_count từ pipeline đơn giản.
- JWT RS256 do hệ thống phát hành nội bộ (dev) hoặc tích hợp nhà cung cấp OIDC, public key (JWKS) được cấu hình ở backend.

## 2. Tác nhân & ca sử dụng chính

- Thí sinh (CANDIDATE)
  - Đăng nhập.
  - Bắt đầu thi → session chạy → client tự động gửi snapshot/telemetry.
  - Kết thúc thi (hoặc session tự đóng khi hết giờ).
- Proctor/Reviewer
  - Xem danh sách incidents (lọc theo exam, session, status).
  - Xem ảnh/bằng chứng.
  - Confirm/Reject + note.
- Admin
  - Xem thống kê theo kỳ thi: số incident, tỉ lệ confirm.
  - Quản trị kỳ thi, cấu hình thời gian lưu ảnh (retention_days).

## 3. Yêu cầu chức năng

### 3.1. Xác thực & Phiên thi
- JWT RS256, lưu vai trò trong claim `role`.
- Start/End session: tạo `session_id`, liên kết `user_id`, `exam_id`, `started_at/ended_at`, trạng thái.
- Idempotent: các request tạo dữ liệu có thể kèm `idempotency_key` hoặc sử dụng cặp `(session_id, ts[, type])`.

### 3.2. Thu thập dữ liệu
- Webcam snapshot: client gửi định kỳ 2–5s, độ phân giải gợi ý 640×480; nén JPEG.
- Telemetry: focus/blur/tab_switch/paste (kèm field name nếu có), tất cả gắn `session_id`, `ts` (epoch ms), và user agent/ip phía server.
- Khả năng retry an toàn: server xử lý idempotent.

### 3.3. Phát hiện gian lận theo rule
- No-face: không thấy mặt liên tục > N giây → incident.
- Multi-face: ảnh có ≥2 mặt → incident.
- Tab-abuse: số lần `tab_switch` vượt ngưỡng trong cửa sổ K phút → incident.
- Paste: phát hiện dán vào ô trả lời → incident.
- Mỗi incident có score và reason (mô tả ngắn vì sao vi phạm).

### 3.4. Incident & Review
- Lưu incident: `type, score, timestamp, evidence_url, status`.
- Review: CONFIRM/REJECT + note; lưu reviewer + thời điểm; một incident chỉ có trạng thái cuối cùng (trigger đồng bộ `incidents.status`).
- Danh sách incident: lọc theo `exam_id`, `session_id`, `status`, phân trang.

### 3.5. Báo cáo
- Tổng số incident theo kỳ thi; tỷ lệ confirm; phân bố theo loại.

## 4. Yêu cầu phi chức năng

- Độ trễ: ảnh lên → rule → incident < 3–5s (P95) trong tải bình thường.
- Tin cậy: retry upload; API idempotent; logging/audit.
- Bảo mật: JWT RS256, RBAC; hạn chế truy cập evidence theo vai trò; tách network (private bucket nếu S3/MinIO) + presigned URL ngắn hạn.
- Riêng tư: chỉ thu thập tối thiểu; retention ảnh theo `exams.retention_days`; quy trình xóa theo kỳ thi.
- Khả năng mở rộng: tách lớp ingestion → queue → rule engine → storage/DB → review UI.
- Giám sát: Prometheus metrics (incidents/min, rule latency, error rate, queue lag, snapshot ingest rate).

## 5. Tiêu chí chấp nhận (MVP)

- Đăng nhập thành công với JWT hợp lệ; role áp dụng đúng ở endpoint được bảo vệ.
- Bắt đầu và kết thúc session; dữ liệu snapshot và telemetry gắn đúng session.
- Sinh incident cho các rule: no-face, multi-face, tab-abuse, paste (mô phỏng được bằng seed/test script).
- Reviewer xác nhận/loại bỏ incident; incidents.status phản ánh trạng thái cuối.
- Báo cáo kỳ thi hiển thị tổng số incident và tỷ lệ confirm.

## 6. Dữ liệu & lược đồ

- Bảng cốt lõi (PostgreSQL): `users, exams, sessions, media_snapshots, events, incidents, reviews`.
- Idempotency:
  - `events`: unique `(session_id, ts, event_type)` hoặc `idempotency_key` (hiện tại: có `idempotency_key` bắt buộc, sẽ bổ sung composite index an toàn cho seed).
  - `media_snapshots`: unique `(session_id, ts)` và `object_key` unique; tùy storage.
- Retention: `exams.retention_days` điều khiển quy trình dọn ảnh/evidence theo kỳ.

## 7. API bề mặt (tóm tắt)

- Auth: `POST /auth/login` (dev) hoặc tích hợp OIDC; dùng Bearer JWT.
- Session: `POST /sessions/start`, `POST /sessions/{id}/end`.
- Ingest: `POST /ingest/snapshots` (JSON metadata + upload URL hoặc base64 trong MVP), `POST /ingest/events`.
- Incidents: `GET /incidents`, `GET /incidents/{id}`, `POST /incidents/{id}/review`.
- Admin: `GET /admin/stats?examId=`.

Chi tiết hợp đồng xem `docs/api/openapi.yaml`.

## 8. Kiến trúc & thành phần

- Frontend (React): client thi + dashboard review.
- Backend (Spring Boot): REST API, rule engine, RBAC, Prometheus metrics.
- Redis: đếm sự kiện cửa sổ thời gian ngắn (tab switch) để rule xử lý gần thời gian thực.
- RabbitMQ: pipeline ingestion → xử lý async (face detection) → cập nhật DB và tạo incident.
- Storage: MinIO/S3 hoặc local volume cho evidence; URL được backend cấp phát (presigned).
- Monitoring: Prometheus/Grafana.

## 9. Lộ trình triển khai

1) MVP (2–3 tuần):
   - Auth + Session + Ingest + Rule đơn giản + Incidents + Review + Báo cáo nhẹ.
   - Schema/seed đã có; bổ sung OpenAPI; FE khung màn hình.
2) Pilot (2–4 tuần):
   - Tối ưu độ trễ; Redis window counter; presigned URL; paging/filter đầy đủ; audit log.
   - Hardening bảo mật; logs/metrics.
3) Mở rộng:
   - ML nâng cao (multi-face robust, behavior model); voice; anti-spoofing; auto-triage incidents.

## 10. Rủi ro & giảm thiểu

- Độ trễ cao do xử lý ảnh: xử lý async, pre-allocate workers, nén ảnh 640×480.
- Trùng lặp dữ liệu do retry: áp dụng idempotency key + unique index như trên.
- Quyền truy cập evidence: dùng presigned URL TTL thấp, kiểm tra RBAC server-side.
- Bảo mật JWT: lưu JWKS, rotate key, kiểm tra exp/iat/aud.

---
Tài liệu liên quan: `docs/architecture.md`, `docs/api/openapi.yaml`, `sql/schema.sql`.
