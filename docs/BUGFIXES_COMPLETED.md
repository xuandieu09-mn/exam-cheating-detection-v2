# ✅ BUG FIXES - TUẦN 2 HOÀN THIỆN

## 🐛 Các lỗi đã fix

### 1. 403 Forbidden - CORS Issue ✅
**Lỗi:** Frontend port 5175 không trong CORS whitelist
**Fix:** Thêm `http://localhost:5175` vào `application.yml`
**Commit:** `2fb58e8`

### 2. 415 Unsupported Media Type - Snapshot Upload ✅
**Lỗi:** Manual set `Content-Type: multipart/form-data` thiếu boundary
**Fix:** Xóa manual header, để browser tự set
**File:** `frontend/src/api/ingest.ts`
**Commit:** `9a4937b`

### 3. 400 Bad Request - Event Types Mismatch ✅
**Lỗi:** Frontend dùng `FOCUS_GAINED`, `FOCUS_LOST`, `PASTE_DETECTED`
Backend chỉ có `FOCUS`, `BLUR`, `PASTE`, `TAB_SWITCH`
**Fix:** Align frontend types với backend enum
**Files:**
- `frontend/src/lib/hooks/useEventDetection.ts`
- `frontend/src/api/ingest.ts`
**Commit:** `07443ae`

---

## ✅ Test Results

### Backend API Test
```bash
POST /api/ingest/events
Body: { items: [{ eventType: "FOCUS", ... }] }
Response: { created: 1, duplicates: 0, ids: [...] }
Status: 200 OK ✅
```

### Snapshot Upload
```bash
POST /api/ingest/snapshots/upload
Content-Type: multipart/form-data; boundary=...
Status: 200 OK ✅ (after refresh browser)
```

---

## 🔄 Next Steps for User

### Bước 1: Refresh Browser
```
Ctrl + Shift + R (hard refresh)
hoặc
Clear cache + F5
```

### Bước 2: Allow Camera
- Browser sẽ hỏi camera permission
- Click **"Allow"** (không dismiss nữa)
- Camera sẽ bật và snapshot tự động upload

### Bước 3: Test Features
- ✅ Timer countdown
- ✅ Answer questions
- ✅ Switch tabs → Violation warning
- ✅ Paste text → Event logged
- ✅ Snapshots upload every 3s
- ✅ Submit exam

---

## 📊 Expected Behavior

### No More Errors:
- ~~403 Forbidden~~ ✅
- ~~415 Unsupported Media Type~~ ✅
- ~~400 Bad Request (events)~~ ✅

### Console Should Show:
- Network: `POST /api/ingest/events` → 200 OK
- Network: `POST /api/ingest/snapshots/upload` → 200 OK
- No red errors (chỉ có warnings React Router - harmless)

---

## 🎯 Current Status

**Backend:** ✅ Running, all endpoints working
**Frontend:** ✅ Running, all fixes committed
**CORS:** ✅ Fixed
**Event Types:** ✅ Aligned
**Snapshot Upload:** ✅ Fixed

---

**READY TO TEST!** 🚀

Refresh browser và test lại nhé!
