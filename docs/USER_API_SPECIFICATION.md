# Đặc tả API User - Đầy đủ cho Tất cả Vai trò

**Mục đích**: Tài liệu này đặc tả các endpoint API và DTO của User Service cho tất cả vai trò trong hệ thống Phát hiện Gian lận Thi cử (Candidate, Proctor, Reviewer, Admin).

**Đối tượng**: Lập trình viên Backend triển khai User Service

---

## Tổng quan

User Service cung cấp các endpoint cho:
1. **Xác thực** (đăng ký, đăng nhập cho tất cả vai trò)
2. **Quản lý hồ sơ người dùng** (cho người dùng đã xác thực xem/cập nhật hồ sơ của chính họ)
3. **Tra cứu người dùng cho sự cố** (cho Proctor/Reviewer xem chi tiết thí sinh khi xem xét vi phạm)
4. **Quản lý người dùng** (cho Admin liệt kê/quản lý người dùng theo vai trò)

---

## Xác thực & Phân quyền

Tất cả endpoint yêu cầu xác thực JWT Bearer token:
```
Authorization: Bearer <jwt_token>
```

**Phân quyền theo vai trò:**
- `POST /api/auth/register` - Công khai (không yêu cầu token)
- `POST /api/auth/login` - Công khai (không yêu cầu token)
- `POST /api/auth/logout` - Bất kỳ người dùng đã xác thực nào
- `GET /api/users/me` - Bất kỳ người dùng đã xác thực nào
- `PUT /api/users/me` - Bất kỳ người dùng đã xác thực nào (cập nhật hồ sơ của chính mình)
- `GET /api/users/:id` - ADMIN, PROCTOR, REVIEWER (để xem chi tiết thí sinh)
- `GET /api/users` - Chỉ ADMIN
- `PUT /api/users/:id` - Chỉ ADMIN
- `POST /api/users` - Chỉ ADMIN

---

## Các API Endpoint

## A. API Xác thực (Authentication)

### 1. Đăng ký Tài khoản

**Endpoint**: `POST /api/auth/register`

**Mô tả**: Đăng ký tài khoản mới cho thí sinh (CANDIDATE). Proctor/Admin được tạo bởi Admin qua endpoint `POST /api/users`.

**Phân quyền**: Công khai (không yêu cầu token)

**Request Body**:
```json
{
  "username": "nguyen_van_a",
  "email": "nguyenvana@student.edu.vn",
  "password": "SecurePass123!",
  "fullName": "Nguyễn Văn A"
}
```

**Response**: 201 Created
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "nguyen_van_a",
    "email": "nguyenvana@student.edu.vn",
    "role": "CANDIDATE",
    "createdAt": "2024-11-24T08:00:00Z"
  },
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Lỗi**:
- `409 Conflict` - Username hoặc email đã tồn tại
```json
{
  "error": "USER_ALREADY_EXISTS",
  "message": "Username 'nguyen_van_a' đã được sử dụng"
}
```

**Cấu trúc DTO** (AuthRegisterDto):
```java
public class AuthRegisterDto {
    public static class Request {
        @NotBlank
        @Size(min = 3, max = 100)
        public String username;
        
        @NotBlank
        @Email
        public String email;
        
        @NotBlank
        @Size(min = 8, max = 100)
        public String password;
        
        @NotBlank
        @Size(max = 200)
        public String fullName;
    }
    
    public static class Response {
        public UserProfileDto.Response user;
        public String token;
    }
}
```

---

### 2. Đăng nhập

**Endpoint**: `POST /api/auth/login`

**Mô tả**: Đăng nhập vào hệ thống cho tất cả vai trò.

**Phân quyền**: Công khai (không yêu cầu token)

**Request Body**:
```json
{
  "username": "nguyen_van_a",
  "password": "SecurePass123!"
}
```

**Response**: 200 OK
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "nguyen_van_a",
    "email": "nguyenvana@student.edu.vn",
    "role": "CANDIDATE",
    "createdAt": "2024-11-15T08:00:00Z",
    "updatedAt": "2024-11-24T08:30:00Z"
  },
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Lỗi**:
- `401 Unauthorized` - Sai username hoặc password
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Username hoặc mật khẩu không đúng"
}
```

**Cấu trúc DTO** (AuthLoginDto):
```java
public class AuthLoginDto {
    public static class Request {
        @NotBlank
        public String username;
        
        @NotBlank
        public String password;
    }
    
    public static class Response {
        public UserProfileDto.Response user;
        public String token;
    }
}
```

---

### 3. Đăng xuất (Optional)

**Endpoint**: `POST /api/auth/logout`

**Mô tả**: Đăng xuất khỏi hệ thống. Với JWT stateless, client chỉ cần xóa token. Endpoint này có thể dùng để blacklist token nếu cần.

**Phân quyền**: Bất kỳ người dùng đã xác thực nào

**Request Body**: Không cần (token trong Authorization header)

**Response**: 200 OK
```json
{
  "message": "Đăng xuất thành công"
}
```

---

## B. API Quản lý Hồ sơ Người dùng

### 1. Lấy Hồ sơ Người dùng Hiện tại

**Endpoint**: `GET /api/users/me`

**Mô tả**: Trả về thông tin hồ sơ của người dùng đã xác thực.

**Phân quyền**: Bất kỳ người dùng đã xác thực nào (ADMIN, PROCTOR, REVIEWER, CANDIDATE)

**Response**: 200 OK
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john.doe@example.com",
  "role": "CANDIDATE",
  "createdAt": "2024-11-20T10:30:00Z",
  "updatedAt": "2024-11-20T10:30:00Z"
}
```

**DTO Structure** (UserProfileDto.Response):
```java
public class UserProfileDto {
    public static class Response {
        public UUID id;
        public String username;
        public String email;
        public UserRole role; // ADMIN, PROCTOR, REVIEWER, CANDIDATE
        public Instant createdAt;
        public Instant updatedAt;
    }
}
```

---

### 2. Cập nhật Hồ sơ Của Chính Mình

**Endpoint**: `PUT /api/users/me`

**Mô tả**: Người dùng cập nhật hồ sơ của chính mình (email, fullName). Không thể thay đổi username, password (có endpoint riêng), hoặc role.

**Phân quyền**: Bất kỳ người dùng đã xác thực nào

**Request Body**:
```json
{
  "email": "newemail@student.edu.vn",
  "fullName": "Nguyễn Văn A (Updated)"
}
```

**Response**: 200 OK
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "nguyen_van_a",
  "email": "newemail@student.edu.vn",
  "role": "CANDIDATE",
  "createdAt": "2024-11-20T10:30:00Z",
  "updatedAt": "2024-11-24T09:00:00Z"
}
```

**Cấu trúc DTO** (UserProfileUpdateDto):
```java
public class UserProfileUpdateDto {
    public static class Request {
        @Email
        public String email;
        
        @Size(max = 200)
        public String fullName;
    }
}
```

---

### 3. Đổi Mật khẩu

**Endpoint**: `PUT /api/users/me/password`

**Mô tả**: Người dùng đổi mật khẩu của chính mình.

**Phân quyền**: Bất kỳ người dùng đã xác thực nào

**Request Body**:
```json
{
  "oldPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response**: 200 OK
```json
{
  "message": "Mật khẩu đã được cập nhật thành công"
}
```

**Response Lỗi**:
- `401 Unauthorized` - Mật khẩu cũ không đúng
```json
{
  "error": "INVALID_PASSWORD",
  "message": "Mật khẩu hiện tại không đúng"
}
```

**Cấu trúc DTO** (PasswordChangeDto):
```java
public class PasswordChangeDto {
    public static class Request {
        @NotBlank
        public String oldPassword;
        
        @NotBlank
        @Size(min = 8, max = 100)
        public String newPassword;
    }
}
```

---

## C. API Tra cứu Người dùng (Proctor/Admin)

### 1. Lấy User theo ID

**Endpoint**: `GET /api/users/{userId}`

**Mô tả**: Lấy hồ sơ của một người dùng cụ thể. Được Proctor/Reviewer sử dụng để xem chi tiết thí sinh khi xem xét sự cố.

**Phân quyền**: ADMIN, PROCTOR, REVIEWER

**Tham số Path**:
- `userId` (UUID) - Mã định danh duy nhất của người dùng

**Response**: 200 OK
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "nguyen_van_a",
  "email": "nguyenvana@student.edu.vn",
  "role": "CANDIDATE",
  "createdAt": "2024-11-15T08:00:00Z",
  "updatedAt": "2024-11-20T14:25:00Z"
}
```

**Response Lỗi**:
- `404 Not Found` - Người dùng không tồn tại
```json
{
  "error": "USER_NOT_FOUND",
  "message": "User with ID 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

**Cấu trúc DTO**: Giống như `UserProfileDto.Response`

---

### 2. Lấy Users theo IDs (Batch Lookup)

**Endpoint**: `POST /api/users/batch`

**Mô tả**: Lấy nhiều người dùng theo ID của họ trong một request duy nhất. Được sử dụng để tải chi tiết thí sinh một cách hiệu quả cho nhiều sự cố.

**Phân quyền**: ADMIN, PROCTOR, REVIEWER

**Request Body**:
```json
{
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001",
    "770e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Response**: 200 OK
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "nguyen_van_a",
      "email": "nguyenvana@student.edu.vn",
      "role": "CANDIDATE",
      "createdAt": "2024-11-15T08:00:00Z",
      "updatedAt": "2024-11-20T14:25:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "username": "tran_thi_b",
      "email": "tranthib@student.edu.vn",
      "role": "CANDIDATE",
      "createdAt": "2024-11-16T09:15:00Z",
      "updatedAt": "2024-11-18T11:30:00Z"
    }
  ],
  "notFound": [
    "770e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Cấu trúc DTO** (UserBatchDto):
```java
public class UserBatchDto {
    public static class Request {
        @NotNull
        @Size(min = 1, max = 100)
        public List<UUID> userIds;
    }
    
    public static class Response {
        public List<UserProfileDto.Response> users;
        public List<UUID> notFound; // ID không tồn tại
    }
}
```

---

## D. API Quản lý Người dùng (Admin)

### 1. Liệt kê Users với Bộ lọc

**Endpoint**: `GET /api/users`

**Mô tả**: Liệt kê người dùng với bộ lọc và phân trang. Được Admin sử dụng để quản lý người dùng.

**Phân quyền**: Chỉ ADMIN

**Tham số Query**:
- `role` (tùy chọn) - Lọc theo vai trò: ADMIN, PROCTOR, REVIEWER, CANDIDATE
- `search` (tùy chọn) - Tìm kiếm theo username hoặc email (khớp một phần, không phân biệt hoa thường)
- `page` (tùy chọn, mặc định: 0) - Số trang (đánh số từ 0)
- `size` (tùy chọn, mặc định: 20) - Kích thước trang (tối đa: 100)
- `sort` (tùy chọn, mặc định: "createdAt,desc") - Trường sắp xếp và hướng

**Ví dụ**: `GET /api/users?role=CANDIDATE&search=nguyen&page=0&size=20&sort=username,asc`

**Response**: 200 OK
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "nguyen_van_a",
      "email": "nguyenvana@student.edu.vn",
      "role": "CANDIDATE",
      "createdAt": "2024-11-15T08:00:00Z",
      "updatedAt": "2024-11-20T14:25:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "username": "nguyen_thi_c",
      "email": "nguyenthic@student.edu.vn",
      "role": "CANDIDATE",
      "createdAt": "2024-11-16T09:00:00Z",
      "updatedAt": "2024-11-19T10:15:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 145,
    "totalPages": 8
  }
}
```

**Cấu trúc DTO** (UserListDto):
```java
public class UserListDto {
    public static class Response {
        public List<UserProfileDto.Response> users;
        public PaginationInfo pagination;
    }
    
    public static class PaginationInfo {
        public int page;
        public int size;
        public long totalElements;
        public int totalPages;
    }
}
```

---

### 2. Cập nhật Hồ sơ User (Admin)

**Endpoint**: `PUT /api/users/{userId}`

**Mô tả**: Cập nhật thông tin hồ sơ của người dùng (Chỉ Admin).

**Phân quyền**: Chỉ ADMIN

**Tham số Path**:
- `userId` (UUID) - Mã định danh duy nhất của người dùng

**Request Body**:
```json
{
  "email": "newemail@example.com",
  "role": "PROCTOR"
}
```

**Lưu ý**: Username và password KHÔNG thể cập nhật qua endpoint này.

**Response**: 200 OK
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "newemail@example.com",
  "role": "PROCTOR",
  "createdAt": "2024-11-15T08:00:00Z",
  "updatedAt": "2024-11-24T07:15:00Z"
}
```

**Cấu trúc DTO** (UserUpdateDto):
```java
public class UserUpdateDto {
    public static class Request {
        @Email
        public String email; // tùy chọn
        
        public UserRole role; // tùy chọn
    }
    
    // Response: sử dụng UserProfileDto.Response
}
```

---

### 3. Tạo User (Admin)

**Endpoint**: `POST /api/users`

**Mô tả**: Tạo người dùng mới (Chỉ Admin).

**Phân quyền**: Chỉ ADMIN

**Request Body**:
```json
{
  "username": "new_proctor",
  "email": "proctor@school.edu",
  "password": "SecurePassword123!",
  "role": "PROCTOR"
}
```

**Response**: 201 Created
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440099",
  "username": "new_proctor",
  "email": "proctor@school.edu",
  "role": "PROCTOR",
  "createdAt": "2024-11-24T07:20:00Z",
  "updatedAt": "2024-11-24T07:20:00Z"
}
```

**Response Lỗi**:
- `409 Conflict` - Username hoặc email đã tồn tại
```json
{
  "error": "USER_ALREADY_EXISTS",
  "message": "Username 'new_proctor' is already taken"
}
```

**Cấu trúc DTO** (UserCreateDto):
```java
public class UserCreateDto {
    public static class Request {
        @NotBlank
        @Size(min = 3, max = 100)
        public String username;
        
        @NotBlank
        @Email
        public String email;
        
        @NotBlank
        @Size(min = 8, max = 100)
        public String password;
        
        @NotNull
        public UserRole role;
    }
    
    // Response: sử dụng UserProfileDto.Response
}
```

---

### 4. Xóa User (Admin)

**Endpoint**: `DELETE /api/users/{userId}`

**Mô tả**: Xóa người dùng khỏi hệ thống (soft delete hoặc hard delete tùy yêu cầu).

**Phân quyền**: Chỉ ADMIN

**Tham số Path**:
- `userId` (UUID) - Mã định danh duy nhất của người dùng

**Response**: 200 OK
```json
{
  "message": "User đã được xóa thành công"
}
```

**Response Lỗi**:
- `404 Not Found` - User không tồn tại
- `409 Conflict` - Không thể xóa user đang có session active

---

## E. Tham khảo API khác cho Candidate

**Lưu ý**: Các API sau đây KHÔNG thuộc User Service, nhưng cần thiết cho Candidate:

### API Bài thi (Exam Service)
- `GET /api/exams` - Xem danh sách bài thi có sẵn (CANDIDATE)
- `GET /api/exams/{examId}` - Xem chi tiết bài thi (CANDIDATE)

### API Làm bài thi (Mock Exam Service)
- `POST /api/mock-exam/start` - Bắt đầu làm bài thi (CANDIDATE)
  ```json
  {
    "examId": "uuid-of-exam"
  }
  ```
  Response: `{ "sessionId": "uuid", "examTitle": "...", "duration": 60 }`

- `POST /api/mock-exam/submit` - Nộp bài thi (CANDIDATE)
  ```json
  {
    "sessionId": "uuid-of-session"
  }
  ```

### API Ingest (Thu thập dữ liệu giám sát)
- `POST /api/ingest/events` - Gửi sự kiện (CANDIDATE)
  ```json
  {
    "sessionId": "uuid",
    "eventType": "TAB_SWITCH",
    "timestamp": "2024-11-24T10:00:00Z",
    "idempotencyKey": "session-TAB_SWITCH-1700820000"
  }
  ```

- `POST /api/ingest/snapshots` - Upload ảnh webcam (CANDIDATE)
  ```
  multipart/form-data
  - sessionId: uuid
  - file: image.jpg
  - timestamp: ISO8601
  - idempotencyKey: session-SNAPSHOT-1700820000
  ```

### API Session (Xem lịch sử thi)
- `GET /api/sessions/my-sessions` - Xem lịch sử phiên thi của mình (CANDIDATE)
- `GET /api/sessions/{sessionId}` - Xem chi tiết phiên thi (CANDIDATE - chỉ session của mình)

---

## Tham khảo Đầy đủ DTO

### UserRole Enum
```java
public enum UserRole {
    ADMIN,
    PROCTOR,
    REVIEWER,
    CANDIDATE
}
```

### Complete DTO Classes

**AuthRegisterDto.java**
```java
package com.example.exam.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthRegisterDto {
    
    public static class Request {
        @NotBlank
        @Size(min = 3, max = 100)
        public String username;
        
        @NotBlank
        @Email
        public String email;
        
        @NotBlank
        @Size(min = 8, max = 100)
        public String password;
        
        @NotBlank
        @Size(max = 200)
        public String fullName;
    }
    
    public static class Response {
        public UserProfileDto.Response user;
        public String token;
    }
}
```

**AuthLoginDto.java**
```java
package com.example.exam.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthLoginDto {
    
    public static class Request {
        @NotBlank
        public String username;
        
        @NotBlank
        public String password;
    }
    
    public static class Response {
        public UserProfileDto.Response user;
        public String token;
    }
}
```

**UserProfileUpdateDto.java**
```java
package com.example.exam.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UserProfileUpdateDto {
    
    public static class Request {
        @Email
        public String email;
        
        @Size(max = 200)
        public String fullName;
    }
}
```

**PasswordChangeDto.java**
```java
package com.example.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordChangeDto {
    
    public static class Request {
        @NotBlank
        public String oldPassword;
        
        @NotBlank
        @Size(min = 8, max = 100)
        public String newPassword;
    }
}
```

**UserProfileDto.java**
```java
package com.example.exam.dto;

import com.example.exam.model.User;
import com.example.exam.model.UserRole;
import java.time.Instant;
import java.util.UUID;

public class UserProfileDto {
    
    public static class Response {
        public UUID id;
        public String username;
        public String email;
        public UserRole role;
        public Instant createdAt;
        public Instant updatedAt;
        
        public static Response from(User user) {
            Response dto = new Response();
            dto.id = user.getId();
            dto.username = user.getUsername();
            dto.email = user.getEmail();
            dto.role = user.getRole();
            dto.createdAt = user.getCreatedAt();
            dto.updatedAt = user.getUpdatedAt();
            return dto;
        }
    }
}
```

**UserBatchDto.java**
```java
package com.example.exam.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public class UserBatchDto {
    
    public static class Request {
        @NotNull
        @Size(min = 1, max = 100)
        public List<UUID> userIds;
    }
    
    public static class Response {
        public List<UserProfileDto.Response> users;
        public List<UUID> notFound;
    }
}
```

**UserListDto.java**
```java
package com.example.exam.dto;

import java.util.List;

public class UserListDto {
    
    public static class Response {
        public List<UserProfileDto.Response> users;
        public PaginationInfo pagination;
    }
    
    public static class PaginationInfo {
        public int page;
        public int size;
        public long totalElements;
        public int totalPages;
    }
}
```

**UserUpdateDto.java**
```java
package com.example.exam.dto;

import com.example.exam.model.UserRole;
import jakarta.validation.constraints.Email;

public class UserUpdateDto {
    
    public static class Request {
        @Email
        public String email;
        
        public UserRole role;
    }
}
```

**UserCreateDto.java**
```java
package com.example.exam.dto;

import com.example.exam.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserCreateDto {
    
    public static class Request {
        @NotBlank
        @Size(min = 3, max = 100)
        public String username;
        
        @NotBlank
        @Email
        public String email;
        
        @NotBlank
        @Size(min = 8, max = 100)
        public String password;
        
        @NotNull
        public UserRole role;
    }
}
```

---

## Các Trường hợp Sổ dụng trong Dashboard

### Candidate - Quy trình Làm bài thi

```typescript
// 1. Đăng ký/Đăng nhập
const { user, token } = await api.post('/api/auth/login', {
  username: 'nguyen_van_a',
  password: 'SecurePass123!'
});
localStorage.setItem('token', token);

// 2. Xem danh sách bài thi
const exams = await api.get('/api/exams');

// 3. Bắt đầu làm bài
const { sessionId, duration } = await api.post('/api/mock-exam/start', {
  examId: exams[0].id
});

// 4. Gửi sự kiện và snapshot trong khi làm bài
// Tab switch event
await api.post('/api/ingest/events', {
  sessionId,
  eventType: 'TAB_SWITCH',
  timestamp: new Date().toISOString(),
  idempotencyKey: `${sessionId}-TAB_SWITCH-${Date.now()}`
});

// Webcam snapshot
const formData = new FormData();
formData.append('sessionId', sessionId);
formData.append('file', webcamBlob);
formData.append('timestamp', new Date().toISOString());
formData.append('idempotencyKey', `${sessionId}-SNAPSHOT-${Date.now()}`);
await api.post('/api/ingest/snapshots', formData);

// 5. Nộp bài
await api.post('/api/mock-exam/submit', { sessionId });

// 6. Xem lịch sử thi
const mySessions = await api.get('/api/sessions/my-sessions');
```

### Proctor Dashboard - Xem xét Sự cố

Khi một Proctor xem xét sự cố, họ cần xem thông tin thí sinh:

```typescript
// Ví dụ Frontend
async function loadIncidentWithUserDetails(incidentId: string) {
  // 1. Lấy sự cố
  const incident = await api.get(`/api/incidents/${incidentId}`);
  // incident.sessionId → cần lấy session → session.userId
  
  const session = await api.get(`/api/sessions/${incident.sessionId}`);
  
  // 2. Lấy chi tiết thí sinh
  const candidate = await api.get(`/api/users/${session.userId}`);
  
  return {
    ...incident,
    candidate: {
      username: candidate.username,
      email: candidate.email
    }
  };
}
```

**Tối ưu hóa với Batch API:**
```typescript
// Tải nhiều sự cố với chi tiết người dùng một cách hiệu quả
async function loadIncidentsWithUsers(incidents: Incident[]) {
  const userIds = [...new Set(incidents.map(i => i.session.userId))];
  
  const { users } = await api.post('/api/users/batch', { userIds });
  const userMap = new Map(users.map(u => [u.id, u]));
  
  return incidents.map(incident => ({
    ...incident,
    candidate: userMap.get(incident.session.userId)
  }));
}
```

### Admin Dashboard - Quản lý Người dùng

```typescript
// Liệt kê tất cả proctor
const proctors = await api.get('/api/users?role=PROCTOR&size=50');

// Tìm kiếm thí sinh theo tên
const results = await api.get('/api/users?role=CANDIDATE&search=nguyen&page=0');

// Tạo proctor mới
await api.post('/api/users', {
  username: 'proctor_new',
  email: 'proctor.new@school.edu',
  password: 'TempPassword123!',
  role: 'PROCTOR'
});
```

---

## Lưu ý Triển khai

### Cân nhắc về Bảo mật

1. **Mã hóa Mật khẩu**: Trường `password` trong entity User lưu mã hash bcrypt, KHÔNG BAO GIỞ là văn bản thông thường.
2. **Mật khẩu trong Response**: KHÔNG BAO GIỞ trả về `passwordHash` trong bất kỳ response DTO nào.
3. **Phân quyền**: Xác minh truy cập theo vai trò trong annotation `@PreAuthorize` của Spring Security.
4. **Xác thực Đầu vào**: Sử dụng Jakarta Bean Validation (`@NotBlank`, `@Email`, v.v.).

### Truy vấn Cơ sở dữ liệu

**Tra cứu batch hiệu quả** (tránh truy vấn N+1):
```java
// UserRepository.java
@Query("SELECT u FROM User u WHERE u.id IN :userIds")
List<User> findAllByIdIn(@Param("userIds") List<UUID> userIds);
```

**Tìm kiếm với bộ lọc**:
```java
// UserRepository.java
@Query("SELECT u FROM User u WHERE " +
       "(:role IS NULL OR u.role = :role) AND " +
       "(LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       " LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
Page<User> findWithFilters(
    @Param("role") UserRole role, 
    @Param("search") String search, 
    Pageable pageable
);
```

### Xử lý Lỗi

Trả về định dạng lỗi nhất quán:
```json
{
  "error": "ERROR_CODE",
  "message": "Thông báo dễ hiểu với người dùng",
  "timestamp": "2024-11-24T07:30:00Z"
}
```

Mã trạng thái HTTP thường gặp:
- `200 OK` - Thành công
- `201 Created` - User được tạo
- `400 Bad Request` - Lỗi xác thực
- `401 Unauthorized` - Thiếu/token không hợp lệ
- `403 Forbidden` - Không đủ quyền
- `404 Not Found` - Không tìm thấy user
- `409 Conflict` - Username/email trùng lặp

---

## Checklist Kiểm thử

**Authentication:**
- [ ] `POST /api/auth/register` tạo tài khoản CANDIDATE thành công
- [ ] `POST /api/auth/register` từ chối username/email trùng lặp (409)
- [ ] `POST /api/auth/login` trả về token hợp lệ với credentials đúng
- [ ] `POST /api/auth/login` từ chối credentials sai (401)
- [ ] `POST /api/auth/logout` xóa session/blacklist token

**User Profile:**
- [ ] `GET /api/users/me` trả về hồ sơ người dùng hiện tại
- [ ] `PUT /api/users/me` cập nhật email và fullName thành công
- [ ] `PUT /api/users/me` không cho phép thay đổi username/role
- [ ] `PUT /api/users/me/password` đổi mật khẩu với oldPassword đúng
- [ ] `PUT /api/users/me/password` từ chối oldPassword sai (401)

**User Lookup (Proctor/Admin):**
- [ ] `GET /api/users/{id}` hoạt động cho PROCTOR xem CANDIDATE
- [ ] `GET /api/users/{id}` trả về 403 cho CANDIDATE xem người dùng khác
- [ ] `POST /api/users/batch` xử lý kết quả rỗng một cách nhẹ nhàng
- [ ] `POST /api/users/batch` giới hạn tối đa 100 ID

**User Management (Admin):**
- [ ] `GET /api/users` lọc theo vai trò hoạt động chính xác
- [ ] `GET /api/users` tìm kiếm không phân biệt hoa thường
- [ ] `GET /api/users` phân trang hoạt động (giới hạn trang, tính toán totalPages)
- [ ] `POST /api/users` tạo user với vai trò bất kỳ (ADMIN, PROCTOR, etc.)
- [ ] `POST /api/users` từ chối username/email trùng lặp (409 Conflict)
- [ ] `PUT /api/users/{id}` cập nhật email và role chính xác
- [ ] `DELETE /api/users/{id}` xóa user thành công (hoặc soft delete)

**Security:**
- [ ] Mật khẩu không bao giờ được tiết lộ trong bất kỳ response nào
- [ ] Tất cả endpoint thực thi phân quyền theo vai trò
- [ ] Token JWT chứa đúng claims (userId, role, exp)
- [ ] Endpoint công khai không yêu cầu token
- [ ] Endpoint bảo mật từ chối request không có token (401)

---

## Tóm tắt

Đặc tả này cung cấp:
- **12+ API endpoint** bao phủ tất cả nhu cầu cho Candidate, Proctor, Reviewer và Admin
  - **3 endpoint xác thực**: Đăng ký, đăng nhập, đăng xuất
  - **3 endpoint hồ sơ cá nhân**: Xem, cập nhật, đổi mật khẩu
  - **2 endpoint tra cứu**: Get by ID, batch lookup
  - **4 endpoint quản lý (Admin)**: List, create, update, delete
- **Cấu trúc DTO đầy đủ** với annotation xác thực cho tất cả request/response
- **Quy tắc phân quyền rõ ràng** cho từng endpoint
- **Ví dụ sử dụng thực tế** cho cả Candidate làm bài và Proctor xem xét
- **Hướng dẫn triển khai** cho bảo mật, hiệu suất và xử lý lỗi
- **Tham chiếu API liên quan** (Exam, Mock Exam, Ingest, Session Service)

**Lưu ý quan trọng**:
- API cho Candidate làm bài thi (start/submit exam, ingest events/snapshots) thuộc các Service khác
- User Service chỉ quản lý authentication và user profile
- Tất cả API đều tuân theo pattern hiện có của dự án (Spring Boot, JWT RS256, idempotency)

Vui lòng triển khai các endpoint này theo các mẫu hiện có của dự án (Spring Boot, JPA repositories, cấu hình bảo mật JWT).
