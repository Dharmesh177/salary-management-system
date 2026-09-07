import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSalaryRecord } from '../../../api/salaryRecords.js';
import { EMPLOYEE_ROUTES } from '../../employees/constants.js';
import { DEFAULT_SALARY_RECORD_FORM } from '../constants.js';
import { SALARY_RECORD_MESSAGES } from '../messages.js';
import { hasValidationErrors, validateSalaryRecordForm } from '../validation.js';

export function useSalaryRecordForm(employeeId) {
  const navigate = useNavigate();
  const [values, setValues] = useState(DEFAULT_SALARY_RECORD_FORM);
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

    const { errors, payload } = validateSalaryRecordForm(values);
    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createSalaryRecord(employeeId, payload);
      navigate(EMPLOYEE_ROUTES.detail(employeeId));
    } catch (error) {
      setSubmitError(error.message ?? SALARY_RECORD_MESSAGES.loadSalaryRecordsError);
    } finally {
      setIsSubmitting(false);
    }
  }, [employeeId, navigate, values]);

  const handleCancel = useCallback(() => {
    navigate(EMPLOYEE_ROUTES.detail(employeeId));
  }, [employeeId, navigate]);

  return {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
