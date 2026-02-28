// React
import { useEffect, useRef, useState } from 'react';

// Libs
import { useNavigate } from 'react-router-dom';

// Auth
import { useAuth } from '../auth/AuthContext';

// API
import { listBoards, createBoard } from '../api/boards';
import type { Board } from '../api/types';

// Components
import { Loader } from '../components/Loader';
import { BoardModal } from '../components/modals/AppBoardModal';

// Storage
import { deleteBoardLocal, dbPromise } from '../storage/boards';

// styles
import styles from './styles/AppPage.module.css';
import { BoardCard } from '../components/cards/BoardCard';
import { AddBoardCard } from '../components/cards/AddBoardCard';
import { UserModal } from '../components/modals/UserModal';

export function AppPage() {
  // --- data state
  const [boards, setBoards] = useState<Board[]>([]);
  const [localBoards, setLocalBoards] = useState<Set<number>>(new Set());

  // --- ui state
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [modalBoard, setModalBoard] = useState<Board | null>(null);
  const [UserModalOpen, setUserModalOpen] = useState(false);

  // --- derived
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const touchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  


  // --- effects 
  // page fade-in + load boards
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);

    listBoards()
      .then((res) => setBoards(res || []))
      .finally(() => setLoading(false));

    return () => clearTimeout(timeout);
  }, []);

  // load local boards info
  useEffect(() => {
    const fetchLocalBoards = async () => {
      const db = await dbPromise;
      const tx = db.transaction('boards', 'readonly');
      const store = tx.objectStore('boards');
      const keys = await store.getAllKeys();
      setLocalBoards(new Set(keys as number[]));
    };
    fetchLocalBoards();
  }, [boards]);


  // --- handlers
  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function handleCreateBoard(name: string) {
    const board = await createBoard(name);
    setBoards((prev) => [
      { id: board.id, name: board.name, updated_at: new Date().toISOString() },
      ...prev,
    ]);
  }

  const handleChangeBackgroundModal = () => {
    setUserModalOpen(true);
  }

  const handleTouchStart = () => {
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
    <div
      className={`${styles.pageContainer} ${
        visible ? styles.pageContainerVisible : ''
      }`}
    >
      {loading && <Loader />}

      {/* Header */}
      <div className={styles.header}>
        <div 
          className={styles.userPanel} 
          onContextMenu={(e) => {
          
          e.preventDefault();
          handleChangeBackgroundModal();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}>
          <span className={styles.loggedText}>{user?.login}</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Boards grid*/}
      <div className={styles.boardsGrid}>
        {/* Boards */}
        {boards.map((b) => (
          <BoardCard
            key={b.id}
            board={b}
            isLocal={localBoards.has(b.id)}
            onOpen={(id) => navigate(`/boards/${id}`)}
            onOpenModal={setModalBoard}
          />
        ))}

        {/* Add board */}
        <AddBoardCard onCreate={handleCreateBoard} />
      </div>

      
      {/* Modal for boards */}
      {modalBoard && (
        <BoardModal
          boardId={modalBoard.id}
          boardName={modalBoard.name}
          onClose={() => setModalBoard(null)}
          onUpdate={(newName) =>
            setBoards((prev) =>
              prev.map((b) =>
                b.id === modalBoard.id ? { ...b, name: newName } : b
              )
            )
          }
          onDelete={() =>
            setBoards((prev) => prev.filter((b) => b.id !== modalBoard.id))
          }
          onDeleteLocal={async () => {
            await deleteBoardLocal(modalBoard.id);
            setLocalBoards(prev => {
              const copy = new Set(prev);
              copy.delete(modalBoard.id);
              return copy;
            });
          }}
        />
      )}

      {UserModalOpen && ( <UserModal onClose={() => setUserModalOpen(false)} /> )}
    </div>
  );
}
