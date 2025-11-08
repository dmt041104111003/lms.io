import React from 'react';
import { UserResponse } from '@/services/authService';
import ProfileInfoItem from './ProfileInfoItem';

interface PersonalInfoTabProps {
  user: UserResponse;
  onRefresh?: () => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ user, onRefresh }) => {
  const fullName = (user.fullName || '').trim() || 'Not set';
  const methodName = (user.loginMethod && (user.loginMethod as any).name) || '';

  let idLabel = 'Email';
  let idValue = '';
  if (methodName === 'GITHUB') {
    idLabel = 'GitHub';
    idValue = (user.github || '').trim();
  } else if (methodName === 'WALLET') {
    idLabel = 'Wallet address';
    idValue = (user.walletAddress || '').trim();
  } else {
    idLabel = 'Email';
    idValue = (user.email || '').trim();
  }
  if (!idValue) idValue = 'Not set';

  const handleEdit = (field: string) => {
    // TODO: Implement edit functionality
    console.log('Edit', field);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personal information</h2>
        
        <div className="space-y-4">
          <ProfileInfoItem
            label="Name"
            value={fullName}
            onEdit={() => handleEdit('name')}
          />
          
          <ProfileInfoItem
            label={idLabel}
            value={idValue}
          />
          
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;

