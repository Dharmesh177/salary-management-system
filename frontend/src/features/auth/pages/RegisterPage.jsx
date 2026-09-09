import { Link } from 'react-router-dom';
import { AUTH_ROUTES } from '../constants.js';
import { useRegisterForm } from '../hooks/useRegisterForm.js';
import { AUTH_MESSAGES } from '../messages.js';
import './RegisterPage.css';

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <span id={id} className="field-error" role="alert">
      {message}
    </span>
  );
}

export default function RegisterPage() {
  const {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useRegisterForm();

  return (
    <section className="register-page">
      <header className="page-header">
        <h1>{AUTH_MESSAGES.registerTitle}</h1>
        <p>{AUTH_MESSAGES.registerSubtitle}</p>
      </header>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid register-form-grid">
          <label htmlFor="register-secret">
            {AUTH_MESSAGES.registrationSecretLabel}
            <input
              id="register-secret"
              type="password"
              name="registrationSecret"
              autoComplete="off"
              value={values.registrationSecret}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.registrationSecret)}
              aria-describedby={fieldErrors.registrationSecret ? 'register-secret-error' : undefined}
            />
            <FieldError id="register-secret-error" message={fieldErrors.registrationSecret} />
          </label>

          <label htmlFor="register-email">
            {AUTH_MESSAGES.emailLabel}
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
            />
            <FieldError id="register-email-error" message={fieldErrors.email} />
          </label>

          <label htmlFor="register-password">
            {AUTH_MESSAGES.passwordLabel}
            <input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
            />
            <FieldError id="register-password-error" message={fieldErrors.password} />
          </label>

          <label htmlFor="register-employee-id">
            {AUTH_MESSAGES.employeeIdLabel}
            <input
              id="register-employee-id"
              type="number"
              min="1"
              name="employeeId"
              value={values.employeeId}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.employeeId)}
              aria-describedby={fieldErrors.employeeId ? 'register-employee-id-error' : undefined}
            />
            <FieldError id="register-employee-id-error" message={fieldErrors.employeeId} />
          </label>
        </div>

        {submitError ? (
          <p className="status-message error" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? AUTH_MESSAGES.registering : AUTH_MESSAGES.register}
          </button>
          <Link to={AUTH_ROUTES.login} className="button-link secondary-link">
            {AUTH_MESSAGES.backToLogin}
          </Link>
        </div>
      </form>
    </section>
  );
}
