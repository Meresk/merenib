// React
import { useState, useEffect, useRef } from 'react';

// Libs
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';

// Auth module
import { useAuth } from '../auth/AuthContext';

// Styles
import styles from './styles/LoginPage.module.css';
import { ChangeBackgroundModal } from '../components/modals/ChangeBackgroundModal';


export const LoginPage = () => {
  // --- auth state
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState(false);

  // --- ui state
  const [loginFormOpen, setLoginFormOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [changeBackgroundModalOpen, setChangeBackgroundModalOpen] = useState(false);

  // --- theme state
  const [topColor, setTopColor] = useState('#a3dffb');
  const [bottomColor, setBottomColor] = useState('#9eb6ff');

  // --- derived
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const loginError = submitted && !loginValue;
  const passwordError = submitted && !password;
  const touchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);


  // --- effects
  // if already authorized - redirect to main page
  useEffect(() => {
    if (!user) return;
    
    if (user.is_admin) navigate('/dashboard')
    else navigate('app');
  }, [user, navigate]);

  // if already have variables for background - set them
  useEffect(() => {
    const storedTop = localStorage.getItem('pillarTopColor');
    const storedBottom = localStorage.getItem('pillarBottomColor');
    if (storedTop) setTopColor(storedTop);
    if (storedBottom) setBottomColor(storedBottom);
  }, []);


  // --- handlers
  const handleSaveColors = () => {
    localStorage.setItem('pillarTopColor', topColor);
    localStorage.setItem('pillarBottomColor', bottomColor);
    window.location.reload();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

  const handleOpenLoginFrom = () => {
    setLoginFormOpen(true);
    setSubmitted(false);
    setAuthError(false);
  };

  const handleCloseLoginForm = () => {
    setLoginFormOpen(false);
    setSubmitted(false);
    setAuthError(false);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginValue(e.target.value);
    if (submitted) setSubmitted(false);
    setAuthError(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (submitted) setSubmitted(false);
    setAuthError(false);
  };

  const handleOpenColorMenu = () => {
    if (!colorMenuOpen) setColorMenuOpen(true);
  };

  const handleChangeBackgroundModal = () => {
    if (colorMenuOpen) return;
    setChangeBackgroundModalOpen(true);
  }

  const handleTouchStart = () => {
    if (colorMenuOpen) return;

    touchTimeout.current = setTimeout(() => {
      handleChangeBackgroundModal();
    }, 800);
  };

  const handleTouchEnd = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
  };



  return (
    <>
      <div
        className={`${styles.loginMorph} ${loginFormOpen ? styles.open : ''} ${
          authError ? styles.formError : ''
        }`}
      >
        {/* Center button, open login form */}
        <button className={styles.centerButton} onClick={handleOpenLoginFrom}>?</button>
        
        {/* Login form */}
        <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
          <input
            placeholder="login"
            value={loginValue}
            onChange={handleLoginChange}
            className={`${styles.loginInput} ${
              loginError ? styles.inputError : ''
            }`}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={handlePasswordChange}
            className={`${styles.loginInput} ${
              passwordError ? styles.inputError : ''
            }`}
          />
          <button type="submit" className={styles.loginButton}>
            inlet
          </button>
          <button type="button" className={styles.cancelButton} onClick={handleCloseLoginForm}>
            outlet
          </button>
        </form>
      </div>

      {/* 'change background color button*/}
      <div
        className={`${styles.colorMorph} ${colorMenuOpen ? styles.open : ''}`}
        onClick={handleOpenColorMenu}
        onContextMenu={(e) => {
          if (colorMenuOpen) return;
          
          e.preventDefault();
          handleChangeBackgroundModal();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        {/* signature */}
        <span className={styles.creatortxtLabel}>by. meresk.</span>
        
        {/* change background form */}
        <div
          className={styles.colorMenuPanel}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{height: '100px'}}>
              <HexColorPicker className={styles.smallPicker} color={topColor} onChange={setTopColor} />
          </div>
          <div style={{height: '100px'}}>
              <HexColorPicker className={styles.smallPicker} color={bottomColor} onChange={setBottomColor} />
          </div>
          <button onClick={handleSaveColors}>✓</button>
          <button onClick={() => setColorMenuOpen(false)}>×</button>
        </div>
      </div>

      {changeBackgroundModalOpen && (
        <ChangeBackgroundModal onClose={() => setChangeBackgroundModalOpen(false)} />
      )}
    </>
  );
};
