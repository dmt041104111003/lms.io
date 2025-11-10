import React from 'react';

const CertificatesTab: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">My certificate</h2>
        <div className="space-y-4">
          <div className="py-3 text-sm text-gray-600">
            You don't have any certificates yet.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesTab;
