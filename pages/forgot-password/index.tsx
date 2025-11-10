import React, { useState } from 'react';
import { FiMail, FiLock, FiHash } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/login/AuthLayout';
import BrandingSection from '@/components/login/BrandingSection';
import SEO from '@/components/ui/SEO';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';
import authService from '@/services/authService';
import FormInput from '@/components/ui/FormInput';
import FormButton from '@/components/ui/FormButton';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AvatarSpinnerOverlay from '@/components/ui/AvatarSpinnerOverlay';

const ForgotPasswordPage: React.FC = () => {
  const { toasts, removeToast, success, error } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      success('Verification code sent to your email');
      setStep('reset');
    } catch (e: any) {
      error(e?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({ email: email.trim(), code: code.trim(), newPassword });
      success('Password reset successfully. You can login now.');
      setTimeout(() => router.push('/login?reset=success'), 1200);
    } catch (e: any) {
      error(e?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideHeader={true} hideFooter={true}>
      <SEO title="Forgot password - lms.cardano2vn.io" description="Reset your password" url="/forgot-password" noindex={true} nofollow={true} />
      <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
          <AuthLayout>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-700 mb-1">Forgot password</h2>
            <p className="text-xs text-gray-600 mb-3 sm:mb-4">Reset your account password</p>

            {step === 'request' ? (
              <form onSubmit={handleRequest} className="space-y-2 sm:space-y-3">
                <FormInput
                  id="email"
                  type="email"
                  label="Email"
                  icon={FiMail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />

                <div className="space-y-2 pt-1">
                  <FormButton type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Sending…' : 'Send code'}
                  </FormButton>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  <Link href="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-2 sm:space-y-3">
                <FormInput
                  id="email-disabled"
                  type="email"
                  label="Email"
                  icon={FiMail}
                  value={email}
                  onChange={() => {}}
                  disabled
                />
                <FormInput
                  id="code"
                  type="text"
                  label="Verification code"
                  icon={FiHash}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  required
                />
                <FormInput
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  label="New password"
                  icon={FiLock}
                  showPasswordToggle={true}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <FormInput
                  id="confirmPassword"
                  type={showPassword2 ? 'text' : 'password'}
                  label="Confirm new password"
                  icon={FiLock}
                  showPasswordToggle={true}
                  showPassword={showPassword2}
                  onTogglePassword={() => setShowPassword2(!showPassword2)}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />

                <div className="space-y-2 pt-1">
                  <FormButton type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Resetting…' : 'Reset password'}
                  </FormButton>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  <button type="button" className="hover:underline" onClick={() => setStep('request')}>
                    Change email
                  </button>
                </div>
              </form>
            )}
          </AuthLayout>
          <BrandingSection />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {loading && <AvatarSpinnerOverlay visible />}
    </Layout>
  );
};

export default ForgotPasswordPage;
