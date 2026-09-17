import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  variant?: 'gradient' | 'glyph' | 'plain';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 24, 
  className = '',
  variant = 'gradient' 
}) => {
  if (variant === 'glyph') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path 
          d="M4.5 12.5L9.5 17.5L19.5 6.5" 
          stroke="currentColor" 
          strokeWidth="2.75" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M13.5 6.5H19.5V12.5" 
          stroke="currentColor" 
          strokeWidth="2.75" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    );
  }

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 text-white shadow-lg shadow-brand-500/25 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.58} 
        height={size * 0.58} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      >
        <path 
          d="M4.5 12.8L9.2 17.5L19.5 6.5" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M13.5 6.5H19.5V12.5" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
};

export default BrandLogo;
