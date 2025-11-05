import React from 'react';
import Logo from '@/components/ui/logo';

const BrandingSection: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gray-50 h-full items-center justify-center px-8 xl:px-12">
      <div className="max-w-md">
        <Logo 
          layout="stacked" 
          size="lg" 
          showText={true}
          className=""
        />
      </div>
    </div>
  );
};

export default BrandingSection;

