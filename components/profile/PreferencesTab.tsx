import React from 'react';

const PreferencesTab: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
        
        <div className="space-y-4">
          <div className="py-3 text-sm text-gray-600">
            No preferences available yet.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesTab;

