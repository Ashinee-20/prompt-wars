import './Loading.css'

export default function Loading({ title, description }) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
