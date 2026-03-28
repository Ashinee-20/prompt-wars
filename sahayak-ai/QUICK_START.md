# 🚀 Quick Start Guide for ClassBridge

## 5 Minutes to Running ClassBridge

### Step 1: Install Node Modules (2 min)
```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
npm install
```

### Step 2: Start Backend (1 min)
```bash
cd backend
npm install
npm run dev
```
✅ You should see: `🎓 ClassBridge Backend Running on http://localhost:5000`

### Step 3: Start Frontend (1 min)
```bash
cd ../frontend
npm install
npm run dev
```
✅ You should see: `VITE v5.x.x ready in xxx ms`

### Step 4: Open in Browser
Go to: **http://localhost:3000**

---

## 🧪 Test It Out

1. Copy & paste this in the text area:
   ```
   I have class 3 and 5 together, topic is fractions, students are weak, I have 30 minutes and no materials
   ```

2. Click **✨ Generate Lesson Plan**

3. Wait 1-2 seconds... You'll get a beautiful lesson plan! 🎉

---

## 📂 What's What

| Folder | Purpose |
|--------|---------|
| `backend/src/index.js` | Express server + Gemini API |
| `frontend/src/App.jsx` | Main React component |
| `frontend/src/components/` | UI components (Input, Loading, Display) |
| `backend/.env` | API key (already configured) |

---

## 🎯 Key Files to Know

### Backend `index.js`
- `POST /api/generate-lesson` - Creates lesson plan using Gemini
- `POST /api/simplify-lesson` - Simplifies the plan
- `POST /api/translate-lesson` - Translates to other languages

### Frontend Components
- `InputSection.jsx` - Text input + example buttons
- `Loading.jsx` - Spinner while generating
- `LessonPlanDisplay.jsx` - Shows structured results + action buttons

---

## ✅ Checklist Before Deploying

- [ ] Test all 3 example inputs
- [ ] Try "Regenerate Simpler" button
- [ ] Try translating to at least one language
- [ ] Test on mobile device/responsive view
- [ ] Check API response times (<2 seconds)
- [ ] Verify error handling (test with empty input)

---

## 🔥 Deploy to Firebase (3-5 min)

```bash
# 1. Install Firebase CLI (one-time)
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Build frontend
npm run build:frontend

# 4. Deploy
firebase deploy
```

Your app lives at: `https://classbridge-ai.web.app` ✨

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Port 5000 already in use | Kill the process: `lsof -i :5000` then `kill -9 <PID>` |
| "Cannot find module '@google/generative-ai'" | Run `npm install` in backend folder |
| CORS error | Make sure backend is running on 5000 |
| Blank page | Check browser console (F12) for errors |

---

## 🎓 Next Steps

1. ✅ Run locally and test
2. ✅ Try all features (simplify, translate)
3. ✅ Deploy to Firebase
4. ✅ Share with teachers!

---

That's it! You're ready to ship ClassBridge! 🚀
