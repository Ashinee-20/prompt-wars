import './QuizDisplay.css'

export default function QuizDisplay({ quiz }) {
  return (
    <section className="quiz-display" aria-labelledby="quiz-heading">
      <div className="card summary-card">
        <div className="card-header">
          <h3 id="quiz-heading">{quiz.title || 'Classroom Quiz'}</h3>
        </div>
        <p className="summary-text">{quiz.instructions}</p>
        <div className="meta-info">
          <div className="meta-item">
            <span className="meta-label">Topic</span>
            <span className="meta-value">{quiz.topic || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Classes</span>
            <span className="meta-value">{quiz.class_levels?.join(', ') || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="quiz-questions">
        {quiz.questions?.map((question, index) => (
          <div key={index} className="card quiz-card">
            <div className="card-header">
              <h3>Question {index + 1}</h3>
            </div>
            <p className="quiz-question">{question.question}</p>
            <ol className="quiz-options">
              {question.options?.map((option, optionIndex) => (
                <li key={optionIndex}>{option}</li>
              ))}
            </ol>
            <div className="quiz-answer">
              <strong>Answer:</strong> {question.answer}
            </div>
            <p className="quiz-explanation">{question.explanation}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
