# 🚨 HƯỚNG DẪN KHẮC PHỤC BACKEND CRASH

## Bước 1: Xem logs lỗi

Chạy lệnh sau để xem backend bị lỗi gì:

```bash
docker-compose logs backend
```

Hoặc xem logs realtime:

```bash
docker-compose up
```

## Các lỗi phổ biến và cách sửa:

### ❌ LỖI 1: ExamService dependency injection failed

**Triệu chứng trong logs:**
```
Error creating bean with name 'examController'
No qualifying bean of type 'ExamService'
```

**Nguyên nhân:** ExamService thiếu annotation @Service

**Cách sửa:** Đã có @Service, có thể do compile error

---

### ❌ LỖI 2: Compilation error

**Triệu chứng:**
```
[ERROR] COMPILATION ERROR
[ERROR] /app/src/main/java/.../ExamService.java:[line] error: ...
```

**Cách sửa:** Xem dòng lỗi cụ thể trong logs

---

### ❌ LỖI 3: Flyway migration checksum mismatch

**Triệu chứng:**
```
FlywayException: Validate failed
Migration checksum mismatch for migration version
```

**Cách sửa:**

```bash
# Xóa database và volumes
docker-compose down -v

# Start lại
docker-compose up --build
```

---

### ❌ LỖI 4: PostgreSQL connection timeout

**Triệu chứng:**
```
Connection refused: postgres:5432
Could not connect to database
```

**Cách sửa:**

```bash
# Đảm bảo postgres đã sẵn sàng
docker-compose up postgres
# Đợi 10 giây
# Sau đó start backend
docker-compose up backend
```

---

## Bước 2: Chạy lệnh này và paste logs cho tôi:

```bash
docker-compose up backend
```

Kéo lên trên cùng của logs, tìm dòng ERROR đầu tiên và copy toàn bộ phần lỗi.

---

## Giải pháp tạm thời: Chạy backend bằng Maven

Nếu Docker không hoạt động, chạy trực tiếp bằng Maven:

```bash
# Terminal 1: Chỉ chạy Postgres
docker-compose up postgres

# Terminal 2: Vào thư mục backend
cd backend

# Build project
mvn clean package -DskipTests

# Chạy backend
mvn spring-boot:run
```

Với cách này backend sẽ chạy ở http://localhost:8080 mà không cần Docker!
