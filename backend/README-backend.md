# Backend quickstart (Spring Boot)

Mục tiêu: chạy Postgres trong Docker, build và chạy Spring Boot app, gọi API start/end session.

1) Khởi động Postgres bằng Docker Compose (Windows CMD):

```bat
cd "e:\HK1 Nam 4\TotNghiep\exam-cheating-detection-v2"
docker compose up -d
```

2) Kiểm tra container đang chạy:

```bat
docker ps
```

3) Build và chạy backend (sử dụng Maven):

```bat
cd backend
mvnw.cmd -v   # kiểm tra mvn wrapper hoặc dùng mvn nếu đã cài
mvnw.cmd -DskipTests spring-boot:run -Dspring-boot.run.jvmArguments="-Duser.timezone=UTC"
```

Nếu dùng IDE (IntelliJ/Eclipse/VS Code) thì import project Maven (`backend/pom.xml`) và run `ExamApplication`.

4) Test API (Windows CMD):

# Start session
curl -X POST http://localhost:8080/api/sessions/start -H "Content-Type: application/json" -d "{\"examId\":\"11111111-1111-1111-1111-111111111111\",\"userId\":\"22222222-2222-2222-2222-222222222222\"}"

# End session (thay id bằng id trả về)
curl -X POST http://localhost:8080/api/sessions/{id}/end

5) Logs & debugging
- Docker logs: `docker logs exam-postgres`
- App logs: console from mvn spring-boot:run or IDE run window.

Next: add authentication (JWT RS256), entity mapping cho các bảng khác, seed data runner, và tests.
Ghi chú:
- Postgres container đang publish cổng host 55432 → JDBC URL mặc định trong `application.yml` đã trỏ `jdbc:postgresql://127.0.0.1:55432/examdb`.
- Nếu bạn đang có Postgres cài native trên Windows chiếm 5432, giữ nguyên cổng 55432 để tránh xung đột.
- Có sẵn file `docs/api/requests.http` để test nhanh bằng VS Code REST Client.
