# 🚀 TEST NHANH WEEK 3 - 5 PHÚT

## ✅ BACKEND TEST (2 phút)

### Bước 1: Khởi động (nếu chưa chạy)
```powershell
cd "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2"
docker-compose up -d
```

### Bước 2: Test RabbitMQ + Worker
```powershell
.\test-rabbitmq-worker.ps1
```

**KẾT QUẢ MONG ĐỢI:**
```
✅ Session created: [ID]
✅ 5 snapshots uploaded
✅ Found X incident(s):
  - Type: NO_FACE, Score: 0.7
  - Type: MULTI_FACE, Score: 0.85
```

### Bước 3: Check RabbitMQ Management UI
- Mở: http://localhost:15672
- Login: `guest` / `guest`
- ✅ Thấy queue `snapshot.process`

---

## ✅ FRONTEND TEST (3 phút)

### Bước 1: Khởi động Frontend
```powershell
cd frontend
npm run dev
```

### Bước 2: Mở Browser
http://localhost:5173

### Bước 3: Đăng nhập
- Click nút **"CANDIDATE"**
- ✅ Vào dashboard

### Bước 4: Test 3 Trang

#### 4.1. Trang "Kỳ thi"
- Click menu "Kỳ thi" (hoặc `/candidate/exams`)
- ✅ Thấy grid các kỳ thi
- ✅ Badge màu: "Đang mở" / "Đã kết thúc" / "Sắp diễn ra"
- ✅ Nút "Bắt đầu thi" enable/disable đúng

#### 4.2. Trang "Kết quả của tôi"  
- Click menu "Kết quả của tôi" (hoặc `/candidate/my-results`)
- ✅ Thấy table lịch sử thi
- ✅ Click 1 row → Modal popup với chi tiết
- ✅ Thấy danh sách incidents trong modal

#### 4.3. Trang "Vi phạm của tôi"
- Click menu "Vi phạm của tôi" (hoặc `/candidate/my-violations`)
- ✅ Thấy table violations
- ✅ Badge loại vi phạm tiếng Việt:
  - "Không phát hiện khuôn mặt" (NO_FACE)
  - "Nhiều khuôn mặt" (MULTI_FACE)
  - "Chuyển tab nhiều" (TAB_ABUSE)
- ✅ Badge trạng thái:
  - Vàng: "Chờ duyệt" (OPEN)
  - Đỏ: "Đã xác nhận" (CONFIRMED)
  - Xanh: "Đã từ chối" (REJECTED)
- ✅ Bộ lọc hoạt động (loại vi phạm + trạng thái)
- ✅ 3 cards thống kê ở dưới

---

## 📸 SCREENSHOTS MẪU

### ExamsPage
```
┌────────────────────────────────────┐
│ Kỳ thi                             │
│ Chọn kỳ thi để bắt đầu làm bài    │
├────────────────────────────────────┤
│ ┌───────────┐  ┌───────────┐      │
│ │ Demo Exam │  │ Midterm   │      │
│ │ [Đang mở] │  │ [Đã kết   │      │
│ │           │  │  thúc]    │      │
│ │ 45 phút   │  │ 60 phút   │      │
│ │[Bắt đầu]  │  │[Disabled] │      │
│ └───────────┘  └───────────┘      │
└────────────────────────────────────┘
```

### MyViolationsPage
```
┌────────────────────────────────────────┐
│ Vi phạm của tôi                        │
│ ┌──────────────────────────────────┐   │
│ │ [i] Lưu ý: Các vi phạm...        │   │
│ └──────────────────────────────────┘   │
│ Bộ lọc:                                │
│ [Loại: Tất cả ▼] [Trạng thái: ▼]      │
├────────────────────────────────────────┤
│ Danh sách vi phạm (2/2)                │
│ ┌──────┬─────────┬──────┬────┬──────┐ │
│ │ Kỳ   │ Loại    │ Thời │ Mức│ Trạng│ │
│ │ thi  │ vi phạm │ gian │ độ │ thái │ │
│ ├──────┼─────────┼──────┼────┼──────┤ │
│ │ Demo │ NO_FACE │ ...  │ 70%│[Chờ] │ │
│ │ Demo │ MULTI...│ ...  │ 85%│[Chờ] │ │
│ └──────┴─────────┴──────┴────┴──────┘ │
├────────────────────────────────────────┤
│ [Tổng: 2] [Xác nhận: 0] [Từ chối: 0]  │
└────────────────────────────────────────┘
```

---

## ✅ CHECKLIST NHANH

### Backend
- [ ] Docker containers chạy (4/4)
- [ ] RabbitMQ UI truy cập được (http://localhost:15672)
- [ ] Test script tạo incidents thành công
- [ ] Database có snapshots với face_count
- [ ] Database có incidents NO_FACE/MULTI_FACE

### Frontend  
- [ ] Frontend dev server chạy (port 5173)
- [ ] Đăng nhập CANDIDATE thành công
- [ ] ExamsPage hiển thị grid kỳ thi
- [ ] MyResultsPage hiển thị table sessions
- [ ] MyResultsPage modal popup khi click
- [ ] MyViolationsPage hiển thị violations
- [ ] Filters hoạt động (loại + trạng thái)
- [ ] Responsive (thu nhỏ trình duyệt)

---

## ❌ TROUBLESHOOT NHANH

### Backend không chạy?
```powershell
docker-compose down
docker-compose up --build
```

### Frontend lỗi?
```powershell
cd frontend
npm install
npm run dev
```

### Không có violations?
```powershell
# Chạy lại test script vài lần
.\test-rabbitmq-worker.ps1
.\test-rabbitmq-worker.ps1
.\test-rabbitmq-worker.ps1
```

### MyResultsPage trống?
- Đảm bảo đã chạy test script (tạo sessions)
- Hoặc làm bài thi mock exam từ ExamsPage

---

## 🎯 KẾT LUẬN

Nếu tất cả ✅ → **Week 3 hoàn thành!**

**Thời gian test:** ~5 phút  
**Trang test:** 3 trang frontend + 1 backend test  
**Kết quả:** Hệ thống hoạt động end-to-end

---

**Chi tiết đầy đủ:**
- Backend: Xem `HUONG_DAN_TEST_WEEK3.md`
- Frontend: Xem `HUONG_DAN_TEST_FRONTEND_WEEK3.md`
- Tổng kết: Xem `WEEK3_COMPLETED.md`
