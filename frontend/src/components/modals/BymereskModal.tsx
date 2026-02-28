import { useEffect, useState } from "react";
import styles from "./styles/BymereskModal.module.css";

type Props = {
  onClose: () => void;
};

export const BymereskModal = ({ onClose }: Props) => {
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
        <span style={{color: 'rgba(160, 160, 160, 0.83)'}}>mere-nib by meresk. 2026</span>
      </div>
    </div>
  );
};