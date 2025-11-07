import React from 'react';
import Link from 'next/link';
import { Course } from './types';
import { formatTimeAgo } from '@/utils/dateUtils';

interface RankingsListProps {
  courses: Course[];
}

const RankingsList: React.FC<RankingsListProps> = ({ courses }) => {
  return (
    <div>
      <h2 className="text-2xl font-normal mb-5">Bảng xếp hạng hàng đầu</h2>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {courses.map((course, index) => {
          const courseUrl = `/courses/${course.id}`;
          return (
            <Link key={course.id} href={courseUrl} className="block">
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                {/* Ranking Number - Highlighted for top 3 */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 
                    ? 'bg-yellow-400 text-yellow-900' 
                    : index === 1 
                    ? 'bg-gray-300 text-gray-700' 
                    : index === 2 
                    ? 'bg-orange-300 text-orange-900' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                
                {/* Course Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-gray-900 mb-1 line-clamp-1">
                    {course.title}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {course.category && (
                      <div className="text-sm text-gray-600">
                        {course.category}
                      </div>
                    )}
                    {course.rating && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span className="font-medium">{course.rating.toFixed(1)}</span>
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                        {course.reviews && (
                          <span className="text-gray-500">({course.reviews.toLocaleString()})</span>
                        )}
                      </div>
                    )}
                    {(course as any).createdAt && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div className="text-sm text-gray-500">
                          {formatTimeAgo((course as any).createdAt)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="flex-shrink-0 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RankingsList;

