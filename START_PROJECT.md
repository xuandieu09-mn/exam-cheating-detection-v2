# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN

## 📋 Bước 1: Khởi động Backend + Database

```powershell
# Ở thư mục root của dự án
docker-compose up -d
```

**Kiểm tra services đang chạy:**
```powershell
docker-compose ps
```

**Chờ backend khởi động (khoảng 20 giây):**
```powershell
docker logs exam-cheating-detection-v2-backend-1 --tail 10
```

Tìm dòng: `Started ExamApplication in ... seconds`

---

## 📋 Bước 2: Khởi động Frontend

```powershell
cd frontend
npm run dev
```

**Frontend sẽ chạy ở:** `http://localhost:5177` (hoặc port khác nếu 5177 bị chiếm)

---

## ✅ Bước 3: Test Hệ Thống

### Test 1: Kiểm tra Backend API
```powershell
# Test health endpoint
Invoke-RestMethod http://localhost:8080/actuator/health

# Test exams endpoint
Invoke-RestMethod http://localhost:8080/api/exams
```

### Test 2: Mở trang thi mock
Mở browser:
```
http://localhost:5177/mock-exam/11111111-1111-1111-1111-111111111111
```

**Checklist:**
- [ ] Trang load thành công
- [ ] Thấy 10 câu hỏi (5 trắc nghiệm + 5 tự luận)
- [ ] Timer đếm ngược từ 45:00
- [ ] Camera xin permission
- [ ] Click "Allow" → Camera hiển thị góc phải
- [ ] Mở F12 → Console → Thấy "Snapshot uploaded" mỗi 3 giây

---

## 🧪 Bước 4: Test Automated

```powershell
# Chạy automated test script
.\test-e2e-mock-exam.ps1
```

**Kết quả mong đợi:**
- ✅ Session created
- ✅ 10 questions retrieved
- ✅ 12 TAB_SWITCH events sent
- ✅ TAB_ABUSE incident auto-created

---

## 🐛 Xử lý sự cố

### Backend không start:
```powershell
# Xem logs lỗi
docker logs exam-cheating-detection-v2-backend-1

# Restart services
docker-compose restart
```

### Frontend lỗi port:
```powershell
# Kill process đang dùng port
Get-Process -Id (Get-NetTCPConnection -LocalPort 5177).OwningProcess | Stop-Process -Force

# Hoặc dùng port khác (Vite tự động chọn port mới)
```

### Database lỗi:
```powershell
# Reset database
docker-compose down -v
docker-compose up -d
# Chờ 30 giây cho migrations chạy
```

---

## 📊 Kiểm tra Database

```powershell
# Xem sessions
docker exec -it examdb psql -U postgres -d examdb -c "SELECT id, user_id, exam_id, status FROM sessions ORDER BY ts DESC LIMIT 5;"

# Xem snapshots đã upload
docker exec -it examdb psql -U postgres -d examdb -c "SELECT COUNT(*) as total_snapshots FROM media_snapshots;"

# Xem incidents
docker exec -it examdb psql -U postgres -d examdb -c "SELECT incident_type, score, status FROM incidents ORDER BY ts DESC LIMIT 5;"
```

---

## 🛑 Dừng Dự Án

```powershell
# Dừng frontend (Ctrl+C trong terminal đang chạy npm)

# Dừng backend + database
docker-compose down

# Dừng VÀ XÓA dữ liệu (cẩn thận!)
docker-compose down -v
```

---

## 📂 Đường dẫn quan trọng

- **Frontend:** http://localhost:5177
- **Backend API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Database:** localhost:55432 (user: postgres, pass: postgres, db: examdb)

---

## ✅ Quick Check - Hệ thống đang chạy đúng khi:

```powershell
# Tất cả containers đang chạy
docker-compose ps
# Kết quả: backend (Up), postgres (Up healthy), redis (Up healthy)

# Backend responding
curl http://localhost:8080/actuator/health
# Kết quả: {"status":"UP"}

# Frontend accessible
curl http://localhost:5177
# Kết quả: HTML content (không lỗi 404)
```
