import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { AppPage } from '../pages/AppPage';

import { RequireAuth } from '../auth/RequireAuth';

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
]);
