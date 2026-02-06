import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useRef, useState, useEffect } from 'react';
import styles from './TruncatedText.module.css';

interface TruncatedTextProps {
  text: string;
  className?: string;
}

export function TruncatedText({ text, className }: TruncatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [text]);

  return (
    <>
      <div ref={textRef} className={className}>
        {text}
      </div>

      {isTruncated && textRef.current && (
        <Tippy
          content={text}
          placement="top"
          animation="shift-away"
          delay={[100, 50]}
          className={styles.tooltipBox}
          reference={textRef.current}
        />
      )}
    </>
  );
}
