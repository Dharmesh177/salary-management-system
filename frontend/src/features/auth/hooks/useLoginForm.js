import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DEFAULT_LOGIN_FORM } from '../constants.js';
import { AUTH_MESSAGES } from '../messages.js';
import { hasValidationErrors, validateLoginForm } from '../validation.js';

export function useLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getDefaultRouteForUser } = useAuth();
  const [values, setValues] = useState(DEFAULT_LOGIN_FORM);
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

    const { errors, payload } = validateLoginForm(values);
    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await login(payload);
      const redirectTo = location.state?.from ?? getDefaultRouteForUser();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setSubmitError(error.message ?? AUTH_MESSAGES.invalidCredentials);
    } finally {
      setIsSubmitting(false);
    }
  }, [getDefaultRouteForUser, location.state?.from, login, navigate, values]);

  return {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
