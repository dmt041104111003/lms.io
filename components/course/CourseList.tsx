import React from 'react';
import Link from 'next/link';
import { Course } from './types';
import { formatTimeAgo } from '@/utils/dateUtils';
import { FiUsers } from 'react-icons/fi';
import { Crown, Star } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  totalResults?: number;
  searchQuery?: string;
}

const CourseList: React.FC<CourseListProps> = ({ courses, totalResults, searchQuery }) => {
  const sortedCourses = [...courses].sort((a, b) => {
    const da = (a as any).createdAt || '';
    const db = (b as any).createdAt || '';
    return db.localeCompare(da);
  });
  const freeCourses = sortedCourses.filter((course) => !course.price || course.price.toLowerCase() === 'free');
  const proCourses = sortedCourses.filter((course) => course.price && course.price.toLowerCase() !== 'free');
  const formatMoney = (amount: number, currency?: string) => {
    try {
      const cur = currency?.toUpperCase();
      if (cur === 'VND') {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
      }
      if (cur && cur !== 'USD') {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur as any }).format(amount);
      }
      return `$${(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2))}`;
    } catch {
      return `$${(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2))}`;
    }
  };
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      {freeCourses.length === 0 && proCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-2">No courses found</p>
          <p className="text-sm text-gray-500">Try different keywords or browse all courses</p>
        </div>
      ) : (
        <div className="space-y-10">
          {proCourses.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Khóa học Pro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {proCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer block"
                  >
                    <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100">
                      {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <img src="/images/common/loading.png" alt="Loading" className="w-16 h-16 object-contain opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 z-10 rounded-lg bg-gray-700 p-1">
                        <Crown className="w-4 h-4 text-yellow-300" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 text-md">{course.title}</h4>
             
                      <div className="text-sm flex items-baseline gap-2">
                        {(() => {
                          const currency = course.currency;
                          const original = Number((course as any).originalPrice || 0);
                          const discount = Number((course as any).discountPercent || 0);
                          const hasDiscount = original > 0 && discount > 0;
                          const final = hasDiscount ? +(original * (1 - discount / 100)).toFixed(2) : original;
                          return (
                            <>
                            {hasDiscount && (
                                <span className="text-xs text-gray-500 line-through">{formatMoney(original, currency)}</span>
                              )}
                              <span className="font-semibold text-blue-800">{formatMoney(final, currency)}</span>
                              
                            </>
                          );
                        })()}
                        {typeof (course as any).rating === 'number' && (
                          <span className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="font-medium">{Number((course as any).rating).toFixed(1)}</span>
                          </span>
                        )}
                         
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 min-w-0">
                          {course.educatorAvatar ? (
                            <img src={course.educatorAvatar} alt={course.instructor || 'Educator'} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-700">
                              {getInitials(course.instructor)}
                            </div>
                          )}
                          {course.instructor && (
                            <p className="text-xs text-gray-600 truncate">{course.instructor}</p>
                          )}
                        </div>
                        {typeof course.enrollmentCount === 'number' && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                            <FiUsers className="text-gray-500" />
                            <span>{course.enrollmentCount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {typeof totalResults === 'number' && (freeCourses.length + proCourses.length) < totalResults && (
                <div className="mt-3 text-right">
                  <Link
                    href={`/courses${searchQuery ? `?keyword=${encodeURIComponent(searchQuery)}` : ''}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Xem thêm
                  </Link>
                </div>
              )}
            </section>
          )}
          {freeCourses.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Khóa học miễn phí</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {freeCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer block"
                  >
                    <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100">
                      {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <img src="/images/common/loading.png" alt="Loading" className="w-16 h-16 object-contain opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-2  text-md">{course.title}</h4>
                     
                    
                      <div className="text-sm flex items-center">
                        <span className="font-semibold text-blue-800">Free</span>
                        {typeof course.rating === 'number' && (
                          <span className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                            <span className="font-medium">{course.rating.toFixed(1)}</span>
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                            </svg>
                          </span>
                        )}
                      </div>
                       <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 min-w-0 ">
                          {course.educatorAvatar ? (
                            <img src={course.educatorAvatar} alt={course.instructor || 'Educator'} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-700">
                              {getInitials(course.instructor)}
                            </div>
                          )}
                          {course.instructor && (
                            <p className="text-xs text-gray-600 truncate">{course.instructor}</p>
                          )}
                        </div>
                        {typeof course.enrollmentCount === 'number' && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                            <FiUsers className="text-gray-500" />
                            <span>{course.enrollmentCount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {typeof totalResults === 'number' && (freeCourses.length + proCourses.length) < totalResults && (
                <div className="mt-3 text-right">
                  <Link
                    href={`/courses${searchQuery ? `?keyword=${encodeURIComponent(searchQuery)}` : ''}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Xem thêm
                  </Link>
                </div>
              )}
            </section>
          )}

          
        </div>
      )}
    </div>
  );
};

export default CourseList;
