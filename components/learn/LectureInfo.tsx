import React from 'react';

interface LectureInfoProps {
  title: string;
  description?: string;
  duration?: number;
  previewFree?: boolean;
}

const LectureInfo: React.FC<LectureInfoProps> = ({ title, description, duration, previewFree }) => {
  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
      )}
      <div className="flex items-center gap-4">
        {duration && (
          <p className="text-xs text-gray-500">Duration: {duration} min</p>
        )}
        {previewFree && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            Free Preview
          </span>
        )}
      </div>
    </div>
  );
};

export default LectureInfo;

