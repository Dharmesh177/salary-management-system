import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteEmployee, fetchEmployee } from '../../../api/employees.js';
import { EMPLOYEE_ROUTES } from '../constants.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';

export function useEmployeeDetail(employeeId) {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployee() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchEmployee(employeeId);
        if (!cancelled) {
          setEmployee(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setEmployee(null);
          setError(loadError.message ?? EMPLOYEE_MESSAGES.loadEmployeeError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEmployee();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const openDeleteDialog = useCallback(() => {
    setDeleteError(null);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!deleting) {
      setDeleteDialogOpen(false);
    }
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteEmployee(employeeId);
      navigate(EMPLOYEE_ROUTES.directory);
    } catch (deleteErr) {
      setDeleteError(deleteErr.message ?? EMPLOYEE_MESSAGES.deleteFailed);
    } finally {
      setDeleting(false);
    }
  }, [employeeId, navigate]);

  return {
    employee,
    loading,
    error,
    deleting,
    deleteDialogOpen,
    deleteError,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  };
}
