import React from 'react';

interface ProfileInfoItemProps {
  label: string;
  value: string;
  onEdit?: () => void;
  editLabel?: string;
}

const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({
  label,
  value,
  onEdit,
  editLabel = 'Edit',
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className="text-base text-gray-900">{value}</div>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          {editLabel}
        </button>
      )}
    </div>
  );
};

export default ProfileInfoItem;

