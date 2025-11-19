# 🧪 HƯỚNG DẪN TEST FRONTEND CANDIDATE UI

**Mục tiêu:** Test 3 trang chính của Thí sinh (Candidate)

---

## 📋 CHUẨN BỊ

### 1. Đảm bảo Backend đang chạy
```powershell
docker ps
```
**Phải thấy 4 containers đang chạy:**
- examdb
- exam-redis  
- exam-rabbitmq
- exam-cheating-detection-v2-backend-1

Nếu chưa chạy:
```powershell
cd "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2"
docker-compose up -d
```

### 2. Khởi động Frontend
```powershell
cd "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2\frontend"
npm run dev
```

**Kết quả mong đợi:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Mở trình duyệt
Truy cập: http://localhost:5173

---

## 🧪 TEST 1: TRANG ĐĂNG NHẬP

### Bước 1.1: Kiểm tra giao diện login
- ✅ Thấy 3 nút: CANDIDATE, PROCTOR, ADMIN
- ✅ Logo/tiêu đề hiển thị rõ ràng

### Bước 1.2: Đăng nhập với vai trò CANDIDATE
- Click nút **"CANDIDATE"**
- **Kết quả mong đợi:** 
  - Chuyển đến `/candidate/dashboard`
  - Hiển thị tên người dùng: "Nguyễn Văn A"

---

## 🧪 TEST 2: TRANG "KỲ THI" (ExamsPage)

### Bước 2.1: Điều hướng
Từ dashboard, click menu **"Kỳ thi"** hoặc truy cập: http://localhost:5173/candidate/exams

### Bước 2.2: Kiểm tra danh sách kỳ thi
**Kết quả mong đợi:**
- ✅ Hiển thị grid các kỳ thi (3 cột trên desktop)
- ✅ Mỗi card kỳ thi có:
  - Tên kỳ thi
  - Mô tả (description)
  - Badge trạng thái (ACTIVE/UPCOMING/ENDED)
  - Thời gian bắt đầu & kết thúc
  - Thời gian làm bài (duration)
  - Nút "Bắt đầu thi"

### Bước 2.3: Kiểm tra trạng thái kỳ thi

**Test case 1: Kỳ thi ACTIVE (đang mở)**
- ✅ Badge màu xanh: "Đang mở"
- ✅ Nút "Bắt đầu thi" ENABLED (có thể click)

**Test case 2: Kỳ thi ENDED (đã kết thúc)**
- ✅ Badge màu xám: "Đã kết thúc"  
- ✅ Nút "Chưa khả dụng" DISABLED (không click được)

**Test case 3: Kỳ thi UPCOMING (sắp diễn ra)**
- ✅ Badge viền: "Sắp diễn ra"
- ✅ Nút "Chưa khả dụng" DISABLED

### Bước 2.4: Test Loading State
- Refresh trang (F5)
- **Kết quả mong đợi:**
  - ✅ Hiển thị spinner loading
  - ✅ Text: "Đang tải danh sách kỳ thi..."
  - ✅ Sau vài giây → hiển thị danh sách

### Bước 2.5: Test Empty State
Để test empty state, tạm thời chỉnh filter:
- Nếu không có kỳ thi ACTIVE
- **Kết quả mong đợi:**
  - ✅ Icon BookOpen lớn
  - ✅ Text: "Hiện tại không có kỳ thi nào đang mở"

### Bước 2.6: Test Responsive Design
- Thu nhỏ cửa sổ trình duyệt
- **Kết quả mong đợi:**
  - ✅ Desktop (>1024px): 3 cột
  - ✅ Tablet (768-1024px): 2 cột  
  - ✅ Mobile (<768px): 1 cột

### Bước 2.7: Test Click "Bắt đầu thi"
- Click nút "Bắt đầu thi" trên kỳ thi đang ACTIVE
- **Kết quả mong đợi:**
  - ✅ Navigate đến `/mock-exam/{examId}`
  - ✅ Trang MockExamPage load (trang thi thực sự)

---

## 🧪 TEST 3: TRANG "KẾT QUẢ CỦA TÔI" (MyResultsPage)

### Bước 3.1: Điều hướng
Click menu **"Kết quả của tôi"** hoặc: http://localhost:5173/candidate/my-results

### Bước 3.2: Test khi CHƯA có session
**Nếu user chưa làm bài thi nào:**
- ✅ Icon ClipboardList lớn
- ✅ Text: "Bạn chưa tham gia kỳ thi nào"
- ✅ Sub-text: "Hãy tham gia một kỳ thi để xem kết quả"

### Bước 3.3: Tạo session để test
**Chạy script tạo session:**
```powershell
cd "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2"
.\test-rabbitmq-worker.ps1
```
Hoặc làm bài thi mock exam từ trang "Kỳ thi"

### Bước 3.4: Kiểm tra table kết quả
**Sau khi có session, kết quả mong đợi:**
- ✅ Table header: "Lịch sử thi (X kỳ)"
- ✅ Các cột:
  - **Kỳ thi:** Tên kỳ thi (ví dụ: "Demo Exam - Active")
  - **Thời gian bắt đầu:** Icon Calendar + ngày giờ
  - **Thời gian làm bài:** Icon Clock + số phút (ví dụ: "15 phút")
  - **Trạng thái:** Badge xanh "Đang thi" hoặc xám "Đã nộp bài"
  - **Vi phạm:** Badge màu (xanh/vàng/đỏ) với số lượng

### Bước 3.5: Test Click vào session
- Click vào 1 row trong table
- **Kết quả mong đợi:**
  - ✅ Modal popup hiển thị
  - ✅ Tiêu đề: "Chi tiết phiên thi"
  - ✅ Subtitle: Tên kỳ thi
  - ✅ Grid 2 cột hiển thị:
    - Thời gian bắt đầu
    - Thời gian kết thúc
    - Thời gian làm bài
    - Trạng thái
  - ✅ Section "Vi phạm (X)":
    - Danh sách các incidents
    - Mỗi incident: Type, Reason, Status badge

### Bước 3.6: Test Vi phạm trong modal
**Nếu có incidents (từ test-rabbitmq-worker.ps1):**
- ✅ Hiển thị loại: NO_FACE, MULTI_FACE, TAB_ABUSE, etc.
- ✅ Reason: Mô tả chi tiết
- ✅ Status badge:
  - OPEN: màu vàng
  - CONFIRMED: màu đỏ (destructive)
  - REJECTED: màu xám (secondary)

### Bước 3.7: Đóng modal
- Click X hoặc click bên ngoài modal
- **Kết quả mong đợi:**
  - ✅ Modal đóng lại
  - ✅ Quay về table

---

## 🧪 TEST 4: TRANG "VI PHẠM CỦA TÔI" (MyViolationsPage)

### Bước 4.1: Điều hướng
Click menu **"Vi phạm của tôi"** hoặc: http://localhost:5173/candidate/my-violations

### Bước 4.2: Test Info Alert
**Kết quả mong đợi:**
- ✅ Alert màu xanh (blue-50)
- ✅ Icon Info
- ✅ Text: "Lưu ý: Các vi phạm với trạng thái 'Chờ duyệt'..."

### Bước 4.3: Test Filters
**Bộ lọc 1: Loại vi phạm**
- ✅ Dropdown với options:
  - Tất cả
  - TAB_ABUSE
  - NO_FACE
  - MULTI_FACE
  - PASTE_DETECTED
  - v.v.

**Bộ lọc 2: Trạng thái**
- ✅ Dropdown với options:
  - Tất cả
  - Chờ duyệt (OPEN)
  - Đã xác nhận (CONFIRMED)
  - Đã từ chối (REJECTED)

### Bước 4.4: Test Empty State (không có vi phạm)
**Nếu user không có vi phạm:**
- ✅ Icon AlertTriangle lớn
- ✅ Text: "Bạn không có vi phạm nào"
- ✅ Sub-text: "Hãy tiếp tục duy trì kỷ luật thi cử!"

### Bước 4.5: Tạo violations để test
**Chạy script tạo violations:**
```powershell
.\test-rabbitmq-worker.ps1
```
Script này sẽ:
1. Tạo session mới
2. Upload 5 snapshots
3. Worker xử lý → tạo NO_FACE/MULTI_FACE incidents (random)

Refresh trang MyViolationsPage (F5)

### Bước 4.6: Kiểm tra Table Violations
**Kết quả mong đợi:**
- ✅ Header: "Danh sách vi phạm (X/Y)"
  - X = số violations sau filter
  - Y = tổng số violations
- ✅ Các cột:
  - **Kỳ thi:** Tên exam
  - **Loại vi phạm:** Badge outline (ví dụ: "Không phát hiện khuôn mặt")
  - **Thời gian:** Ngày giờ đầy đủ (đến giây)
  - **Mức độ:** Score % với màu:
    - >= 80%: đỏ, bold
    - >= 50%: cam, bold
    - < 50%: vàng
  - **Lý do:** Text lý do (truncate nếu quá dài)
  - **Trạng thái:** Badge màu (vàng/đỏ/xanh)

### Bước 4.7: Test Type Badge Labels
- ✅ TAB_ABUSE → "Chuyển tab nhiều"
- ✅ NO_FACE → "Không phát hiện khuôn mặt"
- ✅ MULTI_FACE → "Nhiều khuôn mặt"
- ✅ PASTE_DETECTED → "Phát hiện dán"

### Bước 4.8: Test Filter Loại vi phạm
1. Click dropdown "Loại vi phạm"
2. Chọn "NO_FACE"
3. **Kết quả mong đợi:**
   - ✅ Table chỉ hiển thị incidents type = NO_FACE
   - ✅ Counter update: "(2/5)" ví dụ

### Bước 4.9: Test Filter Trạng thái
1. Click dropdown "Trạng thái"
2. Chọn "Chờ duyệt" (OPEN)
3. **Kết quả mong đợi:**
   - ✅ Table chỉ hiển thị incidents status = OPEN
   - ✅ Counter update

### Bước 4.10: Test Summary Statistics
**3 cards ở dưới table:**

**Card 1: Tổng số vi phạm**
- ✅ Số to, đậm (ví dụ: 5)

**Card 2: Đã xác nhận**
- ✅ Số màu đỏ (ví dụ: 0)

**Card 3: Đã từ chối**
- ✅ Số màu xanh (ví dụ: 0)

**Lưu ý:** Khi vừa tạo, tất cả incidents đều OPEN, nên:
- Đã xác nhận = 0
- Đã từ chối = 0

### Bước 4.11: Test Responsive
- Thu nhỏ trình duyệt
- **Kết quả mong đợi:**
  - ✅ Table có horizontal scroll trên mobile
  - ✅ Filters stack thành 1 cột trên mobile
  - ✅ Summary cards stack thành 1 cột

---

## 🧪 TEST 5: INTEGRATION TEST E2E

### Flow hoàn chỉnh:

**Step 1: Đăng nhập**
```
Login Page → Click "CANDIDATE" → Dashboard
```

**Step 2: Xem kỳ thi**
```
Dashboard → Click "Kỳ thi" → ExamsPage → Thấy danh sách exams
```

**Step 3: Làm bài thi**
```
ExamsPage → Click "Bắt đầu thi" → MockExamPage
→ Làm bài (chuyển tab vài lần để tạo TAB_ABUSE)
→ Nộp bài
```

**Step 4: Xem kết quả**
```
Sau khi nộp → Navigate "Kết quả của tôi" → MyResultsPage
→ Thấy session vừa làm
→ Click vào session → Modal hiển thị incidents
```

**Step 5: Xem chi tiết vi phạm**
```
Navigate "Vi phạm của tôi" → MyViolationsPage
→ Thấy danh sách violations (TAB_ABUSE, NO_FACE, MULTI_FACE)
→ Filter theo loại → Table update
```

---

## ✅ CHECKLIST HOÀN THÀNH

### ExamsPage
- [ ] Loading spinner hiển thị
- [ ] Danh sách exams load thành công
- [ ] Card hiển thị đầy đủ thông tin
- [ ] Badge trạng thái đúng màu
- [ ] Nút "Bắt đầu thi" enable/disable đúng
- [ ] Click navigate đến MockExamPage
- [ ] Responsive (3/2/1 columns)
- [ ] Empty state hiển thị đúng

### MyResultsPage
- [ ] Loading spinner hiển thị
- [ ] Empty state khi chưa có session
- [ ] Table hiển thị sessions
- [ ] Icon Calendar, Clock hiển thị
- [ ] Badge trạng thái đúng màu
- [ ] Click row → Modal popup
- [ ] Modal hiển thị chi tiết session
- [ ] Modal hiển thị danh sách incidents
- [ ] Badge status trong modal đúng màu
- [ ] Đóng modal thành công

### MyViolationsPage
- [ ] Info alert hiển thị
- [ ] Filters render đúng
- [ ] Empty state khi không có violations
- [ ] Table hiển thị violations
- [ ] Type badges có label tiếng Việt
- [ ] Status badges đúng màu
- [ ] Score hiển thị đúng màu theo mức độ
- [ ] Filter loại vi phạm hoạt động
- [ ] Filter trạng thái hoạt động
- [ ] Counter update khi filter
- [ ] Summary statistics hiển thị đúng
- [ ] Responsive table scroll

### Integration
- [ ] Flow đăng nhập → xem kỳ thi → làm bài → xem kết quả → xem vi phạm
- [ ] Navigation giữa các trang mượt mà
- [ ] Data sync giữa các trang

---

## ❌ XỬ LÝ LỖI

### Lỗi 1: "Cannot read property 'id' of null"
**Nguyên nhân:** Chưa đăng nhập
**Giải pháp:** Logout và login lại với CANDIDATE

### Lỗi 2: Không load được exams
**Check:**
```powershell
# Test backend API
Invoke-RestMethod http://localhost:8080/api/exams
```
**Giải pháp:** Restart backend nếu API lỗi

### Lỗi 3: MyResultsPage không hiển thị sessions
**Check userId trong localStorage:**
```javascript
// Mở Console (F12)
JSON.parse(localStorage.getItem('user')).id
// Phải thấy: "22222222-2222-2222-2222-222222222222"
```

### Lỗi 4: Violations không hiển thị
**Nguyên nhân:** Chưa có incidents
**Giải pháp:** Chạy test script
```powershell
.\test-rabbitmq-worker.ps1
```

### Lỗi 5: Modal không mở
**Check Console (F12)** có lỗi không
**Giải pháp:** Clear browser cache và reload (Ctrl+F5)

---

## 📸 SCREENSHOTS MẪU

### ExamsPage (mẫu)
```
┌─────────────────────────────────────────────────┐
│  Kỳ thi                                          │
│  Chọn kỳ thi để bắt đầu làm bài                 │
├─────────────────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│ │ Demo Exam│  │ Midterm  │  │ Final    │       │
│ │ [Đang mở]│  │ [Đã kết  │  │ [Sắp diễn│       │
│ │          │  │  thúc]   │  │  ra]     │       │
│ │ 45 phút  │  │ 60 phút  │  │ 120 phút │       │
│ │[Bắt đầu] │  │[Disabled]│  │[Disabled]│       │
│ └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────┘
```

### MyResultsPage (mẫu)
```
┌─────────────────────────────────────────────────┐
│ Kết quả của tôi                                  │
│ Xem lại lịch sử thi và kết quả                  │
├─────────────────────────────────────────────────┤
│ Lịch sử thi (2 kỳ)                              │
├─────────┬──────────┬──────────┬────────┬───────┤
│ Kỳ thi  │ Bắt đầu  │ Làm bài  │ Trạng  │ Vi    │
│         │          │          │ thái   │ phạm  │
├─────────┼──────────┼──────────┼────────┼───────┤
│ Demo    │ 18/11... │ 15 phút  │ [Đã    │ [2 vi │
│ Exam    │          │          │ nộp]   │ phạm] │
├─────────┼──────────┼──────────┼────────┼───────┤
│ Midterm │ 17/11... │ 45 phút  │ [Đã    │ [Không│
│         │          │          │ nộp]   │ vi ph]│
└─────────┴──────────┴──────────┴────────┴───────┘
```

### MyViolationsPage (mẫu)
```
┌─────────────────────────────────────────────────┐
│ Vi phạm của tôi                                  │
├─────────────────────────────────────────────────┤
│ [Info] Lưu ý: Các vi phạm...                    │
├─────────────────────────────────────────────────┤
│ Bộ lọc                                          │
│ [Loại: Tất cả ▼]  [Trạng thái: Tất cả ▼]       │
├─────────────────────────────────────────────────┤
│ Danh sách vi phạm (3/3)                         │
├───────┬─────────┬──────┬────┬──────┬──────────┤
│ Kỳ    │ Loại    │ Thời │ Mức│ Lý   │ Trạng    │
│ thi   │ vi phạm │ gian │ độ │ do   │ thái     │
├───────┼─────────┼──────┼────┼──────┼──────────┤
│ Demo  │ NO_FACE │ ...  │ 70%│ No   │ [Chờ     │
│       │         │      │    │ face │ duyệt]   │
└───────┴─────────┴──────┴────┴──────┴──────────┘
```

---

## 🎯 KẾT LUẬN

Nếu tất cả tests PASS → **Frontend Candidate UI hoàn thành!** ✅

**3 trang đã test:**
1. ✅ ExamsPage - Danh sách kỳ thi
2. ✅ MyResultsPage - Kết quả của tôi
3. ✅ MyViolationsPage - Vi phạm của tôi

**Tính năng đã verify:**
- ✅ API integration (exams, sessions, incidents)
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Responsive design
- ✅ Filters & search
- ✅ Modals & popups
- ✅ Navigation flow

**Sẵn sàng cho:** Proctor UI & Admin UI (Week 4)
