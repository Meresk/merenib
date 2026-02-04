import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';

export function App() {
  return <RouterProvider router={router} />;
}
