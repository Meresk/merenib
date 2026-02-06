import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { listBoards, createBoard } from '../api/boards';
import type { Board } from '../api/types';
import styles from './styles/AppPage.module.css';
import { TruncatedText } from '../components/TruncatedText';
import { Loader } from '../components/Loader';

export function AppPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newName, setNewName] = useState('');

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // ставим задержку, чтобы CSS transition сработала
    const timeout = setTimeout(() => setVisible(true), 10);

    listBoards()
      .then((res) => setBoards(res || []))
      .finally(() => setLoading(false));

    return () => clearTimeout(timeout);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function handleCreate() {
    if (!newName.trim()) return;

    const board = await createBoard(newName.trim());
    setBoards((prev) => [
      { id: board.id, name: board.name, updated_at: new Date().toISOString() },
      ...prev,
    ]);
    setNewName('');
    setCreatingBoard(false);
  }

    return (
    <div
      className={`${styles.pageContainer} ${
        visible ? styles.pageContainerVisible : ''
      }`}
    >
      {loading && <Loader />}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userPanel}>
          <span className={styles.loggedText}>{user?.login}</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Boards */}
      
      <div className={styles.boardsGrid}>
        {boards.map((b) => (
          <div
            key={b.id}
            className={styles.boardCard}
            onClick={() => navigate(`/boards/${b.id}`)}
           >
            <TruncatedText text={b.name} className={styles.boardName} />
            <div className={styles.boardUpdated}>
              updated {new Date(b.updated_at).toLocaleString()}
            </div>
          </div>
        ))}

        {/* Add board */}
        <div
          className={`${styles.addCard} ${
            creatingBoard ? styles.addCardActive : ''
          }`}
          onClick={() => !creatingBoard && setCreatingBoard(true)}
        >
          {/* Текст "+ new board" */}
          <div
            className={`${styles.addContent} ${
              creatingBoard ? styles.addHidden : ''
            }`}
          >
             <div className={styles.addText}>+ new board</div>
          </div>

           {/* Форма */}
          <div
            className={`${styles.addContent} ${
              !creatingBoard ? styles.addHidden : ''
            }`}
          >
            <div className={styles.createForm}>
               <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="name"
                className={styles.input}
              />
              <div className={styles.createButtons}>
                <button
                  onClick={handleCreate}
                  className={styles.circleButton}
                >
                  ✓
                </button>
                <button
                  onClick={() => setCreatingBoard(false)}
                  className={styles.circleButton}
                >
                  ×
                </button>
              </div>
          </div>
          </div>
        </div>
       </div>
    </div>
  );
}
