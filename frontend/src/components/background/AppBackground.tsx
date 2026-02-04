import React from 'react';
import LightPillar from './LightPillar';

interface AppBackgroundProps {
  children: React.ReactNode;
  useLightPillar?: boolean;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children, useLightPillar }) => {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {useLightPillar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <LightPillar
            topColor="#a3dffb"
            bottomColor="#9eb6ff"
            // topColor="#8ef971"
            // bottomColor="#9eb6ff"
            intensity={0.7}
            rotationSpeed={0.2}
            glowAmount={0.001}
            pillarWidth={9.7}
            pillarHeight={0.4}
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
