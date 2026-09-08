import './Loader.css';

export default function Loader({ message }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader-spinner" aria-hidden="true" />
      {message ? <p className="loader-message">{message}</p> : null}
    </div>
  );
}
