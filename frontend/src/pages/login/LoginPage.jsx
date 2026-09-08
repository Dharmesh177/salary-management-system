import LoginForm from '../../features/auth/components/LoginForm.jsx';
import { useLoginForm } from '../../features/auth/hooks/useLoginForm.js';
import { AUTH_MESSAGES } from '../../features/auth/messages.js';
import './LoginPage.css';

export default function LoginPage() {
  const {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useLoginForm();

  return (
    <section className="login-page">
      <header className="page-header">
        <h1>{AUTH_MESSAGES.loginTitle}</h1>
        <p>{AUTH_MESSAGES.loginSubtitle}</p>
      </header>

      <LoginForm
        values={values}
        errors={fieldErrors}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
