import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import styles from './styles/LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) navigate('/app');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(loginValue, password);
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <>
      {!showForm && (
        <button className={styles.centerButton} onClick={() => setShowForm(true)}>
          ?
        </button>
      )}

      <form
        onSubmit={handleSubmit}
        className={styles.loginForm}
        style={{ display: showForm ? 'flex' : 'none' }}
      >
        <input
          placeholder="Login"
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          className={styles.loginInput}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.loginInput}
        />
        <button type="submit" className={styles.loginButton}>
          Войти
        </button>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => setShowForm(false)}
        >
          Отмена
        </button>
        {error && <div className={styles.errorText}>{error}</div>}
      </form>

      <div className={styles.creatortxt}>by. meresk.</div>
    </>
  );
};
