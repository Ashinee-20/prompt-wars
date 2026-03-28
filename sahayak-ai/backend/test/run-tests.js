import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../src/app.js'

function createStubGenerator() {
  return {
    models: ['stub-model'],
    async generateStructuredContent(prompt) {
      if (prompt.includes('structured, actionable lesson plan')) {
        return {
          summary: 'Structured lesson summary',
          class_levels: ['Grade 3', 'Grade 5'],
          topic: 'Fractions',
          difficulty: 'medium',
          estimated_duration: '30 minutes',
          lesson_plan: ['Step 1', 'Step 2'],
          activities: [{ name: 'Activity', grade_levels: ['Grade 3'], time: '10 min', materials: 'Paper' }],
          time_split: { grade_3_or_lower: '10 minutes' },
          teaching_tips: ['Tip 1'],
          resources_suggestions: ['Resource 1'],
        }
      }

      if (prompt.includes('SIMPLIFY and make it more practical')) {
        return {
          summary: 'Simplified lesson summary',
          class_levels: ['Grade 3'],
          topic: 'Fractions',
          difficulty: 'easy',
          estimated_duration: '25 minutes',
          lesson_plan: ['Simplified Step 1'],
          activities: [],
          time_split: {},
          teaching_tips: ['Keep it simple'],
          resources_suggestions: [],
        }
      }

      if (prompt.includes('classroom-ready class notes')) {
        return {
          title: 'Class Notes',
          topic: 'Respiration',
          class_levels: ['Grade 6'],
          overview: 'Overview',
          learning_objectives: ['Objective 1'],
          key_points: ['Point 1'],
          examples: ['Example 1'],
          classroom_delivery_tips: ['Tip 1'],
        }
      }

      if (prompt.includes('Create crisp short notes')) {
        return {
          title: 'Short Notes',
          topic: 'Fractions',
          class_levels: ['Grade 5'],
          summary: 'Summary',
          quick_points: ['Quick point'],
          formulae_or_facts: ['Fact'],
          remember_these: ['Remember'],
        }
      }

      if (prompt.includes('Create a classroom quiz')) {
        return {
          title: 'Quiz',
          topic: 'Fractions',
          class_levels: ['Grade 6'],
          instructions: 'Answer all questions',
          questions: [
            {
              question: 'What is 1/2 of 10?',
              options: ['2', '5', '10', '20'],
              answer: '5',
              explanation: 'Half of 10 is 5.',
            },
          ],
        }
      }

      throw new Error('Unexpected prompt in test stub')
    },
  }
}

const app = createApp({ contentGenerator: createStubGenerator(), models: ['stub-model'], serveFrontend: false })

async function run(name, fn) {
  try {
    await fn()
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    console.error(error)
    process.exitCode = 1
  }
}

await run('health endpoint returns service metadata', async () => {
  const response = await request(app).get('/api/health')
  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'ok')
  assert.deepEqual(response.body.models, ['stub-model'])
})

await run('lesson generation validates teacher input', async () => {
  const response = await request(app).post('/api/generate-lesson').send({ teacherInput: '' })
  assert.equal(response.status, 400)
  assert.equal(response.body.error, 'Teacher input is required')
})

await run('lesson generation returns structured lesson data', async () => {
  const response = await request(app)
    .post('/api/generate-lesson')
    .send({ teacherInput: 'Grade 3 and 5 fractions lesson' })
  assert.equal(response.status, 200)
  assert.equal(response.body.topic, 'Fractions')
  assert.ok(Array.isArray(response.body.lesson_plan))
})

await run('simplify endpoint validates required fields', async () => {
  const response = await request(app).post('/api/simplify-lesson').send({ teacherInput: 'Only text' })
  assert.equal(response.status, 400)
  assert.equal(response.body.error, 'Original lesson and teacher input are required')
})

await run('class notes endpoint returns structured notes', async () => {
  const response = await request(app)
    .post('/api/generate-class-notes')
    .send({ teacherInput: 'Grade 6 respiration notes' })
  assert.equal(response.status, 200)
  assert.equal(response.body.title, 'Class Notes')
  assert.ok(Array.isArray(response.body.learning_objectives))
})

await run('short notes endpoint returns structured short notes', async () => {
  const response = await request(app)
    .post('/api/generate-short-notes')
    .send({ teacherInput: 'Grade 5 fractions short notes' })
  assert.equal(response.status, 200)
  assert.equal(response.body.title, 'Short Notes')
  assert.ok(Array.isArray(response.body.quick_points))
})

await run('quiz endpoint returns structured quiz', async () => {
  const response = await request(app)
    .post('/api/generate-quiz')
    .send({ teacherInput: 'Grade 6 fractions quiz' })
  assert.equal(response.status, 200)
  assert.equal(response.body.title, 'Quiz')
  assert.ok(Array.isArray(response.body.questions))
})

if (!process.exitCode) {
  console.log('All backend tests passed.')
}
