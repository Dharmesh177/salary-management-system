import './EmptyState.css';

function EmptySearchIcon() {
  return (
    <svg className="empty-state-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="28" cy="28" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
      <path
        d="M40 40 L54 54"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M22 28 L34 28 M28 22 L28 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EmptyState({ message }) {
  return (
    <div className="empty-state" role="status">
      <EmptySearchIcon />
      <p className="empty-state-message">{message}</p>
    </div>
  );
}
