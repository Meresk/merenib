import { useState, useEffect } from 'react';
import { updateBoard, deleteBoard, getBoard } from '../../api/boards';
import styles from './BoardModal.module.css';

type Props = {
  boardId: number;
  boardName: string;
  onClose: () => void;
  onUpdate?: (newName: string) => void;
  onDelete?: () => void;
};

export function BoardModal({ boardId, boardName, onClose, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<'default' | 'edit' | 'delete'>('default');
  const [name, setName] = useState(boardName);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const boardFull = await getBoard(boardId);
      await updateBoard(boardId, boardFull.data, name.trim());
      onUpdate?.(name.trim());
      setMode('default');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteBoard(boardId);
      onDelete?.();
      onClose();
    } finally {
      setLoading(false);
    }
  }

return (
  <div
    className={`${styles.overlay} ${visible ? styles.overlayVisible : ''}`}
    onClick={onClose}
  >
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      {/* Default mode */}
      <div className={`${styles.content} ${mode !== 'default' ? styles.hidden : ''}`}>
        <div className={styles.iconButtons}>
          <button onClick={() => setMode('edit')} className={styles.iconButton} title="Update">
            ✎
          </button>
          <button onClick={() => setMode('delete')} className={styles.iconButton} title="Delete">
            🗑
          </button>
        </div>
      </div>

      {/* Edit mode */}
      <div className={`${styles.content} ${mode !== 'edit' ? styles.hidden : ''}`}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Board name"
          className={styles.input}
          disabled={loading}
          autoFocus // Автофокус при переходе в режим редактирования
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
        <p className={styles.confirmText}>Delete this board?</p>
        <div className={styles.buttonRow}>
          <button onClick={handleDelete} className={styles.circleButton} disabled={loading}>
            ✓
          </button>
          <button onClick={() => setMode('default')} className={styles.circleButton} disabled={loading}>
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
