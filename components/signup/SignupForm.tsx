import React, { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import FormInput from '@/components/ui/FormInput';
import FormButton from '@/components/ui/FormButton';

interface SignupFormProps {
  onSubmit: (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      setErrors(newErrors);
      return;
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      setErrors(newErrors);
      return;
    }

    onSubmit({ ...formData, agreeToTerms });
  };

  return (
    <>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-700 mb-1">
        Create your account
      </h2>
      <p className="text-xs text-gray-600 mb-3 sm:mb-4">
        Get started with your learning journey
      </p>

      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
        <FormInput
          id="fullName"
          name="fullName"
          type="text"
          label="Full Name"
          icon={FiUser}
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={FiMail}
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <FormInput
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          icon={FiLock}
          showPasswordToggle={true}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          required
          minLength={6}
          error={errors.password}
          hint="Use at least 6 characters"
        />

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          icon={FiLock}
          showPasswordToggle={true}
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
          error={errors.confirmPassword}
        />

        <div className="flex items-start">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-0.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
            required
          />
          <label htmlFor="agreeToTerms" className="ml-2 text-xs text-gray-600">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <div className="space-y-2 pt-1">
          <FormButton type="submit" variant="primary">
            Create account
          </FormButton>
        </div>
      </form>

      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>


    </>
  );
};

export default SignupForm;

