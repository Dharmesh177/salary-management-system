import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute.jsx';
import { LookupsProvider } from '../features/employees/context/LookupsContext.jsx';
import AppLayout from './AppLayout.jsx';

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <LookupsProvider>
        <AppLayout />
      </LookupsProvider>
    </ProtectedRoute>
  );
}
