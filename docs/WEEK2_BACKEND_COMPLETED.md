# ✅ TUẦN 2 - BACKEND (NGÀY 1-3): HOÀN THÀNH

## 📅 Ngày thực hiện: 16/11/2025

## ✅ Đã hoàn thành

### 1. Redis Setup
✅ **docker-compose.yml** - Thêm Redis service
- Image: `redis:7-alpine`
- Port: 6379
- Healthcheck: redis-cli ping
- Persistent storage với volume `redis-data`
- AOF persistence enabled

✅ **pom.xml** - Thêm dependency
- `spring-boot-starter-data-redis`

✅ **application-dev.yml** - Config Redis
- Host: redis (Docker) / localhost (local dev)
- Port: 6379
- Timeout: 2000ms

### 2. Rule Service - Tab Abuse Detection
✅ **File mới:** `RuleService.java`
- Auto-detect tab abuse rule
- Redis counter: `session:{sessionId}:tabswitch:{minute}`
- Threshold: 10 switches trong 5 phút
- Auto create `TAB_ABUSE` incident khi vượt ngưỡng
- Idempotent: Chỉ tạo 1 incident per time window
- Score calculation: Linear scale 0.5-1.0
- Expire keys tự động sau 6 phút

**Logic:**
1. Mỗi TAB_SWITCH event → Redis INCR counter
2. Counter > 10 → Check chưa tạo incident
3. Tạo incident với score + reason
4. Set flag để tránh duplicate

### 3. Integration với IngestService
✅ **File updated:** `IngestService.java`
- Inject RuleService vào constructor
- Sau khi save event TAB_SWITCH → gọi `ruleService.evaluateTabSwitch()`
- Real-time detection ngay khi ingest

### 4. Mock Exam APIs
✅ **File mới:** `MockExamDto.java`
- DTOs cho start session, get questions, submit
- Validation annotations
- Records cho clean code

✅ **File mới:** `MockExamService.java`
- `startSession()`: Tạo session ACTIVE
- `getQuestions()`: Trả về 10 câu hỏi mock (5 trắc nghiệm + 5 tự luận)
- `submitExam()`: End session, log answers

✅ **File mới:** `MockExamController.java`
- `POST /api/mock-exam/start`
- `GET /api/mock-exam/{examId}/questions`
- `POST /api/mock-exam/submit`
- Swagger docs integration

## 📊 Tổng kết

### Files đã tạo mới (5 files):
1. `service/RuleService.java` - Tab-abuse detection
2. `dto/MockExamDto.java` - DTOs cho mock exam
3. `service/MockExamService.java` - Business logic
4. `controller/MockExamController.java` - REST endpoints

### Files đã update (4 files):
1. `docker-compose.yml` - Thêm Redis service
2. `pom.xml` - Thêm Redis dependency
3. `application-dev.yml` - Config Redis
4. `service/IngestService.java` - Integrate RuleService

## 🎯 Features hoàn thành

✅ **Redis Integration:**
- Docker container running
- Spring Data Redis configured
- Connection tested

✅ **Tab-Abuse Rule:**
- Real-time detection
- Redis-based counting
- Auto incident creation
- Idempotent logic
- Configurable thresholds

✅ **Mock Exam API:**
- Start exam session
- Get 10 sample questions
- Submit answers
- End session automatically

## 🧪 Test Cases

**Test 1: Redis Connection**
```bash
docker exec -it exam-redis redis-cli ping
# Expected: PONG
```

**Test 2: Tab-Abuse Detection**
```bash
# 1. Start session
POST /api/mock-exam/start
{"examId": "11111111-1111-1111-1111-111111111111", "userId": "22222222-2222-2222-2222-222222222222"}

# 2. Send 12 TAB_SWITCH events
POST /api/ingest/events
{"items": [{"sessionId": "<sessionId>", "ts": "2025-11-16T10:00:00Z", "eventType": "TAB_SWITCH", ...}]}

# 3. Check incidents
GET /api/incidents?sessionId=<sessionId>
# Expected: 1 incident with type=TAB_ABUSE
```

**Test 3: Mock Exam Flow**
```bash
# 1. Get questions
GET /api/mock-exam/11111111-1111-1111-1111-111111111111/questions

# 2. Submit answers
POST /api/mock-exam/submit
{"sessionId": "<sessionId>", "answers": [...]}
```

## 🔧 Configuration

**Rule Thresholds (in RuleService.java):**
- TAB_SWITCH_THRESHOLD = 10
- TAB_SWITCH_WINDOW_MINUTES = 5

**Redis Keys:**
- Counter: `session:{sessionId}:tabswitch:{minute}`
- Incident flag: `session:{sessionId}:tababuse:incident:{minute}`
- TTL: 6 minutes (window + 1 minute buffer)

## 📝 Notes

- **Mock questions:** Hardcoded 10 câu, sẽ thay bằng DB ở tuần sau
- **Score calculation:** Chưa implement, trả về mock message
- **Redis persistence:** AOF enabled để không mất data khi restart
- **Scalability:** Redis counters support high throughput
- **Idempotency:** Double-check với Redis SETNX để tránh race condition

## 🔄 Bước tiếp theo

**TUẦN 2 - NGÀY 4-7: FRONTEND - MOCK EXAM PAGE**
- MockExamPage layout
- Camera integration
- Auto snapshot every 3 seconds
- Tab/Paste/Focus detection
- Timer countdown
- Submit logic

---

**Backend TUẦN 2 đã hoàn thành 100%!** 🎉
Redis + RuleService + Mock Exam APIs ready để frontend integrate.
