# 🧪 QUICK TEST GUIDE - PASTE BUG FIX VERIFICATION

**Date:** November 22, 2025  
**Bug Fixed:** PASTE event not displaying in UI  
**Status:** ✅ Ready to test

---

## 🚀 STEP 1: CLEAN DATABASE

```powershell
# Run cleanup script (cleans DB + Redis + RabbitMQ)
.\cleanup-all-test-data.ps1

# Press 'y' when asked about deleting uploaded files
```

**Expected output:**
```
[1/4] Cleaning PostgreSQL database... ✅
[2/4] Flushing Redis cache... ✅
[3/4] Purging RabbitMQ queues... ✅
[4/4] Removing uploaded snapshot files... ✅

CLEANUP COMPLETE!
```

---

## 🚀 STEP 2: START FRONTEND

```powershell
cd frontend
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal running!**

---

## 🚀 STEP 3: OPEN BROWSER & LOGIN

1. Open browser: `http://localhost:5173`
2. Click **"Login as CANDIDATE"**
3. Navigate to **"Kỳ thi"** (Exams) from sidebar

---

## 🚀 STEP 4: START EXAM

1. Find **"Demo Exam - Active"** card
2. Click **"Bắt đầu thi"** button
3. Allow camera when prompted
4. Wait for exam page to load

**Expected:**
- ✅ Timer shows "45:00" (counting down)
- ✅ Camera preview in top-right corner with "REC" badge
- ✅ 10 questions displayed (Q1-Q5 multiple choice, Q6-Q10 text)
- ✅ No warnings yet

---

## 🧪 STEP 5: TEST PASTE DETECTION (THE FIX!)

1. **Click into a textarea** (Q6, Q7, Q8, Q9, or Q10)
2. **Copy some text** (any text from anywhere)
3. **Paste 4 times** (Ctrl+V four times in the same textarea)

**Expected UI behavior:**

**After 1st paste:**
```
⚠️ Warning: 1 violation(s) detected
[1 Paste] ← Red badge
```

**After 2nd paste:**
```
⚠️ Warning: 2 violation(s) detected
[2 Pastes] ← Red badge
```

**After 3rd paste:**
```
⚠️ Warning: 3 violation(s) detected
[3 Pastes] ← Red badge
```

**After 4th paste:**
```
⚠️ Warning: 4 violation(s) detected
[4 Pastes] ← Red badge
```

**✅ THIS IS THE FIX! Before, it would NOT show the paste count!**

---

## 🧪 STEP 6: TEST TAB SWITCH DETECTION

1. **Switch to a different tab** (Ctrl+T to open new tab)
2. **Go to any website** (e.g., google.com)
3. **Switch back to exam tab**
4. **Repeat 2 more times** (total: 3 tab switches)

**Expected UI behavior:**

**After 3 tab switches + 4 pastes:**
```
⚠️ Warning: 7 violation(s) detected
[3 Tab Switches] ← Orange badge
[4 Pastes] ← Red badge
```

**✅ NOW BOTH TYPES ARE SHOWN WITH COLOR-CODED BADGES!**

---

## 🧪 STEP 7: VERIFY BACKEND INCIDENTS

**Open PowerShell (new terminal):**

```powershell
# Get your session ID from browser console (F12 → Console)
# Or check the URL, it should be in the exam page

# Check incidents API
Invoke-RestMethod "http://localhost:8080/api/incidents?sessionId=YOUR_SESSION_ID_HERE" | ConvertTo-Json -Depth 5
```

**Expected output:**

```json
[
  {
    "type": "PASTE",
    "ts": 1732295400000,
    "score": 0.73,
    "reason": "Pasted 4 times in 2 minutes (threshold: 3)",
    "status": "OPEN"
  }
]
```

**Note:** 
- PASTE incident appears after 4th paste (threshold is 3)
- TAB_ABUSE incident appears after 11th tab switch (threshold is 10)

---

## ✅ SUCCESS CRITERIA

### UI Test (Frontend):
- [x] Warning appears after 1st paste
- [x] Paste count increments with each paste
- [x] Red badge shows "X Paste(s)"
- [x] Orange badge shows "X Tab Switch(es)" when you switch tabs
- [x] Both badges appear together when both events occur
- [x] Singular/plural grammar is correct (1 Paste, 2 Pastes)

### Backend Test:
- [x] PASTE incident created after 4th paste
- [x] Incident has correct score (0.6-1.0 range)
- [x] Incident has correct reason text
- [x] Incident status is OPEN

---

## 🎨 VISUAL REFERENCE

**Before Fix:**
```
⚠️ Warning: 7 violation(s) detected (3 tab switches)
```
❌ Missing paste count! User doesn't see 4 pastes!

**After Fix:**
```
⚠️ Warning: 7 violation(s) detected
┌─────────────────┐  ┌─────────┐
│ 3 Tab Switches  │  │ 4 Pastes│
│  (orange bg)    │  │ (red bg)│
└─────────────────┘  └─────────┘
```
✅ Clear visual breakdown of all violation types!

---

## 🐛 TROUBLESHOOTING

### Paste not detected?
- Make sure you're pasting **into a textarea or input**
- Try pasting into Q6-Q10 (essay questions)
- Check browser console (F12) for errors

### Badge not showing?
- Make sure frontend is rebuilt (npm run dev picks up changes)
- Hard refresh browser (Ctrl+Shift+R)
- Check React DevTools for violations state

### Backend incident not created?
- You need **MORE than 3 pastes** to create incident
- Paste 4 times to trigger PASTE incident
- Wait 5 seconds after 4th paste, then check API

### Camera not working?
- Grant camera permission when prompted
- If blocked, click lock icon in address bar → allow camera
- Refresh page after granting permission

---

## 📊 TESTING MATRIX

| Action | UI Expected | Backend Expected |
|--------|-------------|------------------|
| 1 paste | 1 violation, 1 red badge | Event saved, no incident yet |
| 2 pastes | 2 violations, 1 red badge | 2 events saved, no incident yet |
| 3 pastes | 3 violations, 1 red badge | 3 events saved, no incident yet |
| **4 pastes** | 4 violations, 1 red badge | **PASTE incident created** |
| 1 tab switch | +1 violation, 1 orange badge | Event saved, no incident yet |
| 11 tab switches | 11 orange badge count | **TAB_ABUSE incident created** |

---

## 🎯 WHAT YOU'RE TESTING

1. **Frontend Event Detection** - Does the hook detect paste?
2. **API Communication** - Are events sent to backend?
3. **UI Display** - Do badges show correctly? ← **THE BUG FIX**
4. **Backend Rule Evaluation** - Are incidents created at thresholds?
5. **Data Integrity** - Are events saved without duplicates?

---

## ✅ DONE!

If all tests pass, the PASTE bug is **VERIFIED FIXED** and your system is ready for continued development.

**Next:**
- Continue with Week 4 (JWT authentication + Proctor/Admin UI)
- Keep the face detection stub (it's working as designed)
- Use cleanup script before each test session

---

**Happy Testing! 🚀**
