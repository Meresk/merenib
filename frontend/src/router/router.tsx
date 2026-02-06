import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { AppPage } from '../pages/AppPage';
import { Navigate } from 'react-router-dom';

import { RequireAuth } from '../auth/RequireAuth';
import { BoardPage } from '../pages/BoardPage';
import { AdminPage } from '../pages/AdminPage';
import { AdminRequireAuth } from '../auth/AdminRequireAuth';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppPage />
      </RequireAuth>
    ),
  },
  {
    path: '/boards/:id',
    element: (
      <RequireAuth>
        <BoardPage />
      </RequireAuth>
    ),
  },
  {
    path: 'dashboard',
    element: (
      <AdminRequireAuth>
        <AdminPage />
      </AdminRequireAuth>
    )
  },
  {
    path: '*',
    element: <Navigate to="/app" replace />
  },
]);
