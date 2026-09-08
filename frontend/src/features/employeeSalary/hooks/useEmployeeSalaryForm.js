import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployeeSalary, upsertEmployeeSalary } from '../../../api/employeeSalary.js';
import { EMPLOYEE_ROUTES } from '../../employees/constants.js';
import { DEFAULT_EMPLOYEE_SALARY_FORM } from '../constants.js';
import { EMPLOYEE_SALARY_MESSAGES } from '../messages.js';
import { hasValidationErrors, validateEmployeeSalaryForm } from '../validation.js';

export function useEmployeeSalaryForm(employeeId) {
  const navigate = useNavigate();
  const [values, setValues] = useState(DEFAULT_EMPLOYEE_SALARY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSalary() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const salary = await fetchEmployeeSalary(employeeId);
        if (!cancelled) {
          setValues({
            baseSalary: String(salary.baseSalary),
            bonus: String(salary.bonus),
            incentives: String(salary.incentives),
            currencyCode: salary.currencyCode,
          });
        }
      } catch (error) {
        if (!cancelled && error.status !== 404) {
          setLoadError(error.message ?? EMPLOYEE_SALARY_MESSAGES.loadSalaryError);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSalary();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    const { errors, payload } = validateEmployeeSalaryForm(values);
    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await upsertEmployeeSalary(employeeId, payload);
      navigate(EMPLOYEE_ROUTES.detail(employeeId));
    } catch (error) {
      setSubmitError(error.message ?? EMPLOYEE_SALARY_MESSAGES.saveSalaryError);
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
    loadError,
    isLoading,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
