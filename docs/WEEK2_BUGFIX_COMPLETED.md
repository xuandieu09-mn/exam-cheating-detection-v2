# 🐛 WEEK 2 - BUGFIX: TAB-ABUSE RULE HOÀN THÀNH

## 📅 Ngày thực hiện: 16/11/2025

---

## ❌ VẤN ĐỀ BAN ĐẦU

Theo log `run3.log`, backend gặp 2 lỗi:

### 1. **Lỗi Runtime:**
```
Error: Unable to access jarfile target\exam-backend-0.0.1-SNAPSHOT.jar
```

**Nguyên nhân:** JAR file chưa được build (Docker image chưa tồn tại)

**Giải pháp:** Build Docker image với multi-stage Dockerfile

### 2. **Lỗi Logic: Tab-abuse rule không tạo incident**

**Nguyên nhân:** `IngestService.java` line 96 sử dụng sai method:
```java
// ❌ SAI: ts là milliseconds nhưng dùng ofEpochSecond
ruleService.evaluateTabSwitch(sessionId, Instant.ofEpochSecond(item.ts));
```

**Hệ quả:**
- Timestamp bị sai lệch 1000 lần
- Redis keys được tạo ở các time window sai
- Mỗi event tạo một key riêng thay vì increment chung
- Threshold không bao giờ đạt → Không tạo incident

---

## ✅ GIẢI PHÁP ĐÃ THỰC HIỆN

### 1. Build Backend với Docker

**Lệnh thực hiện:**
```bash
docker-compose down -v
docker-compose up --build
```

**Kết quả:**
- ✅ Flyway migrations applied: V1 → V5
- ✅ Spring Boot started on port 8080
- ✅ Postgres, Redis, Backend all healthy

### 2. Sửa lỗi timestamp trong IngestService.java

**File:** `backend/src/main/java/com/example/exam/service/IngestService.java`

**Line 96 - Before:**
```java
ruleService.evaluateTabSwitch(sessionId, Instant.ofEpochSecond(item.ts));
```

**Line 96 - After:**
```java
ruleService.evaluateTabSwitch(sessionId, Instant.ofEpochMilli(item.ts));
```

**Rebuild:**
```bash
docker-compose up --build -d backend
```

---

## 🧪 KIỂM TRA HOÀN THÀNH

### Test Script: `test-tab-abuse.ps1`

**Kịch bản test:**
1. Tạo mock exam session
2. Gửi 12 TAB_SWITCH events (threshold = 10)
3. Kiểm tra incident được tạo tự động

**Kết quả:**
```
✓ Session created: 9d896de9-3613-46cd-8471-29ccab2e8f8c
✓ Sent 12 events
✓ SUCCESS! TAB_ABUSE incident detected!

Incident details:
  ID: b0101078-8a0b-4b1d-8cb1-d884a1c0dea4
  Type: TAB_ABUSE
  Score: 0.6
  Reason: Tab switched 11 times in 5 minutes (threshold: 10)
  Status: OPEN
```

**Redis keys verification:**
```
session:9d896de9-3613-46cd-8471-29ccab2e8f8c:tabswitch:29388318      → Counter
session:9d896de9-3613-46cd-8471-29ccab2e8f8c:tababuse:incident:29388318  → Incident flag
```

**Backend logs:**
```
TAB_ABUSE incident created for session 9d896de9-3613-46cd-8471-29ccab2e8f8c - count: 11
```

---

## 📊 TÍNH NĂNG ĐÃ HOÀN THÀNH

### ✅ Backend Services

| Service | Status | Port | Health |
|---------|--------|------|--------|
| Postgres | ✅ Running | 55432 | Healthy |
| Redis | ✅ Running | 6379 | Healthy |
| Backend | ✅ Running | 8080 | Healthy |

### ✅ APIs hoạt động

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/exams` | GET | ✅ Working |
| `/api/mock-exam/start` | POST | ✅ Working |
| `/api/mock-exam/{id}/questions` | GET | ✅ Working |
| `/api/ingest/events` | POST | ✅ Working |
| `/api/incidents?sessionId={id}` | GET | ✅ Working |

### ✅ Tab-Abuse Detection Rule

- **Redis integration:** ✅ Working
- **Real-time counting:** ✅ Working (per-minute window)
- **Threshold detection:** ✅ Working (> 10 switches → incident)
- **Idempotency:** ✅ Working (SETNX prevents duplicates)
- **Score calculation:** ✅ Working (0.5-1.0 linear scale)
- **Auto-incident creation:** ✅ Working

**Rule Configuration:**
```java
TAB_SWITCH_THRESHOLD = 10
TAB_SWITCH_WINDOW_MINUTES = 5
TTL = 6 minutes (window + 1 minute buffer)
```

---

## 🔍 TECHNICAL DETAILS

### Timestamp Format

| Location | Type | Format | Example |
|----------|------|--------|---------|
| API Request | Long | Epoch milliseconds | `1763298759000` |
| Database `events.ts` | BIGINT | Epoch milliseconds | `1763298216113` |
| Database `incidents.ts` | BIGINT | Epoch seconds | `1763298759` |
| Java `Instant` | Object | Internal representation | Both supported |

**⚠️ Quan trọng:** 
- API input `ts` là **milliseconds** (13 digits)
- Phải dùng `Instant.ofEpochMilli()` chứ không phải `ofEpochSecond()`

### Redis Key Structure

**Counter key:**
```
session:{sessionId}:tabswitch:{minute}
Value: Integer (incremented on each TAB_SWITCH)
TTL: 6 minutes
```

**Incident flag key:**
```
session:{sessionId}:tababuse:incident:{minute}
Value: "1" (set with SETNX)
TTL: 6 minutes
Purpose: Prevent duplicate incident creation
```

### RuleService Logic Flow

```
TAB_SWITCH event arrives
  ↓
Calculate minute key = ts.getEpochSecond() / 60
  ↓
Redis INCR session:{sessionId}:tabswitch:{minute}
  ↓
count > 10?
  ↓ YES
SETNX session:{sessionId}:tababuse:incident:{minute}
  ↓ SUCCESS (key didn't exist)
Create Incident record in DB
  ↓
Log: "TAB_ABUSE incident created"
```

---

## 🎯 TUẦN 2 - STATUS

### ✅ Hoàn thành 100%

- [x] **Ngày 1:** Redis setup
- [x] **Ngày 2:** Tab-abuse rule implementation
- [x] **Ngày 3:** Mock exam APIs
- [x] **Bugfix:** Timestamp conversion error
- [x] **Testing:** End-to-end verification

### 📝 Files đã sửa đổi

1. **backend/src/main/java/com/example/exam/service/IngestService.java**
   - Line 96: `ofEpochSecond()` → `ofEpochMilli()`

2. **test-tab-abuse.ps1** (New)
   - Automated test script cho tab-abuse rule

### 🔄 Bước tiếp theo: TUẦN 2 - FRONTEND

**Ngày 4-7: Mock Exam Page**
- [ ] Layout với timer + camera preview
- [ ] Camera integration với auto snapshot
- [ ] Tab/Paste/Focus event detection
- [ ] Submit logic
- [ ] Warning UI

---

## 📚 Tài liệu tham khảo

- [DEBUG_BACKEND_CRASH.md](DEBUG_BACKEND_CRASH.md) - Troubleshooting guide
- [WEEK2_BACKEND_COMPLETED.md](WEEK2_BACKEND_COMPLETED.md) - Backend week 2 summary
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Data Redis](https://spring.io/projects/spring-data-redis)

---

**✅ BACKEND WEEK 2 - HOÀN THÀNH & VERIFIED!** 🎉

Tất cả services chạy ổn định, tab-abuse rule hoạt động chính xác, sẵn sàng cho frontend integration.
