import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '@/components/layout/Loading';
import authService from '@/services/authService';

interface GuestGuardProps {
  children: React.ReactNode;
}

const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.getMyInfo();
        setIsAuthenticated(true);
        router.push('/home');
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      {loading && <Loading />}
      {children}
    </>
  );
};

export default GuestGuard;

