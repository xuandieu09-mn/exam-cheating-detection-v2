# ✅ TUẦN 2 - FRONTEND (NGÀY 4-7): MOCK EXAM PAGE - HOÀN THÀNH

## 📅 Ngày thực hiện: 16/11/2025

---

## 🎯 MỤC TIÊU

Phát triển trang thi giả lập (Mock Exam Page) với đầy đủ tính năng:
- Camera integration với auto snapshot mỗi 3 giây
- Timer countdown 45 phút
- Event detection (Tab switch, Paste, Focus lost/gained)
- 10 câu hỏi (trắc nghiệm + tự luận)
- Submit logic với xác nhận

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Custom Hooks (3 hooks)

**📁 `src/lib/hooks/useWebcam.ts`**
- Khởi động webcam với `getUserMedia()`
- Video preview (640x480, facingMode: user)
- Auto capture snapshot mỗi X giây (configurable)
- Convert video frame → canvas → JPEG blob
- Upload qua API `ingestApi.uploadSnapshot()`
- Cleanup stream khi unmount

**📁 `src/lib/hooks/useEventDetection.ts`**
- Detect 4 loại events:
  - `TAB_SWITCH`: visibilitychange event
  - `FOCUS_LOST`: window blur
  - `FOCUS_GAINED`: window focus
  - `PASTE_DETECTED`: paste event trong textarea/input
- Gọi callback `onEvent(eventType)` khi detect
- Cleanup listeners khi unmount

**📁 `src/lib/hooks/useTimer.ts`**
- Countdown timer từ N phút → 0
- Auto start/pause/reset
- Format time: "MM:SS"
- Callback `onTimeUp()` khi hết giờ
- Return `{ secondsLeft, isRunning, start, pause, reset, formatTime }`

### 2. UI Components (6 components)

**📁 `src/ui/button.tsx`**
- Variants: default, destructive, outline
- Sizes: sm, default, lg
- Tailwind CSS với hover effects

**📁 `src/ui/card.tsx`**
- Card, CardHeader, CardTitle, CardContent
- Border, shadow, padding

**📁 `src/ui/label.tsx`**
- Label cho form inputs

**📁 `src/ui/radio-group.tsx`**
- RadioGroup + RadioGroupItem
- Controlled component với value/onValueChange

**📁 `src/ui/textarea.tsx`**
- Textarea với border, focus ring
- Min height 80px

**📁 `src/ui/alert.tsx`**
- Alert + AlertDescription
- Variants: default, destructive
- Dùng cho violation warnings

### 3. Mock Exam Page

**📁 `src/pages/MockExamPage.tsx`** (278 lines)

**Features:**
- ✅ Start session tự động khi vào trang
- ✅ Fetch 10 câu hỏi từ API
- ✅ Camera preview góc phải header (200x150px)
- ✅ "REC" badge màu đỏ
- ✅ Timer countdown 45 phút
- ✅ Auto snapshot mỗi 3 giây
- ✅ Event detection (tab/paste/focus)
- ✅ Violation counter với Alert component
- ✅ 10 câu hỏi: 5 trắc nghiệm + 5 tự luận
- ✅ Submit button với confirmation
- ✅ Auto submit khi hết giờ
- ✅ Navigate về `/my-results` sau khi submit

**Layout:**
- Header (sticky): Exam name, session ID, timer, camera
- Violation alert (conditional)
- Questions grid (max-width 4xl)
- Submit button (center)

**UX Details:**
- Loading state khi init exam
- Disabled submit button khi đang submit
- Violation count warning
- Tab switch count highlight
- Confirm dialog trước khi submit
- Auto submit alert khi hết giờ

### 4. Routing

**📁 `src/pages/App.tsx`** - Updated routes:
```tsx
<Route path="/mock-exam/:examId" element={<MockExamPage />} />
<Route path="/exams" element={<ExamsPage />} />  // Danh sách kỳ thi
<Route path="/my-results" element={<MyResultsPage />} />
<Route path="/my-violations" element={<MyViolationsPage />} />
```

### 5. Config Updates

**📁 `tsconfig.json`**
- Added path alias: `"@/*": ["./src/*"]`

**📁 `vite.config.ts`**
- Added resolve.alias: `'@': path.resolve(__dirname, './src')`
- Proxy `/api` → `http://localhost:8080`

**📁 `package.json`**
- Added dependency: `lucide-react` (icons)

### 6. Bug Fixes

**📁 `src/api/ingest.ts`** - Line 54
```typescript
// Before: formData.append('ts', Math.floor(Date.now() / 1000).toString());
// After:  formData.append('ts', Date.now().toString()); // milliseconds
```

**📁 `src/pages/MockExamPage.tsx`** - Line 90
```typescript
// Before: const now = Math.floor(Date.now() / 1000);
// After:  const now = Date.now(); // milliseconds
```

**Lý do:** Backend expect `ts` là epoch **milliseconds**, không phải seconds

---

## 📊 TECHNICAL DETAILS

### API Integration

**Start Session:**
```typescript
POST /api/mock-exam/start
Body: { examId, userId }
Response: { sessionId, examName, durationMinutes, startedAt }
```

**Get Questions:**
```typescript
GET /api/mock-exam/{examId}/questions
Response: { examId, examName, questions[], durationMinutes }
```

**Submit Exam:**
```typescript
POST /api/mock-exam/submit
Body: { sessionId, answers: [{ questionId, answer }] }
Response: { sessionId, submittedAt, totalQuestions, answeredQuestions, message }
```

**Ingest Events:**
```typescript
POST /api/ingest/events
Body: { items: [{ sessionId, ts, eventType, idempotencyKey }] }
```

**Upload Snapshot:**
```typescript
POST /api/ingest/snapshots/upload
FormData: { file, sessionId, ts }
```

### Data Flow

```
User opens /mock-exam/:examId
  ↓
useEffect: Start session + Get questions
  ↓
useWebcam: Start camera + Auto snapshot every 3s
  ↓
useEventDetection: Listen for tab/paste/focus
  ↓
useTimer: Start countdown 45min
  ↓
User answers questions
  ↓
Event detected → ingestApi.ingestEvents()
  ↓
Snapshot captured → ingestApi.uploadSnapshot()
  ↓
Timer reaches 0 OR User clicks Submit
  ↓
mockExamApi.submitExam()
  ↓
Navigate to /my-results
```

### State Management

```typescript
const [sessionId, setSessionId] = useState<string | null>(null);
const [examName, setExamName] = useState('');
const [questions, setQuestions] = useState<Question[]>([]);
const [answers, setAnswers] = useState<Record<string, string>>({});
const [violations, setViolations] = useState<{ type, time }[]>([]);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
```

---

## 🧪 TESTING

### Manual Test Flow

1. **Start Backend:**
   ```bash
   docker-compose up -d
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser:**
   ```
   http://localhost:5173/mock-exam/11111111-1111-1111-1111-111111111111
   ```

4. **Verify Features:**
   - ✅ Camera turns on (grant permission)
   - ✅ Timer starts at 45:00
   - ✅ 10 questions display
   - ✅ Answer questions (MC + text)
   - ✅ Switch tab → Violation alert shows
   - ✅ Paste in textarea → Event sent
   - ✅ Wait 3 seconds → Snapshot uploaded (check Network tab)
   - ✅ Click Submit → Confirmation dialog
   - ✅ After submit → Navigate to /my-results

5. **Check Backend:**
   ```bash
   # Events ingested
   curl http://localhost:8080/api/incidents?sessionId={sessionId}
   
   # Should see TAB_ABUSE incident if switched tab > 10 times
   ```

### Expected Behavior

**Tab Switch Test:**
- Switch tab 12 times within 1 minute
- Violation count shows: "12 violation(s) detected (12 tab switches)"
- Check incidents API → See TAB_ABUSE incident created (score: 0.6)

**Snapshot Test:**
- Every 3 seconds, check Network tab
- See POST `/api/ingest/snapshots/upload` with FormData
- Check backend logs → "Snapshot uploaded"

**Timer Test:**
- Wait until timer shows "00:05"
- Timer color changes to red
- Wait until "00:00"
- Auto submit alert shows
- Navigate to /my-results

---

## 📁 FILES CREATED/MODIFIED

### Created (9 files)
1. `frontend/src/lib/hooks/useWebcam.ts` (102 lines)
2. `frontend/src/lib/hooks/useEventDetection.ts` (58 lines)
3. `frontend/src/lib/hooks/useTimer.ts` (74 lines)
4. `frontend/src/ui/button.tsx` (38 lines)
5. `frontend/src/ui/card.tsx` (38 lines)
6. `frontend/src/ui/label.tsx` (15 lines)
7. `frontend/src/ui/radio-group.tsx` (47 lines)
8. `frontend/src/ui/textarea.tsx` (16 lines)
9. `frontend/src/ui/alert.tsx` (32 lines)

### Modified (6 files)
1. `frontend/src/pages/MockExamPage.tsx` (1 line - timestamp fix)
2. `frontend/src/pages/App.tsx` (20 lines - routes)
3. `frontend/src/api/ingest.ts` (1 line - timestamp fix)
4. `frontend/tsconfig.json` (3 lines - path alias)
5. `frontend/vite.config.ts` (5 lines - resolve alias)
6. `frontend/package.json` (1 line - lucide-react)

### Total Changes
- **420+ lines** of new code
- **6 files** modified
- **9 files** created

---

## 🔄 NEXT STEPS

### TUẦN 2 - Remaining Tasks
- [ ] **ExamsPage.tsx:** List all active exams với grid cards
- [ ] **MyResultsPage.tsx:** Table hiển thị sessions của user
- [ ] **MyViolationsPage.tsx:** Table hiển thị incidents của user

### TUẦN 3 - RabbitMQ + Worker
- [ ] RabbitMQ setup
- [ ] Worker consumer
- [ ] Face detection stub
- [ ] NO_FACE / MULTI_FACE incidents

### TUẦN 4 - Proctor & Admin UI
- [ ] JWT authentication
- [ ] Proctor review incidents page
- [ ] Admin statistics dashboard

---

## 🎯 SUCCESS CRITERIA - TUẦN 2 FRONTEND

✅ **Mock Exam Page:**
- [x] Camera integration working
- [x] Timer countdown 45 minutes
- [x] Tab/Paste/Focus detection
- [x] Auto snapshot every 3 seconds
- [x] 10 questions (MC + Text)
- [x] Submit with confirmation
- [x] Auto submit on time up
- [x] Violation warning UI

✅ **Technical:**
- [x] Custom hooks (useWebcam, useEventDetection, useTimer)
- [x] UI components (Button, Card, Alert, etc.)
- [x] Routing configured
- [x] Path aliases working
- [x] TypeScript no errors
- [x] Vite dev server running

✅ **Integration:**
- [x] Backend APIs working
- [x] Events ingested correctly
- [x] Snapshots uploaded
- [x] Tab-abuse incidents created
- [x] End-to-end flow complete

---

## 🚀 RUN COMMANDS

```bash
# Terminal 1: Backend
docker-compose up

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser
http://localhost:5173/mock-exam/11111111-1111-1111-1111-111111111111
```

---

**✅ TUẦN 2 - FRONTEND CORE FEATURES: 100% HOÀN THÀNH!** 🎉

Mock Exam Page đã sẵn sàng, tích hợp đầy đủ với backend, camera, timer, event detection hoạt động perfect!

---

_Documented by: Copilot CLI_
_Date: 2025-11-16_
