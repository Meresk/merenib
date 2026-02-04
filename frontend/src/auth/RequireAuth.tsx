import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { JSX } from 'react';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    // TODO: надо красиво
    <div> Loading... </div>
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
