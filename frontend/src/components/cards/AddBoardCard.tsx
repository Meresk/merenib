import { useState } from "react";
import styles from "../styles/AddBoardCard.module.css";

type Props = {
  onCreate: (name: string) => Promise<void> | void;
};

export function AddBoardCard({ onCreate }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;

    await onCreate(name.trim());
    setName("");
    setCreating(false);
  }

  function handleOpen() {
    if (!creating) setCreating(true);
  }

  function handleCancel() {
    setCreating(false);
    setName("");
  }

  return (
    <div
      className={`${styles.addCard} ${
        creating ? styles.addCardActive : ""
      }`}
      onClick={handleOpen}
    >
      {/* collapsed */}
      <div
        className={`${styles.addContent} ${
          creating ? styles.addHidden : ""
        }`}
      >
        <div className={styles.addText}>+ new board</div>
      </div>

      {/* form */}
      <div
        className={`${styles.addContent} ${
          !creating ? styles.addHidden : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.createForm}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className={styles.input}
          />
          <div className={styles.createButtons}>
            <button onClick={handleCreate} className={styles.circleButton}>
              ✓
            </button>
            <button onClick={handleCancel} className={styles.circleButton}>
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}