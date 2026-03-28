import { useState } from 'react'
import './InputSection.css'

const toolConfig = {
  lesson: {
    title: 'Lesson Plan Generator',
    subtitle: 'Turn messy teacher input into a structured classroom plan.',
    buttonLabel: 'Generate Lesson Plan',
    examples: [
      'I have class 3 and 5 together, topic is fractions, students are weak, I have 30 minutes and no materials',
      'Grade 2 and 3 mixed. Teaching shapes and colors. 45 minutes. Low budget.',
      'Grades 4-6, science topic: water cycle, 1 hour, limited resources, students have been absent',
    ],
  },
  classNotes: {
    title: 'Class Notes Generator',
    subtitle: 'Create clear teaching notes from your lesson context.',
    buttonLabel: 'Generate Class Notes',
    examples: [
      'Prepare class notes for grade 6 science on respiration with simple explanations and classroom examples',
      'Need teaching notes for class 4 EVS on plants and their parts, 35-minute period',
      'Make class notes for mixed grades 5 and 6 on decimals with examples and easy explanations',
    ],
  },
  shortNotes: {
    title: 'Short Notes Generator',
    subtitle: 'Create quick revision notes students can remember easily.',
    buttonLabel: 'Generate Short Notes',
    examples: [
      'Create short notes for class 8 history on the Revolt of 1857',
      'Need revision notes for grade 5 maths on fractions and equivalent fractions',
      'Make short notes for class 7 science on acids, bases, and salts',
    ],
  },
  quiz: {
    title: 'Quiz Generator',
    subtitle: 'Generate a ready-to-use classroom quiz from the topic and class context.',
    buttonLabel: 'Generate Quiz',
    examples: [
      'Create a quiz for class 6 maths on fractions with 5 MCQs',
      'Need a quick science quiz for grade 4 on the water cycle',
      'Generate a classroom quiz for classes 7 and 8 on nouns and pronouns',
    ],
  },
}

export default function InputSection({ activeTool, onToolChange, onGenerate, disabled }) {
  const [input, setInput] = useState('')
  const currentTool = toolConfig[activeTool]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onGenerate(input)
      setInput('')
    }
  }

  const fillExample = (example) => {
    setInput(example)
  }

  return (
    <section className="input-section">
      <div className="input-card">
        <div className="tool-switcher" role="tablist" aria-label="Choose generator type">
          <button
            type="button"
            className={activeTool === 'lesson' ? 'tool-chip active' : 'tool-chip'}
            onClick={() => onToolChange('lesson')}
            disabled={disabled}
            aria-pressed={activeTool === 'lesson'}
            role="tab"
            aria-selected={activeTool === 'lesson'}
            aria-controls="generator-panel"
            id="tab-lesson"
          >
            Lesson Plan
          </button>
          <button
            type="button"
            className={activeTool === 'classNotes' ? 'tool-chip active' : 'tool-chip'}
            onClick={() => onToolChange('classNotes')}
            disabled={disabled}
            aria-pressed={activeTool === 'classNotes'}
            role="tab"
            aria-selected={activeTool === 'classNotes'}
            aria-controls="generator-panel"
            id="tab-class-notes"
          >
            Class Notes
          </button>
          <button
            type="button"
            className={activeTool === 'shortNotes' ? 'tool-chip active' : 'tool-chip'}
            onClick={() => onToolChange('shortNotes')}
            disabled={disabled}
            aria-pressed={activeTool === 'shortNotes'}
            role="tab"
            aria-selected={activeTool === 'shortNotes'}
            aria-controls="generator-panel"
            id="tab-short-notes"
          >
            Short Notes
          </button>
          <button
            type="button"
            className={activeTool === 'quiz' ? 'tool-chip active' : 'tool-chip'}
            onClick={() => onToolChange('quiz')}
            disabled={disabled}
            aria-pressed={activeTool === 'quiz'}
            role="tab"
            aria-selected={activeTool === 'quiz'}
            aria-controls="generator-panel"
            id="tab-quiz"
          >
            Quiz
          </button>
        </div>

        <div id="generator-panel" role="tabpanel" aria-labelledby={`tab-${activeTool === 'classNotes' ? 'class-notes' : activeTool === 'shortNotes' ? 'short-notes' : activeTool}`}>
          <h2>{currentTool.title}</h2>
          <p>{currentTool.subtitle}</p>

          <form onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="teacher-input">
              Describe the class context and required output
            </label>
            <textarea
              id="teacher-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the class, topic, grade levels, time available, student level, and what kind of output the teacher needs."
              disabled={disabled}
              rows="5"
              aria-describedby="teacher-input-help"
              aria-required="true"
            />
            <p id="teacher-input-help" className="input-help">
              Include class level, topic, time available, learner needs, and any classroom constraints.
            </p>
            <button type="submit" disabled={disabled || !input.trim()}>
              {disabled ? 'Generating...' : currentTool.buttonLabel}
            </button>
          </form>

          <div className="examples">
            <p className="examples-label">Try these examples:</p>
            <div className="example-buttons">
              {currentTool.examples.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="example-btn"
                  onClick={() => fillExample(example)}
                  disabled={disabled}
                  aria-label={`Use example ${idx + 1} for ${currentTool.title}`}
                >
                  Example {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
