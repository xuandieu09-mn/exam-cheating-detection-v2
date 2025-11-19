# 📋 TUẦN 3: RABBITMQ + WORKER + CANDIDATE UI

**Ngày bắt đầu:** 18/11/2024  
**Mục tiêu:** Xử lý ảnh async + Hoàn thiện UI Thí sinh

---

## 🎯 MỤC TIÊU TUẦN 3

### Backend (3 ngày)
1. ✅ RabbitMQ Setup trong Docker Compose
2. ✅ Producer: Publish message sau khi upload snapshot
3. ✅ Consumer/Worker: Xử lý ảnh + Face detection stub
4. ✅ Auto-create NO_FACE / MULTI_FACE incidents

### Frontend (4 ngày)
1. ⏳ Trang "Kỳ thi" (Exams List) 
2. ⏳ Trang "Kết quả của tôi" (My Results)
3. ⏳ Trang "Vi phạm của tôi" (My Violations)
4. ⏳ Polish UI (loading states, error handling)

---

## 📝 CHECKLIST CHI TIẾT

### Backend Day 1: RabbitMQ Setup
- [x] **docker-compose.yml:** Thêm service RabbitMQ
  - Image: `rabbitmq:3-management`
  - Port 5672 (AMQP) + 15672 (Management UI)
  - Volume cho persistence
  - Environment variables (username, password)
  
- [x] **pom.xml:** Thêm dependency
  ```xml
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
  </dependency>
  ```

- [x] **application-dev.yml:** RabbitMQ config
  ```yaml
  spring:
    rabbitmq:
      host: rabbitmq
      port: 5672
      username: guest
      password: guest
  ```

- [x] **RabbitMQConfig.java:** Tạo queue + exchange + binding
  - Queue name: `snapshot.process`
  - Exchange: `exam.events`
  - Routing key: `snapshot.uploaded`

- [x] **Test:** Publish/consume message thành công

---

### Backend Day 2: Producer (IngestService)
- [x] **SnapshotMessage DTO:**
  ```java
  public record SnapshotMessage(
    UUID snapshotId,
    UUID sessionId,
    String objectKey,
    Long timestamp
  ) {}
  ```

- [x] **IngestService:** Sau khi lưu snapshot → publish message
  ```java
  rabbitTemplate.convertAndSend(
    "exam.events",
    "snapshot.uploaded", 
    new SnapshotMessage(...)
  );
  ```

- [x] **Test:** Upload snapshot → check RabbitMQ management UI có message

---

### Backend Day 3: Worker (Consumer)
- [x] **FaceDetectionWorker.java:**
  ```java
  @RabbitListener(queues = "snapshot.process")
  public void processSnapshot(SnapshotMessage message) {
    // 1. Get snapshot from DB
    // 2. Stub face detection (random 0, 1, 2)
    // 3. Update media_snapshots.face_count
    // 4. Create incident if needed
  }
  ```

- [x] **Face Detection Logic:**
  - Random face_count: 0 (30%), 1 (60%), 2 (10%)
  - `face_count == 0` → Create `NO_FACE` incident
  - `face_count >= 2` → Create `MULTI_FACE` incident
  - Score: 0.7-0.9

- [x] **Idempotency:** Check if incident already exists before creating

- [x] **Test E2E:**
  - Upload 10 snapshots
  - Worker processes all
  - Verify DB updated
  - Verify incidents created

---

### Frontend Day 1: Trang "Kỳ thi" (ExamsPage)
- [ ] **File:** `frontend/src/pages/roles/ExamsPage.tsx`

- [ ] **Layout:**
  - Header: "Danh sách kỳ thi"
  - Search bar (filter by name)
  - Grid của exam cards (3 columns)

- [ ] **Exam Card:**
  - Tên kỳ thi
  - Thời gian: "45 phút"
  - Số câu hỏi: "10 câu"
  - Trạng thái: Badge (ACTIVE/ENDED)
  - Nút "Bắt đầu thi" → navigate `/mock-exam/:examId`

- [ ] **API call:** `GET /api/exams?status=ACTIVE`

- [ ] **Loading state:** Skeleton cards khi đang fetch

- [ ] **Empty state:** "Hiện không có kỳ thi nào đang mở"

---

### Frontend Day 2: Trang "Kết quả của tôi" (MyResultsPage)
- [ ] **File:** `frontend/src/pages/roles/MyResultsPage.tsx`

- [ ] **Layout:**
  - Header: "Kết quả của tôi"
  - Table với columns:
    - Kỳ thi
    - Thời gian làm bài
    - Trạng thái (ACTIVE/ENDED)
    - Số vi phạm
    - Hành động (Xem chi tiết)

- [ ] **API call:** `GET /api/users/{userId}/sessions`
  - Get userId from AuthContext

- [ ] **Detail Modal:**
  - Click "Xem chi tiết" → Show modal
  - Session info: Start time, end time, duration
  - List of incidents với loại + thời gian

- [ ] **Badge colors:**
  - ACTIVE: Blue
  - ENDED: Gray

---

### Frontend Day 3: Trang "Vi phạm của tôi" (MyViolationsPage)
- [ ] **File:** `frontend/src/pages/roles/MyViolationsPage.tsx`

- [ ] **Layout:**
  - Header: "Vi phạm của tôi"
  - Filter: Chọn kỳ thi (dropdown)
  - Table:
    - Kỳ thi
    - Loại vi phạm (TAB_ABUSE, NO_FACE, etc.)
    - Thời gian
    - Điểm nghiêm trọng (Score)
    - Trạng thái duyệt (OPEN/CONFIRMED/REJECTED)
    - Ghi chú của giám thị

- [ ] **API call:**
  - Get all sessions: `GET /api/users/{userId}/sessions`
  - For each session: `GET /api/incidents?sessionId={sessionId}`

- [ ] **Badge colors:**
  - OPEN: Yellow (⚠️ Chưa duyệt)
  - CONFIRMED: Red (❌ Xác nhận gian lận)
  - REJECTED: Green (✅ Không vi phạm)

- [ ] **Pagination:** 20 records per page

---

### Frontend Day 4: Polish Candidate UI
- [ ] **Loading states:**
  - Skeleton loaders cho tables
  - Spinner khi submit form
  - Disabled buttons khi loading

- [ ] **Empty states:**
  - "Bạn chưa tham gia kỳ thi nào"
  - "Bạn không có vi phạm nào"
  - Icon + message thân thiện

- [ ] **Error handling:**
  - Toast notifications (react-hot-toast)
  - Error boundaries cho từng page
  - Retry button khi API failed

- [ ] **Responsive design:**
  - Mobile-friendly tables (horizontal scroll)
  - Stack columns trên mobile
  - Touch-friendly buttons (min 44px)

- [ ] **Navigation:**
  - Breadcrumbs
  - Active menu item highlight
  - Back buttons

---

## 🧪 TEST CHECKLIST

### Backend Tests
- [x] RabbitMQ container running (`docker ps`)
- [x] Management UI accessible (`http://localhost:15672`)
- [x] Upload snapshot → message in queue
- [x] Worker consumes message → DB updated
- [x] NO_FACE incident created (face_count = 0)
- [x] MULTI_FACE incident created (face_count >= 2)

### Frontend Tests
- [ ] ExamsPage shows active exams
- [ ] Click "Bắt đầu thi" → navigates to MockExamPage
- [ ] MyResultsPage shows user's sessions
- [ ] Detail modal opens with correct data
- [ ] MyViolationsPage filters by exam
- [ ] Badge colors correct (OPEN/CONFIRMED/REJECTED)
- [ ] Loading states work
- [ ] Empty states display correctly
- [ ] Mobile responsive

---

## 📊 DELIVERABLES TUẦN 3

### Backend
✅ RabbitMQ integrated  
✅ Worker xử lý ảnh async  
✅ NO_FACE / MULTI_FACE incidents tự động  
✅ API stable, tested  

### Frontend
✅ Candidate có đầy đủ 4 chức năng:
1. Xem danh sách kỳ thi
2. Làm bài thi (Mock Exam - từ tuần 2)
3. Xem kết quả
4. Xem vi phạm của mình

✅ UI đẹp, responsive  
✅ Error handling hoàn chỉnh  

---

## 🚀 COMMANDS

### Start RabbitMQ
```bash
docker-compose up -d rabbitmq
```

### Check RabbitMQ logs
```bash
docker-compose logs -f rabbitmq
```

### Access Management UI
```
http://localhost:15672
Username: guest
Password: guest
```

### Test message flow
```bash
.\test-rabbitmq.ps1
```

---

## 🔜 NEXT STEPS (Tuần 4)

- JWT Authentication
- Proctor UI (Duyệt vi phạm)
- Admin UI (Quản lý kỳ thi, Thống kê)

---

**Status:** ✅ BACKEND COMPLETED, 🔄 FRONTEND IN PROGRESS  
**Started:** 18/11/2024  
**Backend Completed:** 18/11/2024
