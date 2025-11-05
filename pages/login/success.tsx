import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import authService from '@/services/authService';

const LoginSuccess: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const handleGoogleLoginSuccess = async () => {
      try {
        const user = await authService.getMyInfo();
        if (user) {
          router.push('/home');
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Login success error:', err);
        router.push('/login');
      }
    };

    handleGoogleLoginSuccess();
  }, [router]);

  return null;
};

export default LoginSuccess;

