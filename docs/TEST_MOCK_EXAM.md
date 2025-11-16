# 🧪 HƯỚNG DẪN TEST MOCK EXAM PAGE

## 🚀 Bước 1: Khởi động hệ thống

### Terminal 1: Backend
```bash
docker-compose up
```
Chờ đến khi thấy: `Started ExamApplication in ... seconds`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Chờ đến khi thấy: `Local: http://localhost:5173/`

---

## 🌐 Bước 2: Mở trình duyệt

```
http://localhost:5173/mock-exam/11111111-1111-1111-1111-111111111111
```

**Grant camera permission** khi browser yêu cầu.

---

## ✅ Bước 3: Verify Features

### 1. Initial Load ✅
- [ ] Loading spinner hiển thị
- [ ] Sau 1-2 giây: Trang thi hiển thị
- [ ] Header: "Demo Exam - Active"
- [ ] Session ID hiển thị
- [ ] Timer bắt đầu: "45:00"
- [ ] Camera preview góc phải (video feed)
- [ ] "REC" badge màu đỏ hiển thị
- [ ] 10 câu hỏi hiển thị

### 2. Questions Display ✅
- [ ] 5 câu trắc nghiệm đầu (4 options mỗi câu)
- [ ] 5 câu tự luận cuối (textarea)
- [ ] Card border, title rõ ràng

### 3. Camera & Snapshot ✅
- [ ] Video feed hoạt động
- [ ] Mở DevTools → Network tab
- [ ] Mỗi 3 giây: thấy request `POST /api/ingest/snapshots/upload`
- [ ] Status: 200 OK
- [ ] Payload: FormData với file JPEG

### 4. Timer ✅
- [ ] Countdown từ 45:00
- [ ] Mỗi giây giảm 1
- [ ] Khi < 1 phút: màu đỏ
- [ ] (Optional) Đợi đến 00:00 → Auto submit

### 5. Tab Switch Detection ✅
**Chuyển tab 3 lần:**
- [ ] Tab 1: Mock exam page
- [ ] Tab 2: Google.com
- [ ] Tab 3: Back to mock exam
- [ ] Repeat 2 lần nữa (total: 3 switches)

**Kết quả:**
- [ ] Violation alert hiển thị phía trên questions
- [ ] Text: "Warning: 3 violation(s) detected (3 tab switches)"
- [ ] Alert màu đỏ

**Network tab:**
- [ ] 3 requests `POST /api/ingest/events`
- [ ] Request Body: `{ items: [{ eventType: "TAB_SWITCH", ... }] }`

**Backend logs:**
```bash
docker logs exam-cheating-detection-v2-backend-1 --tail 20
```
- [ ] Thấy: "Tab switch count for session ... : 1, 2, 3"

### 6. Paste Detection ✅
**Trong textarea câu tự luận:**
- [ ] Copy text từ đâu đó
- [ ] Paste (Ctrl+V) vào textarea
- [ ] Network tab: `POST /api/ingest/events` với `eventType: "PASTE_DETECTED"`

### 7. Answer Questions ✅
- [ ] Click radio button (MC questions)
- [ ] Type text vào textarea (text questions)
- [ ] Answers state update (check React DevTools nếu có)

### 8. Submit ✅
**Click "Submit Exam" button:**
- [ ] Confirmation dialog hiển thị
- [ ] Text: "Are you sure you want to submit? You have answered X/10 questions."
- [ ] Click "OK"

**Kết quả:**
- [ ] Button disabled
- [ ] Text: "Submitting..."
- [ ] Network: `POST /api/mock-exam/submit`
- [ ] Alert: "Exam submitted successfully!"
- [ ] Navigate về `/my-results` (placeholder page)

---

## 🔍 Bước 4: Verify Backend Data

### Check Incidents Created

```bash
# Lấy sessionId từ UI hoặc backend logs
curl http://localhost:8080/api/incidents?sessionId=<sessionId>
```

**Nếu đã switch tab > 10 lần:**
```json
{
  "id": "...",
  "sessionId": "...",
  "ts": 1763298759,
  "type": "TAB_ABUSE",
  "score": 0.6,
  "reason": "Tab switched 11 times in 5 minutes (threshold: 10)",
  "status": "OPEN",
  "createdAt": "..."
}
```

### Check Events Logged

```bash
docker exec -it examdb psql -U postgres -d examdb

SELECT event_type, COUNT(*) 
FROM events 
WHERE session_id = '<sessionId>' 
GROUP BY event_type;
```

**Kết quả mong đợi:**
```
  event_type   | count
---------------+-------
 TAB_SWITCH    |    12
 PASTE_DETECTED|     2
 FOCUS_LOST    |     5
 FOCUS_GAINED  |     5
```

### Check Snapshots Uploaded

```sql
SELECT COUNT(*), MIN(created_at), MAX(created_at)
FROM media_snapshots
WHERE session_id = '<sessionId>';
```

**Kết quả:** Số lượng snapshots = (exam duration in seconds) / 3

---

## 🐛 Troubleshooting

### Camera không bật
- Grant permission trong browser
- Kiểm tra webcam không bị app khác chiếm
- Refresh page

### Timer không chạy
- Check console errors
- Verify `useTimer` hook initialized với `autoStart: !loading`

### Events không gửi
- Check Network tab → có errors?
- Verify backend running: `curl http://localhost:8080/api/exams`
- Check sessionId có tồn tại không

### Snapshots không upload
- Check console: có errors từ `useWebcam`?
- Verify blob được tạo: Log trong `handleSnapshot`
- Check backend endpoint: `/api/ingest/snapshots/upload` working

### Frontend không start
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Backend crash
```bash
docker-compose down
docker-compose up --build
```

---

## 📊 Expected Test Results

### Metrics sau 1 phút thi

| Metric | Expected |
|--------|----------|
| Snapshots uploaded | ~20 (1 per 3s) |
| TAB_SWITCH events | Depends on user |
| PASTE_DETECTED events | Depends on user |
| FOCUS_LOST/GAINED | Depends on user |
| Timer remaining | ~44:00 |
| Violations warning | If tab switched |

### Complete Session Test

1. Start exam
2. Answer 5 questions
3. Switch tab 12 times (within 1 minute)
4. Paste text 3 times
5. Wait for 20 snapshots (~1 minute)
6. Submit exam

**Expected database state:**
- 1 session (status: ENDED)
- ~20 snapshots
- ~18 events (12 TAB_SWITCH + 3 PASTE + 3 FOCUS pairs)
- 1 incident (TAB_ABUSE) - if 12 switches in same minute
- 1 review record (from submit)

---

## ✅ Test Complete Checklist

- [ ] Camera working
- [ ] Timer countdown
- [ ] 10 questions display
- [ ] Can answer questions
- [ ] Tab detection working
- [ ] Paste detection working
- [ ] Snapshots uploading
- [ ] Submit with confirmation
- [ ] Navigate after submit
- [ ] Backend incidents created
- [ ] Events logged in DB
- [ ] Snapshots saved in DB

---

**🎉 Nếu tất cả đều PASS → MOCK EXAM PAGE HOÀN THÀNH!**

Ready for Week 3: RabbitMQ + Worker + Face Detection! 🚀
