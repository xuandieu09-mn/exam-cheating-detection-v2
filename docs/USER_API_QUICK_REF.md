# User API Quick Reference

Quick reference for implementing User Service endpoints.

## Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/users/me` | Any | Get current user profile |
| `GET` | `/api/users/{id}` | ADMIN/PROCTOR/REVIEWER | Get user by ID |
| `POST` | `/api/users/batch` | ADMIN/PROCTOR/REVIEWER | Batch lookup users |
| `GET` | `/api/users` | ADMIN | List users with filters |
| `PUT` | `/api/users/{id}` | ADMIN | Update user |
| `POST` | `/api/users` | ADMIN | Create user |

## Key DTOs

### UserProfileDto.Response
```java
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "role": "ADMIN|PROCTOR|REVIEWER|CANDIDATE",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### UserBatchDto.Request
```java
{
  "userIds": ["uuid1", "uuid2", ...]  // max 100
}
```

### UserBatchDto.Response
```java
{
  "users": [UserProfileDto.Response, ...],
  "notFound": ["uuid", ...]
}
```

## Critical Requirements

1. **NEVER** return `passwordHash` in responses
2. **Batch endpoint** must handle up to 100 IDs efficiently
3. **Search** must be case-insensitive partial match
4. **Authorization** must be enforced via Spring Security
5. **Validation** use Jakarta Bean Validation annotations

## Common Use Case (Proctor Dashboard)

```java
// When displaying incident list, need candidate details:
1. GET /api/incidents → returns list with sessionId
2. For each unique session.userId → collect IDs
3. POST /api/users/batch with collected IDs
4. Map users to incidents for display
```

See full specification: `docs/USER_API_SPECIFICATION.md`
