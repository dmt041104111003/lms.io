import React from 'react';

interface AvatarSpinnerOverlayProps {
  visible?: boolean;
  imageSrc?: string;
  bgOpacity?: number; // 0..1
}

const AvatarSpinnerOverlay: React.FC<AvatarSpinnerOverlayProps> = ({
  visible = true,
  imageSrc = '/images/common/loading.png',
  bgOpacity = 0.85,
}) => {
  if (!visible) return null;

  const bgClass = `bg-white/${Math.round((bgOpacity ?? 0.85) * 100)}`;

  return (
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center ${bgClass} backdrop-blur-sm`}>
      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
        {/* Spinner ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#00A3FF]/30 border-t-[#00A3FF] animate-spin" />
        {/* Inner avatar holder */}
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center overflow-hidden">
          <img
            src={imageSrc}
            className="w-full h-full object-contain"
            alt="Loading"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AvatarSpinnerOverlay;
