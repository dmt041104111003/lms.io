import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/login/AuthLayout';
import BrandingSection from '@/components/login/BrandingSection';
import LoginForm from '@/components/login/LoginForm';
import GuestGuard from '@/components/auth/GuestGuard';
import authService from '@/services/authService';

const Login: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: { email: string; password: string; rememberMe: boolean }) => {
    setError(null);
    setLoading(true);
    
    try {
      let username = data.email;
      if (data.email.toLowerCase().trim() !== 'admin' && data.email.includes('@')) {
        const emailParts = data.email.split('@');
        username = emailParts[0] || data.email;
      }
      
      const response = await authService.login({
        username: username,
        password: data.password,
      });
      
      if (response.authenticated) {
        if (data.rememberMe && response.token) {
          localStorage.setItem('access_token', response.token);
        }
        router.push('/home');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <Layout hideHeader={true} hideFooter={true}>
        <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
            <AuthLayout>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {error}
                </div>
              )}
              <LoginForm onSubmit={handleLogin} />
            </AuthLayout>
            <BrandingSection />
          </div>
        </div>
      </Layout>
    </GuestGuard>
  );
};

export default Login;
