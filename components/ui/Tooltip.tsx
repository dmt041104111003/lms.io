import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && parentRef.current && tooltipRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current.offsetWidth || 200;
      const tooltipHeight = tooltipRef.current.offsetHeight || 50;
      
      setPosition({
        top: parentRect.top + (parentRect.height / 2) - (tooltipHeight / 2),
        left: parentRect.left - tooltipWidth - 8, 
      });
    }
  }, [show]);

  return (
    <>
      <div
        ref={parentRef}
        className={`relative inline-block ${className}`}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-2 text-xs text-white bg-gray-900 rounded shadow-lg max-w-xs whitespace-normal pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      )}
    </>
  );
};

export default Tooltip;

