import { createPortal } from 'react-dom';
import styles from './Loader.module.css';

export function Loader() {
  return createPortal(
    <div className={styles.loaderWrap}>
      <div className={styles.loader} />
    </div>,
    document.body
  );
}
