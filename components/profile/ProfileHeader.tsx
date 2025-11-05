import React from 'react';
import { UserResponse } from '@/services/authService';

interface ProfileHeaderProps {
  user: UserResponse;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.username[0]?.toUpperCase() || 'U';

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-medium">
                {initials}
              </div>
            )}
          </div>
          
          {/* Name and Email */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-normal text-gray-900 truncate">
              {fullName}
            </h1>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

