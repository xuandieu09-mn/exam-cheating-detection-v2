# ✅ TUẦN 2 HOÀN THÀNH

**Ngày hoàn thành:** 18/11/2024

---

## 🎯 MỤC TIÊU TUẦN 2

Hoàn thiện tính năng phát hiện gian lận tự động:
- Tab Switch Detection
- Paste Detection
- Redis Tab-Abuse Rule
- UI Warning System

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Frontend - Event Detection

**File:** `frontend/src/lib/hooks/useEventDetection.ts`

**Tính năng:**
- ✅ Tab Switch Detection (visibilitychange event)
- ✅ Paste Detection (paste event trong textarea/input)
- ✅ Focus/Blur Detection
- ✅ Auto cleanup khi unmount

**Code highlight:**
```typescript
const handleVisibilityChange = () => {
  if (document.hidden) {
    onEvent('TAB_SWITCH');
  }
};

const handlePaste = (e: ClipboardEvent) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
    onEvent('PASTE');
  }
};
```

---

### 2. Backend - Redis Tab-Abuse Rule

**File:** `backend/src/main/java/com/example/exam/service/RuleService.java`

**Tính năng:**
- ✅ Redis counter cho tab switches (với time window)
- ✅ Threshold: 10 tab switches trong 5 phút
- ✅ Tự động tạo TAB_ABUSE incident
- ✅ Score calculation (0.5 - 1.0)
- ✅ Idempotent (không tạo duplicate incident)

**Logic:**
```
1. User switch tab → Frontend gửi TAB_SWITCH event
2. Backend nhận event → Lưu vào DB
3. RuleService.evaluateTabSwitch():
   - Redis INCR session:{sessionId}:tabswitch:{minute}
   - Nếu count > 10 → Tạo incident TAB_ABUSE
   - Set expiration 5 phút
4. Score = min(1.0, (count - 10) / 10 + 0.5)
```

---

### 3. Frontend - UI Warning Component

**File:** `frontend/src/pages/MockExamPage.tsx` (line 211-222)

**Tính năng:**
- ✅ Real-time violation tracking
- ✅ Alert component màu đỏ khi có vi phạm
- ✅ Hiển thị số lượng violations
- ✅ Breakdown theo loại (tab switches, paste, etc.)

**UI:**
```tsx
{violations.length > 0 && (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      <strong>Warning:</strong> {violations.length} violation(s) detected
      {violations.filter(v => v.type === 'TAB_SWITCH').length > 0 && 
        ` (${violations.filter(v => v.type === 'TAB_SWITCH').length} tab switches)`}
    </AlertDescription>
  </Alert>
)}
```

---

### 4. Integration - IngestService

**File:** `backend/src/main/java/com/example/exam/service/IngestService.java` (line 95-97)

**Tích hợp:**
```java
// After saving TAB_SWITCH event → evaluate rule
if (item.eventType == EventType.TAB_SWITCH) {
    ruleService.evaluateTabSwitch(sessionId, Instant.ofEpochMilli(item.ts));
}
```

---

## 🧪 TEST RESULTS

### E2E Test (Automated)

**File:** `test-e2e-mock-exam.ps1`

**Kết quả:**
```
✅ Test 1: Backend Health Check - PASS
✅ Test 2: Start Mock Exam Session - PASS
✅ Test 3: Get Questions - PASS (10 questions)
✅ Test 4: Simulate Tab Switching (12 events) - PASS
✅ Test 5: Check TAB_ABUSE Incident - PASS
   - Score: 0.6
   - Reason: "Tab switched 11 times in 5 minutes (threshold: 10)"
   - Status: OPEN
✅ Test 6: Snapshot Upload - SKIP (manual test)
✅ Test 7: Submit Exam - PASS
✅ Test 8: Verify Session Status - PASS
```

### Manual Test Checklist

**URL:** `http://localhost:5175/mock-exam/11111111-1111-1111-1111-111111111111`

- [x] Camera bật thành công
- [x] Timer đếm ngược từ 45:00
- [x] Snapshot upload mỗi 3 giây
- [x] Tab switch → UI warning xuất hiện
- [x] Paste detection → Event gửi lên backend
- [x] >10 tab switches → TAB_ABUSE incident tự động tạo

---

## 📊 DATABASE SCHEMA

### Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    ts BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- TAB_SWITCH, PASTE, FOCUS, BLUR
    details JSONB,
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP,
    UNIQUE (session_id, ts, event_type)
);
```

### Incidents Table
```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- TAB_ABUSE, NO_FACE, MULTI_FACE, etc.
    ts BIGINT NOT NULL,
    score NUMERIC(5,2),
    reason TEXT,
    evidence_url TEXT,
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, CONFIRMED, REJECTED
    created_at TIMESTAMP
);
```

---

## 🔧 CONFIGURATION

### Backend - RuleService Thresholds

```java
private static final int TAB_SWITCH_THRESHOLD = 10;
private static final int TAB_SWITCH_WINDOW_MINUTES = 5;
```

**Thay đổi:**
- Sửa `TAB_SWITCH_THRESHOLD` để điều chỉnh độ nhạy
- Sửa `TAB_SWITCH_WINDOW_MINUTES` để thay đổi time window

### Frontend - Webcam Capture Interval

```typescript
const { videoRef } = useWebcam({
  onSnapshot: handleSnapshot,
  captureInterval: 3000, // milliseconds
  enabled: !!sessionId && !submitting
});
```

---

## 🚀 NEXT STEPS (Tuần 3)

Theo kế hoạch ban đầu:

### Backend
- [ ] RabbitMQ Setup (docker-compose.yml)
- [ ] Worker async xử lý ảnh (FaceDetectionWorker)
- [ ] NO_FACE/MULTI_FACE incidents

### Frontend - Candidate UI
- [ ] Trang "Kỳ thi" (Exams List)
- [ ] Trang "Kết quả của tôi"
- [ ] Trang "Vi phạm của tôi"
- [ ] Polish UI (loading states, empty states)

---

## 📝 NOTES

### Lỗi đã sửa trong quá trình implement:
1. ❌ 415 Unsupported Media Type → ✅ Fixed bằng cách thêm multipart endpoint
2. ❌ Frontend node_modules corrupted → ✅ Reinstall dependencies
3. ❌ Port conflicts (5173-5177) → ✅ Auto port selection

### Lessons Learned:
- Redis counters rất hiệu quả cho time-window detection
- Idempotency key quan trọng để tránh duplicate incidents
- Frontend event detection cần debounce để tránh spam events

---

## 👥 CONTRIBUTORS

- AI Assistant: Implementation + Testing
- User: Requirements + Manual Testing

---

**Status:** ✅ COMPLETED  
**Date:** 18/11/2024  
**Time Spent:** ~2 hours
