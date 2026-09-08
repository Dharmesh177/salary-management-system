import { Link } from 'react-router-dom';
import { AUTH_MESSAGES } from '../../features/auth/messages.js';
import { AUTH_ROUTES } from '../../features/auth/constants.js';
import { useRegisterForm } from './useRegisterForm.js';
import './RegisterPage.css';

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="field-error">{message}</span>;
}

export default function RegisterPage() {
  const {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    roleOptions,
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
          <label>
            {AUTH_MESSAGES.registrationSecretLabel}
            <input
              type="password"
              name="registrationSecret"
              value={values.registrationSecret}
              onChange={handleChange}
            />
            <FieldError message={fieldErrors.registrationSecret} />
          </label>

          <label>
            {AUTH_MESSAGES.emailLabel}
            <input type="email" name="email" value={values.email} onChange={handleChange} />
            <FieldError message={fieldErrors.email} />
          </label>

          <label>
            {AUTH_MESSAGES.passwordLabel}
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
            />
            <FieldError message={fieldErrors.password} />
          </label>

          <label>
            {AUTH_MESSAGES.employeeIdLabel}
            <input
              type="number"
              min="1"
              name="employeeId"
              value={values.employeeId}
              onChange={handleChange}
            />
            <FieldError message={fieldErrors.employeeId} />
          </label>

          <label>
            {AUTH_MESSAGES.roleLabel}
            <select name="role" value={values.role} onChange={handleChange}>
              <option value="">Select role</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <FieldError message={fieldErrors.role} />
          </label>
        </div>

        {submitError ? <p className="status-message error">{submitError}</p> : null}

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
