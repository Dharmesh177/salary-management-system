import { AUTH_MESSAGES } from '../messages.js';

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

export default function LoginForm({
  values,
  errors,
  submitError,
  isSubmitting,
  onChange,
  onSubmit,
}) {
  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid login-form-grid">
        <label htmlFor="login-email">
          {AUTH_MESSAGES.emailLabel}
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="username"
            value={values.email}
            onChange={onChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          <FieldError id="login-email-error" message={errors.email} />
        </label>

        <label htmlFor="login-password">
          {AUTH_MESSAGES.passwordLabel}
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={values.password}
            onChange={onChange}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
          />
          <FieldError id="login-password-error" message={errors.password} />
        </label>
      </div>

      {submitError ? <p className="status-message error">{submitError}</p> : null}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? AUTH_MESSAGES.signingIn : AUTH_MESSAGES.signIn}
        </button>
      </div>
    </form>
  );
}
