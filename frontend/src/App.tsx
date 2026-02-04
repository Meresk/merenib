// App.tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';
import { AppBackground } from './components/background/AppBackground'
import { AuthProvider } from './auth/AuthContext';

export function App() {
  return (
    <AuthProvider>
      <AppBackground useLightPillar>
        <RouterProvider router={router} />
      </AppBackground>
    </AuthProvider>
  );
}
