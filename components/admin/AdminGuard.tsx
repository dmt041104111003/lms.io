import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '@/components/layout/Loading';
import authService from '@/services/authService';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await authService.getMyInfo();
        const isAdminUser = user.role?.name === 'ADMIN';
        setIsAdmin(isAdminUser);
        
        if (!isAdminUser) {
          router.push('/home');
        }
      } catch (error) {
        setIsAdmin(false);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  if (isAdmin === null || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;

