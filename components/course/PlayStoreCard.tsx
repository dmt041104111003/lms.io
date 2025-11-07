import React from 'react';
import Link from 'next/link';
import { Course } from './types';
import { formatTimeAgo } from '@/utils/dateUtils';

interface PlayStoreCardProps {
  course: Course;
}

const PlayStoreCard: React.FC<PlayStoreCardProps> = ({ course }) => {
  const courseUrl = `/courses/${course.id}`;
  return (
    <Link href={courseUrl} className="block">
      <div className="relative cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl hover:z-10 rounded-xl overflow-hidden flex-shrink-0 w-[380px] bg-white border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] ring-2 ring-cyan-300 ring-inset">
        {/* Thumbnail - Like Play Store */}
        {course.image && (
          <div className="w-full h-48 rounded-t-xl overflow-hidden relative bg-gray-900">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <div className="text-base font-medium text-gray-900 mb-1 line-clamp-1">
            {course.title}
          </div>

          {/* Meta - Category */}
          {course.category && (
            <div className="text-sm text-gray-600 mb-1">
              {course.category}
              {course.duration && ` • ${course.duration}`}
            </div>
          )}

          {/* Rating and Created At */}
          <div className="flex items-center gap-2 flex-wrap">
            {course.rating && (
              <div className="text-sm text-gray-600">
                {course.rating.toFixed(1)} ⭐
                {course.reviews && (
                  <span className="ml-1">({course.reviews.toLocaleString()})</span>
                )}
              </div>
            )}
            {(course as any).createdAt && (
              <>
                {course.rating && <span className="text-gray-400">•</span>}
                <div className="text-sm text-gray-500">
                  {formatTimeAgo((course as any).createdAt)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlayStoreCard;

