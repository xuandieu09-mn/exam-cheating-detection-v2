# Docker Issues - Resolution Summary

## Issue 1: Port 8080 Conflict ✅ RESOLVED

### Problem
```
backend (8080:8080) <-- Status: Not running/Issue
bff-gateway (8080:8080) <-- Status: Running
```

**Root Cause:** Orphan container `exam-cheating-detection-v2-backend-1` from old configuration was holding port 8080, preventing proper operation.

### Solution Applied
```bash
# Removed the orphan container
docker rm exam-cheating-detection-v2-backend-1
```

### Technical Explanation
- The `backend` service **does not exist** in the current `docker-compose.yml`
- Only `bff-gateway` is the legitimate service on port 8080
- The orphan was from an old/deprecated configuration
- No port reassignment was needed - the conflict was resolved by cleanup

### Frontend Impact Analysis
**Question:** How does this affect Frontend connectivity?

**Answer:** ✅ **No negative impact - Everything works correctly**

The frontends are properly configured to connect to BFF Gateway on port 8080:

**Admin UI Configuration:**
```javascript
// frontends/admin-ui/src/App.jsx
const BFF_URL = import.meta.env.VITE_BFF_URL ?? 'http://localhost:8080';
```

**Exam UI Configuration:**
```yaml
# docker-compose.yml
exam-ui:
  depends_on:
    bff-gateway:
      condition: service_started
```

**Architecture Flow:**
```
Frontend (Admin UI: 5173, Exam UI: 5174)
    ↓
BFF Gateway (8080) ← Only service on this port
    ↓
Backend Services (User: 8100, Admin: 8200, Session: 8081, Auth: 9000)
```

---

## Issue 2: Missing Public Folder Build Error ✅ RESOLVED

### Problem
```
failed to compute cache key: failed to calculate checksum of ref ...: 
"/app/public": not found

Dockerfile:16
>>> COPY --from=build /app/public ./public
```

### Root Cause
The BFF Gateway (Next.js app) **does not have a `public` folder** in its structure:

**Actual BFF Structure:**
```
gateways/bff/
├── Dockerfile
├── lib/              ← Exists
├── next.config.mjs
├── package.json
├── pages/            ← Exists
└── README.md
```

### Solution Applied
**Modified:** `gateways/bff/Dockerfile`

**Before (Broken):**
```dockerfile
# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/next.config.mjs ./
COPY --from=build /app/public ./public  # ❌ This folder doesn't exist!
EXPOSE 8080
CMD ["npm", "start"]
```

**After (Fixed):**
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/next.config.mjs ./
COPY pages ./pages          # ✅ Copy actual directories
COPY lib ./lib              # ✅ Copy actual directories
EXPOSE 8080
CMD ["npm", "start"]
```

### Changes Made
1. ✅ Removed non-existent `public` folder reference
2. ✅ Added `pages` directory (contains Next.js routes)
3. ✅ Added `lib` directory (contains utilities)
4. ✅ Ensured `npm run build` runs during build stage

### Build Verification
```bash
# Rebuild successful
docker-compose up -d --build bff-gateway

# Service started successfully
✓ Ready in 1688ms
```

---

## Current Service Status - All Running ✅

| Service | Container | Port | Status | Health |
|---------|-----------|------|--------|--------|
| PostgreSQL | exam-postgres | 55432→5432 | ✅ Running | Healthy |
| Redis | exam-redis | 6379→6379 | ✅ Running | Healthy |
| RabbitMQ | exam-rabbitmq | 5672, 15672 | ✅ Running | Healthy |
| OTEL Collector | otel-collector-1 | 4318→4318 | ✅ Running | Running |
| **BFF Gateway** | **exam-bff** | **8080→8080** | ✅ **Running** | **Ready** |
| Auth Server | exam-auth-server | 9000→9000 | ✅ Running | Running |
| User Service | exam-user-service | 8100→8100 | ✅ Running | Running |
| Admin Service | exam-admin-service | 8200→8200 | ✅ Running | Running |
| Session Service | exam-session-service | 8081→8081 | ✅ Running | Running |
| Admin UI | exam-admin-ui | 5173→80 | ✅ Running | Running |
| Exam UI | exam-ui | 5174→80 | ✅ Running | Running |

---

## Verification Commands

```bash
# Check all services
docker-compose ps

# Test BFF Gateway
curl http://localhost:8080

# Test Admin UI
curl http://localhost:5173

# Test Exam UI
curl http://localhost:5174

# View BFF logs
docker-compose logs -f bff-gateway

# Restart all services
docker-compose restart
```

---

## Summary

### ✅ Issue 1 - Port Conflict
- **Resolution:** Removed orphan backend container
- **Impact:** None - frontends already correctly configured
- **Status:** ✅ Resolved

### ✅ Issue 2 - Build Error
- **Resolution:** Fixed Dockerfile to copy existing directories
- **Impact:** BFF Gateway now builds and runs successfully
- **Status:** ✅ Resolved

### 🎯 Final Result
**All 11 services running successfully with no conflicts!**
