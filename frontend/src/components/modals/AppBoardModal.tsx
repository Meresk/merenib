import { useState, useEffect } from 'react';
import { updateBoard, deleteBoard, getBoard } from '../../api/boards';
import styles from './styles/AppBoardModal.module.css';
import { DeleteIcon, DeleteLocalIcon, EditIcon, ExportIcon } from '../icons/Icons';
import { loadBoardLocal } from '../../storage/boards';

type Props = {
  boardId: number;
  boardName: string;
  onClose: () => void;
  onUpdate?: (newName: string) => void;
  onDelete?: () => void;
  onDeleteLocal?: () => void;
};

export function BoardModal({ boardId, boardName, onClose, onUpdate, onDelete, onDeleteLocal}: Props) {
  const [mode, setMode] = useState<'default' | 'edit' | 'export' | 'delete' |'deleteLocal'>('default');
  const [name, setName] = useState(boardName);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errorNameUpdate, setErrorNameUpdate] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  async function handleSave() {
    if (!name.trim()) {
      setErrorNameUpdate(true);
      return;
    }
    setErrorNameUpdate(false);
    setLoading(true);
    try {
      const boardFull = await getBoard(boardId);
      await updateBoard(boardId, boardFull.data, name.trim());
      onUpdate?.(name.trim());
      setMode('default');
    } finally {
      setLoading(false);
      onClose();
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

  async function handleExport() {
    setLoading(true);

    try {
      const local = await loadBoardLocal(boardId);

      if (!local) {
        throw new Error("No local board data");
      }

      const data = {
        type: "excalidraw",
        version: 2,
        source: window.location.origin,
        elements: local.elements || [],
        appState: local.appState || {},
        files: local.files || {}
      };

      const blob = new Blob(
        [JSON.stringify(data)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${boardName.replace(/[^\w\d]+/g, "_")}.excalidraw`;
      a.click();

      URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      onClose();
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
          <button onClick={() => setMode('export')} className={styles.iconButton} title="Export">
            <ExportIcon/>
          </button>

          <button onClick={() => setMode('edit')} className={styles.iconButton} title="Update">
            <EditIcon/>
          </button>

          <button
            onClick={() => setMode('deleteLocal')}
            className={styles.iconButton}
            title="Delete from local storage"
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
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errorNameUpdate && e.target.value.trim()) {
              setErrorNameUpdate(false);
            }
          }}
          placeholder="Board name"
          className={`${styles.input} ${errorNameUpdate ? styles.inputError : ''}`}
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

      {/* Export mode */}
      <div className={`${styles.content} ${mode !== 'export' ? styles.hidden : ''}`}>
        <span> Export '{boardName}' board? </span>
        <div className={styles.buttonRow}>
          <button onClick={handleExport} className={styles.circleButton} disabled={loading}>
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
          <span className={styles.deleteWord}>Delete</span> this board?
        </p>
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
      <div className={`${styles.content} ${mode !== 'deleteLocal' ? styles.hidden : ''}`}>
        <p className={styles.confirmText}>
          <span className={styles.deleteWord}>Delete</span> from local storage?
        </p>
        <div className={styles.buttonRow}>
          <button
            onClick={async () => {
              if (onDeleteLocal) onDeleteLocal();
              onClose();
            }}
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
}
