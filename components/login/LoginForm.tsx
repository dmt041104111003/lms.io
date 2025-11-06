import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiMail, FiLock } from 'react-icons/fi';
import FormInput from '@/components/ui/FormInput';
import FormButton from '@/components/ui/FormButton';
import SocialAuthButton from '@/components/ui/SocialAuthButton';
import Divider from '@/components/ui/Divider';
import CardanoWalletButton from '@/components/wallet/CardanoWalletButton';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string; rememberMe: boolean }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if email is admin (no @ required)
  const isAdmin = email.toLowerCase().trim() === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, rememberMe });
  };

  return (
    <>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-700 mb-1">
        Sign in
      </h2>
      <p className="text-xs text-gray-600 mb-3 sm:mb-4">
        Continue to your account
      </p>

      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
        <FormInput
          id="email"
          type={isAdmin ? "text" : "email"}
          label="Email"
          icon={FiMail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <FormInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          icon={FiLock}
          showPasswordToggle={true}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-xs sm:text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-xs sm:text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <div className="space-y-2 pt-1">
          <FormButton type="submit" variant="primary">
            Sign in
          </FormButton>
        </div>
      </form>

      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>

      <Divider className="mt-4 sm:mt-5" />

      <div className="mt-4 sm:mt-5 space-y-2">
        <SocialAuthButton provider="google" />
        <SocialAuthButton provider="github" />
        <CardanoWalletButton />
      </div>
    </>
  );
};

export default LoginForm;

