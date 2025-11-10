import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/login/AuthLayout';
import BrandingSection from '@/components/login/BrandingSection';
import LoginForm from '@/components/login/LoginForm';
import GuestGuard from '@/components/auth/GuestGuard';
import ToastContainer from '@/components/ui/ToastContainer';
import SEO from '@/components/ui/SEO';
import { useToast } from '@/hooks/useToast';
import authService from '@/services/authService';

const Login: React.FC = () => {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const { error: urlError, signup, reset } = router.query;
      if (urlError === 'oauth_failed') {
        error('OAuth login failed. Please try again.');
      } else if (signup === 'success') {
        success('Account created successfully! Please login.');
      } else if (reset === 'success') {
        success('Password reset successfully! Please login.');
      }
      // Clean up URL params
      if (urlError || signup || reset) {
        router.replace('/login', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query, router, error, success]);

  const handleLogin = async (data: { email: string; password: string; rememberMe: boolean }) => {
    try {
      setSubmitting(true);
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });
      
      if (response.authenticated) {
        if (data.rememberMe && response.token) localStorage.setItem('access_token', response.token);
        success('Login successful!');
        router.push('/home');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GuestGuard>
      <SEO
        title="Login - lms.cardano2vn.io"
        description="Sign in to your Cardano2VN LMS account to access courses, track your progress, and continue your blockchain learning journey."
        keywords="login, sign in, account, Cardano LMS, user login"
        url="/login"
        noindex={true}
        nofollow={true}
      />
      <Layout hideHeader={true} hideFooter={true}>
        <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
            <AuthLayout>
              <LoginForm onSubmit={handleLogin} disabled={submitting} />
            </AuthLayout>
            <BrandingSection />
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    </GuestGuard>
  );
};

export default Login;
