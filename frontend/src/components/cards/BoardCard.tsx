import { useRef } from "react";
import type { Board } from "../../api/types";
import styles from "../styles/BoardCard.module.css"
import { TruncatedText } from "../TruncatedText";

type Props = {
  board: Board;
  isLocal: boolean;
  onOpen: (id: number) => void;
  onOpenModal: (board: Board) => void;
};

export function BoardCard({ board, isLocal, onOpen, onOpenModal }: Props) {
  const touchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    touchTimeout.current = setTimeout(() => {
      onOpenModal(board);
    }, 800);
  };

  const handleTouchEnd = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
  }

  return (
    <div
      className={styles.boardCard}
      onClick={() => onOpen(board.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenModal(board);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
        <TruncatedText text={board.name} className={styles.boardName} />

        <div className={styles.boardFooter}>
            <div className={styles.boardUpdated}>
                updated {new Date(board.updated_at).toLocaleString()}
            </div>
            {isLocal && (
                <div className={styles.localIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <ellipse cx="12" cy="6" rx="8" ry="3"/>
                    <path d="M4 6v12c0 2 3 4 8 4s8-2 8-4V6"/>
                    <polyline points="9 15 11 17 15 13" strokeWidth="2"/>
                 </svg>
                </div>
            )}
        </div>
    </div>
  );
}