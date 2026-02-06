import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { JSX } from 'react';
import { Loader } from '../components/Loader';

export function AdminRequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.is_admin) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
