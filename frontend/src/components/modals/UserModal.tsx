import { useEffect, useState } from "react";
import styles from "./styles/UserModal.module.css";
import { DeleteIcon, DeleteLocalIcon, EditIcon } from "../icons/Icons";
import { deleteUser, updateUser } from "../../api/users";
import { useAuth } from "../../auth/AuthContext";
import { logout } from "../../api/auth";
import { clearAllUserData } from "../../storage/boards";
import { useNavigate } from "react-router-dom";

type Props = {
  onClose: () => void;
  onLocalDataCleared?: () => void
};

export const UserModal = ({ onClose, onLocalDataCleared }: Props) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'default' | 'edit' | 'delete' | 'deleteLocalData'>('default');
  const [loading, setLoading] = useState(false);
  const [errorNameUpdate, setErrorNameUpdate] = useState(false);

  const [editLogin, setEditLogin] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const navigate = useNavigate();

  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (user?.login) {
      setEditLogin(user.login);
    }
  }, [user]);

  async function handleSave() {
    try {
      setLoading(true);

      await updateUser(user!.id, {
        login: editLogin !== user?.login ? editLogin : undefined,
        password: editPassword || undefined,
      });

      await refreshUser();
      onClose();

    } catch (err) {
      console.error(err);
      setErrorNameUpdate(true);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleDelete() {
    try {
      setLoading(true);

      // удаление пользователя
      await deleteUser(user!.id);
      // удаление локальной базы пользователя
      await clearAllUserData();
      // логаут
      await logout();

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 0);

      onClose();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteLocalData() {
    try {
      setLoading(true);
      // удаление локальной базы пользователя
      await clearAllUserData();
      // обновление state чтобы иконки что доски есть в indexedDB не отображались
      onLocalDataCleared?.();

      onClose();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`${styles.overlay} ${visible ? styles.overlayVisible : ""}`}
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${visible ? styles.modalVisible : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Default mode */}
      <div className={`${styles.content} ${mode !== 'default' ? styles.hidden : ''}`}>
        <div className={styles.iconButtons}>
          <button onClick={() => setMode('edit')} className={styles.iconButton} title="Update">
            <EditIcon/>
          </button>

          <button
            onClick={() => setMode('deleteLocalData')}
            className={styles.iconButton}
            title="Delete all data from local storage"
          >
            <DeleteLocalIcon/>
          </button>
          
          <button onClick={() => setMode('delete')} className={styles.iconButton} title="Delete">
            <DeleteIcon/>
          </button>
        </div>
      </div>

      {/* Edit mode */}
      <div className={`${styles.content} ${mode !== 'edit' ? styles.hidden : ''}`}>
        <input
          className={`${styles.input} ${errorNameUpdate ? styles.inputError : ''}`}
          placeholder="login"
          disabled={loading}
          autoFocus
          value={editLogin}
          onChange={(e) => setEditLogin(e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="password"
          disabled={loading}
          autoFocus
          value={editPassword}
          onChange={(e) => setEditPassword(e.target.value)}
        />
        <div className={styles.buttonRow}>
          <button onClick={handleSave} className={styles.circleButton} disabled={loading}>
            ✓
          </button>
          <button onClick={() => setMode('default')} className={styles.circleButton} disabled={loading}>
            ✕
          </button>
        </div>
      </div>

      {/* Delete mode */}
      <div className={`${styles.content} ${mode !== 'delete' ? styles.hidden : ''}`}>
        <p className={styles.confirmText}>
          <span className={styles.deleteWord}>Delete</span> your account?</p>
        <div className={styles.buttonRow}>
          <button onClick={handleDelete} className={styles.circleButton} disabled={loading}>
            ✓
          </button>
          <button onClick={() => setMode('default')} className={styles.circleButton} disabled={loading}>
            ✕
          </button>
        </div>
      </div>

      {/* Delete local mode */}
      <div className={`${styles.content} ${mode !== 'deleteLocalData' ? styles.hidden : ''}`}>
        <p className={styles.confirmText}>
          <span className={styles.deleteWord}>Delete</span> all data from local storage?</p>
        <div className={styles.buttonRow}>
          <button
            onClick={handleDeleteLocalData}
            className={styles.circleButton}
            disabled={loading}
          >
            ✓
          </button>
          <button
            onClick={() => setMode('default')}
            className={styles.circleButton}
            disabled={loading}
          >
            ✕
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};