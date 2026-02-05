import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { AppPage } from '../pages/AppPage';
import { Navigate } from 'react-router-dom';

import { RequireAuth } from '../auth/RequireAuth';
import { BoardPage } from '../pages/BoardPage';


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
    path: '*',
    element: <Navigate to="/" replace />
  },
]);
