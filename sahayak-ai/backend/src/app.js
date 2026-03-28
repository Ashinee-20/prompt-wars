import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { listHistoryEntries, saveHistoryEntry } from './historyStore.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendPublicDir = path.resolve(__dirname, '../public')
const frontendDistDir = path.resolve(__dirname, '../../frontend/dist')

function logEvent(severity, message, data = {}) {
  const entry = {
    severity,
    message,
    ...data,
  }
  console.log(JSON.stringify(entry))
}

function defaultContentGeneratorFactory() {
  const modelList = (
    process.env.GEMINI_MODELS ||
    'gemini-2.5-flash-lite,gemini-2.0-flash-lite,gemini-2.5-flash'
  )
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean)

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  function getModel(modelName) {
    return genAI.getGenerativeModel({ model: modelName })
  }

  function parseJsonResponse(responseText) {
    try {
      let jsonString = responseText
      if (responseText.includes('```json')) {
        jsonString = responseText.split('```json')[1].split('```')[0]
      } else if (responseText.includes('```')) {
        jsonString = responseText.split('```')[1].split('```')[0]
      }
      return JSON.parse(jsonString.trim())
    } catch {
      return JSON.parse(responseText)
    }
  }

  async function generateStructuredContent(prompt) {
    let lastError

    for (const modelName of modelList) {
      try {
        const model = getModel(modelName)
        const result = await model.generateContent(prompt)
        return parseJsonResponse(result.response.text())
      } catch (error) {
        lastError = error
        const message = error?.message || ''
        const shouldTryNextModel =
          message.includes('404 Not Found') ||
          message.includes('not found') ||
          message.includes('not supported') ||
          message.includes('429 Too Many Requests') ||
          message.includes('quota') ||
          message.includes('rate limit')

        if (!shouldTryNextModel) {
          throw error
        }
      }
    }

    throw lastError
  }

  return {
    models: modelList,
    generateStructuredContent,
  }
}

function extractRetryDelaySeconds(message = '') {
  const match = message.match(/Please retry in ([\d.]+)s/i)
  return match ? Math.ceil(Number(match[1])) : null
}

function sendGenerationError(res, error, fallbackMessage) {
  const message = error?.message || ''
  const retryAfter = extractRetryDelaySeconds(message)
  const isQuotaError =
    message.includes('429 Too Many Requests') ||
    message.includes('quota') ||
    message.includes('rate limit')

  if (isQuotaError) {
    return res.status(429).json({
      error: 'Gemini API quota exceeded for the current API key.',
      details:
        'This key currently has no available free-tier quota or has exhausted it. Wait and retry, or use a Gemini API key with active quota/billing.',
      retryAfter,
    })
  }

  return res.status(500).json({
    error: fallbackMessage,
    details: message,
  })
}

function buildLessonPrompt(teacherInput) {
  return `You are an expert educational AI assistant for multi-grade classrooms.
A teacher has provided the following messy but important classroom context:

"${teacherInput}"

Your task is to analyze this input and generate a structured, actionable lesson plan in JSON format.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no extra text.

Return this exact JSON structure:
{
  "summary": "1-2 line summary of the lesson plan",
  "class_levels": ["grades/classes mentioned"],
  "topic": "main teaching topic identified",
  "difficulty": "easy/medium/hard based on context",
  "estimated_duration": "time estimate from input",
  "lesson_plan": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "activities": [
    {"name": "activity name", "grade_levels": ["which grades"], "time": "duration", "materials": "what's needed"},
    {"name": "activity 2", "grade_levels": ["which grades"], "time": "duration", "materials": "what's needed"}
  ],
  "time_split": {
    "grade_3_or_lower": "time allocation",
    "grade_4_5": "time allocation",
    "grade_6_above": "time allocation"
  },
  "teaching_tips": [
    "tip 1 for multi-grade teaching",
    "tip 2 for student engagement",
    "tip 3 for classroom management",
    "tip 4 for assessment"
  ],
  "resources_suggestions": [
    "resource 1 (can be no-cost)",
    "resource 2",
    "resource 3"
  ]
}

Make sure the plan is practical, actionable, and designed for multi-grade classroom scenarios.`
}

function buildSimplifyPrompt(originalLesson, teacherInput) {
  return `You are an educational AI assistant. A teacher provided this input:
"${teacherInput}"

Which generated this lesson plan:
${JSON.stringify(originalLesson, null, 2)}

Now, SIMPLIFY and make it more practical. Focus on:
1. Fewer but more impactful activities
2. Simpler materials/resources
3. Clearer step-by-step instructions
4. More tips for classroom management

Return the SAME JSON structure but simplified:
{
  "summary": "simplified summary",
  "class_levels": [],
  "topic": "",
  "difficulty": "",
  "estimated_duration": "",
  "lesson_plan": ["simpler steps"],
  "activities": [],
  "time_split": {},
  "teaching_tips": ["practical tips"],
  "resources_suggestions": []
}

Return ONLY JSON, no markdown.`
}

function buildClassNotesPrompt(teacherInput) {
  return `You are an expert teaching assistant. A teacher has shared this class context:

"${teacherInput}"

Create clear, classroom-ready class notes in JSON format.

IMPORTANT: Return ONLY valid JSON, with no markdown and no extra text.

Return this exact structure:
{
  "title": "clear title for the notes",
  "topic": "main topic",
  "class_levels": ["grades/classes mentioned"],
  "overview": "2-3 sentence overview for the teacher",
  "learning_objectives": [
    "objective 1",
    "objective 2",
    "objective 3"
  ],
  "key_points": [
    "point 1",
    "point 2",
    "point 3",
    "point 4"
  ],
  "examples": [
    "example 1",
    "example 2",
    "example 3"
  ],
  "classroom_delivery_tips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ]
}

Make the notes practical, concise, and suitable for real classroom teaching.`
}

function buildShortNotesPrompt(teacherInput) {
  return `You are an expert teaching assistant. A teacher has shared this class context:

"${teacherInput}"

Create crisp short notes that students can revise quickly.

IMPORTANT: Return ONLY valid JSON, with no markdown and no extra text.

Return this exact structure:
{
  "title": "short notes title",
  "topic": "main topic",
  "class_levels": ["grades/classes mentioned"],
  "summary": "short 2-3 sentence summary",
  "quick_points": [
    "quick point 1",
    "quick point 2",
    "quick point 3",
    "quick point 4",
    "quick point 5"
  ],
  "formulae_or_facts": [
    "fact 1",
    "fact 2",
    "fact 3"
  ],
  "remember_these": [
    "memory line 1",
    "memory line 2",
    "memory line 3"
  ]
}

Keep the content compact, high-signal, and revision-friendly.`
}

function buildQuizPrompt(teacherInput) {
  return `You are an expert teaching assistant. A teacher has shared this class context:

"${teacherInput}"

Create a classroom quiz in JSON format.

IMPORTANT: Return ONLY valid JSON, with no markdown and no extra text.

Return this exact structure:
{
  "title": "quiz title",
  "topic": "main topic",
  "class_levels": ["grades/classes mentioned"],
  "instructions": "short instructions for students",
  "questions": [
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "answer": "correct option text",
      "explanation": "why this is correct"
    },
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "answer": "correct option text",
      "explanation": "why this is correct"
    }
  ]
}

Generate 5 questions that suit the classroom level and topic.`
}

function serveFrontend(app) {
  const staticRoots = [frontendPublicDir, frontendDistDir].filter((dir) => fs.existsSync(dir))
  const fallbackIndex = staticRoots.find((dir) => fs.existsSync(path.join(dir, 'index.html')))

  for (const staticRoot of staticRoots) {
    app.use(
      express.static(staticRoot, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store')
            return
          }

          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          }
        },
      })
    )
  }

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next()
    }
    if (path.extname(req.path)) {
      return res.status(404).send('Asset not found')
    }
    if (fallbackIndex) {
      return res.sendFile(path.join(fallbackIndex, 'index.html'), {
        headers: {
          'Cache-Control': 'no-store',
        },
      })
    }
    return res.status(503).send('Frontend build not available')
  })
}

export function createApp(options = {}) {
  const app = express()
  const contentGenerator = options.contentGenerator || defaultContentGeneratorFactory()
  const modelList = options.models || contentGenerator.models || []
  const shouldServeFrontend = options.serveFrontend !== false

  app.disable('x-powered-by')
  app.use(cors())
  app.use(express.json({ limit: '32kb' }))
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('X-Frame-Options', 'DENY')
    next()
  })
  app.use((req, res, next) => {
    const startedAt = Date.now()
    res.on('finish', () => {
      logEvent('INFO', 'request_complete', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      })
    })
    next()
  })

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ClassBridge API',
      models: modelList,
    })
  })

  app.get('/api/history', async (req, res) => {
    const sessionId = req.query.sessionId
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' })
    }

    const history = await listHistoryEntries(sessionId)
    return res.json({ items: history })
  })

  app.post('/api/generate-lesson', async (req, res) => {
    try {
      const { teacherInput, sessionId } = req.body
      if (!teacherInput || teacherInput.trim().length === 0) {
        return res.status(400).json({ error: 'Teacher input is required' })
      }

      const lessonPlan = await contentGenerator.generateStructuredContent(buildLessonPrompt(teacherInput))
      await saveHistoryEntry({ sessionId, feature: 'lesson_plan', teacherInput, output: lessonPlan })
      logEvent('INFO', 'generation_success', {
        feature: 'lesson_plan',
      })
      return res.json(lessonPlan)
    } catch (error) {
      console.error('Error generating lesson plan:', error)
      logEvent('ERROR', 'generation_failure', {
        feature: 'lesson_plan',
        details: error?.message || 'Unknown error',
      })
      return sendGenerationError(res, error, 'Failed to generate lesson plan')
    }
  })

  app.post('/api/simplify-lesson', async (req, res) => {
    try {
      const { originalLesson, teacherInput, sessionId } = req.body
      if (!originalLesson || !teacherInput) {
        return res.status(400).json({ error: 'Original lesson and teacher input are required' })
      }

      const simplifiedLesson = await contentGenerator.generateStructuredContent(
        buildSimplifyPrompt(originalLesson, teacherInput)
      )
      await saveHistoryEntry({ sessionId, feature: 'simplify_lesson', teacherInput, output: simplifiedLesson })
      logEvent('INFO', 'generation_success', {
        feature: 'simplify_lesson',
      })
      return res.json(simplifiedLesson)
    } catch (error) {
      console.error('Error simplifying lesson:', error)
      logEvent('ERROR', 'generation_failure', {
        feature: 'simplify_lesson',
        details: error?.message || 'Unknown error',
      })
      return sendGenerationError(res, error, 'Failed to simplify lesson plan')
    }
  })

  app.post('/api/generate-class-notes', async (req, res) => {
    try {
      const { teacherInput, sessionId } = req.body
      if (!teacherInput || teacherInput.trim().length === 0) {
        return res.status(400).json({ error: 'Teacher input is required' })
      }

      const classNotes = await contentGenerator.generateStructuredContent(buildClassNotesPrompt(teacherInput))
      await saveHistoryEntry({ sessionId, feature: 'class_notes', teacherInput, output: classNotes })
      logEvent('INFO', 'generation_success', {
        feature: 'class_notes',
      })
      return res.json(classNotes)
    } catch (error) {
      console.error('Error generating class notes:', error)
      logEvent('ERROR', 'generation_failure', {
        feature: 'class_notes',
        details: error?.message || 'Unknown error',
      })
      return sendGenerationError(res, error, 'Failed to generate class notes')
    }
  })

  app.post('/api/generate-short-notes', async (req, res) => {
    try {
      const { teacherInput, sessionId } = req.body
      if (!teacherInput || teacherInput.trim().length === 0) {
        return res.status(400).json({ error: 'Teacher input is required' })
      }

      const shortNotes = await contentGenerator.generateStructuredContent(buildShortNotesPrompt(teacherInput))
      await saveHistoryEntry({ sessionId, feature: 'short_notes', teacherInput, output: shortNotes })
      logEvent('INFO', 'generation_success', {
        feature: 'short_notes',
      })
      return res.json(shortNotes)
    } catch (error) {
      console.error('Error generating short notes:', error)
      logEvent('ERROR', 'generation_failure', {
        feature: 'short_notes',
        details: error?.message || 'Unknown error',
      })
      return sendGenerationError(res, error, 'Failed to generate short notes')
    }
  })

  app.post('/api/generate-quiz', async (req, res) => {
    try {
      const { teacherInput, sessionId } = req.body
      if (!teacherInput || teacherInput.trim().length === 0) {
        return res.status(400).json({ error: 'Teacher input is required' })
      }

      const quiz = await contentGenerator.generateStructuredContent(buildQuizPrompt(teacherInput))
      await saveHistoryEntry({ sessionId, feature: 'quiz', teacherInput, output: quiz })
      logEvent('INFO', 'generation_success', {
        feature: 'quiz',
      })
      return res.json(quiz)
    } catch (error) {
      console.error('Error generating quiz:', error)
      logEvent('ERROR', 'generation_failure', {
        feature: 'quiz',
        details: error?.message || 'Unknown error',
      })
      return sendGenerationError(res, error, 'Failed to generate quiz')
    }
  })

  if (shouldServeFrontend) {
    serveFrontend(app)
  }

  return app
}

export function getDefaultModelList() {
  return (
    process.env.GEMINI_MODELS ||
    'gemini-2.5-flash-lite,gemini-2.0-flash-lite,gemini-2.5-flash'
  )
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean)
}
