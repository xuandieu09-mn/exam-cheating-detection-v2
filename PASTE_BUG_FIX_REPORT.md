# PASTE Rule Bug Fix Report

## Issue Summary
**Problem**: PASTE violations were not being persisted to the database, even though they appeared correctly in the real-time UI during exams.

**Root Cause**: The Docker backend container was running an outdated JAR file (built Nov 18) that lacked the PASTE rule evaluation code added on Nov 20.

## Timeline

### Build vs Code Mismatch
- **Container Built**: November 18, 2025 at 19:11 UTC
- **Code Last Modified**: November 20, 2025 at 23:35 (RuleService.java)
- **Gap**: 2+ days of code changes not reflected in running container

### Investigation Steps

1. **Confirmed TAB_ABUSE rule works** - Created test session and sent 12 TAB_SWITCH events
   - Result: ✅ TAB_ABUSE incident created successfully
   - This proved Redis connectivity and rule engine were functional

2. **Confirmed PASTE rule fails** - Created test session and sent 5 PASTE events
   - Result: ❌ No PASTE incident created
   - Events were saved to database, but no incident triggered

3. **Checked running code** - Examined git history
   - Found that `evaluatePaste()` call in IngestService.java was added after container build
   - Commit: `197f5cf - Completed Frontend-Candidate`

4. **Rebuilt container** - Ran `docker-compose build backend`
   - Maven compilation: ~19 seconds
   - Total build time: ~29 seconds
   - New image created with latest code

5. **Restarted backend** - Ran `docker-compose up -d backend`
   - Container recreated with new image
   - Backend started successfully in ~14 seconds

6. **Verified fix** - Created fresh session and sent 5 PASTE events
   - Result: ✅ PASTE incident created after 4th event
   - Score: 0.93 (expected based on threshold logic)
   - Reason: "Pasted 4 times in 2 minutes (threshold: 3)"

## Technical Details

### PASTE Rule Logic (RuleService.java)
```java
// Threshold: 3 pastes
private static final int PASTE_THRESHOLD = 3;
private static final int PASTE_WINDOW_MINUTES = 2;

// Triggers when count > 3 (4th paste onwards)
if (count != null && count > PASTE_THRESHOLD) {
    createPasteIncident(sessionId, ts, count.intValue());
}
```

### Score Calculation
```java
// Linear scale: 4 pastes = 0.6, 6+ pastes = 1.0
double score = Math.min(1.0, (count - PASTE_THRESHOLD) / 3.0 + 0.6);
```

### Integration Point (IngestService.java)
```java
// Added after container build
if (item.eventType == EventType.TAB_SWITCH) {
    ruleService.evaluateTabSwitch(sessionId, Instant.ofEpochMilli(item.ts));
} else if (item.eventType == EventType.PASTE) {  // <-- This was missing
    ruleService.evaluatePaste(sessionId, Instant.ofEpochMilli(item.ts));
}
```

## Database Verification

### Before Fix
```sql
SELECT COUNT(*) FROM incidents WHERE type='PASTE';
-- Result: 0 (despite having 500+ PASTE events)
```

### After Fix
```sql
SELECT type, score, reason 
FROM incidents 
WHERE session_id='45075463-5082-4409-a992-dfdae3ba4827';

-- Result:
-- type  | score | reason
-- PASTE | 0.93  | Pasted 4 times in 2 minutes (threshold: 3)
```

## Cleanup Script Status

The `cleanup-all-test-data.ps1` script works correctly but old exam history persists because:
1. The script references `sql\cleanup-test-data.sql` (project root)
2. The actual migrations are in `backend/src/main/resources/db/migration/`
3. Seeded exams come from Flyway migrations V6 and V7
4. The cleanup script correctly removes sessions/events/incidents but preserves seed data

**Note**: This is by design - production seed data should be preserved.

## Frontend Integration

### My Results Page (`MyResultsPage.tsx`)
The page correctly:
1. Fetches user sessions via `/api/sessions/user/{userId}`
2. Loads incidents count via `/api/incidents?sessionId={id}`
3. Displays violations in detail modal
4. Shows real-time badges (PASTE, BLUR, TAB_SWITCH)

### API Endpoints Verified
- ✅ `GET /api/incidents?sessionId={id}` - Returns incidents array
- ✅ `GET /api/sessions/user/{userId}` - Returns user sessions
- ✅ `POST /api/ingest/events` - Ingests events and evaluates rules

## Resolution

**Action Taken**: Rebuilt and restarted backend container

**Commands**:
```powershell
docker-compose build backend  # ~29s
docker-compose up -d backend  # ~2s
```

**Status**: ✅ **RESOLVED** - PASTE violations now persist correctly

## Testing Evidence

### Test Session: `45075463-5082-4409-a992-dfdae3ba4827`
- Events sent: 5 PASTE events (1 second apart)
- Incident created: After 4th event
- Timestamp: 2025-11-22T19:26:38.426786Z
- Score: 0.93
- Status: OPEN

### Redis Integration
- TAB_SWITCH counter: ✅ Working
- PASTE counter: ✅ Working (after fix)
- Incident deduplication locks: ✅ Working

## Recommendations

1. **Always rebuild after code changes**:
   ```powershell
   docker-compose build backend
   docker-compose up -d backend
   ```

2. **Verify container build date**:
   ```powershell
   docker inspect exam-cheating-detection-v2-backend-1 --format='{{.Created}}'
   ```

3. **Compare with code modification time**:
   ```powershell
   (Get-Item "path\to\file.java").LastWriteTime
   ```

4. **Add CI/CD checks**: Ensure container images are rebuilt on every commit

## Database Migrations

The project uses Flyway migrations located in `backend/src/main/resources/db/migration/`:
- V1: Initial schema
- V2: Dev seed data (in db/dev/)
- V3: Events details as TEXT
- V4: Unique constraints on events
- V5: Verify constraints
- V6: Seed active exams
- V7: Fix active exam times

## Related Files
- `backend/src/main/java/com/example/exam/service/RuleService.java` - PASTE rule logic
- `backend/src/main/java/com/example/exam/service/IngestService.java` - Event processing
- `frontend/src/pages/roles/MyResultsPage.tsx` - Results display
- `cleanup-all-test-data.ps1` - Test data cleanup script
- `backend/src/main/resources/db/migration/` - Flyway migrations

---

**Fixed By**: AI Assistant  
**Date**: November 22, 2025  
**Time Spent**: ~15 minutes investigation + 2 minutes rebuild  
**Status**: ✅ COMPLETE
