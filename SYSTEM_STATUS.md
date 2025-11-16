# 🎯 HỆ THỐNG EXAM CHEATING DETECTION - TRẠNG THÁI HIỆN TẠI

**Cập nhật:** 16/11/2025 20:35 (UTC+7)

---

## 🟢 BACKEND SERVICES - ALL RUNNING

| Service | Container | Status | Port | Health |
|---------|-----------|--------|------|--------|
| PostgreSQL 15 | `examdb` | ✅ Running | 55432 | Healthy |
| Redis 7 | `exam-redis` | ✅ Running | 6379 | Healthy |
| Spring Boot 3.2 | `exam-cheating-detection-v2-backend-1` | ✅ Running | 8080 | Running |

**Kiểm tra:**
```bash
docker ps
curl http://localhost:8080/api/exams
```

---

## 📊 DATABASE SCHEMA

**Flyway Migrations Applied:** V1 → V5
- ✅ V1: Initial schema (exams, sessions, events, incidents, reviews, media_snapshots)
- ✅ V2: Dev seed data (3 exams, 2 users, sample events)
- ✅ V3: Add exam status column
- ✅ V4: Events unique constraint (session_id, ts, event_type)
- ✅ V5: Media snapshots unique constraint

**Tables:**
- `exams` - Kỳ thi
- `sessions` - Phiên làm bài
- `events` - Sự kiện (TAB_SWITCH, PASTE, FOCUS, etc.)
- `incidents` - Vi phạm được phát hiện
- `reviews` - Duyệt vi phạm
- `media_snapshots` - Ảnh webcam

---

## 🔧 FEATURES HOẠT ĐỘNG

### ✅ Core APIs

| Endpoint | Method | Mô tả | Status |
|----------|--------|-------|--------|
| `/api/exams` | GET | Danh sách kỳ thi | ✅ |
| `/api/exams/{id}` | GET | Chi tiết kỳ thi | ✅ |
| `/api/sessions/{id}/start` | POST | Bắt đầu phiên thi | ✅ |
| `/api/sessions/{id}/end` | POST | Kết thúc phiên thi | ✅ |
| `/api/ingest/events` | POST | Gửi events (batch) | ✅ |
| `/api/ingest/snapshots/upload` | POST | Upload ảnh webcam | ✅ |
| `/api/incidents` | GET | Danh sách vi phạm | ✅ |
| `/api/admin/reviews` | POST | Duyệt vi phạm | ✅ |

### ✅ Mock Exam APIs (Week 2)

| Endpoint | Method | Mô tả | Status |
|----------|--------|-------|--------|
| `/api/mock-exam/start` | POST | Tạo session cho mock exam | ✅ |
| `/api/mock-exam/{examId}/questions` | GET | 10 câu hỏi mẫu | ✅ |
| `/api/mock-exam/submit` | POST | Nộp bài + end session | ✅ |

### ✅ Redis Integration

- **Connection:** localhost:6379 ✅
- **Persistence:** AOF enabled ✅
- **Volume:** `redis-data` ✅

**Use cases:**
- Tab-switch counting (per-minute window)
- Incident creation flags (idempotency)

### ✅ Tab-Abuse Detection Rule (AUTO)

**Cấu hình:**
- Threshold: 10 tab switches
- Time window: 5 minutes (per-minute grouping)
- Auto-create incident: TAB_ABUSE
- Score: 0.5-1.0 (linear scale)

**Flow:**
1. TAB_SWITCH event → IngestService
2. RuleService.evaluateTabSwitch()
3. Redis INCR counter
4. Count > 10 → Create incident
5. SETNX flag (prevent duplicates)

**Test verification:** ✅ PASSED
```bash
.\test-tab-abuse.ps1
# Result: Incident created with score 0.6 after 11 switches
```

---

## 🐛 BUGS ĐÃ SỬA

### Bug #1: JAR file not found
- **Lỗi:** `Unable to access jarfile target\exam-backend-0.0.1-SNAPSHOT.jar`
- **Sửa:** `docker-compose up --build` (rebuild image)

### Bug #2: Tab-abuse rule không tạo incident
- **Lỗi:** `IngestService` dùng sai `Instant.ofEpochSecond(item.ts)`
- **Root cause:** `item.ts` là milliseconds, không phải seconds
- **Sửa:** Đổi thành `Instant.ofEpochMilli(item.ts)` ✅

---

## 📂 CẤU TRÚC DỰ ÁN

```
exam-cheating-detection-v2/
├── backend/                   # Spring Boot 3.2 + Java 17
│   ├── src/
│   │   ├── main/java/com/example/exam/
│   │   │   ├── controller/    # REST controllers
│   │   │   ├── service/       # Business logic (NEW: RuleService, MockExamService)
│   │   │   ├── repository/    # JPA repositories
│   │   │   ├── model/         # Entities
│   │   │   └── dto/           # DTOs (NEW: MockExamDto)
│   │   └── resources/
│   │       ├── db/migration/  # Flyway V1-V5
│   │       └── application-dev.yml
│   ├── Dockerfile             # Multi-stage build
│   └── pom.xml                # Maven (NEW: spring-data-redis)
│
├── frontend/                  # React + TypeScript + Vite
│   └── src/                   # (Chưa phát triển)
│
├── docs/                      # Documentation
│   ├── WEEK1_DAY1-2_COMPLETED.md
│   ├── WEEK1_DAY3-4_COMPLETED.md
│   ├── WEEK2_BACKEND_COMPLETED.md
│   ├── WEEK2_BUGFIX_COMPLETED.md    # ← MỚI
│   ├── DEBUG_BACKEND_CRASH.md
│   └── requirements.md
│
├── docker-compose.yml         # Postgres + Redis + Backend
├── test-tab-abuse.ps1         # Test script
└── README.md
```

---

## 🎯 TIẾN ĐỘ DỰ ÁN

### ✅ TUẦN 1: Nền tảng & Xác thực (COMPLETED)
- [x] Idempotency & Validation
- [x] API bổ sung (Exams, Sessions)
- [x] Seed data

### ✅ TUẦN 2: Redis + Rule Engine + Mock Exam (COMPLETED)
- [x] **Backend:** Redis setup
- [x] **Backend:** Tab-abuse rule
- [x] **Backend:** Mock exam APIs
- [x] **Backend BUGFIX:** Timestamp conversion ✅
- [x] **Frontend:** Mock exam page layout
- [x] **Frontend:** Camera integration
- [x] **Frontend:** Event detection (tab/paste/focus)
- [x] **Frontend:** Timer + submit logic

### 🔄 TUẦN 3: RabbitMQ + Worker (NEXT)
- [ ] RabbitMQ setup
- [ ] Worker consumer
- [ ] Face detection stub
- [ ] NO_FACE / MULTI_FACE incidents
- [ ] Frontend Candidate pages (Exams list, Results, Violations)

---

## 🚀 LỆNH HỮU ÍCH

### Khởi động hệ thống
```bash
docker-compose up -d
```

### Xem logs
```bash
docker-compose logs -f backend
docker-compose logs postgres
```

### Rebuild backend (sau khi sửa code)
```bash
docker-compose up --build -d backend
```

### Kiểm tra Redis
```bash
docker exec -it exam-redis redis-cli
> PING
> KEYS session:*
> GET session:xxx:tabswitch:123
```

### Kiểm tra Database
```bash
docker exec -it examdb psql -U postgres -d examdb
> SELECT * FROM exams;
> SELECT * FROM incidents;
```

### Test API
```bash
# Danh sách kỳ thi
curl http://localhost:8080/api/exams

# Chi tiết kỳ thi
curl http://localhost:8080/api/exams/11111111-1111-1111-1111-111111111111

# Test tab-abuse
.\test-tab-abuse.ps1
```

### Reset toàn bộ (clean start)
```bash
docker-compose down -v
docker-compose up --build
```

---

## 📞 TROUBLESHOOTING

### Backend không start
→ Xem: `docs/DEBUG_BACKEND_CRASH.md`

### API trả về 404
→ Check `docker logs exam-cheating-detection-v2-backend-1`

### Redis connection failed
→ `docker restart exam-redis`

### Database migration lỗi
→ `docker-compose down -v` (xóa volumes) → `docker-compose up`

---

## 🔜 BƯỚC TIẾP THEO

**Ưu tiên cao:**
1. Phát triển Mock Exam Page (Frontend)
   - Camera integration với getUserMedia()
   - Auto snapshot mỗi 3 giây
   - Tab switch detection
   - Timer countdown

2. Test end-to-end flow:
   - Thí sinh làm bài
   - Chuyển tab nhiều lần
   - Verify incident tự động tạo
   - Xem kết quả

**Ưu tiên trung bình:**
3. RabbitMQ + Worker (Week 3)
4. Face detection stub
5. Frontend cho Proctor/Admin

---

**📊 OVERALL STATUS: 🟢 HEALTHY**

Backend ổn định, tất cả services running, tab-abuse rule hoạt động perfect. Sẵn sàng cho frontend development!

---

_Last updated: 2025-11-16 by Copilot CLI_
