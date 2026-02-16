// App.tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';
import { AppBackground } from './components/background/AppBackground'
import { AuthProvider } from './auth/AuthContext';
import { Toaster } from 'react-hot-toast';

export function App() {
  return (
    <AuthProvider>
      <AppBackground useLightPillar>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(30,30,30,0.7)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AppBackground>
    </AuthProvider>
  );
}
