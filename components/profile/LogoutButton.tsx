import React from 'react';
import Button from '@/components/ui/Button';

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <div className="p-6 border-t border-gray-200">
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
      >
        Sign out
      </Button>
    </div>
  );
};

export default LogoutButton;

