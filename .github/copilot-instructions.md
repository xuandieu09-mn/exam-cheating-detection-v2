# Exam Cheating Detection System - AI Agent Instructions

## Architecture Overview

**Three-tier system for real-time exam proctoring:**
- **Frontend**: React (Vite) + TypeScript - candidate exam UI with webcam/telemetry capture
- **Backend**: Spring Boot 3.2 (Java 17) - REST API with async processing  
- **Infrastructure**: PostgreSQL + Redis + RabbitMQ (orchestrated via Docker Compose)

**Key data flow:**
1. Browser captures webcam snapshots → API ingests synchronously + queues for async face detection
2. Browser events (tab switches, paste) → API evaluates rules in Redis time-windows
3. Violations trigger incidents → Reviewers confirm/reject via admin UI
4. RabbitMQ worker processes images, updates `face_count`, creates NO_FACE/MULTI_FACE incidents

## Critical Developer Workflows

### Starting the System
```powershell
# Full stack (requires Docker)
docker-compose up -d
# Wait 30s for healthchecks, verify: docker ps

# Backend only (local dev)
cd backend
mvn spring-boot:run  # Runs with -Duser.timezone=UTC and spring.profiles.active=dev
```

**Environment config:**
- Dev: `backend/src/main/resources/application.yml` (localhost:55432 for Postgres)
- Docker: `docker-compose.yml` environment vars override application.yml
- Auth disabled by default: `security.require-auth=false`

### Running Tests
```powershell
# Tab-abuse rule (integration test)
.\test-tab-abuse.ps1  # Expects: TAB_ABUSE incident after 11 events/5min

# Backend unit tests (UTC timezone required)
cd backend
mvn test  # maven-surefire-plugin sets -Duser.timezone=UTC
```

## Project-Specific Conventions

### Idempotency Pattern
All ingest endpoints require `idempotencyKey` to prevent duplicate processing:
```java
// events table
UNIQUE(session_id, ts, event_type)  
UNIQUE(idempotency_key)

// Frontend generates keys
const key = `${sessionId}-${eventType}-${timestamp}`;
```

### Redis Time-Window Rules
Rules use **per-minute keys** with auto-expiration (see `RuleService.java`):
```java
// Key pattern: session:{sessionId}:tabswitch:{epochSecond/60}
Long count = redisTemplate.opsForValue().increment(redisKey);
redisTemplate.expire(redisKey, Duration.ofMinutes(WINDOW_MINUTES + 1));

// Prevent duplicate incidents
String lockKey = "session:{sessionId}:tababuse:incident:{minute}";
Boolean created = redisTemplate.setIfAbsent(lockKey, "1", ttl);
```

**Thresholds:**
- TAB_SWITCH: >10/5min → TAB_ABUSE (score: 0.5-1.0)
- PASTE: >3/2min → PASTE (score: 0.6-1.0)

### Async Snapshot Processing
Synchronous ingest + asynchronous face detection:
```java
// IngestController
snapshotRepository.save(snapshot);  // Write metadata immediately
rabbitTemplate.convertAndSend(QUEUE, new SnapshotMessage(id, sessionId));
return 200 OK;

// FaceDetectionWorker (separate service)
@RabbitListener(queues = "snapshot.process")
void processSnapshot(SnapshotMessage msg) {
    int faceCount = detectFaces(objectKey);  // Stubbed as random 0/1/2
    snapshot.setFaceCount(faceCount);
    if (faceCount != 1) createIncident(NO_FACE or MULTI_FACE);
}
```

### Security Configuration
JWT RS256 resource server with **optional authentication**:
```java
@Value("${security.require-auth:false}")
boolean requireAuth;

// When false: all endpoints permit-all (local dev)
// When true: /api/admin/** requires ROLE_ADMIN, /api/** requires ROLE_USER
// Always public: /swagger-ui/**, /actuator/health
```

Frontend uses axios interceptor to attach `Authorization: Bearer {token}` when available.

### CORS Setup
Allows multiple local dev ports via comma-separated env var:
```yaml
cors:
  allowed-origins: "http://localhost:3000,http://localhost:5173,http://localhost:5174"
# Override: CORS_ALLOWED_ORIGINS=http://localhost:8000
```

## File Storage Pattern
Media stored as volume-mounted files, DB holds metadata only:
```java
// MediaStorageService
@Value("${media.upload-dir:/app/uploads}")
Path uploadDir;

// Path: /app/uploads/{sessionId}/YYYY/MM/DD/{uuid}.jpg
snapshot.setObjectKey(relativePath);  // DB stores key, not full path
```

## Database Management

**Schema initialization:**
- `sql/schema.sql` creates tables with enums (run manually in dev)
- `sql/seed.sql` inserts 3 exams + 2 users (dev data)
- Production: Flyway migrations in `backend/src/main/resources/db/migration/`

**Enum types:** `user_role`, `session_status`, `event_type`, `incident_type`, `incident_status`, `review_status`

**Composite uniques for idempotency:**
```sql
-- events
UNIQUE(session_id, ts, event_type)
-- media_snapshots  
UNIQUE(session_id, ts)
-- Both also have idempotency_key unique constraint
```

## Frontend Patterns

### API Client Pattern
Singleton `ApiClient` class with axios instance and interceptors:
```typescript
// src/api/client.ts
const apiClient = new ApiClient();
apiClient.setToken(token);  // Persists to localStorage

// Specialized API modules re-export client
// src/api/mockExam.ts
export const mockExamApi = { ... };
```

### Custom Hooks for Exam Page
- `useWebcam`: Captures snapshots at intervals, converts blob→base64
- `useEventDetection`: Listens for tab blur/paste events, debounces
- `useTimer`: Countdown with auto-submit

**Example from `MockExamPage.tsx`:**
```tsx
const { videoRef } = useWebcam({
  onSnapshot: async (blob) => await ingestApi.uploadSnapshot(sessionId, blob),
  captureInterval: 3000,  // 3 seconds
  enabled: !!sessionId && !submitting
});
```

## Testing Infrastructure

### E2E Test Scripts (PowerShell)
Located in project root, test full workflows:

- `test-tab-abuse.ps1`: Creates session → sends 12 TAB_SWITCH events → verifies incident
- `test-e2e-mock-exam.ps1`: Full exam flow with snapshots
- `test-rabbitmq-worker.ps1`: Worker processing validation

**Pattern:**
```powershell
# Start session
$response = Invoke-RestMethod -Uri "$baseUrl/api/mock-exam/start" -Method POST
$sessionId = $response.sessionId

# Verify with Redis CLI
docker exec exam-redis redis-cli --scan --pattern "session:$sessionId*"
```

## Common Pitfalls

1. **Timezone issues**: Always run with `TZ=UTC` / `-Duser.timezone=UTC` (Postgres rejects "Asia/Saigon")
2. **Maven plugins configured wrong**: `spring-boot-maven-plugin` sets default profile to `dev`
3. **Idempotency keys must be unique**: Use `${sessionId}-${eventType}-${timestamp}` pattern
4. **Docker healthchecks required**: Backend waits for Postgres/Redis/RabbitMQ healthy status
5. **Face detection is stubbed**: `FaceDetectionWorker.detectFaces()` returns random 0/1/2 for demo

## Key Files to Reference

- **Backend entry**: `backend/src/main/java/com/example/exam/ExamApplication.java`
- **Rule engine**: `backend/src/main/java/com/example/exam/service/RuleService.java`
- **Worker**: `backend/src/main/java/com/example/exam/service/FaceDetectionWorker.java`
- **Security config**: `backend/src/main/java/com/example/exam/config/SecurityConfig.java`
- **Schema**: `sql/schema.sql` (215 lines - includes views and indexes)
- **Docker orchestration**: `docker-compose.yml` (4 services: postgres, redis, rabbitmq, backend)
- **Frontend exam UI**: `frontend/src/pages/MockExamPage.tsx`

## Documentation

- `docs/architecture.md`: Mermaid diagrams, observability, RBAC design
- `docs/requirements.md`: Business requirements (not in workspace context but referenced)
- `QUICK_START.md`: 5-step verification guide after setup
- `docs/postman/`: Postman collection for manual API testing
