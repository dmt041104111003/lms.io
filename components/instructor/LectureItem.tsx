import React from 'react';
import { LectureRequest } from '@/services/instructorService';
import Button from '@/components/ui/Button';
import VideoPreview from './VideoPreview';

interface LectureItemProps {
  lecture: LectureRequest;
  lectureIndex: number;
  onChange: (lecture: LectureRequest) => void;
  onRemove: () => void;
}

const LectureItem: React.FC<LectureItemProps> = ({ lecture, lectureIndex, onChange, onRemove }) => {
  return (
    <div className="mb-3 p-3 bg-gray-50 rounded">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={lecture.title || ''}
          onChange={(e) => {
            onChange({ ...lecture, title: e.target.value });
          }}
          placeholder="Lecture Title"
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <input
            type="url"
            value={lecture.videoUrl || ''}
            onChange={(e) => {
              onChange({ ...lecture, videoUrl: e.target.value });
            }}
            placeholder="Video URL"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600"
          >
            Remove
          </Button>
        </div>
      </div>
      <textarea
        value={lecture.description || ''}
        onChange={(e) => {
          onChange({ ...lecture, description: e.target.value });
        }}
        placeholder="Lecture Description (optional)"
        rows={2}
        className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {lecture.videoUrl && (
        <div className="mt-2">
          <VideoPreview videoUrl={lecture.videoUrl} />
        </div>
      )}
    </div>
  );
};

export default LectureItem;

