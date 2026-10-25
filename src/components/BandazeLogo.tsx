import React from 'react';

interface BandazeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'card' | 'plain';
}

export const BandazeLogo: React.FC<BandazeLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'card'
}) => {
  // Increased displayed size by ~50-70% to ensure high prominence and legibility
  const heightClasses = {
    sm: 'h-11 sm:h-12',        // ~44px - 48px (up from 32px)
    md: 'h-16 sm:h-[72px]',    // ~64px - 72px (up from 44px - 48px)
    lg: 'h-20 sm:h-24',        // ~80px - 96px (up from 56px - 64px)
    xl: 'h-28 sm:h-32'         // ~112px - 128px
  }[size];

  const logoImg = (
    <img
      src="/assets/aistudio/BANDAZE_transparent_06792d84.png"
      alt="BANDAZE — Bandaging the Gap of Healthcare"
      className={`${heightClasses} w-auto max-w-full object-contain select-none transition-transform`}
      loading="eager"
      decoding="async"
    />
  );

  if (variant === 'plain') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {logoImg}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-xs border border-teal-900/10 flex items-center justify-center p-3 sm:p-3.5 select-none transition-all hover:shadow-sm w-full ${className}`}
    >
      {logoImg}
    </div>
  );
};
