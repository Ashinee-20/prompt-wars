# 📡 ClassBridge API Documentation

Complete API reference for ClassBridge backend.

## Base URL

- **Local Development**: `http://localhost:5000`
- **Production Cloud Run**: `https://classbridge-backend-xxx.a.run.app`
- **Production Render**: `https://classbridge-backend.onrender.com`

---

## Table of Contents

1. [Health Check](#health-check)
2. [Generate Lesson Plan](#generate-lesson-plan)
3. [Simplify Lesson Plan](#simplify-lesson-plan)
4. [Translate Lesson Plan](#translate-lesson-plan)
5. [Error Handling](#error-handling)
6. [Response Format](#response-format)

---

## Endpoints

### Health Check

Check if API is running.

```http
GET /api/health
```

#### Response (200 OK)
```json
{
  "status": "ClassBridge API is running ✅"
}
```

#### Example
```bash
curl http://localhost:5000/api/health
```

---

### Generate Lesson Plan

Generate a structured lesson plan from teacher input.

```http
POST /api/generate-lesson
Content-Type: application/json
```

#### Request Body
```json
{
  "teacherInput": "I have class 3 and 5 together, topic is fractions, students are weak, I have 30 minutes and no materials"
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teacherInput` | string | Yes | Mixed-grade classroom description (messy format OK) |

#### Response (200 OK)
```json
{
  "summary": "Multi-grade fractions lesson optimized for 30 minutes with no materials, using visual aids and group work",
  "class_levels": ["Grade 3", "Grade 5"],
  "topic": "Introduction to Fractions",
  "difficulty": "medium",
  "estimated_duration": "30 minutes",
  "lesson_plan": [
    "Start with circular/pizza visual aids (using drawings)",
    "Introduce 1/2, 1/4, 1/3 concepts using visuals",
    "Grade-specific activities (see Activities section)",
    "Group discussion on understanding fractions",
    "Quick assessment with visual questions"
  ],
  "activities": [
    {
      "name": "Visual Fraction Pie",
      "grade_levels": ["Grade 3", "Grade 5"],
      "time": "10 minutes",
      "materials": "Paper, pencils, scissors"
    },
    {
      "name": "Fraction Comparison Game",
      "grade_levels": ["Grade 5"],
      "time": "8 minutes",
      "materials": "Paper cards (handmade)"
    },
    {
      "name": "Real-World Fractions",
      "grade_levels": ["Grade 3"],
      "time": "6 minutes",
      "materials": "Objects in classroom (apple, chocolate, etc.)"
    }
  ],
  "time_split": {
    "introduction": "3 minutes",
    "grade_3_activities": "12 minutes",
    "grade_5_activities": "10 minutes",
    "wrap_up": "5 minutes"
  },
  "teaching_tips": [
    "Use real objects from classroom to make fractions tangible",
    "Grade 3 needs more visual support; Grade 5 can handle abstract concepts",
    "Create mixed-grade pairs for peer learning",
    "Celebrate small wins to boost student confidence"
  ],
  "resources_suggestions": [
    "Paper scraps for drawing fractions",
    "Classroom objects for demonstrating parts",
    "Whiteboard drawings (no cost)",
    "Student notebooks for practice"
  ]
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "Teacher input is required"
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "error": "Failed to generate lesson plan",
  "details": "API quota exceeded or connection error"
}
```

#### Example
```bash
curl -X POST http://localhost:5000/api/generate-lesson \
  -H "Content-Type: application/json" \
  -d '{
    "teacherInput": "Class 3 and 5, fractions, weak, 30 mins, no materials"
  }'
```

---

### Simplify Lesson Plan

Create a simpler version of the generated lesson plan.

```http
POST /api/simplify-lesson
Content-Type: application/json
```

#### Request Body
```json
{
  "originalLesson": {
    "summary": "...",
    "class_levels": ["Grade 3", "Grade 5"],
    ...
  },
  "teacherInput": "Class 3 and 5, fractions, weak, 30 mins, no materials"
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `originalLesson` | object | Yes | Full lesson plan JSON (from generate endpoint) |
| `teacherInput` | string | Yes | Original classroom description |

#### Response (200 OK)
```json
{
  "summary": "Simple fractions lesson: visual introduction with clear examples",
  "class_levels": ["Grade 3", "Grade 5"],
  "topic": "Introduction to Fractions",
  "difficulty": "easy",
  "estimated_duration": "30 minutes",
  "lesson_plan": [
    "Show pictures of fractions (pizza, apple)",
    "Practice recognizing halves and quarters",
    "Group activity - students draw fractions"
  ],
  "activities": [
    {
      "name": "Fraction Drawing",
      "grade_levels": ["Grade 3", "Grade 5"],
      "time": "15 minutes",
      "materials": "Paper, pencil"
    },
    {
      "name": "Fraction Spotting Game",
      "grade_levels": ["Grade 3", "Grade 5"],
      "time": "10 minutes",
      "materials": "Pictures (can be drawn)"
    }
  ],
  "time_split": {
    "introduction": "5 minutes",
    "activities": "20 minutes",
    "wrap_up": "5 minutes"
  },
  "teaching_tips": [
    "Use pictures more than words",
    "Repeat concepts multiple times",
    "Let students touch and handle objects"
  ],
  "resources_suggestions": [
    "Paper and pencils",
    "Hand-drawn pictures",
    "Real objects from class"
  ]
}
```

#### Example
```bash
curl -X POST http://localhost:5000/api/simplify-lesson \
  -H "Content-Type: application/json" \
  -d '{
    "originalLesson": {...},
    "teacherInput": "Class 3 and 5, fractions..."
  }'
```

---

### Translate Lesson Plan

Translate lesson plan to a different language.

```http
POST /api/translate-lesson
Content-Type: application/json
```

#### Request Body
```json
{
  "lessonPlan": {
    "summary": "...",
    ...
  },
  "targetLanguage": "Hindi"
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lessonPlan` | object | Yes | Full lesson plan JSON to translate |
| `targetLanguage` | string | Yes | Target language name (e.g., "Hindi", "Spanish") |

#### Supported Languages
- Hindi
- Spanish
- French
- German
- Portuguese
- Bengali
- Urdu
- Tamil
- Telugu
- Kannada
- (Custom: Any language that Gemini supports)

#### Response (200 OK)
```json
{
  "summary": "बहु-ग्रेड भिन्न पाठ 30 मिनट के लिए अनुकूलित...",
  "class_levels": ["ग्रेड 3", "ग्रेड 5"],
  "topic": "भिन्न का परिचय",
  "difficulty": "मध्यम",
  "estimated_duration": "30 मिनट",
  "lesson_plan": [
    "परिपत्र/पिज्जा दृश्य सहायक के साथ शुरू करें...",
    ...
  ],
  ...
}
```

#### Example
```bash
curl -X POST http://localhost:5000/api/translate-lesson \
  -H "Content-Type: application/json" \
  -d '{
    "lessonPlan": {...},
    "targetLanguage": "Hindi"
  }'
```

---

## Error Handling

### Common Errors

#### 400 - Bad Request
Missing required parameter
```json
{
  "error": "Teacher input is required"
}
```

#### 400 - Bad Request
Empty or invalid input
```json
{
  "error": "Teacher input is required"
}
```

#### 500 - Internal Server Error
API failure or server error
```json
{
  "error": "Failed to generate lesson plan",
  "details": "Error message from Gemini API"
}
```

### Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check JSON format, required fields |
| 500 | Server Error | Check API key, backend logs |
| Network Error | No backend connection | Ensure backend running on port 5000 |
| JSON Parse Error | Invalid JSON response | Check Gemini API response format |

---

## Response Format

### Standard Lesson Plan Object

```typescript
interface LessonPlan {
  summary: string;                    // 1-2 line summary
  class_levels: string[];             // e.g., ["Grade 3", "Grade 5"]
  topic: string;                      // Main teaching topic
  difficulty: "easy" | "medium" | "hard";
  estimated_duration: string;         // e.g., "30 minutes"
  lesson_plan: string[];              // Array of steps
  activities: Activity[];             // Grade-specific activities
  time_split: Record<string, string>; // Time allocation
  teaching_tips: string[];            // Teaching advice
  resources_suggestions: string[];    // Material suggestions
}

interface Activity {
  name: string;
  grade_levels: string[];
  time: string;
  materials: string;
}
```

---

## Rate Limiting

**Current**: No rate limiting (for development)

**Production**: 
- 100 requests per IP per 15 minutes recommended
- Adjust based on usage

### Implementation Example
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

---

## Authentication

**Current**: No authentication (open API)

**Future**: Consider adding:
- API keys for users
- JWT tokens
- User registration/login

---

## CORS Configuration

**Current**: Allows all origins
```javascript
app.use(cors());
```

**Production**: Restrict to specific domains
```javascript
app.use(cors({
  origin: 'https://classbridge-ai.web.app',
  credentials: true
}));
```

---

## Testing Endpoints

### Using cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Generate plan
curl -X POST http://localhost:5000/api/generate-lesson \
  -H "Content-Type: application/json" \
  -d '{"teacherInput":"Class 3, math, 30 min"}'
```

### Using Postman
1. Import `classbridge.postman_collection.json` (if available)
2. Or manually create requests with URLs/bodies above
3. Test all 4 endpoints

### Using JavaScript/Axios
```javascript
// Generate lesson plan
const response = await axios.post('/api/generate-lesson', {
  teacherInput: 'Class 3 and 5, fractions, weak, 30 mins'
});

// Simplify
const simplified = await axios.post('/api/simplify-lesson', {
  originalLesson: response.data,
  teacherInput: 'Class 3 and 5...'
});

// Translate
const translated = await axios.post('/api/translate-lesson', {
  lessonPlan: response.data,
  targetLanguage: 'Hindi'
});
```

---

## Performance Metrics

| Endpoint | Avg Response Time | Max Time |
|----------|-------------------|----------|
| `/api/health` | <50ms | <100ms |
| `/api/generate-lesson` | 1-2s | <3s |
| `/api/simplify-lesson` | 1-2s | <3s |
| `/api/translate-lesson` | 1-2s | <3s |

---

## Monitoring

### Recommended Logging
```javascript
console.log(`[${new Date().toISOString()}] ${method} ${path}`);
console.log(`Response time: ${responseTime}ms`);
console.log(`Status: ${statusCode}`);
```

### Error Tracking
- Log all 500 errors
- Log API quota exceeded messages
- Monitor response times

---

## Future Enhancements

- [ ] API authentication/keys
- [ ] Rate limiting
- [ ] Response caching
- [ ] Webhook support
- [ ] Async job processing
- [ ] Batch API endpoints
- [ ] WebSocket support

---

## Support

For API issues:
1. Check error message
2. Verify API key is valid
3. Check GEMINI_API_KEY in .env
4. Review logs in terminal
5. Check network connectivity

---

**API Documentation v1.0**
Last Updated: March 2026
