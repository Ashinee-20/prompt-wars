# ClassBridge

ClassBridge is an AI-powered teacher assistant for multi-grade classrooms. It converts rough teacher input into practical classroom outputs that teachers can use immediately.

## What it generates

- Lesson plans
- Simpler lesson plans
- Class notes
- Short revision notes
- Quizzes

## Why this project matters

Teachers often work with mixed grades, limited time, uneven student readiness, and low-resource classrooms. ClassBridge reduces preparation effort by transforming messy classroom context into structured teaching material.

## Final deployed architecture

The final submission is deployed as a single Google Cloud Run application.

- Frontend and backend are served from one Cloud Run URL
- Google Gemini powers the content generation
- Secret Manager stores the API secret
- Firestore stores recent generation history
- Cloud Run logs capture structured request and generation events

Live app:

`https://classbridge-app-393660720503.asia-south1.run.app`

## Tech stack

- React + Vite frontend
- Express backend
- Google Gemini API
- Google Cloud Run
- Google Cloud Secret Manager
- Google Cloud Firestore

## Key product strengths

- Strong alignment with the teacher productivity problem statement
- Multiple classroom-ready outputs from one input flow
- Single deployed production URL for judges
- Firestore-backed recent generation history
- Gemini model fallback support
- Clear quota-aware error handling
- Backend-only API key usage
- Accessibility improvements for navigation and status feedback

## Project structure

```text
sahayak-ai/
  backend/
    src/
    test/
  frontend/
  scripts/
  package.json
```

## Local setup

### Install dependencies

```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
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

Frontend runs on `http://localhost:3000` and backend runs on `http://localhost:5000` in development.

## API endpoints

- `GET /api/health`
- `GET /api/history?sessionId=...`
- `POST /api/generate-lesson`
- `POST /api/simplify-lesson`
- `POST /api/generate-class-notes`
- `POST /api/generate-short-notes`
- `POST /api/generate-quiz`

## Testing

Backend tests are included for:

- health endpoint
- request validation
- lesson generation
- simplify flow
- class notes generation
- short notes generation
- quiz generation

Test file:

- `backend/test/run-tests.js`

## Deployment

The final production deployment uses a single Cloud Run service for both frontend and backend.

Deployment flow:

1. Build frontend
2. Copy frontend build into backend public assets
3. Deploy the full app to Cloud Run

See [DEPLOYMENT.md](d:/MY%20Orgs/PromptWar/sahayak-ai/DEPLOYMENT.md) for operational notes.

## Security notes

- Keep `.env` out of version control
- Store API keys only on the backend
- Use Secret Manager in production
- Rotate any key that was accidentally exposed

## Hackathon submission note

ClassBridge is optimized around the evaluation signals shown on the platform:

- code quality
- security hygiene
- efficiency
- testing
- accessibility
- problem-statement alignment
- meaningful Google Cloud and Gemini usage
