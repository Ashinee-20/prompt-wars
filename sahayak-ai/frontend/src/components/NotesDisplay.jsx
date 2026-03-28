import './NotesDisplay.css'

export default function NotesDisplay({ type, notes }) {
  const isShortNotes = type === 'shortNotes'

  return (
    <section className="notes-display">
      <div className="card summary-card">
        <div className="card-header">
          <h3>{notes.title || (isShortNotes ? 'Short Notes' : 'Class Notes')}</h3>
        </div>
        <p className="summary-text">{notes.overview || notes.summary}</p>
        <div className="meta-info">
          <div className="meta-item">
            <span className="meta-label">Topic</span>
            <span className="meta-value">{notes.topic || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Classes</span>
            <span className="meta-value">{notes.class_levels?.join(', ') || 'N/A'}</span>
          </div>
        </div>
      </div>

      {!isShortNotes && (
        <div className="card">
          <div className="card-header">
            <h3>Learning Objectives</h3>
          </div>
          <ul className="content-list">
            {notes.learning_objectives?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>{isShortNotes ? 'Quick Points' : 'Key Points'}</h3>
        </div>
        <ul className="content-list">
          {(notes.quick_points || notes.key_points || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{isShortNotes ? 'Facts To Remember' : 'Examples'}</h3>
        </div>
        <ul className="content-list">
          {(notes.formulae_or_facts || notes.examples || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{isShortNotes ? 'Remember These' : 'Classroom Delivery Tips'}</h3>
        </div>
        <ul className="content-list">
          {(notes.remember_these || notes.classroom_delivery_tips || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
