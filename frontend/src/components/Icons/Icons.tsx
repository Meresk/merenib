// Icons.tsx
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export const EditIcon: React.FC<IconProps> = ({ 
  size = 20, 
  strokeWidth = 1.8, 
  ...props 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    {...props}
  >
    <path d="M17 3L21 7L7 21H3V17L17 3Z" />
    <path d="M15 5L19 9" strokeWidth={strokeWidth} />
  </svg>
);

export const DeleteLocalIcon: React.FC<IconProps> = ({ 
  size = 20, 
  strokeWidth = 1.8, 
  ...props 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    {...props}
  >
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v12c0 2 3 4 8 4s8-2 8-4V6" />
    <line x1="9" y1="13" x2="15" y2="19" strokeWidth="2" />
    <line x1="15" y1="13" x2="9" y2="19" strokeWidth="2" />
  </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ 
  size = 20, 
  strokeWidth = 1.8, 
  ...props 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    {...props}
  >
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 3h6v4H9V3z" />
  </svg>
);

export const Icons = {
  Edit: EditIcon,
  DeleteLocal: DeleteLocalIcon,
  Delete: DeleteIcon,
};