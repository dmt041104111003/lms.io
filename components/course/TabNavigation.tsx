import React from 'react';

export type TabType = 'all' | 'free' | 'pro';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-10 flex-wrap justify-center sm:justify-start border-b border-gray-200">
      <button
        onClick={() => onTabChange('all')}
        className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors border-b-2 ${
          activeTab === 'all'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onTabChange('free')}
        className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors border-b-2 ${
          activeTab === 'free'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        Free
      </button>
      <button
        onClick={() => onTabChange('pro')}
        className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors border-b-2 ${
          activeTab === 'pro'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        Pro
      </button>
    </div>
  );
};

export default TabNavigation;
