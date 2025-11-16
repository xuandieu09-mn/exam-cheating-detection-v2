# ⚡ QUICK START GUIDE

Hướng dẫn nhanh để chạy và test hệ thống sau khi fix bug.

---

## 🚀 Bước 1: Khởi động hệ thống

```powershell
# Trong thư mục gốc dự án
docker-compose up -d
```

**Chờ khoảng 30 giây** để tất cả services khởi động.

---

## ✅ Bước 2: Kiểm tra services

```powershell
docker ps
```

**Kết quả mong đợi:** 3 containers đang chạy
- `examdb` (Postgres) - Healthy
- `exam-redis` (Redis) - Healthy
- `exam-cheating-detection-v2-backend-1` (Spring Boot) - Up

---

## 🧪 Bước 3: Test API cơ bản

```powershell
# Test 1: Danh sách kỳ thi
curl http://localhost:8080/api/exams

# Test 2: Chi tiết kỳ thi
curl http://localhost:8080/api/exams/11111111-1111-1111-1111-111111111111
```

**Kết quả:** Trả về JSON với 3 exams (ACTIVE, ENDED, UPCOMING)

---

## 🎯 Bước 4: Test Tab-Abuse Rule (TỰ ĐỘNG)

```powershell
.\test-tab-abuse.ps1
```

**Kết quả mong đợi:**
```
✓ Session created: ...
✓ Sent 12 events
✓ SUCCESS! TAB_ABUSE incident detected!

Incident details:
  ID: ...
  Type: TAB_ABUSE
  Score: 0.6
  Reason: Tab switched 11 times in 5 minutes (threshold: 10)
  Status: OPEN
```

---

## 📊 Bước 5: Kiểm tra dữ liệu

### Database

```powershell
docker exec -it examdb psql -U postgres -d examdb

# Trong psql:
SELECT * FROM exams;
SELECT * FROM incidents ORDER BY created_at DESC LIMIT 5;
\q
```

### Redis

```powershell
docker exec -it exam-redis redis-cli

# Trong redis-cli:
PING
KEYS session:*
exit
```

---

## 🐛 Nếu có lỗi

### Backend không start
```powershell
# Xem logs
docker logs exam-cheating-detection-v2-backend-1

# Rebuild nếu cần
docker-compose up --build -d backend
```

### Database lỗi
```powershell
# Reset toàn bộ (XÓA DỮ LIỆU!)
docker-compose down -v
docker-compose up --build
```

---

## 📚 Tài liệu chi tiết

- [SYSTEM_STATUS.md](SYSTEM_STATUS.md) - Tổng quan hệ thống
- [WEEK2_BUGFIX_COMPLETED.md](docs/WEEK2_BUGFIX_COMPLETED.md) - Chi tiết bugfix
- [DEBUG_BACKEND_CRASH.md](docs/DEBUG_BACKEND_CRASH.md) - Troubleshooting

---

## 🎯 Next Steps

Sau khi verify backend hoạt động:

1. **Frontend Development (Week 2 Day 4-7):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Develop Mock Exam Page:**
   - Camera integration
   - Event detection
   - Timer countdown
   - Submit logic

3. **Test E2E Flow:**
   - Thí sinh làm bài
   - Phát hiện vi phạm tự động
   - Giám thị duyệt vi phạm

---

**🎉 HỆ THỐNG ĐÃ SẴN SÀNG!**

Backend running, Redis working, Tab-abuse rule verified. Let's build the frontend! 🚀
