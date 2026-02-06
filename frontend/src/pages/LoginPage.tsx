import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import styles from './styles/LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    if (user.is_admin) navigate('/dashboard')
    else navigate('app');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setAuthError(false);

    if (!loginValue || !password) return;

    try {
      await login(loginValue, password);
    } catch {
      setAuthError(true);
    }
  };

  const loginError = submitted && !loginValue;
  const passwordError = submitted && !password;

  return (
    <>
      <div
        className={`${styles.morph} ${open ? styles.open : ''} ${
          authError ? styles.formError : ''
        }`}
      >
        <button
          className={styles.centerButton}
          onClick={() => {
            setOpen(true);
            setSubmitted(false);
            setAuthError(false);
          }}
        >
          ?
        </button>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            placeholder="login"
            value={loginValue}
            onChange={(e) => {
              setLoginValue(e.target.value);
              if (submitted) setSubmitted(false);
              setAuthError(false);
            }}
            className={`${styles.loginInput} ${
              loginError ? styles.inputError : ''
            }`}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (submitted) setSubmitted(false);
              setAuthError(false);
            }}
            className={`${styles.loginInput} ${
              passwordError ? styles.inputError : ''
            }`}
          />
          <button type="submit" className={styles.loginButton}>
            inlet
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => {
              setOpen(false);
              setSubmitted(false);
              setAuthError(false);
            }}
          >
            outlet
          </button>
        </form>
      </div>

      <div className={styles.creatortxt}>by. meresk.</div>
    </>
  );
};
