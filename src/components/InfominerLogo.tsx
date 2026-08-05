import React from 'react';

interface InfominerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light' | 'white';
}

export const InfominerLogo: React.FC<InfominerLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'dark',
}) => {
  // Dimensions based on size
  const iconHeight = size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 44 : 56;
  const iconWidth = Math.round(iconHeight * 1.2);

  const textClass =
    textColor === 'white' || textColor === 'light'
      ? 'text-white'
      : 'text-[#2d3e50]';

  const textSizeClass =
    size === 'sm'
      ? 'text-base font-extrabold tracking-tight'
      : size === 'md'
      ? 'text-xl font-black tracking-tight'
      : size === 'lg'
      ? 'text-2xl font-black tracking-tight'
      : 'text-3xl font-black tracking-tight';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3 Tilted Card Stack Graphic matching exact logo */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
      >
        {/* Layer 1 - Gold (Left/Back) */}
        <polygon
          points="15,25 45,10 35,75 5,90"
          fill="#E8A020"
          rx="4"
        />
        {/* Layer 2 - Orange (Middle) */}
        <polygon
          points="40,20 70,5 60,80 30,95"
          fill="#EB8A23"
          rx="4"
        />
        {/* Layer 3 - Dark Navy Slate (Front/Right) */}
        <polygon
          points="65,15 108,0 95,85 52,100"
          fill="#2D3E50"
          rx="4"
        />
      </svg>

      {showText && (
        <span className={`${textSizeClass} ${textClass} font-sans leading-none`}>
          Infominer
        </span>
      )}
    </div>
  );
};
