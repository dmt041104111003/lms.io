import React from 'react';

type LogoLayout = 'inline' | 'stacked';
type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  className?: string;
  compact?: boolean; 
  showText?: boolean;
  layout?: LogoLayout;
  size?: LogoSize;
}

export default function Logo({ className = '', compact = false, showText = true, layout = 'stacked', size = 'md' }: LogoProps) {
  if (compact) {
    return (
      <img
        src="/images/common/loading.png"
        className={className || 'h-8 w-auto flex-shrink-0 object-contain'}
        alt="Cardano2VN Logo"
        draggable={false}
        style={{ aspectRatio: '1/1' }}
      />
    );
  }

  if (layout === 'inline') {
    const imgSize = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-10';
    const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';
    const subtitleSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';
    return (
      <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
        <img
          src="/images/common/loading.png"
          className={`${imgSize} w-auto flex-shrink-0 object-contain`}
          alt="Cardano2VN Logo"
          draggable={false}
          style={{ aspectRatio: '1/1' }}
        />
        {showText && (
          <div className="leading-tight min-w-0 flex-shrink">
            <div className={`${titleSize} font-semibold text-[#003C8C] dark:text-[#00A3FF] break-words`}>CARDANO2VN.IO</div>
            <div className={`${subtitleSize} uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 break-words`}>BREAK THE BLOCKS</div>
          </div>
        )}
      </div>
    );
  }

  const boxSize = size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-56 h-56' : 'w-48 h-48';
  const titleSizeStacked = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-[36px]' : 'text-[32px]';
  const subtitleSizeStacked = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`text-center ${className}`}>
      <div className={`relative ${boxSize} mx-auto mb-8`}>
        <img
          src="/images/common/loading.png"
          className="w-full h-full object-contain"
          alt="Cardano2VN Logo"
          draggable={false}
        />
      </div>
      {showText && (
        <>
          <div className={`${titleSizeStacked} font-bold text-[#003C8C] dark:text-[#00A3FF] mb-2`}>CARDANO2VN.IO</div>
          <div className={`${subtitleSizeStacked} text-[#666666] dark:text-gray-400 tracking-[0.2em] uppercase`}>BREAK THE BLOCKS</div>
        </>
      )}
    </div>
  );
}


