import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_MODELS = (
  process.env.GEMINI_MODELS ||
  'gemini-2.5-flash-lite,gemini-2.0-flash-lite,gemini-2.5-flash'
)
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

// Middleware
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel(modelName) {
  return genAI.getGenerativeModel({ model: modelName });
}

function parseJsonResponse(responseText) {
  try {
    let jsonString = responseText;
    if (responseText.includes('```json')) {
      jsonString = responseText.split('```json')[1].split('```')[0];
    } else if (responseText.includes('```')) {
      jsonString = responseText.split('```')[1].split('```')[0];
    }
    return JSON.parse(jsonString.trim());
  } catch (error) {
    return JSON.parse(responseText);
  }
}

function extractRetryDelaySeconds(message = '') {
  const match = message.match(/Please retry in ([\d.]+)s/i);
  return match ? Math.ceil(Number(match[1])) : null;
}

function sendGenerationError(res, error, fallbackMessage) {
  const message = error?.message || '';
  const retryAfter = extractRetryDelaySeconds(message);
  const isQuotaError =
    message.includes('429 Too Many Requests') ||
    message.includes('quota') ||
    message.includes('rate limit');

  if (isQuotaError) {
    return res.status(429).json({
      error: 'Gemini API quota exceeded for the current API key.',
      details: 'This key currently has no available free-tier quota or has exhausted it. Wait and retry, or use a Gemini API key with active quota/billing.',
      retryAfter,
    });
  }

  return res.status(500).json({
    error: fallbackMessage,
    details: message,
  });
}

async function generateStructuredContent(prompt) {
  let lastError;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = getModel(modelName);
      const result = await model.generateContent(prompt);
      return parseJsonResponse(result.response.text());
    } catch (error) {
      lastError = error;
      const message = error?.message || '';
      const shouldTryNextModel =
        message.includes('404 Not Found') ||
        message.includes('not found') ||
        message.includes('not supported') ||
        message.includes('429 Too Many Requests') ||
        message.includes('quota') ||
        message.includes('rate limit');

      if (!shouldTryNextModel) {
        throw error;
      }
    }
  }

  throw lastError;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ClassBridge API',
    models: GEMINI_MODELS,
  });
});

// Main endpoint: Generate lesson plan
app.post('/api/generate-lesson', async (req, res) => {
  try {
    const { teacherInput } = req.body;

    if (!teacherInput || teacherInput.trim().length === 0) {
      return res.status(400).json({ error: 'Teacher input is required' });
    }

    const prompt = `You are an expert educational AI assistant for multi-grade classrooms. 
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

Make sure the plan is practical, actionable, and designed for multi-grade classroom scenarios.`;

    const lessonPlan = await generateStructuredContent(prompt);

    res.json(lessonPlan);
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    sendGenerationError(res, error, 'Failed to generate lesson plan');
  }
});

// Endpoint: Regenerate with simpler explanation
app.post('/api/simplify-lesson', async (req, res) => {
  try {
    const { originalLesson, teacherInput } = req.body;

    if (!originalLesson || !teacherInput) {
      return res.status(400).json({ error: 'Original lesson and teacher input are required' });
    }

    const prompt = `You are an educational AI assistant. A teacher provided this input:
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

Return ONLY JSON, no markdown.`;

    const simplifiedLesson = await generateStructuredContent(prompt);

    res.json(simplifiedLesson);
  } catch (error) {
    console.error('Error simplifying lesson:', error);
    sendGenerationError(res, error, 'Failed to simplify lesson plan');
  }
});

// Endpoint: Generate class notes
app.post('/api/generate-class-notes', async (req, res) => {
  try {
    const { teacherInput } = req.body;

    if (!teacherInput || teacherInput.trim().length === 0) {
      return res.status(400).json({ error: 'Teacher input is required' });
    }

    const prompt = `You are an expert teaching assistant. A teacher has shared this class context:

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

Make the notes practical, concise, and suitable for real classroom teaching.`;

    const classNotes = await generateStructuredContent(prompt);

    res.json(classNotes);
  } catch (error) {
    console.error('Error generating class notes:', error);
    sendGenerationError(res, error, 'Failed to generate class notes');
  }
});

// Endpoint: Generate short notes
app.post('/api/generate-short-notes', async (req, res) => {
  try {
    const { teacherInput } = req.body;

    if (!teacherInput || teacherInput.trim().length === 0) {
      return res.status(400).json({ error: 'Teacher input is required' });
    }

    const prompt = `You are an expert teaching assistant. A teacher has shared this class context:

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

Keep the content compact, high-signal, and revision-friendly.`;

    const shortNotes = await generateStructuredContent(prompt);

    res.json(shortNotes);
  } catch (error) {
    console.error('Error generating short notes:', error);
    sendGenerationError(res, error, 'Failed to generate short notes');
  }
});

// Endpoint: Generate quiz
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { teacherInput } = req.body;

    if (!teacherInput || teacherInput.trim().length === 0) {
      return res.status(400).json({ error: 'Teacher input is required' });
    }

    const prompt = `You are an expert teaching assistant. A teacher has shared this class context:

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

Generate 5 questions that suit the classroom level and topic.`;

    const quiz = await generateStructuredContent(prompt);

    res.json(quiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    sendGenerationError(res, error, 'Failed to generate quiz');
  }
});

app.listen(PORT, () => {
  console.log(`ClassBridge Backend Running on http://localhost:${PORT}`);
  console.log(`Gemini fallback models: ${GEMINI_MODELS.join(', ')}`);
});
