import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { listBoards, createBoard } from '../api/boards';
import type { Board } from '../api/types';
import styles from './styles/AppPage.module.css';

export function AppPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    listBoards()
      .then((res) => setBoards(res || []))
      .finally(() => setLoading(false));
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
    <div className={styles.pageContainer}>
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
      {loading ? (
        <div>loading…</div>
      ) : (
        <div className={styles.boardsGrid}>
          {boards.map((b) => (
            <div
              key={b.id}
              className={styles.boardCard}
              onClick={() => navigate(`/boards/${b.id}`)}
            >
              <div>{b.name}</div>
              <div className={styles.boardUpdated}>
                updated {new Date(b.updated_at).toLocaleString()}
              </div>
            </div>
          ))}

          {/* Add board */}
          <div className={styles.addCard}>
            {creatingBoard ? (
              <div className={styles.createForm}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Board name"
                  className={styles.input}
                />
                <div className={styles.createButtons}>
                  <button onClick={handleCreate}>Create</button>
                  <button onClick={() => setCreatingBoard(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setCreatingBoard(true)}
                className={styles.addText}
              >
                + new board
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
