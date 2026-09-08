import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/auth.js';
import { AUTH_ROUTES, DEFAULT_REGISTER_FORM } from '../../features/auth/constants.js';
import { AUTH_MESSAGES } from '../../features/auth/messages.js';
import { hasValidationErrors, validateRegisterForm } from '../../features/auth/validation.js';

export function useRegisterForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState(DEFAULT_REGISTER_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    const { errors, payload } = validateRegisterForm(values);
    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await registerUser(payload);
      navigate(AUTH_ROUTES.login, { replace: true });
    } catch (error) {
      setSubmitError(error.message ?? AUTH_MESSAGES.registrationFailed);
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate, values]);

  return {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
