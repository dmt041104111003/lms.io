import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import authService from '@/services/authService';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

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
      }
    };

    checkAdmin();
  }, [router]);

  if (isAdmin === null || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;

