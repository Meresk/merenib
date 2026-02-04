import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await login(loginValue, password);
      navigate('/app');
    } catch {
      setError('Неверный логин или пароль');
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        placeholder="login"
        value={loginValue}
        onChange={(e) => setLoginValue(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      {error && <div>{error}</div>}
    </form>
  );
}
