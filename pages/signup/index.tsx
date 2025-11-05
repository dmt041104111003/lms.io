import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/login/AuthLayout';
import BrandingSection from '@/components/login/BrandingSection';
import SignupForm from '@/components/signup/SignupForm';
import GuestGuard from '@/components/auth/GuestGuard';
import authService from '@/services/authService';

const Signup: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => {
    setError(null);
    setLoading(true);

    try {
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const emailParts = data.email.split('@');
      let username = emailParts[0] || `user_${Date.now()}`;
      
      if (username.length < 4) {
        const timestamp = Date.now().toString().slice(-3); 
        username = username + timestamp;
      }

      await authService.signup({
        username: username,
        password: data.password,
        firstName: firstName,
        lastName: lastName,
        email: data.email,
      });

      router.push('/login?signup=success');
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Xử lý các error message từ backend
        if (errorMessage.includes('USER_EXISTED') || errorMessage.includes('User existed')) {
          errorMessage = 'This username or email already exists. Please try a different one.';
        } else if (errorMessage.includes('USERNAME_INVALID')) {
          errorMessage = 'Username must be at least 4 characters.';
        } else if (errorMessage.includes('INVALID_PASSWORD')) {
          errorMessage = 'Password must be at least 6 characters.';
        } else if (errorMessage.includes('EMAIL_ALREADY_USED')) {
          errorMessage = 'This email is already registered. Please use a different email.';
        }
      }
      
      setError(errorMessage);
      console.error('Signup error:', err);
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
              <SignupForm onSubmit={handleSignup} />
            </AuthLayout>
            <BrandingSection />
          </div>
        </div>
      </Layout>
    </GuestGuard>
  );
};

export default Signup;

