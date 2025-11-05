import React from 'react';

interface DividerProps {
  text?: string;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ text = 'or', className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-1 border-t border-gray-300"></div>
      <span className="px-3 text-xs text-gray-500">{text}</span>
      <div className="flex-1 border-t border-gray-300"></div>
    </div>
  );
};

export default Divider;

