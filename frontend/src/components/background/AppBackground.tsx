import React, { useEffect, useState } from 'react';
import LightPillar from './LightPillar';

interface AppBackgroundProps {
  children: React.ReactNode;
  useLightPillar?: boolean;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children, useLightPillar }) => {
  const [topColor, setTopColor] = useState('#a3dffb');
  const [bottomColor, setBottomColor] = useState('#9eb6ff');

  // Загружаем цвета из localStorage при монтировании
  useEffect(() => {
    const storedTop = localStorage.getItem('pillarTopColor');
    const storedBottom = localStorage.getItem('pillarBottomColor');
    if (storedTop) setTopColor(storedTop);
    if (storedBottom) setBottomColor(storedBottom);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {useLightPillar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <LightPillar
            topColor={topColor}
            bottomColor={bottomColor}
            // topColor="#8ef971"
            // bottomColor="#9eb6ff"
            intensity={0.6}
            rotationSpeed={0.2}
            glowAmount={0.001}
            pillarWidth={11.1}
            pillarHeight={0.5}
            noiseIntensity={0.5}
            pillarRotation={25}
            interactive={false}
            mixBlendMode="screen"
            quality="high"
          />
        </div>
      )}

      {/* Всё остальное поверх */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};
