import React from 'react';
import Logo from '@/components/ui/logo';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

interface AuthLayoutProps {
  children: React.ReactNode;
  showMobileLogo?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, showMobileLogo = true }) => {
  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-4 lg:overflow-y-auto">
      <div className="w-full max-w-md">
        <BackToHomeButton />

        {showMobileLogo && (
          <div className="text-center mb-3 sm:mb-4 lg:hidden">
            <Logo 
              layout="stacked" 
              size="sm" 
              showText={true}
              className="mb-1"
            />
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

