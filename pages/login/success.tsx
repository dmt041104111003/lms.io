import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import authService from '@/services/authService';

const LoginSuccess: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthLoginSuccess = async () => {
      try {
        const user = await authService.getMyInfo();
        if (user) {
          router.push('/home');
        } else {
          router.push('/login?error=oauth_failed');
        }
      } catch (err) {
        console.error('OAuth login error:', err);
        router.push('/login?error=oauth_failed');
      }
    };

    handleOAuthLoginSuccess();
  }, [router]);

  return null;
};

export default LoginSuccess;

