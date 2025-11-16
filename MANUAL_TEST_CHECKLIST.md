# ✅ MANUAL UI TEST CHECKLIST

Session ID from automated test: **b8fdf6e4-40bf-4427-bae3-613a7a3508c3**

## 🌐 URL to Test
```
http://localhost:5175/mock-exam/11111111-1111-1111-1111-111111111111
```

---

## 📋 STEP-BY-STEP TESTING

### Step 1: Initial Page Load ✅
- [ ] Page loads without errors
- [ ] Loading spinner shows briefly
- [ ] Camera permission dialog appears
- [ ] **Click "Allow"** to grant camera access

### Step 2: UI Elements Verification ✅
- [ ] **Header:** "Demo Exam - Active" title visible
- [ ] **Session ID:** Shows UUID format
- [ ] **Timer:** Displays "45:00" (or slightly less)
- [ ] **Camera:** Video preview in top right corner
- [ ] **REC Badge:** Red "REC" badge on camera
- [ ] **Questions:** 10 questions displayed

### Step 3: Questions Content ✅
- [ ] **Q1-5:** Multiple choice with 4 radio buttons each
- [ ] **Q6-10:** Text questions with textarea
- [ ] All questions numbered correctly (Question 1 - Question 10)

### Step 4: Timer Functionality ✅
- [ ] Timer counts down every second
- [ ] Format: MM:SS (e.g., "44:59", "44:58")
- [ ] Color is black/dark (not red yet)

### Step 5: Camera & Snapshots ✅
- [ ] Open **Developer Tools** (F12)
- [ ] Go to **Network** tab
- [ ] **Wait 6 seconds** (for 2 snapshots)
- [ ] Look for requests to `/api/ingest/snapshots/upload`
- [ ] Verify 2 requests (one every 3 seconds)
- [ ] Check request shows: Status 200 OK
- [ ] Request payload: FormData with file

### Step 6: Tab Switch Detection ✅
**Do this 3 times:**
1. Click address bar and open new tab (Ctrl+T)
2. Go to google.com
3. Go back to exam tab
4. Repeat 2 more times (total: 3 switches)

**Expected Result:**
- [ ] Red alert box appears above questions
- [ ] Text: "**Warning:** X violation(s) detected"
- [ ] Shows tab switch count: "(X tab switches)"
- [ ] Alert stays visible

**Network Tab:**
- [ ] See 3 requests to `/api/ingest/events`
- [ ] Each request has `eventType: "TAB_SWITCH"`

### Step 7: Paste Detection ✅
1. Copy some text (any text)
2. Click in a **textarea** (Q6-Q10)
3. Press Ctrl+V to paste

**Expected Result:**
- [ ] Violation count increases by 1
- [ ] Network tab shows request to `/api/ingest/events`
- [ ] Request body has `eventType: "PASTE_DETECTED"`

### Step 8: Answer Questions ✅
- [ ] Click a radio button in Q1 → selection works
- [ ] Click a radio button in Q2 → selection works
- [ ] Type in textarea Q6 → text appears
- [ ] Type in textarea Q7 → text appears

### Step 9: Submit Exam ✅
1. Scroll to bottom
2. Click **"Submit Exam"** button

**Expected Result:**
- [ ] Confirmation dialog appears
- [ ] Message: "Are you sure you want to submit? You have answered X/10 questions."
- [ ] Click **"OK"**
- [ ] Button text changes to "Submitting..."
- [ ] Button becomes disabled
- [ ] Alert shows: "Exam submitted successfully!"
- [ ] **Page navigates** to `/my-results`

### Step 10: Verify Backend Data ✅

Open PowerShell and run:

```powershell
# Check incidents
Invoke-RestMethod "http://localhost:8080/api/incidents?sessionId=b8fdf6e4-40bf-4427-bae3-613a7a3508c3"

# Expected: TAB_ABUSE incident with score 0.6
```

**Expected Output:**
```json
{
  "type": "TAB_ABUSE",
  "score": 0.6,
  "reason": "Tab switched 11 times in 5 minutes (threshold: 10)",
  "status": "OPEN"
}
```

---

## 🐛 TROUBLESHOOTING

### Camera không bật
- Refresh page
- Grant permission when asked
- Check browser console for errors

### Timer không chạy
- Check browser console
- Verify no JavaScript errors

### Snapshots không upload
- Check Network tab for errors
- Verify backend is running: `docker ps`

### Tab detection không work
- Make sure you **actually switch away from the page**
- Use Ctrl+T to open new tab, not just clicking within same page
- Check Network tab for POST requests

### Submit không navigate
- Check browser console errors
- Verify `/my-results` route exists in App.tsx

---

## ✅ SUCCESS CRITERIA

**All these should be TRUE:**
- ✅ Camera working and taking snapshots
- ✅ Timer counting down
- ✅ Tab switches detected (3+ events)
- ✅ Paste detected (1+ event)
- ✅ Can answer questions
- ✅ Submit with confirmation
- ✅ TAB_ABUSE incident created in backend
- ✅ Navigate to results page

---

## 📊 EXPECTED DATABASE STATE

After completing test:

**Session:** `b8fdf6e4-40bf-4427-bae3-613a7a3508c3`
- Status: ENDED
- Events: ~15-20 (tab switches + paste + focus events)
- Snapshots: ~20-30 (depends on test duration)
- Incidents: 1 (TAB_ABUSE)

---

## 🎉 TEST COMPLETE!

If all checkboxes are ✅ → **MOCK EXAM PAGE WORKS PERFECTLY!**

Ready to proceed to **Week 3: RabbitMQ + Worker + Face Detection** 🚀
