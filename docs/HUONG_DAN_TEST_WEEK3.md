# 🧪 HƯỚNG DẪN TEST WEEK 3 BACKEND

**Mục tiêu:** Kiểm tra RabbitMQ + Face Detection Worker hoạt động đúng

---

## 🚀 BƯỚC 1: KHỞI ĐỘNG HỆ THỐNG

### 1.1. Kiểm tra Docker Desktop đang chạy
- Mở Docker Desktop
- Đảm bảo Docker engine đang running

### 1.2. Khởi động tất cả services
```powershell
cd "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2"
docker-compose up -d
```

**Kết quả mong đợi:**
```
✔ Container examdb                                 Running
✔ Container exam-redis                             Running  
✔ Container exam-rabbitmq                          Running
✔ Container exam-cheating-detection-v2-backend-1   Running
```

### 1.3. Kiểm tra tất cả services đã healthy
```powershell
docker ps
```

**Phải thấy 4 containers:**
- examdb (healthy)
- exam-redis (healthy)
- exam-rabbitmq (healthy)
- exam-cheating-detection-v2-backend-1 (up)

---

## 🧪 BƯỚC 2: TEST RABBITMQ MANAGEMENT UI

### 2.1. Mở trình duyệt
Truy cập: http://localhost:15672

### 2.2. Đăng nhập
- **Username:** guest
- **Password:** guest

### 2.3. Kiểm tra Queue đã tạo
- Click tab **Queues**
- Phải thấy queue tên: **`snapshot.process`**
- Status: idle (không có message đang chờ)

### 2.4. Kiểm tra Exchange
- Click tab **Exchanges**
- Phải thấy exchange tên: **`exam.events`**
- Type: topic

---

## 🧪 BƯỚC 3: TEST BACKEND API

### 3.1. Test API exams
```powershell
Invoke-RestMethod -Uri http://localhost:8080/api/exams -Method Get
```

**Kết quả mong đợi:** Danh sách 3 kỳ thi (Demo Exam, Midterm, Final)

### 3.2. Test API health
```powershell
Invoke-RestMethod -Uri http://localhost:8080/actuator/health -Method Get
```

**Kết quả mong đợi:** 
```json
{
  "status": "UP"
}
```

---

## 🧪 BƯỚC 4: TEST RABBITMQ + FACE DETECTION WORKER

### 4.1. Chạy test script tự động
```powershell
cd "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2"
.\test-rabbitmq-worker.ps1
```

**Script này sẽ:**
1. Tạo 1 session thi mới
2. Upload 5 snapshots (giả lập webcam)
3. Đợi RabbitMQ worker xử lý (10 giây)
4. Kiểm tra incidents được tạo tự động

### 4.2. Đọc kết quả

**Kết quả PASS nếu thấy:**
```
✅ Session created: [ID]
✅ 5 snapshots uploaded
⏳ Waiting for RabbitMQ worker to process snapshots...
✅ Found X incident(s):
  - Type: NO_FACE, Score: 0.7, Reason: No face detected in webcam snapshot
  - Type: MULTI_FACE, Score: 0.85, Reason: 2 faces detected (possible assistance)
```

**Lưu ý:** 
- Số incidents thay đổi mỗi lần chạy (do random)
- Có thể có 0-5 incidents tùy vào face detection random
- Chạy lại vài lần để thấy các trường hợp khác nhau

---

## 🧪 BƯỚC 5: KIỂM TRA DATABASE

### 5.1. Kết nối vào PostgreSQL
```powershell
docker exec -it examdb psql -U postgres -d examdb
```

### 5.2. Kiểm tra snapshots đã có face_count
```sql
SELECT id, session_id, face_count, object_key, uploaded_at 
FROM media_snapshots 
ORDER BY uploaded_at DESC 
LIMIT 10;
```

**Kết quả mong đợi:**
- Các snapshots có `face_count` = 0, 1, hoặc 2
- Không có `face_count` NULL (hoặc chỉ vài cái vì worker chưa kịp xử lý)

### 5.3. Kiểm tra incidents tự động tạo
```sql
SELECT id, type, score, reason, status, created_at 
FROM incidents 
WHERE type IN ('NO_FACE', 'MULTI_FACE') 
ORDER BY created_at DESC 
LIMIT 10;
```

**Kết quả mong đợi:**
- Có incidents với type = `NO_FACE` hoặc `MULTI_FACE`
- Score = 0.70 (NO_FACE) hoặc 0.85 (MULTI_FACE)
- Status = `OPEN`

### 5.4. Thoát PostgreSQL
```sql
\q
```

---

## 🧪 BƯỚC 6: KIỂM TRA LOGS

### 6.1. Xem logs của Backend
```powershell
docker logs exam-cheating-detection-v2-backend-1 --tail 50
```

**Tìm các dòng:**
```
INFO com.example.exam.service.IngestService   : Published snapshot message to queue: snapshotId=...
INFO c.e.exam.service.FaceDetectionWorker     : Processing snapshot: snapshotId=...
INFO c.e.exam.service.FaceDetectionWorker     : Face detection complete: snapshotId=..., faceCount=1
WARN c.e.exam.service.FaceDetectionWorker     : Created incident: sessionId=..., type=NO_FACE, faceCount=0
```

### 6.2. Xem logs của RabbitMQ
```powershell
docker logs exam-rabbitmq --tail 30
```

**Không nên có lỗi** (chỉ thấy thông tin kết nối)

---

## 🧪 BƯỚC 7: TEST THỦ CÔNG (OPTIONAL)

### 7.1. Tạo session mới
```powershell
$response = Invoke-RestMethod -Uri http://localhost:8080/api/mock-exam/start -Method Post -ContentType "application/json" -Body '{"examId":"11111111-1111-1111-1111-111111111111","userId":"22222222-2222-2222-2222-222222222222"}' 

$sessionId = $response.sessionId
Write-Host "Session ID: $sessionId"
```

### 7.2. Upload 1 snapshot thủ công
```powershell
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

$body = @{
    items = @(
        @{
            sessionId = $sessionId
            ts = $timestamp
            objectKey = "test-snapshot-manual.jpg"
            fileSize = 100000
            mimeType = "image/jpeg"
            idempotencyKey = "manual-test-$timestamp"
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri http://localhost:8080/api/ingest/snapshots -Method Post -ContentType "application/json" -Body $body
```

### 7.3. Đợi 5 giây rồi kiểm tra
```powershell
Start-Sleep -Seconds 5

# Kiểm tra incidents
Invoke-RestMethod -Uri "http://localhost:8080/api/incidents?sessionId=$sessionId"
```

### 7.4. Kiểm tra trong RabbitMQ UI
- Vào http://localhost:15672
- Click tab **Queues**
- Click vào queue `snapshot.process`
- Xem **Message rates** - phải thấy đã có message được consume

---

## 🧪 BƯỚC 8: TEST IDEMPOTENCY

### 8.1. Upload cùng 1 snapshot 2 lần
```powershell
# Lần 1
$timestamp = 1234567890000
$body = @{
    items = @(
        @{
            sessionId = $sessionId
            ts = $timestamp
            objectKey = "duplicate-test.jpg"
            fileSize = 100000
            mimeType = "image/jpeg"
            idempotencyKey = "idempotency-test-123"
        }
    )
} | ConvertTo-Json -Depth 3

$result1 = Invoke-RestMethod -Uri http://localhost:8080/api/ingest/snapshots -Method Post -ContentType "application/json" -Body $body
Write-Host "Lần 1: created=$($result1.created), duplicates=$($result1.duplicates)"

# Lần 2 (cùng idempotencyKey)
$result2 = Invoke-RestMethod -Uri http://localhost:8080/api/ingest/snapshots -Method Post -ContentType "application/json" -Body $body
Write-Host "Lần 2: created=$($result2.created), duplicates=$($result2.duplicates)"
```

**Kết quả mong đợi:**
```
Lần 1: created=1, duplicates=0
Lần 2: created=0, duplicates=1
```

---

## ✅ CHECKLIST HOÀN THÀNH

Đánh dấu ✅ khi test PASS:

- [ ] Docker containers đều running và healthy
- [ ] RabbitMQ Management UI truy cập được (http://localhost:15672)
- [ ] Queue `snapshot.process` tồn tại
- [ ] Exchange `exam.events` tồn tại
- [ ] Backend API `/api/exams` trả về data
- [ ] Script `test-rabbitmq-worker.ps1` chạy thành công
- [ ] Database có snapshots với face_count (0, 1, 2)
- [ ] Database có incidents type NO_FACE hoặc MULTI_FACE
- [ ] Logs hiển thị "Processing snapshot" và "Face detection complete"
- [ ] Idempotency test: lần 2 không tạo duplicate

---

## ❌ XỬ LÝ LỖI

### Lỗi 1: Backend không start
```powershell
docker-compose logs backend
```
- Kiểm tra lỗi trong logs
- Thường do thiếu RabbitMQ hoặc Redis

**Giải pháp:**
```powershell
docker-compose down
docker-compose up --build
```

### Lỗi 2: RabbitMQ queue không có
- Restart backend để tạo lại queue:
```powershell
docker-compose restart backend
```

### Lỗi 3: Worker không xử lý message
- Kiểm tra logs:
```powershell
docker logs exam-cheating-detection-v2-backend-1 | Select-String "FaceDetectionWorker"
```
- Nếu không thấy log → restart backend

### Lỗi 4: face_count vẫn NULL
- Bình thường! Worker xử lý async
- Đợi thêm 10-20 giây rồi query lại

---

## 🎯 KẾT LUẬN

Nếu tất cả tests PASS → **Week 3 Backend hoạt động hoàn hảo!** ✅

Các tính năng đã test:
1. ✅ RabbitMQ infrastructure
2. ✅ Message publishing (Producer)
3. ✅ Message consuming (Worker)
4. ✅ Async face detection (stub)
5. ✅ Auto-create incidents (NO_FACE, MULTI_FACE)
6. ✅ Idempotency
7. ✅ Database persistence

**Sẵn sàng cho Frontend development!**
