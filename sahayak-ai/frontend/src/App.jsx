import { useState } from 'react'
import axios from 'axios'
import './App.css'
import InputSection from './components/InputSection'
import Loading from './components/Loading'
import LessonPlanDisplay from './components/LessonPlanDisplay'
import NotesDisplay from './components/NotesDisplay'
import QuizDisplay from './components/QuizDisplay'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

function getApiUrl(path) {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path
}

const toolRequestMap = {
  lesson: {
    endpoint: '/api/generate-lesson',
    loadingTitle: 'Generating your lesson plan...',
    loadingDescription: 'The AI is organizing your classroom context into a practical teaching flow.',
  },
  classNotes: {
    endpoint: '/api/generate-class-notes',
    loadingTitle: 'Generating class notes...',
    loadingDescription: 'The AI is creating clear teaching notes from your class context.',
  },
  shortNotes: {
    endpoint: '/api/generate-short-notes',
    loadingTitle: 'Generating short notes...',
    loadingDescription: 'The AI is preparing compact revision notes with the key facts.',
  },
  quiz: {
    endpoint: '/api/generate-quiz',
    loadingTitle: 'Generating quiz...',
    loadingDescription: 'The AI is building a classroom-ready quiz with answers and explanations.',
  },
}

function App() {
  const [activeTool, setActiveTool] = useState('lesson')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [teacherInput, setTeacherInput] = useState('')

  const handleToolChange = (tool) => {
    setActiveTool(tool)
    setResult(null)
    setError(null)
  }

  const handleGenerate = async (input) => {
    setTeacherInput(input)
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post(getApiUrl(toolRequestMap[activeTool].endpoint), {
        teacherInput: input,
      })
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate content. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSimplify = async () => {
    if (!result || !teacherInput) return

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(getApiUrl('/api/simplify-lesson'), {
        originalLesson: result,
        teacherInput,
      })
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to simplify lesson plan. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>ClassBridge</h1>
          <p>AI-powered teacher tools for lesson plans, notes, revision sheets, and quizzes</p>
        </div>
      </header>

      <main className="app-main">
        <InputSection
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onGenerate={handleGenerate}
          disabled={loading}
        />

        {error && (
          <div className="error-card" role="alert" aria-live="assertive">
            <span>{error}</span>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {loading && (
          <Loading
            title={toolRequestMap[activeTool].loadingTitle}
            description={toolRequestMap[activeTool].loadingDescription}
          />
        )}

        {result && !loading && activeTool === 'lesson' && (
          <LessonPlanDisplay
            lessonPlan={result}
            onSimplify={handleSimplify}
            isLoading={loading}
          />
        )}

        {result && !loading && activeTool === 'classNotes' && (
          <NotesDisplay type="classNotes" notes={result} />
        )}

        {result && !loading && activeTool === 'shortNotes' && (
          <NotesDisplay type="shortNotes" notes={result} />
        )}

        {result && !loading && activeTool === 'quiz' && (
          <QuizDisplay quiz={result} />
        )}
      </main>

      <footer className="app-footer">
        <p>ClassBridge 2024 - Empowering Teachers with AI</p>
      </footer>
    </div>
  )
}

export default App
