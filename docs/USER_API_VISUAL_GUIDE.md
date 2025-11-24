# User API - Visual Flow Diagrams

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Dashboards                       │
├──────────────────┬──────────────────┬──────────────────────┤
│ Proctor Dashboard│  Admin Dashboard │  Candidate Profile   │
└────────┬─────────┴────────┬─────────┴──────────┬───────────┘
         │                  │                     │
         │                  │                     │
         ▼                  ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                     User Service API                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ GET  /api/users/me            [Any Role]                │ │
│  │ GET  /api/users/{id}          [ADMIN/PROCTOR/REVIEWER] │ │
│  │ POST /api/users/batch         [ADMIN/PROCTOR/REVIEWER] │ │
│  │ GET  /api/users               [ADMIN]                  │ │
│  │ PUT  /api/users/{id}          [ADMIN]                  │ │
│  │ POST /api/users               [ADMIN]                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   PostgreSQL   │
                    │  users table   │
                    └────────────────┘
```

## Proctor Reviewing Incidents - Data Flow

```
Proctor Dashboard
       │
       ├─── 1. GET /api/incidents?status=OPEN
       │    Response: [
       │      {
       │        id: "inc-1",
       │        sessionId: "ses-1",  ◄── Need to get user from session
       │        type: "TAB_ABUSE",
       │        ...
       │      }
       │    ]
       │
       ├─── 2. GET /api/sessions/{sessionId}
       │    Response: {
       │      id: "ses-1",
       │      userId: "user-123",   ◄── Got user ID!
       │      examId: "exam-1"
       │    }
       │
       └─── 3. POST /api/users/batch
            Request: { userIds: ["user-123", "user-456", ...] }
            Response: {
              users: [
                {
                  id: "user-123",
                  username: "nguyen_van_a",    ◄── Display this!
                  email: "nguyenvana@student.edu.vn",
                  role: "CANDIDATE"
                }
              ]
            }

Final Display:
┌──────────────────────────────────────────────────────────┐
│ Incident #inc-1                                          │
│ Type: TAB_ABUSE                                          │
│ Candidate: nguyen_van_a (nguyenvana@student.edu.vn)     │
│ Score: 0.85                                              │
│ [View Evidence] [Confirm] [Reject]                      │
└──────────────────────────────────────────────────────────┘
```

## Admin Managing Users - Data Flow

```
Admin Dashboard
       │
       ├─── 1. GET /api/users?role=PROCTOR&page=0&size=20
       │    Response: {
       │      users: [
       │        {
       │          id: "uuid-1",
       │          username: "proctor_1",
       │          email: "p1@school.edu",
       │          role: "PROCTOR",
       │          createdAt: "..."
       │        },
       │        ...
       │      ],
       │      pagination: {
       │        page: 0,
       │        size: 20,
       │        totalElements: 5,
       │        totalPages: 1
       │      }
       │    }
       │
       ├─── 2. Search by name
       │    GET /api/users?search=nguyen&role=CANDIDATE
       │
       ├─── 3. Create new user
       │    POST /api/users
       │    Request: {
       │      username: "new_proctor",
       │      email: "new@school.edu",
       │      password: "SecurePass123!",
       │      role: "PROCTOR"
       │    }
       │
       └─── 4. Update user
            PUT /api/users/{userId}
            Request: {
              email: "updated@school.edu",
              role: "REVIEWER"
            }
```

## Role-Based Access Control Matrix

```
┌──────────────────────┬──────────┬──────────┬──────────┬────────────┐
│ Endpoint             │ ADMIN    │ PROCTOR  │ REVIEWER │ CANDIDATE  │
├──────────────────────┼──────────┼──────────┼──────────┼────────────┤
│ GET /users/me        │    ✓     │    ✓     │    ✓     │     ✓      │
│ GET /users/{id}      │    ✓     │    ✓     │    ✓     │     ✗      │
│ POST /users/batch    │    ✓     │    ✓     │    ✓     │     ✗      │
│ GET /users           │    ✓     │    ✗     │    ✗     │     ✗      │
│ PUT /users/{id}      │    ✓     │    ✗     │    ✗     │     ✗      │
│ POST /users          │    ✓     │    ✗     │    ✗     │     ✗      │
└──────────────────────┴──────────┴──────────┴──────────┴────────────┘
```

## Data Model Reference

```
┌────────────────────┐
│       users        │
├────────────────────┤
│ id (PK)           │ ◄── UUID, auto-generated
│ username          │ ◄── UNIQUE, 3-100 chars
│ email             │ ◄── UNIQUE, validated
│ password_hash     │ ◄── bcrypt, NEVER returned in API
│ role              │ ◄── ENUM: ADMIN|PROCTOR|REVIEWER|CANDIDATE
│ created_at        │ ◄── Auto timestamp
│ updated_at        │ ◄── Auto timestamp
└────────────────────┘
         │
         │ user_id (FK)
         ▼
┌────────────────────┐
│     sessions       │
├────────────────────┤
│ id (PK)           │
│ user_id (FK)      │ ◄── References users.id
│ exam_id (FK)      │
│ started_at        │
│ ended_at          │
│ status            │
└────────────────────┘
         │
         │ session_id (FK)
         ▼
┌────────────────────┐
│     incidents      │
├────────────────────┤
│ id (PK)           │
│ session_id (FK)   │ ◄── References sessions.id
│ type              │
│ score             │
│ status            │
│ evidence_url      │
└────────────────────┘
```

## Security Checklist

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ JWT Bearer token required for ALL endpoints              │
│ ✓ Role claim extracted from JWT                            │
│ ✓ @PreAuthorize annotations on controller methods          │
│ ✓ Password hashed with bcrypt before storage               │
│ ✗ NEVER return passwordHash in any DTO                     │
│ ✓ Email validation on create/update                        │
│ ✓ Username uniqueness enforced at DB level                 │
│ ✓ Input sanitization via Bean Validation                   │
│ ✓ SQL injection prevented via JPA                          │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Priority

```
Priority 1 (MVP - Incident Review):
  [1] GET /api/users/{id}       - View candidate details
  [2] POST /api/users/batch     - Efficient batch lookup
  [3] GET /api/users/me         - Current user profile

Priority 2 (Admin Dashboard):
  [4] GET /api/users            - List/search users
  [5] POST /api/users           - Create users
  [6] PUT /api/users/{id}       - Update users
```

## Sample Integration Code

### Frontend - React/TypeScript

```typescript
// API Client
class UserApi {
  async getMe(): Promise<UserProfile> {
    return await api.get('/api/users/me');
  }
  
  async getUserById(userId: string): Promise<UserProfile> {
    return await api.get(`/api/users/${userId}`);
  }
  
  async batchGetUsers(userIds: string[]): Promise<UserBatchResponse> {
    return await api.post('/api/users/batch', { userIds });
  }
  
  async listUsers(filters: UserListFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    params.append('page', filters.page.toString());
    params.append('size', filters.size.toString());
    
    return await api.get(`/api/users?${params}`);
  }
}
```

### Backend - Spring Boot Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<UserProfileDto.Response> getCurrentUser(
        @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userService.findById(userId);
        return ResponseEntity.ok(UserProfileDto.Response.from(user));
    }
    
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCTOR', 'REVIEWER')")
    public ResponseEntity<UserProfileDto.Response> getUserById(
        @PathVariable UUID userId
    ) {
        User user = userService.findById(userId);
        return ResponseEntity.ok(UserProfileDto.Response.from(user));
    }
    
    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCTOR', 'REVIEWER')")
    public ResponseEntity<UserBatchDto.Response> batchGetUsers(
        @Valid @RequestBody UserBatchDto.Request request
    ) {
        UserBatchDto.Response response = userService.findByIds(request.userIds);
        return ResponseEntity.ok(response);
    }
}
```

---

For complete details, see: `docs/USER_API_SPECIFICATION.md`
