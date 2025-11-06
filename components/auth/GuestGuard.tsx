import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import authService from '@/services/authService';

interface GuestGuardProps {
  children: React.ReactNode;
}

const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.getMyInfo();
        setIsAuthenticated(true);
        router.push('/home');
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
};

export default GuestGuard;

