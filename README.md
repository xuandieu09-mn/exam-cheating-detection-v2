
# Exam Cheating Detection API

## Tổng quan dự án

Dự án này là hệ thống phát hiện gian lận thi cử, gồm các thành phần chính:
- **backend/**: Dịch vụ API chính, viết bằng Java Spring Boot.
- **infra/**, **sql/**: File hạ tầng, cơ sở dữ liệu (schema, seed).
- **docs/**: Tài liệu kiến trúc, API, hướng dẫn sử dụng Postman.
- **docker-compose.yml**: Quản lý các dịch vụ bằng Docker.

### Công nghệ sử dụng
- **Java 17+**, **Spring Boot**: Xây dựng API backend.
- **Maven**: Quản lý phụ thuộc và build dự án.
- **Docker**: Đóng gói và chạy các dịch vụ.
- **PostgreSQL**: Cơ sở dữ liệu chính (cấu hình trong docker-compose).
- **Postman**: Test API qua collection mẫu.

## Cấu trúc thư mục
- `backend/`: Source code backend, Dockerfile, file cấu hình Spring Boot.
- `docs/`: Tài liệu, file Postman collection, OpenAPI spec.
- `infra/`, `sql/`: File hạ tầng, script tạo và seed database.
- `docker-compose.yml`: Định nghĩa các service (backend, db).

## Hướng dẫn chạy dự án

### 1. Chạy bằng Docker Compose
Yêu cầu: Đã cài [Docker](https://www.docker.com/) và [Docker Compose](https://docs.docker.com/compose/)

```cmd
cd <thư mục dự án>
docker-compose up --build
```
- Backend sẽ chạy ở port 8080 (có thể cấu hình lại trong docker-compose.yml).
- Database PostgreSQL chạy ở port 55432 (db=examdb, user=postgres, pass=postgres).
- Uploads (ảnh minh chứng) sẽ được lưu vào volume `uploads` gắn vào thư mục `/app/uploads` trong container backend.

### 2. Chạy backend bằng Maven (không dùng Docker)
Yêu cầu: Đã cài [Java 17+](https://adoptium.net/) và [Maven](https://maven.apache.org/)

```cmd
cd backend
mvn spring-boot:run
```
- API docs (Swagger UI): http://localhost:8080/swagger-ui/index.html
- Mặc định bật bảo mật (JWT RS256). Khóa công khai dev đã có sẵn (`classpath:keys/dev-public.pem`).
- Cấu hình database trong `backend/src/main/resources/application.yml`.
- Đảm bảo database đã khởi động và đúng thông tin kết nối.

### 3. Test API bằng Postman
- Mở file `docs/postman/ExamCheatingDetection.postman_collection.json` bằng Postman.
- Sử dụng môi trường `Local.postman_environment.json` để test với local.
- Các API chính: Sessions, Ingest, Incidents, Reviews.

## Luồng hoạt động chính
1. **Người dùng bắt đầu phiên thi** → API `/sessions/start` tạo session.
2. **Client gửi sự kiện, ảnh, metadata** → API `/ingest/events`, `/ingest/snapshots`.
3. **Hệ thống phát hiện sự kiện bất thường** → API `/incidents` tạo incident.
4. **Admin review các incident** → API `/admin/reviews` xác nhận hoặc từ chối.

## Một số endpoint mẫu

### Upload snapshot (base64)
- POST `/api/ingest/snapshots/upload`
- Body mẫu:

```json
{
  "items": [
    {
      "sessionId": "1a2b3c4d-0000-0000-0000-abcdefabcdef",
      "ts": 1730726400000,
      "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
      "faceCount": 2,
      "idempotencyKey": "snap-unique-key-123"
    }
  ]
}
```

Server sẽ giải mã ảnh, lưu file vào `/app/uploads/<sessionId>/YYYY/MM/DD/<uuid>.jpg` và ghi metadata vào DB, tái sử dụng pipeline ingest snapshots hiện có.

## CORS cho frontend local
- Cấu hình CORS cho FE local mặc định chấp nhận `http://localhost:3000` và `http://localhost:5173` qua cấu hình Security.
- Có thể override bằng biến môi trường (vd: `CORS_ALLOWED_ORIGINS`) hoặc chỉnh trong cấu hình Security nếu cần.

## Ghi chú
- Không commit file build (.jar, .class, ...) lên repo, chỉ commit source code.
- Cấu hình các biến môi trường (database, port, ...) trong file `.env` hoặc `application.yml`.
- Nếu gặp lỗi dung lượng file khi push, kiểm tra lại `.gitignore` và xóa file build khỏi repo.

## Tài liệu tham khảo
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Docker Compose](https://docs.docker.com/compose/)
- [Postman](https://www.postman.com/)

---
Nếu có thắc mắc, liên hệ chủ repo hoặc xem thêm trong thư mục `docs/`.
## Lưu ý
Khi file .jar đã được git ignore và không còn lưu trên repo, bạn của bạn khi pull code về sẽ không có file .jar đó. Để chạy được backend, bạn cần hướng dẫn bạn mình tự build file .jar từ source code:

1. Cài đặt Java (17+) và Maven trên máy.
2. Vào thư mục backend, chạy lệnh sau để build:
- mvn clean package
Sau khi build xong, file .jar sẽ xuất hiện ở target.
Hoặc nếu chỉ cần chạy trực tiếp mà không cần file .jar, dùng:
- mvn spring-boot:run