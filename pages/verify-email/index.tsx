import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/login/AuthLayout';
import BrandingSection from '@/components/login/BrandingSection';
import GuestGuard from '@/components/auth/GuestGuard';
import ToastContainer from '@/components/ui/ToastContainer';
import SEO from '@/components/ui/SEO';
import { useToast } from '@/hooks/useToast';
import authService from '@/services/authService';

const VerifyEmail: React.FC = () => {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const qEmail = (router.query.email as string) || '';
      if (qEmail) setEmail(qEmail);
    }
  }, [router.isReady, router.query]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      error('Please enter both email and verification code');
      return;
    }
    try {
      setLoading(true);
      await authService.verifyEmail({ email, code });
      success('Email verified successfully! Redirecting to login...');
      setTimeout(() => router.push('/login?signup=success'), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      error('Please enter your email to resend the code');
      return;
    }
    try {
      setResending(true);
      await authService.resendVerificationCode(email);
      success('Verification code resent. Please check your email.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resend code. Please try again.';
      error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <GuestGuard>
      <SEO
        title="Verify Email - lms.cardano2vn.io"
        description="Enter the verification code sent to your email to activate your account."
        keywords="verify email, verification code, account activation"
        url="/verify-email"
        noindex={true}
        nofollow={true}
      />
      <Layout hideHeader={true} hideFooter={true}>
        <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
            <AuthLayout>
              <div className="space-y-4 sm:space-y-5">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-700">Verify your email</h2>
                <p className="text-xs text-gray-600">Enter the verification code sent to your email.</p>

                <form onSubmit={handleVerify} className="space-y-3">
                  <div>
                    <label htmlFor="email" className="block text-xs text-gray-700 mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="code" className="block text-xs text-gray-700 mb-1">Verification code</label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter the 6-digit code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      className={`w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify email'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      className={`w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm transition-colors ${resending ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={resending}
                    >
                      {resending ? 'Resending...' : 'Resend code'}
                    </button>
                  </div>
                </form>
              </div>
            </AuthLayout>
            <BrandingSection />
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    </GuestGuard>
  );
};

export default VerifyEmail;
