import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '@/components/layout/Loading';
import authService from '@/services/authService';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.getMyInfo();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        if (router.pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;

