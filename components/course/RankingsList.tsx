import React from 'react';
import Link from 'next/link';
import { Course } from './types';
import { formatTimeAgo } from '@/utils/dateUtils';
import { Award } from 'lucide-react';

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
                
                {(() => {
                  if (index > 2) return null;
                  const color = index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-500' : 'text-amber-700';
                  const bg = index === 0 ? 'bg-yellow-500/30' : index === 1 ? 'bg-gray-400/30' : 'bg-amber-600/30';
                  return (
                    <div className={`flex-shrink-0 rounded-full ${bg} p-1.5 border border-white/60`}> 
                      <Award className={`w-6 h-6 ${color}`} />
                    </div>
                  );
                })()}
                
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
                        
                        {course.reviews && (
                          <span className="text-gray-500">({course.reviews.toLocaleString()})</span>
                        )}
                      </div>
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

