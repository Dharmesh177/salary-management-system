import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { upsertEmployeeSalary } from '../../../api/employeeSalary.js';
import { createEmployee, fetchEmployee, updateEmployee } from '../../../api/employees.js';
import { useLookups } from '../context/LookupsContext.jsx';
import { DEFAULT_EMPLOYEE_FORM, EMPLOYEE_ROUTES } from '../constants.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';
import {
  buildSalaryPayload,
  hasValidationErrors,
  validateEmployeeForm,
} from '../validation.js';

function toFormValues(employee) {
  return {
    employeeCode: employee.employeeCode,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    countryId: String(employee.country.id),
    departmentId: String(employee.department.id),
    designationId: String(employee.designation.id),
    joiningDate: employee.joiningDate,
    baseSalary: '',
    bonus: '0',
    incentives: '0',
    currencyCode: 'INR',
  };
}

function toPayload(values) {
  return {
    employeeCode: values.employeeCode.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    countryId: Number(values.countryId),
    departmentId: Number(values.departmentId),
    designationId: Number(values.designationId),
    joiningDate: values.joiningDate,
  };
}

export function useEmployeeForm({ mode, employeeId }) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const { lookups, error: lookupsError } = useLookups();
  const [values, setValues] = useState(DEFAULT_EMPLOYEE_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lookupsError) {
      setSubmitError(lookupsError);
    }
  }, [lookupsError]);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    setLoading(true);
    fetchEmployee(employeeId)
      .then((employee) => {
        setValues(toFormValues(employee));
      })
      .catch((error) => {
        setSubmitError(error.message ?? EMPLOYEE_MESSAGES.loadEmployeeError);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [employeeId, isEdit]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    const validationErrors = validateEmployeeForm(values, { includeCompensation: !isEdit });
    if (hasValidationErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = toPayload(values);
      const employee = isEdit
        ? await updateEmployee(employeeId, payload)
        : await createEmployee(payload);

      if (!isEdit) {
        await upsertEmployeeSalary(employee.id, buildSalaryPayload(values));
      }

      navigate(EMPLOYEE_ROUTES.detail(employee.id));
    } catch (error) {
      setSubmitError(error.message ?? EMPLOYEE_MESSAGES.loadEmployeeError);
    } finally {
      setIsSubmitting(false);
    }
  }, [employeeId, isEdit, navigate, values]);

  const handleCancel = useCallback(() => {
    if (isEdit) {
      navigate(EMPLOYEE_ROUTES.detail(employeeId));
      return;
    }
    navigate(EMPLOYEE_ROUTES.directory);
  }, [employeeId, isEdit, navigate]);

  return {
    values,
    lookups,
    fieldErrors,
    submitError,
    loading,
    isSubmitting,
    showCompensation: !isEdit,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
