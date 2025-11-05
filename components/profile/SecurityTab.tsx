import React from 'react';
import { UserResponse } from '@/services/authService';
import ProfileInfoItem from './ProfileInfoItem';

interface SecurityTabProps {
  user: UserResponse;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ user }) => {
  const handleChangePassword = () => {
    // TODO: Implement change password
    console.log('Change password');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
        
        <div className="space-y-4">
          <ProfileInfoItem
            label="Password"
            value="••••••••"
            onEdit={handleChangePassword}
            editLabel="Change"
          />
          
          <ProfileInfoItem
            label="Account status"
            value={user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()}
          />
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;

