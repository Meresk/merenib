import { createContext, useContext, useEffect, useState } from 'react';

type PillarContextType = {
  enabled: boolean;
  toggle: () => void;
  topColor: string;
  bottomColor: string;
  setTopColor: (c: string) => void;
  setBottomColor: (c: string) => void;
};

const PillarContext = createContext<PillarContextType | null>(null);

export const PillarProvider = ({ children }: { children: React.ReactNode }) => {
  const [enabled, setEnabled] = useState(true);
  const [topColor, setTopColor] = useState('#a3dffb');
  const [bottomColor, setBottomColor] = useState('#9eb6ff');

  useEffect(() => {
    const storedEnabled = localStorage.getItem('pillarEnabled');
    const storedTop = localStorage.getItem('pillarTopColor');
    const storedBottom = localStorage.getItem('pillarBottomColor');

    if (storedEnabled !== null) setEnabled(storedEnabled === 'true');
    if (storedTop) setTopColor(storedTop);
    if (storedBottom) setBottomColor(storedBottom);
  }, []);

  useEffect(() => {
    localStorage.setItem('pillarEnabled', String(enabled));
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem('pillarTopColor', topColor);
  }, [topColor]);

  useEffect(() => {
    localStorage.setItem('pillarBottomColor', bottomColor);
  }, [bottomColor]);

  const toggle = () => setEnabled(prev => !prev);

  return (
    <PillarContext.Provider
      value={{
        enabled,
        toggle,
        topColor,
        bottomColor,
        setTopColor,
        setBottomColor
      }}
    >
      {children}
    </PillarContext.Provider>
  );
};

export const usePillar = () => {
  const ctx = useContext(PillarContext);
  if (!ctx) throw new Error('usePillar must be inside PillarProvider');
  return ctx;
};