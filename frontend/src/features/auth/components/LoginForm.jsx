import { AUTH_MESSAGES } from '../messages.js';

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="field-error">{message}</span>;
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
        <label>
          {AUTH_MESSAGES.emailLabel}
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={values.email}
            onChange={onChange}
          />
          <FieldError message={errors.email} />
        </label>

        <label>
          {AUTH_MESSAGES.passwordLabel}
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={values.password}
            onChange={onChange}
          />
          <FieldError message={errors.password} />
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
