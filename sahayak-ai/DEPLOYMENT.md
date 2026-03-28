# ClassBridge Deployment Guide

## Important

Run Firebase commands from:

```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
```

Do not run `firebase init` from `d:\MY Orgs\PromptWar`, because the app, `firebase.json`, and `.firebaserc` are inside `sahayak-ai`.

## What To Deploy

- Frontend: Firebase Hosting
- Backend: separate Node hosting such as Render, Cloud Run, or Railway

Firebase Hosting cannot call your local `http://localhost:5000` backend after deployment, so production must use a real backend URL.

## Current App Features

- Lesson plan generator
- Simplified lesson plan regeneration
- Class notes generator
- Short notes generator
- Quiz generator

## Local Development

### 1. Install dependencies

```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
npm install

cd backend
npm install

cd ../frontend
npm install
```

### 2. Backend environment

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
GEMINI_MODEL=gemini-2.0-flash
```

### 3. Run locally

```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
npm run dev
```

This runs:

- Frontend at `http://localhost:3000`
- Backend at `http://localhost:5000`

## Firebase Hosting Deployment

### 1. Build the frontend

```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
npm run build:frontend
```

### 2. If Firebase is not initialized yet

```bash
firebase init hosting
```

Use these answers:

- Project: `classbridge-ai`
- Public directory: `frontend/dist`
- Single-page app: `Yes`
- Automatic GitHub builds and deploys: `No`

Why `No`:

- Your earlier error came from the optional GitHub Actions setup step, not from Hosting itself.
- Manual deploy is simpler and avoids the missing service-account issue you hit.

### 3. Deploy frontend

```bash
firebase deploy --only hosting
```

## Backend Deployment

Deploy the backend separately to Render, Cloud Run, or Railway.

You need a production backend URL such as:

```text
https://your-backend-service.onrender.com
```

## Connect Frontend To Production Backend

The frontend now supports a production API base URL through `VITE_API_URL`.

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-service.onrender.com
```

Then rebuild and redeploy:

```bash
cd d:\MY Orgs\PromptWar\sahayak-ai
npm run build:frontend
firebase deploy --only hosting
```

The frontend will call:

- `https://your-backend-service.onrender.com/api/generate-lesson`
- `https://your-backend-service.onrender.com/api/generate-class-notes`
- `https://your-backend-service.onrender.com/api/generate-short-notes`
- `https://your-backend-service.onrender.com/api/generate-quiz`

## Why Your `firebase init` Failed

You selected:

- GitHub automatic builds: `Yes`

Then Firebase tried to create GitHub Actions credentials for the Firebase project and failed with:

```text
Service account ... does not exist
```

That is part of the GitHub workflow setup, not basic Hosting deployment.

The easiest fix is:

1. Run `firebase init hosting` again inside `sahayak-ai`
2. Choose `No` for GitHub automatic builds
3. Use `firebase deploy --only hosting`

## Recommended Next Steps

1. Confirm backend works locally first.
2. Deploy backend to Render or Cloud Run.
3. Set `frontend/.env.production` with the backend URL.
4. Build frontend.
5. Deploy Firebase Hosting.
