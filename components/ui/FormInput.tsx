import React from 'react';
import { IconType } from 'react-icons';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  error?: string;
  hint?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  icon: Icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false,
  error,
  hint,
  className = '',
  ...props
}) => {
  return (
    <div>
      <label htmlFor={props.id} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        )}
        <input
          {...props}
          className={`w-full ${Icon && iconPosition === 'left' ? 'pl-9' : 'pl-3'} ${showPasswordToggle ? 'pr-10' : 'pr-3'} py-2 text-sm border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        )}
      </div>
      {hint && !error && (
        <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-0.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormInput;

