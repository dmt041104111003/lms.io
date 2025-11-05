import React from 'react';

export type ProfileTabType = 'personal' | 'security' | 'preferences';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200">
      <button
        onClick={() => onTabChange('personal')}
        className={`px-4 py-2 text-sm transition-colors border-b-2 ${
          activeTab === 'personal'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        Personal info
      </button>
      <button
        onClick={() => onTabChange('security')}
        className={`px-4 py-2 text-sm transition-colors border-b-2 ${
          activeTab === 'security'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        Security
      </button>
      <button
        onClick={() => onTabChange('preferences')}
        className={`px-4 py-2 text-sm transition-colors border-b-2 ${
          activeTab === 'preferences'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        Preferences
      </button>
    </div>
  );
};

export default ProfileTabs;

