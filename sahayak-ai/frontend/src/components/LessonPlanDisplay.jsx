import './LessonPlanDisplay.css'

export default function LessonPlanDisplay({ lessonPlan, onSimplify, isLoading }) {
  return (
    <section className="lesson-plan-display">
      <div className="card summary-card">
        <div className="card-header">
          <h3>Summary</h3>
        </div>
        <p className="summary-text">{lessonPlan.summary}</p>
        <div className="meta-info">
          <div className="meta-item">
            <span className="meta-label">Classes:</span>
            <span className="meta-value">{lessonPlan.class_levels?.join(', ') || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Topic:</span>
            <span className="meta-value">{lessonPlan.topic || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Duration:</span>
            <span className="meta-value">{lessonPlan.estimated_duration || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Difficulty:</span>
            <span className="meta-value">{lessonPlan.difficulty || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="card lesson-plan-card">
        <div className="card-header">
          <h3>Lesson Plan Steps</h3>
        </div>
        <ol className="lesson-steps">
          {lessonPlan.lesson_plan?.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="card activities-card">
        <div className="card-header">
          <h3>Activities</h3>
        </div>
        <div className="activities-grid">
          {lessonPlan.activities?.map((activity, idx) => (
            <div key={idx} className="activity-item">
              <h4>{activity.name}</h4>
              <p className="activity-grades">Grades: {activity.grade_levels?.join(', ')}</p>
              <p className="activity-time">Time: {activity.time}</p>
              <p className="activity-materials">Materials: {activity.materials}</p>
            </div>
          ))}
        </div>
      </div>

      {lessonPlan.time_split && (
        <div className="card time-split-card">
          <div className="card-header">
            <h3>Time Allocation by Grade Level</h3>
          </div>
          <div className="time-split-grid">
            {Object.entries(lessonPlan.time_split).map(([grade, allocation], idx) => (
              <div key={idx} className="time-split-item">
                <h4>{grade}</h4>
                <p>{allocation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card tips-card">
        <div className="card-header">
          <h3>Teaching Tips</h3>
        </div>
        <ul className="tips-list">
          {lessonPlan.teaching_tips?.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>

      {lessonPlan.resources_suggestions && lessonPlan.resources_suggestions.length > 0 && (
        <div className="card resources-card">
          <div className="card-header">
            <h3>Resource Suggestions</h3>
          </div>
          <ul className="resources-list">
            {lessonPlan.resources_suggestions.map((resource, idx) => (
              <li key={idx}>{resource}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="action-buttons">
        <button onClick={onSimplify} disabled={isLoading} className="btn-primary">
          {isLoading ? 'Processing...' : 'Regenerate Simpler'}
        </button>
      </div>
    </section>
  )
}
