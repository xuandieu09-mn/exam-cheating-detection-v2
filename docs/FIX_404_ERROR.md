# 🔧 SỬA LỖI 404 - ENDPOINT KHÔNG TÌM THẤY

## 🔍 Nguyên nhân

Docker đang chạy **image backend cũ** từ lần build trước, chưa có ExamController mới.

## ✅ GIẢI PHÁP

### Cách 1: Rebuild Docker Image (KHUYẾN NGHỊ)

```bash
# Dừng tất cả containers
docker-compose down

# Xóa image cũ
docker-compose rm -f backend

# Build lại và khởi động
docker-compose up --build
```

### Cách 2: Build image riêng

```bash
# Dừng containers
docker-compose down

# Xóa image backend cũ
docker rmi exam-cheating-detection-v2_backend

# Build và start lại
docker-compose up --build
```

### Cách 3: Force rebuild không cache

```bash
# Build lại hoàn toàn không dùng cache
docker-compose build --no-cache backend

# Start lại
docker-compose up
```

---

## 🧪 SAU KHI REBUILD - KIỂM TRA

### 1. Xem logs để confirm ExamController được load:

```bash
docker-compose logs backend | grep -i "ExamController"
```

Hoặc xem toàn bộ logs:
```bash
docker-compose logs -f backend
```

**Tìm dòng:**
```
Mapped "{[/api/exams]}" onto ...ExamController.getAllExams()
Mapped "{[/api/exams/{id}]}" onto ...ExamController.getExamById()
```

### 2. Test API sau khi rebuild:

**Browser:**
```
http://localhost:8080/api/exams
```

**Curl:**
```bash
curl http://localhost:8080/api/exams
```

**Kết quả mong đợi:**
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Demo Exam - Active",
    "status": "ACTIVE",
    ...
  }
]
```

---

## 🚨 NẾU VẪN LỖI 404

### Kiểm tra ExamController có trong container không:

```bash
# Vào container backend
docker exec -it exam-cheating-detection-v2-backend-1 sh

# List files
ls -la /app/com/example/exam/controller/

# Xem ExamController.class có tồn tại không
ls -la /app/com/example/exam/controller/ExamController.class
```

### Kiểm tra logs startup:

```bash
docker-compose logs backend | grep -i "Started ExamApplication"
docker-compose logs backend | grep -i "Mapping"
docker-compose logs backend | grep -i "ERROR"
```

### Check Swagger UI để confirm endpoints:

Mở: http://localhost:8080/swagger-ui/index.html

Tìm section **"Exams"** → phải có 5 endpoints:
- GET /api/exams
- GET /api/exams/{id}
- POST /api/exams
- PUT /api/exams/{id}
- DELETE /api/exams/{id}

---

## 📝 LƯU Ý

**Mỗi lần thay đổi code Java, phải rebuild Docker image:**

```bash
# Quick rebuild
docker-compose up --build

# Hoặc rebuild riêng backend
docker-compose build backend && docker-compose up
```

**Để tránh phải rebuild liên tục trong development:**

👉 Nên chạy backend bằng Maven trực tiếp (không qua Docker):

```bash
# Terminal 1: Chỉ chạy Postgres
docker-compose up postgres

# Terminal 2: Chạy backend bằng Maven
cd backend
mvn spring-boot:run
```

Với cách này, code thay đổi sẽ được hot-reload tự động!

---

## ✅ CHECKLIST SAU KHI SỬA

- [ ] `docker-compose down` thành công
- [ ] `docker-compose up --build` build lại image
- [ ] Logs có dòng "Started ExamApplication"
- [ ] Logs có "Mapped ... ExamController"
- [ ] Swagger UI hiển thị endpoints Exams
- [ ] http://localhost:8080/api/exams trả về JSON
- [ ] Không còn lỗi 404

---

Hãy chạy lệnh **`docker-compose down && docker-compose up --build`** và cho tôi biết kết quả! 🚀
