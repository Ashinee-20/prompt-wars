import './HistoryPanel.css'

const featureLabels = {
  lesson_plan: 'Lesson Plan',
  simplify_lesson: 'Simplified Lesson',
  class_notes: 'Class Notes',
  short_notes: 'Short Notes',
  quiz: 'Quiz',
}

export default function HistoryPanel({ items }) {
  if (!items.length) return null

  return (
    <section className="history-panel" aria-labelledby="history-heading">
      <div className="card">
        <div className="card-header">
          <h3 id="history-heading">Recent Generations</h3>
        </div>
        <ul className="history-list">
          {items.map((item) => (
            <li key={item.id} className="history-item">
              <div className="history-topline">
                <span className="history-badge">{featureLabels[item.feature] || item.feature}</span>
                <time dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleString()}
                </time>
              </div>
              <h4>{item.title || 'Untitled result'}</h4>
              {item.topic ? <p className="history-topic">Topic: {item.topic}</p> : null}
              {item.summary ? <p className="history-summary">{item.summary}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
