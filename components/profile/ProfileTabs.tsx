import React from 'react';

export type ProfileTabType = 'personal' | 'security' | 'preferences' | 'payments' | 'certificates';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-6 border-b border-gray-200 overflow-x-auto">
      <div className="flex gap-1 min-w-max px-0.5 sm:px-0" role="tablist" aria-label="Profile tabs">
        <button
          onClick={() => onTabChange('personal')}
          role="tab"
          aria-selected={activeTab === 'personal'}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
            activeTab === 'personal'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Personal info
        </button>
        <button
          onClick={() => onTabChange('security')}
          role="tab"
          aria-selected={activeTab === 'security'}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
            activeTab === 'security'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => onTabChange('preferences')}
          role="tab"
          aria-selected={activeTab === 'preferences'}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
            activeTab === 'preferences'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => onTabChange('payments')}
          role="tab"
          aria-selected={activeTab === 'payments'}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
            activeTab === 'payments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Payment history
        </button>
        <button
          onClick={() => onTabChange('certificates')}
          role="tab"
          aria-selected={activeTab === 'certificates'}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
            activeTab === 'certificates'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          My certificate
        </button>
      </div>
    </div>
  );
};

export default ProfileTabs;

