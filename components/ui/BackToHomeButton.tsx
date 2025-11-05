import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

const BackToHomeButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`mb-2 sm:mb-3 ${className}`}>
      <Link 
        href="/home"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>
    </div>
  );
};

export default BackToHomeButton;

