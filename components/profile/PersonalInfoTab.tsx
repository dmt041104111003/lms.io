import React from 'react';
import { UserResponse } from '@/services/authService';
import ProfileInfoItem from './ProfileInfoItem';

interface PersonalInfoTabProps {
  user: UserResponse;
  onRefresh?: () => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ user, onRefresh }) => {
  const fullName = (user.fullName || '').trim() || 'Not set';

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
            label="Email"
            value={user.email}
            onEdit={() => handleEdit('email')}
          />
          
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;

