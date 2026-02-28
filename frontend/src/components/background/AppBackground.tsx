import React from 'react';
import LightPillar from './LightPillar';
import { usePillar } from './PillarContext';

interface AppBackgroundProps {
  children: React.ReactNode;
  useLightPillar?: boolean;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children, useLightPillar }) => {
  const { enabled, topColor, bottomColor } = usePillar();

  return (
    <div 
      style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          overflow: 'hidden',
          background: `
            linear-gradient(to bottom, ${topColor}, ${bottomColor}),
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08), transparent 60%)
          `,
      }}
    >
      {useLightPillar && enabled && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <LightPillar
            topColor={topColor}
            bottomColor={bottomColor}
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
