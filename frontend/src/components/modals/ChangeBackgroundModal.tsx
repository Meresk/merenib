import { useEffect, useState } from "react";
import styles from "./styles/ChangeBackgroundModal.module.css";

type Props = {
  onClose: () => void;
};

export const ChangeBackgroundModal = ({ onClose }: Props) => {
  const [visible, setVisible] = useState(false);

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

  return (
    <div
      className={`${styles.overlay} ${visible ? styles.overlayVisible : ""}`}
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${visible ? styles.modalVisible : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.circleButton}>0</button>
      </div>
    </div>
  );
};