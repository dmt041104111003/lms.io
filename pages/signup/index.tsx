import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/login/AuthLayout';
import BrandingSection from '@/components/login/BrandingSection';
import SignupForm from '@/components/signup/SignupForm';
import GuestGuard from '@/components/auth/GuestGuard';
import ToastContainer from '@/components/ui/ToastContainer';
import SEO from '@/components/ui/SEO';
import { useToast } from '@/hooks/useToast';
import authService from '@/services/authService';

const Signup: React.FC = () => {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();

  const handleSignup = async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => {
    try {
      await authService.signup({
        fullName: data.fullName.trim(),
        email: data.email,
        password: data.password,
      });

      success('Account created successfully! Please verify your email.');
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }, 1200);
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
      
      error(errorMessage);
      console.error('Signup error:', err);
    }
  };

  return (
    <GuestGuard>
      <SEO
        title="Sign Up - lms.cardano2vn.io"
        description="Create your free Cardano2VN LMS account and start learning blockchain, Cardano, and cryptocurrency. Join thousands of students today."
        keywords="signup, register, create account, Cardano LMS, free account"
        url="/signup"
        noindex={true}
        nofollow={true}
      />
      <Layout hideHeader={true} hideFooter={true}>
        <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
            <AuthLayout>
              <SignupForm onSubmit={handleSignup} />
            </AuthLayout>
            <BrandingSection />
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    </GuestGuard>
  );
};

export default Signup;

