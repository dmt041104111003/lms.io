import React from 'react';
import Logo from '@/components/ui/logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/85 backdrop-blur-sm transition-opacity">
      <div className="pointer-events-none select-none fixed right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 opacity-20">
        <div className="relative w-[900px] h-[900px] sm:w-[1500px] sm:h-[1500px] md:w-[2400px] md:h-[2400px] rounded-full bg-gradient-to-br from-[#00A3FF]/10 to-[#003C8C]/10">
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#00A3FF]/20 to-[#003C8C]/20">
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#00A3FF]/30 to-[#003C8C]/30">
              <div className="absolute inset-4 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/images/common/loading.png"
                  className="w-full h-full object-contain"
                  alt="Cardano2VN Logo"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center z-10">
        <Logo />
        <div className="mt-6 flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#00A3FF] rounded-full loading-dot"></div>
            <div className="w-2 h-2 bg-[#00A3FF] rounded-full loading-dot"></div>
            <div className="w-2 h-2 bg-[#00A3FF] rounded-full loading-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 