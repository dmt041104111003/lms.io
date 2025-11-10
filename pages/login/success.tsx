import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import authService from '@/services/authService';
import Loading from '@/components/layout/Loading';
import { useMinLoading } from '@/hooks/useMinLoading';

const LoginSuccess: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoading(loading, 2000);

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
      } finally {
        setLoading(false);
      }
    };

    handleOAuthLoginSuccess();
  }, [router]);

  return showLoading ? <Loading /> : null;
};

export default LoginSuccess;

