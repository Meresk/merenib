import { useEffect, useState } from "react";
import styles from "./styles/UserModal.module.css";
import { DeleteIcon, DeleteLocalIcon, EditIcon } from "../icons/Icons";

type Props = {
  onClose: () => void;
};

export const UserModal = ({ onClose }: Props) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'default' | 'edit' | 'delete' | 'deleteLocalData'>('default');
  const [loading, setLoading] = useState(false);
  const [errorNameUpdate, setErrorNameUpdate] = useState(false);

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

  async function handleSave() {
     
  }
  
  async function handleDelete() {
    
  }

  async function handleDeleteLocalData() {

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
          placeholder="User name"
          disabled={loading}
          autoFocus
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