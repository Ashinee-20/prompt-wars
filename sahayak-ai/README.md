# ClassBridge

ClassBridge is an AI-powered teacher assistant for multi-grade classrooms. It converts rough teacher input into practical classroom outputs that can be used immediately.

## What it generates

- Lesson plans
- Simpler lesson plans
- Class notes
- Short revision notes
- Quizzes

## Why this project matters

Teachers often work with mixed grades, limited time, uneven student readiness, and low-resource classrooms. ClassBridge helps reduce preparation time by turning messy classroom context into structured teaching material.

## Tech stack

- React + Vite frontend
- Express backend
- Google Gemini API
- Firebase Hosting for frontend
- Cloud Run / Render / Railway suitable for backend

## Key product strengths

- Strong alignment with the teacher productivity problem statement
- Multiple classroom-ready outputs from one input flow
- Mobile-friendly UI
- Gemini model fallback support
- Clear quota-aware error handling
- Backend-only API key usage

## Project structure

```text
sahayak-ai/
  backend/
  frontend/
  firebase.json
  package.json
```

## Local setup

### Install dependencies

```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
npm install

cd backend
npm install

cd ../frontend
npm install
```

### Backend environment

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
GEMINI_MODELS=gemini-2.5-flash-lite,gemini-2.0-flash-lite,gemini-2.5-flash
```

### Run locally

```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
npm run dev
```

Frontend runs on `http://localhost:3000` and backend runs on `http://localhost:5000`.

## API endpoints

- `GET /api/health`
- `POST /api/generate-lesson`
- `POST /api/simplify-lesson`
- `POST /api/generate-class-notes`
- `POST /api/generate-short-notes`
- `POST /api/generate-quiz`

## Deployment

Frontend should be deployed from `sahayak-ai` using Firebase Hosting.

Backend should be deployed separately on Cloud Run, Render, or Railway.

For production frontend builds, set:

```env
VITE_API_URL=https://your-backend-url
```

See [DEPLOYMENT.md](d:/MY%20Orgs/PromptWar/sahayak-ai/DEPLOYMENT.md) for deployment details.

## Security notes

- Keep `.env` out of version control
- Store API keys only on the backend
- Rotate any key that was accidentally exposed

## Hackathon submission note

ClassBridge is optimized around evaluation signals such as code quality, security hygiene, accessibility basics, efficiency, problem-statement alignment, and practical Google AI usage.
