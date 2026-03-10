import { useRef, useState } from "react";
import styles from "../styles/AddBoardCard.module.css";

type Props = {
  onCreate: (name: string) => Promise<void> | void;
  onImport?: (file: File) => Promise<void>;
};

export function AddBoardCard({ onCreate, onImport }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleFileSelect() {
    fileInputRef.current?.click();
  }


  return (
    <div
      className={`${styles.addCard} ${creating ? styles.addCardActive : ""}`}
      onClick={handleOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        handleFileSelect();
      }}
      onTouchStart={() => {
        const timeout = setTimeout(handleFileSelect, 800);
        const clear = () => clearTimeout(timeout);
        document.addEventListener("touchend", clear, { once: true });
        document.addEventListener("touchmove", clear, { once: true });
      }}
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

      {onImport && (
        <input
          type="file"
          accept=".excalidraw"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}
    </div>
  );
}